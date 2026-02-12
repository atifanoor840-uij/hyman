"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { getAdminAuthState } from "@/lib/admin-auth"

type AdminSection = 'email-marketing' | 'order-management' | 'container-management' | null

interface AdminSectionGuardProps {
  children: React.ReactNode
  allowedSections: AdminSection[]
  redirectTo?: string
}

/**
 * Guards admin pages based on selected section
 * Only allows access if the current selected section matches allowed sections
 */
export default function AdminSectionGuard({ 
  children, 
  allowedSections,
  redirectTo = '/admin'
}: AdminSectionGuardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check authentication first
    const { isAuthenticated } = getAdminAuthState()
    
    if (!isAuthenticated) {
      router.push('/admin/login')
      return
    }

    // Get selected section from localStorage
    if (typeof window !== 'undefined') {
      const selectedSection = localStorage.getItem('admin_selected_section') as AdminSection
      
      // If no section is selected, allow access (for initial selection)
      if (!selectedSection) {
        setIsAuthorized(true)
        setIsLoading(false)
        return
      }

      // Check if selected section is in allowed sections
      if (allowedSections.includes(selectedSection)) {
        setIsAuthorized(true)
      } else {
        // Redirect to admin dashboard if not authorized
        setIsAuthorized(false)
        router.push(redirectTo)
      }
    }
    
    setIsLoading(false)
  }, [pathname, allowedSections, redirectTo, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  if (!isAuthorized) {
    return null // Will redirect
  }

  return <>{children}</>
}
