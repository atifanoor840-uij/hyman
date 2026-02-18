"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
import { getAdminToken } from "@/lib/admin-auth"
import { 
  ArrowRightOnRectangleIcon,
  LockClosedIcon
} from "@heroicons/react/24/outline"
import { Loader2 } from "lucide-react"

interface AdminLoginAsUserModalProps {
  isOpen: boolean
  onClose: () => void
  prefilledEmail?: string
  prefilledPassword?: string
}

export default function AdminLoginAsUserModal({ 
  isOpen, 
  onClose, 
  prefilledEmail = "",
  prefilledPassword = ""
}: AdminLoginAsUserModalProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [adminPassword, setAdminPassword] = useState("")
  const [rememberPassword, setRememberPassword] = useState(true)

  // Load cached or prefilled password
  useEffect(() => {
    if (isOpen && typeof window !== 'undefined') {
      // First priority: prefilled password from order
      if (prefilledPassword) {
        setAdminPassword(prefilledPassword)
        // Auto-login if we have both email and password
        if (prefilledEmail) {
          setTimeout(() => handleLogin(), 100)
        }
      } else {
        // Second priority: cached password
        const cached = sessionStorage.getItem('admin_login_as_user_password')
        if (cached) {
          setAdminPassword(cached)
        }
      }
    }
  }, [isOpen, prefilledPassword, prefilledEmail])

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    
    if (!adminPassword) {
      toast({
        title: "Password Required",
        description: "Please enter your admin password",
        variant: "destructive" as any
      })
      return
    }

    setIsLoading(true)

    try {
      const adminToken = getAdminToken()
      
      if (!adminToken) {
        toast({
          title: "Authentication Error",
          description: "Admin session expired. Please login again.",
          variant: "destructive" as any
        })
        router.push('/admin/login')
        onClose()
        return
      }

      // Use the existing signin endpoint with user's email
      const formData = new FormData()
      formData.append('username', prefilledEmail)
      formData.append('password', adminPassword)

      const response = await fetch('https://genz-34f298f57a04.herokuapp.com/auth/signin', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        toast({
          title: "Login Failed",
          description: "Invalid admin password or unable to access user account.",
          variant: "destructive" as any
        })
        setIsLoading(false)
        return
      }

      // Store user token in localStorage
      const token = data.token || data.access_token || data.accessToken
      if (token) {
        // Cache password if remember is checked
        if (rememberPassword && typeof window !== 'undefined') {
          sessionStorage.setItem('admin_login_as_user_password', adminPassword)
        }

        // Clear any existing user data first
        localStorage.removeItem('access_token')
        localStorage.removeItem('authToken')
        localStorage.removeItem('user')
        
        // Clear any cached dashboard data
        const keysToRemove: string[] = []
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && (key.includes('dashboard') || key.includes('orders') || key.includes('cache'))) {
            keysToRemove.push(key)
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key))
        
        // Now set the new user token
        localStorage.setItem('access_token', token)
        localStorage.setItem('authToken', token)
        
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user))
        }

        // Store a flag to indicate this is an admin impersonation session
        localStorage.setItem('admin_impersonation', 'true')
        localStorage.setItem('admin_token_backup', adminToken)
        localStorage.setItem('admin_impersonating_email', prefilledEmail)

        toast({
          title: "Login Successful",
          description: `Logged in as ${prefilledEmail}`,
        })

        // Close modal
        onClose()
        
        // Small delay to ensure localStorage is written
        await new Promise(resolve => setTimeout(resolve, 200))
        
        // Redirect to user dashboard
        router.push('/dashboard')
      } else {
        toast({
          title: "Error",
          description: "No authentication token received",
          variant: "destructive" as any
        })
        setIsLoading(false)
      }
    } catch (error: any) {
      console.error('Login as user error:', error)
      toast({
        title: "Network Error",
        description: error?.message || "Failed to connect to server. Please try again.",
        variant: "destructive" as any
      })
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[450px] bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <ArrowRightOnRectangleIcon className="w-6 h-6 text-gray-600" />
            {isLoading ? 'Logging in as User' : 'Login as User'}
          </DialogTitle>
        </DialogHeader>
        
        {isLoading ? (
          // Loading State
          <div className="space-y-4 py-6">
            <div className="flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-12 h-12 animate-spin text-gray-600" />
              <div className="text-center">
                <p className="text-gray-900 font-medium">Authenticating...</p>
                <p className="text-sm text-gray-500 mt-1">
                  Logging in as <span className="font-semibold">{prefilledEmail}</span>
                </p>
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-800 text-center">
                You will be redirected to the user's dashboard automatically
              </p>
            </div>
          </div>
        ) : (
          // Form State (only shown if no auto-login or auto-login failed)
          <form onSubmit={handleLogin} className="space-y-4 py-4">
            {/* Info Banner */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                Logging in as: <span className="font-semibold">{prefilledEmail}</span>
              </p>
              {!prefilledPassword && (
                <p className="text-xs text-blue-600 mt-1">
                  Enter your admin password to authenticate
                </p>
              )}
            </div>

            {/* Admin Password Field - Only show if no password was prefilled */}
            {!prefilledPassword && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="adminPassword" className="text-sm font-semibold text-gray-700">
                    Admin Password
                  </Label>
                  <div className="relative">
                    <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="adminPassword"
                      type="password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="Enter your admin password"
                      className="pl-10 h-11 bg-white border-gray-300 focus:border-gray-900 focus:ring-gray-900"
                      required
                      disabled={isLoading}
                      autoFocus
                    />
                  </div>
                </div>

                {/* Remember Password Checkbox */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="rememberPassword"
                    checked={rememberPassword}
                    onChange={(e) => setRememberPassword(e.target.checked)}
                    className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
                  />
                  <label htmlFor="rememberPassword" className="text-sm text-gray-700">
                    Remember password for this session
                  </label>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    disabled={isLoading}
                    className="flex-1 h-11 border-gray-300 hover:bg-gray-50"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading || !adminPassword}
                    className="flex-1 h-11 bg-gray-900 hover:bg-gray-800 text-white"
                  >
                    <ArrowRightOnRectangleIcon className="w-4 h-4 mr-2" />
                    Login as User
                  </Button>
                </div>
              </>
            )}
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
