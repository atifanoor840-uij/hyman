import "server-only"

import { findValidCoupon, listPublicCoupons } from "./coupons"
import { describeOffer, shortOfferLabel } from "@/lib/offers-shared"
import { listAutoOffersForPlan, type OfferRow } from "./offers"

/**
 * The two promo concepts, kept deliberately separate:
 *
 *   Coupons  change the price and need a code typed at checkout.
 *   Offers   grant an extra and apply automatically — no code exists for them.
 *
 * So this module resolves codes against coupons only, and lists automatic
 * offers separately for display.
 */

const round2 = (n: number) => Math.round(n * 100) / 100

export type CouponResult =
	| {
			valid: true
			kind: "coupon"
			code: string
			discountPercent: number
			finalPrice: number
			discountAmount: number
			summary: string
	  }
	| { valid: false; message: string }

/** Checks a code the customer typed. Only coupons have codes. */
export async function resolveCouponCode(input: { code: string; planPrice: number }): Promise<CouponResult> {
	const code = input.code.trim()
	if (!code) return { valid: false, message: "Enter a code." }

	const coupon = await findValidCoupon(code)
	if (!coupon) return { valid: false, message: "That code is invalid or expired." }

	const finalPrice = round2(input.planPrice * (1 - coupon.discountPercent / 100))
	return {
		valid: true,
		kind: "coupon",
		code: coupon.code,
		discountPercent: coupon.discountPercent,
		finalPrice,
		discountAmount: round2(input.planPrice - finalPrice),
		summary: `${coupon.discountPercent}% off`,
	}
}

/** A coupon code the admin chose to advertise in the checkout sidebar. */
export interface AvailableCoupon {
	code: string
	summary: string
	finalPrice: number
	discountAmount: number
	expiresAt: string | null
}

/** An offer that applies automatically to this plan. */
export interface IncludedOffer {
	name: string
	type: OfferRow["type"]
	summary: string
	shortLabel: string
}

/**
 * What to show in the checkout sidebar for one plan:
 *   coupons — advertised codes the customer can tap to apply
 *   offers  — perks already included, nothing to do
 */
export async function listPlanPromos(input: {
	planId: string
	planPrice: number
	userId?: string | null
}): Promise<{ coupons: AvailableCoupon[]; offers: IncludedOffer[] }> {
	const [couponRows, offerRows] = await Promise.all([
		listPublicCoupons(),
		listAutoOffersForPlan(input.planId, input.userId ?? null),
	])

	const coupons: AvailableCoupon[] = couponRows
		.map((c) => {
			const finalPrice = round2(input.planPrice * (1 - c.discountPercent / 100))
			return {
				code: c.code,
				summary: `${c.discountPercent}% off`,
				finalPrice,
				discountAmount: round2(input.planPrice - finalPrice),
				expiresAt: c.expiresAt,
			}
		})
		.sort((a, b) => b.discountAmount - a.discountAmount)

	const offers: IncludedOffer[] = offerRows.map((o) => ({
		name: o.name,
		type: o.type,
		summary: describeOffer(o),
		shortLabel: shortOfferLabel(o),
	}))

	return { coupons, offers }
}
