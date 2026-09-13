import { NextRequest, NextResponse } from "next/server"
import { hashPassword } from "@/lib/auth/password"
import { findUserByEmail, updatePasswordHash } from "@/lib/services/users"
import { consumeVerificationCode } from "@/lib/services/verificationTokens"

export const dynamic = "force-dynamic"

function isStrongPassword(password: string): boolean {
  return /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password) && password.length >= 8
}

export async function POST(req: NextRequest) {
  let body: { email?: string; code?: string; password?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ message: "Invalid JSON body." }, { status: 400 })
  }

  const email = (body.email ?? "").trim().toLowerCase()
  const code = (body.code ?? "").trim()
  const password = body.password ?? ""

  if (!email || !code || !password) {
    return NextResponse.json({ message: "Email, code, and new password are required." }, { status: 422 })
  }
  if (!isStrongPassword(password)) {
    return NextResponse.json(
      { message: "Password must be at least 8 characters and include upper, lower, and a number." },
      { status: 422 }
    )
  }

  const user = await findUserByEmail(email)
  if (!user) {
    return NextResponse.json({ message: "Invalid or expired code." }, { status: 400 })
  }

  const valid = await consumeVerificationCode(user.id, "reset", code)
  if (!valid) {
    return NextResponse.json({ message: "Invalid or expired code." }, { status: 400 })
  }

  const passwordHash = await hashPassword(password)
  await updatePasswordHash(user.id, passwordHash)

  return NextResponse.json({ ok: true })
}
