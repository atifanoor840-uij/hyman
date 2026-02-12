/**
 * Utilities for invalidating and broadcasting order cache updates.
 * Used when order status changes (e.g., pending → passed, passed → completed).
 */

const ORDER_CACHE_KEYS = [
  "admin_orders_all",
  "admin_orders_pending",
  "admin_orders_passed",
  "admin_orders_completed",
  "admin_orders_failed",
  "admin_orders_live",
  "admin_orders_stage2",
  "admin_orders_card",
  "admin_orders_crypto",
  "admin_orders_failed_merge",
  "admin_orders_certificates",
]

export function invalidateCachesForStatusChange(
  _oldStatus: string,
  _newStatus: string
): void {
  if (typeof window === "undefined") return
  try {
    ORDER_CACHE_KEYS.forEach((key) => sessionStorage.removeItem(key))
  } catch {
    // Ignore storage errors
  }
}

export function broadcastCacheInvalidation(_payload: {
  oldStatus?: string
  newStatus?: string
}): void {
  if (typeof window === "undefined") return
  try {
    window.dispatchEvent(
      new CustomEvent("admin-order-cache-invalidate", { detail: _payload })
    )
  } catch {
    // Ignore
  }
}
