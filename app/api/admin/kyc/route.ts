import { NextResponse } from "next/server"
import { withSession } from "@/lib/http/guard"
import { getSignedKycUrl, listAllKyc } from "@/lib/services/kyc"

export const dynamic = "force-dynamic"

export async function GET() {
  const { error } = await withSession(["admin", "support"])
  if (error) return error

  const rows = await listAllKyc()
  const withUrls = await Promise.all(
    rows.map(async (row) => ({
      ...row,
      frontUrl: await getSignedKycUrl(row.frontUrl ?? ""),
      backUrl: await getSignedKycUrl(row.backUrl ?? ""),
      selfieUrl: await getSignedKycUrl(row.selfieUrl ?? ""),
      addressUrl: await getSignedKycUrl(row.addressUrl ?? ""),
    }))
  )

  return NextResponse.json({ submissions: withUrls })
}
