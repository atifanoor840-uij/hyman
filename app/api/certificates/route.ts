import { NextResponse } from "next/server"
import { withSession } from "@/lib/http/guard"
import { listCertificatesForUser } from "@/lib/services/certificates"

export const dynamic = "force-dynamic"

export async function GET() {
  const { session, error } = await withSession()
  if (error) return error

  const certificates = await listCertificatesForUser(session.sub)
  return NextResponse.json({ certificates })
}
