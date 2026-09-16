import { NextRequest, NextResponse } from "next/server"
import { withSession } from "@/lib/http/guard"
import { deleteInventory, updateInventory } from "@/lib/services/challengeInventory"
import { writeAuditLog } from "@/lib/services/auditLog"

export const dynamic = "force-dynamic"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { session, error } = await withSession(["admin", "support"])
  if (error) return error
  const { id } = await params

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ message: "Invalid JSON body." }, { status: 400 })
  }

  const item = await updateInventory(id, body)

  await writeAuditLog({
    userId: session.sub,
    userName: session.email,
    targetId: id,
    targetType: "challenge_inventory",
    action: "update",
    description: `${session.email} updated inventory account ${id}.`,
  })

  return NextResponse.json({ item })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { session, error } = await withSession(["admin", "support"])
  if (error) return error
  const { id } = await params

  await deleteInventory(id)

  await writeAuditLog({
    userId: session.sub,
    userName: session.email,
    targetId: id,
    targetType: "challenge_inventory",
    action: "delete",
    description: `${session.email} deleted inventory account ${id}.`,
  })

  return NextResponse.json({ ok: true })
}
