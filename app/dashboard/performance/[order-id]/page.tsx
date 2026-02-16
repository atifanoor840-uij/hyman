"use client"

import { useState, useEffect, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { Footer } from "@/components/footer"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  Banknote,
  TrendingUp,
  Target,
  ArrowDownRight,
  Copy,
  Check,
  BarChart3,
  ShoppingCart,
  Loader2,
  Wallet,
  Briefcase,
  Calendar,
  Lock,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getMyAccount, type Order, type OrderCredentials } from "@/lib/api/auth"
import { type PerformanceResponse } from "@/lib/api/performance"
import { getShowMyTradesStats } from "@/lib/api/showmytrades"
import { MOCK_PERFORMANCE_DATA } from "@/lib/api/performance-mock"
import { ApiClientError } from "@/lib/api/client"
import { ProjectAnalytics } from "@/components/dashboard/project-analytics"

const ACCOUNT_API_ERROR_MESSAGE =
  "Your account is not showing any statistics due to technical issue. Contact support team to solve it."

const DAILY_DRAWDOWN_LIMIT = 5
const OVERALL_DRAWDOWN_LIMIT = 10
const PROFIT_TARGET_PERCENT = 8
const CONSISTENCY_REQUIRED_PCT = 50
const MIN_TRADING_DAYS_REQUIRED = 5

function getAccountStatusLabel(order: Order | null): string {
  if (!order) return "—"
  if (order.status === "Pending") return "Pending"
  if (order.live_credentials) return "Live"
  if (order.stage2_credentials) return "Stage 2"
  if (order.credentials) return "Phase 1"
  return order.status || "Active"
}

function getAccountStatusVariant(status: string): string {
  if (status === "Pending") return "bg-muted text-muted-foreground border-border"
  if (status === "Live") return "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
  if (status === "Stage 2") return "bg-primary/15 text-primary border-primary/20"
  if (status === "Phase 1") return "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
  return "bg-muted/80 text-foreground border-border"
}

function formatTradeDuration(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return "—"
  const s = Math.round(sec)
  if (s < 60) return `${s}s`
  const m = Math.floor(s / 60)
  const secRem = s % 60
  if (m < 60) return secRem ? `${m}m ${secRem}s` : `${m}m`
  const h = Math.floor(m / 60)
  const minRem = m % 60
  return minRem ? `${h}h ${minRem}m` : `${h}h`
}

function CredentialBlock({
  title,
  creds,
  prefix,
}: {
  title: string
  creds: OrderCredentials
  prefix: string
}) {
  const [copied, setCopied] = useState<string | null>(null)
  const copy = (label: string, value: string) => {
    navigator.clipboard.writeText(value)
    setCopied(label)
    setTimeout(() => setCopied(null), 1500)
  }
  const fields: { label: string; value: string }[] = [
    { label: "Server", value: creds.server },
    { label: "Login", value: String(creds.platform_login) },
    { label: "Password", value: creds.platform_password },
  ]
  if (creds.profit_target != null) {
    fields.push({ label: "Profit target", value: String(creds.profit_target) })
  }
  if (creds.session_id != null && String(creds.session_id) !== "") {
    fields.push({ label: "Session ID", value: String(creds.session_id) })
  }
  if (creds.terminal_id != null) {
    fields.push({ label: "Terminal ID", value: String(creds.terminal_id) })
  }
  return (
    <Card className="p-4 md:p-5 bg-card/80 border border-border/80 shadow-sm rounded-xl min-w-0">
      <h3 className="text-sm font-semibold text-foreground tracking-tight mb-3">{title}</h3>
      <div className="space-y-3">
        {fields.map(({ label, value }) => (
          <div key={label} className="flex items-center justify-between gap-3 py-1.5">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
            <div className="flex items-center gap-2">
              <code className="text-xs font-mono bg-muted/80 px-2.5 py-1.5 rounded-md truncate max-w-[160px] border border-border/50">
                {value}
              </code>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 rounded-lg hover:bg-muted"
                onClick={() => copy(`${prefix}-${label}`, value)}
              >
                {copied === `${prefix}-${label}` ? (
                  <Check className="h-4 w-4 text-emerald-600" />
                ) : (
                  <Copy className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

function CredentialsSection({ order }: { order: Order | null }) {
  const hasCompleted = order?.credentials || order?.live_credentials
  const hasStage2 = !!order?.stage2_credentials
  if (!hasCompleted && !hasStage2) return null
  return (
    <div className="space-y-3 md:space-y-4 min-w-0">
      {hasCompleted && (
        <CredentialBlock
          title={order!.live_credentials ? "Live account" : "Phase 1 / Completed"}
          creds={(order!.credentials ?? order!.live_credentials)!}
          prefix="completed"
        />
      )}
      {hasStage2 && (
          <CredentialBlock
            title="Stage 2"
            creds={order!.stage2_credentials!}
            prefix="stage2"
          />
      )}
    </div>
  )
}

// Semi-circular gauge — professional style
function Gauge({
  value,
  label,
  format = "percent",
  color = "hsl(var(--primary))",
}: {
  value: number
  label: string
  format?: "percent" | "number"
  color?: string
}) {
  const pct = format === "percent" ? Math.min(100, Math.max(0, value)) : Math.min(100, (value / (value > 2 ? 4 : 2)) * 50)
  const display = format === "percent" ? `${Number(value).toFixed(2)}%` : String(Number(value).toFixed(1))
  const circumference = Math.PI * 45
  const strokeDashoffset = circumference - (pct / 100) * circumference
  return (
    <div className="flex flex-col items-center p-3 rounded-xl bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors duration-200">
      <div className="relative w-24 h-14 overflow-hidden">
        <svg viewBox="0 0 100 55" className="w-full h-full" aria-hidden>
          <path
            d="M 12 48 A 38 38 0 0 1 88 48"
            fill="none"
            stroke="currentColor"
            strokeWidth="10"
            className="text-muted/20"
          />
          <path
            d="M 12 48 A 38 38 0 0 1 88 48"
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out drop-shadow-sm"
          />
        </svg>
        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 text-sm font-bold tabular-nums tracking-tight text-foreground">
          {display}
                </span>
      </div>
      <p className="text-[11px] font-medium text-muted-foreground mt-2 uppercase tracking-wider">{label}</p>
    </div>
  )
}

// Consistency & daily stats from daily_performance
function useConsistencyStats(perf: PerformanceResponse | null) {
  return useMemo(() => {
    const daily = perf?.statistics?.equity_curve?.daily_performance ?? []
    if (daily.length === 0) {
      return { profitableDays: 0, totalDays: 0, dayWinPct: 0, highestProfitableDay: 0, consistencyPct: 0 }
    }
    let profitableDays = 0
    let prevCumulative = 0
    let highestDayProfit = 0
    for (const d of daily) {
      const cum = d.cumulative_profit ?? d.cumulative_equity ?? 0
      const dayProfit = cum - prevCumulative
      if (dayProfit > 0) {
        profitableDays++
        highestDayProfit = Math.max(highestDayProfit, dayProfit)
      }
      prevCumulative = cum
    }
    const totalDays = daily.length
    const dayWinPct = totalDays > 0 ? (profitableDays / totalDays) * 100 : 0
    const consistencyPct = totalDays > 0 ? (profitableDays / totalDays) * 100 : 0
    return {
      profitableDays,
      totalDays,
      dayWinPct,
      highestProfitableDay: highestDayProfit,
      consistencyPct,
    }
  }, [perf])
}

export default function PerformancePage() {
  const params = useParams()
  const router = useRouter()
  const orderIdFromUrl = (params["order-id"] as string) || ""
  const decodedOrderId = orderIdFromUrl ? decodeURIComponent(orderIdFromUrl) : ""

  const [selectedOrderId, setSelectedOrderId] = useState(decodedOrderId)
  const [orders, setOrders] = useState<Order[]>([])
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null)
  const [perf, setPerf] = useState<PerformanceResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCredentials, setShowCredentials] = useState(false)

  useEffect(() => {
    if (decodedOrderId) setSelectedOrderId(decodedOrderId)
  }, [decodedOrderId])

  useEffect(() => {
    let cancelled = false
    getMyAccount()
      .then((res) => { if (!cancelled) { setOrders(res.orders ?? []); setError(null) } })
      .catch((e) => {
        if (cancelled) return
        setOrders([])
        setLoading(false)
        const is401or404 = e instanceof ApiClientError && (e.status === 401 || e.status === 404)
        setError(is401or404 ? ACCOUNT_API_ERROR_MESSAGE : e instanceof Error ? e.message : "Failed to load")
      })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (!selectedOrderId || orders.length === 0) {
      setCurrentOrder(null)
      setPerf(null)
      setLoading(false)
      return
    }
    const order = orders.find((o) => o.order_id === selectedOrderId) || null
    setCurrentOrder(order)
    const creds = order?.credentials ?? order?.stage2_credentials ?? order?.live_credentials
    const platform = (order?.platform ?? "mt5").toLowerCase()
    const login = creds?.platform_login
    if (!login) {
      setPerf(MOCK_PERFORMANCE_DATA)
      setError(null)
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)
    getShowMyTradesStats(platform, String(login))
      .then((data) => { if (!cancelled) { setPerf(data); setError(null) } })
      .catch((e) => {
        if (!cancelled) return
        const status = e && typeof e === "object" && "status" in e ? (e as { status: number }).status : 0
        const is401or404 = status === 401 || status === 404
        setPerf(MOCK_PERFORMANCE_DATA)
        setError(
          is401or404
            ? "Your performance will show within 12 hours. If still not showing then contact support team."
            : e instanceof Error ? e.message : "Failed to load performance"
        )
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [selectedOrderId, orders])

  const handleOrderChange = (id: string) => {
    setSelectedOrderId(id)
    if (id) router.push(`/dashboard/performance/${encodeURIComponent(id)}`)
  }

  const creds: OrderCredentials | null =
    currentOrder?.credentials ||
    currentOrder?.stage2_credentials ||
    currentOrder?.live_credentials ||
    (perf?.account_info
      ? {
          credential_id: 0,
          server: perf.account_info.server,
          platform_login: perf.account_info.account_number,
          platform_password: "••••••••",
        }
      : null)

  const stats = perf?.statistics?.account_stats
  const accountInfo = perf?.account_info
  const adv = perf?.statistics?.advanced_statistics
  const dailyPerf = perf?.statistics?.equity_curve?.daily_performance || []
  const consistency = useConsistencyStats(perf)

  const initialBalance = stats?.total_deposits ?? (accountInfo?.balance ? 50000 : 50000)
  const profitTargetAmount = creds?.profit_target != null ? Number(creds.profit_target) : (initialBalance * PROFIT_TARGET_PERCENT) / 100
  const equityPassLevel = initialBalance + profitTargetAmount
  const maxDrawdownAmount = (initialBalance * OVERALL_DRAWDOWN_LIMIT) / 100
  const equityBreachLevel = initialBalance - maxDrawdownAmount

  const profitPct = profitTargetAmount > 0 ? Math.min(100, ((stats?.profit ?? 0) / profitTargetAmount) * 100) : 0
  const drawdownUsed = Math.abs(stats?.drawdown_percent ?? 0)
  const drawdownPct = (drawdownUsed / OVERALL_DRAWDOWN_LIMIT) * 100

  const trades =
    perf?.statistics?.advanced_statistics?.charts?.recent_trades_duration ??
    perf?.statistics?.advanced_statistics?.recent_trades_duration ??
    []

  const winRate = adv?.win_rate ?? 0
  const profitFactor = adv?.profit_factor ?? 0
  const winLossRatio = profitFactor >= 1 ? Math.min(2, profitFactor) : profitFactor

  const currentDrawdownAmount = stats?.drawdown_percent != null ? (initialBalance * Math.abs(stats.drawdown_percent)) / 100 : 0
  const dailyDrawdownCurrent = dailyPerf.length ? Math.abs(dailyPerf.reduce((w, d) => (Math.abs(d.drawdown) > Math.abs(w.drawdown) ? d : w))?.drawdown ?? 0) : 0
  const minTradingDaysOk = consistency.totalDays >= MIN_TRADING_DAYS_REQUIRED
  const consistencyOk = consistency.consistencyPct >= CONSISTENCY_REQUIRED_PCT

  const violationsWithDates = useMemo(() => {
    const list: { type: string; value: string; limit: string; date: string }[] = []
    dailyPerf.forEach((d) => {
      if (Math.abs(d.drawdown) >= DAILY_DRAWDOWN_LIMIT) {
        list.push({
          type: "Daily Drawdown",
          value: `${d.drawdown.toFixed(2)}%`,
          limit: `Max ${DAILY_DRAWDOWN_LIMIT}%`,
          date: d.date,
        })
      }
    })
    if (drawdownUsed >= OVERALL_DRAWDOWN_LIMIT) {
      list.push({
        type: "Overall Drawdown",
        value: stats != null ? `${(stats.drawdown_percent ?? 0).toFixed(2)}%` : "—",
        limit: `Max ${OVERALL_DRAWDOWN_LIMIT}%`,
        date: dailyPerf.length ? dailyPerf[dailyPerf.length - 1]!.date : "Current",
      })
    }
    return list
  }, [dailyPerf, drawdownUsed, stats])

  if (loading && !perf) {
    return (
      <div className="flex min-h-screen bg-background">
        <div className="hidden lg:block">
          <Sidebar />
        </div>
        <main className="min-w-0 flex-1 flex flex-col items-center justify-center gap-4 p-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">Loading performance data…</p>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <main className="min-w-0 flex-1 flex flex-col overflow-x-hidden p-3 sm:p-4 md:p-5 lg:ml-64 pb-8">
        <div className="mx-auto w-full max-w-[1400px] flex flex-col flex-1 min-w-0">
          <Header
            title="View Detail Performance"
            description="Account overview, performance metrics, objectives, and trade history."
            useOrderIdSelect
            selectedOrderId={selectedOrderId}
            onOrderIdChange={handleOrderChange}
            orders={orders}
            actions={
              <div className="flex w-full justify-end gap-2">
                <Button asChild variant="outline" className="h-9 text-sm border-border hover:bg-muted gap-2">
                  <Link href="/dashboard">
                    <BarChart3 className="h-4 w-4" />
                    Back to Dashboard
                  </Link>
                </Button>
                <Button asChild className="h-9 text-sm bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
                  <Link href="/dashboard/buys">
                    <ShoppingCart className="h-4 w-4" />
                    Buy Challenge
                  </Link>
                </Button>
              </div>
            }
          />

          {error && (
            <div
              className={`rounded-xl border px-4 py-3.5 text-sm font-medium ${
                error === ACCOUNT_API_ERROR_MESSAGE || error.includes("within 12 hours")
                  ? "border-primary/30 bg-primary/5 text-foreground"
                  : "border-destructive/40 bg-destructive/10 text-destructive"
              }`}
            >
              {error}
            </div>
          )}

          <div
            className={`mt-5 md:mt-6 space-y-5 flex-1 min-w-0 transition-all duration-300 ${
              error === ACCOUNT_API_ERROR_MESSAGE ? "pointer-events-none select-none blur-sm" : ""
            }`}
          >
            {/* Top: Account summary + Start New Challenge & Credentials */}
            <Card className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm">
              <div className="p-4 sm:p-5 md:p-6">
                <div className="flex flex-col gap-4 sm:gap-5">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 md:gap-6 min-w-0">
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-0.5">Account</p>
                        <h2 className="text-base sm:text-xl font-bold text-foreground tracking-tight break-all">
                          {currentOrder?.order_id ?? (selectedOrderId || "—")}
                        </h2>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Account Status</span>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${getAccountStatusVariant(getAccountStatusLabel(currentOrder))}`}>
                          {getAccountStatusLabel(currentOrder) !== "Pending" && getAccountStatusLabel(currentOrder) !== "—" && (
                            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80 animate-pulse" />
                          )}
                          {getAccountStatusLabel(currentOrder)}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex flex-wrap items-stretch gap-2 sm:gap-3">
                      <div className="flex items-center gap-2.5 px-3 py-2.5 sm:py-2 rounded-lg bg-muted/50 border border-border/50 min-h-[52px] sm:min-h-0">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <Briefcase className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Program</p>
                          <p className="text-sm font-semibold text-foreground tabular-nums">
                            {currentOrder?.challenge_type ?? "STARTER"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2.5 px-3 py-2.5 sm:py-2 rounded-lg bg-muted/50 border border-border/50 min-h-[52px] sm:min-h-0">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <Banknote className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Account Size</p>
                          <p className="text-sm font-semibold text-foreground tabular-nums truncate">
                            ${currentOrder?.account_size ? Number(currentOrder.account_size).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : initialBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2.5 px-3 py-2.5 sm:py-2 rounded-lg bg-muted/50 border border-border/50 min-h-[52px] sm:min-h-0 sm:col-span-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <Calendar className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Trade Period</p>
                          <p className="text-sm font-semibold text-foreground tabular-nums break-words">
                            {currentOrder?.created_at
                              ? new Date(currentOrder.created_at).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" })
                              : "—"}
                            {currentOrder?.completed_at
                              ? ` – ${new Date(currentOrder.completed_at).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" })}`
                              : " – Present"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
                    <Button
                      asChild
                      variant="outline"
                      className="rounded-lg border-border font-medium hover:bg-muted/80 transition-colors min-h-[44px] touch-manipulation"
                    >
                      <Link href="/dashboard/buys" className="flex items-center justify-center">Start New Challenge</Link>
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setShowCredentials((v) => !v)}
                      className="rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 gap-2 font-medium shadow-sm transition-all duration-200 min-h-[44px] touch-manipulation"
                    >
                      <Lock className="h-4 w-4 shrink-0" />
                      Credentials
                      {showCredentials ? <ChevronUp className="h-4 w-4 shrink-0" /> : <ChevronDown className="h-4 w-4 shrink-0" />}
                    </Button>
                  </div>
                </div>
                {showCredentials && (
                  <div className="mt-5 pt-5 border-t border-border/80">
                    <CredentialsSection order={currentOrder} />
                  </div>
                )}
                </div>
              </div>
            </Card>

            {/* Main: Left = Performance + Equity graph, Right = Objectives + Consistency + Rules */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 min-w-0">
              <div className="lg:col-span-2 space-y-4 min-w-0">
                {/* Performance: gauges + Balance, Equity, Profit */}
                <Card className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm min-w-0">
                  <div className="border-b border-border/80 bg-muted/20 px-4 sm:px-5 py-3 sm:py-3.5">
                    <h3 className="text-sm font-semibold text-foreground tracking-tight">Performance</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Key metrics at a glance</p>
                  </div>
                  <div className="p-4 sm:p-5">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                      <Gauge value={winRate} label="Trade win %" color="hsl(262, 83%, 58%)" />
                      <Gauge value={consistency.dayWinPct} label="Day win %" color="hsl(262, 83%, 58%)" />
                      <Gauge value={profitFactor} label="Profit factor" format="number" color="hsl(199, 89%, 48%)" />
                      <Gauge value={winLossRatio} label="Win/Loss ratio" format="number" color="hsl(221, 83%, 53%)" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-border/80">
                      <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          <Wallet className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Balance</p>
                          <p className="text-lg font-bold tabular-nums text-foreground truncate">
                            {accountInfo ? `$${accountInfo.balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "—"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          <TrendingUp className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Equity</p>
                          <p className="text-lg font-bold tabular-nums text-foreground truncate">
                            {accountInfo ? `$${accountInfo.equity.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "—"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          <Target className="h-5 w-5" />
                </div>
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Profit</p>
                          <p className={`text-lg font-bold tabular-nums truncate ${(stats?.profit ?? 0) >= 0 ? "text-foreground" : "text-destructive"}`}>
                            {stats != null ? `$${stats.profit.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "—"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
              </Card>

                {/* Same equity graph as dashboard */}
                <ProjectAnalytics stats={perf} />
              </div>

              {/* Right: Single card — all targets & rules */}
              <div className="space-y-4 min-w-0">
                <Card className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm" id="rules">
                  <div className="border-b border-border/80 bg-muted/20 px-4 py-3">
                    <h3 className="text-sm font-semibold text-foreground tracking-tight">Objectives & Rules</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Targets and how much achieved</p>
                  </div>
                  <div className="p-4 space-y-4">
                    {/* Profit Target */}
                    <div>
                      <div className="flex justify-between items-baseline gap-2 mb-1">
                        <span className="text-xs font-medium text-muted-foreground">Profit Target</span>
                        <span className="text-sm font-bold tabular-nums text-foreground">
                          ${(stats?.profit ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / ${profitTargetAmount.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full bg-emerald-500 transition-all duration-500" style={{ width: `${Math.min(100, Math.max(0, profitPct))}%` }} />
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Equity Pass ${equityPassLevel.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })} · {Math.round(profitPct)}% of target</p>
                    </div>

                    {/* Daily Drawdown */}
                    <div>
                      <div className="flex justify-between items-baseline gap-2 mb-1">
                        <span className="text-xs font-medium text-muted-foreground">Daily Drawdown</span>
                        <span className="text-sm font-bold tabular-nums text-foreground">{dailyDrawdownCurrent.toFixed(2)}% / Max {DAILY_DRAWDOWN_LIMIT}%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${dailyDrawdownCurrent >= DAILY_DRAWDOWN_LIMIT ? "bg-destructive" : "bg-amber-500/80"}`}
                          style={{ width: `${Math.min(100, (dailyDrawdownCurrent / DAILY_DRAWDOWN_LIMIT) * 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Max Drawdown */}
                    <div>
                      <div className="flex justify-between items-baseline gap-2 mb-1">
                        <span className="text-xs font-medium text-muted-foreground">Max Drawdown</span>
                        <span className="text-sm font-bold tabular-nums text-foreground">
                          ${currentDrawdownAmount.toFixed(2)} / ${maxDrawdownAmount.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full bg-destructive/90 transition-all duration-500" style={{ width: `${Math.min(100, drawdownPct)}%` }} />
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Equity Breach ${equityBreachLevel.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                    </div>

                    {/* Minimum trading days */}
                    <div className="flex justify-between items-center gap-2 py-1.5 border-t border-border/50">
                      <span className="text-xs font-medium text-muted-foreground">Minimum Trading Days</span>
                      <span className={`text-sm font-semibold tabular-nums ${minTradingDaysOk ? "text-emerald-600" : "text-foreground"}`}>
                        {consistency.totalDays} of {MIN_TRADING_DAYS_REQUIRED} required
                      </span>
                      {minTradingDaysOk ? <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" /> : null}
                    </div>

                    {/* Weekend holding */}
                    <div className="flex justify-between items-center gap-2 py-1.5 border-t border-border/50">
                      <span className="text-xs font-medium text-muted-foreground">Weekend Holding</span>
                      <span className="text-xs text-muted-foreground">Not allowed</span>
                      <span className="text-sm font-semibold text-emerald-600">Compliant</span>
                    </div>

                    {/* Hedging */}
                    <div className="flex justify-between items-center gap-2 py-1.5 border-t border-border/50">
                      <span className="text-xs font-medium text-muted-foreground">Hedging</span>
                      <span className="text-xs text-muted-foreground">Not allowed</span>
                      <span className="text-sm font-semibold text-emerald-600">Compliant</span>
                    </div>

                    {/* Consistency rule */}
                    <div className="pt-1.5 border-t border-border/50 space-y-1">
                      <div className="flex justify-between items-center gap-2">
                        <span className="text-xs font-medium text-muted-foreground">Consistency Rule</span>
                        <span className={`text-sm font-semibold tabular-nums ${consistencyOk ? "text-emerald-600" : "text-foreground"}`}>
                          {consistency.consistencyPct.toFixed(0)}% (min {CONSISTENCY_REQUIRED_PCT}%)
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground">Profitable days {consistency.profitableDays} of {consistency.totalDays} · Highest day ${consistency.highestProfitableDay.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                    </div>

                    <Button asChild variant="outline" size="sm" className="w-full rounded-lg border-border/80 mt-1">
                      <Link href={`/dashboard/performance/${encodeURIComponent(selectedOrderId)}#violations`}>
                        View Details →
                      </Link>
                    </Button>
                  </div>
                </Card>

                {/* Violations — only when there are any */}
                {violationsWithDates.length > 0 && (
                  <Card className="overflow-hidden rounded-xl border border-destructive/30 bg-destructive/5 shadow-sm" id="violations">
                    <div className="border-b border-destructive/20 bg-destructive/10 px-4 py-3 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
                      <h3 className="text-sm font-semibold text-destructive tracking-tight">Violations</h3>
                    </div>
                    <div className="p-4 space-y-3">
                      {violationsWithDates.map((v, i) => (
                        <div key={`${v.type}-${v.date}-${i}`} className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2.5">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <XCircle className="h-4 w-4 shrink-0 text-destructive" />
                            <div>
                              <p className="text-xs font-semibold text-foreground">{v.type}</p>
                              <p className="text-[10px] text-muted-foreground">{v.limit}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold tabular-nums text-destructive">{v.value}</p>
                            <p className="text-[10px] text-muted-foreground font-medium">
                              {v.date === "Current" ? v.date : new Date(v.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            </p>
                          </div>
                        </div>
                      ))}
              </div>
                  </Card>
                )}
              </div>
            </div>

            {/* Trade History */}
            <Card className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm min-w-0" id="rules">
              <div className="border-b border-border/80 bg-muted/20 px-4 sm:px-5 py-3 sm:py-3.5">
                <h3 className="text-sm font-semibold text-foreground tracking-tight">Trade History</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Recent closed positions</p>
              </div>
              <div className="p-4 sm:p-5 overflow-hidden">
              {trades.length > 0 ? (
                  <div className="overflow-x-auto -mx-1 px-1 rounded-lg border border-border/50 min-w-0" style={{ WebkitOverflowScrolling: "touch" }}>
                  <Table>
                    <TableHeader>
                        <TableRow className="border-b border-border/80 bg-muted/30 hover:bg-muted/30">
                          <TableHead className="font-semibold text-foreground">Symbol</TableHead>
                          <TableHead className="font-semibold text-foreground">Ticket</TableHead>
                          <TableHead className="font-semibold text-foreground">Volume</TableHead>
                          <TableHead className="font-semibold text-foreground">Duration</TableHead>
                          <TableHead className="font-semibold text-foreground">Open Time</TableHead>
                          <TableHead className="font-semibold text-foreground">Close Time</TableHead>
                          <TableHead className="text-right font-semibold text-foreground">Net Profit</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {trades.map((t, idx) => {
                        const rec = t as unknown as Record<string, unknown>
                        const ticket = t.ticket ?? rec.ticket
                        const symbol = t.symbol ?? rec.symbol
                        const volume = t.volume ?? rec.volume
                        const durationSec = typeof t.duration === "number" ? t.duration : rec.duration != null ? Number(rec.duration) : undefined
                        const openTime = t.open_time ?? rec.open_time
                        const closeTime = t.close_time ?? rec.close_time
                        const netProfit = typeof t.net_profit === "number" ? t.net_profit : Number(rec.net_profit) || 0
                        const key = String(ticket ?? idx)
                        return (
                            <TableRow key={key} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                              <TableCell className="font-medium py-3">{symbol != null ? String(symbol) : "—"}</TableCell>
                              <TableCell className="text-muted-foreground tabular-nums py-3">{ticket != null ? String(ticket) : "—"}</TableCell>
                              <TableCell className="tabular-nums py-3">{volume != null ? String(volume) : "—"}</TableCell>
                              <TableCell className="text-muted-foreground tabular-nums whitespace-nowrap py-3">
                              {durationSec != null && Number.isFinite(durationSec) ? formatTradeDuration(durationSec) : "—"}
                            </TableCell>
                              <TableCell className="text-muted-foreground text-xs whitespace-nowrap py-3">
                              {openTime ? new Date(String(openTime)).toLocaleString() : "—"}
                            </TableCell>
                              <TableCell className="text-muted-foreground text-xs whitespace-nowrap py-3">
                              {closeTime ? new Date(String(closeTime)).toLocaleString() : "—"}
                            </TableCell>
                              <TableCell className={`text-right font-semibold tabular-nums py-3 ${netProfit >= 0 ? "text-foreground" : "text-destructive"}`}>
                              ${netProfit.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                  <div className="flex flex-col items-center justify-center py-12 px-4 rounded-lg border border-dashed border-border bg-muted/10">
                    <BarChart3 className="h-12 w-12 text-muted-foreground/50 mb-3" />
                    <p className="text-sm font-medium text-foreground">No trades yet</p>
                    <p className="text-xs text-muted-foreground mt-1">Closed positions will appear here</p>
                  </div>
                )}
              </div>
            </Card>
          </div>

          <div className="mt-8">
            <Footer />
          </div>
        </div>
      </main>
    </div>
  )
}
