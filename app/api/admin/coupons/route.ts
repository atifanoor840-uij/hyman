import { NextRequest, NextResponse } from "next/server"
import { withSession } from "@/lib/http/guard"
import { createCoupon, listCoupons } from "@/lib/services/coupons"
import { writeAuditLog } from "@/lib/services/auditLog"

export const dynamic = "force-dynamic"

export async function GET() {
  const { error } = await withSession(["admin", "support"])
  if (error) return error

  const coupons = await listCoupons()
  return NextResponse.json({ coupons })
}

export async function POST(req: NextRequest) {
  const { session, error } = await withSession(["admin", "support"])
  if (error) return error

  let body: { code?: string; discountPercent?: number; status?: string; expiresAt?: string | null }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ message: "Invalid JSON body." }, { status: 400 })
  }

  const code = (body.code ?? "").trim()
  const discountPercent = Number(body.discountPercent)
  if (!code || !Number.isFinite(discountPercent) || discountPercent <= 0 || discountPercent > 100) {
    return NextResponse.json({ message: "code and a discountPercent between 1 and 100 are required." }, { status: 422 })
  }

  let coupon
  try {
    coupon = await createCoupon({ code, discountPercent, status: body.status, expiresAt: body.expiresAt ?? null })
  } catch (err) {
    const message = err instanceof Error && err.message.includes("duplicate") ? "That coupon code already exists." : "Failed to create coupon."
    return NextResponse.json({ message }, { status: 409 })
  }

  await writeAuditLog({
    userId: session.sub,
    userName: session.email,
    targetId: coupon.code,
    targetType: "coupon",
    action: "create",
    description: `${session.email} created coupon ${coupon.code} (${coupon.discountPercent}% off).`,
  })

  return NextResponse.json({ coupon }, { status: 201 })
}
