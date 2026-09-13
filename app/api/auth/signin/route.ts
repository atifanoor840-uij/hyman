import { NextRequest, NextResponse } from "next/server"
import { createSession } from "@/lib/auth/session"
import { hashPassword, isLegacyHash, verifyPassword } from "@/lib/auth/password"
import { findUserByEmail, toPublicUser, updatePasswordHash } from "@/lib/services/users"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  let body: { email?: string; password?: string; rememberMe?: boolean }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ message: "Invalid JSON body." }, { status: 400 })
  }

  const email = (body.email ?? "").trim().toLowerCase()
  const password = body.password ?? ""
  const rememberMe = Boolean(body.rememberMe)

  if (!email || !password) {
    return NextResponse.json({ message: "Email and password are required." }, { status: 422 })
  }

  const user = await findUserByEmail(email)
  if (!user) {
    return NextResponse.json({ message: "Invalid email or password." }, { status: 401 })
  }

  const passwordOk = await verifyPassword(password, user.passwordHash)
  if (!passwordOk) {
    return NextResponse.json({ message: "Invalid email or password." }, { status: 401 })
  }

  if (user.status !== "active") {
    return NextResponse.json({ message: "This account has been suspended. Contact support." }, { status: 403 })
  }

  if (isLegacyHash(user.passwordHash)) {
    // Opportunistic upgrade: a successful legacy-hash verification proves
    // the password, so re-hash it with bcrypt and stop relying on sha256.
    try {
      const upgraded = await hashPassword(password)
      await updatePasswordHash(user.id, upgraded)
    } catch (err) {
      console.error("[signin] failed to upgrade legacy password hash:", err instanceof Error ? err.message : err)
    }
  }

  await createSession({ sub: user.id, email: user.email, role: user.role }, { rememberMe })

  return NextResponse.json({ user: toPublicUser(user) })
}
