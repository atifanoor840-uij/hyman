import { NextRequest, NextResponse } from "next/server"
import { sendVerificationCodeEmail } from "@/lib/services/email"
import { findUserByEmail } from "@/lib/services/users"
import { issueVerificationCode, VerificationError } from "@/lib/services/verificationTokens"

export const dynamic = "force-dynamic"

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

  const user = await findUserByEmail(email)
  if (!user) {
    return NextResponse.json({ message: "No account found for that email." }, { status: 404 })
  }
  if (user.emailVerified) {
    return NextResponse.json({ message: "This email is already verified." }, { status: 400 })
  }

  try {
    const code = await issueVerificationCode(user.id, "signup")
    await sendVerificationCodeEmail(user.email, code, "signup")
  } catch (err) {
    if (err instanceof VerificationError) {
      return NextResponse.json({ message: err.message }, { status: err.status })
    }
    console.error("[resend-code] failed:", err instanceof Error ? err.message : err)
    return NextResponse.json({ message: "Failed to send code. Please try again." }, { status: 500 })
  }

  return NextResponse.json({ sent: true })
}
