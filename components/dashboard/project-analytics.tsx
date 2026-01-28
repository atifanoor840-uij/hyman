"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Play, Check } from "lucide-react"

// Generate chart data for Equity, Profit, or Draw Down
const generateData = (metric: string) => {
  const now = new Date()
  const data = []
  const count = 24
  let equity = 38154
  let profit = 0
  let peak = equity
  let drawDown = 0

  for (let i = 0; i < count; i++) {
    const hour = 8 + i
    const time = hour > 12 ? `${hour - 12}:00 PM` : `${hour}:00 AM`
    const change = (Math.random() - 0.45) * 500
    equity += change
    profit += change
    peak = Math.max(peak, equity)
    drawDown = Math.min(0, (equity - peak) / peak * 100)

    data.push({
      time,
      value: metric === "Equity" ? equity : metric === "Profit" ? profit : drawDown,
      equity,
      profit,
      drawDown,
      date: now.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }),
      fullTime: `${time} - ${now.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}`,
    })
  }
  return data
}

const metricOptions = ["Draw Down", "Profit", "Equity"] as const

export function ProjectAnalytics() {
  const [selectedMetric, setSelectedMetric] = useState<(typeof metricOptions)[number]>("Equity")
  const chartData = generateData(selectedMetric)
  const currentBalance = chartData[chartData.length - 1]?.equity || 38154
  const values = chartData.map((d) => d.value)
  const maxValue = Math.max(...values)
  const minValue = Math.min(...values)

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
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
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
        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <Play className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <Check className="w-3.5 h-3.5" />
          </Button>
          <select className="px-2.5 py-1 text-xs bg-muted border border-border rounded-md text-foreground">
            <option>7 Days</option>
            <option>30 Days</option>
            <option>90 Days</option>
          </select>
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
                  ? [Math.floor(minValue) - 1, 1]
                  : [Math.floor(minValue / 1000) * 1000, Math.ceil(maxValue / 1000) * 1000]
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
