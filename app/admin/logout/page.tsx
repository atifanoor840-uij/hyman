"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { clearAuth } from "@/lib/auth-utils"
import { clearAdmin2fa } from "@/components/admin/admin-auth"
import { signoutRequest } from "@/lib/api/auth-client"

export default function AdminLogoutPage() {
  const router = useRouter()

  useEffect(() => {
    signoutRequest().finally(() => {
      clearAuth()
      clearAdmin2fa()
      router.replace("/admin/login")
    })
  }, [router])

  return null
}
