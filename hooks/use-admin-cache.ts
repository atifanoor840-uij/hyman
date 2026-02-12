"use client"

import { useEffect, useState, useCallback } from "react"
import { getAdminToken } from "@/lib/admin-auth"

interface UseAdminCacheOptions<T> {
  endpoint: string
  storageKey: string
  transformData: (data: unknown) => T[]
  requiresAuth?: boolean
}

interface UseAdminCacheResult<T> {
  data: T[]
  isLoading: boolean
  error: string | null
  updateData: (newData: T[] | ((prev: T[]) => T[])) => void
  refresh: () => Promise<void>
}

const CACHE_TTL_MS = 60 * 1000 // 1 minute

function getCachedData<T>(storageKey: string): { data: T[]; ts: number } | null {
  if (typeof window === "undefined") return null
  try {
    const raw = sessionStorage.getItem(storageKey)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { data: T[]; ts: number }
    if (!parsed.data || !Array.isArray(parsed.data)) return null
    return parsed
  } catch {
    return null
  }
}

function setCachedData<T>(storageKey: string, data: T[]): void {
  if (typeof window === "undefined") return
  try {
    sessionStorage.setItem(storageKey, JSON.stringify({ data, ts: Date.now() }))
  } catch {
    // Ignore storage errors
  }
}

export function useAdminCache<T>({
  endpoint,
  storageKey,
  transformData,
  requiresAuth = true,
}: UseAdminCacheOptions<T>): UseAdminCacheResult<T> {
  const [data, setData] = useState<T[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const token = requiresAuth ? getAdminToken() : null
      const headers: HeadersInit = {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      }
      const res = await fetch(endpoint, { method: "GET", headers })
      const raw = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error((raw?.message || raw?.detail || `HTTP ${res.status}`) as string)
      }
      const list = transformData(raw)
      const arr = Array.isArray(list) ? list : []
      setData(arr)
      setCachedData(storageKey, arr)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
      const cached = getCachedData<T>(storageKey)
      if (cached && Date.now() - cached.ts < CACHE_TTL_MS * 5) {
        setData(cached.data)
      }
    } finally {
      setIsLoading(false)
    }
  }, [endpoint, storageKey, transformData, requiresAuth])

  const updateData = useCallback((newData: T[] | ((prev: T[]) => T[])) => {
    setData((prev) => {
      const next = typeof newData === "function" ? (newData as (prev: T[]) => T[])(prev) : newData
      setCachedData(storageKey, next)
      return next
    })
  }, [storageKey])

  useEffect(() => {
    const cached = getCachedData<T>(storageKey)
    if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
      setData(cached.data)
      setIsLoading(false)
      return
    }
    fetchData()
  }, [fetchData, storageKey])

  return {
    data,
    isLoading,
    error,
    updateData,
    refresh: fetchData,
  }
}
