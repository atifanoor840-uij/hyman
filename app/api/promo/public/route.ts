import { NextResponse } from "next/server"
import { listPublicCoupons } from "@/lib/services/coupons"
import { errorResponse } from "@/lib/http/guard"

export const dynamic = "force-dynamic"

/**
 * Site-wide promo codes for the public promo bar and pricing section: the
 * active, unexpired coupons the admin ticked "Show at checkout", biggest first.
 */
export async function GET() {
	try {
		const coupons = (await listPublicCoupons())
			.map(({ code, discountPercent, expiresAt }) => ({ code, discountPercent, expiresAt }))
			.sort((a, b) => b.discountPercent - a.discountPercent)
		return NextResponse.json({ coupons })
	} catch (err) {
		return errorResponse(err, "Could not load promo codes.")
	}
}
