"use client"

import { useState, useEffect, useCallback, useRef } from 'react'

interface UseAdminCacheOptions<T> {
  endpoint: string
  storageKey: string
  transformData?: (data: any) => T
  cacheExpiry?: number // in milliseconds, default 24 hours
  requiresAuth?: boolean
  onUpdate?: (data: T) => void
}

interface UseAdminCacheResult<T> {
  data: T | null
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
  isRefreshing: boolean
  updateData: (newData: T | ((prev: T | null) => T)) => void
}

const DEFAULT_CACHE_EXPIRY = 24 * 60 * 60 * 1000 // 24 hours

export function useAdminCache<T = any>({
  endpoint,
  storageKey,
  transformData,
  cacheExpiry = DEFAULT_CACHE_EXPIRY,
  requiresAuth = true,
  onUpdate,
}: UseAdminCacheOptions<T>): UseAdminCacheResult<T> {
  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isInitialMount = useRef(true)

  // Load data from localStorage
  const loadFromCache = useCallback((): { data: T; timestamp: number } | null => {
    if (typeof window === 'undefined') return null

    try {
      const cached = localStorage.getItem(storageKey)
      if (!cached) return null

      const parsed = JSON.parse(cached)
      const now = Date.now()

      // Check if cache is expired
      if (parsed.timestamp && now - parsed.timestamp > cacheExpiry) {
        localStorage.removeItem(storageKey)
        return null
      }

      return parsed
    } catch (error) {
      console.error(`Error loading from cache ${storageKey}:`, error)
      localStorage.removeItem(storageKey)
      return null
    }
  }, [storageKey, cacheExpiry])

  // Save data to localStorage
  const saveToCache = useCallback((newData: T) => {
    if (typeof window === 'undefined') return

    try {
      const toCache = {
        data: newData,
        timestamp: Date.now(),
      }
      localStorage.setItem(storageKey, JSON.stringify(toCache))
    } catch (error) {
      console.error(`Error saving to cache ${storageKey}:`, error)
      // If storage is full, try to clear old caches
      try {
        const keys = Object.keys(localStorage)
        keys.forEach(key => {
          if (key.startsWith('admin_cache_') && key !== storageKey) {
            try {
              const item = localStorage.getItem(key)
              if (item) {
                const parsed = JSON.parse(item)
                if (parsed.timestamp && Date.now() - parsed.timestamp > cacheExpiry) {
                  localStorage.removeItem(key)
                }
              }
            } catch {
              localStorage.removeItem(key)
            }
          }
        })
        // Retry saving
        localStorage.setItem(storageKey, JSON.stringify({ data: newData, timestamp: Date.now() }))
      } catch (retryError) {
        console.error('Failed to save cache even after cleanup:', retryError)
      }
    }
  }, [storageKey, cacheExpiry])

  // Fetch data from API
  const fetchData = useCallback(async (showLoader = false) => {
    try {
      if (showLoader) {
        setIsLoading(true)
      } else {
        setIsRefreshing(true)
      }
      setError(null)

      const token = requiresAuth 
        ? (typeof window !== 'undefined' ? localStorage.getItem('admin_access_token') : null)
        : null

      if (requiresAuth && !token) {
        setError('Admin access token not found. Please login again.')
        return
      }

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }

      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(endpoint, {
        method: 'GET',
        headers,
      })

      if (!response.ok) {
        if (response.status === 401) {
          setError('Unauthorized. Please login again.')
        } else if (response.status === 403) {
          setError('Access forbidden. Insufficient permissions.')
        } else {
          setError(`Failed to load data: ${response.status} ${response.statusText}`)
        }
        return
      }

      const responseData = await response.json()

      // Transform data if transformer provided
      let processedData: T
      if (transformData) {
        processedData = transformData(responseData)
      } else {
        processedData = responseData as T
      }

      // Save to cache
      saveToCache(processedData)
      
      // Update state
      setData(processedData)
      
      // Call onUpdate callback if provided
      if (onUpdate) {
        onUpdate(processedData)
      }
    } catch (error: any) {
      console.error(`Failed to fetch data from ${endpoint}:`, error)
      setError(`Network error: ${error.message}`)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [endpoint, transformData, requiresAuth, saveToCache, onUpdate])

  // Update data optimistically
  const updateData = useCallback((newData: T | ((prev: T | null) => T)) => {
    setData((prev) => {
      const updated = typeof newData === 'function' 
        ? (newData as (prev: T | null) => T)(prev)
        : newData
      
      // Save to cache immediately
      if (updated !== null) {
        saveToCache(updated)
        if (onUpdate) {
          onUpdate(updated)
        }
      }
      
      return updated
    })
  }, [saveToCache, onUpdate])

  // Initial load: try cache first, then fetch in background
  useEffect(() => {
    if (!isInitialMount.current) return
    isInitialMount.current = false

    const cached = loadFromCache()

    if (cached && cached.data !== null && cached.data !== undefined) {
      // Show cached data immediately
      setData(cached.data as T)
      setIsLoading(false)
      // Fetch fresh data in background (silently) to get any new users/orders
      fetchData(false)
    } else {
      // No cache, show loader and fetch
      fetchData(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run on mount

  // Periodically refresh data to catch new users/orders (every 60 seconds, only when page is visible)
  useEffect(() => {
    if (!data) return // Don't set up refresh if no data yet

    const refreshInterval = setInterval(() => {
      // Only refresh if page is visible and we have cached data
      if (!document.hidden && data !== null) {
        fetchData(false)
      }
    }, 60000) // 60 seconds

    // Also refresh when page becomes visible (user switches back to tab)
    const handleVisibilityChange = () => {
      if (!document.hidden && data !== null) {
        fetchData(false)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      clearInterval(refreshInterval)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [data, fetchData])

  // Listen for storage events (cross-tab updates)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === storageKey && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue)
          if (parsed.data !== undefined) {
            setData(parsed.data as T)
            if (onUpdate) {
              onUpdate(parsed.data as T)
            }
          }
        } catch (error) {
          console.error('Error parsing storage event:', error)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [storageKey, onUpdate])

  // Manual refresh function
  const refresh = useCallback(async () => {
    await fetchData(false)
  }, [fetchData])

  return {
    data,
    isLoading,
    error,
    refresh,
    isRefreshing,
    updateData,
  }
}
