import { NextRequest, NextResponse } from "next/server"
import { findUserByEmail, markEmailVerified } from "@/lib/services/users"
import { consumeVerificationCode } from "@/lib/services/verificationTokens"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  let body: { email?: string; code?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ message: "Invalid JSON body." }, { status: 400 })
  }

  const email = (body.email ?? "").trim().toLowerCase()
  const code = (body.code ?? "").trim()
  if (!email || !code) {
    return NextResponse.json({ message: "Email and code are required." }, { status: 422 })
  }

  const user = await findUserByEmail(email)
  if (!user) {
    return NextResponse.json({ message: "Invalid or expired code." }, { status: 400 })
  }

  if (user.emailVerified) {
    return NextResponse.json({ verified: true, alreadyVerified: true })
  }

  const valid = await consumeVerificationCode(user.id, "signup", code)
  if (!valid) {
    return NextResponse.json({ message: "Invalid or expired code." }, { status: 400 })
  }

  await markEmailVerified(user.id)
  return NextResponse.json({ verified: true })
}
