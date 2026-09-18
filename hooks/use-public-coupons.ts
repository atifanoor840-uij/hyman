"use client"

import { useEffect, useState } from "react"
import { listPublicCoupons, type PublicCoupon } from "@/lib/api/app-client"

// One request per page load, shared by the promo bar and the pricing section.
let pending: Promise<PublicCoupon[]> | null = null

function loadCoupons(): Promise<PublicCoupon[]> {
  pending ??= listPublicCoupons()
    .then((r) => r.coupons)
    .catch(() => {
      pending = null
      return []
    })
  return pending
}

/** Advertised coupons from the admin panel; `null` while loading. */
export function usePublicCoupons(): PublicCoupon[] | null {
  const [coupons, setCoupons] = useState<PublicCoupon[] | null>(null)
  useEffect(() => {
    let active = true
    loadCoupons().then((c) => active && setCoupons(c))
    return () => {
      active = false
    }
  }, [])
  return coupons
}
