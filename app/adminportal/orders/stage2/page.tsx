"use client"

import { AdminPageContainer } from "@/components/admin/page-container"
import { OrdersTable } from "@/components/admin/orders-table"

const mockOrders = [
  { id: "ORD-8835", user: "john@example.com", product: "Phase 2 Challenge", amount: "$499", status: "Stage 2", date: "2025-01-25" },
  { id: "ORD-8832", user: "jane@example.com", product: "Phase 2 Challenge", amount: "$499", status: "Stage 2", date: "2025-01-24" },
  { id: "ORD-8829", user: "mike@example.com", product: "Phase 2 Challenge", amount: "$499", status: "Stage 2", date: "2025-01-23" },
]

export default function AdminOrdersStage2Page() {
  return (
    <AdminPageContainer
      title="Stage 2 Orders"
      description="Orders in Stage 2 evaluation."
    >
      <OrdersTable title="Stage 2 Orders" orders={mockOrders} placeholder="Search Stage 2..." />
    </AdminPageContainer>
  )
}
