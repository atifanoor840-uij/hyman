import type React from "react"
import "./globals.css"
import { AdminAuthGate } from "@/components/admin/admin-auth-gate"

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="dashboard-authentic min-h-screen">
      <AdminAuthGate>{children}</AdminAuthGate>
    </div>
  )
}

