import "server-only"

import { randomUUID } from "crypto"
import { createServiceRoleClient } from "@/lib/supabase/service"

export interface CertificateRow {
  id: string
  userId: string | null
  accountId: string | null
  traderName: string
  accountSize: number
  planName: string
  datePassed: string
}

const COLUMNS = "id,userId,accountId,traderName,accountSize,planName,datePassed"

export async function listCertificatesForUser(userId: string): Promise<CertificateRow[]> {
  const supabase = createServiceRoleClient()
  const { data, error } = await supabase
    .from("certificates")
    .select(COLUMNS)
    .eq("userId", userId)
    .order("datePassed", { ascending: false })
  if (error) throw error
  return (data as CertificateRow[]) ?? []
}

export async function issueCertificate(input: {
  userId: string
  accountId: string | null
  traderName: string
  accountSize: number
  planName: string
}): Promise<void> {
  const supabase = createServiceRoleClient()
  const { error } = await supabase.from("certificates").insert({
    id: randomUUID(),
    userId: input.userId,
    accountId: input.accountId,
    traderName: input.traderName,
    accountSize: input.accountSize,
    planName: input.planName,
  })
  if (error) throw error
}
