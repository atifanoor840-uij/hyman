import "server-only"

import { randomUUID } from "crypto"
import { createServiceRoleClient } from "@/lib/supabase/service"

export interface OrderRow {
  id: string
  userId: string | null
  planId: string | null
  couponUsed: string | null
  offerCode: string | null
  retryOfOrderId: string | null
  weekendHoldingAddon: boolean | null
  amountPaid: number
  paymentMethod: string
  status: string
  gatewayRef: string | null
  createdAt: string | null
  updatedAt: string | null
}

const COLUMNS =
  "id,userId,planId,couponUsed,offerCode,retryOfOrderId,weekendHoldingAddon,amountPaid,paymentMethod,status,gatewayRef,createdAt,updatedAt"

export async function listOrdersForUser(userId: string): Promise<OrderRow[]> {
  const supabase = createServiceRoleClient()
  const { data, error } = await supabase
    .from("orders")
    .select(COLUMNS)
    .eq("userId", userId)
    .order("createdAt", { ascending: false })
  if (error) throw error
  return (data as OrderRow[]) ?? []
}

export async function listAllOrders(): Promise<OrderRow[]> {
  const supabase = createServiceRoleClient()
  const { data, error } = await supabase.from("orders").select(COLUMNS).order("createdAt", { ascending: false })
  if (error) throw error
  return (data as OrderRow[]) ?? []
}

export async function findOrderById(id: string): Promise<OrderRow | null> {
  const supabase = createServiceRoleClient()
  const { data, error } = await supabase.from("orders").select(COLUMNS).eq("id", id).maybeSingle()
  if (error) throw error
  return (data as OrderRow | null) ?? null
}

export interface CreateOrderInput {
  userId: string
  planId: string
  amountPaid: number
  paymentMethod: string
  couponUsed?: string | null
  offerCode?: string | null
  /** Set when a free_retry entitlement creates this replacement order. */
  retryOfOrderId?: string | null
  weekendHoldingAddon?: boolean | null
  status?: string
}

export async function createOrder(input: CreateOrderInput): Promise<OrderRow> {
  const supabase = createServiceRoleClient()
  const { data, error } = await supabase
    .from("orders")
    .insert({
      id: randomUUID(),
      userId: input.userId,
      planId: input.planId,
      amountPaid: input.amountPaid,
      paymentMethod: input.paymentMethod,
      couponUsed: input.couponUsed ?? null,
      offerCode: input.offerCode ?? null,
      retryOfOrderId: input.retryOfOrderId ?? null,
      weekendHoldingAddon: input.weekendHoldingAddon ?? null,
      status: input.status ?? "pending_payment",
    })
    .select(COLUMNS)
    .single()
  if (error) throw error
  return data as OrderRow
}

export async function setOrderGatewayRef(orderId: string, gatewayRef: string): Promise<void> {
  const supabase = createServiceRoleClient()
  const { error } = await supabase
    .from("orders")
    .update({ gatewayRef, updatedAt: new Date().toISOString() })
    .eq("id", orderId)
  if (error) throw error
}

export async function updateOrderStatus(orderId: string, status: string): Promise<void> {
  const supabase = createServiceRoleClient()
  const { error } = await supabase
    .from("orders")
    .update({ status, updatedAt: new Date().toISOString() })
    .eq("id", orderId)
  if (error) throw error
}

export interface OrderWithPlan extends OrderRow {
  challenge_plans: { name: string; size: number; platform: string | null; price: number } | null
}

export async function listOrdersForUserDetailed(userId: string): Promise<OrderWithPlan[]> {
  const supabase = createServiceRoleClient()
  const { data, error } = await supabase
    .from("orders")
    .select(`${COLUMNS},challenge_plans(name,size,platform,price)`)
    .eq("userId", userId)
    .order("createdAt", { ascending: false })
  if (error) throw error
  return (data as unknown as OrderWithPlan[]) ?? []
}

export async function findOrderByGatewayRef(gatewayRef: string): Promise<OrderRow | null> {
  const supabase = createServiceRoleClient()
  const { data, error } = await supabase.from("orders").select(COLUMNS).eq("gatewayRef", gatewayRef).maybeSingle()
  if (error) throw error
  return (data as OrderRow | null) ?? null
}
