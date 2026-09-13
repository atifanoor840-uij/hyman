import { NextRequest, NextResponse } from "next/server"
import { findValidCoupon } from "@/lib/services/coupons"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  let body: { code?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ message: "Invalid JSON body." }, { status: 400 })
  }

  const code = (body.code ?? "").trim()
  if (!code) return NextResponse.json({ message: "code is required." }, { status: 422 })

  const coupon = await findValidCoupon(code)
  if (!coupon) {
    return NextResponse.json({ valid: false }, { status: 200 })
  }
  return NextResponse.json({ valid: true, discountPercent: coupon.discountPercent })
}
