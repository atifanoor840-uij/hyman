import { NextRequest, NextResponse } from "next/server"
import { withSession } from "@/lib/http/guard"
import { setPayoutStatus } from "@/lib/services/payouts"
import { createNotification } from "@/lib/services/notifications"
import { writeAuditLog } from "@/lib/services/auditLog"
import { createServiceRoleClient } from "@/lib/supabase/service"

export const dynamic = "force-dynamic"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { session, error } = await withSession(["admin", "support"])
  if (error) return error
  const { id } = await params

  let body: { status?: "approved" | "rejected" | "paid"; notes?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ message: "Invalid JSON body." }, { status: 400 })
  }
  if (!body.status || !["approved", "rejected", "paid"].includes(body.status)) {
    return NextResponse.json({ message: "status must be 'approved', 'rejected', or 'paid'." }, { status: 422 })
  }

  const supabase = createServiceRoleClient()
  const { data: payout } = await supabase.from("payouts").select("userId,amount").eq("id", id).maybeSingle()
  if (!payout) return NextResponse.json({ message: "Payout not found." }, { status: 404 })

  await setPayoutStatus(id, body.status, session.sub, body.notes)

  if (payout.userId) {
    await createNotification({
      userId: payout.userId,
      title: `Payout ${body.status}`,
      message: `Your payout request for $${payout.amount} was ${body.status}.`,
      type: "payout",
    })
  }
  await writeAuditLog({
    userId: session.sub,
    userName: session.email,
    targetId: id,
    targetType: "payout",
    action: body.status,
    description: `${session.email} marked payout ${id} as ${body.status}.`,
  })

  return NextResponse.json({ ok: true })
}
