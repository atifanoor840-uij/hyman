import { NextRequest, NextResponse } from "next/server"
import { withSession } from "@/lib/http/guard"
import { createAffiliate, listAffiliatesDetailed } from "@/lib/services/affiliates"
import { findUserByEmail } from "@/lib/services/users"
import { writeAuditLog } from "@/lib/services/auditLog"

export const dynamic = "force-dynamic"

export async function GET() {
  const { error } = await withSession(["admin", "support"])
  if (error) return error

  const affiliates = await listAffiliatesDetailed()
  return NextResponse.json({ affiliates })
}

export async function POST(req: NextRequest) {
  const { session, error } = await withSession(["admin", "support"])
  if (error) return error

  let body: { email?: string; referralCode?: string; commissionRate?: number }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ message: "Invalid JSON body." }, { status: 400 })
  }

  const email = (body.email ?? "").trim().toLowerCase()
  const referralCode = (body.referralCode ?? "").trim()
  const commissionRate = Number(body.commissionRate)

  if (!email || !referralCode || !Number.isFinite(commissionRate) || commissionRate <= 0 || commissionRate > 100) {
    return NextResponse.json(
      { message: "email, referralCode, and a commissionRate between 1 and 100 are required." },
      { status: 422 }
    )
  }

  const user = await findUserByEmail(email)
  if (!user) {
    return NextResponse.json({ message: "No user found with that email." }, { status: 404 })
  }

  let affiliate
  try {
    affiliate = await createAffiliate({ userId: user.id, referralCode, commissionRate })
  } catch (err) {
    const message =
      err instanceof Error && err.message.toLowerCase().includes("duplicate")
        ? "That user is already an affiliate, or the referral code is taken."
        : "Failed to create affiliate."
    return NextResponse.json({ message }, { status: 409 })
  }

  await writeAuditLog({
    userId: session.sub,
    userName: session.email,
    targetId: user.id,
    targetType: "affiliate",
    action: "create",
    description: `${session.email} enrolled ${user.email} as an affiliate (code ${affiliate.referralCode}, ${affiliate.commissionRate}%).`,
  })

  return NextResponse.json({ affiliate }, { status: 201 })
}
