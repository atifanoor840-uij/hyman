"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getAdminAuthState, clearAdminAuthState } from "@/lib/admin-auth"
import { Loader2 } from "lucide-react"

interface AdminAuthGuardProps {
  children: React.ReactNode
  requiredPermissions?: string[]
  fallback?: React.ReactNode
}

export default function AdminAuthGuard({ 
  children, 
  requiredPermissions = [],
  fallback 
}: AdminAuthGuardProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { isAuthenticated, user, token } = getAdminAuthState()
        
        if (!isAuthenticated || !user || !token) {
          setAuthError("Authentication required")
          setIsAuthorized(false)
          setIsLoading(false)
          // Redirect to login instead of showing access denied page
          clearAdminAuthState()
          router.push('/admin/login')
          return
        }

        // Check if token is expired (basic check)
        try {
          const payload = JSON.parse(atob(token.split('.')[1]))
          const currentTime = Math.floor(Date.now() / 1000)
          
          if (payload.exp && payload.exp < currentTime) {
            clearAdminAuthState()
            setAuthError("Session expired")
            setIsAuthorized(false)
            setIsLoading(false)
            // Redirect to login instead of showing access denied page
            router.push('/admin/login')
            return
          }
        } catch (tokenError) {
          // If token parsing fails, treat as invalid
          clearAdminAuthState()
          setAuthError("Invalid session")
          setIsAuthorized(false)
          setIsLoading(false)
          // Redirect to login instead of showing access denied page
          router.push('/admin/login')
          return
        }

        // Check permissions if required
        if (requiredPermissions.length > 0) {
          const userPermissions = Array.isArray(user.permissions) 
            ? user.permissions 
            : user.permissions ? [user.permissions] : []
          
          const hasAllPermissions = requiredPermissions.every(permission => 
            userPermissions.includes(permission) || user.role === 'super_admin'
          )
          
          if (!hasAllPermissions) {
            setAuthError("Insufficient permissions")
            setIsAuthorized(false)
            setIsLoading(false)
            // Redirect to login instead of showing access denied page
            router.push('/admin/login')
            return
          }
        }

        setIsAuthorized(true)
        setAuthError(null)
      } catch (error) {
        console.error('Auth check error:', error)
        setAuthError("Authentication error")
        setIsAuthorized(false)
        // Redirect to login instead of showing access denied page
        clearAdminAuthState()
        router.push('/admin/login')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [requiredPermissions, router])

  const handleLogout = () => {
    clearAdminAuthState()
    router.push('/admin/login')
  }

  const handleRetry = () => {
    setIsLoading(true)
    setAuthError(null)
    // Re-trigger the auth check
    setTimeout(() => {
      const { isAuthenticated, user, token } = getAdminAuthState()
      if (isAuthenticated && user && token) {
        setIsAuthorized(true)
        setAuthError(null)
      } else {
        setAuthError("Authentication required")
        setIsAuthorized(false)
      }
      setIsLoading(false)
    }, 500)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-red-950/20 to-background">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-red-500 mx-auto mb-4" />
          <p className="text-muted-foreground">Verifying admin access...</p>
        </div>
      </div>
    )
  }

  if (!isAuthorized) {
    if (fallback) {
      return <>{fallback}</>
    }

    // Show loading while redirecting to login
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-red-950/20 to-background">
        <div className="text-center">
          <p className="text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}






