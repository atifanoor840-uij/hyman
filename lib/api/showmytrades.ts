import type { PerformanceResponse } from './performance';

const SHOWMYTRADES_BASE = 'https://showmytrades.com/api/statistics';

/**
 * Fetch account statistics from ShowMyTrades.
 * Uses Next.js API proxy (/api/showmytrades?slug=...) in the browser to avoid CORS.
 * Parameter format: mt5-{platform_login} or mt4-{platform_login}
 * Example: mt5-11526060 → https://showmytrades.com/api/statistics/mt5-11526060
 */
export async function getShowMyTradesStats(
  platform: string,
  platformLogin: string
): Promise<PerformanceResponse> {
  const slug = `${String(platform).toLowerCase().trim()}-${String(platformLogin).trim()}`
  const isClient = typeof window !== 'undefined'
  const url = isClient
    ? `/api/showmytrades?slug=${encodeURIComponent(slug)}`
    : `${SHOWMYTRADES_BASE}/${slug}`
  const response = await fetch(url, { method: 'GET', credentials: 'omit' })
  if (!response.ok) {
    const err = new Error(`ShowMyTrades: ${response.status}`) as Error & { status: number }
    err.status = response.status
    throw err
  }
  const data = await response.json()
  if (!data?.success) {
    const err = new Error(data?.message || 'ShowMyTrades: invalid response') as Error & { status: number }
    err.status = 0
    throw err
  }
  return data as PerformanceResponse
}
