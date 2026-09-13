import { NextRequest, NextResponse } from "next/server"
import { verifyOxapayWebhook } from "@/lib/services/payments/oxapay"
import { findOrderByGatewayRef, updateOrderStatus } from "@/lib/services/orders"
import { fulfillOrder } from "@/lib/services/orderFulfillment"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const hmac = req.headers.get("hmac")

  const result = verifyOxapayWebhook(rawBody, hmac)
  if (!result.valid) {
    return NextResponse.json({ message: "Invalid signature." }, { status: 401 })
  }
  if (!result.gatewayRef) {
    return NextResponse.json({ ok: true }) // nothing to reconcile
  }

  const order = await findOrderByGatewayRef(result.gatewayRef)
  if (!order) {
    return NextResponse.json({ ok: true }) // unknown order — ack anyway, nothing to retry
  }

  // Idempotent: fulfillOrder no-ops if the order is already past pending_payment.
  if (result.status === "paid") {
    await fulfillOrder(order.id)
  } else if (result.status === "failed" && order.status === "pending_payment") {
    await updateOrderStatus(order.id, "failed")
  }

  return NextResponse.json({ ok: true })
}
