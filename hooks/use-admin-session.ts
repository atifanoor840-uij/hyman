"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { getAdminAuthState } from "@/lib/admin-auth"

export function useAdminSession() {
  const router = useRouter()

  useEffect(() => {
    const checkSession = () => {
      const { isAuthenticated } = getAdminAuthState()
      
      if (!isAuthenticated) {
        // Clear any remaining auth data
        localStorage.removeItem('admin_access_token')
        localStorage.removeItem('admin_user')
        localStorage.removeItem('admin_temp_credentials')
        
        // Redirect to login
        router.push('/admin/login')
      }
    }

    // Check session immediately
    checkSession()

    // Check session every 30 seconds
    const interval = setInterval(checkSession, 30000)

    // Check session when page becomes visible (user switches back to tab)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkSession()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [router])
}






