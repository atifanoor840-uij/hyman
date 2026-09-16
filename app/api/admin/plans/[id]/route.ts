import { NextRequest, NextResponse } from "next/server"
import { withSession } from "@/lib/http/guard"
import { deleteChallengePlan, updateChallengePlan } from "@/lib/services/challengePlans"
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

  const plan = await updateChallengePlan(id, body)

  await writeAuditLog({
    userId: session.sub,
    userName: session.email,
    targetId: id,
    targetType: "challenge_plan",
    action: "update",
    description: `${session.email} updated plan ${plan.name}.`,
  })

  return NextResponse.json({ plan })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { session, error } = await withSession(["admin", "support"])
  if (error) return error
  const { id } = await params

  await deleteChallengePlan(id)

  await writeAuditLog({
    userId: session.sub,
    userName: session.email,
    targetId: id,
    targetType: "challenge_plan",
    action: "delete",
    description: `${session.email} deleted plan ${id}.`,
  })

  return NextResponse.json({ ok: true })
}
