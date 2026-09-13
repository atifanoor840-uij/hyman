import "server-only"

import { SignJWT, jwtVerify } from "jose"

// Edge-safe (no next/headers) — usable from middleware.ts as well as
// Route Handlers/Server Components. Cookie plumbing lives in lib/auth/session.ts.

export const SESSION_COOKIE_NAME = "genzprop_session"

export type SessionRole = "customer" | "collaborator" | "admin" | "support"

export interface SessionPayload {
  sub: string // users.id
  email: string
  role: SessionRole
  [key: string]: unknown
}

export const DEFAULT_MAX_AGE_SECONDS = 60 * 60 * 24 * 7 // 7 days
export const REMEMBER_MAX_AGE_SECONDS = 60 * 60 * 24 * 30 // 30 days

function getSecretKey(): Uint8Array {
  const secret = process.env.AUTH_SESSION_SECRET
  if (!secret) {
    throw new Error("Missing AUTH_SESSION_SECRET environment variable.")
  }
  return new TextEncoder().encode(secret)
}

export async function createSessionToken(
  payload: SessionPayload,
  options: { rememberMe?: boolean } = {}
): Promise<{ token: string; maxAge: number }> {
  const maxAge = options.rememberMe ? REMEMBER_MAX_AGE_SECONDS : DEFAULT_MAX_AGE_SECONDS
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + maxAge)
    .sign(getSecretKey())
  return { token, maxAge }
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey())
    if (typeof payload.sub !== "string" || typeof payload.role !== "string") return null
    return payload as unknown as SessionPayload
  } catch {
    return null
  }
}
