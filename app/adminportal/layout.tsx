import type React from "react"
import type { Metadata } from "next"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"

export const metadata: Metadata = {
  title: "Admin Portal — FxGenz",
  description: "Manage users, orders, KYC, referrals, coupons, withdrawals, and email.",
}

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ThemeProvider defaultTheme="light" storageKey="fxgenz-admin-theme">
      {children}
    </ThemeProvider>
  )
}
