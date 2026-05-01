"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Info,
  X,
  Check,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import {
  createOrderWithOxapay,
  OXAPAY_ORDER_DESCRIPTION,
  OXAPAY_THANKS_MESSAGE,
} from "@/lib/api/orders"
import { ApiClientError } from "@/lib/api/client"
import SuccessPopup from "@/app/components/SuccessPopup"

const platformTypes = [
  { id: "mt4", label: "MT4", logo: "/MT4.png" },
  { id: "mt5", label: "MT5", logo: "/MT5 (2).png" },
]

const accountTypes = [
  // Keep backend ids, update UI labels
  { id: "alpha", label: "Step 1" },
  { id: "beta", label: "Step 2" },
  { id: "sigma", label: "Instant" },
]

function normalizeChallengeType(input: string): "alpha" | "beta" | "sigma" {
  const v = String(input || "").trim().toLowerCase()
  if (v === "alpha" || v === "step1" || v === "step 1" || v === "phase1" || v === "phase 1") return "alpha"
  if (v === "beta" || v === "step2" || v === "step 2" || v === "phase2" || v === "phase 2") return "beta"
  if (v === "sigma" || v === "instant" || v === "step3" || v === "step 3") return "sigma"
  return "alpha"
}

// Account sizes per account type
const accountSizesByType: Record<string, Array<{ id: string; label: string; value: number }>> = {
  alpha: [
    { id: "3k", label: "$3k", value: 3000 },
    { id: "5k", label: "$5k", value: 5000 },
    { id: "10k", label: "$10k", value: 10000 },
    { id: "50k", label: "$50k", value: 50000 },
    { id: "100k", label: "$100k", value: 100000 },
    { id: "200k", label: "$200k", value: 200000 },
    { id: "500k", label: "$500k", value: 500000 },
  ],
  beta: [
    { id: "3k", label: "$3k", value: 3000 },
    { id: "5k", label: "$5k", value: 5000 },
    { id: "10k", label: "$10k", value: 10000 },
    { id: "50k", label: "$50k", value: 50000 },
    { id: "100k", label: "$100k", value: 100000 },
    { id: "200k", label: "$200k", value: 200000 },
    { id: "500k", label: "$500k", value: 500000 },
  ],
  sigma: [
    { id: "3k", label: "$3k", value: 3000 },
    { id: "5k", label: "$5k", value: 5000 },
    { id: "10k", label: "$10k", value: 10000 },
    { id: "50k", label: "$50k", value: 50000 },
    { id: "100k", label: "$100k", value: 100000 },
    { id: "200k", label: "$200k", value: 200000 },
    { id: "500k", label: "$500k", value: 500000 },
  ],
}

type FeatureRow = { name: string; subtitle?: string; values: Record<string, string> }

function usd(n: number) {
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

function usd2(n: number) {
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function realPriceFromDiscounted(discounted: number) {
  return Number((discounted * 1.65).toFixed(2))
}

function buildFeatures(accountTypeId: string, sizes: Array<{ id: string; value: number }>): FeatureRow[] {
  const profitTarget1 = accountTypeId === "beta" ? "8%" : accountTypeId === "sigma" ? "—" : "8%"
  const profitTarget2 = accountTypeId === "beta" ? "5%" : accountTypeId === "sigma" ? "—" : "5%"
  const minDays = accountTypeId === "beta" ? "5 Days" : accountTypeId === "sigma" ? "0 Days" : "0 Days"

  const maxLossPct = 10
  const dailyLossPct = 5

  const maxLossValues: Record<string, string> = {}
  const dailyLossValues: Record<string, string> = {}
  sizes.forEach((s) => {
    maxLossValues[s.id] = `${maxLossPct}% (${usd(Math.round((s.value * maxLossPct) / 100))})`
    dailyLossValues[s.id] = `${dailyLossPct}% (${usd(Math.round((s.value * dailyLossPct) / 100))})`
  })

  const fill = (v: string) => Object.fromEntries(sizes.map((s) => [s.id, v])) as Record<string, string>

  return [
    { name: "Phase 1 Profit Target", values: fill(profitTarget1) },
    { name: "Phase 2 Profit Target", values: fill(profitTarget2) },
    { name: "Maximum Loss Limit", values: maxLossValues },
    { name: "Daily Loss Limit", values: dailyLossValues },
    { name: "News Trading", values: fill("check") },
    { name: "Performance Reward Upto", values: fill("95%") },
    { name: "Minimum Trading Days", values: fill(minDays) },
    { name: "First Withdrawal", values: fill("21 Days") },
  ]
}

// Pricing per account type
const pricingByType: Record<string, Record<string, { amount: number }>> = {
  alpha: {
    "3k": { amount: 14 },
    "5k": { amount: 23 },
    "10k": { amount: 32 },
    "50k": { amount: 49 },
    "100k": { amount: 103 },
    "200k": { amount: 145 },
    "500k": { amount: 240 },
  },
  beta: {
    "3k": { amount: 9 },
    "5k": { amount: 14 },
    "10k": { amount: 23 },
    "50k": { amount: 42 },
    "100k": { amount: 82 },
    "200k": { amount: 123 },
    "500k": { amount: 200 },
  },
  sigma: {
    "3k": { amount: 29 },
    "5k": { amount: 38 },
    "10k": { amount: 50 },
    "50k": { amount: 91 },
    "100k": { amount: 180 },
    "200k": { amount: 323 },
    "500k": { amount: 900 },
  },
}

const platforms = [
  { id: "mt4", label: "MT4" },
  { id: "mt5", label: "MT5" },
]

const paymentMethods = [
  {
    id: "crypto",
    label: "Crypto",
    // Use same icon previously used for Credit/Debit Card
    image: "https://fundednext.fra1.digitaloceanspaces.com/utility-files/6267395.png",
  },
]

export function BuysContent() {
  const router = useRouter()
  const [activePlatform, setActivePlatform] = useState("mt5")
  const [activeAccountType, setActiveAccountType] = useState<"alpha" | "beta" | "sigma">("alpha")
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [selectedPlatform, setSelectedPlatform] = useState("mt5")
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("crypto")
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [successPopup, setSuccessPopup] = useState<{ title: string; message: string } | null>(null)

  // Get dynamic data based on account type
  const accountSizes = accountSizesByType[activeAccountType] || accountSizesByType.alpha
  const features = buildFeatures(activeAccountType, accountSizes)
  const pricing = pricingByType[activeAccountType] || pricingByType.alpha

  // Reset selected size if it doesn't exist in the new account type
  const handleAccountTypeChange = (newType: string) => {
    const normalized = normalizeChallengeType(newType)
    setActiveAccountType(normalized)
    if (selectedSize && !accountSizesByType[normalized]?.find(s => s.id === selectedSize)) {
      setSelectedSize(null)
      setSidebarOpen(false)
    }
  }

  const handleGetPlan = (sizeId: string) => {
    setSelectedSize(sizeId)
    setSidebarOpen(true)
  }

  const closeSidebar = () => {
    setSidebarOpen(false)
  }

  const getSelectedPlanName = () => {
    const accountType = accountTypes.find((p) => p.id === activeAccountType)
    const size = accountSizes.find((s) => s.id === selectedSize)
    return `${accountType?.label || ""}-$${size?.value.toLocaleString() || 0}`
  }

  const getPayableAmount = () => {
    if (!selectedSize || !pricing[selectedSize]) return "0.00"
    const base = pricing[selectedSize].amount || 0
    return base.toFixed(2)
  }

  const handleProceedToCheckout = async () => {
    if (!selectedSize) return
    const sizeOption = accountSizes.find((s) => s.id === selectedSize)
    const accountSizeValue = sizeOption?.value ?? 0
    const amount = getPayableAmount()
    setSubmitError(null)
    setIsSubmitting(true)
    try {
      const response = await createOrderWithOxapay({
        challenge_type: normalizeChallengeType(activeAccountType),
        account_size: String(accountSizeValue),
        platform: selectedPlatform,
        amount,
        currency: "USD",
        to_currency: "USDT",
        order_name: "",
        description: OXAPAY_ORDER_DESCRIPTION,
        lifetime: 60,
        fee_paid_by_payer: 1,
        under_paid_coverage: 2.5,
        auto_withdrawal: false,
        mixed_payment: true,
        return_url: "https://www.fxonyx.com",
        thanks_message: OXAPAY_THANKS_MESSAGE,
      })
      closeSidebar()
      const checkoutUrl = response?.checkout_session_url
      if (checkoutUrl && typeof checkoutUrl === "string" && checkoutUrl.trim() !== "") {
        setSuccessPopup({
          title: "Order Created!",
          message: "Redirecting to checkout to complete your payment...",
        })
        setTimeout(() => { window.location.href = checkoutUrl }, 2500)
      } else {
        setSuccessPopup({
          title: "Order Placed!",
          message: "Your order has been placed successfully. Taking you to your dashboard...",
        })
        setTimeout(() => router.push("/dashboard/overview"), 2500)
      }
    } catch (err) {
      const message = err instanceof ApiClientError ? err.message : "Failed to create order. Please try again."
      setSubmitError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section with Gradient */}
      <div className="relative bg-gradient-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#0d0d0d] overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/3 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-8">
          {/* Back to Dashboard */}
          <Link
            href="/dashboard/overview"
            className="inline-flex items-center text-white/80 hover:text-white transition-colors text-sm font-medium gap-1 mb-8"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white text-center mb-8 tracking-tight">
            <span className="italic">Choose the Best Plan</span>
          </h1>

          {/* Plan Type Tabs */}
          <div className="flex flex-wrap justify-center items-center gap-3 mb-4">
            {/* MT4 / MT5 Toggle - Moved to top */}
            <div className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-full p-1 border border-white/10">
              {platformTypes.map((platform) => (
                <button
                  key={platform.id}
                  onClick={() => setActivePlatform(platform.id)}
                  className={`flex items-center justify-center px-4 py-2 rounded-full transition-all duration-200 ${
                    activePlatform === platform.id
                      ? "bg-white shadow-md"
                      : "hover:bg-white/5"
                  }`}
                >
                  <Image
                    src={platform.logo}
                    alt={platform.label}
                    width={60}
                    height={60}
                    className="object-contain"
                    unoptimized
                  />
                </button>
              ))}
            </div>

            {/* Account Types Toggle - Alpha, Beta, Gamma, Sigma */}
            <div className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-full p-1 border border-white/10">
              {accountTypes.map((accountType) => (
                <button
                  key={accountType.id}
                  onClick={() => handleAccountTypeChange(accountType.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    activeAccountType === accountType.id
                      ? "bg-white/20 text-white shadow-md"
                      : "text-white/70 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {accountType.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-4 pb-12">
        <Card className="max-w-5xl mx-auto border-border bg-card shadow-xl rounded-xl overflow-hidden animate-slide-in-up p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left py-4 px-6 font-semibold text-foreground text-sm">
                    Account Size
                  </th>
                  {accountSizes.map((size) => (
                    <th
                      key={size.id}
                      className="text-center py-4 px-4 font-bold text-lg text-foreground"
                    >
                      {size.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Get Plan Row */}
                <tr className="border-b border-border">
                  <td className="py-5 px-6"></td>
                  {accountSizes.map((size) => {
                    const price = pricing[size.id]
                    const discounted = price?.amount ?? 0
                    const real = realPriceFromDiscounted(discounted)
                    return (
                      <td key={size.id} className="py-5 px-4 text-center">
                        <div className="space-y-2">
                          <Button
                            onClick={() => handleGetPlan(size.id)}
                            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold py-2.5 rounded-lg shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.02]"
                          >
                            Get Plan
                          </Button>
                          <div className="text-xs">
                            <span className="text-muted-foreground line-through mr-1">
                              {usd2(real)}
                            </span>
                            <span className="font-semibold text-foreground">
                              {usd2(discounted)}
                            </span>
                            <div className="mt-0.5 text-[10px] text-muted-foreground">
                              Discounted / Real (+65%)
                            </div>
                          </div>
                        </div>
                      </td>
                    )
                  })}
                </tr>

                {/* Feature Rows */}
                {features.map((feature, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                  >
                    <td className="py-3.5 px-6">
                      <div className="flex items-start gap-2">
                        <Info className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-sm text-foreground">
                            {feature.name}
                          </p>
                          {feature.subtitle && (
                            <p className="text-xs text-primary mt-0.5">
                              {feature.subtitle}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    {accountSizes.map((size) => {
                      const val = feature.values[size.id as keyof typeof feature.values]
                      return (
                        <td
                          key={size.id}
                          className="py-3.5 px-4 text-center text-sm text-foreground"
                        >
                          {val === "check" ? (
                            <Check className="w-4 h-4 text-primary mx-auto" />
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
        </Card>
      </div>

      {/* Sidebar Overlay */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeSidebar}
      />

      {/* Sidebar Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-card/95 backdrop-blur-xl border-l border-border/60 shadow-2xl z-50 transform transition-transform duration-300 ease-out ${
          sidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header with gradient accent */}
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
              <button
                onClick={closeSidebar}
                className="p-2 hover:bg-muted/80 rounded-lg transition-all duration-200 hover:scale-105"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto scrollbar-hide">
            <div className="p-6 space-y-6">
              {/* Selected Plan Card */}
              <div className="relative rounded-xl border border-border/60 bg-gradient-to-br from-muted/50 to-muted/30 p-4 shadow-sm animate-slide-in-up overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl -mr-8 -mt-8" />
                <div className="relative">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/80 mb-1.5">Selected Plan</p>
                      <p className="text-2xl font-bold text-foreground tracking-tight">
                        {getSelectedPlanName()}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-0">
                          {activePlatform.toUpperCase()}
                        </Badge>
                        <Badge variant="secondary" className="text-xs bg-muted text-muted-foreground border-0">
                          {accountTypes.find(p => p.id === activeAccountType)?.label}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <Image
                        src={platformTypes.find(p => p.id === activePlatform)?.logo || ""}
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

              {/* Divider */}
              <div className="h-px bg-border/60" />

              {/* Select Platform */}
              <div className="space-y-3 animate-slide-in-up" style={{ animationDelay: "50ms" }}>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <p className="text-sm font-semibold text-foreground">Trading Platform</p>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  {platforms.map((platform) => {
                    const platformType = platformTypes.find(p => p.id === platform.id)
                    return (
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
                            selectedPlatform === platform.id
                              ? "border-primary bg-primary"
                              : "border-muted-foreground/40 group-hover:border-primary/50"
                          }`}
                        >
                          {selectedPlatform === platform.id && (
                            <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground" />
                          )}
                        </div>
                        <div className="w-full h-12 relative">
                          <Image
                            src={platformType?.logo || ""}
                            alt={platform.label}
                            fill
                            className="object-contain"
                            unoptimized
                          />
                        </div>
                        <span className="text-xs font-medium text-foreground text-center">
                          {platform.label}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-border/60" />

              {/* Select Payment Method */}
              <div className="space-y-3 animate-slide-in-up" style={{ animationDelay: "150ms" }}>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <p className="text-sm font-semibold text-foreground">Payment Method</p>
                </div>
                <div className={`grid ${paymentMethods.length === 1 ? "grid-cols-1" : "grid-cols-2"} gap-2.5`}>
                  {paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setSelectedPaymentMethod(method.id)}
                      className={`relative flex flex-col items-center gap-2 p-3.5 rounded-xl border transition-all duration-200 group ${
                        selectedPaymentMethod === method.id
                          ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                          : "border-border/60 bg-muted/20 hover:border-primary/40 hover:bg-muted/40 hover:shadow-sm"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                          selectedPaymentMethod === method.id
                            ? "border-primary bg-primary"
                            : "border-muted-foreground/40 group-hover:border-primary/50"
                        }`}
                      >
                        {selectedPaymentMethod === method.id && (
                          <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground" />
                        )}
                      </div>
                      <div className="w-full h-12 relative">
                        <Image
                          src={method.image}
                          alt={method.label}
                          fill
                          className="object-contain"
                          unoptimized
                        />
                      </div>
                      <span className="text-xs font-medium text-foreground text-center">
                        {method.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-border/60" />

              {/* Order Summary */}
              <div className="space-y-3 animate-slide-in-up" style={{ animationDelay: "200ms" }}>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <p className="text-sm font-semibold text-foreground">Order Summary</p>
                </div>
                <div className="rounded-xl border border-border/60 bg-muted/20 p-4 space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Real Price (+65%)</span>
                      <span className="font-medium text-muted-foreground line-through">
                        {selectedSize && pricing[selectedSize]
                          ? usd2(realPriceFromDiscounted(pricing[selectedSize].amount))
                          : "$0.00"}
                      </span>
                    </div>
                  <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Discounted Price</span>
                    <span className="font-medium text-foreground">
                        ${selectedSize && pricing[selectedSize] ? pricing[selectedSize].amount.toFixed(2) : "0.00"}
                    </span>
                  </div>
                  <div className="h-px bg-border/60" />
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-foreground">Total</span>
                    <span className="text-xl font-bold text-primary">${getPayableAmount()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-border/60 bg-gradient-to-t from-muted/40 to-transparent">
            {/* Terms Agreement */}
            <label className="flex items-start gap-3 mb-5 cursor-pointer group">
              <div
                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 shrink-0 mt-0.5 ${
                  agreedToTerms
                    ? "bg-primary border-primary shadow-md shadow-primary/20"
                    : "border-border group-hover:border-primary/50"
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

            {submitError && (
              <p className="text-sm text-destructive font-medium mb-2">{submitError}</p>
            )}
            {/* Get Started Button */}
            <Button
              disabled={!agreedToTerms || isSubmitting}
              onClick={handleProceedToCheckout}
              className="w-full h-14 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold rounded-xl shadow-lg shadow-primary/20 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed transition-all duration-300 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.01] group"
            >
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-start">
                  <span className="text-base font-semibold">
                    {isSubmitting ? "Creating order..." : "Proceed to Checkout"}
                  </span>
                  <span className="text-xs font-normal opacity-80">${getPayableAmount()} total</span>
                </div>
                <ChevronRight className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" />
              </div>
            </Button>
            
            {/* Security Badge */}
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
        <SuccessPopup
          message={successPopup.message}
          title={successPopup.title}
          duration={2500}
          onClose={() => setSuccessPopup(null)}
        />
      )}
    </div>
  )
}
