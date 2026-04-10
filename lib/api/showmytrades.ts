import type { PerformanceResponse } from "./performance"

const SHOWMYTRADES_BASE = "https://showmytrades.com/api/statistics"

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
 * Uses Next.js API proxy (`/api/showmytrades?slug=...`) in the browser to avoid CORS.
 * Upstream: `GET https://showmytrades.com/api/statistics/{mt5|mt4}-{platform_login}`
 */
export async function getShowMyTradesStats(
  platform: string,
  platformLogin: string
): Promise<PerformanceResponse> {
  const slug = buildShowMyTradesSlug(platform, platformLogin)
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
