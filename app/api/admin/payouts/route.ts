import { NextResponse } from "next/server"
import { withSession } from "@/lib/http/guard"
import { listAllPayouts } from "@/lib/services/payouts"

export const dynamic = "force-dynamic"

export async function GET() {
  const { error } = await withSession(["admin", "support"])
  if (error) return error

  const payouts = await listAllPayouts()
  return NextResponse.json({ payouts })
}
