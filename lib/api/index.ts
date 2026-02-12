/**
 * Admin API utilities - uses base URL https://genz-34f298f57a04.herokuapp.com
 */

const ADMIN_API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "https://genz-34f298f57a04.herokuapp.com";

export function getApiBaseUrl(): string {
  return ADMIN_API_BASE.replace(/\/$/, "");
}

export const API_ENDPOINTS = {
  CREDENTIALS: "/accounts/credentials",
  ORDERS: "/orders",
  KYC: "/kyc/admin",
  SUPPORT: "/support/admin",
  AUTH: "/auth",
  MANAGEMENT: "/management",
} as const;

export { apiRequest, apiRequestFormData } from "./client";

export async function authenticatedApiRequest<T>(
  endpoint: string,
  options: RequestInit & { token?: string } = {}
): Promise<T> {
  const { token, ...rest } = options;
  const path = endpoint.startsWith("http") ? endpoint : `${getApiBaseUrl()}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...(rest.headers as Record<string, string>),
  };
  const res = await fetch(path, { ...rest, headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error ${res.status}: ${text}`);
  }
  return res.json();
}

export { apiRequestFormData as formDataApiRequest } from "./client";

export function handleApiSuccess(_message?: string): void {}
