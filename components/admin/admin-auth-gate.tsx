"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { getAuthToken } from "@/lib/auth-utils"
import { getAdmin2faVerifiedAt } from "./admin-auth"

export function AdminAuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const isAdmin = pathname.startsWith("/admin")
    if (!isAdmin) return

    const allow =
      pathname.startsWith("/admin/login") ||
      pathname.startsWith("/admin/logout") ||
      pathname.startsWith("/admin/_") // future-proof: internal routes

    if (allow) return

    const token = getAuthToken()
    const verifiedAt = getAdmin2faVerifiedAt()

    if (!token || !verifiedAt) {
      const search = typeof window !== "undefined" ? window.location.search : ""
      const next = `${pathname}${search || ""}`
      router.replace(`/admin/login?next=${encodeURIComponent(next)}`)
    }
  }, [pathname, router])

  return <>{children}</>
}

