import "server-only"

import { createServiceRoleClient } from "@/lib/supabase/service"
import { findAffiliateByUserId } from "./affiliates"
import { findUserById } from "./users"
import type { OrderRow } from "./orders"

export interface ReferralRow {
  referredUserId: string
  affiliateId: string | null
  orderId: string
  commissionAmount: number
  status: string
  createdAt: string | null
}

export interface ReferralDetailedRow extends ReferralRow {
  referredUser: { name: string; email: string } | null
  affiliateUser: { name: string; email: string } | null
  affiliateReferralCode: string | null
  order: { amountPaid: number; status: string } | null
}

const COLUMNS = "referredUserId,affiliateId,orderId,commissionAmount,status,createdAt"

export async function listReferralsDetailed(): Promise<ReferralDetailedRow[]> {
  const supabase = createServiceRoleClient()
  // referrals.affiliateId is a direct FK to users.id (not to affiliates —
  // that table's userId is itself a 1:1 FK to users.id, so there's no
  // affiliates-level relationship for PostgREST to embed through). The
  // affiliate's referral code is fetched separately below and merged in.
  const { data, error } = await supabase
    .from("referrals")
    .select(
      `${COLUMNS},referredUser:users!referrals_referredUserId_fkey(name,email),affiliateUser:users!referrals_affiliateId_fkey(name,email),order:orders!referrals_orderId_fkey(amountPaid,status)`
    )
    .order("createdAt", { ascending: false })
  if (error) throw error
  const rows = (data as unknown as Omit<ReferralDetailedRow, "affiliateReferralCode">[]) ?? []

  const affiliateIds = Array.from(new Set(rows.map((r) => r.affiliateId).filter((id): id is string => !!id)))
  const codeByAffiliate = new Map<string, string>()
  if (affiliateIds.length > 0) {
    const { data: affRows, error: affError } = await supabase
      .from("affiliates")
      .select("userId,referralCode")
      .in("userId", affiliateIds)
    if (affError) throw affError
    for (const a of (affRows as { userId: string; referralCode: string }[]) ?? []) {
      codeByAffiliate.set(a.userId, a.referralCode)
    }
  }

  return rows.map((r) => ({ ...r, affiliateReferralCode: r.affiliateId ? codeByAffiliate.get(r.affiliateId) ?? null : null }))
}

export async function listReferralsForAffiliate(affiliateUserId: string): Promise<ReferralRow[]> {
  const supabase = createServiceRoleClient()
  const { data, error } = await supabase
    .from("referrals")
    .select(COLUMNS)
    .eq("affiliateId", affiliateUserId)
    .order("createdAt", { ascending: false })
  if (error) throw error
  return (data as ReferralRow[]) ?? []
}

export async function setReferralStatus(
  referredUserId: string,
  orderId: string,
  status: "pending" | "confirmed" | "paid"
): Promise<void> {
  const supabase = createServiceRoleClient()
  const { error } = await supabase
    .from("referrals")
    .update({ status })
    .eq("referredUserId", referredUserId)
    .eq("orderId", orderId)
  if (error) throw error
}

/**
 * Records affiliate commission for a paid order, if the buyer was referred
 * by an active affiliate. Safe to call more than once for the same order —
 * the (referredUserId, orderId) primary key makes the insert a no-op on repeat.
 */
export async function recordReferralIfApplicable(order: OrderRow): Promise<void> {
  if (!order.userId) return
  const user = await findUserById(order.userId)
  if (!user?.referredBy) return
  const affiliate = await findAffiliateByUserId(user.referredBy)
  if (!affiliate) return

  const commissionAmount = Math.round(order.amountPaid * (affiliate.commissionRate / 100) * 100) / 100
  const supabase = createServiceRoleClient()
  const { error } = await supabase.from("referrals").upsert(
    {
      referredUserId: user.id,
      affiliateId: affiliate.userId,
      orderId: order.id,
      commissionAmount,
      status: "pending",
    },
    { onConflict: "referredUserId,orderId", ignoreDuplicates: true }
  )
  if (error) throw error
}
