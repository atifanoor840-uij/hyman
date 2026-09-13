import "server-only"

import { createHmac, timingSafeEqual } from "crypto"
import type { CreateInvoiceInput, CreateInvoiceResult, WebhookVerificationResult } from "./types"

const OXAPAY_API_BASE = "https://api.oxapay.com"

function getMerchantKey(): string {
  const key = process.env.OXAPAY_MERCHANT_KEY
  if (!key) throw new Error("Missing OXAPAY_MERCHANT_KEY environment variable.")
  return key
}

export async function createOxapayInvoice(
  input: CreateInvoiceInput,
  urls: { callbackUrl: string; returnUrl: string }
): Promise<CreateInvoiceResult> {
  const res = await fetch(`${OXAPAY_API_BASE}/merchants/request`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      merchant: getMerchantKey(),
      amount: input.amount,
      currency: input.currency,
      orderId: input.orderId,
      description: input.description,
      callbackUrl: urls.callbackUrl,
      returnUrl: urls.returnUrl,
      lifeTime: 60,
      feePaidByPayer: 1,
      underPaidCover: 2.5,
      toCurrency: "USDT",
    }),
  })

  const data = await res.json().catch(() => null)
  if (!res.ok || !data || data.result !== 100 || !data.trackId || !data.payLink) {
    throw new Error(`Oxapay invoice creation failed: ${data?.message ?? res.status}`)
  }

  return { checkoutUrl: data.payLink, gatewayRef: String(data.trackId) }
}

/**
 * Oxapay signs webhook callbacks with an `HMAC` header — HMAC-SHA512 of the
 * raw request body, keyed by the merchant API key.
 */
export function verifyOxapayWebhook(rawBody: string, hmacHeader: string | null): WebhookVerificationResult {
  if (!hmacHeader) return { valid: false, gatewayRef: null, status: "unknown" }

  const expected = createHmac("sha512", getMerchantKey()).update(rawBody).digest("hex")
  const a = Buffer.from(expected, "hex")
  const b = Buffer.from(hmacHeader, "hex")
  const valid = a.length === b.length && timingSafeEqual(a, b)
  if (!valid) return { valid: false, gatewayRef: null, status: "unknown" }

  let payload: { trackId?: string | number; status?: string } | null = null
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return { valid: true, gatewayRef: null, status: "unknown" }
  }

  const status = String(payload?.status ?? "").toLowerCase()
  const mapped: WebhookVerificationResult["status"] =
    status === "paid" || status === "confirmed"
      ? "paid"
      : status === "expired" || status === "failed"
        ? "failed"
        : "pending"

  return { valid: true, gatewayRef: payload?.trackId != null ? String(payload.trackId) : null, status: mapped }
}
