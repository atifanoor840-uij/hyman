import { NextRequest, NextResponse } from "next/server"
import { withSession } from "@/lib/http/guard"
import { deleteAffiliate, updateAffiliate } from "@/lib/services/affiliates"
import { writeAuditLog } from "@/lib/services/auditLog"

export const dynamic = "force-dynamic"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const { session, error } = await withSession(["admin", "support"])
  if (error) return error
  const { userId } = await params

  let body: { referralCode?: string; commissionRate?: number }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ message: "Invalid JSON body." }, { status: 400 })
  }

  const patch: Parameters<typeof updateAffiliate>[1] = {}
  if (body.referralCode !== undefined) patch.referralCode = body.referralCode
  if (body.commissionRate !== undefined) patch.commissionRate = Number(body.commissionRate)

  const affiliate = await updateAffiliate(userId, patch)

  await writeAuditLog({
    userId: session.sub,
    userName: session.email,
    targetId: userId,
    targetType: "affiliate",
    action: "update",
    description: `${session.email} updated affiliate ${userId}.`,
  })

  return NextResponse.json({ affiliate })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const { session, error } = await withSession(["admin"])
  if (error) return error
  const { userId } = await params

  await deleteAffiliate(userId)

  await writeAuditLog({
    userId: session.sub,
    userName: session.email,
    targetId: userId,
    targetType: "affiliate",
    action: "delete",
    description: `${session.email} removed affiliate ${userId}.`,
  })

  return NextResponse.json({ ok: true })
}
