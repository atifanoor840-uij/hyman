"use client"
import { ReactNode } from "react"

interface AdminLayoutProps {
  children: ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  // No auth guard - all pages accessible without restrictions
  return <>{children}</>
}
