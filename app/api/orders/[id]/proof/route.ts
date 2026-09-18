import { NextRequest, NextResponse } from "next/server"
import { withSession, errorResponse } from "@/lib/http/guard"
import { findOrderById, setOrderGatewayRef, updateOrderStatus } from "@/lib/services/orders"
import { encodeProofRef, findManualWallet, normalizeTxid, uploadPaymentProof, validateProof } from "@/lib/services/payments/manualCrypto"
import { createNotification } from "@/lib/services/notifications"

export const dynamic = "force-dynamic"

/** Customer uploads a payment screenshot for a "Scan & pay" order; it then waits for admin review. */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { session, error } = await withSession()
  if (error) return error
  const { id } = await params

  const order = await findOrderById(id)
  if (!order || order.userId !== session.sub) {
    return NextResponse.json({ message: "Order not found." }, { status: 404 })
  }
  if (order.paymentMethod !== "manual_crypto") {
    return NextResponse.json({ message: "This order does not take a payment screenshot." }, { status: 422 })
  }
  if (order.status !== "pending_payment" && order.status !== "pending_review") {
    return NextResponse.json({ message: "This order has already been reviewed." }, { status: 409 })
  }

  const form = await req.formData().catch(() => null)
  const wallet = findManualWallet(String(form?.get("network") ?? ""))
  const file = form?.get("screenshot")
  const txid = normalizeTxid(String(form?.get("txid") ?? ""))
  if (!wallet) return NextResponse.json({ message: "Select the network you paid on." }, { status: 422 })
  if (!txid) return NextResponse.json({ message: "Enter the transaction ID (TXID / hash) of your payment." }, { status: 422 })
  if (!(file instanceof File)) return NextResponse.json({ message: "Upload your payment screenshot." }, { status: 422 })
  const invalid = validateProof(file)
  if (invalid) return NextResponse.json({ message: invalid }, { status: 422 })

  try {
    const path = await uploadPaymentProof(order.id, wallet.id, file)
    await setOrderGatewayRef(order.id, encodeProofRef(path, txid))
    await updateOrderStatus(order.id, "pending_review")
    await createNotification({
      userId: session.sub,
      title: "Payment submitted",
      message: "We received your TXID and payment screenshot. Your order will be activated once our team verifies the transfer.",
      type: "order",
    })
    return NextResponse.json({ ok: true })
  } catch (err) {
    return errorResponse(err, "Could not upload your screenshot. Please try again.")
  }
}
