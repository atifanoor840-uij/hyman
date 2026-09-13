import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { findUserById, toPublicUser } from "@/lib/services/users"

export const dynamic = "force-dynamic"

export async function GET() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ message: "Not signed in." }, { status: 401 })
  }

  const user = await findUserById(session.sub)
  if (!user) {
    return NextResponse.json({ message: "Not signed in." }, { status: 401 })
  }

  return NextResponse.json({ user: toPublicUser(user) })
}
