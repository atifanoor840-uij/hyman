import { NextRequest, NextResponse } from "next/server"
import { withSession } from "@/lib/http/guard"
import { createOrder, listOrdersForUserDetailed } from "@/lib/services/orders"
import { findChallengePlanById } from "@/lib/services/challengePlans"
import { findValidCoupon } from "@/lib/services/coupons"

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

  let body: { planId?: string; paymentMethod?: string; couponCode?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ message: "Invalid JSON body." }, { status: 400 })
  }

  const planId = (body.planId ?? "").trim()
  const paymentMethod = (body.paymentMethod ?? "").trim()
  if (!planId || (paymentMethod !== "oxapay" && paymentMethod !== "nowpayments")) {
    return NextResponse.json({ message: "planId and a valid paymentMethod are required." }, { status: 422 })
  }

  const plan = await findChallengePlanById(planId)
  if (!plan) {
    return NextResponse.json({ message: "That plan no longer exists." }, { status: 404 })
  }

  let amountPaid = plan.price
  let couponUsed: string | null = null
  if (body.couponCode) {
    const coupon = await findValidCoupon(body.couponCode)
    if (!coupon) {
      return NextResponse.json({ message: "That coupon code is invalid or expired." }, { status: 400 })
    }
    amountPaid = Math.round(plan.price * (1 - coupon.discountPercent / 100) * 100) / 100
    couponUsed = coupon.code
  }

  const order = await createOrder({
    userId: session.sub,
    planId,
    amountPaid,
    paymentMethod,
    couponUsed,
  })

  return NextResponse.json({ order }, { status: 201 })
}
