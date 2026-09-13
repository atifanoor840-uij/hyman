import { NextRequest, NextResponse } from "next/server"
import { withSession } from "@/lib/http/guard"
import { markNotificationRead } from "@/lib/services/notifications"

export const dynamic = "force-dynamic"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { session, error } = await withSession()
  if (error) return error
  const { id } = await params

  await markNotificationRead(id, session.sub)
  return NextResponse.json({ ok: true })
}
