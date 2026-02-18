"use client"

import { useMemo, useState } from "react"
import dynamic from "next/dynamic"

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false })

export interface OrderForStats {
  id: number
  order_id: string
  challenge_type?: string | null
  account_type?: string | null
  platform?: string | null
  profit_target?: number | null
  status?: string | null
  is_live?: boolean
  is_stage2?: boolean
  stage2_account?: { platform_login?: string; profit_target?: number } | null
  live_account?: { platform_login?: string } | null
  platform_login?: string | null
  credentials?: { platform_login?: string; profit_target?: number } | null
  stage2_credentials?: { platform_login?: string; profit_target?: number } | null
  live_credentials?: { platform_login?: string; profit_target?: number } | null
}

export interface StatisticsApiResponse {
  success?: boolean
  account_info?: { balance?: number; equity?: number; profit?: number; margin_free?: number }
  statistics?: {
    account_stats?: {
      balance?: number; equity?: number; profit?: number; twr_percent?: number
      peak_balance?: number; total_deposits?: number; abs_gain_percent?: number
      drawdown_percent?: number; total_withdrawals?: number
      avg_daily_return_percent?: number; avg_monthly_return_percent?: number
    }
    equity_curve?: {
      daily_performance?: Array<{
        date: string
        cumulative_equity?: number
        drawdown?: number
        profit?: number
        daily_profit?: number
        balance?: number
      }>
    }
    advanced_statistics?: {
      win_rate?: number
      total_trades?: number
      profit_factor?: number
      sharpe_ratio?: number
      avg_win?: { profit?: number }
      avg_loss?: { profit?: number }
      best_trade_profit?: { value?: number; date?: string }
      worst_trade_profit?: { value?: number; date?: string }
      charts?: {
        recent_trades_duration?: Array<{
          open_time?: string
          close_time?: string
          openTime?: string
          net_profit?: number
          duration?: number
          symbol?: string
          type?: string
          direction?: string
        }>
      }
    }
  }
}

function getFullAccountRules(accountType: string | null | undefined): Record<string, string> {
  const allRules: Record<string, Record<string, string>> = {
    "DRAGON APEX": {
      "Minimum Trading Days": "4",
      "Minimum Trades": "4",
      "Daily Drawdown": "4%",
      "Maximum Drawdown": "10%",
      "Consistency Rule": "Your whole trading day not exceeded than 30%",
      "Weekend Holding": "Not Allowed",
      "Overnight Holding": "Not Allowed",
      "Minimum Trade Holding Time": "2 minutes 30 seconds (Funded Stage Only)",
      "Minimum Trade Holding Time Live": "2 minutes 30 seconds"
    },
    "DRAGON PRIME": {
      "Minimum Trading Days": "4",
      "Minimum Trades": "4",
      "Daily Drawdown": "4%",
      "Maximum Drawdown": "10%",
      "Consistency Rule": "Not Applied",
      "Weekend Holding": "Allowed",
      "Overnight Holding": "Allowed",
      "Minimum Trade Holding Time": "2 minutes 30 seconds",
      "Minimum Trade Holding Time Live": "2 minutes 30 seconds"
    },
    "SWING": {
      "Minimum Trading Days": "Your trades closed within the week (not exceed 4 days)",
      "Minimum Trades": "4 trades total (2 on first stage, 2 on second stage)",
      "Daily Drawdown": "5%",
      "Maximum Drawdown": "8%",
      "Consistency Rule": "Not Applied",
      "Weekend Holding": "Allowed",
      "Overnight Holding": "Allowed",
      "Minimum Trade Holding Time": "No Minimum on Live Account"
    },
    "HFT DRAGON": {
      "Minimum Trading Days": "1",
      "Minimum Trades": "1",
      "Daily Drawdown": "4%",
      "Maximum Drawdown": "8%",
      "Consistency Rule": "Applied",
      "Weekend Holding": "Not Allowed",
      "Overnight Holding": "Not Allowed",
      "Minimum Trade Holding Time": "2 minutes 30 seconds",
      "Minimum Trade Holding Time Live": "2 minutes 30 seconds"
    },
    "DRAGON INSTANT PRO": {
      "Minimum Trading Days": "1",
      "Minimum Trades": "1",
      "Daily Drawdown": "4%",
      "Maximum Drawdown": "8%",
      "Consistency Rule": "Applied",
      "Weekend Holding": "Not Allowed",
      "Overnight Holding": "Not Allowed",
      "Minimum Trade Holding Time": "2 minutes 30 seconds (Live Account)"
    }
  }
  if (!accountType) return allRules["DRAGON APEX"]
  const n = String(accountType).toUpperCase().trim()
  if (allRules[n]) return allRules[n]
  if (n.includes("INSTANT ACCOUNT") || n.includes("INSTANT ACCOUNTS")) return allRules["DRAGON INSTANT PRO"]
  if (n.includes("DRAGON 1") || n === "DRAGON1" || n.includes("DRAGON-1") || n.includes("DRAGON_1")) return allRules["DRAGON APEX"]
  if (n.includes("DRAGON 2") || n === "DRAGON2" || n.includes("DRAGON-2") || n.includes("DRAGON_2")) return allRules["DRAGON PRIME"]
  if (n.includes("SWING")) return allRules["SWING"]
  if (n.includes("HFT")) return allRules["HFT DRAGON"]
  if (n.includes("INSTANT PRO") || n.includes("DRAGON INSTANT") || (n.includes("INSTANT") && !n.includes("PRIME"))) return allRules["DRAGON INSTANT PRO"]
  if (n.includes("APEX") || n.includes("DRAGON APEX")) return allRules["DRAGON APEX"]
  if (n.includes("PRIME") || n.includes("DRAGON PRIME")) return allRules["DRAGON PRIME"]
  return allRules["DRAGON APEX"]
}

function getAccountRules(accountType: string | null | undefined) {
  const full = getFullAccountRules(accountType)
  return {
    minTradingDays: full["Minimum Trading Days"]?.match(/\d+/)?.[0] || "4",
    minTrades: full["Minimum Trades"]?.match(/\d+/)?.[0] || "4",
    maxDrawdown: full["Maximum Drawdown"] || "10%",
    dailyDrawdown: full["Daily Drawdown"] || "4%"
  }
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(value)
}

interface AdminOrderStatisticsViewProps {
  order: OrderForStats
  data: StatisticsApiResponse
}

export function AdminOrderStatisticsView({ order, data }: AdminOrderStatisticsViewProps) {
  const [equityChartView, setEquityChartView] = useState<"Growth" | "Profit" | "Drawdown">("Growth")

  const equityCurve = data?.statistics?.equity_curve?.daily_performance || []
  const tradeHistory = data?.statistics?.advanced_statistics?.charts?.recent_trades_duration || []
  const stats = data?.statistics?.account_stats || {}
  const accountInfo = data?.account_info || {}
  const advStats = data?.statistics?.advanced_statistics || {}

  const getTradingDays = () => {
    const set = new Set<string>()
    tradeHistory.forEach((t: { open_time?: string }) => {
      if (t.open_time) set.add(new Date(t.open_time).toISOString().split("T")[0])
    })
    return Array.from(set).sort().reverse()
  }
  const tradingDaysList = getTradingDays()
  const selectedDay = tradingDaysList[0] || new Date().toISOString().split("T")[0]

  const calculateDayDrawdown = (targetDate: string) => {
    if (!targetDate) return 0
    let dayDrawdown = 0
    if (equityCurve.length > 0) {
      const dayEquity = equityCurve.filter((item: { date?: string }) => {
        const d = item.date ? new Date(item.date).toISOString().split("T")[0] : ""
        return d === targetDate
      })
      if (dayEquity.length > 0) {
        const drawdownValues = dayEquity.map((item: { drawdown?: number }) => Math.abs(item.drawdown || 0))
        if (drawdownValues.some((v: number) => v > 0)) dayDrawdown = Math.max(...drawdownValues)
        if (dayDrawdown === 0) {
          const startEquity = dayEquity[0]?.cumulative_equity || stats.balance || 0
          const minEquity = Math.min(...dayEquity.map((item: { cumulative_equity?: number }) => item.cumulative_equity || startEquity))
          if (startEquity > 0) dayDrawdown = Math.abs(((startEquity - minEquity) / startEquity) * 100)
        }
      }
    }
    if (dayDrawdown === 0 && tradeHistory.length > 0) {
      const dayTrades = tradeHistory.filter((t: { open_time?: string }) => {
        if (!t.open_time) return false
        return new Date(t.open_time).toISOString().split("T")[0] === targetDate
      })
      if (dayTrades.length > 0) {
        let cumulativeLoss = 0, maxLoss = 0
        dayTrades.forEach((trade: { net_profit?: number }) => {
          cumulativeLoss += trade.net_profit || 0
          if (cumulativeLoss < maxLoss) maxLoss = cumulativeLoss
        })
        const startingBalance = stats.balance || accountInfo.balance || 0
        if (startingBalance > 0) dayDrawdown = Math.abs((maxLoss / startingBalance) * 100)
      }
    }
    return dayDrawdown
  }

  const calculateAchievements = () => {
    const tradingDaysAchieved = tradingDaysList.length
    const tradesAchieved = advStats.total_trades || 0
    const drawdownAchieved = Math.abs(stats.drawdown_percent || 0)
    let maxDrawdownDate: string | null = null
    let maxDrawdownValue = 0
    equityCurve.forEach((item: { date?: string; drawdown?: number }) => {
      const d = Math.abs(item.drawdown || 0)
      if (d > maxDrawdownValue) {
        maxDrawdownValue = d
        maxDrawdownDate = item.date || null
      }
    })
    const targetDay = selectedDay || tradingDaysList[0] || new Date().toISOString().split("T")[0]
    const dailyDrawdownFinal = calculateDayDrawdown(targetDay)
    return {
      tradingDaysAchieved,
      tradesAchieved,
      drawdownAchieved,
      maxDrawdownDate,
      dailyDrawdownAchieved: dailyDrawdownFinal,
      selectedDayDrawdown: dailyDrawdownFinal,
      selectedDay: targetDay
    }
  }

  const achievements = useMemo(() => calculateAchievements(), [equityCurve.length, tradeHistory.length, stats.drawdown_percent, selectedDay, tradingDaysList.length])

  const violations = useMemo(() => {
    const out: Array<{ rule: string; required: string; current: string; severity: string; description: string; dailyViolations?: Array<{ day: string; drawdown: string; date: string }> }> = []
    const accountType = order.challenge_type || order.account_type || ""
    const rules = getFullAccountRules(accountType)

    let minDaysRequired = 4
    const minDaysRule = rules["Minimum Trading Days"]
    if (minDaysRule?.includes("not exceed 4 days")) minDaysRequired = 4
    else minDaysRequired = parseInt(minDaysRule?.match(/\d+/)?.[0] || "4")

    const profitTarget = order.stage2_account?.profit_target ?? order.profit_target ?? (order as any).credentials?.profit_target ?? (order as any).stage2_credentials?.profit_target ?? 0
    const currentProfit = stats.profit || 0
    const profitTargetAchieved = profitTarget > 0 && currentProfit >= profitTarget

    if (achievements.tradingDaysAchieved < minDaysRequired && profitTargetAchieved) {
      const profitPercent = profitTarget > 0 ? ((currentProfit / profitTarget) * 100).toFixed(1) : 0
      out.push({
        rule: "Minimum Trading Days",
        required: minDaysRule || `${minDaysRequired} days`,
        current: `${achievements.tradingDaysAchieved} days`,
        severity: "error",
        description: `Profit target achieved (${profitPercent}%) but minimum trading days not met. Need ${minDaysRule || minDaysRequired + " days"} but have ${achievements.tradingDaysAchieved} days.`
      })
    }

    const maxDrawdownAllowed = parseFloat(rules["Maximum Drawdown"]?.replace("%", "") || "10")
    const drawdownWarningThreshold = maxDrawdownAllowed * 0.8
    if (achievements.drawdownAchieved > maxDrawdownAllowed) {
      const drawdownDate = achievements.maxDrawdownDate ? new Date(achievements.maxDrawdownDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "N/A"
      out.push({
        rule: "Maximum Drawdown",
        required: `${maxDrawdownAllowed}%`,
        current: `${achievements.drawdownAchieved.toFixed(2)}%`,
        severity: "error",
        description: `Maximum drawdown limit is ${maxDrawdownAllowed}% but current is ${achievements.drawdownAchieved.toFixed(2)}% (Hit on: ${drawdownDate})`
      })
    } else if (achievements.drawdownAchieved >= drawdownWarningThreshold) {
      out.push({
        rule: "Maximum Drawdown Warning",
        required: `${maxDrawdownAllowed}%`,
        current: `${achievements.drawdownAchieved.toFixed(2)}%`,
        severity: "warning",
        description: `Approaching maximum drawdown limit! Current ${achievements.drawdownAchieved.toFixed(2)}% is at ${((achievements.drawdownAchieved / maxDrawdownAllowed) * 100).toFixed(0)}% of the ${maxDrawdownAllowed}% limit.`
      })
    }

    const dailyDrawdownAllowed = parseFloat(rules["Daily Drawdown"]?.replace("%", "") || "4")
    const dailyViolations: Array<{ day: string; drawdown: string; date: string }> = []
    const today = new Date().toISOString().split("T")[0]
    tradingDaysList.forEach((day: string) => {
      const dayDrawdown = calculateDayDrawdown(day)
      if (dayDrawdown > dailyDrawdownAllowed) {
        const date = new Date(day)
        const formatted = date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: date.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined })
        dailyViolations.push({ day: day === today ? `Today (${formatted})` : formatted, drawdown: dayDrawdown.toFixed(2), date: day })
      }
    })
    if (dailyViolations.length > 0) {
      out.push({
        rule: "Daily Drawdown Violations",
        required: `${dailyDrawdownAllowed}% per day`,
        current: `${dailyViolations.length} day(s) exceeded limit`,
        severity: "error",
        description: `Daily drawdown limit ${dailyDrawdownAllowed}% exceeded: ${dailyViolations.map((v) => `${v.day} (${v.drawdown}%)`).join(", ")}`,
        dailyViolations
      })
    }

    if (rules["Consistency Rule"] && rules["Consistency Rule"] !== "Not Applied" && equityCurve.length > 0) {
      const dailyProfits: Record<string, number> = {}
      equityCurve.forEach((item: { date?: string; daily_profit?: number; profit?: number }) => {
        const date = item.date ? new Date(item.date).toISOString().split("T")[0] : ""
        if (!date) return
        if (!dailyProfits[date]) dailyProfits[date] = 0
        dailyProfits[date] += item.daily_profit ?? item.profit ?? 0
      })
      const totalProfit = stats.profit || 0
      if (totalProfit > 0) {
        const maxDailyProfit = Math.max(...Object.values(dailyProfits), 0)
        if (maxDailyProfit > totalProfit * 0.3) {
          out.push({
            rule: "Consistency Rule",
            required: "No single day > 30% of total profit",
            current: `${((maxDailyProfit / totalProfit) * 100).toFixed(2)}% of total profit`,
            severity: "error",
            description: `Highest trading day (${formatCurrency(maxDailyProfit)}) exceeds 30% of total profit (${formatCurrency(totalProfit)})`
          })
        }
      }
    }

    const isLiveAccount = order.live_account || (order.status?.toUpperCase() === "LIVE") || (order.status?.toUpperCase() === "LIVE ACCOUNT") || order.is_live
    const holdingTimeRule = isLiveAccount && rules["Minimum Trade Holding Time Live"] ? rules["Minimum Trade Holding Time Live"] : rules["Minimum Trade Holding Time"]
    if (holdingTimeRule && holdingTimeRule !== "No Minimum on Live Account" && isLiveAccount) {
      const m = holdingTimeRule.match(/(\d+)\s*minutes?\s*(\d+)?\s*seconds?/)
      if (m) {
        const minSeconds = parseInt(m[1] || "0") * 60 + parseInt(m[2] || "0")
        const shortTrades = tradeHistory.filter((t: { duration?: number }) => (t.duration || 0) > 0 && t.duration! < minSeconds)
        if (shortTrades.length > 0) {
          out.push({
            rule: "Minimum Trade Holding Time",
            required: holdingTimeRule,
            current: `${shortTrades.length} trade(s) below minimum`,
            severity: "error",
            description: `${shortTrades.length} trade(s) with holding time less than required`
          })
        }
      }
    }

    if (tradeHistory.length > 0) {
      const sorted = [...tradeHistory].sort((a: { open_time?: string }, b: { open_time?: string }) => new Date(a.open_time || 0).getTime() - new Date(b.open_time || 0).getTime())
      let layeringCount = 0
      const checked = new Set<string>()
      for (let i = 0; i < sorted.length; i++) {
        const t = sorted[i]
        const symbol = t.symbol || ""
        const direction = t.type || t.direction || ""
        const openTime = new Date(t.open_time || 0).getTime()
        const inWindow = sorted.filter((o, idx) => {
          if (idx <= i) return false
          const oSymbol = o.symbol || ""
          const oDir = o.type || o.direction || ""
          const oTime = new Date(o.open_time || 0).getTime()
          return oSymbol === symbol && oDir === direction && (oTime - openTime) / 1000 <= 10 && (oTime - openTime) >= 0
        })
        if (inWindow.length >= 2) {
          const key = `${symbol}-${direction}-${Math.floor(openTime / 10000)}`
          if (!checked.has(key)) { checked.add(key); layeringCount++ }
        }
      }
      if (layeringCount > 0) {
        out.push({
          rule: "Layering",
          required: "Max 2 orders per pair/direction within 10s",
          current: `${layeringCount} layering instance(s)`,
          severity: "error",
          description: `Detected ${layeringCount} instance(s) where more than 2 orders were placed on same pair/direction within 10 seconds`
        })
      }
    }
    return out
  }, [order, data, achievements])

  const fullAccountRules = getFullAccountRules(order.challenge_type || order.account_type)
  const accountRules = getAccountRules(order.challenge_type || order.account_type)

  const chartData = useMemo(() => {
    if (equityChartView === "Growth") {
      return {
        name: "Growth",
        data: equityCurve.map((item: { cumulative_equity?: number }) => item.cumulative_equity || 0),
        categories: equityCurve.map((item: { date?: string }) => item.date ? new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "")
      }
    }
    if (equityChartView === "Profit") {
      let cum = 0
      return {
        name: "Profit",
        data: equityCurve.map((item: { profit?: number; daily_profit?: number }) => {
          cum += item.profit ?? item.daily_profit ?? 0
          return cum
        }),
        categories: equityCurve.map((item: { date?: string }) => item.date ? new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "")
      }
    }
    return {
      name: "Drawdown",
      data: equityCurve.map((item: { drawdown?: number }) => Math.abs(item.drawdown || 0)),
      categories: equityCurve.map((item: { date?: string }) => item.date ? new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "")
    }
  }, [equityChartView, equityCurve])

  const errorViolations = violations.filter((v) => v.severity === "error")
  const warningViolations = violations.filter((v) => v.severity === "warning")

  return (
    <div className="space-y-5 text-left">
      {/* Account info - pastel violet card */}
      <div className="rounded-xl border border-gray-200 bg-violet-50 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 bg-white/60">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Account info</h3>
        </div>
        <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Balance", value: Number(accountInfo.balance ?? 0), fmt: (v: number) => formatCurrency(v) },
            { label: "Equity", value: Number(accountInfo.equity ?? 0), fmt: (v: number) => formatCurrency(v) },
            { label: "Profit", value: Number(accountInfo.profit ?? 0), fmt: (v: number) => formatCurrency(v) },
            { label: "Margin free", value: Number(accountInfo.margin_free ?? 0), fmt: (v: number) => formatCurrency(v) }
          ].map(({ label, value, fmt }) => (
            <div key={label} className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
              <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-0.5">{label}</p>
              <p className="text-gray-900 font-bold text-sm">{fmt(value)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Account stats - pastel amber card */}
      <div className="rounded-xl border border-gray-200 bg-amber-50 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 bg-white/60">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Account stats</h3>
        </div>
        <div className="p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {[
            { label: "Balance", value: Number(stats.balance ?? 0), fmt: (v: number) => formatCurrency(v) },
            { label: "Equity", value: Number(stats.equity ?? 0), fmt: (v: number) => formatCurrency(v) },
            { label: "Profit", value: Number(stats.profit ?? 0), fmt: (v: number) => formatCurrency(v) },
            { label: "TWR %", value: Number(stats.twr_percent ?? 0), fmt: (v: number) => `${v.toFixed(2)}%` },
            { label: "Peak bal", value: Number(stats.peak_balance ?? 0), fmt: (v: number) => formatCurrency(v) },
            { label: "DD %", value: Number(stats.drawdown_percent ?? 0), fmt: (v: number) => `${v.toFixed(2)}%` },
            { label: "Abs gain %", value: Number(stats.abs_gain_percent ?? 0), fmt: (v: number) => `${v.toFixed(2)}%` },
            { label: "Deposits", value: Number(stats.total_deposits ?? 0), fmt: (v: number) => formatCurrency(v) },
            { label: "Withdraw", value: Number(stats.total_withdrawals ?? 0), fmt: (v: number) => formatCurrency(v) },
            { label: "Avg day %", value: Number(stats.avg_daily_return_percent ?? 0), fmt: (v: number) => `${v.toFixed(2)}%` },
            { label: "Avg mo %", value: Number(stats.avg_monthly_return_percent ?? 0), fmt: (v: number) => `${v.toFixed(2)}%` }
          ].map(({ label, value, fmt }) => (
            <div key={label} className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
              <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-0.5">{label}</p>
              <p className="text-gray-900 font-bold text-sm">{fmt(value)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Key statistics - pastel emerald card */}
      <div className="rounded-xl border border-gray-200 bg-emerald-50 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 bg-white/60">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Key stats</h3>
        </div>
        <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Win Rate", value: advStats.win_rate ?? 0, fmt: (v: number) => `${v}%` },
            { label: "Trades", value: advStats.total_trades ?? 0, fmt: (v: number) => String(v) },
            { label: "PF", value: Number(advStats.profit_factor ?? 0), fmt: (v: number) => v.toFixed(2) },
            { label: "Sharpe", value: Number(advStats.sharpe_ratio ?? 0), fmt: (v: number) => v.toFixed(2) },
            { label: "Avg Win", value: Number(advStats.avg_win?.profit ?? 0), fmt: (v: number) => formatCurrency(v) },
            { label: "Avg Loss", value: Number(advStats.avg_loss?.profit ?? 0), fmt: (v: number) => formatCurrency(v) },
            { label: "Best", value: Number(advStats.best_trade_profit?.value ?? 0), fmt: (v: number) => formatCurrency(v) },
            { label: "Worst", value: Number(advStats.worst_trade_profit?.value ?? 0), fmt: (v: number) => formatCurrency(v) }
          ].map(({ label, value, fmt }) => (
            <div key={label} className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
              <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-0.5">{label}</p>
              <p className="text-gray-900 font-bold text-sm">{fmt(value)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Trading rules progress - white card */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Rules progress</h3>
        </div>
        <div className="p-4 space-y-4">
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-700 text-sm font-medium">Min days</span>
              <span className="text-gray-900 font-semibold text-sm">{achievements.tradingDaysAchieved} / {accountRules.minTradingDays}</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${Math.min((achievements.tradingDaysAchieved / parseInt(accountRules.minTradingDays || "1")) * 100, 100)}%` }} />
            </div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-700 text-sm font-medium">Drawdown</span>
              <span className="text-gray-900 font-semibold text-sm">{achievements.drawdownAchieved.toFixed(2)}% / {accountRules.maxDrawdown}</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${Math.min(achievements.drawdownAchieved / parseFloat(accountRules.maxDrawdown?.replace("%", "") || "10") * 100, 100)}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Account rules - white card */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Rules — {order.challenge_type || order.account_type || "N/A"}</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {Object.entries(fullAccountRules).map(([ruleName, value]) => (
            <div key={ruleName} className="flex justify-between items-center py-3 px-4 hover:bg-gray-50/50">
              <span className="text-gray-700 text-sm">{ruleName}</span>
              <span className="text-gray-900 font-medium text-sm">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Violations */}
      {(errorViolations.length > 0 || warningViolations.length > 0) && (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 bg-red-50">
            <h3 className="text-xs font-semibold text-red-700 uppercase tracking-wider">Violations</h3>
          </div>
          <div className="p-4 space-y-3">
            {errorViolations.map((v, i) => (
              <div key={`e-${i}`} className="p-3 rounded-xl bg-red-50 border border-red-200">
                <p className="font-semibold text-red-700 text-sm">{v.rule}</p>
                <p className="text-gray-700 text-sm mt-1">{v.description}</p>
                <p className="text-gray-500 text-xs mt-1">Req: {v.required} — Cur: {v.current}</p>
              </div>
            ))}
            {warningViolations.map((v, i) => (
              <div key={`w-${i}`} className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                <p className="font-semibold text-amber-700 text-sm">{v.rule}</p>
                <p className="text-gray-700 text-sm mt-1">{v.description}</p>
                <p className="text-gray-500 text-xs mt-1">Req: {v.required} — Cur: {v.current}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Equity chart - white card with light chart */}
      {equityCurve.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Equity curve</h3>
            <div className="flex gap-2">
              {(["Growth", "Profit", "Drawdown"] as const).map((view) => (
                <button
                  key={view}
                  onClick={() => setEquityChartView(view)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${equityChartView === view ? "bg-gray-900 text-white shadow-sm" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}
                >
                  {view}
                </button>
              ))}
            </div>
          </div>
          <div className="p-4 bg-gray-50/50 min-h-[200px]">
            <ReactApexChart
              type="area"
              height={200}
              options={{
                chart: { type: "area", toolbar: { show: false }, zoom: { enabled: false } },
                dataLabels: { enabled: false },
                stroke: { curve: "smooth", width: 2 },
                fill: { type: "gradient", gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.05 } },
                colors: [equityChartView === "Drawdown" ? "#ef4444" : "#22c55e"],
                xaxis: { categories: chartData.categories, labels: { style: { colors: "#6b7280", fontSize: "10px" }, rotate: -45 } },
                yaxis: {
                  labels: {
                    style: { colors: "#6b7280", fontSize: "10px" },
                    formatter: (val: number) => equityChartView === "Drawdown" ? `${val.toFixed(2)}%` : formatCurrency(val)
                  }
                },
                tooltip: {
                  theme: "light",
                  style: { fontSize: "11px" },
                  y: { formatter: (val: number) => equityChartView === "Drawdown" ? `${val.toFixed(2)}%` : formatCurrency(val) }
                },
                grid: { borderColor: "#e5e7eb", strokeDashArray: 4 }
              }}
              series={[{ name: chartData.name, data: chartData.data }]}
            />
          </div>
        </div>
      )}
    </div>
  )
}
