import { NextRequest, NextResponse } from "next/server"
import { withSession } from "@/lib/http/guard"
import { deleteCoupon, updateCoupon } from "@/lib/services/coupons"
import { writeAuditLog } from "@/lib/services/auditLog"

export const dynamic = "force-dynamic"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { session, error } = await withSession(["admin", "support"])
  if (error) return error
  const { code } = await params

  let body: { discountPercent?: number; status?: string; expiresAt?: string | null }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ message: "Invalid JSON body." }, { status: 400 })
  }

  const patch: Parameters<typeof updateCoupon>[1] = {}
  if (body.discountPercent !== undefined) patch.discountPercent = Number(body.discountPercent)
  if (body.status !== undefined) patch.status = body.status
  if (body.expiresAt !== undefined) patch.expiresAt = body.expiresAt

  const coupon = await updateCoupon(decodeURIComponent(code), patch)

  await writeAuditLog({
    userId: session.sub,
    userName: session.email,
    targetId: coupon.code,
    targetType: "coupon",
    action: "update",
    description: `${session.email} updated coupon ${coupon.code}.`,
  })

  return NextResponse.json({ coupon })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { session, error } = await withSession(["admin"])
  if (error) return error
  const { code } = await params

  await deleteCoupon(decodeURIComponent(code))

  await writeAuditLog({
    userId: session.sub,
    userName: session.email,
    targetId: code,
    targetType: "coupon",
    action: "delete",
    description: `${session.email} deleted coupon ${code}.`,
  })

  return NextResponse.json({ ok: true })
}
