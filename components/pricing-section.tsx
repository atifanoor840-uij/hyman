"use client"

import { useState } from "react"
import { Check, Copy, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { 
  type AccountType, 
  type FundingAmount,
  getPrice, 
  getDailyDrawdown, 
  getMaxDrawdown,
  getOriginalPrice 
} from "@/lib/pricing"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export function PricingSection() {
  const [selectedAccountType, setSelectedAccountType] = useState<AccountType>("DRAGON PRIME")
  const [copiedCode, setCopiedCode] = useState("")

  const copyToClipboard = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCode(code)
      setTimeout(() => setCopiedCode(""), 2000)
    } catch (err) {
      console.error('Failed to copy: ', err)
    }
  }

  const accountTypes: AccountType[] = ["DRAGON APEX", "DRAGON PRIME", "SWING", "HFT DRAGON", "DRAGON INSTANT PRO"]

  // Filter to only 100K, 200K, 500K for DRAGON INSTANT PRO account type
  const displayAmounts: FundingAmount[] = selectedAccountType === "DRAGON INSTANT PRO" 
    ? ["100K", "200K", "500K"]
    : ["3K", "5K", "10K", "25K", "50K", "100K", "200K", "500K"]

  const accountRules: Record<AccountType, Record<string, string>> = {
    "DRAGON APEX": {
      "Minimum Trading Days": "4",
      "Minimum Trades": "4",
      "Trading Period": "Unlimited",
      "Profit Target": "10%",
      "Daily Drawdown": "4%",
      "Maximum Drawdown": "10%",
      "Profit Split": "80% to 100% (5% increase after first withdrawal)",
      "Leverage": "1:100",
      "Payout": "15 Business Days (Except Weekends)",
      "Weekend Holding": "Not Allowed",
      "EA Trading": "Not Allowed",
      "Scalping": "Not Allowed",
      "Martingale Strategy": "Not Allowed",
      "Hedging": "Allowed",
      "News Trading": "Allowed",
    },
    "DRAGON PRIME": {
      "Minimum Trading Days": "4",
      "Minimum Trades": "4",
      "Trading Period": "Unlimited",
      "Profit Target": "10% (1st Phase), 5% (2nd Phase)",
      "Daily Drawdown": "4%",
      "Maximum Drawdown": "10%",
      "Profit Split": "80% to 100% (5% increase after first withdrawal)",
      "Leverage": "1:100",
      "Payout": "15 Business Days (Except Weekends)",
      "Weekend Holding": "Allowed",
      "EA Trading": "Not Allowed",
      "Scalping": "Not Allowed",
      "Martingale Strategy": "Not Allowed",
      "Hedging": "Allowed",
      "News Trading": "Allowed",
    },
    "SWING": {
      "Minimum Trading Days": "Your trades closed within the week (not exceed 4 days)",
      "Minimum Trades": "4 trades total (2 on first stage, 2 on second stage)",
      "Trading Period": "Unlimited",
      "Profit Target": "8% (1st Stage), 5% (2nd Stage)",
      "Daily Drawdown": "5%",
      "Maximum Drawdown": "8%",
      "Profit Split": "80%",
      "Leverage": "1:100",
      "Payout": "15 Business Days (Except Weekends)",
      "Weekend Holding": "Allowed",
      "EA Trading": "Not Allowed",
      "Scalping": "Not Allowed",
      "Martingale Strategy": "Not Allowed",
      "Hedging": "Allowed",
      "News Trading": "Allowed",
    },
    "HFT DRAGON": {
      "Minimum Trading Days": "1",
      "Minimum Trades": "1",
      "Trading Period": "Unlimited",
      "Profit Target": "8%",
      "Daily Drawdown": "4%",
      "Maximum Drawdown": "8%",
      "Profit Split": "80% to 100% (5% increase after first withdrawal)",
      "Leverage": "1:1000",
      "Payout": "15 Business Days (Except Weekends)",
      "Weekend Holding": "Not Allowed",
      "EA Trading": "Allowed in Challenge Phase",
      "Scalping": "Not Allowed",
      "Martingale Strategy": "Not Allowed",
      "Hedging": "Allowed",
      "News Trading": "Allowed",
    },
    "DRAGON INSTANT PRO": {
      "Minimum Trading Days": "1",
      "Minimum Trades": "1",
      "Trading Period": "Unlimited",
      "Daily Drawdown": "4%",
      "Maximum Drawdown": "8%",
      "Profit Split": "80% to 100% (5% increase after first withdrawal)",
      "Leverage": "1:100",
      "Payout": "15 Business Days (Except Weekends on live funded account)",
      "Weekend Holding": "Not Allowed",
      "Hedging": "Allowed",
      "News Trading": "Allowed",
      "EA Trading": "N/A",
      "Scalping": "N/A",
      "Martingale Strategy": "N/A",
    }
  }

  const paymentMethods = [
    { 
      name: "USDT", 
      icon: "https://cryptologos.cc/logos/tether-usdt-logo.svg",
      isCrypto: true
    },
    { 
      name: "Bitcoin", 
      icon: "https://cryptologos.cc/logos/bitcoin-btc-logo.svg",
      isCrypto: true
    },
    { 
      name: "Ethereum", 
      icon: "https://cryptologos.cc/logos/ethereum-eth-logo.svg",
      isCrypto: true
    },
    { 
      name: "Litecoin", 
      icon: "https://cryptologos.cc/logos/litecoin-ltc-logo.svg",
      isCrypto: true
    },
    { 
      name: "Tron", 
      icon: "https://cryptologos.cc/logos/tron-trx-logo.svg",
      isCrypto: true
    },
    { 
      name: "Visa", 
      icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png",
      isCrypto: true
    },
    { 
      name: "Mastercard", 
      icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Mastercard_2019_logo.svg/2560px-Mastercard_2019_logo.svg.png",
      isCrypto: true
    },
    { 
      name: "American Express", 
      icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/American_Express_logo_%282018%29.svg/2560px-American_Express_logo_%282018%29.svg.png",
      isCrypto: true
    },
    { 
      name: "Discover", 
      icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Discover_Card_logo.svg/2560px-Discover_Card_logo.svg.png",
      isCrypto: true
    },
    { 
      name: "Apple Pay", 
      icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Apple_Pay_logo.svg/2560px-Apple_Pay_logo.svg.png",
      isCrypto: true
    },
    { 
      name: "Google Pay", 
      icon: "https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Pay_Logo.svg",
      isCrypto: true
    },
    { 
      name: "Stripe", 
      icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Stripe_Logo%2C_revised_2016.svg/2560px-Stripe_Logo%2C_revised_2016.svg.png",
      isCrypto: true
    },
    { 
      name: "Credit Card", 
      icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Mastercard_2019_logo.svg/2560px-Mastercard_2019_logo.svg.png",
      isCrypto: true
    },
    { 
      name: "Debit Card", 
      icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='120' viewBox='0 0 200 120'%3E%3Crect width='200' height='120' rx='8' fill='%23fff' stroke='%23000' stroke-width='2'/%3E%3Crect x='10' y='20' width='180' height='80' rx='4' fill='%23f0f0f0'/%3E%3Crect x='10' y='20' width='60' height='20' rx='2' fill='%23000'/%3E%3Crect x='10' y='50' width='40' height='8' rx='2' fill='%23999'/%3E%3Crect x='10' y='65' width='30' height='8' rx='2' fill='%23999'/%3E%3Crect x='10' y='80' width='50' height='8' rx='2' fill='%23999'/%3E%3Ctext x='150' y='70' font-family='Arial' font-size='12' font-weight='bold' fill='%23000'%3EDEBIT%3C/text%3E%3C/svg%3E",
      isCrypto: true
    },
  ]

  // Duplicate payment methods for infinite scroll (need enough for seamless loop)
  const infinitePaymentMethods = [...paymentMethods, ...paymentMethods, ...paymentMethods, ...paymentMethods]

  const currentRules = accountRules[selectedAccountType]

  return (
    <section id="pricing-section" className="w-full py-20 px-4 sm:px-6 relative bg-white">
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-green-400/20 bg-green-400/5 text-xs text-gray-700 mb-6">
            <span className="inline-block h-2 w-2 rounded-full bg-green-400" />
            Professional Trading Evaluations
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight mb-4">
            <span className="text-gray-900">
              Affordable And Transparent Pricing
            </span>
          </h2>
          <div className="relative w-24 h-[3px] mx-auto mb-6">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-400 via-green-500 to-green-400 opacity-60" />
          </div>
          <p className="text-gray-600 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Every evaluation program is priced transparently. We match every account with your goals, ensuring value and clarity for each challenge.
          </p>
        </div>

        {/* Account Type Selection - At Top */}
        <div className="mb-10">
          <div className="bg-gray-50/50 border border-gray-200/50 rounded-2xl p-1.5 backdrop-blur-sm">
            <div className="flex items-center justify-center gap-2 flex-wrap">
              {accountTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedAccountType(type)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    selectedAccountType === type
                      ? "bg-green-500 text-white shadow-md border border-green-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
          {/* Pricing Card - First on Mobile, Second on Desktop */}
          <div className="bg-white rounded-xl p-3.5 sm:p-4 border border-gray-200/50 shadow-lg relative order-1 lg:order-2">
            {/* Tag/Badge at Top */}
            <div className="absolute -top-2 left-4">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-green-500 text-white px-2.5 py-0.5 text-[10px] font-bold shadow-lg">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                60% OFF
                </div>
              </div>
              
            <div className="mb-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1 h-5 bg-red-500 rotate-12" />
                <span className="text-[10px] font-bold text-gray-900 uppercase tracking-wider">WHAT I QUOTE</span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed mb-2">
                Every evaluation program is priced transparently. We match every account size with your trading goals, ensuring value and clarity for each challenge.
              </p>
              
              {/* Coupon Code Section */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-md p-2 border border-green-200">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-[10px] font-bold text-green-700">Use Code:</span>
                      <span className="font-mono font-bold text-green-700 text-xs">WING2026</span>
                      <span className="px-1.5 py-0.5 bg-green-600 text-white text-[9px] font-bold rounded">60% OFF</span>
                    </div>
                    <p className="text-[10px] text-gray-600">60% discount on all accounts</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard('WING2026')}
                    className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-[10px] font-semibold rounded transition-colors flex items-center gap-1"
                  >
                    {copiedCode === 'WING2026' ? (
                      <>
                        <CheckCircle2 className="h-3 w-3" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        Copy
                      </>
                    )}
                  </button>
              </div>
              </div>
            </div>

            <Accordion type="single" collapsible className="w-full" defaultValue="50K">
              {displayAmounts.map((amount, index) => {
                const price = getPrice(selectedAccountType, amount)
                const originalPrice = selectedAccountType === "DRAGON INSTANT PRO" && ["100K", "200K", "500K"].includes(amount)
                  ? getOriginalPrice(selectedAccountType, amount)
                  : null
                // Show discounted price with WING2026 (60% off)
                const discountedPrice = Math.round(price * 0.4) // 60% off = 40% of original
                const displayPrice = originalPrice ? Math.round(originalPrice * 0.5) : price
                const fundingNumber = parseInt(amount.replace("K", ""), 10) * 1000
                const dailyDrawdown = getDailyDrawdown(selectedAccountType, amount)
                const maxDrawdown = getMaxDrawdown(selectedAccountType, amount)

                const isPopular = ["50K", "100K", "200K", "500K"].includes(amount)

                return (
                  <AccordionItem key={amount} value={amount} className="border-b border-gray-200 last:border-0">
                    <AccordionTrigger className="hover:no-underline py-2">
                      <div className="flex items-center justify-between w-full pr-2">
                        <div className="text-left flex-1">
                          <div className="flex items-center gap-1.5">
                            <div className="text-sm sm:text-base font-bold text-gray-900">
                              Account Size: ${fundingNumber.toLocaleString()}
                            </div>
                            {isPopular && (
                              <div className="px-1.5 py-0.5 bg-[#DEBF74] text-gray-900 text-[9px] font-bold rounded-full">
                                Popular
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg sm:text-xl font-bold text-gray-900">
                            ${discountedPrice}
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-xs text-gray-400 line-through">${price}</span>
                            <span className="text-[10px] font-semibold text-green-600">60% OFF</span>
                          </div>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-1 pb-2">
              <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-gray-600">Daily Drawdown:</span>
                            <span className="font-semibold text-gray-900 ml-1">${dailyDrawdown.toLocaleString()}</span>
                </div>
                          <div>
                            <span className="text-gray-600">Max Drawdown:</span>
                            <span className="font-semibold text-gray-900 ml-1">${maxDrawdown.toLocaleString()}</span>
                  </div>
                          <div>
                            <span className="text-gray-600">Leverage:</span>
                            <span className="font-semibold text-gray-900 ml-1">
                              {selectedAccountType === "HFT DRAGON" ? "1:1000" : "1:100"}
                    </span>
                  </div>
                          <div>
                            <span className="text-gray-600">Profit Split:</span>
                            <span className="font-semibold text-gray-900 ml-1">80% - 100%</span>
                </div>
              </div>
                        <Link
                          href="/login"
                          className="block w-full bg-green-500 hover:bg-green-600 text-white text-center px-3 py-2 rounded-md font-bold text-sm transition-all duration-200 shadow-md hover:shadow-lg"
                        >
                          Start Evaluation →
                        </Link>
            </div>
                    </AccordionContent>
                  </AccordionItem>
                )
              })}
            </Accordion>
          </div>

          {/* Rules Section - Second on Mobile, First on Desktop */}
          <div className="bg-[#0a1f0a] rounded-xl p-3.5 sm:p-4 text-white shadow-2xl border border-green-500/10 order-2 lg:order-1">
            <div className="mb-3">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/20 border border-white/30 mb-2">
                <span className="text-[10px] font-bold text-white uppercase tracking-wider">Trading Rules</span>
              </div>
              <h3 className="text-xl font-bold mb-1">{selectedAccountType}</h3>
              <div className="w-10 h-[2px] bg-white/30 rounded-full mb-2" />
            </div>

            <div className="space-y-2">
              {Object.entries(currentRules).map(([key, value]) => (
                <div key={key} className="pb-2 border-b border-white/20 last:border-0 last:pb-0">
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-white/90 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-white mb-0.5">{key}</p>
                      <p className="text-xs text-white/80 leading-relaxed">{value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Payment Methods - Infinite Scroll */}
        <div className="mt-12">
          <div className="mb-6 text-center">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Accepted Payment Methods</h3>
            <p className="text-sm text-gray-600">Secure payments powered by industry-leading providers</p>
          </div>

          <div className="relative overflow-hidden mask-gradient">
            <div className="flex animate-scroll gap-6">
              {infinitePaymentMethods.map((method, index) => {
                const isCrypto = method.isCrypto || false;
                return (
                <div
                  key={`${method.name}-${index}`}
                    className="flex-shrink-0 w-32 h-20 bg-white border border-gray-200 rounded-xl p-3 flex items-center justify-center hover:border-green-400 hover:shadow-lg transition-all group"
                  >
                    {isCrypto ? (
                      <div className="w-full h-full rounded-lg bg-white flex items-center justify-center p-2">
                        <img
                          src={method.icon}
                          alt={method.name}
                          className={`object-contain max-h-12 max-w-full w-auto group-hover:scale-110 transition-transform ${method.isBlackText ? '' : ''}`}
                          style={method.isBlackText ? { filter: 'none' } : {}}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              parent.innerHTML = `<span class="text-gray-700 text-xs font-bold">${method.name}</span>`;
                            }
                          }}
                        />
                      </div>
                    ) : (
                      <div 
                        className="w-full h-full rounded-lg flex items-center justify-center p-2"
                        style={{ backgroundColor: method.bgColor }}
                      >
                        <img
                          src={method.icon}
                    alt={method.name}
                          className="object-contain max-h-10 max-w-full w-auto brightness-0 invert group-hover:scale-110 transition-transform"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              parent.innerHTML = `<span class="text-white text-xs font-bold">${method.name}</span>`;
                            }
                          }}
                  />
              </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(calc(-100% / 4 * 1));
          }
        }
        .animate-scroll {
          animation: scroll 50s linear infinite;
          display: flex;
        }
        @media (max-width: 768px) {
          .animate-scroll {
            animation: scroll 15s linear infinite;
          }
        }
        .mask-gradient {
          mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
          -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
      `}</style>
    </section>
  )
}