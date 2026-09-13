import "server-only"

import { findChallengePlanById } from "./challengePlans"
import { findAvailableInventory, assignInventory } from "./challengeInventory"
import { createAccountFromInventory } from "./tradingAccounts"
import { findOrderById, updateOrderStatus } from "./orders"
import { createNotification } from "./notifications"
import { recordReferralIfApplicable } from "./referrals"

/**
 * Runs after a payment gateway confirms payment. Tries to auto-assign an
 * available inventory account; if none is free, leaves the order in
 * "processing" for an admin to complete manually from /admin/orders
 * (matches how account delivery already worked before this migration).
 */
export async function fulfillOrder(orderId: string): Promise<void> {
  const order = await findOrderById(orderId)
  if (!order || !order.planId || !order.userId) return
  if (order.status === "active" || order.status === "passed" || order.status === "failed") return // already fulfilled

  await recordReferralIfApplicable(order)

  const plan = await findChallengePlanById(order.planId)
  if (!plan) {
    await updateOrderStatus(orderId, "processing")
    return
  }

  const candidate = plan.platform ? await findAvailableInventory(plan.platform, plan.size) : null
  // Claim atomically — a concurrent webhook/admin may have taken this row between find and assign.
  const inventory = candidate && (await assignInventory(candidate.id, orderId)) ? candidate : null

  if (!inventory) {
    await updateOrderStatus(orderId, "processing")
    await createNotification({
      userId: order.userId,
      title: "Payment received",
      message: "Your payment was received. Your account credentials are being prepared and will arrive shortly.",
      type: "order",
    })
    return
  }

  await createAccountFromInventory({
    userId: order.userId,
    orderId,
    inventory,
    profitTarget: plan.profitTargetP1,
    phase: "phase1",
  })
  await updateOrderStatus(orderId, "active")
  await createNotification({
    userId: order.userId,
    title: "Account ready",
    message: `Your ${plan.name} account is ready. Check your dashboard for login credentials.`,
    type: "order",
  })
}
