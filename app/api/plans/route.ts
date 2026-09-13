import { NextResponse } from "next/server"
import { listChallengePlans } from "@/lib/services/challengePlans"

export const dynamic = "force-dynamic"

export async function GET() {
  const plans = await listChallengePlans()
  return NextResponse.json({ plans })
}
