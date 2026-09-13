import { ApiClientError } from "./client"

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new ApiClientError(data?.message || `Request failed with status ${res.status}`, res.status, data?.errors)
  }
  return data as T
}

export interface AuthUser {
  id: string
  name: string
  email: string
  phone: string | null
  country: string | null
  role: "customer" | "collaborator" | "admin" | "support"
  status: string
  createdAt: string | null
  referredBy: string | null
  emailVerified: boolean
  emailVerifiedAt: string | null
}

export function signupRequest(input: {
  name: string
  email: string
  password: string
  country: string
  phone?: string
  referralCode?: string
}) {
  return postJson<{ user: AuthUser; emailSent: boolean }>("/api/auth/signup", input)
}

export function verifyEmailRequest(input: { email: string; code: string }) {
  return postJson<{ verified: boolean; alreadyVerified?: boolean }>("/api/auth/verify-email", input)
}

export function resendCodeRequest(input: { email: string }) {
  return postJson<{ sent: boolean }>("/api/auth/resend-code", input)
}

export function signinRequest(input: { email: string; password: string; rememberMe?: boolean }) {
  return postJson<{ user: AuthUser }>("/api/auth/signin", input)
}

export function signoutRequest() {
  return postJson<{ ok: boolean }>("/api/auth/signout", {})
}

export async function meRequest(): Promise<{ user: AuthUser } | null> {
  const res = await fetch("/api/auth/me")
  if (res.status === 401) return null
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new ApiClientError(data?.message || "Failed to load session.", res.status)
  return data as { user: AuthUser }
}

export function forgotPasswordRequest(input: { email: string }) {
  return postJson<{ message: string }>("/api/auth/forgot-password", input)
}

export function resetPasswordRequest(input: { email: string; code: string; password: string }) {
  return postJson<{ ok: boolean }>("/api/auth/reset-password", input)
}
