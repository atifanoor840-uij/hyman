import { NextRequest, NextResponse } from "next/server"
import { verifyNowPaymentsWebhook } from "@/lib/services/payments/nowpayments"
import { findOrderById, updateOrderStatus } from "@/lib/services/orders"
import { fulfillOrder } from "@/lib/services/orderFulfillment"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const sig = req.headers.get("x-nowpayments-sig")

  const result = verifyNowPaymentsWebhook(rawBody, sig)
  if (!result.valid) {
    return NextResponse.json({ message: "Invalid signature." }, { status: 401 })
  }
  // NOWPayments IPN echoes back the `order_id` we supplied at invoice
  // creation, which is our own orders.id — no gatewayRef lookup needed.
  if (!result.gatewayRef) {
    return NextResponse.json({ ok: true })
  }

  const order = await findOrderById(result.gatewayRef)
  if (!order) {
    return NextResponse.json({ ok: true })
  }

  if (result.status === "paid") {
    await fulfillOrder(order.id)
  } else if (result.status === "failed" && order.status === "pending_payment") {
    await updateOrderStatus(order.id, "failed")
  }

  return NextResponse.json({ ok: true })
}
