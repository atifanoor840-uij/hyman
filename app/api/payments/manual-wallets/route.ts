import { NextResponse } from "next/server"
import { withSession } from "@/lib/http/guard"
import { getUsdRates, listManualWallets } from "@/lib/services/payments/manualCrypto"

export const dynamic = "force-dynamic"

/** Wallets for the "Scan & pay" checkout option, plus rough USD rates for BTC/ETH. */
export async function GET() {
  const { error } = await withSession()
  if (error) return error

  const wallets = listManualWallets()
  const rates = wallets.length ? await getUsdRates() : {}
  return NextResponse.json({ wallets, rates })
}
