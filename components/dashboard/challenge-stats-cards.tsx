"use client"

import { Card } from "@/components/ui/card"
import {
  Banknote,
  TrendingUp,
  Trophy,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  type LucideIcon,
} from "lucide-react"
import type { PerformanceResponse } from "@/lib/api/performance"

type StatCard = {
  label: string
  value: string
  icon: LucideIcon
  highlighted?: boolean
  teal?: boolean
}

function formatUsd(n: number) {
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}
function formatPct(n: number) {
  return `${n.toFixed(2)}%`
}

export interface ChallengeStatsCardsProps {
  stats?: PerformanceResponse | null
}

export function ChallengeStatsCards(props: ChallengeStatsCardsProps) {
  const { stats = null } = props
  const accountInfo = stats?.account_info
  const accountStats = stats?.statistics?.account_stats
  const adv = stats?.statistics?.advanced_statistics
  const balance = accountInfo?.balance ?? accountStats?.balance ?? 0
  const equity = accountInfo?.equity ?? accountStats?.equity ?? balance
  const winRate = adv?.win_rate ?? 0
  const twrPercent = accountStats?.twr_percent ?? 0
  const peakBalance = accountStats?.peak_balance ?? balance
  const deposits = accountStats?.total_deposits ?? balance
  const profitTarget = deposits * 0.08

  const topRow: StatCard[] = [
    { label: "Balance", value: formatUsd(balance), icon: Banknote, highlighted: true },
    { label: "Equity", value: formatUsd(equity), icon: TrendingUp },
    { label: "Win Rate", value: `${winRate}%`, icon: Trophy },
  ]
  const bottomRow: StatCard[] = [
    { label: "TWR %", value: formatPct(twrPercent), icon: ArrowUpRight, teal: true },
    { label: "Peak Balance", value: formatUsd(peakBalance), icon: ArrowDownRight, teal: true },
    { label: "Profit Target", value: formatUsd(profitTarget), icon: Target, teal: true },
  ]

  return (
    <div
      className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 md:gap-3.5 animate-slide-in-up min-w-0"
      style={{ animationDelay: "450ms" }}
    >
      {topRow.map((stat) => (
        <Card
          key={stat.label}
          className={`group relative min-h-[108px] sm:min-h-[112px] p-3.5 md:p-4 flex flex-col justify-between overflow-hidden rounded-2xl border transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_45px_rgba(15,23,42,0.12)] min-w-0 bg-gradient-to-br from-background via-muted/70 to-background ${
            stat.highlighted ? "border-primary/50" : "border-border/70"
          }`}
        >
          <div className="absolute inset-x-4 -top-8 h-20 rounded-full bg-gradient-to-b from-white/40 to-transparent opacity-70 pointer-events-none" />

          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-full border text-sm shrink-0 ${
                stat.highlighted
                  ? "border-primary/30 bg-primary/10 text-primary"
                  : "border-muted bg-muted text-muted-foreground"
              }`}
            >
              <stat.icon className="w-4 h-4" />
            </div>
            <span className="text-[11px] sm:text-xs text-muted-foreground font-medium truncate tracking-wide">
              {stat.label}
            </span>
          </div>

          <p className="mt-3 text-base sm:text-lg font-semibold text-foreground truncate tabular-nums">
            {stat.value}
          </p>
        </Card>
      ))}

      {bottomRow.map((stat) => (
        <Card
          key={stat.label}
          className="group relative min-h-[104px] sm:min-h-[108px] p-3.5 md:p-4 flex flex-col justify-between overflow-hidden rounded-2xl border border-border/70 bg-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_45px_rgba(15,23,42,0.10)] min-w-0"
        >
          <div className="absolute inset-x-4 -top-8 h-16 rounded-full bg-gradient-to-b from-muted/60 to-transparent opacity-80 pointer-events-none" />

          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground shrink-0">
              <stat.icon className="w-3.5 h-3.5" />
            </div>
            <span className="text-[11px] sm:text-xs text-muted-foreground font-medium truncate tracking-wide">
              {stat.label}
            </span>
          </div>

          <p className="mt-3 text-sm sm:text-base font-semibold text-primary truncate tabular-nums">
            {stat.value}
          </p>
        </Card>
      ))}
    </div>
  )
}
