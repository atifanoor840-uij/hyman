"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tag, Copy, Check, Plus } from "lucide-react"
import { useState, useEffect } from "react"

const activeCoupons = [
  { code: "WELCOME20", discount: "20%", type: "First deposit", expires: "2025-02-15", status: "active" as const },
  { code: "VIP50", discount: "50%", type: "Challenge fee", expires: "2025-02-28", status: "active" as const },
  { code: "SPRING25", discount: "25%", type: "Any purchase", expires: "2025-03-10", status: "active" as const },
  { code: "PRO30", discount: "30%", type: "Pro account", expires: "2025-02-20", status: "active" as const },
  { code: "FLASH15", discount: "15%", type: "Flash sale", expires: "2025-02-05", status: "expiring" as const },
  { code: "REFER10", discount: "10%", type: "Referral", expires: "2025-03-31", status: "active" as const },
]

export function CouponContent() {
  const [seconds, setSeconds] = useState(6 * 24 * 3600 + 14 * 3600 + 32 * 60 + 18) // 6d 14h 32m 18s
  const [copied, setCopied] = useState<string | null>(null)
  const [redeemCode, setRedeemCode] = useState("")

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((s) => (s > 0 ? s - 1 : 0))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  const pad = (n: number) => String(n).padStart(2, "0")

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopied(code)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Countdown timer - ticket-style card (stacked, white, perforated look) */}
      <div className="relative py-4 px-2 sm:px-4 rounded-2xl bg-[#f5f0eb] dark:bg-slate-800/50">
        <div
          className="relative max-w-3xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden text-center"
          style={{
            boxShadow: "0 2px 0 0 rgb(0 0 0 / 0.06), 0 6px 0 0 rgb(0 0 0 / 0.04), 0 1px 3px 0 rgb(0 0 0 / 0.08)",
          }}
        >
          {/* Perforated left edge (ticket scallop) */}
          <div
            className="absolute left-0 top-0 bottom-0 w-2 pointer-events-none border-r border-dashed border-slate-300 dark:border-slate-600"
            style={{
              backgroundImage: "radial-gradient(circle, rgb(148 163 184 / 0.4) 1.5px, transparent 1.5px)",
              backgroundSize: "4px 8px",
            }}
            aria-hidden
          />
          {/* Perforated right edge (ticket scallop) */}
          <div
            className="absolute right-0 top-0 bottom-0 w-2 pointer-events-none border-l border-dashed border-slate-300 dark:border-slate-600"
            style={{
              backgroundImage: "radial-gradient(circle, rgb(148 163 184 / 0.4) 1.5px, transparent 1.5px)",
              backgroundSize: "4px 8px",
            }}
            aria-hidden
          />

          {/* Orange badge - top right */}
          <div className="absolute top-4 right-4 z-10">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-white text-xs font-bold shadow">
              !
            </span>
          </div>

          <div className="relative p-6 sm:p-8 md:p-10">
            <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] mb-6">
              Next offer cycle ends in
            </p>

            {/* Timer with dot separators */}
            <div className="flex flex-wrap justify-center items-end gap-2 sm:gap-4 md:gap-6 mb-6">
              <div className="flex flex-col items-center min-w-[64px] sm:min-w-[72px]">
                <span className="text-3xl sm:text-4xl md:text-5xl font-bold tabular-nums text-slate-800 dark:text-white">
                  {pad(days)}
                </span>
                <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">Days</span>
              </div>
              <div className="flex flex-col items-center justify-center pb-2 sm:pb-3">
                <span className="text-slate-400 dark:text-slate-500 text-2xl leading-tight">·</span>
                <span className="text-slate-400 dark:text-slate-500 text-2xl leading-tight">·</span>
              </div>
              <div className="flex flex-col items-center min-w-[64px] sm:min-w-[72px]">
                <span className="text-3xl sm:text-4xl md:text-5xl font-bold tabular-nums text-slate-800 dark:text-white">
                  {pad(hours)}
                </span>
                <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">Hours</span>
              </div>
              <div className="flex flex-col items-center justify-center pb-2 sm:pb-3">
                <span className="text-slate-400 dark:text-slate-500 text-2xl leading-tight">·</span>
                <span className="text-slate-400 dark:text-slate-500 text-2xl leading-tight">·</span>
              </div>
              <div className="flex flex-col items-center min-w-[64px] sm:min-w-[72px]">
                <span className="text-3xl sm:text-4xl md:text-5xl font-bold tabular-nums text-slate-800 dark:text-white">
                  {pad(mins)}
                </span>
                <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">Minutes</span>
              </div>
              <div className="flex flex-col items-center justify-center pb-2 sm:pb-3">
                <span className="text-slate-400 dark:text-slate-500 text-2xl leading-tight">·</span>
                <span className="text-slate-400 dark:text-slate-500 text-2xl leading-tight">·</span>
              </div>
              <div className="flex flex-col items-center min-w-[64px] sm:min-w-[72px]">
                <span className="text-3xl sm:text-4xl md:text-5xl font-bold tabular-nums text-orange-500">
                  {pad(secs)}
                </span>
                <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">Seconds</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Use a coupon before the timer ends to lock in your discount.
            </p>
          </div>
        </div>
      </div>

      {/* Redeem coupon */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5 text-primary" />
          Redeem coupon code
        </h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            placeholder="Enter coupon code"
            value={redeemCode}
            onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
            className="flex-1 font-mono uppercase max-w-md"
          />
          <Button className="sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90">
            Apply code
          </Button>
        </div>
      </Card>

      {/* Active coupon codes - ticket-style cards */}
      <div className="rounded-2xl bg-[#e8f4f8] dark:bg-slate-900/40 p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Tag className="w-5 h-5 text-primary" />
            Active coupon codes
          </h3>
          <Badge variant="secondary" className="text-xs">
            {activeCoupons.length} available
          </Badge>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {activeCoupons.map((c, i) => {
            const isDark = i % 3 === 0
            const isExpiring = c.status === "expiring"
            return (
              <div
                key={c.code}
                className="group relative flex rounded-l-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 min-h-[180px]"
              >
                {/* Main card body - ticket shape with perforated right */}
                <div
                  className={`flex-1 flex flex-col justify-between rounded-l-2xl border-y border-l pl-5 pr-4 py-4 ${
                    isDark
                      ? "bg-slate-800 border-slate-700 text-white"
                      : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  }`}
                  style={{
                    borderRight: "none",
                    marginRight: "-1px",
                  }}
                >
                  {/* Top badge - overlaps top right */}
                  <div className="absolute top-2 right-12 z-10">
                    {isExpiring ? (
                      <span className="inline-flex items-center rounded-full bg-amber-400 px-2.5 py-1 text-[10px] font-semibold text-amber-950 shadow-md">
                        Expiring soon
                      </span>
                    ) : (
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold shadow-md ${
                          isDark ? "bg-orange-500 text-white" : "bg-amber-200 text-amber-950 dark:bg-amber-500/90 dark:text-white"
                        }`}
                      >
                        {c.type}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 flex flex-col justify-center pt-1">
                    <p className="text-[10px] uppercase tracking-widest opacity-80 mb-0.5">
                      {c.code}
                    </p>
                    <p className={`font-bold tabular-nums ${isDark ? "text-4xl text-white" : "text-4xl text-slate-900 dark:text-white"}`}>
                      {c.discount} off
                    </p>
                    <p className={`text-sm mt-1 ${isDark ? "text-slate-200" : "text-slate-600 dark:text-slate-300"}`}>
                      {c.type}
                    </p>
                    <p className={`text-xs mt-1 ${isDark ? "text-slate-400" : "text-slate-500 dark:text-slate-400"}`}>
                      Valid until {c.expires}
                    </p>
                  </div>

                  {/* Tear-off strip */}
                  <div
                    className={`mt-3 pt-2 border-t border-dashed ${
                      isDark ? "border-slate-600" : "border-slate-300 dark:border-slate-600"
                    }`}
                  >
                    <p className={`text-[10px] uppercase tracking-widest ${
                      isDark ? "text-slate-500" : "text-slate-500 dark:text-slate-400"
                    }`}>
                      Dragon Funded Coupon
                    </p>
                  </div>
                </div>

                {/* Right edge - vertical COUPON strip (ticket stub) */}
                <div
                  className={`w-10 flex-shrink-0 flex items-center justify-center border-l border-dashed ${
                    isDark ? "bg-slate-800 border-slate-600" : "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
                  }`}
                >
                  <span
                    className={`text-[9px] font-bold uppercase tracking-[0.2em] whitespace-nowrap ${
                      isDark ? "text-slate-400" : "text-slate-500 dark:text-slate-400"
                    }`}
                    style={{ writingMode: "vertical-rl", textOrientation: "mixed", transform: "rotate(180deg)" }}
                  >
                    Coupon
                  </span>
                </div>

                {/* Copy button overlay */}
                <button
                  type="button"
                  onClick={() => copyCode(c.code)}
                  className={`absolute bottom-4 right-14 p-2 rounded-lg transition-all opacity-70 group-hover:opacity-100 ${
                    isDark ? "hover:bg-white/10 text-white" : "hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300"
                  }`}
                  title="Copy code"
                >
                  {copied === c.code ? (
                    <Check className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
