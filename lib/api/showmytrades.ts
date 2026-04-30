import type { PerformanceResponse } from "./performance"

const SHOWMYTRADES_BASE = "https://showmytrades.com/api/statistics"

export function extractShowMyTradesKey(input: string | null | undefined): string | null {
  const raw = String(input ?? "").trim()
  if (!raw) return null
  // If a full dashboard URL is provided, take the last path segment.
  // Example: https://showmytrades.com/dashboard/account/mt5-1041059-xxxx -> mt5-1041059-xxxx
  if (/^https?:\/\//i.test(raw)) {
    try {
      const u = new URL(raw)
      const seg = u.pathname.split("/").filter(Boolean).slice(-1)[0] || ""
      const key = seg.trim()
      return /^mt[45]-/i.test(key) ? key : null
    } catch {
      return null
    }
  }
  // If token already provided.
  return /^mt[45]-/i.test(raw) ? raw : null
}

/**
 * Builds the path segment used by ShowMyTrades:
 * `mt5-{platform_login}` or `mt4-{platform_login}`
 *
 * Example: platform_login `11526060` + MT5 → `mt5-11526060`
 * Full URL: `https://showmytrades.com/api/statistics/mt5-11526060`
 */
export function buildShowMyTradesSlug(platform: string, platformLogin: string): string {
  const p = String(platform || "mt5")
    .toLowerCase()
    .trim()
  const isMt4 = p === "mt4" || p.startsWith("mt4")
  const prefix = isMt4 ? "mt4" : "mt5"
  const login = String(platformLogin).trim()
  return `${prefix}-${login}`
}

/**
 * Fetch account statistics from ShowMyTrades.
 * Upstream: `GET https://showmytrades.com/api/statistics/{mt5|mt4}-{platform_login}`
 */
export async function getShowMyTradesStats(
  platform: string,
  platformLogin: string,
  graphLinkOrKey?: string | null
): Promise<PerformanceResponse> {
  const keyFromGraph = extractShowMyTradesKey(graphLinkOrKey)
  const slug = keyFromGraph ?? buildShowMyTradesSlug(platform, platformLogin)
  const isClient = typeof window !== "undefined"
  const url = isClient
    ? `/api/showmytrades?slug=${encodeURIComponent(slug)}`
    : `${SHOWMYTRADES_BASE}/${slug}`

  const response = await fetch(url, {
    method: "GET",
    credentials: "omit",
    cache: "no-store",
  })
  if (!response.ok) {
    const err = new Error(`ShowMyTrades: ${response.status}`) as Error & { status: number }
    err.status = response.status
    throw err
  }
  const data = await response.json()
  if (!data?.success) {
    const err = new Error(data?.message || "ShowMyTrades: invalid response") as Error & { status: number }
    err.status = 0
    throw err
  }
  return data as PerformanceResponse
}
