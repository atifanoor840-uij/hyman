import "server-only"

import { createServiceRoleClient } from "@/lib/supabase/service"

export interface AdminOrderRow {
  id: string
  userId: string | null
  planId: string | null
  couponUsed: string | null
  amountPaid: number
  paymentMethod: string
  status: string
  gatewayRef: string | null
  createdAt: string | null
  updatedAt: string | null
  users: { name: string; email: string } | null
  challenge_plans: { name: string; size: number; platform: string | null } | null
}

export async function listAllOrdersDetailed(): Promise<AdminOrderRow[]> {
  const supabase = createServiceRoleClient()
  const { data, error } = await supabase
    .from("orders")
    .select(
      "id,userId,planId,couponUsed,amountPaid,paymentMethod,status,gatewayRef,createdAt,updatedAt,users!orders_userId_fkey(name,email),challenge_plans(name,size,platform)"
    )
    .order("createdAt", { ascending: false })
  if (error) throw error
  return (data as unknown as AdminOrderRow[]) ?? []
}

export interface AdminOrderDetailRow extends Omit<AdminOrderRow, "users" | "challenge_plans"> {
  users: { name: string; email: string; phone: string | null; country: string | null; status: string; createdAt: string | null } | null
  challenge_plans: { name: string; size: number; platform: string | null; price: number } | null
}

export async function findOrderDetailed(id: string): Promise<AdminOrderDetailRow | null> {
  const supabase = createServiceRoleClient()
  const { data, error } = await supabase
    .from("orders")
    .select(
      "id,userId,planId,couponUsed,amountPaid,paymentMethod,status,gatewayRef,createdAt,updatedAt,users!orders_userId_fkey(name,email,phone,country,status,createdAt),challenge_plans(name,size,platform,price)"
    )
    .eq("id", id)
    .maybeSingle()
  if (error) throw error
  return (data as unknown as AdminOrderDetailRow | null) ?? null
}
