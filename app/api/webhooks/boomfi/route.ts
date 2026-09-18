import { NextRequest, NextResponse } from "next/server"
import { verifyBoomfiWebhook } from "@/lib/services/payments/boomfi"
import { findOrderByGatewayRef, findOrderById, updateOrderStatus } from "@/lib/services/orders"
import { fulfillOrder } from "@/lib/services/orderFulfillment"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const result = verifyBoomfiWebhook(
    rawBody,
    req.headers.get("x-boomfi-signature"),
    req.headers.get("x-boomfi-timestamp")
  )
  if (!result.valid) {
    return NextResponse.json({ message: "Invalid signature." }, { status: 401 })
  }

  // The paylink `reference` is our orders.id; fall back to the stored paylink id.
  const order =
    (result.gatewayRef ? await findOrderById(result.gatewayRef) : null) ??
    (result.paylinkId ? await findOrderByGatewayRef(result.paylinkId) : null)
  if (!order || order.paymentMethod !== "boomfi") {
    return NextResponse.json({ ok: true }) // nothing to reconcile — ack so BoomFi stops retrying
  }

  // Idempotent: fulfillOrder no-ops if the order is already past pending_payment.
  if (result.status === "paid") {
    await fulfillOrder(order.id)
  } else if (result.status === "failed" && order.status === "pending_payment") {
    await updateOrderStatus(order.id, "failed")
  }

  return NextResponse.json({ ok: true })
}
