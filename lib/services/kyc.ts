import "server-only"

import { createServiceRoleClient } from "@/lib/supabase/service"

export interface KycRow {
  userId: string
  documentType: string
  frontUrl: string | null
  backUrl: string | null
  selfieUrl: string | null
  addressUrl: string | null
  status: string
  rejectReason: string | null
  updatedAt: string | null
}

const COLUMNS = "userId,documentType,frontUrl,backUrl,selfieUrl,addressUrl,status,rejectReason,updatedAt"
const BUCKET = "kyc-documents"

export async function getKycForUser(userId: string): Promise<KycRow | null> {
  const supabase = createServiceRoleClient()
  const { data, error } = await supabase.from("kyc").select(COLUMNS).eq("userId", userId).maybeSingle()
  if (error) throw error
  return (data as KycRow | null) ?? null
}

export async function listAllKyc(): Promise<KycRow[]> {
  const supabase = createServiceRoleClient()
  const { data, error } = await supabase.from("kyc").select(COLUMNS).order("updatedAt", { ascending: false })
  if (error) throw error
  return (data as KycRow[]) ?? []
}

export async function uploadKycDocument(userId: string, field: string, file: File): Promise<string> {
  const supabase = createServiceRoleClient()
  const ext = file.name.split(".").pop() || "bin"
  const path = `${userId}/${field}-${Date.now()}.${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())
  const { error } = await supabase.storage.from(BUCKET).upload(path, buffer, {
    contentType: file.type || "application/octet-stream",
    upsert: true,
  })
  if (error) throw error
  return path
}

export interface SubmitKycInput {
  userId: string
  documentType: string
  frontPath?: string | null
  backPath?: string | null
  selfiePath?: string | null
  addressPath?: string | null
}

export async function submitKyc(input: SubmitKycInput): Promise<void> {
  const supabase = createServiceRoleClient()
  const { error } = await supabase.from("kyc").upsert({
    userId: input.userId,
    documentType: input.documentType,
    frontUrl: input.frontPath ?? null,
    backUrl: input.backPath ?? null,
    selfieUrl: input.selfiePath ?? null,
    addressUrl: input.addressPath ?? null,
    status: "pending",
    rejectReason: null,
    updatedAt: new Date().toISOString(),
  })
  if (error) throw error
}

export async function setKycStatus(userId: string, status: "approved" | "rejected", rejectReason?: string): Promise<void> {
  const supabase = createServiceRoleClient()
  const { error } = await supabase
    .from("kyc")
    .update({ status, rejectReason: rejectReason ?? null, updatedAt: new Date().toISOString() })
    .eq("userId", userId)
  if (error) throw error
}

/** Signed URL valid for 10 minutes, for admin review only (bucket is private). */
export async function getSignedKycUrl(path: string): Promise<string | null> {
  if (!path) return null
  const supabase = createServiceRoleClient()
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, 600)
  if (error) return null
  return data.signedUrl
}
