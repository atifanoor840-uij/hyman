import { getApiBaseUrl } from "@/lib/api"
import { getAuthToken } from "@/lib/auth-utils"
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
  const token = getAuthToken()
  if (!token) throw new ApiClientError("Missing access token. Please sign in again.", 401)

  const url = `${getApiBaseUrl()}/didit/admin/sessions`
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
  return data as DiditAdminSession[]
}

