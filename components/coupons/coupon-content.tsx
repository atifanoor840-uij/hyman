"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tag, Copy, Check, Clock, Percent, Plus } from "lucide-react"
import { useState, useEffect } from "react"

const activeCoupons = [
  { code: "WELCOME20", discount: "20%", type: "First deposit", expires: "2025-02-15", status: "active" },
  { code: "VIP50", discount: "50%", type: "Challenge fee", expires: "2025-02-28", status: "active" },
  { code: "SPRING25", discount: "25%", type: "Any purchase", expires: "2025-03-10", status: "active" },
  { code: "PRO30", discount: "30%", type: "Pro account", expires: "2025-02-20", status: "active" },
  { code: "FLASH15", discount: "15%", type: "Flash sale", expires: "2025-02-05", status: "expiring" },
  { code: "REFER10", discount: "10%", type: "Referral", expires: "2025-03-31", status: "active" },
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
      {/* Big countdown timer */}
      <Card className="overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-card to-primary/10">
        <div className="p-6 sm:p-8 md:p-10 text-center">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">
            Next offer cycle ends in
          </p>
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4 md:gap-6 mb-4">
            <div className="flex flex-col items-center min-w-[72px] sm:min-w-[80px]">
              <span className="text-4xl sm:text-5xl md:text-6xl font-mono font-bold tabular-nums text-foreground">
                {pad(days)}
              </span>
              <span className="text-xs sm:text-sm text-muted-foreground mt-1">Days</span>
            </div>
            <span className="text-3xl sm:text-4xl md:text-5xl font-mono font-bold text-muted-foreground self-end pb-2">:</span>
            <div className="flex flex-col items-center min-w-[72px] sm:min-w-[80px]">
              <span className="text-4xl sm:text-5xl md:text-6xl font-mono font-bold tabular-nums text-foreground">
                {pad(hours)}
              </span>
              <span className="text-xs sm:text-sm text-muted-foreground mt-1">Hours</span>
            </div>
            <span className="text-3xl sm:text-4xl md:text-5xl font-mono font-bold text-muted-foreground self-end pb-2">:</span>
            <div className="flex flex-col items-center min-w-[72px] sm:min-w-[80px]">
              <span className="text-4xl sm:text-5xl md:text-6xl font-mono font-bold tabular-nums text-foreground">
                {pad(mins)}
              </span>
              <span className="text-xs sm:text-sm text-muted-foreground mt-1">Minutes</span>
            </div>
            <span className="text-3xl sm:text-4xl md:text-5xl font-mono font-bold text-muted-foreground self-end pb-2">:</span>
            <div className="flex flex-col items-center min-w-[72px] sm:min-w-[80px]">
              <span className="text-4xl sm:text-5xl md:text-6xl font-mono font-bold tabular-nums text-primary">
                {pad(secs)}
              </span>
              <span className="text-xs sm:text-sm text-muted-foreground mt-1">Seconds</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Use a coupon before the timer ends to lock in your discount.</p>
        </div>
      </Card>

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

      {/* Active coupon codes */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Tag className="w-5 h-5 text-primary" />
            Active coupon codes
          </h3>
          <Badge variant="secondary" className="text-xs">
            {activeCoupons.length} available
          </Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {activeCoupons.map((c) => (
            <Card
              key={c.code}
              className={`p-5 transition-all duration-300 hover:shadow-lg group ${
                c.status === "expiring" ? "border-amber-500/40 bg-amber-500/5" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono font-bold text-lg text-foreground">{c.code}</span>
                    {c.status === "expiring" && (
                      <Badge variant="outline" className="text-amber-600 border-amber-500/50 text-[10px]">
                        Expiring soon
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-primary font-semibold mb-1">
                    <Percent className="w-3.5 h-3.5" />
                    {c.discount} off
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{c.type}</p>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    Expires {c.expires}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 h-9 w-9 rounded-lg hover:bg-primary/10"
                  onClick={() => copyCode(c.code)}
                >
                  {copied === c.code ? (
                    <Check className="w-4 h-4 text-primary" />
                  ) : (
                    <Copy className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                  )}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
