import { getApiBaseUrl } from "@/lib/api"
import { getAuthToken } from "@/lib/auth-utils"
import { ApiClientError } from "@/lib/api/client"

export type AccountCredential = {
  id: number
  platform: string
  server: string
  platform_login: string
  platform_password: string
  account_size: string
  graph_link?: string | null
  is_assigned?: boolean
  order_id?: number | null
  created_at?: string | null
  updated_at?: string | null
  status?: string | null
  [key: string]: any
}

export async function listAccountCredentials(): Promise<AccountCredential[]> {
  const url = `${getApiBaseUrl()}/accounts/credentials`
  let res: Response
  try {
    res = await fetch(url, { method: "GET" })
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
  return data as AccountCredential[]
}

export type UpsertAccountCredential = {
  platform: string
  server: string
  platform_login: string
  platform_password: string
  account_size: string
  status?: string | null
  graph_link?: string | null
  is_assigned?: boolean
  order_id?: number | null
  [key: string]: any
}

async function readResponse(res: Response) {
  const contentType = res.headers.get("content-type") || ""
  const isJson = contentType.includes("application/json")
  return isJson ? await res.json().catch(() => null) : await res.text().catch(() => null)
}

export async function createAccountCredential(payload: UpsertAccountCredential): Promise<AccountCredential> {
  const token = getAuthToken()
  const url = `${getApiBaseUrl()}/accounts/credentials`
  let res: Response
  try {
    res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
      credentials: "omit",
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Network error"
    throw new ApiClientError(msg || "Network error", 0)
  }
  const data = await readResponse(res)
  if (!res.ok) {
    const message =
      (typeof data === "object" && data && ((data as any).message || (data as any).error)) ||
      (typeof data === "string" && data) ||
      `Request failed with status ${res.status}`
    throw new ApiClientError(String(message), res.status)
  }
  return (typeof data === "object" && data ? (data as AccountCredential) : ({} as AccountCredential))
}

export async function updateAccountCredential(
  id: number,
  payload: Partial<UpsertAccountCredential>
): Promise<AccountCredential> {
  const token = getAuthToken()
  const url = `${getApiBaseUrl()}/accounts/credentials/${encodeURIComponent(String(id))}`
  let res: Response
  try {
    res = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
      credentials: "omit",
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Network error"
    throw new ApiClientError(msg || "Network error", 0)
  }
  const data = await readResponse(res)
  if (!res.ok) {
    const message =
      (typeof data === "object" && data && ((data as any).message || (data as any).error)) ||
      (typeof data === "string" && data) ||
      `Request failed with status ${res.status}`
    throw new ApiClientError(String(message), res.status)
  }
  return (typeof data === "object" && data ? (data as AccountCredential) : ({} as AccountCredential))
}

