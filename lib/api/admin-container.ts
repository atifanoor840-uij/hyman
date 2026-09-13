// The external FastAPI admin backend has been removed. Types are kept for
// callers; functions are stubbed until challenge_inventory is rebuilt on Supabase.
import { ApiClientError } from "@/lib/api/client"

export type AccountCredential = {
  id: number
  platform: string
  server: string
  platform_login: string
  platform_password: string
  account_size: string
  graph_link?: string | null
  profit_target?: number | null
  is_assigned?: boolean
  order_id?: number | null
  created_at?: string | null
  updated_at?: string | null
  status?: string | null
  [key: string]: any
}

const NOT_MIGRATED_MESSAGE =
  "Account inventory management is being migrated to the new backend and is temporarily unavailable."

export async function listAccountCredentials(): Promise<AccountCredential[]> {
  throw new ApiClientError(NOT_MIGRATED_MESSAGE, 501)
}

export type UpsertAccountCredential = {
  platform: string
  server: string
  platform_login: string
  platform_password: string
  account_size: string
  status?: string | null
  graph_link?: string | null
  profit_target?: number | null
  is_assigned?: boolean
  order_id?: number | null
  [key: string]: any
}

export type UpsertAccountCredentialsPayload = {
  credentials: Array<{
    platform: string
    server: string
    platform_login: string
    platform_password: string
    account_size: string
    graph_link?: string | null
  }>
}

export async function upsertAccountCredentials(_payload: UpsertAccountCredentialsPayload): Promise<any> {
  throw new ApiClientError(NOT_MIGRATED_MESSAGE, 501)
}

export async function createAccountCredential(_payload: UpsertAccountCredential): Promise<AccountCredential> {
  throw new ApiClientError(NOT_MIGRATED_MESSAGE, 501)
}

export async function updateAccountCredential(
  _id: number,
  _payload: Partial<UpsertAccountCredential>
): Promise<AccountCredential> {
  throw new ApiClientError(NOT_MIGRATED_MESSAGE, 501)
}

export async function deleteAccountCredential(_id: number | string): Promise<any> {
  throw new ApiClientError(NOT_MIGRATED_MESSAGE, 501)
}
