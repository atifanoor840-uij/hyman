import { NextRequest, NextResponse } from "next/server"
import { sendVerificationCodeEmail } from "@/lib/services/email"
import { findUserByEmail } from "@/lib/services/users"
import { issueVerificationCode, VerificationError } from "@/lib/services/verificationTokens"

export const dynamic = "force-dynamic"

const GENERIC_MESSAGE = "If an account exists for that email, we've sent a reset code."

export async function POST(req: NextRequest) {
  let body: { email?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ message: "Invalid JSON body." }, { status: 400 })
  }

  const email = (body.email ?? "").trim().toLowerCase()
  if (!email) {
    return NextResponse.json({ message: "Email is required." }, { status: 422 })
  }

  // Deliberately generic response either way, to avoid leaking which emails
  // have an account.
  const user = await findUserByEmail(email)
  if (user) {
    try {
      const code = await issueVerificationCode(user.id, "reset")
      await sendVerificationCodeEmail(user.email, code, "reset")
    } catch (err) {
      if (!(err instanceof VerificationError)) {
        console.error("[forgot-password] failed to send reset email:", err instanceof Error ? err.message : err)
      }
      // Swallow cooldown/send errors here too — response stays generic.
    }
  }

  return NextResponse.json({ message: GENERIC_MESSAGE })
}
