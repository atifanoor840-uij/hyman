"use client"

export interface AdminUser {
  id: string | number
  username?: string
  name?: string
  full_name?: string
  email: string
  admin_code?: string
  role?: 'admin' | 'super_admin'
  permissions?: string | string[]
  lastLogin?: string
}

export interface AdminAuthState {
  isAuthenticated: boolean
  user: AdminUser | null
  token: string | null
}

export function getAdminAuthState(): AdminAuthState {
  if (typeof window === 'undefined') {
    return { isAuthenticated: false, user: null, token: null }
  }

  try {
    const token = localStorage.getItem('admin_access_token')
    const userStr = localStorage.getItem('admin_user')
    
    if (!token || !userStr) {
      return { isAuthenticated: false, user: null, token: null }
    }

    // Check if token is expired
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const currentTime = Math.floor(Date.now() / 1000)
      
      if (payload.exp && payload.exp < currentTime) {
        // Token is expired, clear auth state
        clearAdminAuthState()
        return { isAuthenticated: false, user: null, token: null }
      }
    } catch (tokenError) {
      // If token parsing fails, treat as invalid
      clearAdminAuthState()
      return { isAuthenticated: false, user: null, token: null }
    }

    const user = JSON.parse(userStr) as AdminUser
    return { isAuthenticated: true, user, token }
  } catch (error) {
    console.error('Error parsing admin auth state:', error)
    return { isAuthenticated: false, user: null, token: null }
  }
}

export function setAdminAuthState(user: AdminUser, token: string): void {
  if (typeof window === 'undefined') return
  
  localStorage.setItem('admin_access_token', token)
  localStorage.setItem('admin_user', JSON.stringify(user))
}

export function clearAdminAuthState(): void {
  if (typeof window === 'undefined') return
  
  localStorage.removeItem('admin_access_token')
  localStorage.removeItem('admin_user')
}

export function hasAdminPermission(permission: string): boolean {
  const { user } = getAdminAuthState()
  if (!user) return false
  
  return user.permissions.includes(permission) || user.role === 'super_admin'
}

export function isAdminAuthenticated(): boolean {
  return getAdminAuthState().isAuthenticated
}

export function getAdminToken(): string | null {
  return getAdminAuthState().token
}

export function getAdminUser(): AdminUser | null {
  return getAdminAuthState().user
}
