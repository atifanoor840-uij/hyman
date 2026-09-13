import "server-only"

import { createHmac, timingSafeEqual } from "crypto"
import type { CreateInvoiceInput, CreateInvoiceResult, WebhookVerificationResult } from "./types"

const NOWPAYMENTS_API_BASE = "https://api.nowpayments.io/v1"

function getApiKey(): string {
  const key = process.env.NOWPAYMENTS_API_KEY
  if (!key) throw new Error("Missing NOWPAYMENTS_API_KEY environment variable.")
  return key
}

function getIpnSecret(): string {
  const key = process.env.NOWPAYMENTS_IPN_SECRET
  if (!key) throw new Error("Missing NOWPAYMENTS_IPN_SECRET environment variable.")
  return key
}

export async function createNowPaymentsInvoice(
  input: CreateInvoiceInput,
  urls: { ipnCallbackUrl: string; successUrl: string; cancelUrl: string }
): Promise<CreateInvoiceResult> {
  const res = await fetch(`${NOWPAYMENTS_API_BASE}/invoice`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": getApiKey() },
    body: JSON.stringify({
      price_amount: input.amount,
      price_currency: input.currency,
      order_id: input.orderId,
      order_description: input.description,
      ipn_callback_url: urls.ipnCallbackUrl,
      success_url: urls.successUrl,
      cancel_url: urls.cancelUrl,
    }),
  })

  const data = await res.json().catch(() => null)
  if (!res.ok || !data?.id || !data?.invoice_url) {
    throw new Error(`NOWPayments invoice creation failed: ${data?.message ?? res.status}`)
  }

  return { checkoutUrl: data.invoice_url, gatewayRef: String(data.id) }
}

/** Deterministically re-orders object keys (recursively) — required before signing/verifying. */
function sortKeysDeep(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeysDeep)
  if (value && typeof value === "object") {
    return Object.keys(value as Record<string, unknown>)
      .sort()
      .reduce((acc: Record<string, unknown>, key) => {
        acc[key] = sortKeysDeep((value as Record<string, unknown>)[key])
        return acc
      }, {})
  }
  return value
}

/**
 * NOWPayments signs IPN callbacks with an `x-nowpayments-sig` header —
 * HMAC-SHA512 of the JSON body with all keys sorted alphabetically.
 */
export function verifyNowPaymentsWebhook(rawBody: string, sigHeader: string | null): WebhookVerificationResult {
  if (!sigHeader) return { valid: false, gatewayRef: null, status: "unknown" }

  let payload: Record<string, unknown> | null = null
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return { valid: false, gatewayRef: null, status: "unknown" }
  }

  const sortedBody = JSON.stringify(sortKeysDeep(payload))
  const expected = createHmac("sha512", getIpnSecret()).update(sortedBody).digest("hex")
  const a = Buffer.from(expected, "hex")
  const b = Buffer.from(sigHeader, "hex")
  const valid = a.length === b.length && timingSafeEqual(a, b)
  if (!valid) return { valid: false, gatewayRef: null, status: "unknown" }

  const status = String(payload?.payment_status ?? "").toLowerCase()
  const mapped: WebhookVerificationResult["status"] =
    status === "finished" || status === "confirmed"
      ? "paid"
      : status === "failed" || status === "expired" || status === "refunded"
        ? "failed"
        : "pending"

  return {
    valid: true,
    gatewayRef: payload?.order_id != null ? String(payload.order_id) : payload?.payment_id != null ? String(payload.payment_id) : null,
    status: mapped,
  }
}
