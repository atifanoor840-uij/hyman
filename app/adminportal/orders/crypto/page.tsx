"use client"

import { AdminPageContainer } from "@/components/admin/page-container"
import { OrdersTable } from "@/components/admin/orders-table"

const mockOrders = [
  { id: "ORD-8844", user: "john@example.com", product: "Phase 1 Challenge", amount: "$299", status: "Completed", date: "2025-01-28", payment: "BTC" },
  { id: "ORD-8840", user: "mike@example.com", product: "Phase 1 Challenge", amount: "$299", status: "Completed", date: "2025-01-27", payment: "ETH" },
  { id: "ORD-8836", user: "sara@example.com", product: "Direct Funding", amount: "$999", status: "Completed", date: "2025-01-25", payment: "USDT" },
]

export default function AdminOrdersCryptoPage() {
  return (
    <AdminPageContainer
      title="Crypto Orders"
      description="Orders paid with cryptocurrency."
    >
      <OrdersTable title="Crypto Orders" orders={mockOrders} placeholder="Search crypto..." />
    </AdminPageContainer>
  )
}
