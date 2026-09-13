import "server-only"

import { randomUUID } from "crypto"
import { createServiceRoleClient } from "@/lib/supabase/service"
import type { InventoryRow } from "./challengeInventory"

export interface TradingAccountRow {
  id: string
  userId: string | null
  orderId: string | null
  platform: string
  login: string
  passwordMaster: string | null
  passwordInvestor: string | null
  server: string
  profitTarget: number
  balance: number
  equity: number
  todayPl: number
  totalPl: number
  status: string
  phase: string | null
  graphLink: string | null
  deliveryStatus: string
  deliveredAt: string | null
  createdAt: string | null
  externalStatisticsId: string | null
}

const COLUMNS =
  "id,userId,orderId,platform,login,passwordMaster,passwordInvestor,server,profitTarget,balance,equity,todayPl,totalPl,status,phase,graphLink,deliveryStatus,deliveredAt,createdAt,externalStatisticsId"

export async function listAccountsForUser(userId: string): Promise<TradingAccountRow[]> {
  const supabase = createServiceRoleClient()
  const { data, error } = await supabase
    .from("trading_accounts")
    .select(COLUMNS)
    .eq("userId", userId)
    .order("createdAt", { ascending: false })
  if (error) throw error
  return (data as TradingAccountRow[]) ?? []
}

export async function listAllAccounts(): Promise<TradingAccountRow[]> {
  const supabase = createServiceRoleClient()
  const { data, error } = await supabase.from("trading_accounts").select(COLUMNS).order("createdAt", { ascending: false })
  if (error) throw error
  return (data as TradingAccountRow[]) ?? []
}

export async function listAccountsForOrder(orderId: string): Promise<TradingAccountRow[]> {
  const supabase = createServiceRoleClient()
  const { data, error } = await supabase
    .from("trading_accounts")
    .select(COLUMNS)
    .eq("orderId", orderId)
    .order("createdAt", { ascending: false })
  if (error) throw error
  return (data as TradingAccountRow[]) ?? []
}

export async function findAccountById(id: string): Promise<TradingAccountRow | null> {
  const supabase = createServiceRoleClient()
  const { data, error } = await supabase.from("trading_accounts").select(COLUMNS).eq("id", id).maybeSingle()
  if (error) throw error
  return (data as TradingAccountRow | null) ?? null
}

export interface CreateAccountFromInventoryInput {
  userId: string
  orderId: string
  inventory: InventoryRow
  profitTarget: number
  phase: string
}

export async function createAccountFromInventory(input: CreateAccountFromInventoryInput): Promise<TradingAccountRow> {
  const supabase = createServiceRoleClient()
  const { data, error } = await supabase
    .from("trading_accounts")
    .insert({
      id: randomUUID(),
      userId: input.userId,
      orderId: input.orderId,
      platform: input.inventory.platform,
      login: input.inventory.login,
      passwordMaster: input.inventory.password,
      passwordInvestor: null,
      server: input.inventory.server,
      profitTarget: input.profitTarget,
      balance: input.inventory.size,
      equity: input.inventory.size,
      todayPl: 0,
      totalPl: 0,
      status: "active",
      phase: input.phase,
      deliveryStatus: "delivered",
      deliveredAt: new Date().toISOString(),
      externalStatisticsId: input.inventory.externalStatisticsId,
    })
    .select(COLUMNS)
    .single()
  if (error) throw error
  return data as TradingAccountRow
}

export interface CreateManualAccountInput {
  userId: string
  orderId: string
  platform: string
  login: string
  passwordMaster: string
  server: string
  profitTarget: number
  balance: number
  phase: string
  graphLink?: string | null
}

export async function createManualAccount(input: CreateManualAccountInput): Promise<TradingAccountRow> {
  const supabase = createServiceRoleClient()
  const { data, error } = await supabase
    .from("trading_accounts")
    .insert({
      id: randomUUID(),
      userId: input.userId,
      orderId: input.orderId,
      platform: input.platform,
      login: input.login,
      passwordMaster: input.passwordMaster,
      server: input.server,
      profitTarget: input.profitTarget,
      balance: input.balance,
      equity: input.balance,
      todayPl: 0,
      totalPl: 0,
      status: "active",
      phase: input.phase,
      graphLink: input.graphLink ?? null,
      deliveryStatus: "delivered",
      deliveredAt: new Date().toISOString(),
    })
    .select(COLUMNS)
    .single()
  if (error) throw error
  return data as TradingAccountRow
}

export async function updateAccountStatus(id: string, status: string): Promise<void> {
  const supabase = createServiceRoleClient()
  const { error } = await supabase.from("trading_accounts").update({ status }).eq("id", id)
  if (error) throw error
}

export async function updateAccountStatusForOrder(orderId: string, status: string): Promise<void> {
  const supabase = createServiceRoleClient()
  const { error } = await supabase.from("trading_accounts").update({ status }).eq("orderId", orderId).eq("status", "active")
  if (error) throw error
}
