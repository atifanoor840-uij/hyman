"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Info, X, Check, ChevronLeft, ChevronRight, Loader2, Tag, Gift } from "lucide-react"
import {
  listPlans,
  createOrder,
  payOrder,
  validatePromoCode,
  listPlanPromos,
  type ChallengePlan,
  type PromoValidation,
  type AvailableCoupon,
  type IncludedOffer,
} from "@/lib/api/app-client"
import { ApiClientError } from "@/lib/api/client"
import SuccessPopup from "@/app/components/SuccessPopup"
import { trackInitiateCheckout, trackViewContent } from "@/components/MetaPixel"
import { GLOBAL_RULES, getAccountRules, type AccountRuleType } from "@/lib/rules-config"

const createEventId = (prefix: string) => `${prefix}.${Date.now().toString(36)}.${Math.random().toString(36).slice(2, 10)}`

const platformTypes = [
  { id: "mt4", label: "MT4", logo: "/MT4.png" },
  { id: "mt5", label: "MT5", logo: "/MT5 (2).png" },
]

// Maps this app's plan.name values to the tab keys/labels the UI already used.
const ACCOUNT_TYPE_ORDER: Array<{ key: string; planName: string; label: string }> = [
  { key: "alpha", planName: "Genz Step1", label: "Genz Step1" },
  { key: "beta", planName: "Genz Step2", label: "Genz Step2" },
  { key: "sigma", planName: "Genz Instant", label: "Genz Instant" },
]


const paymentMethods = [
  { id: "nowpayments", label: "Crypto (NOWPayments)", image: "https://fundednext.fra1.digitaloceanspaces.com/utility-files/6267395.png" },
]

function usd(n: number) {
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}
function usd2(n: number) {
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

type FeatureRow = { name: string; values: Record<string, string> }

// Every number below comes from lib/rules-config.ts so the buy page, the dashboard
// and the help centre can never drift apart.
function buildFeatures(plansForType: ChallengePlan[], type: AccountRuleType): FeatureRow[] {
  const rules = getAccountRules(type)
  const fill = (fn: (p: ChallengePlan) => string) =>
    Object.fromEntries(plansForType.map((p) => [p.id, fn(p)])) as Record<string, string>
  const pct = (percent: number) => (p: ChallengePlan) => `${percent}% (${usd(Math.round((p.size * percent) / 100))})`

  const profitTarget = (p: ChallengePlan) => {
    const { phase1, phase2 } = rules.profitTarget
    if (phase1 == null) return "None"
    const one = `${phase1}% (${usd(Math.round((p.size * phase1) / 100))})`
    if (phase2 == null) return one
    return `P1 ${one} · P2 ${phase2}% (${usd(Math.round((p.size * phase2) / 100))})`
  }

  const minDays =
    rules.minProfitableDaysChallenge != null
      ? `${rules.minProfitableDaysChallenge} profitable (challenge) · ${rules.minDaysTotalFunded} (funded)`
      : `${rules.minDaysTotalFunded} (${rules.minProfitableDaysFunded} profitable + ${rules.minTradingDaysFunded} trading)`

  return [
    { name: "Profit Target", values: fill(profitTarget) },
    { name: "Daily Drawdown", values: fill(pct(GLOBAL_RULES.dailyDrawdownPct)) },
    { name: "Maximum Drawdown", values: fill(pct(parseFloat(rules.maxDrawdown))) },
    { name: "Minimum Days", values: fill(() => minDays) },
    { name: "Leverage", values: fill(() => rules.leverage) },
    { name: "Minimum Holding Time", values: fill(() => rules.minHoldingTime) },
    { name: "Profit Consistency Rule", values: fill(() => "None") },
    { name: "Overnight Holding", values: fill(() => "check") },
    { name: "Weekend Holding", values: fill(() => "Paid add-on") },
    {
      name: "News Trading",
      values: fill(() =>
        rules.minProfitableDaysChallenge != null
          ? "Free in challenge · 10-min window when funded"
          : "10-min restricted window"
      ),
    },
    { name: "Trade Layering", values: fill(() => "no") },
  ]
}

/** Plain-language summary of the conditions that are easiest to breach. */
function buildKeyRules(type: AccountRuleType): string[] {
  const rules = getAccountRules(type)
  const lines = [
    `Daily loss limit ${rules.dailyDrawdown} and overall loss limit ${rules.maxDrawdown} — both measured from your initial balance and monitored on balance and equity, including floating losses.`,
    `Both limits are static: they never trail up with profits. Daily counters reset at ${GLOBAL_RULES.dailyResetUtc}.`,
    `A Profitable Day needs at least ${GLOBAL_RULES.profitableDayPct}% profit on that calendar day, measured on equity.`,
    `Every trade must be held for at least ${rules.minHoldingTime}.`,
    `No profit consistency rule — a single strong day can carry your whole target.`,
    `Overnight holding is included. Weekend holding (${GLOBAL_RULES.weekendWindow}) needs the paid add-on.`,
  ]
  if (type === "sigma") {
    lines.push(`One trade per ${GLOBAL_RULES.layeringWindowMinutes}-minute window and a maximum of ${GLOBAL_RULES.instantMaxConcurrentLayers} concurrent layers.`)
    lines.push(`News: you cannot open or close on the affected instrument within ${GLOBAL_RULES.newsWindowMinutes} minutes either side of a high-impact release.`)
  } else {
    lines.push(`News trading is unrestricted during the challenge. On the funded stage a ${GLOBAL_RULES.newsWindowMinutes}-minutes-either-side window applies, and an SL/TP firing inside it is a soft breach.`)
    lines.push(`Funded stage: one trade per ${GLOBAL_RULES.layeringWindowMinutes}-minute window from the previous trade's opening time.`)
  }
  lines.push(`No trade for ${GLOBAL_RULES.inactivityDays} consecutive days closes the account.`)
  return lines
}

export function BuysContent() {
  const router = useRouter()
  const [plans, setPlans] = useState<ChallengePlan[]>([])
  const [plansLoading, setPlansLoading] = useState(true)
  const [activePlatform, setActivePlatform] = useState("mt5")
  const [activeAccountType, setActiveAccountType] = useState("alpha")
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null)
  const [selectedPlatform, setSelectedPlatform] = useState("mt5")
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<"nowpayments">("nowpayments")
  const [couponCode, setCouponCode] = useState("")
  // An applied coupon OR offer — the checkout box accepts both.
  const [promo, setPromo] = useState<Extract<PromoValidation, { valid: true }> | null>(null)
  const [couponError, setCouponError] = useState<string | null>(null)
  const [applyingPromo, setApplyingPromo] = useState(false)
  // Advertised coupon codes for this plan, and the offers already included.
  const [availableCoupons, setAvailableCoupons] = useState<AvailableCoupon[]>([])
  const [includedOffers, setIncludedOffers] = useState<IncludedOffer[]>([])
  const [promosLoading, setPromosLoading] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [successPopup, setSuccessPopup] = useState<{ title: string; message: string } | null>(null)

  useEffect(() => {
    trackViewContent("GenzProp Plans / Buy Challenge", "Checkout")
    listPlans()
      .then((res) => setPlans(res.plans ?? []))
      .finally(() => setPlansLoading(false))
  }, [])

  const activeTypeMeta = ACCOUNT_TYPE_ORDER.find((t) => t.key === activeAccountType) ?? ACCOUNT_TYPE_ORDER[0]
  const plansForType = useMemo(
    () => plans.filter((p) => p.name === activeTypeMeta.planName).sort((a, b) => a.size - b.size),
    [plans, activeTypeMeta]
  )
  const features = useMemo(
    () => buildFeatures(plansForType, activeTypeMeta.key as AccountRuleType),
    [plansForType, activeTypeMeta]
  )
  const keyRules = useMemo(
    () => buildKeyRules(activeTypeMeta.key as AccountRuleType),
    [activeTypeMeta]
  )
  const selectedPlan = plans.find((p) => p.id === selectedPlanId) ?? null

  const handleAccountTypeChange = (key: string) => {
    setActiveAccountType(key)
    setSelectedPlanId(null)
    setSidebarOpen(false)
  }

  const handleGetPlan = (planId: string) => {
    setSelectedPlanId(planId)
    setCouponCode("")
    setPromo(null)
    setCouponError(null)
    setAvailableCoupons([])
    setIncludedOffers([])
    setSidebarOpen(true)
  }

  const closeSidebar = () => setSidebarOpen(false)

  // Load the advertised codes for whichever plan is in the sidebar.
  useEffect(() => {
    if (!selectedPlanId) return
    let cancelled = false
    setPromosLoading(true)
    listPlanPromos(selectedPlanId)
      .then((res) => {
        if (cancelled) return
        setAvailableCoupons(res.coupons ?? [])
        setIncludedOffers(res.offers ?? [])
      })
      .catch(() => {
        // A failure here just means no extras are shown — checkout still works.
        if (cancelled) return
        setAvailableCoupons([])
        setIncludedOffers([])
      })
      .finally(() => {
        if (!cancelled) setPromosLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [selectedPlanId])

  const getPayableAmount = () => {
    if (!selectedPlan) return 0
    // Non-discount offers (BOGO, free retry, free add-on) leave the price alone,
    // so the server-computed finalPrice is the single source of truth here.
    if (promo) return promo.finalPrice
    return selectedPlan.price
  }

  const applyPromo = async (rawCode: string) => {
    const code = rawCode.trim()
    if (!code || !selectedPlan) return
    setCouponCode(code)
    setCouponError(null)
    setApplyingPromo(true)
    try {
      const res = await validatePromoCode(code, selectedPlan.id)
      if (res.valid) {
        setPromo(res)
      } else {
        setPromo(null)
        setCouponError(res.message)
      }
    } catch (err) {
      setPromo(null)
      setCouponError(err instanceof ApiClientError ? err.message : "Could not check that code.")
    } finally {
      setApplyingPromo(false)
    }
  }

  const handleApplyCoupon = () => applyPromo(couponCode)

  const handleProceedToCheckout = async () => {
    if (!selectedPlan) return
    trackInitiateCheckout(getPayableAmount(), "USD", false, createEventId("checkout"), {
      planLabel: activeTypeMeta.label,
      challengeType: activeAccountType,
    })
    setSubmitError(null)
    setIsSubmitting(true)
    try {
      const { order } = await createOrder({
        planId: selectedPlan.id,
        paymentMethod: selectedPaymentMethod,
        couponCode: promo ? promo.code : undefined,
      })
      closeSidebar()
      setSuccessPopup({ title: "Order Created!", message: "Redirecting to checkout to complete your payment..." })
      const { checkoutUrl } = await payOrder(order.id)
      setTimeout(() => {
        window.location.href = checkoutUrl
      }, 1500)
    } catch (err) {
      const message = err instanceof ApiClientError ? err.message : "Failed to create order. Please try again."
      setSubmitError(message)
      setIsSubmitting(false)
    }
  }

  if (plansLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="relative bg-gradient-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#0d0d0d] overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/3 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-8">
          <Link href="/dashboard/overview" className="inline-flex items-center text-white/80 hover:text-white transition-colors text-sm font-medium gap-1 mb-8">
            <ChevronLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white text-center mb-8 tracking-tight">
            <span className="italic">Choose the Best Plan</span>
          </h1>

          <div className="flex flex-wrap justify-center items-center gap-3 mb-4">
            <div className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-full p-1 border border-white/10">
              {platformTypes.map((platform) => (
                <button
                  key={platform.id}
                  onClick={() => setActivePlatform(platform.id)}
                  className={`flex items-center justify-center px-4 py-2 rounded-full transition-all duration-200 ${
                    activePlatform === platform.id ? "bg-white shadow-md" : "hover:bg-white/5"
                  }`}
                >
                  <Image src={platform.logo} alt={platform.label} width={60} height={60} className="object-contain" unoptimized />
                </button>
              ))}
            </div>

            <div className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-full p-1 border border-white/10">
              {ACCOUNT_TYPE_ORDER.map((accountType) => (
                <button
                  key={accountType.key}
                  onClick={() => handleAccountTypeChange(accountType.key)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    activeAccountType === accountType.key ? "bg-white/20 text-white shadow-md" : "text-white/70 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {accountType.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-4 pb-12">
        <Card className="max-w-5xl mx-auto border-border bg-card shadow-xl rounded-xl overflow-hidden animate-slide-in-up p-0">
          {plansForType.length === 0 ? (
            <p className="py-12 px-6 text-center text-sm text-muted-foreground">No {activeTypeMeta.label} accounts are available right now.</p>
          ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left py-4 px-6 font-semibold text-foreground text-sm">Account Size</th>
                  {plansForType.map((p) => (
                    <th key={p.id} className="text-center py-4 px-4 font-bold text-lg text-foreground">
                      {usd(p.size)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border">
                  <td className="py-5 px-6"></td>
                  {plansForType.map((p) => (
                    <td key={p.id} className="py-5 px-4 text-center">
                      <div className="space-y-2">
                        <Button
                          onClick={() => handleGetPlan(p.id)}
                          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold py-2.5 rounded-lg shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.02]"
                        >
                          Get Plan
                        </Button>
                        <div className="text-xs font-semibold text-foreground">{usd2(p.price)}</div>
                      </div>
                    </td>
                  ))}
                </tr>

                {features.map((feature, idx) => (
                  <tr key={idx} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-3.5 px-6">
                      <div className="flex items-start gap-2">
                        <Info className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                        <p className="font-medium text-sm text-foreground">{feature.name}</p>
                      </div>
                    </td>
                    {plansForType.map((p) => {
                      const val = feature.values[p.id]
                      return (
                        <td key={p.id} className="py-3.5 px-4 text-center text-sm text-foreground">
                          {val === "check" ? (
                            <Check className="w-4 h-4 text-primary mx-auto" />
                          ) : val === "no" ? (
                            <X className="w-4 h-4 text-muted-foreground mx-auto" />
                          ) : (
                            val
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}
        </Card>

        <div className="max-w-5xl mx-auto mt-4 rounded-xl border border-border bg-card/60 px-5 py-4">
          <p className="text-sm font-semibold text-foreground">Key rules for {activeTypeMeta.label}</p>
          <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
            {keyRules.map((line) => (
              <li key={line} className="flex gap-2">
                <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-primary" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
          <Link
            href="/rules"
            className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            Read the full rules
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeSidebar}
      />

      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-card/95 backdrop-blur-xl border-l border-border/60 shadow-2xl z-50 transform transition-transform duration-300 ease-out ${
          sidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="relative border-b border-border/60 bg-gradient-to-r from-primary/5 via-transparent to-transparent">
            <div className="flex items-center justify-between px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20">
                  <Check className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground tracking-tight">Configure Plan</h2>
                  <p className="text-xs text-muted-foreground">Customize your trading challenge</p>
                </div>
              </div>
              <button onClick={closeSidebar} className="p-2 hover:bg-muted/80 rounded-lg transition-all duration-200 hover:scale-105">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-hide">
            <div className="p-6 space-y-6">
              <div className="relative rounded-xl border border-border/60 bg-gradient-to-br from-muted/50 to-muted/30 p-4 shadow-sm animate-slide-in-up overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl -mr-8 -mt-8" />
                <div className="relative">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/80 mb-1.5">Selected Plan</p>
                      <p className="text-2xl font-bold text-foreground tracking-tight">
                        {activeTypeMeta.label}-{selectedPlan ? usd(selectedPlan.size) : ""}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-0">
                          {activePlatform.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <Image
                        src={platformTypes.find((p) => p.id === activePlatform)?.logo || ""}
                        alt={activePlatform.toUpperCase()}
                        width={50}
                        height={50}
                        className="object-contain"
                        unoptimized
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="h-px bg-border/60" />

              <div className="space-y-3 animate-slide-in-up" style={{ animationDelay: "50ms" }}>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <p className="text-sm font-semibold text-foreground">Trading Platform</p>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  {platformTypes.map((platform) => (
                    <button
                      key={platform.id}
                      onClick={() => setSelectedPlatform(platform.id)}
                      className={`relative flex flex-col items-center gap-2 p-3.5 rounded-xl border transition-all duration-200 group ${
                        selectedPlatform === platform.id
                          ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                          : "border-border/60 bg-muted/20 hover:border-primary/40 hover:bg-muted/40 hover:shadow-sm"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                          selectedPlatform === platform.id ? "border-primary bg-primary" : "border-muted-foreground/40 group-hover:border-primary/50"
                        }`}
                      >
                        {selectedPlatform === platform.id && <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground" />}
                      </div>
                      <div className="w-full h-12 relative">
                        <Image src={platform.logo} alt={platform.label} fill className="object-contain" unoptimized />
                      </div>
                      <span className="text-xs font-medium text-foreground text-center">{platform.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-px bg-border/60" />

              <div className="space-y-3 animate-slide-in-up" style={{ animationDelay: "150ms" }}>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <p className="text-sm font-semibold text-foreground">Payment Method</p>
                </div>
                <div className="grid grid-cols-1 gap-2.5">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setSelectedPaymentMethod(method.id as "nowpayments")}
                      className={`relative flex flex-col items-center gap-2 p-3.5 rounded-xl border transition-all duration-200 group ${
                        selectedPaymentMethod === method.id
                          ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                          : "border-border/60 bg-muted/20 hover:border-primary/40 hover:bg-muted/40 hover:shadow-sm"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                          selectedPaymentMethod === method.id ? "border-primary bg-primary" : "border-muted-foreground/40 group-hover:border-primary/50"
                        }`}
                      >
                        {selectedPaymentMethod === method.id && <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground" />}
                      </div>
                      <div className="w-full h-12 relative">
                        <Image src={method.image} alt={method.label} fill className="object-contain" unoptimized />
                      </div>
                      <span className="text-xs font-medium text-foreground text-center">{method.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-px bg-border/60" />

              {includedOffers.length > 0 && (
                <>
                  <div className="space-y-3 animate-slide-in-up" style={{ animationDelay: "165ms" }}>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <p className="text-sm font-semibold text-foreground">Included with this plan</p>
                    </div>
                    <div className="space-y-1.5">
                      {includedOffers.map((o) => (
                        <div
                          key={`${o.type}-${o.name}`}
                          className="flex items-start gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-3 py-2.5"
                        >
                          <Gift className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-foreground">{o.shortLabel}</p>
                            <p className="mt-0.5 text-xs text-muted-foreground">{o.summary}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Applied automatically — no code needed.
                    </p>
                  </div>

                  <div className="h-px bg-border/60" />
                </>
              )}

              <div className="space-y-3 animate-slide-in-up" style={{ animationDelay: "175ms" }}>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <p className="text-sm font-semibold text-foreground">Coupon code</p>
                </div>
                <div className="flex gap-2">
                  <input
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Enter code"
                    className="flex-1 h-9 rounded-md border border-input bg-transparent px-3 text-sm uppercase outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                  <Button type="button" variant="outline" size="sm" onClick={handleApplyCoupon} disabled={applyingPromo}>
                    {applyingPromo ? "Checking…" : "Apply"}
                  </Button>
                </div>

                {/* Advertised coupon codes for this plan — tap to apply. */}
                {promosLoading ? (
                  <p className="text-xs text-muted-foreground">Checking for available codes…</p>
                ) : availableCoupons.length > 0 ? (
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-muted-foreground">
                      Available for this account{selectedPlan ? ` (${usd(selectedPlan.size)})` : ""}
                    </p>
                    {availableCoupons.map((c) => {
                      const applied = promo?.code === c.code
                      return (
                        <button
                          key={c.code}
                          type="button"
                          disabled={applyingPromo || applied}
                          onClick={() => void applyPromo(c.code)}
                          className={`flex w-full items-start gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors ${
                            applied
                              ? "border-emerald-500/40 bg-emerald-500/5"
                              : "border-dashed border-border hover:border-primary/40 hover:bg-primary/5"
                          }`}
                        >
                          <Tag className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                          <span className="min-w-0 flex-1">
                            <span className="flex items-center gap-2">
                              <span className="font-mono text-sm font-semibold text-foreground">{c.code}</span>
                              {c.discountAmount > 0 && (
                                <span className="text-xs font-semibold text-emerald-600">
                                  save {usd2(c.discountAmount)}
                                </span>
                              )}
                            </span>
                            <span className="mt-0.5 block text-xs text-muted-foreground">{c.summary}</span>
                          </span>
                          <span className="shrink-0 self-center text-xs font-semibold text-primary">
                            {applied ? "Applied" : "Apply"}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                ) : null}
                {promo && (
                  <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-3 py-2">
                    <p className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                      <Check className="h-3.5 w-3.5" />
                      {promo.code} applied
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{promo.summary}</p>
                  </div>
                )}
                {couponError && <p className="text-xs text-destructive">{couponError}</p>}
              </div>

              <div className="h-px bg-border/60" />

              <div className="space-y-3 animate-slide-in-up" style={{ animationDelay: "200ms" }}>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <p className="text-sm font-semibold text-foreground">Order Summary</p>
                </div>
                <div className="rounded-xl border border-border/60 bg-muted/20 p-4 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Plan price</span>
                    <span className="font-medium text-foreground">{selectedPlan ? usd2(selectedPlan.price) : "$0.00"}</span>
                  </div>
                  {promo && promo.discountAmount > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{promo.code}</span>
                      <span className="font-medium text-emerald-600">−{usd2(promo.discountAmount)}</span>
                    </div>
                  )}
                  {includedOffers.map((o) => (
                    <div key={`sum-${o.type}-${o.name}`} className="flex items-start justify-between gap-3 text-sm">
                      <span className="text-muted-foreground">{o.shortLabel}</span>
                      <span className="text-right text-xs font-medium text-emerald-600">Included</span>
                    </div>
                  ))}
                  <div className="h-px bg-border/60" />
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-foreground">Total</span>
                    <span className="text-xl font-bold text-primary">{usd2(getPayableAmount())}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-border/60 bg-gradient-to-t from-muted/40 to-transparent">
            <label className="flex items-start gap-3 mb-5 cursor-pointer group">
              <div
                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 shrink-0 mt-0.5 ${
                  agreedToTerms ? "bg-primary border-primary shadow-md shadow-primary/20" : "border-border group-hover:border-primary/50"
                }`}
                onClick={() => setAgreedToTerms(!agreedToTerms)}
              >
                {agreedToTerms && <Check className="w-3 h-3 text-primary-foreground" />}
              </div>
              <span className="text-sm text-muted-foreground leading-relaxed">
                I agree to the{" "}
                <Link href="#" className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors">
                  Terms of Service
                </Link>{" "}
                &{" "}
                <Link href="#" className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors">
                  Challenge Terms
                </Link>
                .
              </span>
            </label>

            {submitError && <p className="text-sm text-destructive font-medium mb-2">{submitError}</p>}

            <Button
              disabled={!agreedToTerms || isSubmitting || !selectedPlan}
              onClick={handleProceedToCheckout}
              className="w-full h-14 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold rounded-xl shadow-lg shadow-primary/20 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed transition-all duration-300 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.01] group"
            >
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-start">
                  <span className="text-base font-semibold">{isSubmitting ? "Creating order..." : "Proceed to Checkout"}</span>
                  <span className="text-xs font-normal opacity-80">{usd2(getPayableAmount())} total</span>
                </div>
                <ChevronRight className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" />
              </div>
            </Button>

            <div className="flex items-center justify-center gap-2 mt-4 text-xs text-muted-foreground/70">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>Secure 256-bit SSL encryption</span>
            </div>
          </div>
        </div>
      </div>

      {successPopup && (
        <SuccessPopup message={successPopup.message} title={successPopup.title} duration={2500} onClose={() => setSuccessPopup(null)} />
      )}
    </div>
  )
}
