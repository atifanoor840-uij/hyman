import "server-only"

import { createServiceRoleClient } from "@/lib/supabase/service"

export interface AffiliateRow {
  userId: string
  referralCode: string
  commissionRate: number
}

export interface AffiliateDetailedRow extends AffiliateRow {
  users: { name: string; email: string } | null
}

const COLUMNS = "userId,referralCode,commissionRate"

export async function findAffiliateByUserId(userId: string): Promise<AffiliateRow | null> {
  const supabase = createServiceRoleClient()
  const { data, error } = await supabase.from("affiliates").select(COLUMNS).eq("userId", userId).maybeSingle()
  if (error) throw error
  return (data as AffiliateRow | null) ?? null
}

export async function listAffiliatesDetailed(): Promise<AffiliateDetailedRow[]> {
  const supabase = createServiceRoleClient()
  const { data, error } = await supabase
    .from("affiliates")
    .select(`${COLUMNS},users!affiliates_userId_fkey(name,email)`)
  if (error) throw error
  return (data as unknown as AffiliateDetailedRow[]) ?? []
}

export interface CreateAffiliateInput {
  userId: string
  referralCode: string
  commissionRate: number
}

export async function createAffiliate(input: CreateAffiliateInput): Promise<AffiliateRow> {
  const supabase = createServiceRoleClient()
  const { data, error } = await supabase
    .from("affiliates")
    .insert({
      userId: input.userId,
      referralCode: input.referralCode.trim().toUpperCase(),
      commissionRate: input.commissionRate,
    })
    .select(COLUMNS)
    .single()
  if (error) throw error
  return data as AffiliateRow
}

export async function updateAffiliate(
  userId: string,
  patch: Partial<{ referralCode: string; commissionRate: number }>
): Promise<AffiliateRow> {
  const supabase = createServiceRoleClient()
  const normalized = { ...patch, referralCode: patch.referralCode?.trim().toUpperCase() }
  const { data, error } = await supabase.from("affiliates").update(normalized).eq("userId", userId).select(COLUMNS).single()
  if (error) throw error
  return data as AffiliateRow
}

export async function deleteAffiliate(userId: string): Promise<void> {
  const supabase = createServiceRoleClient()
  const { error } = await supabase.from("affiliates").delete().eq("userId", userId)
  if (error) throw error
}
