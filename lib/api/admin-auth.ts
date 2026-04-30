import { ApiClientError } from "./client"

function getApiBaseUrl(): string {
  const url =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "https://genz-34f298f57a04.herokuapp.com"
  return (typeof url === "string" && url.trim() ? url : "https://genz-34f298f57a04.herokuapp.com").replace(/\/$/, "")
}

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

export async function adminSignin2fa(payload: AdminSignin2faRequest): Promise<AdminSignin2faResponse> {
  const url = `${getApiBaseUrl()}/admin/auth/signin-2fa`
  // Dev-only request log (password redacted)
  if (process.env.NODE_ENV === "development" && typeof window !== "undefined") {
    // eslint-disable-next-line no-console
    console.info("[adminSignin2fa] request", {
      url,
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: { ...payload, password: "[REDACTED]" },
    })
  }
  let res: Response
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
      credentials: "omit",
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Network error"
    throw new ApiClientError(msg || "Network error", 0)
  }

  const contentType = res.headers.get("content-type") || ""
  const isJson = contentType.includes("application/json")
  const data = isJson ? await res.json().catch(() => ({})) : await res.text().catch(() => "")

  if (!res.ok) {
    const message =
      (typeof data === "object" && data && (data.message || data.error)) ||
      (typeof data === "string" && data) ||
      `Request failed with status ${res.status}`
    throw new ApiClientError(String(message), res.status)
  }

  return (typeof data === "object" && data) ? (data as AdminSignin2faResponse) : {}
}

