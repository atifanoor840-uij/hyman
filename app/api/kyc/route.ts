import { NextRequest, NextResponse } from "next/server"
import { withSession } from "@/lib/http/guard"
import { getKycForUser, submitKyc, uploadKycDocument } from "@/lib/services/kyc"

export const dynamic = "force-dynamic"

export async function GET() {
  const { session, error } = await withSession()
  if (error) return error

  const kyc = await getKycForUser(session.sub)
  return NextResponse.json({
    kyc: kyc ? { status: kyc.status, documentType: kyc.documentType, rejectReason: kyc.rejectReason } : null,
  })
}

export async function POST(req: NextRequest) {
  const { session, error } = await withSession()
  if (error) return error

  const form = await req.formData()
  const documentType = String(form.get("documentType") ?? "").trim()
  if (!documentType) {
    return NextResponse.json({ message: "documentType is required." }, { status: 422 })
  }

  const front = form.get("front")
  const back = form.get("back")
  const selfie = form.get("selfie")
  const address = form.get("address")

  if (!(front instanceof File) || !(selfie instanceof File)) {
    return NextResponse.json({ message: "A front document image and a selfie are required." }, { status: 422 })
  }

  const [frontPath, backPath, selfiePath, addressPath] = await Promise.all([
    uploadKycDocument(session.sub, "front", front),
    back instanceof File ? uploadKycDocument(session.sub, "back", back) : Promise.resolve(null),
    uploadKycDocument(session.sub, "selfie", selfie),
    address instanceof File ? uploadKycDocument(session.sub, "address", address) : Promise.resolve(null),
  ])

  await submitKyc({ userId: session.sub, documentType, frontPath, backPath, selfiePath, addressPath })

  return NextResponse.json({ ok: true })
}
