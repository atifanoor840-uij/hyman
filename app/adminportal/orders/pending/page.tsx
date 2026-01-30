"use client"

import { AdminPageContainer } from "@/components/admin/page-container"
import { OrdersTable } from "@/components/admin/orders-table"

const mockOrders = [
  { id: "ORD-8841", user: "jane@example.com", product: "Phase 2 Challenge", amount: "$499", status: "Pending", date: "2025-01-28" },
  { id: "ORD-8840", user: "mike@example.com", product: "Phase 1 Challenge", amount: "$299", status: "Pending", date: "2025-01-28" },
  { id: "ORD-8837", user: "david@example.com", product: "Direct Funding", amount: "$999", status: "Pending", date: "2025-01-27" },
]

export default function AdminOrdersPendingPage() {
  return (
    <AdminPageContainer
      title="Pending Orders"
      description="Orders awaiting payment or processing."
    >
      <OrdersTable title="Pending Orders" orders={mockOrders} placeholder="Search pending..." />
    </AdminPageContainer>
  )
}
