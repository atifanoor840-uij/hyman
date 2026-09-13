import { NextRequest, NextResponse } from "next/server"
import { withSession } from "@/lib/http/guard"
import { createPayoutRequest, listPayoutsForUser } from "@/lib/services/payouts"
import { findAccountById } from "@/lib/services/tradingAccounts"
import { getKycForUser } from "@/lib/services/kyc"
import { writeAuditLog } from "@/lib/services/auditLog"

export const dynamic = "force-dynamic"

const DEFAULT_PROFIT_SPLIT_PERCENT = 80

export async function GET() {
  const { session, error } = await withSession()
  if (error) return error

  const payouts = await listPayoutsForUser(session.sub)
  return NextResponse.json({ payouts })
}

export async function POST(req: NextRequest) {
  const { session, error } = await withSession()
  if (error) return error

  let body: { accountId?: string; amount?: number; paymentMethod?: string; paymentDetails?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ message: "Invalid JSON body." }, { status: 400 })
  }

  const accountId = (body.accountId ?? "").trim()
  const amount = Number(body.amount)
  const paymentMethod = (body.paymentMethod ?? "").trim()
  const paymentDetails = (body.paymentDetails ?? "").trim()

  if (!accountId || !Number.isFinite(amount) || amount <= 0 || !paymentMethod || !paymentDetails) {
    return NextResponse.json(
      { message: "accountId, a positive amount, paymentMethod, and paymentDetails are required." },
      { status: 422 }
    )
  }

  const account = await findAccountById(accountId)
  if (!account || account.userId !== session.sub) {
    return NextResponse.json({ message: "Account not found." }, { status: 404 })
  }
  if (account.phase !== "funded") {
    return NextResponse.json({ message: "Only funded accounts are eligible for payouts." }, { status: 403 })
  }

  const kyc = await getKycForUser(session.sub)
  if (kyc?.status !== "approved") {
    return NextResponse.json({ message: "Complete KYC verification before requesting a payout." }, { status: 403 })
  }

  if (amount > account.totalPl) {
    return NextResponse.json({ message: "Payout amount exceeds this account's earned profit." }, { status: 400 })
  }

  const payout = await createPayoutRequest({
    userId: session.sub,
    accountId,
    amount,
    profitSplitPercent: DEFAULT_PROFIT_SPLIT_PERCENT,
    paymentMethod,
    paymentDetails,
  })

  await writeAuditLog({
    userId: session.sub,
    userName: session.email,
    targetId: payout.id,
    targetType: "payout",
    action: "request",
    description: `${session.email} requested a payout of $${amount} from account ${accountId}.`,
  })

  return NextResponse.json({ payout }, { status: 201 })
}
