"use client"

import { AdminPageContainer } from "@/components/admin/page-container"
import { OrdersTable } from "@/components/admin/orders-table"

const mockOrders = [
  { id: "ORD-8842", user: "john@example.com", product: "Phase 1 Challenge", amount: "$299", status: "Passed", date: "2025-01-28" },
  { id: "ORD-8838", user: "alex@example.com", product: "Phase 1 Challenge", amount: "$299", status: "Passed", date: "2025-01-26" },
  { id: "ORD-8833", user: "mike@example.com", product: "Phase 2 Challenge", amount: "$499", status: "Passed", date: "2025-01-24" },
]

export default function AdminOrdersPassedPage() {
  return (
    <AdminPageContainer
      title="Passed Orders"
      description="Orders that passed evaluation."
    >
      <OrdersTable title="Passed Orders" orders={mockOrders} placeholder="Search passed..." />
    </AdminPageContainer>
  )
}
