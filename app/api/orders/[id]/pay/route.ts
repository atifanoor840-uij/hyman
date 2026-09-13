import { NextRequest, NextResponse } from "next/server"
import { withSession } from "@/lib/http/guard"
import { findOrderById, setOrderGatewayRef } from "@/lib/services/orders"
import { findChallengePlanById } from "@/lib/services/challengePlans"
import { createOxapayInvoice } from "@/lib/services/payments/oxapay"
import { createNowPaymentsInvoice } from "@/lib/services/payments/nowpayments"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { session, error } = await withSession()
  if (error) return error
  const { id } = await params

  const order = await findOrderById(id)
  if (!order || order.userId !== session.sub) {
    return NextResponse.json({ message: "Order not found." }, { status: 404 })
  }
  if (order.status !== "pending_payment") {
    return NextResponse.json({ message: "This order has already been paid or is no longer payable." }, { status: 409 })
  }

  const plan = order.planId ? await findChallengePlanById(order.planId) : null
  const origin = req.nextUrl.origin

  try {
    if (order.paymentMethod === "oxapay") {
      const result = await createOxapayInvoice(
        { orderId: order.id, amount: order.amountPaid, currency: "USD", description: `${plan?.name ?? "Challenge"} — GenzProp` },
        { callbackUrl: `${origin}/api/webhooks/oxapay`, returnUrl: `${origin}/dashboard/billing` }
      )
      await setOrderGatewayRef(order.id, result.gatewayRef)
      return NextResponse.json({ checkoutUrl: result.checkoutUrl })
    }

    if (order.paymentMethod === "nowpayments") {
      const result = await createNowPaymentsInvoice(
        { orderId: order.id, amount: order.amountPaid, currency: "USD", description: `${plan?.name ?? "Challenge"} — GenzProp` },
        {
          ipnCallbackUrl: `${origin}/api/webhooks/nowpayments`,
          successUrl: `${origin}/dashboard/billing`,
          cancelUrl: `${origin}/dashboard/billing`,
        }
      )
      await setOrderGatewayRef(order.id, result.gatewayRef)
      return NextResponse.json({ checkoutUrl: result.checkoutUrl })
    }

    return NextResponse.json({ message: "Unsupported payment method." }, { status: 422 })
  } catch (err) {
    console.error("[orders/pay] gateway error:", err instanceof Error ? err.message : err)
    return NextResponse.json(
      { message: "Unable to start payment right now. Please try again shortly." },
      { status: 502 }
    )
  }
}
