import "server-only"

import { createServiceRoleClient } from "@/lib/supabase/service"

export interface CouponRow {
  code: string
  discountPercent: number
  status: string
  /** When true, the code is advertised in the checkout sidebar. */
  showAtCheckout: boolean
  createdAt: string | null
  expiresAt: string | null
}

const COUPON_COLUMNS = "code,discountPercent,status,showAtCheckout,createdAt,expiresAt"

export async function findValidCoupon(code: string): Promise<CouponRow | null> {
  const supabase = createServiceRoleClient()
  const { data, error } = await supabase
    .from("coupons")
    .select(COUPON_COLUMNS)
    .eq("code", code.trim().toUpperCase())
    .maybeSingle()
  if (error) throw error
  if (!data) return null
  const row = data as CouponRow
  if (row.status !== "active") return null
  if (row.expiresAt && new Date(row.expiresAt).getTime() < Date.now()) return null
  return row
}

export async function listCoupons(): Promise<CouponRow[]> {
  const supabase = createServiceRoleClient()
  const { data, error } = await supabase.from("coupons").select(COUPON_COLUMNS).order("createdAt", { ascending: false })
  if (error) throw error
  return (data as CouponRow[]) ?? []
}

/** Active, non-expired coupons the admin has opted into advertising. */
export async function listPublicCoupons(): Promise<CouponRow[]> {
  const supabase = createServiceRoleClient()
  const { data, error } = await supabase
    .from("coupons")
    .select(COUPON_COLUMNS)
    .eq("status", "active")
    .eq("showAtCheckout", true)
  if (error) throw error
  const now = Date.now()
  return ((data as CouponRow[]) ?? []).filter((c) => !c.expiresAt || new Date(c.expiresAt).getTime() >= now)
}

export interface CreateCouponInput {
  code: string
  discountPercent: number
  status?: string
  expiresAt?: string | null
  showAtCheckout?: boolean
}

export async function createCoupon(input: CreateCouponInput): Promise<CouponRow> {
  const supabase = createServiceRoleClient()
  const { data, error } = await supabase
    .from("coupons")
    .insert({
      code: input.code.trim().toUpperCase(),
      discountPercent: input.discountPercent,
      status: input.status ?? "active",
      expiresAt: input.expiresAt ?? null,
      showAtCheckout: input.showAtCheckout ?? false,
    })
    .select(COUPON_COLUMNS)
    .single()
  if (error) throw error
  return data as CouponRow
}

export async function updateCoupon(
  code: string,
  patch: Partial<{ discountPercent: number; status: string; expiresAt: string | null; showAtCheckout: boolean }>
): Promise<CouponRow> {
  const supabase = createServiceRoleClient()
  const { data, error } = await supabase
    .from("coupons")
    .update(patch)
    .eq("code", code.trim().toUpperCase())
    .select(COUPON_COLUMNS)
    .single()
  if (error) throw error
  return data as CouponRow
}

export async function deleteCoupon(code: string): Promise<void> {
  const supabase = createServiceRoleClient()
  const { error } = await supabase.from("coupons").delete().eq("code", code.trim().toUpperCase())
  if (error) throw error
}
