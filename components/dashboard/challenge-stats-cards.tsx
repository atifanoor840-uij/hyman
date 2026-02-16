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
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 md:gap-3 animate-slide-in-up min-w-0" style={{ animationDelay: "450ms" }}>
      {topRow.map((stat) => (
        <Card
          key={stat.label}
          className={`min-h-[88px] sm:min-h-[96px] p-3 md:p-4 flex flex-col gap-2 justify-center transition-shadow duration-200 hover:shadow-md min-w-0 ${
            stat.highlighted
              ? "bg-card border-primary/40 ring-1 ring-primary/20 border-border"
              : "bg-card border-border"
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
              <stat.icon className="w-4 h-4 text-muted-foreground" />
            </div>
            <span className="text-xs text-muted-foreground font-medium truncate">
              {stat.label}
            </span>
          </div>
          <p className="text-sm sm:text-base font-bold text-foreground truncate tabular-nums">
            {stat.value}
          </p>
        </Card>
      ))}
      {bottomRow.map((stat) => (
        <Card
          key={stat.label}
          className="min-h-[80px] sm:min-h-[88px] p-3 md:p-4 flex flex-col gap-1.5 justify-center transition-shadow duration-200 hover:shadow-md bg-card border-border min-w-0"
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center shrink-0">
              <stat.icon className="w-3.5 h-3.5 text-muted-foreground" />
            </div>
            <span className="text-[10px] sm:text-xs text-muted-foreground font-medium truncate">
              {stat.label}
            </span>
          </div>
          <p className="text-sm font-bold text-primary truncate tabular-nums">
            {stat.value}
          </p>
        </Card>
      ))}
    </div>
  )
}
