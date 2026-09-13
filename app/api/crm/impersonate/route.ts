import { NextRequest, NextResponse } from "next/server"
import { withSession } from "@/lib/http/guard"
import { createSession } from "@/lib/auth/session"
import { findUserById, toPublicUser } from "@/lib/services/users"
import { writeAuditLog } from "@/lib/services/auditLog"

export const dynamic = "force-dynamic"

// Admin and support staff: replaces the admin's session in this browser
// with a session for the target user, exactly like the pre-migration "login
// as user" flow — but gated by role, never touching the user's password,
// and every use is written to audit_logs.
export async function POST(req: NextRequest) {
  const { session, error } = await withSession(["admin", "support"])
  if (error) return error

  let body: { targetUserId?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ message: "Invalid JSON body." }, { status: 400 })
  }

  const targetUserId = (body.targetUserId ?? "").trim()
  if (!targetUserId) {
    return NextResponse.json({ message: "targetUserId is required." }, { status: 422 })
  }

  const target = await findUserById(targetUserId)
  if (!target) {
    return NextResponse.json({ message: "User not found." }, { status: 404 })
  }

  // Never allow logging in as a staff account — that would let support escalate to admin.
  if (target.role === "admin" || target.role === "support") {
    return NextResponse.json({ message: "You can only log in as customer accounts." }, { status: 403 })
  }

  await writeAuditLog({
    userId: session.sub,
    userName: session.email,
    targetId: target.id,
    targetType: "user",
    action: "impersonate",
    description: `${session.role} ${session.email} logged in as user ${target.email}.`,
  })

  await createSession({ sub: target.id, email: target.email, role: target.role }, { rememberMe: false })

  return NextResponse.json({ user: toPublicUser(target) })
}
