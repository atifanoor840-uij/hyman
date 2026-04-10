"use client"

import { useMemo, useState } from "react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Card } from "@/components/ui/card"
import { Activity, BadgePercent, ChartNoAxesCombined, Gauge, Gem, Scale, Trophy } from "lucide-react"
import type { PerformanceResponse, RecentTrade } from "@/lib/api/performance"

const metricOptions = ["Draw Down", "Profit", "Equity"] as const

type Metric = (typeof metricOptions)[number]

type ChartPoint = {
  time: string
  value: number
  equity: number
  profit: number
  drawDown: number
  date: string
}

function buildChartData(stats: PerformanceResponse | null, metric: Metric): ChartPoint[] {
  const daily = stats?.statistics?.equity_curve?.daily_performance
  if (!daily?.length) return []
  return daily.map((d) => {
    const equity = d.cumulative_equity ?? d.cumulative_balance ?? 0
    const profit = d.cumulative_profit ?? 0
    const drawDown = d.drawdown ?? 0
    return {
      time: d.date,
      value: metric === "Equity" ? equity : metric === "Profit" ? profit : drawDown,
      equity,
      profit,
      drawDown,
      date: d.date,
    }
  })
}

function getRecentTrades(adv?: PerformanceResponse["statistics"]["advanced_statistics"]): RecentTrade[] {
  const direct = adv?.recent_trades_duration
  if (Array.isArray(direct)) return direct
  const fromCharts = adv?.charts?.recent_trades_duration
  if (Array.isArray(fromCharts)) return fromCharts
  return []
}

function pickNumber(obj: Record<string, unknown> | undefined, ...keys: string[]): number | null {
  if (!obj) return null
  for (const key of keys) {
    const val = obj[key]
    if (typeof val === "number" && Number.isFinite(val)) return val
  }
  return null
}

function formatMoney(value: number | null) {
  if (value == null) return "—"
  const sign = value < 0 ? "-" : ""
  return `${sign}$${Math.abs(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function PerformanceGraphPanel({ stats }: { stats?: PerformanceResponse | null }) {
  const [selectedMetric, setSelectedMetric] = useState<Metric>("Equity")
  const chartData = useMemo(() => buildChartData(stats ?? null, selectedMetric), [stats, selectedMetric])
  const accountInfo = stats?.account_info

  const chartLatest = chartData.length ? chartData[chartData.length - 1] : null
  const yValues = chartData.map((d) => d.value)
  const maxValue = yValues.length ? Math.max(...yValues) : 0
  const minValue = yValues.length ? Math.min(...yValues) : 0
  const allZero = maxValue === 0 && minValue === 0

  const strokeColor = selectedMetric === "Draw Down" ? "#ef4444" : "#d4d4d8"
  const gradientId = `perfChartGradient-${selectedMetric.replace(/\s/g, "")}`

  return (
    <Card className="overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-br from-card via-card to-muted/10 shadow-[0_10px_36px_rgba(2,6,23,0.16)]">
      <div className="border-b border-border/70 bg-gradient-to-r from-muted/30 to-transparent px-4 md:px-5 py-3.5">
        <p className="text-sm font-semibold text-foreground tracking-tight">Performance Chart</p>
        <p className="text-xs text-muted-foreground mt-0.5">Equity, profit and drawdown trend by date</p>
      </div>
      <div className="p-4 md:p-5">
      <div className="flex items-center gap-2 mb-4">
        {metricOptions.map((metric) => (
          <button
            key={metric}
            type="button"
            onClick={() => setSelectedMetric(metric)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
              selectedMetric === metric
                ? "bg-foreground text-background shadow-sm"
                : "border border-border/80 bg-background/30 text-muted-foreground hover:text-foreground"
            }`}
          >
            {metric}
          </button>
        ))}
      </div>
      <div className="mb-3">
        <p className="text-sm text-muted-foreground">{selectedMetric}</p>
        <p className="text-4xl font-bold text-foreground tabular-nums">
          {selectedMetric === "Draw Down"
            ? `${(chartLatest?.value ?? 0).toFixed(2)}%`
            : `$${(selectedMetric === "Profit" ? chartLatest?.profit ?? 0 : accountInfo?.equity ?? 0).toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })} USD`}
        </p>
      </div>
      <div className="h-72 text-muted-foreground rounded-xl border border-border/50 bg-background/25 p-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={strokeColor} stopOpacity={0.35} />
                <stop offset="100%" stopColor={strokeColor} stopOpacity={0.03} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.2} />
            <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: "currentColor", fontSize: 11 }} />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "currentColor", fontSize: 11 }}
              domain={
                selectedMetric === "Draw Down"
                  ? allZero ? [-1, 1] : [Math.floor(minValue) - 1, Math.ceil(maxValue) + 1]
                  : allZero
                    ? [0, 1000]
                    : [Math.floor(minValue / 1000) * 1000, Math.ceil(maxValue / 1000) * 1000]
              }
              tickFormatter={(value) => (selectedMetric === "Draw Down" ? `${value}%` : Math.abs(value) >= 1000 ? `${(value / 1000).toFixed(0)}k` : String(value))}
              width={50}
            />
            <Tooltip
              formatter={(value: number) =>
                selectedMetric === "Draw Down"
                  ? `${Number(value).toFixed(2)}%`
                  : `$${Number(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              }
              labelFormatter={(label) => String(label)}
              contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 10 }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={strokeColor}
              strokeWidth={2.5}
              fill={`url(#${gradientId})`}
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      </div>
    </Card>
  )
}

export function DetailedStatisticsCard({ stats }: { stats?: PerformanceResponse | null }) {
  const adv = stats?.statistics?.advanced_statistics
  const recentTrades = getRecentTrades(adv)

  const avgWin = useMemo(() => {
    const wins = recentTrades.filter((t) => (t.net_profit ?? 0) > 0).map((t) => t.net_profit ?? 0)
    if (!wins.length) return null
    return wins.reduce((sum, v) => sum + v, 0) / wins.length
  }, [recentTrades])
  const avgLoss = useMemo(() => {
    const losses = recentTrades.filter((t) => (t.net_profit ?? 0) < 0).map((t) => t.net_profit ?? 0)
    if (!losses.length) return null
    return losses.reduce((sum, v) => sum + v, 0) / losses.length
  }, [recentTrades])
  const bestTrade = useMemo(() => {
    if (!recentTrades.length) return null
    return recentTrades.reduce((best, t) => ((t.net_profit ?? -Infinity) > (best.net_profit ?? -Infinity) ? t : best))
  }, [recentTrades])
  const worstTrade = useMemo(() => {
    if (!recentTrades.length) return null
    return recentTrades.reduce((worst, t) => ((t.net_profit ?? Infinity) < (worst.net_profit ?? Infinity) ? t : worst))
  }, [recentTrades])

  const advRecord = (adv ?? {}) as Record<string, unknown>
  const sharpeRatio = pickNumber(advRecord, "sharpe_ratio", "sharpe")
  const winRate = adv?.win_rate ?? 0
  const totalTrades = adv?.total_trades ?? recentTrades.length
  const profitFactor = adv?.profit_factor ?? null

  const statCards = [
    {
      label: "Win Rate",
      value: `${winRate}%`,
      icon: Trophy,
      tone: winRate >= 50 ? "text-emerald-500" : "text-destructive",
    },
    {
      label: "Total Trades",
      value: String(totalTrades),
      icon: ChartNoAxesCombined,
      tone: "text-foreground",
    },
    {
      label: "Profit Factor",
      value: profitFactor != null ? Number(profitFactor).toFixed(2) : "—",
      icon: BadgePercent,
      tone: (profitFactor ?? 0) >= 1 ? "text-emerald-500" : "text-destructive",
    },
    {
      label: "Sharpe Ratio",
      value: sharpeRatio != null ? Number(sharpeRatio).toFixed(2) : "—",
      icon: Gauge,
      tone: (sharpeRatio ?? 0) >= 0 ? "text-foreground" : "text-destructive",
    },
    {
      label: "Average Win",
      value: formatMoney(avgWin),
      icon: Gem,
      tone: "text-emerald-500",
    },
    {
      label: "Average Loss",
      value: formatMoney(avgLoss),
      icon: Scale,
      tone: "text-destructive",
    },
    {
      label: "Best Trade",
      value: formatMoney(bestTrade?.net_profit ?? null),
      sub: bestTrade?.close_time?.slice(0, 10) ?? "—",
      icon: Activity,
      tone: "text-emerald-500",
    },
    {
      label: "Worst Trade",
      value: formatMoney(worstTrade?.net_profit ?? null),
      sub: worstTrade?.close_time?.slice(0, 10) ?? "—",
      icon: Activity,
      tone: "text-destructive",
    },
  ] as const

  return (
    <Card className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm mt-4">
      <div className="border-b border-border/80 px-4 sm:px-5 py-4 bg-gradient-to-r from-muted/20 to-transparent">
        <h3 className="text-sm font-semibold text-foreground tracking-tight">Detailed Statistics</h3>
        <p className="text-xs text-muted-foreground mt-1">Advanced performance breakdown and risk quality metrics</p>
      </div>
      <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map((item) => (
          <div
            key={item.label}
            className="group relative overflow-hidden rounded-xl border border-border/70 bg-gradient-to-br from-card via-muted/20 to-card p-3.5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="pointer-events-none absolute -top-8 right-4 h-16 w-16 rounded-full bg-muted/50 blur-2xl" />
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-border/70 bg-muted/40 text-muted-foreground">
                <item.icon className="h-4 w-4" />
              </div>
              <p className="text-xs font-medium text-muted-foreground">{item.label}</p>
            </div>
            <p className={`mt-3 text-2xl font-semibold tabular-nums ${item.tone}`}>{item.value}</p>
            {item.sub ? <p className="mt-1 text-xs text-muted-foreground">{item.sub}</p> : null}
          </div>
        ))}
      </div>
    </Card>
  )
}

