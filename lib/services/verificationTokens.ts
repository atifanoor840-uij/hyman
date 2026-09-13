import "server-only"

import { createHash, randomInt } from "crypto"
import { createServiceRoleClient } from "@/lib/supabase/service"

export type VerificationPurpose = "signup" | "reset"

const CODE_TTL_MS = 15 * 60 * 1000 // 15 minutes
const RESEND_COOLDOWN_MS = 30 * 1000 // 30 seconds

export class VerificationError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = "VerificationError"
    this.status = status
  }
}

// email_verification_tokens has no `purpose` column (schema is exactly as
// exported), so the purpose is folded into the hash input instead. This
// means an old, unconsumed code for the same user isn't invalidated when a
// new one is issued — it simply also stays valid until its own expiry.
function hashCode(userId: string, purpose: VerificationPurpose, code: string): string {
  return createHash("sha256").update(`${userId}:${purpose}:${code}`).digest("hex")
}

function generateCode(): string {
  return String(randomInt(1000, 10000)) // 4-digit, 1000-9999
}

/** Issues a new code, persists its hash, and returns the plaintext code to email. */
export async function issueVerificationCode(
  userId: string,
  purpose: VerificationPurpose
): Promise<string> {
  const supabase = createServiceRoleClient()

  const { data: recent, error: recentError } = await supabase
    .from("email_verification_tokens")
    .select("createdAt")
    .eq("userId", userId)
    .order("createdAt", { ascending: false })
    .limit(1)
    .maybeSingle()
  if (recentError) throw recentError
  if (recent?.createdAt) {
    const elapsed = Date.now() - new Date(recent.createdAt as string).getTime()
    if (elapsed < RESEND_COOLDOWN_MS) {
      throw new VerificationError(
        `Please wait ${Math.ceil((RESEND_COOLDOWN_MS - elapsed) / 1000)}s before requesting another code.`,
        429
      )
    }
  }

  const code = generateCode()
  const tokenHash = hashCode(userId, purpose, code)
  const expiresAt = new Date(Date.now() + CODE_TTL_MS).toISOString()

  const { error } = await supabase.from("email_verification_tokens").insert({
    tokenHash,
    userId,
    expiresAt,
  })
  if (error) throw error

  if (process.env.NODE_ENV !== "production") {
    // Dev convenience so this is testable without SMTP configured — never logged in production.
    console.log(`[dev] ${purpose} verification code for user ${userId}: ${code}`)
  }

  return code
}

/** Verifies + consumes (deletes) a code. Returns true if it was valid. */
export async function consumeVerificationCode(
  userId: string,
  purpose: VerificationPurpose,
  code: string
): Promise<boolean> {
  const supabase = createServiceRoleClient()
  const tokenHash = hashCode(userId, purpose, code)

  const { data, error } = await supabase
    .from("email_verification_tokens")
    .select("tokenHash,expiresAt")
    .eq("tokenHash", tokenHash)
    .maybeSingle()
  if (error) throw error
  if (!data) return false

  // Always consume on lookup, valid or not, so a guessed-but-expired code
  // can't be retried indefinitely.
  await supabase.from("email_verification_tokens").delete().eq("tokenHash", tokenHash)

  return new Date(data.expiresAt as string).getTime() > Date.now()
}
