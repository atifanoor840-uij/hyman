// The external FastAPI admin backend has been removed. Types are kept for
// callers; the function is stubbed until admin KYC review is rebuilt on Supabase.
import { ApiClientError } from "@/lib/api/client"

export type DiditAdminSession = {
  id: number
  session_token?: string | null
  workflow_id?: string | null
  callback_url?: string | null
  last_webhook_type?: string | null
  created_at?: string | null
  user_id?: number | null
  verification_url?: string | null
  session_id?: string | null
  vendor_data?: string | null
  status?: string | null
  decision_json?: any
  updated_at?: string | null
  [key: string]: any
}

export async function listDiditSessions(): Promise<DiditAdminSession[]> {
  throw new ApiClientError(
    "KYC review is being migrated to the new backend and is temporarily unavailable.",
    501
  )
}
