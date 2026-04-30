import type { PerformanceResponse } from "./performance"
import { getShowMyTradesStats } from "./showmytrades"

/**
 * Main dashboard charts & stats — same ShowMyTrades source as the performance page.
 * Slug from `buildShowMyTradesSlug(platform, platform_login)` → e.g. `mt5-11526060`
 * → `GET https://showmytrades.com/api/statistics/mt5-11526060`
 */
export async function fetchDashboardStats(
  platform: string,
  platformLogin: string,
  graphLinkOrKey?: string | null
): Promise<PerformanceResponse> {
  return getShowMyTradesStats(platform, platformLogin, graphLinkOrKey)
}
