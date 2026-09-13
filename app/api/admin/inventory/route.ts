import { NextRequest, NextResponse } from "next/server"
import { withSession } from "@/lib/http/guard"
import { createInventory, listInventory } from "@/lib/services/challengeInventory"
import { writeAuditLog } from "@/lib/services/auditLog"

export const dynamic = "force-dynamic"

export async function GET() {
  const { error } = await withSession(["admin", "support"])
  if (error) return error

  const items = await listInventory()
  return NextResponse.json({ items })
}

export async function POST(req: NextRequest) {
  const { session, error } = await withSession(["admin", "support"])
  if (error) return error

  let body: { platform?: string; size?: number; login?: string; password?: string; server?: string; externalStatisticsId?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ message: "Invalid JSON body." }, { status: 400 })
  }

  if (!body.platform || !body.size || !body.login || !body.password || !body.server) {
    return NextResponse.json({ message: "platform, size, login, password, and server are required." }, { status: 422 })
  }

  const item = await createInventory({
    platform: body.platform,
    size: body.size,
    login: body.login,
    password: body.password,
    server: body.server,
    externalStatisticsId: body.externalStatisticsId ?? null,
  })

  await writeAuditLog({
    userId: session.sub,
    userName: session.email,
    targetId: item.id,
    targetType: "challenge_inventory",
    action: "create",
    description: `${session.email} added an inventory account (${item.platform}, ${item.login}).`,
  })

  return NextResponse.json({ item }, { status: 201 })
}
