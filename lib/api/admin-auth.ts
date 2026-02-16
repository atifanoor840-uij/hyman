import { getApiBaseUrl } from "./index";
import { getAdminToken } from "@/lib/admin-auth";
import type { AdminUser } from "@/lib/admin-auth";

function getBase(): string {
  return getApiBaseUrl();
}

export interface AdminLoginRequest {
  email: string;
  password: string;
}

export interface AdminLoginResponse {
  token?: string;
  access_token?: string;
  user?: AdminUser & Record<string, unknown>;
  message?: string;
}

/**
 * POST /auth/admin/signin or /management/login - Admin login.
 * Configure your backend endpoint and response shape as needed.
 */
export async function adminLogin(data: AdminLoginRequest): Promise<AdminLoginResponse> {
  const res = await fetch(`${getBase()}/auth/admin/signin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: data.email, password: data.password }),
  });
  if (!res.ok) {
    const text = await res.text();
    let message = `Login failed (${res.status})`;
    try {
      const j = JSON.parse(text);
      message = j.message || j.error || message;
    } catch {
      if (text) message = text;
    }
    throw new Error(message);
  }
  return res.json();
}

/**
 * Use this for admin API calls (sends Bearer token from getAdminToken).
 */
export async function adminApiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAdminToken();
  const url = endpoint.startsWith("http") ? endpoint : `${getBase()}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...(options.headers as Record<string, string>),
  };
  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error ${res.status}: ${text}`);
  }
  return res.json();
}
