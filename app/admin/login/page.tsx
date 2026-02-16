"use client"

import { useState, FormEvent, ChangeEvent } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { User, Lock, Eye, EyeOff } from "lucide-react"
import { adminLogin } from "@/lib/api/admin-auth"
import { setAdminAuthState } from "@/lib/admin-auth"
import { preloadAdminData } from "@/lib/admin-data-preload"

const CURRENT_YEAR = new Date().getFullYear()

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    if (!email.trim() || !password) {
      setError("Please enter email and password.")
      return
    }
    setIsLoading(true)
    try {
      const res = await adminLogin({ email: email.trim().toLowerCase(), password })
      const token = res.token || res.access_token
      const user = res.user
      if (token && user) {
        setAdminAuthState(token, user as Parameters<typeof setAdminAuthState>[1])
        await preloadAdminData().catch(() => {})
        router.push("/admin")
        return
      }
      setError("Invalid response from server. Please try again.")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: "email" | "password") => (e: ChangeEvent<HTMLInputElement>) => {
    if (field === "email") setEmail(e.target.value)
    else setPassword(e.target.value)
    setError(null)
  }

  return (
    <div className="min-h-screen flex flex-col bg-white text-black">
      <main className="flex-1 flex min-h-0">
        {/* Left panel - same as dashboard login: black geometric */}
        <div className="hidden lg:flex lg:w-[38%] xl:w-[40%] relative overflow-hidden bg-black">
          <div className="absolute top-0 left-0 right-0 h-20 bg-black/90 z-[1]" />
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-zinc-950" />
            <div
              className="absolute -left-[10%] bottom-[5%] w-[95%] h-[75%] bg-zinc-800 shadow-2xl"
              style={{ clipPath: "polygon(0 15%, 92% 0, 100% 85%, 8% 100%)", transform: "skewY(-1deg)" }}
            />
            <div
              className="absolute -left-[5%] top-[18%] w-[88%] h-[60%] bg-zinc-700 shadow-xl"
              style={{ clipPath: "polygon(2% 0, 100% 12%, 98% 88%, 0 100%)", transform: "skewY(2deg)" }}
            />
            <div
              className="absolute right-0 top-[35%] w-[70%] h-[50%] bg-zinc-600/90 shadow-lg"
              style={{ clipPath: "polygon(25% 0, 100% 0, 100% 100%, 0 100%)" }}
            />
          </div>
          <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-6 z-20 flex flex-col items-stretch min-w-[100px]">
            <div className="bg-white rounded-l-2xl pl-6 pr-8 py-4 shadow-[4px_0_24px_rgba(0,0,0,0.12)]">
              <span className="text-sm font-bold tracking-wide text-black">ADMIN LOGIN</span>
            </div>
          </div>
        </div>

        {/* Right panel - form */}
        <div className="flex-1 flex flex-col items-center justify-center min-h-screen px-6 py-12 lg:py-16">
          <div className="lg:hidden flex rounded-full bg-zinc-100 p-1 gap-1 mb-8">
            <span className="px-4 py-2 rounded-full bg-black text-white text-sm font-bold">ADMIN LOGIN</span>
          </div>

          <div className="flex flex-col items-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Image
                src="https://res.cloudinary.com/dqzibxdtn/image/upload/v1769659705/ChatGPT_Image_Jan_28_2026_08_06_49_PM_moryyr.png"
                alt="FxGenz"
                width={48}
                height={48}
                className="object-contain"
              />
              <span className="text-2xl font-bold text-black tracking-tight">FxGenz Admin</span>
            </div>
            <h1 className="text-xl font-bold text-zinc-600 tracking-tight">ADMIN LOGIN</h1>
          </div>

          <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
              <div className="space-y-1">
                <div className="flex items-center gap-2 border-b border-zinc-300 focus-within:border-black transition-colors pb-2">
                  <User className="w-5 h-5 text-zinc-400 shrink-0" />
                  <input
                    id="admin-email"
                    type="email"
                    value={email}
                    onChange={handleChange("email")}
                    placeholder="Admin email"
                    className="flex-1 min-w-0 bg-transparent text-sm text-black placeholder:text-zinc-400 outline-none"
                    autoComplete="email"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 border-b border-zinc-300 focus-within:border-black transition-colors pb-2">
                  <Lock className="w-5 h-5 text-zinc-400 shrink-0" />
                  <input
                    id="admin-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={handleChange("password")}
                    placeholder="Password"
                    className="flex-1 min-w-0 bg-transparent text-sm text-black placeholder:text-zinc-400 outline-none"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="text-zinc-400 hover:text-zinc-600 p-0.5"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-4">
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-black px-8 py-3 text-sm font-bold text-white shadow-md hover:bg-zinc-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Signing in…
                  </>
                ) : (
                  "LOGIN"
                )}
              </button>
            </div>
          </form>

          <p className="mt-8 text-xs text-zinc-400">© {CURRENT_YEAR} FxGenz Admin. All rights reserved.</p>
        </div>
      </main>
    </div>
  )
}
