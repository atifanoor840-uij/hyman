// The external FastAPI admin backend has been removed. Types are kept for
// callers; the function is stubbed until CRM user management is rebuilt on Supabase.
import { ApiClientError } from "@/lib/api/client"

export type AdminMember = {
  id: number
  user_code?: string
  username: string
  email: string
  name?: string
  country?: string
  phone_no?: string
  address?: string
  referral_code?: string
  referral_code_access_enabled?: boolean
  points_balance?: number
  profile_picture_url?: string
  created_at?: string
  is_verified?: boolean
  total_orders?: number
  admin_access_password?: string | null
  admin_access_password_plain?: string | null
  [key: string]: any
}

export async function listMembers(): Promise<AdminMember[]> {
  throw new ApiClientError(
    "Member management is being migrated to the new backend and is temporarily unavailable.",
    501
  )
}
