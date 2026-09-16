import "server-only"

import { findChallengePlanById } from "./challengePlans"
import { findAvailableInventory, assignInventory } from "./challengeInventory"
import { createAccountFromInventory } from "./tradingAccounts"
import { createOrder, findOrderById, updateOrderStatus, type OrderRow } from "./orders"
import { createNotification } from "./notifications"
import { claimRedemption, findPendingRedemption } from "./offers"
import { createServiceRoleClient } from "@/lib/supabase/service"

/**
 * Grants the benefits attached to an order's offer.
 *
 * Every grant is guarded by `claimRedemption`, which only succeeds for a
 * redemption still in "pending" — so a retried webhook or a second admin click
 * can never issue the same free account twice.
 */

/** Marks the Weekend Holding add-on as included on the order. */
async function setWeekendHoldingAddon(orderId: string): Promise<void> {
	const supabase = createServiceRoleClient()
	const { error } = await supabase
		.from("orders")
		.update({ weekendHoldingAddon: true, updatedAt: new Date().toISOString() })
		.eq("id", orderId)
	if (error) throw error
}

/**
 * Runs right after the paid-for account has been delivered.
 *
 * - free_addon: flips the Weekend Holding flag on the order.
 * - bogo: issues a second identical account against the same order.
 * - free_retry: left pending on purpose — it is spent later, if and only if the
 *   challenge is failed (see `grantFreeRetryOnFailure`).
 */
export async function applyOfferBenefitsOnDelivery(orderId: string): Promise<void> {
	const order = await findOrderById(orderId)
	if (!order || !order.userId || !order.planId) return

	const addon = await findPendingRedemption(orderId, "free_addon")
	if (addon && (await claimRedemption(addon.id, "fulfilled", "Weekend Holding add-on included by offer"))) {
		await setWeekendHoldingAddon(orderId)
		await createNotification({
			userId: order.userId,
			title: "Weekend Holding included",
			message: `Your order includes the Weekend Holding add-on at no extra cost (${addon.offerCode}).`,
			type: "order",
		})
	}

	const bogo = await findPendingRedemption(orderId, "bogo")
	if (bogo) await grantBogoAccount(order, bogo.id)
}

/** Issues the second BOGO account from inventory, against the same order. */
async function grantBogoAccount(order: OrderRow, redemptionId: string): Promise<void> {
	if (!order.planId || !order.userId) return
	const plan = await findChallengePlanById(order.planId)
	if (!plan?.platform) return

	const candidate = await findAvailableInventory(plan.platform, plan.size)
	// Claim atomically — another worker may have taken this row.
	const inventory = candidate && (await assignInventory(candidate.id, order.id)) ? candidate : null

	if (!inventory) {
		// Leave the redemption pending so an admin can deliver it by hand from
		// /admin/orders once stock is back, rather than silently dropping it.
		await createNotification({
			userId: order.userId,
			title: "Second account on the way",
			message: "Your buy-one-get-one account is being prepared and will appear here shortly.",
			type: "order",
		})
		return
	}

	if (!(await claimRedemption(redemptionId, "fulfilled", `BOGO account ${inventory.login} issued`))) {
		// Someone else claimed it between our read and here — give the stock back.
		const supabase = createServiceRoleClient()
		await supabase.from("challenge_inventory").update({ status: "available", orderId: null }).eq("id", inventory.id)
		return
	}

	await createAccountFromInventory({
		userId: order.userId,
		orderId: order.id,
		inventory,
		profitTarget: plan.profitTargetP1,
		phase: "phase1",
	})

	await createNotification({
		userId: order.userId,
		title: "Second account ready",
		message: `Your buy-one-get-one ${plan.name} account is ready — check your dashboard for the credentials.`,
		type: "order",
	})
}

/**
 * Spends a free_retry entitlement when a challenge is failed.
 *
 * Creates a replacement order at $0 linked back to the failed one, then
 * delivers an account for it straight away when stock allows. Returns the new
 * order id, or null when there was no entitlement to spend.
 */
export async function grantFreeRetryOnFailure(failedOrderId: string): Promise<string | null> {
	const order = await findOrderById(failedOrderId)
	if (!order || !order.userId || !order.planId) return null

	const retry = await findPendingRedemption(failedOrderId, "free_retry")
	if (!retry) return null

	const plan = await findChallengePlanById(order.planId)
	if (!plan) return null

	if (!(await claimRedemption(retry.id, "consumed", `Free retry spent on failed order ${failedOrderId}`))) {
		return null
	}

	const retryOrder = await createOrder({
		userId: order.userId,
		planId: order.planId,
		amountPaid: 0,
		paymentMethod: order.paymentMethod,
		offerCode: retry.offerCode,
		retryOfOrderId: failedOrderId,
		weekendHoldingAddon: order.weekendHoldingAddon,
		status: "processing",
	})

	const candidate = plan.platform ? await findAvailableInventory(plan.platform, plan.size) : null
	const inventory = candidate && (await assignInventory(candidate.id, retryOrder.id)) ? candidate : null

	if (inventory) {
		await createAccountFromInventory({
			userId: order.userId,
			orderId: retryOrder.id,
			inventory,
			profitTarget: plan.profitTargetP1,
			phase: "phase1",
		})
		await updateOrderStatus(retryOrder.id, "active")
		await createNotification({
			userId: order.userId,
			title: "Free retry account ready",
			message: `Your order included a free retry (${retry.offerCode}). A fresh ${plan.name} account is ready in your dashboard.`,
			type: "order",
		})
	} else {
		// No stock: the order sits in "processing" for an admin to complete,
		// exactly like a paid order that arrives when inventory is empty.
		await createNotification({
			userId: order.userId,
			title: "Free retry on the way",
			message: `Your order included a free retry (${retry.offerCode}). Your replacement account is being prepared.`,
			type: "order",
		})
	}

	return retryOrder.id
}
