"use client"

import { usePathname } from "next/navigation"
import AdminAuthGuard from "@/components/admin-auth-guard"
import AdminLayout from "@/components/admin-layout"

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isLoginPage = pathname === "/admin/login" || pathname?.startsWith("/admin/login/")

  if (isLoginPage) {
    return <>{children}</>
  }

  return (
    <AdminAuthGuard>
      <AdminLayout hideSidebar={false}>
        {children}
      </AdminLayout>
    </AdminAuthGuard>
  )
}
