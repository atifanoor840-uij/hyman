"use client"

import { AdminPageContainer } from "@/components/admin/page-container"
import { OrdersTable } from "@/components/admin/orders-table"

const mockOrders = [
  { id: "ORD-8842", user: "john@example.com", product: "Live Account", amount: "—", status: "Live", date: "2025-01-28" },
  { id: "ORD-8839", user: "sara@example.com", product: "Live Account", amount: "—", status: "Live", date: "2025-01-27" },
  { id: "ORD-8830", user: "jane@example.com", product: "Live Account", amount: "—", status: "Live", date: "2025-01-25" },
]

export default function AdminOrdersLivePage() {
  return (
    <AdminPageContainer
      title="Live Orders"
      description="Orders with active live trading accounts."
    >
      <OrdersTable title="Live Orders" orders={mockOrders} placeholder="Search live..." />
    </AdminPageContainer>
  )
}
