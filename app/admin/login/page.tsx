"use client"
import { Suspense, useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { getApiBaseUrl } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface LoginData {
  email: string
  password: string
  two_factor_code: string
}

function AdminLoginContent() {
  const [step, setStep] = useState<1 | 2>(1) // Step 1: Email/Password, Step 2: 2FA
  const [loginData, setLoginData] = useState<LoginData>({
    email: "",
    password: "",
    two_factor_code: ""
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isRateLimited, setIsRateLimited] = useState(false)
  const [cooldownTime, setCooldownTime] = useState(0)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  
  // Get section from URL params
  const sectionParam = searchParams?.get('section')

  const handleInputChange = (field: keyof LoginData, value: string) => {
    let processedValue = value
    
    // Format validation for 2FA code
    if (field === 'two_factor_code') {
      // Only allow digits and limit to 6 characters
      processedValue = value.replace(/[^0-9]/g, '').slice(0, 6)
    }
    
    setLoginData(prev => ({
      ...prev,
      [field]: processedValue
    }))
    // Clear error when user starts typing
    if (error) setError(null)
  }

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate email and password
    if (!loginData.email || !loginData.password) {
      setError("Please enter both email and password")
      return
    }

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginData.email)) {
      setError("Please enter a valid email address")
      return
    }

    // If validation passes, move to step 2
    setError(null)
    setStep(2)
  }

  const handleBackToStep1 = () => {
    setStep(1)
    setError(null)
    setLoginData(prev => ({
      ...prev,
      two_factor_code: ""
    }))
  }

  const startCooldownTimer = () => {
    const timer = setInterval(() => {
      setCooldownTime((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          setIsRateLimited(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate 2FA code format
    if (!/^\d{6}$/.test(loginData.two_factor_code)) {
      setError("Please enter a valid 6-digit verification code")
      return
    }
    
    setIsLoading(true)
    setError(null)

    try {
      const adminAuthPath = process.env.NEXT_PUBLIC_ADMIN_AUTH_PATH || "/admin/auth/signin-2fa"
      const loginUrl = `${getApiBaseUrl()}${adminAuthPath}`
      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(loginData)
      })

      let data: Record<string, unknown> = {}
      try {
        const text = await response.text()
        if (text) data = JSON.parse(text) as Record<string, unknown>
      } catch {
        // Response is not JSON (e.g. HTML 404 page)
        const msg = response.status === 404
          ? `Admin login endpoint not found (404). Tried: ${loginUrl} — Set NEXT_PUBLIC_ADMIN_AUTH_PATH in .env.local if your backend uses a different path.`
          : `Server error: ${response.status} ${response.statusText}`
        throw new Error(msg)
      }

      const errMsg = (v: unknown) => (typeof v === 'string' ? v : undefined)
      if (!response.ok) {
        // Handle different error scenarios
        if (response.status === 401) {
          throw new Error(errMsg(data.message) || errMsg(data.error) || 'Invalid credentials or 2FA code')
        } else if (response.status === 400) {
          throw new Error(errMsg(data.message) || errMsg(data.error) || 'Invalid request format')
        } else if (response.status === 403) {
          throw new Error(errMsg(data.message) || errMsg(data.error) || 'Access forbidden')
        } else if (response.status === 429) {
          setIsRateLimited(true)
          setCooldownTime(300) // 5 minutes cooldown
          startCooldownTimer()
          throw new Error('Too many login attempts. Please wait 5 minutes before trying again.')
        } else {
          throw new Error(errMsg(data.message) || errMsg(data.error) || `Server error: ${response.status}`)
        }
      }

      // Store admin auth data
      if (data.access_token && data.admin_data) {
        const token = typeof data.access_token === 'string' ? data.access_token : String(data.access_token)
        const adminData = data.admin_data as Record<string, unknown>
        localStorage.setItem("admin_access_token", token)
        localStorage.setItem("admin_user", JSON.stringify(data.admin_data))
        
        const name = typeof adminData.full_name === 'string' ? adminData.full_name
          : typeof adminData.username === 'string' ? adminData.username
          : typeof adminData.email === 'string' ? adminData.email
          : 'Admin'
        toast({
          title: "Login successful",
          description: `Welcome back, ${name}!`
        })
        
        // Preload all admin data in the background
        import('@/lib/admin-data-preload').then(({ preloadAdminData }) => {
          preloadAdminData().then((result) => {
            console.log('Admin data preload completed:', result)
            if (result.failed > 0) {
              console.warn('Some admin data failed to preload:', result.errors)
            }
          }).catch((error) => {
            console.error('Error preloading admin data:', error)
          })
        })
        
        // Redirect based on section
        const section = sectionParam || localStorage.getItem('admin_selected_section')
        if (section === 'email-marketing') {
          router.push('/admin/email-sender')
        } else if (section === 'container-management') {
          router.push('/admin/container')
        } else if (section === 'order-management') {
          router.push('/admin/orders')
        } else {
          router.push("/admin")
        }
      } else if (data.token && data.user) {
        // Handle alternative response format
        const altToken = typeof data.token === 'string' ? data.token : String(data.token)
        const user = data.user as Record<string, unknown>
        localStorage.setItem("admin_access_token", altToken)
        localStorage.setItem("admin_user", JSON.stringify(data.user))
        
        const userName = typeof user.name === 'string' ? user.name : typeof user.email === 'string' ? user.email : 'Admin'
        toast({
          title: "Login successful",
          description: `Welcome back, ${userName}!`
        })
        
        // Preload all admin data in the background
        import('@/lib/admin-data-preload').then(({ preloadAdminData }) => {
          preloadAdminData().then((result) => {
            console.log('Admin data preload completed:', result)
            if (result.failed > 0) {
              console.warn('Some admin data failed to preload:', result.errors)
            }
          }).catch((error) => {
            console.error('Error preloading admin data:', error)
          })
        })
        
        // Redirect based on section
        const section = sectionParam || localStorage.getItem('admin_selected_section')
        if (section === 'email-marketing') {
          router.push('/admin/email-sender')
        } else if (section === 'container-management') {
          router.push('/admin/container')
        } else if (section === 'order-management') {
          router.push('/admin/orders')
        } else {
          router.push("/admin")
        }
      } else {
        console.log('Response data:', data)
        throw new Error('Invalid response format from server')
      }
    } catch (error: any) {
      console.error('Login error:', error)
      const errorMessage = error.message || 'An error occurred during login'
      setError(errorMessage)
      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const isStep1Valid = loginData.email && loginData.password && !isRateLimited
  const isStep2Valid = /^\d{6}$/.test(loginData.two_factor_code) && !isRateLimited

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 p-4 relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}></div>
      </div>
      
      <Card className="w-full max-w-md border-0 bg-white shadow-2xl relative z-10 rounded-2xl overflow-hidden">
        {/* Card accent line */}
        <div className="h-1 bg-gradient-to-r from-slate-600 via-slate-500 to-slate-600"></div>
        
        <CardHeader className="text-center space-y-5 pb-8 pt-10 px-8">
          <div className="space-y-3">
            <div className="flex justify-center mb-4">
              <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center border border-slate-600/50 shadow-lg">
                <span className="text-white font-bold text-xl">FX</span>
              </div>
            </div>
            <CardTitle className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
              fxgenzy Admin
            </CardTitle>
            <div className="mt-4 h-0.5 w-16 bg-slate-200 mx-auto rounded-full"></div>
          </div>
          <CardDescription className="text-gray-600 text-base mt-6 font-normal">
            {step === 1 
              ? "Enter your admin credentials to continue" 
              : "Enter your 2FA verification code"}
          </CardDescription>
          {step === 2 && (
            <div className="mt-4">
              <div className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 rounded-full">
                <span className="text-slate-700 text-sm font-medium">Step 2 of 2 — Security Verification</span>
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent className="px-8 pb-10">
          {step === 1 ? (
            <form onSubmit={handleStep1Submit} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-50/80 border-l-4 border-red-500 rounded-r-lg backdrop-blur-sm">
                  <p className="text-red-700 text-sm font-medium">{error}</p>
                </div>
              )}

              <div className="space-y-2.5">
                <Label htmlFor="email" className="text-sm font-semibold text-gray-800 tracking-wide">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={loginData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                  disabled={isLoading}
                  className="bg-white border-gray-300 focus:border-slate-500 focus:ring-2 focus:ring-slate-200 text-gray-900 placeholder:text-gray-400 h-12 text-base transition-all duration-200 shadow-sm"
                  autoFocus
                />
              </div>

              <div className="space-y-2.5">
                <Label htmlFor="password" className="text-sm font-semibold text-gray-800 tracking-wide">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={loginData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    required
                    disabled={isLoading}
                    className="bg-white border-gray-300 focus:border-slate-500 focus:ring-2 focus:ring-slate-200 text-gray-900 placeholder:text-gray-400 pr-12 h-12 text-base transition-all duration-200 shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-slate-600 disabled:opacity-50 transition-colors duration-200"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={!isStep1Valid || isLoading}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold h-12 text-base disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : isRateLimited ? (
                    `Try again in ${formatTime(cooldownTime)}`
                  ) : (
                    "Continue"
                  )}
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleStep2Submit} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-50/80 border-l-4 border-red-500 rounded-r-lg backdrop-blur-sm">
                  <p className="text-red-700 text-sm font-medium">{error}</p>
                </div>
              )}

              <div className="p-5 bg-slate-50 border-l-4 border-slate-500 rounded-r-lg">
                <p className="text-slate-800 text-sm font-semibold mb-1.5">
                  Two-Factor Authentication
                </p>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Enter the 6-digit code from your authenticator app
                </p>
              </div>

              <div className="space-y-2.5">
                <Label htmlFor="two_factor_code" className="text-sm font-semibold text-gray-800 tracking-wide">
                  2FA Verification Code
                </Label>
                <Input
                  id="two_factor_code"
                  type="text"
                  placeholder="000000"
                  value={loginData.two_factor_code}
                  onChange={(e) => handleInputChange('two_factor_code', e.target.value)}
                  required
                  disabled={isLoading}
                  maxLength={6}
                  className="bg-white border-gray-300 focus:border-slate-500 focus:ring-2 focus:ring-slate-200 text-gray-900 placeholder:text-gray-400 text-center text-3xl tracking-[0.5em] font-mono h-16 transition-all duration-200 shadow-sm"
                  autoFocus
                />
              </div>

              <div className="flex gap-4 pt-2">
                <Button
                  type="button"
                  onClick={handleBackToStep1}
                  disabled={isLoading}
                  variant="outline"
                  className="flex-1 border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700 hover:text-gray-900 h-12 text-base font-semibold transition-all duration-200"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  disabled={!isStep2Valid || isLoading}
                  className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md h-12 text-base"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Signing in...
                    </>
                  ) : isRateLimited ? (
                    `Try again in ${formatTime(cooldownTime)}`
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    }>
      <AdminLoginContent />
    </Suspense>
  )
}
