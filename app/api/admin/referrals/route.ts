import { NextResponse } from "next/server"
import { withSession } from "@/lib/http/guard"
import { listReferralsDetailed } from "@/lib/services/referrals"

export const dynamic = "force-dynamic"

export async function GET() {
  const { error } = await withSession(["admin", "support"])
  if (error) return error

  const referrals = await listReferralsDetailed()
  return NextResponse.json({ referrals })
}
