/**
 * Admin Data Preload Service
 * 
 * This service preloads all admin data on first login and stores it in local storage.
 * Subsequent page loads will use cached data immediately while fetching fresh data in the background.
 */

const BASE_URL = 'https://genz-34f298f57a04.herokuapp.com'

interface PreloadConfig {
  endpoint: string
  storageKey: string
  transformData?: (data: any) => any
}

// Define all admin endpoints that should be preloaded
const ADMIN_ENDPOINTS: PreloadConfig[] = [
  {
    endpoint: `${BASE_URL}/orders/analytics`,
    storageKey: 'admin_cache_analytics',
  },
  {
    endpoint: '/api/auth/members',
    storageKey: 'admin_cache_users',
  },
  {
    endpoint: `${BASE_URL}/orders/list/all`,
    storageKey: 'admin_cache_orders_all',
  },
  {
    endpoint: `${BASE_URL}/support/admin/tickets`,
    storageKey: 'admin_cache_live_chat',
  },
  {
    endpoint: `${BASE_URL}/accounts/credentials`,
    storageKey: 'admin_cache_containers',
  },
  {
    endpoint: `${BASE_URL}/orders/list/pending`,
    storageKey: 'admin_cache_orders_pending',
  },
  {
    endpoint: `${BASE_URL}/orders/list/completed`,
    storageKey: 'admin_cache_orders_completed',
  },
  {
    endpoint: `${BASE_URL}/orders/list/card`,
    storageKey: 'admin_cache_orders_card',
  },
  {
    endpoint: `${BASE_URL}/orders/list/crypto`,
    storageKey: 'admin_cache_orders_crypto',
  },
  {
    endpoint: `${BASE_URL}/orders/list/live`,
    storageKey: 'admin_cache_orders_live',
  },
  {
    endpoint: `${BASE_URL}/orders/list/stage2`,
    storageKey: 'admin_cache_orders_stage2',
  },
  {
    endpoint: `${BASE_URL}/orders/list/passed`,
    storageKey: 'admin_cache_orders_passed',
  },
  {
    endpoint: `${BASE_URL}/orders/list/failed`,
    storageKey: 'admin_cache_orders_failed',
  },
]

/**
 * Preloads all admin data and stores in local storage
 * This should be called after successful admin login
 */
export async function preloadAdminData(): Promise<{
  success: boolean
  loaded: number
  failed: number
  errors: string[]
}> {
  if (typeof window === 'undefined') {
    return { success: false, loaded: 0, failed: 0, errors: ['Not in browser environment'] }
  }

  const token = localStorage.getItem('admin_access_token')
  if (!token) {
    return { success: false, loaded: 0, failed: 0, errors: ['No admin token found'] }
  }

  const results = {
    success: true,
    loaded: 0,
    failed: 0,
    errors: [] as string[],
  }

  // Check if data was already preloaded recently (within last hour)
  const lastPreload = localStorage.getItem('admin_data_last_preload')
  const now = Date.now()
  if (lastPreload) {
    const lastPreloadTime = parseInt(lastPreload, 10)
    // If preloaded within last hour, skip (unless forced)
    if (now - lastPreloadTime < 60 * 60 * 1000) {
      console.log('Admin data was recently preloaded, skipping...')
      return { success: true, loaded: ADMIN_ENDPOINTS.length, failed: 0, errors: [] }
    }
  }

  // Fetch all endpoints in parallel
  const fetchPromises = ADMIN_ENDPOINTS.map(async (config) => {
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }

      // Add auth token for endpoints that require it
      if (config.endpoint.includes(BASE_URL) || config.endpoint.startsWith('/api/')) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(config.endpoint, {
        method: 'GET',
        headers,
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      let data = await response.json()

      // Apply transformation if provided
      if (config.transformData) {
        data = config.transformData(data)
      }

      // Store in local storage
      const cacheData = {
        data,
        timestamp: now,
      }

      try {
        localStorage.setItem(config.storageKey, JSON.stringify(cacheData))
        results.loaded++
        return { success: true, key: config.storageKey }
      } catch (storageError: any) {
        // Handle storage quota exceeded
        if (storageError.name === 'QuotaExceededError') {
          // Clear old caches and retry
          clearOldAdminCaches()
          try {
            localStorage.setItem(config.storageKey, JSON.stringify(cacheData))
            results.loaded++
            return { success: true, key: config.storageKey }
          } catch (retryError) {
            results.failed++
            results.errors.push(`Storage error for ${config.storageKey}`)
            return { success: false, key: config.storageKey }
          }
        }
        throw storageError
      }
    } catch (error: any) {
      results.failed++
      const errorMsg = `Failed to preload ${config.storageKey}: ${error.message}`
      results.errors.push(errorMsg)
      console.error(errorMsg, error)
      return { success: false, key: config.storageKey }
    }
  })

  await Promise.allSettled(fetchPromises)

  // Mark preload timestamp
  localStorage.setItem('admin_data_last_preload', now.toString())

  // Store preload status
  localStorage.setItem('admin_data_preload_status', JSON.stringify({
    timestamp: now,
    loaded: results.loaded,
    failed: results.failed,
  }))

  return results
}

/**
 * Clears old admin caches to free up storage space
 */
function clearOldAdminCaches() {
  if (typeof window === 'undefined') return

  const now = Date.now()
  const maxAge = 7 * 24 * 60 * 60 * 1000 // 7 days

  try {
    const keys = Object.keys(localStorage)
    keys.forEach((key) => {
      if (key.startsWith('admin_cache_')) {
        try {
          const item = localStorage.getItem(key)
          if (item) {
            const parsed = JSON.parse(item)
            if (parsed.timestamp && now - parsed.timestamp > maxAge) {
              localStorage.removeItem(key)
            }
          }
        } catch {
          // If parsing fails, remove the key
          localStorage.removeItem(key)
        }
      }
    })
  } catch (error) {
    console.error('Error clearing old caches:', error)
  }
}

/**
 * Clears all admin data caches
 */
export function clearAllAdminCaches() {
  if (typeof window === 'undefined') return

  try {
    const keys = Object.keys(localStorage)
    keys.forEach((key) => {
      if (key.startsWith('admin_cache_')) {
        localStorage.removeItem(key)
      }
    })
    localStorage.removeItem('admin_data_last_preload')
    localStorage.removeItem('admin_data_preload_status')
  } catch (error) {
    console.error('Error clearing admin caches:', error)
  }
}

/**
 * Gets the status of the last preload
 */
export function getPreloadStatus(): {
  timestamp: number | null
  loaded: number
  failed: number
} | null {
  if (typeof window === 'undefined') return null

  try {
    const status = localStorage.getItem('admin_data_preload_status')
    if (!status) return null

    const parsed = JSON.parse(status)
    return {
      timestamp: parsed.timestamp || null,
      loaded: parsed.loaded || 0,
      failed: parsed.failed || 0,
    }
  } catch {
    return null
  }
}

/**
 * Invalidates a specific cache by key
 */
export function invalidateAdminCache(storageKey: string) {
  if (typeof window === 'undefined') return

  try {
    localStorage.removeItem(storageKey)
    
    // Broadcast invalidation to other tabs
    if ('BroadcastChannel' in window) {
      const channel = new BroadcastChannel('admin_cache_updates')
      channel.postMessage({
        type: 'CACHE_INVALIDATION',
        key: storageKey,
        timestamp: Date.now(),
      })
      channel.close()
    }
  } catch (error) {
    console.error(`Error invalidating cache ${storageKey}:`, error)
  }
}
