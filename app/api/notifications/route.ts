import { NextResponse } from "next/server"
import { withSession } from "@/lib/http/guard"
import { listNotificationsForUser } from "@/lib/services/notifications"

export const dynamic = "force-dynamic"

export async function GET() {
  const { session, error } = await withSession()
  if (error) return error

  const notifications = await listNotificationsForUser(session.sub)
  return NextResponse.json({ notifications })
}
