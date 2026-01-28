"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Info,
  X,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleDot,
} from "lucide-react"

const platformTypes = [
  { id: "mt4", label: "MT4", logo: "https://res.cloudinary.com/dejjuhzug/image/upload/v1764395131/d1b7332b-1650-4a91-a1a0-8d09b53936ec_ougmpe.png" },
  { id: "mt5", label: "MT5", logo: "https://res.cloudinary.com/dejjuhzug/image/upload/v1764395181/f0bdc4ec-31ba-43db-af2d-990985a4827d_ezvlm9.png" },
]

const accountTypes = [
  { id: "alpha", label: "Alpha" },
  { id: "beta", label: "Beta" },
  { id: "gamma", label: "Gamma" },
  { id: "sigma", label: "Sigma" },
]

const accountSizes = [
  { id: "6k", label: "$6k", value: 6000 },
  { id: "15k", label: "$15k", value: 15000 },
  { id: "25k", label: "$25k", value: 25000 },
  { id: "50k", label: "$50k", value: 50000 },
]

const features = [
  {
    name: "15% Performance Reward",
    subtitle: "From Challenge Phase",
    values: { "6k": "$117", "15k": "$292.50", "25k": "$487.50", "50k": "$975" },
  },
  {
    name: "Phase 1 Profit Target",
    values: { "6k": "8%", "15k": "8%", "25k": "8%", "50k": "8%" },
  },
  {
    name: "Phase 2 Profit Target",
    values: { "6k": "5%", "15k": "5%", "25k": "5%", "50k": "5%" },
  },
  {
    name: "Maximum Loss Limit",
    values: {
      "6k": "10% ($600)",
      "15k": "10% ($1,500)",
      "25k": "10% ($2,500)",
      "50k": "10% ($5,000)",
    },
  },
  {
    name: "Daily Loss Limit",
    values: {
      "6k": "5% ($300)",
      "15k": "5% ($750)",
      "25k": "5% ($1,250)",
      "50k": "5% ($2,500)",
    },
  },
  {
    name: "News Trading",
    values: { "6k": "check", "15k": "check", "25k": "check", "50k": "check" },
  },
  {
    name: "Performance Reward Upto",
    values: { "6k": "95%", "15k": "95%", "25k": "95%", "50k": "95%" },
  },
  {
    name: "Minimum Trading Days",
    values: { "6k": "5 Days", "15k": "5 Days", "25k": "5 Days", "50k": "5 Days" },
  },
  {
    name: "First Withdrawal",
    values: { "6k": "21 Days", "15k": "21 Days", "25k": "21 Days", "50k": "21 Days" },
  },
  {
    name: "Refundable Fee",
    values: { "6k": "$59.99", "15k": "$119.99", "25k": "$199.99", "50k": "$299.99" },
  },
]

const pricing = {
  "6k": { original: "$59.99", amount: 59.99 },
  "15k": { original: "$119.99", amount: 119.99 },
  "25k": { original: "$199.99", amount: 199.99 },
  "50k": { original: "$299.99", amount: 299.99 },
}

const platforms = [
  { id: "mt4", label: "MT4", extra: null },
  { id: "mt5", label: "MT5", extra: null },
  { id: "ctrader", label: "cTrader", extra: "+$25" },
  { id: "match-trader", label: "Match-Trader", extra: "+$25" },
]

const swapTypes = [
  { id: "swap", label: "Swap", extra: null },
  { id: "swap-free", label: "Swap-Free", extra: "Price + 10%" },
]

export function BuysContent() {
  const [activePlatform, setActivePlatform] = useState("mt5")
  const [activeAccountType, setActiveAccountType] = useState("alpha")
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [selectedPlatform, setSelectedPlatform] = useState("mt5")
  const [selectedSwapType, setSelectedSwapType] = useState("swap")
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

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
    return `${accountType?.label || ""}-$${size?.value || 0}`
  }

  const getPayableAmount = () => {
    if (!selectedSize) return "0.00"
    const base = pricing[selectedSize as keyof typeof pricing]?.amount || 0
    let total = base
    const platform = platforms.find((p) => p.id === selectedPlatform)
    if (platform?.extra) total += 25
    if (selectedSwapType === "swap-free") total = total * 1.1
    return total.toFixed(2)
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
            href="/"
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
                  className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    activePlatform === platform.id
                      ? "bg-white text-gray-900 shadow-md"
                      : "text-white/80 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Image
                    src={platform.logo}
                    alt={platform.label}
                    width={20}
                    height={20}
                    className="object-contain"
                    unoptimized
                  />
                  <span>{platform.label}</span>
                </button>
              ))}
            </div>

            {/* Account Types Toggle - Alpha, Beta, Gamma, Sigma */}
            <div className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-full p-1 border border-white/10">
              {accountTypes.map((accountType) => (
                <button
                  key={accountType.id}
                  onClick={() => setActiveAccountType(accountType.id)}
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
                    const price = pricing[size.id as keyof typeof pricing]
                    return (
                      <td key={size.id} className="py-5 px-4 text-center">
                        <div className="space-y-2">
                          <Button
                            onClick={() => handleGetPlan(size.id)}
                            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold py-2.5 rounded-lg shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.02]"
                          >
                            Get Plan
                          </Button>
                          <p className="text-xs text-muted-foreground">
                            Fee:{" "}
                            <span className="line-through">{price.original}</span>
                          </p>
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
                  {platforms.map((platform) => (
                    <button
                      key={platform.id}
                      onClick={() => setSelectedPlatform(platform.id)}
                      className={`relative flex items-center gap-2.5 p-3.5 rounded-xl border transition-all duration-200 group ${
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
                      <div className="flex-1 text-left">
                        <span className="text-sm font-medium text-foreground">
                          {platform.label}
                        </span>
                        {platform.extra && (
                          <span className="text-[10px] text-muted-foreground block">
                            {platform.extra}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-border/60" />

              {/* Select Swap Type */}
              <div className="space-y-3 animate-slide-in-up" style={{ animationDelay: "100ms" }}>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <p className="text-sm font-semibold text-foreground">Swap Type</p>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  {swapTypes.map((swap) => (
                    <button
                      key={swap.id}
                      onClick={() => setSelectedSwapType(swap.id)}
                      className={`relative flex items-center gap-2.5 p-3.5 rounded-xl border transition-all duration-200 group ${
                        selectedSwapType === swap.id
                          ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                          : "border-border/60 bg-muted/20 hover:border-primary/40 hover:bg-muted/40 hover:shadow-sm"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                          selectedSwapType === swap.id
                            ? "border-primary bg-primary"
                            : "border-muted-foreground/40 group-hover:border-primary/50"
                        }`}
                      >
                        {selectedSwapType === swap.id && (
                          <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground" />
                        )}
                      </div>
                      <div className="flex-1 text-left">
                        <span className="text-sm font-medium text-foreground">
                          {swap.label}
                        </span>
                        {swap.extra && (
                          <span className="text-[10px] text-muted-foreground block">
                            {swap.extra}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-border/60" />

              {/* Order Summary */}
              <div className="space-y-3 animate-slide-in-up" style={{ animationDelay: "150ms" }}>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <p className="text-sm font-semibold text-foreground">Order Summary</p>
                </div>
                <div className="rounded-xl border border-border/60 bg-muted/20 p-4 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Base Fee</span>
                    <span className="font-medium text-foreground">
                      ${selectedSize ? pricing[selectedSize as keyof typeof pricing]?.amount.toFixed(2) : "0.00"}
                    </span>
                  </div>
                  {selectedPlatform === "ctrader" || selectedPlatform === "match-trader" ? (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Platform Fee</span>
                      <span className="font-medium text-foreground">+$25.00</span>
                    </div>
                  ) : null}
                  {selectedSwapType === "swap-free" && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Swap-Free (10%)</span>
                      <span className="font-medium text-foreground">+10%</span>
                    </div>
                  )}
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

            {/* Get Started Button */}
            <Button
              disabled={!agreedToTerms}
              className="w-full h-14 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold rounded-xl shadow-lg shadow-primary/20 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed transition-all duration-300 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.01] group"
            >
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-start">
                  <span className="text-base font-semibold">Proceed to Checkout</span>
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
    </div>
  )
}
