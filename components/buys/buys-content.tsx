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
  { id: "mt4", label: "MT4", logo: "https://res.cloudinary.com/dufcjjaav/image/upload/v1769778769/images__1_-removebg-preview_pbysow.png" },
  { id: "mt5", label: "MT5", logo: "https://res.cloudinary.com/dufcjjaav/image/upload/v1769778769/images__2_-removebg-preview_wtt40m.png" },
]

const accountTypes = [
  { id: "alpha", label: "Alpha" },
  { id: "beta", label: "Beta" },
  { id: "sigma", label: "Sigma" },
]

// Account sizes per account type
const accountSizesByType: Record<string, Array<{ id: string; label: string; value: number }>> = {
  alpha: [
    { id: "4k", label: "$4k", value: 4000 },
    { id: "10k", label: "$10k", value: 10000 },
    { id: "20k", label: "$20k", value: 20000 },
    { id: "50k", label: "$50k", value: 50000 },
    { id: "100k", label: "$100k", value: 100000 },
  ],
  beta: [
    { id: "4k", label: "$4k", value: 4000 },
    { id: "10k", label: "$10k", value: 10000 },
    { id: "20k", label: "$20k", value: 20000 },
    { id: "50k", label: "$50k", value: 50000 },
    { id: "100k", label: "$100k", value: 100000 },
  ],
  sigma: [
    { id: "5k", label: "$5k", value: 5000 },
    { id: "10k", label: "$10k", value: 10000 },
    { id: "25k", label: "$25k", value: 25000 },
    { id: "50k", label: "$50k", value: 50000 },
    { id: "100k", label: "$100k", value: 100000 },
  ],
}

// Features per account type
const featuresByType: Record<string, any[]> = {
  alpha: [
    {
      name: "15% Performance Reward",
      subtitle: "From Challenge Phase",
      values: { "4k": "$78", "10k": "$195", "20k": "$390", "50k": "$975", "100k": "$1,950" },
    },
    {
      name: "Phase 1 Profit Target",
      values: { "4k": "8%", "10k": "8%", "20k": "8%", "50k": "8%", "100k": "8%" },
    },
    {
      name: "Phase 2 Profit Target",
      values: { "4k": "5%", "10k": "5%", "20k": "5%", "50k": "5%", "100k": "5%" },
    },
    {
      name: "Maximum Loss Limit",
      values: {
        "4k": "10% ($400)",
        "10k": "10% ($1,000)",
        "20k": "10% ($2,000)",
        "50k": "10% ($5,000)",
        "100k": "10% ($10,000)",
      },
    },
    {
      name: "Daily Loss Limit",
      values: {
        "4k": "5% ($200)",
        "10k": "5% ($500)",
        "20k": "5% ($1,000)",
        "50k": "5% ($2,500)",
        "100k": "5% ($5,000)",
      },
    },
    {
      name: "News Trading",
      values: { "4k": "check", "10k": "check", "20k": "check", "50k": "check", "100k": "check" },
    },
    {
      name: "Performance Reward Upto",
      values: { "4k": "95%", "10k": "95%", "20k": "95%", "50k": "95%", "100k": "95%" },
    },
    {
      name: "Minimum Trading Days",
      values: { "4k": "0 Days", "10k": "0 Days", "20k": "0 Days", "50k": "0 Days", "100k": "0 Days" },
    },
    {
      name: "First Withdrawal",
      values: { "4k": "21 Days", "10k": "21 Days", "20k": "21 Days", "50k": "21 Days", "100k": "21 Days" },
    },
    {
      name: "Refundable Fee",
      values: { "4k": "$31", "10k": "$60", "20k": "$112", "50k": "$260", "100k": "$520" },
    },
  ],
  beta: [
    {
      name: "15% Performance Reward",
      subtitle: "From Challenge Phase",
      values: { "4k": "$78", "10k": "$195", "20k": "$390", "50k": "$975", "100k": "$1,950" },
    },
    {
      name: "Phase 1 Profit Target",
      values: { "4k": "8%", "10k": "8%", "20k": "8%", "50k": "8%", "100k": "8%" },
    },
    {
      name: "Phase 2 Profit Target",
      values: { "4k": "5%", "10k": "5%", "20k": "5%", "50k": "5%", "100k": "5%" },
    },
    {
      name: "Maximum Loss Limit",
      values: {
        "4k": "10% ($400)",
        "10k": "10% ($1,000)",
        "20k": "10% ($2,000)",
        "50k": "10% ($5,000)",
        "100k": "10% ($10,000)",
      },
    },
    {
      name: "Daily Loss Limit",
      values: {
        "4k": "5% ($200)",
        "10k": "5% ($500)",
        "20k": "5% ($1,000)",
        "50k": "5% ($2,500)",
        "100k": "5% ($5,000)",
      },
    },
    {
      name: "News Trading",
      values: { "4k": "check", "10k": "check", "20k": "check", "50k": "check", "100k": "check" },
    },
    {
      name: "Performance Reward Upto",
      values: { "4k": "95%", "10k": "95%", "20k": "95%", "50k": "95%", "100k": "95%" },
    },
    {
      name: "Minimum Trading Days",
      values: { "4k": "5 Days", "10k": "5 Days", "20k": "5 Days", "50k": "5 Days", "100k": "5 Days" },
    },
    {
      name: "First Withdrawal",
      values: { "4k": "21 Days", "10k": "21 Days", "20k": "21 Days", "50k": "21 Days", "100k": "21 Days" },
    },
    {
      name: "Refundable Fee",
      values: { "4k": "$31", "10k": "$60", "20k": "$112", "50k": "$260", "100k": "$520" },
    },
  ],
  sigma: [
    {
      name: "15% Performance Reward",
      subtitle: "From Challenge Phase",
      values: { "5k": "$97.50", "10k": "$195", "25k": "$487.50", "50k": "$975", "100k": "$1,950" },
    },
    {
      name: "Phase 1 Profit Target",
      values: { "5k": "8%", "10k": "8%", "25k": "8%", "50k": "8%", "100k": "8%" },
    },
    {
      name: "Phase 2 Profit Target",
      values: { "5k": "5%", "10k": "5%", "25k": "5%", "50k": "5%", "100k": "5%" },
    },
    {
      name: "Maximum Loss Limit",
      values: {
        "5k": "10% ($500)",
        "10k": "10% ($1,000)",
        "25k": "10% ($2,500)",
        "50k": "10% ($5,000)",
        "100k": "10% ($10,000)",
      },
    },
    {
      name: "Daily Loss Limit",
      values: {
        "5k": "5% ($250)",
        "10k": "5% ($500)",
        "25k": "5% ($1,250)",
        "50k": "5% ($2,500)",
        "100k": "5% ($5,000)",
      },
    },
    {
      name: "News Trading",
      values: { "5k": "check", "10k": "check", "25k": "check", "50k": "check", "100k": "check" },
    },
    {
      name: "Performance Reward Upto",
      values: { "5k": "95%", "10k": "95%", "25k": "95%", "50k": "95%", "100k": "95%" },
    },
    {
      name: "Minimum Trading Days",
      values: { "5k": "0 Days", "10k": "0 Days", "25k": "0 Days", "50k": "0 Days", "100k": "0 Days" },
    },
    {
      name: "First Withdrawal",
      values: { "5k": "21 Days", "10k": "21 Days", "25k": "21 Days", "50k": "21 Days", "100k": "21 Days" },
    },
    {
      name: "Refundable Fee",
      values: { "5k": "$38", "10k": "$60", "25k": "$147", "50k": "$260", "100k": "$520" },
    },
  ],
}

// Pricing per account type
const pricingByType: Record<string, Record<string, { original: string; amount: number }>> = {
  alpha: {
    "4k": { original: "$45", amount: 31 },
    "10k": { original: "$85", amount: 60 },
    "20k": { original: "$160", amount: 112 },
    "50k": { original: "$375", amount: 260 },
    "100k": { original: "$750", amount: 520 },
  },
  beta: {
    "4k": { original: "$45", amount: 31 },
    "10k": { original: "$85", amount: 60 },
    "20k": { original: "$160", amount: 112 },
    "50k": { original: "$375", amount: 260 },
    "100k": { original: "$750", amount: 520 },
  },
  sigma: {
    "5k": { original: "$55", amount: 38 },
    "10k": { original: "$85", amount: 60 },
    "25k": { original: "$210", amount: 147 },
    "50k": { original: "$375", amount: 260 },
    "100k": { original: "$750", amount: 520 },
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
    image: "https://fundednext.fra1.digitaloceanspaces.com/utility-files/5967937.gif"
  },
  { 
    id: "card", 
    label: "Credit/Debit Card", 
    image: "https://fundednext.fra1.digitaloceanspaces.com/utility-files/6267395.png"
  },
]

export function BuysContent() {
  const [activePlatform, setActivePlatform] = useState("mt5")
  const [activeAccountType, setActiveAccountType] = useState("alpha")
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [selectedPlatform, setSelectedPlatform] = useState("mt5")
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("crypto")
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Get dynamic data based on account type
  const accountSizes = accountSizesByType[activeAccountType] || accountSizesByType.alpha
  const features = featuresByType[activeAccountType] || featuresByType.alpha
  const pricing = pricingByType[activeAccountType] || pricingByType.alpha

  // Reset selected size if it doesn't exist in the new account type
  const handleAccountTypeChange = (newType: string) => {
    setActiveAccountType(newType)
    if (selectedSize && !accountSizesByType[newType]?.find(s => s.id === selectedSize)) {
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
                              {price?.original}
                            </span>
                            <span className="font-semibold text-foreground">
                              ${price?.amount}
                            </span>
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
                <div className="grid grid-cols-2 gap-2.5">
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
                    <span className="text-muted-foreground">Base Fee</span>
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
