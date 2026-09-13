import "server-only"

import { randomUUID } from "crypto"
import { createServiceRoleClient } from "@/lib/supabase/service"

export interface InventoryRow {
  id: string
  platform: string
  size: number
  login: string
  password: string
  server: string
  externalStatisticsId: string | null
  status: string
  orderId: string | null
  createdAt: string | null
}

const COLUMNS = "id,platform,size,login,password,server,externalStatisticsId,status,orderId,createdAt"

export async function listInventory(): Promise<InventoryRow[]> {
  const supabase = createServiceRoleClient()
  const { data, error } = await supabase.from("challenge_inventory").select(COLUMNS).order("createdAt", { ascending: false })
  if (error) throw error
  return (data as InventoryRow[]) ?? []
}

export async function findAvailableInventory(platform: string, size: number): Promise<InventoryRow | null> {
  const supabase = createServiceRoleClient()
  const { data, error } = await supabase
    .from("challenge_inventory")
    .select(COLUMNS)
    .eq("platform", platform)
    .eq("size", size)
    .eq("status", "available")
    .limit(1)
    .maybeSingle()
  if (error) throw error
  return (data as InventoryRow | null) ?? null
}

/** Atomically claims an available inventory row. Returns false if it was already taken. */
export async function assignInventory(inventoryId: string, orderId: string): Promise<boolean> {
  const supabase = createServiceRoleClient()
  const { data, error } = await supabase
    .from("challenge_inventory")
    .update({ status: "assigned", orderId })
    .eq("id", inventoryId)
    .eq("status", "available")
    .select("id")
  if (error) throw error
  return (data?.length ?? 0) > 0
}

/** Puts a claimed inventory row back if delivery could not be completed. */
export async function releaseInventory(inventoryId: string): Promise<void> {
  const supabase = createServiceRoleClient()
  const { error } = await supabase
    .from("challenge_inventory")
    .update({ status: "available", orderId: null })
    .eq("id", inventoryId)
  if (error) throw error
}

export interface CreateInventoryInput {
  platform: string
  size: number
  login: string
  password: string
  server: string
  externalStatisticsId?: string | null
}

export async function createInventory(input: CreateInventoryInput): Promise<InventoryRow> {
  const supabase = createServiceRoleClient()
  const { data, error } = await supabase
    .from("challenge_inventory")
    .insert({
      id: randomUUID(),
      platform: input.platform,
      size: input.size,
      login: input.login,
      password: input.password,
      server: input.server,
      externalStatisticsId: input.externalStatisticsId ?? null,
      status: "available",
    })
    .select(COLUMNS)
    .single()
  if (error) throw error
  return data as InventoryRow
}

export async function updateInventory(id: string, patch: Partial<CreateInventoryInput> & { status?: string }): Promise<InventoryRow> {
  const supabase = createServiceRoleClient()
  const { data, error } = await supabase.from("challenge_inventory").update(patch).eq("id", id).select(COLUMNS).single()
  if (error) throw error
  return data as InventoryRow
}

export async function deleteInventory(id: string): Promise<void> {
  const supabase = createServiceRoleClient()
  const { error } = await supabase.from("challenge_inventory").delete().eq("id", id)
  if (error) throw error
}
