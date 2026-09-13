"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ApiClientError } from "@/lib/api/client"
import { crmSignupRequest } from "@/lib/api/app-client"
import { sanitizeInput, isValidEmail, isStrongPassword } from "@/lib/auth-utils"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Shield, User, Mail, Lock, KeyRound, ArrowRight, Loader2, Eye, EyeOff, CheckCircle2 } from "lucide-react"

export default function AdminSignupPage() {
  const router = useRouter()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [accessCode, setAccessCode] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setFieldErrors({})

    const n = sanitizeInput(name).trim()
    const em = sanitizeInput(email).trim()

    if (!n || n.length < 2) return setError("Enter your full name.")
    if (!em || !isValidEmail(em)) return setError("Use a valid email address.")
    if (!isStrongPassword(password)) return setError("Password needs upper, lower, a number, and at least 8 characters.")
    if (password !== confirmPassword) return setError("Passwords do not match.")
    if (!accessCode.trim()) return setError("Enter the CRM access code provided by your admin.")

    setLoading(true)
    try {
      await crmSignupRequest({ name: n, email: em.toLowerCase(), password, accessCode: accessCode.trim() })
      setDone(true)
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message || "Sign-up failed.")
        if (err.errors) {
          const fe: Record<string, string> = {}
          for (const key of Object.keys(err.errors)) fe[key] = err.errors[key][0]
          setFieldErrors(fe)
        }
      } else {
        setError("Sign-up failed. Please try again.")
      }
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
            CRM sign up
          </div>
        </div>

        <Card className="rounded-3xl border border-border/80 bg-card shadow-sm overflow-hidden">
          <div className="border-b border-border/80 bg-muted/20 px-6 py-5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">Create a CRM account</h1>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
              For staff only. You&apos;ll need the access code your admin shared with you.
            </p>
          </div>

          <div className="p-7 sm:p-8 space-y-6">
            {done ? (
              <div className="space-y-4 text-center py-4">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10">
                  <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Account created</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    You&apos;ve been given the support role. Ask an admin to upgrade your access if you need it. Sign in to continue.
                  </p>
                </div>
                <Button className="w-full rounded-2xl" onClick={() => router.push("/admin/login")}>
                  Go to sign in
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error ? (
                  <div className="rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-foreground">{error}</div>
                ) : null}

                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                    Full name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" className="h-14 rounded-2xl pl-11 text-base md:text-base border-border/70 bg-background/40" />
                  </div>
                  {fieldErrors.name && <p className="text-xs text-destructive">{fieldErrors.name}</p>}
                </div>

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
                      placeholder="you@company.com"
                      className="h-14 rounded-2xl pl-11 text-base md:text-base border-border/70 bg-background/40"
                      autoComplete="username"
                    />
                  </div>
                  {fieldErrors.email && <p className="text-xs text-destructive">{fieldErrors.email}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                        placeholder="Min. 8 characters"
                        className="h-14 rounded-2xl pl-11 text-base md:text-base pr-10 border-border/70 bg-background/40"
                        autoComplete="new-password"
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
                    {fieldErrors.password && <p className="text-xs text-destructive">{fieldErrors.password}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                      Confirm password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                        className="h-14 rounded-2xl pl-11 text-base md:text-base border-border/70 bg-background/40"
                        autoComplete="new-password"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accessCode" className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                    CRM access code
                  </Label>
                  <div className="relative">
                    <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="accessCode"
                      value={accessCode}
                      onChange={(e) => setAccessCode(e.target.value)}
                      placeholder="Provided by your admin"
                      className="h-14 rounded-2xl pl-11 text-base md:text-base border-border/70 bg-background/40"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
                  <Button asChild variant="outline" className="h-12 px-5 text-base rounded-2xl border-border/70">
                    <Link href="/admin/login">Sign in instead</Link>
                  </Button>
                  <Button type="submit" className="h-12 px-6 text-base rounded-2xl" disabled={loading}>
                    {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                    Create account
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </form>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
