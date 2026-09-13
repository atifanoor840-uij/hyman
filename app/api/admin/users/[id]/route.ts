import { NextRequest, NextResponse } from "next/server"
import { withSession } from "@/lib/http/guard"
import { adminUpdateUser, findUserById, toPublicUser } from "@/lib/services/users"
import { writeAuditLog } from "@/lib/services/auditLog"

export const dynamic = "force-dynamic"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { session, error } = await withSession(["admin", "support"])
  if (error) return error
  const { id } = await params

  let body: { name?: string; phone?: string; country?: string; role?: string; status?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ message: "Invalid JSON body." }, { status: 400 })
  }

  // Only admins may change role/status — support can edit contact details only.
  const patch: Parameters<typeof adminUpdateUser>[1] = {}
  if (body.name !== undefined) patch.name = body.name
  if (body.phone !== undefined) patch.phone = body.phone
  if (body.country !== undefined) patch.country = body.country
  if (session.role === "admin") {
    if (body.role !== undefined) patch.role = body.role as typeof patch.role
    if (body.status !== undefined) patch.status = body.status
  }

  const before = await findUserById(id)
  if (!before) return NextResponse.json({ message: "User not found." }, { status: 404 })

  const updated = await adminUpdateUser(id, patch)

  await writeAuditLog({
    userId: session.sub,
    userName: session.email,
    targetId: id,
    targetType: "user",
    action: "update",
    description: `${session.email} updated user ${before.email}: ${Object.keys(patch).join(", ") || "no changes"}.`,
  })

  return NextResponse.json({ user: toPublicUser(updated) })
}
