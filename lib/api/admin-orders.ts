// The external FastAPI admin backend has been removed. Types are kept for
// callers; functions are stubbed until admin order management is rebuilt on Supabase.
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

const NOT_MIGRATED_MESSAGE =
  "Order management is being migrated to the new backend and is temporarily unavailable."

export async function listAllOrders(): Promise<AdminOrder[]> {
  throw new ApiClientError(NOT_MIGRATED_MESSAGE, 501)
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

export async function updateOrderCredential(
  _orderId: number | string,
  _credentialId: number | string,
  _payload: UpdateOrderCredentialPayload
): Promise<any> {
  throw new ApiClientError(NOT_MIGRATED_MESSAGE, 501)
}

export type CompleteByCredentialPayload = {
  credential_id: number | string
  profit_target?: string | number
  graph_link?: string
}

export async function completeOrderByCredential(
  _orderId: number | string,
  _payload: CompleteByCredentialPayload
): Promise<any> {
  throw new ApiClientError(NOT_MIGRATED_MESSAGE, 501)
}

export type CompleteOrderPayload = {
  server?: string
  platform_login?: string
  platform_password?: string
  profit_target?: string | number
  graph_link?: string
}

export async function completeOrder(_orderId: number | string, _payload: CompleteOrderPayload): Promise<any> {
  throw new ApiClientError(NOT_MIGRATED_MESSAGE, 501)
}

export async function passOrder(
  _orderId: number | string,
  _payload: { profit_amount: string | number }
): Promise<any> {
  throw new ApiClientError(NOT_MIGRATED_MESSAGE, 501)
}

export type FailOrderPayload = {
  date_time: string
  details: string
  reason: string
}

export async function failOrder(_orderId: number | string, _payload: FailOrderPayload): Promise<any> {
  throw new ApiClientError(NOT_MIGRATED_MESSAGE, 501)
}
