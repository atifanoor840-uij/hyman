import { NextRequest, NextResponse } from "next/server"
import { withSession } from "@/lib/http/guard"
import { createOrder, listOrdersForUserDetailed } from "@/lib/services/orders"
import { findChallengePlanById } from "@/lib/services/challengePlans"
import { findValidCoupon } from "@/lib/services/coupons"
import { listAutoOffersForPlan, recordRedemption } from "@/lib/services/offers"
import { findUserById } from "@/lib/services/users"
import { clearSession } from "@/lib/auth/session"

export const dynamic = "force-dynamic"

export async function GET() {
  const { session, error } = await withSession()
  if (error) return error

  const orders = await listOrdersForUserDetailed(session.sub)
  return NextResponse.json({ orders })
}

export async function POST(req: NextRequest) {
  const { session, error } = await withSession()
  if (error) return error

  // A still-valid cookie can outlive its user (e.g. the account was deleted); the orders FK would reject it.
  if (!(await findUserById(session.sub))) {
    await clearSession()
    return NextResponse.json({ message: "Your session has expired. Please sign in again." }, { status: 401 })
  }

  let body: { planId?: string; paymentMethod?: string; couponCode?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ message: "Invalid JSON body." }, { status: 400 })
  }

  const planId = (body.planId ?? "").trim()
  const paymentMethod = (body.paymentMethod ?? "").trim()
  if (!planId || paymentMethod !== "nowpayments") {
    return NextResponse.json({ message: "planId and a valid paymentMethod are required." }, { status: 422 })
  }

  const plan = await findChallengePlanById(planId)
  if (!plan) {
    return NextResponse.json({ message: "That plan no longer exists." }, { status: 404 })
  }

  // Coupons are the only thing a customer types, and the only thing that
  // changes the price.
  let amountPaid = plan.price
  let couponUsed: string | null = null

  const code = (body.couponCode ?? "").trim()
  if (code) {
    const coupon = await findValidCoupon(code)
    if (!coupon) {
      return NextResponse.json({ message: "That code is invalid or expired." }, { status: 400 })
    }
    amountPaid = Math.round(plan.price * (1 - coupon.discountPercent / 100) * 100) / 100
    couponUsed = coupon.code
  }

  // Offers need no code: every active offer covering this plan is attached
  // automatically. They grant extras and never change the price.
  const autoOffers = await listAutoOffersForPlan(planId, session.sub)

  const order = await createOrder({
    userId: session.sub,
    planId,
    amountPaid,
    paymentMethod,
    couponUsed,
    offerCode: autoOffers.length ? autoOffers.map((o) => o.code ?? o.name).join(", ") : null,
  })

  // One redemption row per offer, so fulfilment knows what to grant once paid.
  for (const offer of autoOffers) {
    await recordRedemption({ offer, userId: session.sub, orderId: order.id })
  }

  return NextResponse.json({ order }, { status: 201 })
}
