"use client"

import { AdminPageContainer } from "@/components/admin/page-container"
import { OrdersTable } from "@/components/admin/orders-table"

const mockOrders = [
  { id: "ORD-8841", user: "jane@example.com", product: "Phase 2 Challenge", amount: "$499", status: "Pending", date: "2025-01-28", payment: "Visa" },
  { id: "ORD-8839", user: "sara@example.com", product: "Direct Funding", amount: "$999", status: "Completed", date: "2025-01-27", payment: "Mastercard" },
  { id: "ORD-8838", user: "alex@example.com", product: "Phase 1 Challenge", amount: "$299", status: "Completed", date: "2025-01-26", payment: "Visa" },
]

export default function AdminOrdersCardPage() {
  return (
    <AdminPageContainer
      title="Card Payment Orders"
      description="Orders paid with card (Visa, Mastercard, etc.)."
    >
      <OrdersTable title="Card Payment Orders" orders={mockOrders} placeholder="Search card..." />
    </AdminPageContainer>
  )
}
