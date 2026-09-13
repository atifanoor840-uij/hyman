import { NextRequest, NextResponse } from "next/server"
import { hashPassword } from "@/lib/auth/password"
import { sendVerificationCodeEmail } from "@/lib/services/email"
import { createUser, findAffiliateByReferralCode, findUserByEmail, toPublicUser } from "@/lib/services/users"
import { issueVerificationCode } from "@/lib/services/verificationTokens"

export const dynamic = "force-dynamic"

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function isStrongPassword(password: string): boolean {
  return /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password) && password.length >= 8
}

interface SignupBody {
  name?: string
  email?: string
  password?: string
  country?: string
  phone?: string
  referralCode?: string
}

export async function POST(req: NextRequest) {
  let body: SignupBody
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ message: "Invalid JSON body." }, { status: 400 })
  }

  const name = (body.name ?? "").trim()
  const email = (body.email ?? "").trim().toLowerCase()
  const password = body.password ?? ""
  const country = (body.country ?? "").trim()
  const phone = (body.phone ?? "").trim()
  const referralCode = (body.referralCode ?? "").trim()

  const errors: Record<string, string[]> = {}
  if (!name || name.length < 2) errors.name = ["Full name is required."]
  if (!email || !isValidEmail(email)) errors.email = ["A valid email address is required."]
  if (!password || !isStrongPassword(password)) {
    errors.password = ["Password must be at least 8 characters and include upper, lower, and a number."]
  }
  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ message: "Please check your information and try again.", errors }, { status: 422 })
  }

  const existing = await findUserByEmail(email)
  if (existing) {
    return NextResponse.json({ message: "This email is already registered." }, { status: 409 })
  }

  let referredBy: string | null = null
  if (referralCode) {
    const affiliate = await findAffiliateByReferralCode(referralCode)
    if (affiliate) referredBy = affiliate.userId
    // An unrecognized referral code doesn't block signup — it's optional.
  }

  const passwordHash = await hashPassword(password)
  const user = await createUser({
    name,
    email,
    passwordHash,
    country: country || null,
    phone: phone || null,
    referredBy,
  })

  let emailSent = false
  try {
    const code = await issueVerificationCode(user.id, "signup")
    await sendVerificationCodeEmail(user.email, code, "signup")
    emailSent = true
  } catch (err) {
    console.error("[signup] failed to send verification email:", err instanceof Error ? err.message : err)
  }

  return NextResponse.json({ user: toPublicUser(user), emailSent }, { status: 201 })
}
