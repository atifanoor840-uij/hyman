"use client"

import { AdminPageContainer } from "@/components/admin/page-container"
import { OrdersTable } from "@/components/admin/orders-table"

const mockOrders = [
  { id: "ORD-8842", user: "john@example.com", product: "Phase 1 Challenge", amount: "$299", status: "Delivered", date: "2025-01-28" },
  { id: "ORD-8839", user: "sara@example.com", product: "Direct Funding", amount: "$999", status: "Delivered", date: "2025-01-27" },
  { id: "ORD-8838", user: "alex@example.com", product: "Phase 1 Challenge", amount: "$299", status: "Delivered", date: "2025-01-26" },
]

export default function AdminOrdersDeliveredPage() {
  return (
    <AdminPageContainer
      title="Delivered Orders"
      description="Orders that have been delivered to customers."
    >
      <OrdersTable title="Delivered Orders" orders={mockOrders} placeholder="Search delivered..." />
    </AdminPageContainer>
  )
}
