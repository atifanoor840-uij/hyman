import "server-only"

import { randomUUID } from "crypto"
import { createServiceRoleClient } from "@/lib/supabase/service"

export interface PayoutRow {
  id: string
  accountId: string | null
  userId: string | null
  amount: number
  profitSplitAmount: number
  firmShareAmount: number
  paymentMethod: string
  paymentDetails: string
  status: string
  approvedBy: string | null
  approvedAt: string | null
  notes: string | null
  createdAt: string | null
}

const COLUMNS =
  "id,accountId,userId,amount,profitSplitAmount,firmShareAmount,paymentMethod,paymentDetails,status,approvedBy,approvedAt,notes,createdAt"

export async function listPayoutsForUser(userId: string): Promise<PayoutRow[]> {
  const supabase = createServiceRoleClient()
  const { data, error } = await supabase
    .from("payouts")
    .select(COLUMNS)
    .eq("userId", userId)
    .order("createdAt", { ascending: false })
  if (error) throw error
  return (data as PayoutRow[]) ?? []
}

export async function listAllPayouts(): Promise<PayoutRow[]> {
  const supabase = createServiceRoleClient()
  const { data, error } = await supabase.from("payouts").select(COLUMNS).order("createdAt", { ascending: false })
  if (error) throw error
  return (data as PayoutRow[]) ?? []
}

export interface CreatePayoutInput {
  userId: string
  accountId: string
  amount: number
  profitSplitPercent: number
  paymentMethod: string
  paymentDetails: string
}

export async function createPayoutRequest(input: CreatePayoutInput): Promise<PayoutRow> {
  const supabase = createServiceRoleClient()
  const profitSplitAmount = Math.round(input.amount * (input.profitSplitPercent / 100) * 100) / 100
  const firmShareAmount = Math.round((input.amount - profitSplitAmount) * 100) / 100

  const { data, error } = await supabase
    .from("payouts")
    .insert({
      id: randomUUID(),
      accountId: input.accountId,
      userId: input.userId,
      amount: input.amount,
      profitSplitAmount,
      firmShareAmount,
      paymentMethod: input.paymentMethod,
      paymentDetails: input.paymentDetails,
      status: "requested",
    })
    .select(COLUMNS)
    .single()
  if (error) throw error
  return data as PayoutRow
}

export async function setPayoutStatus(
  id: string,
  status: "approved" | "rejected" | "paid",
  approvedBy: string,
  notes?: string
): Promise<void> {
  const supabase = createServiceRoleClient()
  const { error } = await supabase
    .from("payouts")
    .update({
      status,
      approvedBy,
      approvedAt: new Date().toISOString(),
      notes: notes ?? null,
    })
    .eq("id", id)
  if (error) throw error
}
