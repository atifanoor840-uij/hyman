import "server-only"

import { createServiceRoleClient } from "@/lib/supabase/service"

export interface CouponRow {
  code: string
  discountPercent: number
  status: string
  createdAt: string | null
  expiresAt: string | null
}

const COUPON_COLUMNS = "code,discountPercent,status,createdAt,expiresAt"

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

export interface CreateCouponInput {
  code: string
  discountPercent: number
  status?: string
  expiresAt?: string | null
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
    })
    .select(COUPON_COLUMNS)
    .single()
  if (error) throw error
  return data as CouponRow
}

export async function updateCoupon(
  code: string,
  patch: Partial<{ discountPercent: number; status: string; expiresAt: string | null }>
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
