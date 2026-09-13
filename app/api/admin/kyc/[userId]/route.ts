import { NextRequest, NextResponse } from "next/server"
import { withSession } from "@/lib/http/guard"
import { setKycStatus } from "@/lib/services/kyc"
import { findUserById } from "@/lib/services/users"
import { createNotification } from "@/lib/services/notifications"
import { writeAuditLog } from "@/lib/services/auditLog"

export const dynamic = "force-dynamic"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const { session, error } = await withSession(["admin", "support"])
  if (error) return error
  const { userId } = await params

  let body: { status?: "approved" | "rejected"; rejectReason?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ message: "Invalid JSON body." }, { status: 400 })
  }
  if (body.status !== "approved" && body.status !== "rejected") {
    return NextResponse.json({ message: "status must be 'approved' or 'rejected'." }, { status: 422 })
  }

  const target = await findUserById(userId)
  if (!target) return NextResponse.json({ message: "User not found." }, { status: 404 })

  await setKycStatus(userId, body.status, body.rejectReason)
  await createNotification({
    userId,
    title: body.status === "approved" ? "KYC approved" : "KYC rejected",
    message:
      body.status === "approved"
        ? "Your identity verification has been approved."
        : `Your identity verification was rejected. ${body.rejectReason ?? ""}`.trim(),
    type: "kyc",
  })
  await writeAuditLog({
    userId: session.sub,
    userName: session.email,
    targetId: userId,
    targetType: "kyc",
    action: body.status,
    description: `${session.email} marked KYC for ${target.email} as ${body.status}.`,
  })

  return NextResponse.json({ ok: true })
}
