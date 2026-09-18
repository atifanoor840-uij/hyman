import "server-only"

import { createPublicKey, createVerify } from "crypto"
import type { CreateInvoiceInput, CreateInvoiceResult, WebhookVerificationResult } from "./types"

// Production host; set BOOMFI_API_BASE=https://mapi-test.boomfi.xyz/v1 to use a test key.
const BOOMFI_API_BASE = process.env.BOOMFI_API_BASE || "https://mapi.boomfi.xyz/v1"
// Hosted checkout root; the create-paylink response doesn't always include `url`.
const BOOMFI_CHECKOUT_BASE = process.env.BOOMFI_CHECKOUT_BASE || "https://pay.boomfi.xyz"
const WEBHOOK_TOLERANCE_SECONDS = 5 * 60

function getApiKey(): string {
  const key = process.env.BOOMFI_API_KEY
  if (!key) throw new Error("Missing BOOMFI_API_KEY environment variable.")
  return key
}

function getWebhookPublicKey(): string {
  const key = process.env.BOOMFI_WEBHOOK_PUBLIC_KEY
  if (!key) throw new Error("Missing BOOMFI_WEBHOOK_PUBLIC_KEY environment variable.")
  // Env files usually hold the PEM on one line with literal "\n" sequences.
  return key.replace(/\\n/g, "\n")
}

/**
 * Creates a single-use BoomFi paylink priced for this order. `reference` is our
 * orders.id, which BoomFi echoes back on the payment webhook.
 */
export async function createBoomfiPaylink(
  input: CreateInvoiceInput,
  urls: { successUrl: string; failureUrl: string }
): Promise<CreateInvoiceResult> {
  const res = await fetch(`${BOOMFI_API_BASE}/paylinks`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json", "X-API-KEY": getApiKey() },
    body: JSON.stringify({
      name: input.description.slice(0, 100),
      amount: input.amount.toFixed(2),
      currency: input.currency,
      reference: input.orderId,
      type: "OneTime",
      available_quantity: 1,
      metadata: { order_id: input.orderId },
      after_completion: { type: "redirect", redirect_url: urls.successUrl, failure_redirect_url: urls.failureUrl },
    }),
  })

  const data = await res.json().catch(() => null)
  const link = data?.data
  if (!res.ok || data?.error === true || !link?.id) {
    const message = data?.error?.message ?? data?.message ?? res.status
    throw new Error(`BoomFi paylink creation failed: ${message}`)
  }

  const id = String(link.id)
  return { checkoutUrl: link.url || `${BOOMFI_CHECKOUT_BASE}/${id}`, gatewayRef: id }
}

type Refs = { id?: unknown; reference?: unknown; metadata?: { order_id?: unknown } }
type BoomfiEvent = Refs & {
  event?: unknown
  status?: unknown
  org_id?: unknown
  org?: Refs
  paylink_id?: unknown
  payment_link_id?: unknown
  plan?: Refs & { payment_link?: Refs }
}

function str(value: unknown): string | null {
  return typeof value === "string" && value ? value : null
}

/**
 * BoomFi signs webhooks with the org's RSA key: `X-BoomFi-Signature` is a
 * base64 RSA-SHA256 (PKCS#1 v1.5) signature over `${timestamp}.${rawBody}`.
 * `gatewayRef` here is our orders.id (the paylink `reference`).
 */
export function verifyBoomfiWebhook(
  rawBody: string,
  signature: string | null,
  timestamp: string | null
): WebhookVerificationResult & { paylinkId: string | null } {
  const invalid = { valid: false, gatewayRef: null, paylinkId: null, status: "unknown" as const }
  if (!signature || !timestamp) return invalid

  const ts = Number(timestamp)
  if (!Number.isFinite(ts) || Math.abs(Date.now() / 1000 - ts) > WEBHOOK_TOLERANCE_SECONDS) return invalid

  let valid = false
  try {
    const verifier = createVerify("RSA-SHA256")
    verifier.update(`${timestamp}.${rawBody}`)
    verifier.end()
    valid = verifier.verify(createPublicKey(getWebhookPublicKey()), signature, "base64")
  } catch {
    valid = false
  }
  if (!valid) return invalid

  let payload: BoomfiEvent | null = null
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return invalid
  }

  const expectedOrg = process.env.BOOMFI_ORG_ID
  const orgId = str(payload?.org_id) ?? str(payload?.org?.id)
  if (expectedOrg && orgId && orgId !== expectedOrg) return invalid

  // Only payment events move an order; everything else is acknowledged and ignored.
  const event = String(payload?.event ?? "")
  if (!event.startsWith("Payment.")) {
    return { valid: true, gatewayRef: null, paylinkId: null, status: "unknown" }
  }

  const plan = payload?.plan
  const gatewayRef =
    str(payload?.reference) ??
    str(payload?.metadata?.order_id) ??
    str(plan?.reference) ??
    str(plan?.metadata?.order_id)
  const paylinkId = str(payload?.paylink_id) ?? str(payload?.payment_link_id) ?? str(plan?.payment_link?.id)

  // Partial proxy-wallet deposits stay `RequiresAction`; only `Succeeded` means paid in full.
  const status = String(payload?.status ?? "")
  const mapped: WebhookVerificationResult["status"] =
    status === "Succeeded"
      ? "paid"
      : status === "Failed" || status === "Expired" || status === "Refunded"
        ? "failed"
        : "pending"

  return { valid: true, gatewayRef, paylinkId, status: mapped }
}
