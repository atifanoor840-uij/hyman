import { getApiBaseUrl } from "@/lib/api"
import { getAuthToken } from "@/lib/auth-utils"
import { ApiClientError } from "@/lib/api/client"

export type AdminOrderTimelineEvent = {
  event_type: string
  event_date: string
  notes?: string
}

export type AdminOrder = {
  id: number
  order_id: string
  username: string
  email: string
  amount: number
  challenge_type: string
  account_size: string
  platform: string
  payment_method: string
  payment_status: string | null
  status_type?: string | null
  is_active?: boolean
  timeline?: AdminOrderTimelineEvent[]
  completed?: boolean
  account_status?: string | null
  checkout_session_url?: string | null
  completed_at?: string | null
  graph_link?: string | null
  admin_access_password_plain?: string | null
  // allow extra fields without breaking
  [key: string]: any
}

export async function listAllOrders(): Promise<AdminOrder[]> {
  const token = getAuthToken()
  if (!token) throw new ApiClientError("Missing access token. Please sign in again.", 401)

  const url = `${getApiBaseUrl()}/orders/list/all`
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
  return data as AdminOrder[]
}

export type UpdateOrderCredentialPayload = {
  platform_login?: string
  platform_password?: string
  server?: string
  profit_target?: string | number
  account_status?: string
  status_type?: string
  fail_reason?: string
}

async function readResponse(res: Response) {
  const contentType = res.headers.get("content-type") || ""
  const isJson = contentType.includes("application/json")
  return isJson ? await res.json().catch(() => null) : await res.text().catch(() => null)
}

export async function updateOrderCredential(
  orderId: number | string,
  credentialId: number | string,
  payload: UpdateOrderCredentialPayload
): Promise<any> {
  const token = getAuthToken()
  if (!token) throw new ApiClientError("Missing access token. Please sign in again.", 401)

  const url = `${getApiBaseUrl()}/orders/detail/${encodeURIComponent(String(orderId))}/credentials/${encodeURIComponent(String(credentialId))}`
  const form = new FormData()
  ;(
    [
      "platform_login",
      "platform_password",
      "server",
      "profit_target",
      "account_status",
      "status_type",
      "fail_reason",
    ] as const
  ).forEach((k) => {
    const v = payload[k]
    if (v === undefined || v === null) return
    form.append(k, String(v))
  })

  const attempt = async (method: "PUT" | "POST") => {
    let res: Response
    try {
      res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: form,
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
    return data
  }

  try {
    return await attempt("PUT")
  } catch (e) {
    // Some backends only allow POST for form-data updates.
    if (e instanceof ApiClientError && (e.status === 405 || e.status === 404)) {
      return await attempt("POST")
    }
    throw e
  }
}

export type CompleteByCredentialPayload = {
  credential_id: number | string
  profit_target?: string | number
  graph_link?: string
}

export async function completeOrderByCredential(
  orderId: number | string,
  payload: CompleteByCredentialPayload
): Promise<any> {
  const token = getAuthToken()
  if (!token) throw new ApiClientError("Missing access token. Please sign in again.", 401)

  const url = `${getApiBaseUrl()}/orders/detail/${encodeURIComponent(String(orderId))}/complete/by-credential`
  const form = new FormData()
  form.append("credential_id", String(payload.credential_id))
  if (payload.profit_target != null) form.append("profit_target", String(payload.profit_target))
  // backend auto-generates graph_link; send empty string when requested
  form.append("graph_link", payload.graph_link ?? "")

  let res: Response
  try {
    res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: form,
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
  return data
}

export type CompleteOrderPayload = {
  server?: string
  platform_login?: string
  platform_password?: string
  profit_target?: string | number
  graph_link?: string
}

export async function completeOrder(
  orderId: number | string,
  payload: CompleteOrderPayload
): Promise<any> {
  const token = getAuthToken()
  if (!token) throw new ApiClientError("Missing access token. Please sign in again.", 401)

  const url = `${getApiBaseUrl()}/orders/detail/${encodeURIComponent(String(orderId))}/complete`
  const form = new FormData()
  ;(["server", "platform_login", "platform_password", "profit_target", "graph_link"] as const).forEach((k) => {
    const v = payload[k]
    if (v === undefined || v === null) return
    form.append(k, String(v))
  })

  let res: Response
  try {
    res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: form,
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
  return data
}

