"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { getAdminAuthState, clearAdminAuthState } from "@/lib/admin-auth"

interface SessionTimeoutOptions {
  warningTime?: number // minutes before expiry to show warning
  checkInterval?: number // seconds between checks
}

export function useSessionTimeout(options: SessionTimeoutOptions = {}) {
  const { warningTime = 5, checkInterval = 30 } = options
  const router = useRouter()
  const { toast } = useToast()
  const [timeUntilExpiry, setTimeUntilExpiry] = useState<number | null>(null)

  useEffect(() => {
    const checkSession = () => {
      const { isAuthenticated, token } = getAdminAuthState()
      
      if (!isAuthenticated || !token) {
        clearAdminAuthState()
        router.push('/admin/login')
        return
      }

      try {
        // Parse JWT token to get expiry time
        const payload = JSON.parse(atob(token.split('.')[1]))
        const currentTime = Math.floor(Date.now() / 1000)
        const expiryTime = payload.exp
        
        if (expiryTime && expiryTime < currentTime) {
          // Token is expired
          clearAdminAuthState()
          toast({ 
            title: "Session expired", 
            description: "Your session has expired. Please login again.", 
            variant: "destructive" 
          })
          router.push('/admin/login')
          return
        }

        // Calculate time until expiry
        const timeLeft = expiryTime - currentTime
        setTimeUntilExpiry(timeLeft)

        // Show warning if session expires soon
        if (timeLeft <= warningTime * 60) {
          const minutesLeft = Math.ceil(timeLeft / 60)
          toast({
            title: "Session expiring soon",
            description: `Your session will expire in ${minutesLeft} minute(s). Please save your work.`,
            variant: "destructive"
          })
        }
      } catch (error) {
        // If token parsing fails, treat as invalid
        clearAdminAuthState()
        router.push('/admin/login')
      }
    }

    // Check immediately
    checkSession()

    // Check periodically
    const interval = setInterval(checkSession, checkInterval * 1000)

    // Check when page becomes visible
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
  }, [router, toast, warningTime, checkInterval])

  return { timeUntilExpiry }
}






