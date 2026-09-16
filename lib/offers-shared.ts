/**
 * Offer types and their pure helpers.
 *
 * The two promo concepts are deliberately separate:
 *
 *   Coupons  change the PRICE and require a code typed at checkout.
 *   Offers   grant an EXTRA and apply AUTOMATICALLY to every matching order.
 *
 * So an offer never touches the price — there is no discount offer type. If you
 * want money off, create a coupon.
 *
 * Deliberately free of `server-only` and of any database import so the checkout
 * UI, the admin UI and the server services share one definition.
 */

export const OFFER_TYPES = ["bogo", "free_retry", "free_addon"] as const

export type OfferType = (typeof OFFER_TYPES)[number]

/** Minimal shape the pure helpers need. */
export interface OfferLike {
	type: OfferType
	name?: string
}

/** Customer-facing one-liner describing what the offer gets them. */
export function describeOffer(offer: OfferLike): string {
	switch (offer.type) {
		case "bogo":
			return "Buy one, get one free — a second identical account is added"
		case "free_retry":
			return "Free retry — one replacement account if this challenge is failed"
		case "free_addon":
			return "Weekend Holding add-on included free"
		default:
			return offer.name ?? "Offer applied"
	}
}

/** Short label for tight spaces (checkout chips, admin tables). */
export function shortOfferLabel(offer: OfferLike): string {
	switch (offer.type) {
		case "bogo":
			return "Buy one, get one free"
		case "free_retry":
			return "Free retry"
		case "free_addon":
			return "Free Weekend Holding"
		default:
			return offer.name ?? "Offer"
	}
}

/** Admin-facing copy for each type. */
export const OFFER_TYPE_META: Record<OfferType, { label: string; blurb: string }> = {
	bogo: {
		label: "BOGO — buy one, get one free",
		blurb: "A second identical account is issued automatically once the order is paid.",
	},
	free_retry: {
		label: "Free retry",
		blurb: "If the challenge is failed, a free replacement account is issued automatically.",
	},
	free_addon: {
		label: "Free Weekend Holding add-on",
		blurb: "The paid Weekend Holding add-on is included at no extra cost.",
	},
}

/** Display order in the admin type picker. */
export const OFFER_TYPE_ORDER: OfferType[] = ["bogo", "free_retry", "free_addon"]

export interface OfferPayload {
	/** Internal reference only — customers never type this. */
	code?: string
	name?: string
	type?: string
	planIds?: string[]
	status?: string
	startsAt?: string | null
	expiresAt?: string | null
	maxRedemptions?: number | null
	perUserLimit?: number | null
	description?: string | null
}

/**
 * Validates an offer payload from the admin form or the API.
 * `partial` is for PATCH, where only the fields present need checking.
 * Returns an error message, or null when acceptable.
 */
export function validateOfferPayload(body: OfferPayload, partial = false): string | null {
	if ((!partial || body.name !== undefined) && !(body.name ?? "").trim()) {
		return "A name is required."
	}

	const type = body.type as OfferType | undefined
	if (!partial || type !== undefined) {
		if (!type || !OFFER_TYPES.includes(type)) {
			return `Type must be one of: ${OFFER_TYPES.join(", ")}.`
		}
	}

	for (const key of ["maxRedemptions", "perUserLimit"] as const) {
		const raw = body[key]
		if (raw != null && (!Number.isInteger(Number(raw)) || Number(raw) < 1)) {
			return "Redemption limits must be whole numbers of 1 or more, or left empty."
		}
	}

	if (body.startsAt && body.expiresAt && new Date(body.startsAt) > new Date(body.expiresAt)) {
		return "The start date must be before the end date."
	}

	return null
}
