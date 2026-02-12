"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { getAdminToken } from "@/lib/admin-auth"

export type MergeStrategy = "replace" | "smart"

interface UseCachedOrdersOptions<T> {
  endpoint: string
  storageKey: string
  transformData: (data: unknown) => T[]
  mergeStrategy?: MergeStrategy
}

interface UseCachedOrdersResult<T> {
  data: T[]
  isLoading: boolean
  error: string | null
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

export function useCachedOrders<T extends { id?: number }>({
  endpoint,
  storageKey,
  transformData,
  mergeStrategy = "replace",
}: UseCachedOrdersOptions<T>): UseCachedOrdersResult<T> {
  const [data, setData] = useState<T[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const transformRef = useRef(transformData)
  transformRef.current = transformData

  const fetchOrders = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const token = getAdminToken()
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
      const list = transformRef.current(raw)
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
  }, [endpoint, storageKey])

  useEffect(() => {
    const cached = getCachedData<T>(storageKey)
    if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
      setData(cached.data)
      setIsLoading(false)
      return
    }
    fetchOrders()
  }, [fetchOrders, storageKey])

  return {
    data,
    isLoading,
    error,
    refresh: fetchOrders,
  }
}
