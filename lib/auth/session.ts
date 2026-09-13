import "server-only"

import { cookies } from "next/headers"
import {
  SESSION_COOKIE_NAME,
  createSessionToken,
  verifySessionToken,
  type SessionPayload,
  type SessionRole,
} from "./jwt"

export type { SessionPayload, SessionRole }

/**
 * Sign a new session and set it as an httpOnly cookie.
 * Call only from a Route Handler or Server Action (cookies() is read-only
 * during Server Component render).
 */
export async function createSession(
  payload: SessionPayload,
  options: { rememberMe?: boolean } = {}
): Promise<void> {
  const { token, maxAge } = await createSessionToken(payload, options)
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge,
  })
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}

/** Read + verify the current session. Safe to call from Server Components. */
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value
  if (!token) return null
  return verifySessionToken(token)
}

export class SessionError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = "SessionError"
    this.status = status
  }
}

/** Throws SessionError(401) if unauthenticated, or SessionError(403) if role-gated and mismatched. */
export async function requireSession(roles?: SessionRole[]): Promise<SessionPayload> {
  const session = await getSession()
  if (!session) throw new SessionError("Not signed in.", 401)
  if (roles && !roles.includes(session.role)) throw new SessionError("Not authorized.", 403)
  return session
}
