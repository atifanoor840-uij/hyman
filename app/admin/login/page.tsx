"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ApiClientError } from "@/lib/api/client"
import { crmSigninStep1 } from "@/lib/api/app-client"
import { sanitizeInput, isValidEmail } from "@/lib/auth-utils"
import { setAdmin2faVerifiedNow } from "@/components/admin/admin-auth"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Shield, Mail, Lock, ArrowRight, Loader2, Eye, EyeOff } from "lucide-react"

export default function AdminLoginPage() {
  const router = useRouter()
  const [nextUrl, setNextUrl] = useState("/admin/overview")

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

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

    setLoading(true)
    try {
      await crmSigninStep1(e, password)
      setAdmin2faVerifiedNow()
      router.replace(nextUrl)
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Sign-in failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-xl">
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
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">Enter credentials</h1>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">Sign in with email and password to continue.</p>
          </div>

          <div className="p-7 sm:p-8 space-y-6">
            {error ? (
              <div className="rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-foreground">{error}</div>
            ) : null}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@company.com"
                    className="h-14 rounded-2xl pl-11 text-base md:text-base border-border/70 bg-background/40"
                    autoComplete="username"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="h-14 rounded-2xl pl-11 text-base md:text-base pr-10 border-border/70 bg-background/40"
                    autoComplete="current-password"
                    onKeyDown={(e) => e.key === "Enter" && void submitCredentials()}
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

              <div className="flex items-center justify-between gap-2 pt-1">
                <Button asChild variant="outline" className="h-12 px-5 text-base rounded-2xl border-border/70">
                  <Link href="/login">User login</Link>
                </Button>
                <Button type="button" onClick={() => void submitCredentials()} className="h-12 px-6 text-base rounded-2xl" disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  Sign in
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>

              <p className="text-center text-xs text-muted-foreground">
                New to the CRM?{" "}
                <Link href="/admin/signup" className="font-semibold text-foreground hover:underline">
                  Create an account
                </Link>
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
