import { ApiClientError } from "./client"

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(path, {
    ...options,
    headers: options.body instanceof FormData ? options.headers : { "Content-Type": "application/json", ...options.headers },
  })
  const contentType = res.headers.get("content-type") || ""
  const data = contentType.includes("application/json") ? await res.json().catch(() => ({})) : {}
  if (!res.ok) {
    throw new ApiClientError(data?.message || `Request failed with status ${res.status}`, res.status, data?.errors)
  }
  return data as T
}

const getJson = <T>(path: string) => request<T>(path)
const postJson = <T>(path: string, body: unknown) => request<T>(path, { method: "POST", body: JSON.stringify(body) })
const patchJson = <T>(path: string, body: unknown) => request<T>(path, { method: "PATCH", body: JSON.stringify(body) })
const del = <T>(path: string) => request<T>(path, { method: "DELETE" })

// ---- Public ----
export interface ChallengePlan {
  id: string
  name: string
  size: number
  price: number
  profitTargetP1: number
  profitTargetP2: number
  maxDailyLoss: number
  maxTotalLoss: number
  profitSplit: number
  platform: string | null
}
export const listPlans = () => getJson<{ plans: ChallengePlan[] }>("/api/plans")
export const validateCoupon = (code: string) => postJson<{ valid: boolean; discountPercent?: number }>("/api/coupons/validate", { code })

/** Result of checking a coupon code against a plan. Offers are automatic and have no code. */
export type PromoValidation =
  | { valid: true; kind: "coupon"; code: string; discountPercent: number; finalPrice: number; discountAmount: number; summary: string }
  | { valid: false; message: string }

export const validatePromoCode = (code: string, planId: string) =>
  postJson<PromoValidation>("/api/promo/validate", { code, planId })

/** A site-wide coupon the admin opted to advertise (promo bar, pricing section). */
export interface PublicCoupon {
  code: string
  discountPercent: number
  expiresAt: string | null
}

export const listPublicCoupons = () => getJson<{ coupons: PublicCoupon[] }>("/api/promo/public")

/** A coupon code the admin opted to advertise, shown as a tappable card at checkout. */
export interface AvailableCoupon {
  code: string
  summary: string
  finalPrice: number
  discountAmount: number
  expiresAt: string | null
}

/** An offer that applies automatically to this plan — shown as included, not tappable. */
export interface IncludedOffer {
  name: string
  type: OfferType
  summary: string
  shortLabel: string
}

export const listPlanPromos = (planId: string) =>
  getJson<{ coupons: AvailableCoupon[]; offers: IncludedOffer[] }>(
    `/api/promo/available?planId=${encodeURIComponent(planId)}`
  )

// ---- Orders ----
export interface OrderWithPlan {
  id: string
  userId: string | null
  planId: string | null
  couponUsed: string | null
  offerCode?: string | null
  retryOfOrderId?: string | null
  amountPaid: number
  paymentMethod: string
  status: string
  gatewayRef: string | null
  createdAt: string | null
  updatedAt: string | null
  challenge_plans: { name: string; size: number; platform: string | null; price: number } | null
}
export const listMyOrders = () => getJson<{ orders: OrderWithPlan[] }>("/api/orders")
export const createOrder = (input: { planId: string; paymentMethod: "nowpayments" | "boomfi" | "manual_crypto"; couponCode?: string }) =>
  postJson<{ order: OrderWithPlan }>("/api/orders", input)
export interface ManualWallet {
  id: string
  label: string
  network: string
  asset: string
  address: string
  qrImage: string | null
}
export const listManualWallets = () =>
  getJson<{ wallets: ManualWallet[]; rates: Record<string, number> }>("/api/payments/manual-wallets")
export const submitPaymentProof = (orderId: string, network: string, txid: string, screenshot: File) => {
  const form = new FormData()
  form.append("network", network)
  form.append("txid", txid)
  form.append("screenshot", screenshot)
  return request<{ ok: true }>(`/api/orders/${orderId}/proof`, { method: "POST", body: form })
}
export const payOrder = (orderId: string) => postJson<{ checkoutUrl: string }>(`/api/orders/${orderId}/pay`, {})

// ---- Accounts ----
export interface TradingAccount {
  id: string
  userId: string | null
  orderId: string | null
  platform: string
  login: string
  passwordMaster: string | null
  passwordInvestor: string | null
  server: string
  profitTarget: number
  balance: number
  equity: number
  todayPl: number
  totalPl: number
  status: string
  phase: string | null
  graphLink: string | null
  deliveryStatus: string
  deliveredAt: string | null
  createdAt: string | null
}
export const listMyAccounts = () => getJson<{ accounts: TradingAccount[] }>("/api/accounts")

// ---- KYC ----
export const getMyKyc = () => getJson<{ kyc: { status: string; documentType: string; rejectReason: string | null } | null }>("/api/kyc")
export const submitKyc = (form: FormData) => request<{ ok: true }>("/api/kyc", { method: "POST", body: form })

// ---- Payouts ----
export interface Payout {
  id: string
  accountId: string | null
  amount: number
  status: string
  paymentMethod: string
  createdAt: string | null
}
export const listMyPayouts = () => getJson<{ payouts: Payout[] }>("/api/payouts")
export const requestPayout = (input: { accountId: string; amount: number; paymentMethod: string; paymentDetails: string }) =>
  postJson<{ payout: Payout }>("/api/payouts", input)

// ---- Certificates & notifications ----
export interface Certificate {
  id: string
  traderName: string
  accountSize: number
  planName: string
  datePassed: string
}
export const listMyCertificates = () => getJson<{ certificates: Certificate[] }>("/api/certificates")

export interface AppNotification {
  id: string
  title: string
  message: string
  type: string
  read: boolean | null
  sentAt: string | null
}
export const listMyNotifications = () => getJson<{ notifications: AppNotification[] }>("/api/notifications")
export const markNotificationRead = (id: string) => patchJson<{ ok: true }>(`/api/notifications/${id}`, {})

// ---- Admin: users ----
export interface AdminUserRow {
  id: string
  name: string
  email: string
  phone: string | null
  country: string | null
  role: string
  status: string
  createdAt: string | null
  referredBy: string | null
  emailVerified: boolean
}
export const adminListUsers = () => getJson<{ users: AdminUserRow[] }>("/api/admin/users")
export const adminUpdateUser = (id: string, patch: Partial<Pick<AdminUserRow, "name" | "phone" | "country" | "role" | "status">>) =>
  patchJson<{ user: AdminUserRow }>(`/api/admin/users/${id}`, patch)

// ---- Admin: orders ----
export interface AdminOrderRow extends OrderWithPlan {
  users: { name: string; email: string } | null
  accounts: TradingAccount[]
}
export const adminListOrders = () => getJson<{ orders: AdminOrderRow[] }>("/api/admin/orders")
export interface AdminOrderDetail extends Omit<AdminOrderRow, "users"> {
  users: { name: string; email: string; phone: string | null; country: string | null; status: string; createdAt: string | null } | null
  /** "Scan & pay" orders: signed screenshot URL and the network the customer paid on. */
  paymentProof?: { url: string | null; network: string | null; txid: string | null; explorerUrl: string | null } | null
}
export const adminGetOrder = (id: string) => getJson<{ order: AdminOrderDetail }>(`/api/admin/orders/${id}`)
export const adminApprovePayment = (id: string) => patchJson<{ ok: true }>(`/api/admin/orders/${id}`, { action: "approve-payment" })
export const adminRejectPayment = (id: string, reason?: string) =>
  patchJson<{ ok: true }>(`/api/admin/orders/${id}`, { action: "reject-payment", reason })
export const adminPassOrder = (id: string) => patchJson<{ ok: true }>(`/api/admin/orders/${id}`, { action: "pass" })
export const adminFailOrder = (id: string, reason?: string) => patchJson<{ ok: true }>(`/api/admin/orders/${id}`, { action: "fail", reason })
export const adminCompleteFromInventory = (id: string, inventoryId: string, phase: string) =>
  patchJson<{ ok: true }>(`/api/admin/orders/${id}`, { action: "complete-inventory", inventoryId, phase })
export const adminCompleteManual = (
  id: string,
  input: { phase: string; platform: string; login: string; passwordMaster: string; server: string; profitTarget: number; balance: number; graphLink?: string }
) => patchJson<{ ok: true }>(`/api/admin/orders/${id}`, { action: "complete-manual", ...input })

// ---- Admin: KYC ----
export interface AdminKycRow {
  userId: string
  documentType: string
  frontUrl: string | null
  backUrl: string | null
  selfieUrl: string | null
  addressUrl: string | null
  status: string
  rejectReason: string | null
  updatedAt: string | null
}
export const adminListKyc = () => getJson<{ submissions: AdminKycRow[] }>("/api/admin/kyc")
export const adminSetKycStatus = (userId: string, status: "approved" | "rejected", rejectReason?: string) =>
  patchJson<{ ok: true }>(`/api/admin/kyc/${userId}`, { status, rejectReason })

// ---- Admin: inventory ----
export interface InventoryItem {
  id: string
  platform: string
  size: number
  login: string
  password: string
  server: string
  status: string
  orderId: string | null
  createdAt: string | null
}
export const adminListInventory = () => getJson<{ items: InventoryItem[] }>("/api/admin/inventory")
export const adminCreateInventory = (input: { platform: string; size: number; login: string; password: string; server: string }) =>
  postJson<{ item: InventoryItem }>("/api/admin/inventory", input)
export const adminUpdateInventory = (id: string, patch: Partial<InventoryItem>) =>
  patchJson<{ item: InventoryItem }>(`/api/admin/inventory/${id}`, patch)
export const adminDeleteInventory = (id: string) => del<{ ok: true }>(`/api/admin/inventory/${id}`)

// ---- Admin: payouts ----
export const adminListPayouts = () => getJson<{ payouts: Payout[] }>("/api/admin/payouts")
export const adminSetPayoutStatus = (id: string, status: "approved" | "rejected" | "paid", notes?: string) =>
  patchJson<{ ok: true }>(`/api/admin/payouts/${id}`, { status, notes })

// ---- Admin: coupons ----
export interface AdminCoupon {
  code: string
  discountPercent: number
  status: string
  /** When true, the code is advertised in the checkout sidebar. */
  showAtCheckout: boolean
  createdAt: string | null
  expiresAt: string | null
}
export const adminListCoupons = () => getJson<{ coupons: AdminCoupon[] }>("/api/admin/coupons")
export const adminCreateCoupon = (input: { code: string; discountPercent: number; status?: string; expiresAt?: string | null; showAtCheckout?: boolean }) =>
  postJson<{ coupon: AdminCoupon }>("/api/admin/coupons", input)
export const adminUpdateCoupon = (code: string, patch: Partial<Pick<AdminCoupon, "discountPercent" | "status" | "expiresAt" | "showAtCheckout">>) =>
  patchJson<{ coupon: AdminCoupon }>(`/api/admin/coupons/${encodeURIComponent(code)}`, patch)
export const adminDeleteCoupon = (code: string) => del<{ ok: true }>(`/api/admin/coupons/${encodeURIComponent(code)}`)

// ---- Admin: offers ----
export const OFFER_TYPES = ["bogo", "free_retry", "free_addon"] as const
export type OfferType = (typeof OFFER_TYPES)[number]

export interface AdminOffer {
  id: string
  /** Optional internal reference for reporting; customers never type it. */
  code: string | null
  name: string
  type: OfferType
  /** Empty = applies to every plan. Otherwise these challenge_plans.id values. */
  planIds: string[]
  status: string
  startsAt: string | null
  expiresAt: string | null
  maxRedemptions: number | null
  perUserLimit: number | null
  timesRedeemed: number
  description: string | null
  createdAt: string | null
  updatedAt: string | null
}

export type AdminOfferInput = Omit<AdminOffer, "id" | "timesRedeemed" | "createdAt" | "updatedAt">

export const adminListOffers = () => getJson<{ offers: AdminOffer[] }>("/api/admin/offers")
export const adminCreateOffer = (input: AdminOfferInput) => postJson<{ offer: AdminOffer }>("/api/admin/offers", input)
export const adminUpdateOffer = (id: string, patch: Partial<AdminOfferInput>) =>
  patchJson<{ offer: AdminOffer }>(`/api/admin/offers/${id}`, patch)
export const adminDeleteOffer = (id: string) => del<{ ok: true }>(`/api/admin/offers/${id}`)

// ---- Admin: pricing catalog (challenge plans) ----
export const adminListPlans = () => getJson<{ plans: ChallengePlan[] }>("/api/admin/plans")
export const adminCreatePlan = (input: Omit<ChallengePlan, "id">) => postJson<{ plan: ChallengePlan }>("/api/admin/plans", input)
export const adminUpdatePlan = (id: string, patch: Partial<Omit<ChallengePlan, "id">>) =>
  patchJson<{ plan: ChallengePlan }>(`/api/admin/plans/${id}`, patch)
export const adminDeletePlan = (id: string) => del<{ ok: true }>(`/api/admin/plans/${id}`)

// ---- Admin: affiliates & referrals ----
export interface AdminAffiliate {
  userId: string
  referralCode: string
  commissionRate: number
  users: { name: string; email: string } | null
}
export const adminListAffiliates = () => getJson<{ affiliates: AdminAffiliate[] }>("/api/admin/affiliates")
export const adminCreateAffiliate = (input: { email: string; referralCode: string; commissionRate: number }) =>
  postJson<{ affiliate: AdminAffiliate }>("/api/admin/affiliates", input)
export const adminUpdateAffiliate = (userId: string, patch: Partial<{ referralCode: string; commissionRate: number }>) =>
  patchJson<{ affiliate: AdminAffiliate }>(`/api/admin/affiliates/${userId}`, patch)
export const adminDeleteAffiliate = (userId: string) => del<{ ok: true }>(`/api/admin/affiliates/${userId}`)

export interface AdminReferral {
  referredUserId: string
  affiliateId: string | null
  orderId: string
  commissionAmount: number
  status: string
  createdAt: string | null
  referredUser: { name: string; email: string } | null
  affiliateUser: { name: string; email: string } | null
  affiliateReferralCode: string | null
  order: { amountPaid: number; status: string } | null
}
export const adminListReferrals = () => getJson<{ referrals: AdminReferral[] }>("/api/admin/referrals")
export const adminSetReferralStatus = (referredUserId: string, orderId: string, status: "pending" | "confirmed" | "paid") =>
  patchJson<{ ok: true }>(`/api/admin/referrals/${referredUserId}/${orderId}`, { status })

// ---- CRM auth ----
export const crmSignupRequest = (input: { name: string; email: string; password: string; accessCode: string }) =>
  postJson<{ user: AdminUserRow; emailSent: boolean }>("/api/crm/signup", input)
export const crmSigninStep1 = (email: string, password: string) =>
  postJson<{ user: AdminUserRow }>("/api/crm/signin/step1", { email, password })
export const crmImpersonate = (targetUserId: string) =>
  postJson<{ user: { id: string; email: string } }>("/api/crm/impersonate", { targetUserId })
