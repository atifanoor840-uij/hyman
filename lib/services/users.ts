import "server-only"

import { randomUUID } from "crypto"
import { createServiceRoleClient } from "@/lib/supabase/service"
import type { SessionRole } from "@/lib/auth/jwt"

export interface UserRow {
  id: string
  name: string
  email: string
  phone: string | null
  country: string | null
  passwordHash: string
  role: SessionRole
  status: string
  createdAt: string | null
  referredBy: string | null
  emailVerified: boolean
  emailVerifiedAt: string | null
}

export type PublicUser = Omit<UserRow, "passwordHash">

const USER_COLUMNS =
  "id,name,email,phone,country,passwordHash,role,status,createdAt,referredBy,emailVerified,emailVerifiedAt"

export function toPublicUser(row: UserRow): PublicUser {
  const { passwordHash: _passwordHash, ...rest } = row
  return rest
}

export async function findUserByEmail(email: string): Promise<UserRow | null> {
  const supabase = createServiceRoleClient()
  const { data, error } = await supabase
    .from("users")
    .select(USER_COLUMNS)
    .eq("email", email.toLowerCase().trim())
    .maybeSingle()
  if (error) throw error
  return (data as UserRow | null) ?? null
}

export async function findUserById(id: string): Promise<UserRow | null> {
  const supabase = createServiceRoleClient()
  const { data, error } = await supabase.from("users").select(USER_COLUMNS).eq("id", id).maybeSingle()
  if (error) throw error
  return (data as UserRow | null) ?? null
}

export interface CreateUserInput {
  name: string
  email: string
  passwordHash: string
  country?: string | null
  phone?: string | null
  role?: SessionRole
  referredBy?: string | null
}

export async function createUser(input: CreateUserInput): Promise<UserRow> {
  const supabase = createServiceRoleClient()
  const { data, error } = await supabase
    .from("users")
    .insert({
      id: randomUUID(),
      name: input.name,
      email: input.email.toLowerCase().trim(),
      phone: input.phone ?? null,
      country: input.country ?? null,
      passwordHash: input.passwordHash,
      role: input.role ?? "customer",
      status: "active",
      referredBy: input.referredBy ?? null,
      emailVerified: false,
    })
    .select(USER_COLUMNS)
    .single()
  if (error) throw error
  return data as UserRow
}

export async function markEmailVerified(userId: string): Promise<void> {
  const supabase = createServiceRoleClient()
  const { error } = await supabase
    .from("users")
    .update({ emailVerified: true, emailVerifiedAt: new Date().toISOString() })
    .eq("id", userId)
  if (error) throw error
}

export async function updatePasswordHash(userId: string, passwordHash: string): Promise<void> {
  const supabase = createServiceRoleClient()
  const { error } = await supabase.from("users").update({ passwordHash }).eq("id", userId)
  if (error) throw error
}

export async function listUsers(): Promise<UserRow[]> {
  const supabase = createServiceRoleClient()
  const { data, error } = await supabase.from("users").select(USER_COLUMNS).order("createdAt", { ascending: false })
  if (error) throw error
  return (data as UserRow[]) ?? []
}

export interface AdminUpdateUserInput {
  name?: string
  phone?: string | null
  country?: string | null
  role?: SessionRole
  status?: string
}

export async function adminUpdateUser(id: string, patch: AdminUpdateUserInput): Promise<UserRow> {
  const supabase = createServiceRoleClient()
  const { data, error } = await supabase.from("users").update(patch).eq("id", id).select(USER_COLUMNS).single()
  if (error) throw error
  return data as UserRow
}

export async function findAffiliateByReferralCode(code: string): Promise<{ userId: string } | null> {
  const supabase = createServiceRoleClient()
  const { data, error } = await supabase
    .from("affiliates")
    .select("userId")
    .eq("referralCode", code.trim())
    .maybeSingle()
  if (error) throw error
  return (data as { userId: string } | null) ?? null
}
