import { NextRequest, NextResponse } from "next/server"
import { findChallengePlanById } from "@/lib/services/challengePlans"
import { resolveCouponCode } from "@/lib/services/promo"
import { errorResponse } from "@/lib/http/guard"

export const dynamic = "force-dynamic"

/**
 * Validates a code typed into the checkout box. Only coupons have codes —
 * offers apply automatically and are never entered. `planId` is required so the
 * discount can be computed against that plan's price.
 */
export async function POST(req: NextRequest) {
	let body: { code?: string; planId?: string }
	try {
		body = await req.json()
	} catch {
		return NextResponse.json({ message: "Invalid JSON body." }, { status: 400 })
	}

	const code = (body.code ?? "").trim()
	const planId = (body.planId ?? "").trim()
	if (!code || !planId) {
		return NextResponse.json({ message: "code and planId are required." }, { status: 422 })
	}

	try {
		const plan = await findChallengePlanById(planId)
		if (!plan) return NextResponse.json({ message: "That plan no longer exists." }, { status: 404 })

		const result = await resolveCouponCode({ code, planPrice: plan.price })
		return NextResponse.json(result)
	} catch (err) {
		return errorResponse(err, "Could not check that code.")
	}
}
