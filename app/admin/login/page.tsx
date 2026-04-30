"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ApiClientError } from "@/lib/api/client"
import { adminSignin2fa } from "@/lib/api/admin-auth"
import { sanitizeInput, isValidEmail, setAuthToken } from "@/lib/auth-utils"
import { setAdmin2faVerifiedNow } from "@/components/admin/admin-auth"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { Shield, Mail, Lock, ArrowLeft, ArrowRight, Loader2, Eye, EyeOff } from "lucide-react"

type Step = 1 | 2

export default function AdminLoginPage() {
  const router = useRouter()
  const [nextUrl, setNextUrl] = useState("/admin/overview")

  const [step, setStep] = useState<Step>(1)

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const [otp, setOtp] = useState("")

  useEffect(() => {
    try {
      const next = new URLSearchParams(window.location.search).get("next")
      if (next && next.startsWith("/")) setNextUrl(next)
    } catch {
      // ignore
    }
  }, [])

  const submitCredentials = async () => {
    setError(null)
    const e = sanitizeInput(email).trim()
    if (!e) return setError("Enter your admin email.")
    if (!isValidEmail(e)) return setError("Use a valid email address.")
    if (!password || password.length < 8) return setError("Enter your password (min 8 characters).")

    // Step 1 only collects credentials; step 2 submits them with 2FA code.
    setStep(2)
  }

  const submit2fa = async () => {
    setError(null)
    const e = sanitizeInput(email).trim()
    if (!e) return setError("Enter your admin email.")
    if (!isValidEmail(e)) return setError("Use a valid email address.")
    if (!password || password.length < 8) return setError("Enter your password (min 8 characters).")

    const code = otp.trim()
    if (!/^\d{6}$/.test(code)) {
      setError("Enter the 6‑digit 2FA code.")
      return
    }

    setLoading(true)
    try {
      const res = await adminSignin2fa({
        email: e,
        password,
        two_factor_code: code,
      })
      const token = res.access_token || res.token
      if (!token) {
        setError("Signed in but no access token was returned.")
        return
      }
      setAuthToken(token, remember)
      setAdmin2faVerifiedNow()
      router.replace(nextUrl)
    } catch (e) {
      if (e instanceof ApiClientError) {
        setError(e.message || "2FA sign-in failed.")
      } else {
        setError("2FA sign-in failed. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/" className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
            ← Back to site
          </Link>
          <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/70 px-3 py-1.5 text-xs font-semibold text-muted-foreground">
            <Shield className="h-4 w-4" />
            Admin sign in
          </div>
        </div>

        <Card className="rounded-3xl border border-border/80 bg-card shadow-sm overflow-hidden">
          <div className="border-b border-border/80 bg-muted/20 px-6 py-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Step {step} of 2
                </p>
                <h1 className="mt-1 text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                  {step === 1 ? "Enter credentials" : "Verify 2FA"}
                </h1>
                <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                  {step === 1
                    ? "Sign in with email and password to continue."
                    : "Enter the 6‑digit code from your authenticator app."}
                </p>
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <div className={`h-2.5 w-2.5 rounded-full ${step === 1 ? "bg-primary" : "bg-muted"}`} />
                <div className={`h-2.5 w-2.5 rounded-full ${step === 2 ? "bg-primary" : "bg-muted"}`} />
              </div>
            </div>
          </div>

          <div className="p-6 space-y-5">
            {error ? (
              <div className="rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-foreground">
                {error}
              </div>
            ) : null}

            {step === 1 ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@company.com"
                      className="h-11 rounded-2xl pl-10 border-border/70 bg-background/40"
                      autoComplete="username"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      className="h-11 rounded-2xl pl-10 pr-10 border-border/70 bg-background/40"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((p) => !p)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <label className="flex items-center gap-2 text-sm text-muted-foreground select-none">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="h-4 w-4 rounded border-border"
                  />
                  Remember this device
                </label>

                <div className="flex items-center justify-between gap-2 pt-1">
                  <Button asChild variant="outline" className="rounded-2xl border-border/70">
                    <Link href="/login">User login</Link>
                  </Button>
                  <Button
                    type="button"
                    onClick={() => void submitCredentials()}
                    className="rounded-2xl"
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                    Continue
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">2FA code</Label>
                  <div className="flex items-center justify-center rounded-2xl border border-border/70 bg-muted/20 p-4">
                    <InputOTP value={otp} onChange={setOtp} maxLength={6} disabled={loading}>
                      <InputOTPGroup>
                        {Array.from({ length: 6 }).map((_, i) => (
                          <InputOTPSlot key={i} index={i} />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Didn’t get a code? Check your authenticator app time sync.
                  </p>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-2xl border-border/70"
                    onClick={() => {
                      setOtp("")
                      setError(null)
                      setStep(1)
                    }}
                    disabled={loading}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    type="button"
                    onClick={() => void submit2fa()}
                    className="rounded-2xl"
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                    Verify & sign in
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}

