import "server-only"

import { randomUUID } from "crypto"
import { createServiceRoleClient } from "@/lib/supabase/service"
import { describeOffer, type OfferType } from "@/lib/offers-shared"

/**
 * Offers are automatic perks, not codes.
 *
 * An admin activates an offer and picks which plans it covers; from then on
 * every matching order gets it, with nothing for the customer to type. Offers
 * never change the price — that is what coupons are for.
 *
 *   bogo        a second identical account is issued at fulfilment
 *   free_retry  one free replacement account if the challenge is failed
 *   free_addon  the Weekend Holding add-on is included at no cost
 *
 * `planIds` empty means "every plan"; otherwise only those challenge_plans.id.
 * `code` is an internal reference for reporting — customers never see or type it.
 */
export {
	OFFER_TYPES,
	OFFER_TYPE_META,
	OFFER_TYPE_ORDER,
	describeOffer,
	shortOfferLabel,
	validateOfferPayload,
} from "@/lib/offers-shared"
export type { OfferType, OfferPayload } from "@/lib/offers-shared"

export interface OfferRow {
	id: string
	code: string
	name: string
	type: OfferType
	planIds: string[]
	status: string
	startsAt: string | null
	expiresAt: string | null
	maxRedemptions: number | null
	perUserLimit: number | null
	timesRedeemed: number
	description: string | null
	/** When true, the code is advertised in the checkout sidebar for eligible plans. */
	showAtCheckout: boolean
	createdAt: string | null
	updatedAt: string | null
}

const COLUMNS =
	'id,code,name,type,"planIds",status,"startsAt","expiresAt","maxRedemptions","perUserLimit","timesRedeemed",description,"createdAt","updatedAt"'

const normalizeCode = (code: string) => code.trim().toUpperCase()

function hydrate(row: Record<string, unknown>): OfferRow {
	return {
		...(row as unknown as OfferRow),
		planIds: Array.isArray(row.planIds) ? (row.planIds as string[]) : [],
		timesRedeemed: Number(row.timesRedeemed ?? 0),
		maxRedemptions: row.maxRedemptions == null ? null : Number(row.maxRedemptions),
		perUserLimit: row.perUserLimit == null ? null : Number(row.perUserLimit),
	}
}

// ---------------------------------------------------------------------------
// CRUD
// ---------------------------------------------------------------------------

export async function listOffers(): Promise<OfferRow[]> {
	const supabase = createServiceRoleClient()
	const { data, error } = await supabase.from("offers").select(COLUMNS).order("createdAt", { ascending: false })
	if (error) throw error
	return ((data as Record<string, unknown>[]) ?? []).map(hydrate)
}

export async function findOfferById(id: string): Promise<OfferRow | null> {
	const supabase = createServiceRoleClient()
	const { data, error } = await supabase.from("offers").select(COLUMNS).eq("id", id).maybeSingle()
	if (error) throw error
	return data ? hydrate(data as Record<string, unknown>) : null
}

export async function findOfferByCode(code: string): Promise<OfferRow | null> {
	const supabase = createServiceRoleClient()
	const { data, error } = await supabase.from("offers").select(COLUMNS).eq("code", normalizeCode(code)).maybeSingle()
	if (error) throw error
	return data ? hydrate(data as Record<string, unknown>) : null
}

export interface CreateOfferInput {
	/** Internal reference for reporting; customers never type it. */
	code?: string | null
	name: string
	type: OfferType
	planIds?: string[]
	status?: string
	startsAt?: string | null
	expiresAt?: string | null
	maxRedemptions?: number | null
	perUserLimit?: number | null
	description?: string | null
}

export async function createOffer(input: CreateOfferInput): Promise<OfferRow> {
	const supabase = createServiceRoleClient()
	const { data, error } = await supabase
		.from("offers")
		.insert({
			id: randomUUID(),
			code: input.code ? normalizeCode(input.code) : null,
			name: input.name.trim(),
			type: input.type,
			planIds: input.planIds ?? [],
			status: input.status ?? "active",
			startsAt: input.startsAt ?? null,
			expiresAt: input.expiresAt ?? null,
			maxRedemptions: input.maxRedemptions ?? null,
			perUserLimit: input.perUserLimit ?? null,
			description: input.description ?? null,
		})
		.select(COLUMNS)
		.single()
	if (error) throw error
	return hydrate(data as Record<string, unknown>)
}

export type UpdateOfferPatch = Partial<CreateOfferInput>

export async function updateOffer(id: string, patch: UpdateOfferPatch): Promise<OfferRow> {
	const supabase = createServiceRoleClient()
	const row: Record<string, unknown> = { updatedAt: new Date().toISOString() }
	if (patch.code !== undefined) row.code = patch.code ? normalizeCode(patch.code) : null
	if (patch.name !== undefined) row.name = patch.name.trim()
	if (patch.type !== undefined) row.type = patch.type
	if (patch.planIds !== undefined) row.planIds = patch.planIds
	if (patch.status !== undefined) row.status = patch.status
	if (patch.startsAt !== undefined) row.startsAt = patch.startsAt
	if (patch.expiresAt !== undefined) row.expiresAt = patch.expiresAt
	if (patch.maxRedemptions !== undefined) row.maxRedemptions = patch.maxRedemptions
	if (patch.perUserLimit !== undefined) row.perUserLimit = patch.perUserLimit
	if (patch.description !== undefined) row.description = patch.description

	const { data, error } = await supabase.from("offers").update(row).eq("id", id).select(COLUMNS).single()
	if (error) throw error
	return hydrate(data as Record<string, unknown>)
}

export async function deleteOffer(id: string): Promise<void> {
	const supabase = createServiceRoleClient()
	const { error } = await supabase.from("offers").delete().eq("id", id)
	if (error) throw error
}

// ---------------------------------------------------------------------------
// Automatic application
// ---------------------------------------------------------------------------

/**
 * Every active offer that covers this plan right now.
 *
 * Skips anything switched off, outside its date window, or already at its
 * global redemption cap. When `userId` is given, offers the customer has
 * already had their per-customer fill of are skipped too.
 *
 * More than one can apply at once — if an admin has BOGO and Free Retry both
 * live for a plan, an order of that plan gets both. That is the configured
 * intent, so it is not deduplicated here.
 */
export async function listAutoOffersForPlan(planId: string, userId?: string | null): Promise<OfferRow[]> {
	const supabase = createServiceRoleClient()
	const { data, error } = await supabase.from("offers").select(COLUMNS).eq("status", "active")
	if (error) throw error

	const now = Date.now()
	const candidates = ((data as Record<string, unknown>[]) ?? []).map(hydrate).filter((o) => {
		if (o.startsAt && new Date(o.startsAt).getTime() > now) return false
		if (o.expiresAt && new Date(o.expiresAt).getTime() < now) return false
		if (o.maxRedemptions != null && o.timesRedeemed >= o.maxRedemptions) return false
		// Empty planIds = every plan.
		return o.planIds.length === 0 || o.planIds.includes(planId)
	})

	if (!userId) return candidates

	const eligible: OfferRow[] = []
	for (const offer of candidates) {
		if (offer.perUserLimit != null) {
			const used = await countRedemptionsForUser(offer.id, userId)
			if (used >= offer.perUserLimit) continue
		}
		eligible.push(offer)
	}
	return eligible
}

/** One-line summary of an offer, for the checkout "included" list. */
export function summarizeOffer(offer: OfferRow): string {
	return describeOffer(offer)
}

// ---------------------------------------------------------------------------
// Redemptions
// ---------------------------------------------------------------------------

export interface OfferRedemptionRow {
	id: string
	offerId: string | null
	/** The offer's display name, copied at redemption time so it survives edits. */
	offerCode: string
	offerType: OfferType
	userId: string | null
	orderId: string | null
	status: "pending" | "fulfilled" | "consumed"
	notes: string | null
	createdAt: string | null
	fulfilledAt: string | null
}

const REDEMPTION_COLUMNS =
	'id,"offerId","offerCode","offerType","userId","orderId",status,notes,"createdAt","fulfilledAt"'

export async function countRedemptionsForUser(offerId: string, userId: string): Promise<number> {
	const supabase = createServiceRoleClient()
	const { count, error } = await supabase
		.from("offer_redemptions")
		.select("id", { count: "exact", head: true })
		.eq("offerId", offerId)
		.eq("userId", userId)
	if (error) throw error
	return count ?? 0
}

export async function recordRedemption(input: {
	offer: OfferRow
	userId: string
	orderId: string
}): Promise<OfferRedemptionRow> {
	const supabase = createServiceRoleClient()
	const { data, error } = await supabase
		.from("offer_redemptions")
		.insert({
			id: randomUUID(),
			offerId: input.offer.id,
			offerCode: input.offer.name,
			offerType: input.offer.type,
			userId: input.userId,
			orderId: input.orderId,
			status: "pending",
		})
		.select(REDEMPTION_COLUMNS)
		.single()
	if (error) throw error

	// Non-atomic, but redemption caps are a soft business limit, not a
	// correctness boundary — a race can at worst let one extra through.
	await supabase
		.from("offers")
		.update({ timesRedeemed: input.offer.timesRedeemed + 1, updatedAt: new Date().toISOString() })
		.eq("id", input.offer.id)

	return data as OfferRedemptionRow
}

export async function listRedemptionsForOrder(orderId: string): Promise<OfferRedemptionRow[]> {
	const supabase = createServiceRoleClient()
	const { data, error } = await supabase.from("offer_redemptions").select(REDEMPTION_COLUMNS).eq("orderId", orderId)
	if (error) throw error
	return (data as OfferRedemptionRow[]) ?? []
}

/** Pending entitlements of a given type for one order — used by fulfilment. */
export async function findPendingRedemption(orderId: string, type: OfferType): Promise<OfferRedemptionRow | null> {
	const supabase = createServiceRoleClient()
	const { data, error } = await supabase
		.from("offer_redemptions")
		.select(REDEMPTION_COLUMNS)
		.eq("orderId", orderId)
		.eq("offerType", type)
		.eq("status", "pending")
		.limit(1)
		.maybeSingle()
	if (error) throw error
	return (data as OfferRedemptionRow | null) ?? null
}

/**
 * Atomically moves a redemption out of "pending". Returns false when another
 * worker already claimed it, so fulfilment never grants the same benefit twice.
 */
export async function claimRedemption(
	redemptionId: string,
	status: "fulfilled" | "consumed",
	notes?: string,
): Promise<boolean> {
	const supabase = createServiceRoleClient()
	const { data, error } = await supabase
		.from("offer_redemptions")
		.update({ status, notes: notes ?? null, fulfilledAt: new Date().toISOString() })
		.eq("id", redemptionId)
		.eq("status", "pending")
		.select("id")
	if (error) throw error
	return (data?.length ?? 0) > 0
}

export async function listRedemptions(): Promise<OfferRedemptionRow[]> {
	const supabase = createServiceRoleClient()
	const { data, error } = await supabase
		.from("offer_redemptions")
		.select(REDEMPTION_COLUMNS)
		.order("createdAt", { ascending: false })
	if (error) throw error
	return (data as OfferRedemptionRow[]) ?? []
}
