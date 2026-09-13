import { NextResponse } from "next/server"
import { withSession, errorResponse } from "@/lib/http/guard"
import { listAllOrdersDetailed } from "@/lib/services/adminOrders"
import { listAllAccounts } from "@/lib/services/tradingAccounts"

export const dynamic = "force-dynamic"

export async function GET() {
  const { error } = await withSession(["admin", "support"])
  if (error) return error

  try {
  const [orders, accounts] = await Promise.all([listAllOrdersDetailed(), listAllAccounts()])
  const accountsByOrder = new Map<string, typeof accounts>()
  for (const acc of accounts) {
    if (!acc.orderId) continue
    const list = accountsByOrder.get(acc.orderId) ?? []
    list.push(acc)
    accountsByOrder.set(acc.orderId, list)
  }

  return NextResponse.json({
    orders: orders.map((o) => ({ ...o, accounts: accountsByOrder.get(o.id) ?? [] })),
  })
  } catch (err) {
    return errorResponse(err, "Failed to load orders.")
  }
}
