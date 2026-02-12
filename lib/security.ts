/**
 * Security utilities for API protection
 * Additional layers of security to prevent endpoint exposure
 */

/**
 * Obfuscate sensitive data in network requests
 */
export const obfuscateRequest = (data: any): any => {
  if (typeof data === 'object' && data !== null) {
    const obfuscated = { ...data }
    
    // Obfuscate sensitive fields
    if (obfuscated.email) {
      obfuscated.email = obfuscated.email.replace(/(.{2}).*(@.*)/, '$1***$2')
    }
    if (obfuscated.password) {
      obfuscated.password = '***'
    }
    if (obfuscated.token) {
      obfuscated.token = obfuscated.token.substring(0, 8) + '***'
    }
    
    return obfuscated
  }
  return data
}

/**
 * Generate secure request headers
 */
export const getSecureHeaders = (): HeadersInit => {
  return {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  }
}

/**
 * Validate and sanitize API responses
 */
export const sanitizeResponse = (response: any): any => {
  // Remove any sensitive data that might leak
  if (typeof response === 'object' && response !== null) {
    const sanitized = { ...response }
    
    // Remove internal server paths
    delete sanitized.stack
    delete sanitized.internal
    
    return sanitized
  }
  return response
}

/**
 * Rate limiting helper
 */
export const rateLimitCheck = (): boolean => {
  const now = Date.now()
  const lastRequest = localStorage.getItem('lastApiRequest')
  
  if (lastRequest) {
    const timeDiff = now - parseInt(lastRequest)
    if (timeDiff < 1000) { // 1 second rate limit
      return false
    }
  }
  
  localStorage.setItem('lastApiRequest', now.toString())
  return true
}
