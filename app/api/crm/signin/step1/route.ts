import { NextRequest, NextResponse } from "next/server"
import { createSession } from "@/lib/auth/session"
import { verifyPassword } from "@/lib/auth/password"
import { findUserByEmail, toPublicUser } from "@/lib/services/users"

export const dynamic = "force-dynamic"

// 2FA email codes are disabled for now (no SMTP configured) — valid
// credentials sign the admin/support user in directly.
export async function POST(req: NextRequest) {
  let body: { email?: string; password?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ message: "Invalid JSON body." }, { status: 400 })
  }

  const email = (body.email ?? "").trim().toLowerCase()
  const password = body.password ?? ""
  if (!email || !password) {
    return NextResponse.json({ message: "Email and password are required." }, { status: 422 })
  }

  const user = await findUserByEmail(email)
  if (!user || (user.role !== "admin" && user.role !== "support")) {
    return NextResponse.json({ message: "Invalid email or password." }, { status: 401 })
  }

  const passwordOk = await verifyPassword(password, user.passwordHash)
  if (!passwordOk) {
    return NextResponse.json({ message: "Invalid email or password." }, { status: 401 })
  }
  if (user.status !== "active") {
    return NextResponse.json({ message: "This account has been suspended." }, { status: 403 })
  }

  await createSession({ sub: user.id, email: user.email, role: user.role }, { rememberMe: false })

  return NextResponse.json({ user: toPublicUser(user) })
}
