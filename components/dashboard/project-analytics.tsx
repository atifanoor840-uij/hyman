"use client"

import { Card } from "@/components/ui/card"
import { Banknote, BarChart2, TrendingDown, CalendarDays } from "lucide-react"
import type { PerformanceResponse } from "@/lib/api/performance"

export interface ProjectAnalyticsProps {
  stats?: PerformanceResponse | null
}

export function ProjectAnalytics(props: ProjectAnalyticsProps) {
  const { stats = null } = props
  const accountInfo = stats?.account_info
  const accountStats = stats?.statistics?.account_stats
  const tradingDays = stats?.statistics?.equity_curve?.daily_performance?.length ?? 0
  const floatingLoss =
    accountInfo != null ? Math.max(0, (accountInfo.balance ?? 0) - (accountInfo.equity ?? 0)) : null

  return (
    <Card
      className="overflow-hidden rounded-2xl border border-border bg-card shadow-[0_1px_2px_rgba(16,24,40,0.04)] min-w-0"
      style={{ animationDelay: "400ms" }}
    >
      <div className="border-b border-border bg-card px-5 sm:px-6 py-4">
        <h3 className="text-base font-semibold tracking-tight text-foreground">Performance</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Key metrics at a glance</p>
      </div>
      <div className="p-0">
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-border/80 [&>div]:border-border/80">
          <div className="flex flex-col p-5 sm:p-6 min-w-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <Banknote className="h-4 w-4" strokeWidth={2} />
            </div>
            <p className="mt-4 text-xl font-semibold tabular-nums tracking-tight text-foreground truncate">
              {accountInfo ? `$${accountInfo.balance.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : "—"}
            </p>
            <p className="mt-1.5 text-[11px] font-medium uppercase tracking-widest text-muted-foreground">Balance</p>
          </div>
          <div className="flex flex-col p-5 sm:p-6 min-w-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <BarChart2 className="h-4 w-4" strokeWidth={2} />
            </div>
            <p className={`mt-4 text-xl font-semibold tabular-nums tracking-tight truncate ${(accountStats?.profit ?? 0) >= 0 ? "text-foreground" : "text-destructive"}`}>
              {accountStats != null ? `$${accountStats.profit.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : "—"}
            </p>
            <p className="mt-1.5 text-[11px] font-medium uppercase tracking-widest text-muted-foreground">Profit/Loss</p>
          </div>
          <div className="flex flex-col p-5 sm:p-6 min-w-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <TrendingDown className="h-4 w-4" strokeWidth={2} />
            </div>
            <p className={`mt-4 text-xl font-semibold tabular-nums tracking-tight truncate ${floatingLoss != null && floatingLoss > 0 ? "text-destructive" : "text-foreground"}`}>
              {floatingLoss != null
                ? `$${floatingLoss.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
                : "—"}
            </p>
            <p className="mt-1.5 text-[11px] font-medium uppercase tracking-widest text-muted-foreground">Floating Loss</p>
          </div>
          <div className="flex flex-col p-5 sm:p-6 min-w-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <CalendarDays className="h-4 w-4" strokeWidth={2} />
            </div>
            <p className="mt-4 text-xl font-semibold tabular-nums tracking-tight text-foreground">
              {tradingDays}
            </p>
            <p className="mt-1.5 text-[11px] font-medium uppercase tracking-widest text-muted-foreground">Trading Days</p>
          </div>
        </div>
      </div>
    </Card>
  )
}
