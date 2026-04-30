import { getApiBaseUrl } from "@/lib/api"
import { getAuthToken } from "@/lib/auth-utils"
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
  const token = getAuthToken()
  if (!token) throw new ApiClientError("Missing access token. Please sign in again.", 401)

  const url = `${getApiBaseUrl()}/auth/members`
  let res: Response
  try {
    res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Network error"
    throw new ApiClientError(msg || "Network error", 0)
  }

  const contentType = res.headers.get("content-type") || ""
  const isJson = contentType.includes("application/json")
  const data = isJson ? await res.json().catch(() => null) : await res.text().catch(() => null)

  if (!res.ok) {
    const message =
      (typeof data === "object" && data && ((data as any).message || (data as any).error)) ||
      (typeof data === "string" && data) ||
      `Request failed with status ${res.status}`
    throw new ApiClientError(String(message), res.status)
  }

  if (!Array.isArray(data)) return []
  return data as AdminMember[]
}

