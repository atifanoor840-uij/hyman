"use client"

import { AdminPageContainer } from "@/components/admin/page-container"
import { OrdersTable } from "@/components/admin/orders-table"

const mockOrders = [
  { id: "ORD-8843", user: "sara@example.com", product: "Instant Funding", amount: "$1,499", status: "Completed", date: "2025-01-28" },
  { id: "ORD-8831", user: "alex@example.com", product: "Instant Funding", amount: "$1,499", status: "Completed", date: "2025-01-26" },
  { id: "ORD-8825", user: "david@example.com", product: "Instant Funding", amount: "$1,499", status: "Completed", date: "2025-01-22" },
]

export default function AdminOrdersInstantPage() {
  return (
    <AdminPageContainer
      title="Instant Orders"
      description="Instant funding and express orders."
    >
      <OrdersTable title="Instant Orders" orders={mockOrders} placeholder="Search instant..." />
    </AdminPageContainer>
  )
}
