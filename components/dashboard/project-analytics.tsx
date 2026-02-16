"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useState, useMemo } from "react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import type { PerformanceResponse } from "@/lib/api/performance"

// Zero chart data when no API stats (no fake/placeholder data)
function getZeroChartData() {
  const count = 24
  const data = []
  for (let i = 0; i < count; i++) {
    const hour = 8 + (i % 12)
    const time = hour > 12 ? `${hour - 12}:00 PM` : `${hour}:00 AM`
    data.push({
      time,
      value: 0,
      equity: 0,
      profit: 0,
      drawDown: 0,
      date: "—",
      fullTime: time,
    })
  }
  return data
}

function buildChartDataFromStats(stats: PerformanceResponse | null, metric: string) {
  const daily = stats?.statistics?.equity_curve?.daily_performance
  if (!daily?.length) return null
  return daily.map((d) => {
    const dateStr = d.date
    const equity = d.cumulative_equity ?? d.cumulative_balance ?? 0
    const profit = d.cumulative_profit ?? 0
    const drawDown = d.drawdown ?? 0
    return {
      time: dateStr,
      value: metric === "Equity" ? equity : metric === "Profit" ? profit : drawDown,
      equity,
      profit,
      drawDown,
      date: dateStr,
      fullTime: dateStr,
    }
  })
}

const metricOptions = ["Draw Down", "Profit", "Equity"] as const

export interface ProjectAnalyticsProps {
  stats?: PerformanceResponse | null
}

export function ProjectAnalytics(props: ProjectAnalyticsProps) {
  const { stats = null } = props
  const [selectedMetric, setSelectedMetric] = useState<(typeof metricOptions)[number]>("Equity")
  const chartDataFromApi = useMemo(() => buildChartDataFromStats(stats ?? null, selectedMetric), [stats, selectedMetric])
  const chartData = chartDataFromApi ?? getZeroChartData()
  const currentBalance = stats?.account_info?.equity ?? stats?.account_info?.balance ?? chartData[chartData.length - 1]?.equity ?? 0
  const values = chartData.map((d) => d.value)
  const maxValue = values.length ? Math.max(...values) : 0
  const minValue = values.length ? Math.min(...values) : 0
  const allZero = maxValue === 0 && minValue === 0

  const formatTooltipValue = (val: number) => {
    if (selectedMetric === "Draw Down") return `${val.toFixed(2)}%`
    return `$${val.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-foreground/95 backdrop-blur-sm text-background px-4 py-3 rounded-lg text-sm font-semibold shadow-xl border border-border/50">
          <p className="font-bold text-lg">{formatTooltipValue(data.value)}</p>
          <p className="text-xs opacity-90 mt-1">{data.fullTime || data.date}</p>
        </div>
      )
    }
    return null
  }

  const formatYAxis = (value: number) => {
    if (selectedMetric === "Draw Down") return `${value}%`
    if (Math.abs(value) >= 1000) return `${(value / 1000).toFixed(0)}k`
    return value.toString()
  }

  const strokeColor = selectedMetric === "Draw Down" ? "#ef4444" : "#0a0a0a"
  const gradientId = `chartGradient-${selectedMetric.replace(/\s/g, "")}`
  const isDrawDown = selectedMetric === "Draw Down"

  return (
    <Card
      className="p-4 md:p-5 transition-shadow duration-200 hover:shadow-md animate-slide-in-up bg-card flex flex-col min-w-0"
      style={{ animationDelay: "400ms" }}
    >
      {/* Metric buttons on top */}
      <div className="flex items-center gap-1.5 mb-4">
        {metricOptions.map((metric) => (
          <Button
            key={metric}
            variant={selectedMetric === metric ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedMetric(metric)}
            className={`text-xs h-6 px-2.5 ${
              selectedMetric === metric
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-transparent hover:bg-muted"
            }`}
          >
            {metric}
          </Button>
        ))}
      </div>

      {/* Header Section */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-sm font-bold text-primary">B</span>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{selectedMetric}</p>
          <p className="text-lg font-bold text-foreground">
            {selectedMetric === "Draw Down"
              ? `${chartData[chartData.length - 1]?.value?.toFixed(2) ?? 0}%`
              : selectedMetric === "Profit"
                ? `$${(chartData[chartData.length - 1]?.profit ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`
                : `$${currentBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`}
          </p>
        </div>
      </div>

      {/* Chart Area - reduced height to match right column */}
      <div className="h-52 relative">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={strokeColor} stopOpacity={isDrawDown ? 0.5 : 0.4} />
                <stop offset="50%" stopColor={strokeColor} stopOpacity={isDrawDown ? 0.25 : 0.15} />
                <stop offset="100%" stopColor={strokeColor} stopOpacity={isDrawDown ? 0.1 : 0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="opacity-10" />
            <XAxis
              dataKey="time"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "currentColor", fontSize: 11 }}
              className="text-muted-foreground"
              interval="preserveStartEnd"
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "currentColor", fontSize: 11 }}
              className="text-muted-foreground"
              domain={
                selectedMetric === "Draw Down"
                  ? allZero ? [-1, 1] : [Math.floor(minValue) - 1, 1]
                  : allZero ? [0, 1000] : [Math.floor(minValue / 1000) * 1000, Math.ceil(maxValue / 1000) * 1000]
              }
              tickFormatter={formatYAxis}
              width={50}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ stroke: strokeColor, strokeWidth: 1, strokeDasharray: "5 5" }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={strokeColor}
              strokeWidth={isDrawDown ? 3 : 2.5}
              fill={`url(#${gradientId})`}
              dot={false}
              activeDot={{ r: 6, fill: strokeColor, stroke: "#fff", strokeWidth: 2, filter: `drop-shadow(0 0 4px ${strokeColor}80)` }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
