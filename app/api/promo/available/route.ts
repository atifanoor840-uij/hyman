import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { findChallengePlanById } from "@/lib/services/challengePlans"
import { listPlanPromos } from "@/lib/services/promo"
import { errorResponse } from "@/lib/http/guard"

export const dynamic = "force-dynamic"

/**
 * What the checkout sidebar shows for one plan:
 *   coupons — advertised codes (only those ticked "Show at checkout"), tappable
 *   offers  — perks that apply automatically, shown as already included
 */
export async function GET(req: NextRequest) {
	const planId = (req.nextUrl.searchParams.get("planId") ?? "").trim()
	if (!planId) return NextResponse.json({ message: "planId is required." }, { status: 422 })

	try {
		const plan = await findChallengePlanById(planId)
		if (!plan) return NextResponse.json({ message: "That plan no longer exists." }, { status: 404 })

		const session = await getSession()
		const { coupons, offers } = await listPlanPromos({
			planId,
			planPrice: plan.price,
			userId: session?.sub ?? null,
		})

		return NextResponse.json({ coupons, offers })
	} catch (err) {
		return errorResponse(err, "Could not load offers for this plan.")
	}
}
