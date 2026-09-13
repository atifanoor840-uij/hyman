import { NextResponse } from "next/server"
import { withSession } from "@/lib/http/guard"
import { listUsers } from "@/lib/services/users"

export const dynamic = "force-dynamic"

export async function GET() {
  const { error } = await withSession(["admin", "support"])
  if (error) return error

  const users = await listUsers()
  return NextResponse.json({ users: users.map(({ passwordHash: _passwordHash, ...rest }) => rest) })
}
