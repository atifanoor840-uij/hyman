import "server-only"

import bcrypt from "bcryptjs"
import { createHash, timingSafeEqual } from "crypto"

const SALT_ROUNDS = 12

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

function isBcryptHash(hash: string): boolean {
  return /^\$2[aby]\$/.test(hash)
}

function legacySha256(password: string): string {
  return createHash("sha256").update(password).digest("hex")
}

function safeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  try {
    return timingSafeEqual(Buffer.from(a, "hex"), Buffer.from(b, "hex"))
  } catch {
    return false
  }
}

/**
 * Verifies a password against a stored hash. Supports two formats:
 *  - bcrypt ($2a$/$2b$/$2y$ prefix) — used for every hash created by this app.
 *  - legacy sha256(password), no salt, 64 hex chars — inherited from the
 *    271 pre-existing accounts already in this Supabase project. Never
 *    produced for new hashes; see isLegacyHash() for opportunistic upgrade.
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  if (isBcryptHash(hash)) {
    return bcrypt.compare(password, hash)
  }
  return safeEqualHex(legacySha256(password), hash.toLowerCase())
}

/** True if `hash` is the legacy sha256 format rather than bcrypt. */
export function isLegacyHash(hash: string): boolean {
  return !isBcryptHash(hash)
}
