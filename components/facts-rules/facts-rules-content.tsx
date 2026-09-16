"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  TrendingDown,
  Percent,
  Calendar,
  Shield,
  Activity,
  Scale,
  ExternalLink,
} from "lucide-react"
import { GLOBAL_RULES } from "@/lib/rules-config"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const rules = [
  {
    title: "Loss limits",
    description: "Both limits are static from your initial balance and include floating losses.",
    icon: Activity,
    iconBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    items: [
      `Maximum daily loss: ${GLOBAL_RULES.dailyDrawdownPct}% of the initial balance — every account type and stage. Breaching it fails the account for that day, even if it recovers later.`,
      "Maximum overall loss: 10% of the initial balance on Step 1 and Step 2 (challenge and funded), 6% on Instant. Breaching it permanently terminates the account.",
      "Neither limit trails upward with profits — both are always measured from the initial balance, on balance and equity.",
      `Daily loss and Profitable Day counters reset at ${GLOBAL_RULES.dailyResetUtc}. The dashboard countdown is the only reference — not broker or local time.`,
    ],
  },
  {
    title: "Targets and qualifying days",
    description: "What you have to reach before you pass or get paid.",
    icon: Calendar,
    iconBg: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
    items: [
      "Profit target — Step 1: 10% in Phase 1. Step 2: 10% in Phase 1, 5% in Phase 2. Instant: none. Targets are verified on closed balance with no open or pending positions.",
      `A Profitable Day is a calendar day (00:00–23:59 UTC) where profit reaches at least ${GLOBAL_RULES.profitableDayPct}% of your initial balance, on an equity basis.`,
      "Step 1 / Step 2 challenge: 3 Profitable Days. Instant and every funded stage: 5 days total — 3 Profitable Days plus 2 plain Trading Days, in any order.",
      "There is no profit consistency rule. A single strong day can carry your whole target.",
    ],
  },
  {
    title: "Trading rules",
    description: "How trades must be placed and held.",
    icon: Shield,
    iconBg: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    items: [
      `Minimum holding time: ${GLOBAL_RULES.minHoldingTimeMinutes} minutes on every trade, in every phase. Closing earlier is a breach.`,
      `Leverage is capped at ${GLOBAL_RULES.leverage} across every asset class, for all account types and sizes.`,
      `Trade layering — funded stage: one trade per ${GLOBAL_RULES.layeringWindowMinutes}-minute window from the previous trade's opening time. Instant adds a hard cap of ${GLOBAL_RULES.instantMaxConcurrentLayers} concurrent layers.`,
      "Stop-loss orders are optional — there is no penalty for trading without one, but the loss limits still apply.",
      "Overnight holding is allowed by default on every plan; swap/rollover charges apply as normal.",
      `Weekend holding (${GLOBAL_RULES.weekendWindow}) is prohibited by default on all types and stages, including crypto — it requires the paid Weekend Holding add-on at checkout.`,
      `News trading is unrestricted during Step 1 / Step 2. On funded and Instant accounts you may not open or close the affected instrument within ${GLOBAL_RULES.newsWindowMinutes} minutes either side of a high-impact release; an SL/TP firing inside that window is a soft breach — the account survives but that profit is not withdrawable.`,
      `Inactivity: at least one trade every ${GLOBAL_RULES.inactivityDays} consecutive days, or the account is closed.`,
    ],
  },
  {
    title: "Withdrawals",
    description: "Eligibility, caps, and the profit split.",
    icon: Percent,
    iconBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    items: [
      `You can request a withdrawal once ${GLOBAL_RULES.withdrawalEligibilityDays} days have passed since the account was funded, the required days are met, the account is in profit, and there are no rule violations.`,
      "There is no minimum profit threshold on any account type, including Instant.",
      `Each payout period is capped at ${GLOBAL_RULES.withdrawalCapPct}% of your initial balance. Profit above the cap stays on the account for a future payout.`,
      "Profit split: 80/20 on the first withdrawal, 85/15 on the second, then 90/10 from the third onward — provided every earlier withdrawal was clean.",
      `Payouts run bi-weekly (every ${GLOBAL_RULES.payoutCycleDays} calendar days). Most are processed within about 48 working hours; some take 5–7 working days.`,
      "After you submit a request, close all open trades and do not open new ones until it is processed. Only realised profit counts.",
      "Your account fee is returned with your first successful withdrawal — not on Instant accounts, and voided if the withdrawal is rejected for a violation.",
    ],
  },
  {
    title: "Prohibited practices",
    description: "Strategies that exploit platform mechanics rather than the market.",
    icon: Scale,
    iconBg: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    items: [
      "Reverse arbitrage, latency trading, and price arbitrage across delayed feeds.",
      "Hedging between two or more accounts — hedging inside a single account is fine.",
      `Tick scalping — closing ${GLOBAL_RULES.tickScalpTradesPerHour} or more trades held under 10 seconds within a 1-hour window is an immediate hard breach.`,
      "Abusive autotrading, hyperactive order flooding, martingale and grid strategies.",
      "Account sharing, pass services, and unauthorized copy trading.",
      "Exploiting technical errors, frozen quotes, or faulty spreads; gambling-style trading; account rolling.",
      "Confirmed breaches may lead to immediate termination and forfeiture of rewards, without prior notice.",
    ],
  },
]

const quickRef = [
  { label: "Max daily loss", value: `${GLOBAL_RULES.dailyDrawdownPct}%`, icon: TrendingDown },
  { label: "Max overall loss", value: "10% / 6%", icon: Percent },
  { label: "Min days", value: "3 or 5", icon: Calendar },
  { label: "Leverage", value: GLOBAL_RULES.leverage, icon: Scale },
]

export function FactsRulesContent() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Quick reference strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {quickRef.map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-border bg-card px-4 py-3 flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <item.icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {item.label}
              </p>
              <p className="text-lg font-bold text-foreground tabular-nums">
                {item.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Rule sections */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        {rules.map((group, i) => (
          <Card
            key={i}
            className="overflow-hidden border-border shadow-sm hover:shadow-md transition-shadow"
          >
            <CardHeader className="border-b border-border bg-muted/20 px-6 py-4">
              <div className="flex items-start gap-4">
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${group.iconBg}`}
                >
                  <group.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-semibold text-foreground">
                    {group.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {group.description}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ul className="divide-y divide-border">
                {group.items.map((item, j) => (
                  <li
                    key={j}
                    className="flex gap-4 px-6 py-4 hover:bg-muted/20 transition-colors"
                  >
                    <span className="flex h-7 min-w-[28px] shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {j + 1}
                    </span>
                    <span className="text-sm text-foreground/90 leading-relaxed pt-0.5">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Full rules CTA */}
      <div className="rounded-xl border border-border bg-gradient-to-br from-muted/50 to-muted/20 px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="font-semibold text-foreground">
            Need full rules & pricing by account size?
          </h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            View the complete rules, phase-by-phase limits, and pricing for all account sizes.
          </p>
        </div>
        <Button variant="outline" size="sm" className="shrink-0 h-9 rounded-lg gap-2" asChild>
          <Link href="/rules">
            <ExternalLink className="h-4 w-4" />
            View full rules
          </Link>
        </Button>
      </div>
    </div>
  )
}
