import { NextRequest, NextResponse } from "next/server"
import { hashPassword } from "@/lib/auth/password"
import { sendVerificationCodeEmail } from "@/lib/services/email"
import { createUser, findUserByEmail, toPublicUser } from "@/lib/services/users"
import { issueVerificationCode } from "@/lib/services/verificationTokens"

export const dynamic = "force-dynamic"

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function isStrongPassword(password: string): boolean {
  return /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password) && password.length >= 8
}

interface CrmSignupBody {
  name?: string
  email?: string
  password?: string
  accessCode?: string
}

// Not an open registration endpoint: creating a CRM (support-role) account
// requires a shared access code the firm distributes to new staff, so a
// stray link to this page can't be used to self-register as staff.
export async function POST(req: NextRequest) {
  const requiredCode = process.env.CRM_SIGNUP_CODE
  if (!requiredCode) {
    return NextResponse.json(
      { message: "CRM signup is not enabled. Set CRM_SIGNUP_CODE to enable it." },
      { status: 503 }
    )
  }

  let body: CrmSignupBody
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ message: "Invalid JSON body." }, { status: 400 })
  }

  const name = (body.name ?? "").trim()
  const email = (body.email ?? "").trim().toLowerCase()
  const password = body.password ?? ""
  const accessCode = (body.accessCode ?? "").trim()

  const errors: Record<string, string[]> = {}
  if (!name || name.length < 2) errors.name = ["Full name is required."]
  if (!email || !isValidEmail(email)) errors.email = ["A valid email address is required."]
  if (!password || !isStrongPassword(password)) {
    errors.password = ["Password must be at least 8 characters and include upper, lower, and a number."]
  }
  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ message: "Please check your information and try again.", errors }, { status: 422 })
  }

  if (accessCode !== requiredCode) {
    return NextResponse.json({ message: "Invalid access code." }, { status: 403 })
  }

  const existing = await findUserByEmail(email)
  if (existing) {
    return NextResponse.json({ message: "This email is already registered." }, { status: 409 })
  }

  const passwordHash = await hashPassword(password)
  // New CRM signups get the least-privileged "support" role — an existing
  // admin promotes to "admin" from /admin/users when appropriate.
  const user = await createUser({ name, email, passwordHash, role: "support" })

  let emailSent = false
  try {
    const code = await issueVerificationCode(user.id, "signup")
    await sendVerificationCodeEmail(user.email, code, "signup")
    emailSent = true
  } catch (err) {
    console.error("[crm/signup] failed to send verification email:", err instanceof Error ? err.message : err)
  }

  return NextResponse.json({ user: toPublicUser(user), emailSent }, { status: 201 })
}
