import { NextRequest, NextResponse } from "next/server"
import { withSession } from "@/lib/http/guard"
import { setReferralStatus } from "@/lib/services/referrals"
import { writeAuditLog } from "@/lib/services/auditLog"

export const dynamic = "force-dynamic"

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ referredUserId: string; orderId: string }> }
) {
  const { session, error } = await withSession(["admin", "support"])
  if (error) return error
  const { referredUserId, orderId } = await params

  let body: { status?: "pending" | "confirmed" | "paid" }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ message: "Invalid JSON body." }, { status: 400 })
  }
  if (!body.status || !["pending", "confirmed", "paid"].includes(body.status)) {
    return NextResponse.json({ message: "status must be 'pending', 'confirmed', or 'paid'." }, { status: 422 })
  }

  await setReferralStatus(referredUserId, orderId, body.status)

  await writeAuditLog({
    userId: session.sub,
    userName: session.email,
    targetId: `${referredUserId}:${orderId}`,
    targetType: "referral",
    action: body.status,
    description: `${session.email} marked referral ${referredUserId}/${orderId} as ${body.status}.`,
  })

  return NextResponse.json({ ok: true })
}
