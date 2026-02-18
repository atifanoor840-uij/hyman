import { useState, useEffect, useCallback, useRef } from 'react'
import { setupCacheInvalidationListener } from '@/lib/order-cache-utils'

interface UseCachedOrdersOptions<T> {
  endpoint: string
  storageKey: string
  transformData?: (data: any) => T[]
  mergeStrategy?: 'replace' | 'merge' | 'smart'
  cacheExpiry?: number // in milliseconds, default 5 minutes
}

interface UseCachedOrdersResult<T> {
  data: T[]
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
  isRefreshing: boolean
}

export function useCachedOrders<T = any>({
  endpoint,
  storageKey,
  transformData,
  mergeStrategy = 'smart',
  cacheExpiry = 5 * 60 * 1000, // 5 minutes default
}: UseCachedOrdersOptions<T>): UseCachedOrdersResult<T> {
  const [data, setData] = useState<T[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load data from localStorage
  const loadFromCache = useCallback((): { data: T[]; timestamp: number } | null => {
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
      console.error('Error loading from cache:', error)
      localStorage.removeItem(storageKey)
      return null
    }
  }, [storageKey, cacheExpiry])

  // Save data to localStorage
  const saveToCache = useCallback((newData: T[]) => {
    if (typeof window === 'undefined') return

    try {
      const toCache = {
        data: newData,
        timestamp: Date.now(),
      }
      localStorage.setItem(storageKey, JSON.stringify(toCache))
    } catch (error) {
      console.error('Error saving to cache:', error)
    }
  }, [storageKey])

  // Smart merge: update existing orders and add new ones
  const smartMerge = useCallback((oldData: T[], newData: T[]): T[] => {
    const orderMap = new Map<any, T>()

    // First, add all old data
    oldData.forEach((order: any) => {
      const key = order.id || order.order_id
      if (key) orderMap.set(key, order)
    })

    // Then, update/overwrite with new data
    newData.forEach((order: any) => {
      const key = order.id || order.order_id
      if (key) {
        // Merge properties, giving priority to new data but keeping any missing fields
        const existing = orderMap.get(key)
        if (existing) {
          orderMap.set(key, { ...existing, ...order })
        } else {
          orderMap.set(key, order)
        }
      }
    })

    return Array.from(orderMap.values())
  }, [])

  // Fetch data from API
  const fetchData = useCallback(async (showLoader = false) => {
    try {
      if (showLoader) {
        setIsLoading(true)
      } else {
        setIsRefreshing(true)
      }
      setError(null)

      const token = typeof window !== 'undefined' ? localStorage.getItem('admin_access_token') : null
      if (!token) {
        setError('Admin access token not found. Please login again.')
        return
      }

      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      })

      if (!response.ok) {
        if (response.status === 401) {
          setError('Unauthorized. Please login again.')
        } else if (response.status === 403) {
          setError('Access forbidden. Insufficient permissions.')
        } else {
          setError(`Failed to load orders: ${response.status} ${response.statusText}`)
        }
        return
      }

      const responseData = await response.json()
      let processedData: T[] = []

      // Transform data if transformer provided
      if (transformData) {
        processedData = transformData(responseData)
      } else {
        // Default transformation based on common response structures
        if (Array.isArray(responseData)) {
          processedData = responseData
        } else if (responseData.orders && Array.isArray(responseData.orders)) {
          processedData = responseData.orders
        } else if (responseData[0] && Array.isArray(responseData[0])) {
          processedData = responseData[0]
        } else {
          processedData = []
        }
      }

      // Apply merge strategy
      setData((prevData) => {
        let mergedData: T[]
        if (mergeStrategy === 'replace') {
          mergedData = processedData
        } else if (mergeStrategy === 'merge') {
          mergedData = [...prevData, ...processedData]
        } else {
          // smart merge
          mergedData = smartMerge(prevData, processedData)
        }

        // Save to cache
        saveToCache(mergedData)
        return mergedData
      })
    } catch (error: any) {
      console.error('Failed to fetch orders:', error)
      setError(`Network error: ${error.message}`)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [endpoint, transformData, mergeStrategy, smartMerge, saveToCache])

  // Initial load: try cache first, then fetch in background
  useEffect(() => {
    const cached = loadFromCache()

    if (cached && cached.data.length > 0) {
      // Show cached data immediately
      setData(cached.data as T[])
      setIsLoading(false)
      // Fetch fresh data in background (silently)
      fetchData(false)
    } else {
      // No cache, show loader and fetch
      fetchData(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run on mount - loadFromCache and fetchData are stable via useCallback

  // Listen for cache invalidation events from other tabs/pages
  useEffect(() => {
    const cleanup = setupCacheInvalidationListener(() => {
      // When cache is invalidated, refresh data
      fetchData(false)
    })

    return cleanup
  }, [fetchData])

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
  }
}

