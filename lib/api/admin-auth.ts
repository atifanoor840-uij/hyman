// The external FastAPI admin backend has been removed. Types are kept for
// callers; the function is stubbed until CRM auth is rebuilt on Supabase.
import { ApiClientError } from "./client"

export type AdminSignin2faRequest = {
  email: string
  password: string
  two_factor_code: string
}

export type AdminSignin2faResponse = {
  access_token?: string
  token?: string
  [key: string]: any
}

export async function adminSignin2fa(_payload: AdminSignin2faRequest): Promise<AdminSignin2faResponse> {
  throw new ApiClientError(
    "Admin sign-in is being migrated to the new backend and is temporarily unavailable.",
    501
  )
}
