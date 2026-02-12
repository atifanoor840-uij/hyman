/**
 * Secure API configuration and utilities
 * Uses Next.js API routes to hide backend endpoints from client-side dev tools
 */

/**
 * Get the API base URL for direct backend calls
 * Admin and dashboard pages call the backend directly (genz)
 */
export const getApiBaseUrl = (): string => {
  const url = process.env.NEXT_PUBLIC_API_URL || process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'https://genz-34f298f57a04.herokuapp.com'
  return (typeof url === 'string' && url.trim()) ? url.replace(/\/$/, '') : 'https://genz-34f298f57a04.herokuapp.com'
}

export const API_BASE_URL = getApiBaseUrl()

/**
 * Helper function to build secure API URLs
 */
export const buildApiUrl = (endpoint: string): string => {
  const baseUrl = API_BASE_URL
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  return `${baseUrl}${cleanEndpoint}`
}

/**
 * Secure API endpoints using Next.js API routes
 * These hide the actual backend URLs from client-side dev tools
 */
export const API_ENDPOINTS = {
  // Auth endpoints (go through /api/auth/[...path])
  REGISTER: '/auth/register',
  LOGIN: '/auth/login',
  VERIFY_EMAIL: '/auth/verify-mail',
  RESEND_VERIFICATION: '/auth/resend-verification',
  FORGOT_PASSWORD: '/auth/forgot-pass',
  RESET_PASSWORD: '/auth/reset-pass',
  USER_PROFILE: '/auth/user/profile',
  
  // Partner auth endpoints (go through /api/partner/[...path])
  PARTNER_REGISTER: '/partner/auth/register',
  PARTNER_LOGIN: '/partner/auth/login',
  
  // Order endpoints (go through /api/orders/[...path])
  CREATE_ORDER: '/orders/create',
  MY_ORDERS: '/orders/my-account',

  // Admin utilities
  ADMIN_SEND_PROMO_EMAIL: '/auth/admin/send-promotional-email',
} as const

/**
 * Helper to get full secure API URL for an endpoint
 */
export const getApiUrl = (endpoint: keyof typeof API_ENDPOINTS): string => {
  return buildApiUrl(API_ENDPOINTS[endpoint])
}

/**
 * Get access token from localStorage
 * Prioritizes 'access_token' (what login stores) but falls back to 'authToken' for compatibility
 */
export const getAccessToken = (): string | null => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('access_token') || localStorage.getItem('authToken')
}

/**
 * Get authenticated headers with access token
 */
export const getAuthHeaders = (additionalHeaders: Record<string, string> = {}): Record<string, string> => {
  const token = getAccessToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...additionalHeaders
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  
  return headers
}

/**
 * Additional security utilities
 */
export const API_SECURITY = {
  /**
   * Obfuscate sensitive data in console logs
   */
  obfuscateData: (data: any): any => {
    if (typeof data === 'string' && data.includes('@')) {
      return data.replace(/(.{2}).*(@.*)/, '$1***$2')
    }
    if (typeof data === 'string' && data.length > 10) {
      return data.substring(0, 4) + '***' + data.substring(data.length - 4)
    }
    return data
  },
  
  /**
   * Validate API responses
   */
  validateResponse: (response: Response): boolean => {
    return response.ok && response.status >= 200 && response.status < 300
  }
} as const
