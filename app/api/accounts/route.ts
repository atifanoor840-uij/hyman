import { NextResponse } from "next/server"
import { withSession } from "@/lib/http/guard"
import { listAccountsForUser } from "@/lib/services/tradingAccounts"

export const dynamic = "force-dynamic"

export async function GET() {
  const { session, error } = await withSession()
  if (error) return error

  const accounts = await listAccountsForUser(session.sub)
  return NextResponse.json({ accounts })
}
