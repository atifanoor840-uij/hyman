export type PaymentGateway = "oxapay" | "nowpayments" | "boomfi"

export interface CreateInvoiceInput {
  orderId: string
  amount: number
  currency: string
  description: string
}

export interface CreateInvoiceResult {
  checkoutUrl: string
  gatewayRef: string
}

export interface WebhookVerificationResult {
  valid: boolean
  gatewayRef: string | null
  status: "paid" | "pending" | "failed" | "unknown"
}
