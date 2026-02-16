/**
 * Admin authentication utilities.
 * Token and user data are stored in localStorage after admin login.
 */

const ADMIN_TOKEN_KEY = "admin_access_token"
const ADMIN_USER_KEY = "admin_user"

export function getAdminToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(ADMIN_TOKEN_KEY)
}

export interface AdminUser {
  id?: number
  email?: string
  username?: string
  full_name?: string
  name?: string
  role?: string
  permissions?: string[] | string
}

export interface AdminAuthState {
  isAuthenticated: boolean
  user: AdminUser | null
  token: string | null
}

export function getAdminAuthState(): AdminAuthState {
  if (typeof window === "undefined") {
    return { isAuthenticated: false, user: null, token: null }
  }
  const token = localStorage.getItem(ADMIN_TOKEN_KEY)
  const userRaw = localStorage.getItem(ADMIN_USER_KEY)
  let user: AdminUser | null = null
  try {
    if (userRaw) user = JSON.parse(userRaw) as AdminUser
  } catch {
    // Ignore parse errors
  }
  return {
    isAuthenticated: !!(token && user),
    user,
    token,
  }
}

export function setAdminAuthState(token: string, user: AdminUser): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(ADMIN_TOKEN_KEY, token)
    localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(user))
  } catch (e) {
    console.error("Failed to store admin auth", e)
  }
}

export function clearAdminAuthState(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(ADMIN_TOKEN_KEY)
  localStorage.removeItem(ADMIN_USER_KEY)
}
