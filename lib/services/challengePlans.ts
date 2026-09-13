import "server-only"

import { randomUUID } from "crypto"
import { createServiceRoleClient } from "@/lib/supabase/service"

export interface ChallengePlanRow {
  id: string
  name: string
  size: number
  price: number
  profitTargetP1: number
  profitTargetP2: number
  maxDailyLoss: number
  maxTotalLoss: number
  profitSplit: number
  platform: string | null
}

const PLAN_COLUMNS =
  "id,name,size,price,profitTargetP1,profitTargetP2,maxDailyLoss,maxTotalLoss,profitSplit,platform"

export async function listChallengePlans(): Promise<ChallengePlanRow[]> {
  const supabase = createServiceRoleClient()
  const { data, error } = await supabase.from("challenge_plans").select(PLAN_COLUMNS).order("size", { ascending: true })
  if (error) throw error
  return (data as ChallengePlanRow[]) ?? []
}

export async function findChallengePlanById(id: string): Promise<ChallengePlanRow | null> {
  const supabase = createServiceRoleClient()
  const { data, error } = await supabase.from("challenge_plans").select(PLAN_COLUMNS).eq("id", id).maybeSingle()
  if (error) throw error
  return (data as ChallengePlanRow | null) ?? null
}

export interface CreateChallengePlanInput {
  name: string
  size: number
  price: number
  profitTargetP1: number
  profitTargetP2: number
  maxDailyLoss: number
  maxTotalLoss: number
  profitSplit: number
  platform?: string | null
}

export async function createChallengePlan(input: CreateChallengePlanInput): Promise<ChallengePlanRow> {
  const supabase = createServiceRoleClient()
  const { data, error } = await supabase
    .from("challenge_plans")
    .insert({ id: randomUUID(), ...input, platform: input.platform ?? null })
    .select(PLAN_COLUMNS)
    .single()
  if (error) throw error
  return data as ChallengePlanRow
}

export async function updateChallengePlan(
  id: string,
  patch: Partial<CreateChallengePlanInput>
): Promise<ChallengePlanRow> {
  const supabase = createServiceRoleClient()
  const { data, error } = await supabase.from("challenge_plans").update(patch).eq("id", id).select(PLAN_COLUMNS).single()
  if (error) throw error
  return data as ChallengePlanRow
}

export async function deleteChallengePlan(id: string): Promise<void> {
  const supabase = createServiceRoleClient()
  const { error } = await supabase.from("challenge_plans").delete().eq("id", id)
  if (error) throw error
}
