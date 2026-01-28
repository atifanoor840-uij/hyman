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


type StatCard = {
  label: string
  value: string
  icon: LucideIcon
  highlighted?: boolean
  teal?: boolean
}

const topRow: StatCard[] = [
  { label: "Balance", value: "$105,694.90", icon: Banknote, highlighted: true },
  { label: "Equity Curve", value: "$93,210.32", icon: TrendingUp },
  { label: "Win Rate", value: "40%", icon: Trophy },
]

const bottomRow: StatCard[] = [
  { label: "Highest Profit", value: "80.49%", icon: ArrowUpRight, teal: true },
  { label: "Lowest Equity", value: "$105,694.90", icon: ArrowDownRight, teal: true },
  { label: "Profit Target", value: "$3,897.98", icon: Target, teal: true },
]

export function ChallengeStatsCards() {
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
