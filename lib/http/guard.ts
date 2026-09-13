import "server-only"

import { NextResponse } from "next/server"
import { requireSession, SessionError, type SessionPayload, type SessionRole } from "@/lib/auth/session"

export async function withSession(
  roles?: SessionRole[]
): Promise<{ session: SessionPayload; error?: undefined } | { session?: undefined; error: NextResponse }> {
  try {
    const session = await requireSession(roles)
    return { session }
  } catch (err) {
    if (err instanceof SessionError) {
      return { error: NextResponse.json({ message: err.message }, { status: err.status }) }
    }
    throw err
  }
}

export function errorResponse(err: unknown, fallback = "Something went wrong."): NextResponse {
  console.error(err instanceof Error ? err.message : err)
  return NextResponse.json({ message: fallback }, { status: 500 })
}
