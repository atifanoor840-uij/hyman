"use client"

import { useState, useEffect } from "react"
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
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Wallet,
} from "lucide-react"
import { ProjectAnalytics } from "@/components/dashboard/project-analytics"
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

const ACCOUNT_API_ERROR_MESSAGE =
  "Your account is not showing any statistics due to technical issue. Contact support team to solve it."

// Forex market sessions (UTC) - simplified display
const MARKET_SESSIONS = [
  { name: "Sydney", open: "22:00", close: "07:00" },
  { name: "Tokyo", open: "00:00", close: "09:00" },
  { name: "London", open: "08:00", close: "17:00" },
  { name: "New York", open: "13:00", close: "22:00" },
]

function MarketSessionCard() {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])
  const utcHours = now.getUTCHours()
  const utcMinutes = now.getUTCMinutes()
  const utcStr = `${String(utcHours).padStart(2, "0")}:${String(utcMinutes).padStart(2, "0")}`

  return (
    <Card className="p-4 md:p-5 animate-slide-in-up bg-card border-border min-w-0">
      <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
        <Clock className="h-4 w-4" />
        Market Session Time
      </h3>
      <div className="space-y-2">
        <p className="text-lg font-mono font-bold text-foreground tabular-nums">{utcStr} UTC</p>
        <p className="text-xs text-muted-foreground">Server time</p>
        <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
          {MARKET_SESSIONS.map((s) => (
            <div key={s.name} className="bg-muted/50 rounded px-2 py-1.5">
              <span className="font-medium">{s.name}</span>
              <span className="text-muted-foreground block">{s.open} – {s.close} UTC</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
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
    <Card className="p-4 md:p-5 animate-slide-in-up bg-card border-border min-w-0">
      <h3 className="text-sm font-semibold text-foreground mb-3">{title}</h3>
      <div className="space-y-2">
        {fields.map(({ label, value }) => (
          <div key={label} className="flex items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground">{label}</span>
            <div className="flex items-center gap-1">
              <code className="text-xs font-mono bg-muted px-2 py-1 rounded truncate max-w-[140px]">
                {value}
              </code>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0"
                onClick={() => copy(`${prefix}-${label}`, value)}
              >
                {copied === `${prefix}-${label}` ? (
                  <Check className="h-3.5 w-3.5 text-green-600" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

function CredentialsCards({ order }: { order: Order | null }) {
  const [stage2Stats, setStage2Stats] = useState<PerformanceResponse | null>(null)
  const [stage2Loading, setStage2Loading] = useState(false)
  const hasCompleted = order?.credentials || order?.live_credentials
  const hasStage2 = !!order?.stage2_credentials

  useEffect(() => {
    if (!order?.stage2_credentials || !order.platform) {
      setStage2Stats(null)
      return
    }
    let cancelled = false
    setStage2Loading(true)
    setStage2Stats(null)
    getShowMyTradesStats(order.platform, order.stage2_credentials!.platform_login)
      .then((data) => {
        if (!cancelled) setStage2Stats(data)
      })
      .catch(() => {
        if (!cancelled) setStage2Stats(null)
      })
      .finally(() => {
        if (!cancelled) setStage2Loading(false)
      })
    return () => {
      cancelled = true
    }
  }, [order?.order_id, order?.platform, order?.stage2_credentials?.platform_login])

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
        <>
          <CredentialBlock
            title="Stage 2"
            creds={order!.stage2_credentials!}
            prefix="stage2"
          />
          <Card className="p-4 md:p-5 bg-card border-border min-w-0">
            <h3 className="text-sm font-semibold text-foreground mb-3">Stage 2 account stats</h3>
            {stage2Loading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading…
              </div>
            ) : stage2Stats?.account_info ? (
              <div className="grid grid-cols-1 gap-2 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Wallet className="h-4 w-4" /> Balance
                  </span>
                  <span className="font-medium tabular-nums">
                    ${(stage2Stats.account_info.balance ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <TrendingUp className="h-4 w-4" /> Equity
                  </span>
                  <span className="font-medium tabular-nums">
                    ${(stage2Stats.account_info.equity ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">Profit</span>
                  <span
                    className={`font-medium tabular-nums ${
                      (stage2Stats.statistics?.account_stats?.profit ?? 0) >= 0 ? "text-foreground" : "text-destructive"
                    }`}
                  >
                    ${(stage2Stats.statistics?.account_stats?.profit ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">Stats unavailable</p>
            )}
          </Card>
        </>
      )}
    </div>
  )
}

// Typical prop firm limits - can be overridden by order/challenge rules
const DAILY_DRAWDOWN_LIMIT = 5 // %
const OVERALL_DRAWDOWN_LIMIT = 10 // %
const PROFIT_TARGET_PERCENT = 8 // % of initial balance for phase 1

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

function TargetsCard({
  stats,
  dailyPerf,
  profitTarget,
  initialBalance,
}: {
  stats: { profit?: number; drawdown_percent?: number } | null
  dailyPerf: { date: string; drawdown: number }[]
  profitTarget?: number
  initialBalance?: number
}) {
  const balance = initialBalance ?? stats ? 50000 : 0
  const target = profitTarget ?? (balance * PROFIT_TARGET_PERCENT) / 100
  const profit = stats?.profit ?? 0
  const profitAchieved = Math.max(0, profit)
  const profitPct = target > 0 ? Math.min(100, (profitAchieved / target) * 100) : 0
  const profitOk = profit >= target

  const worstDaily = dailyPerf.length
    ? dailyPerf.reduce((worst, d) => (Math.abs(d.drawdown) > Math.abs(worst.drawdown) ? d : worst))
    : null
  const dailyDrawdownUsed = worstDaily ? Math.abs(worstDaily.drawdown) : 0
  const dailyPct = (dailyDrawdownUsed / DAILY_DRAWDOWN_LIMIT) * 100
  const dailyAtRisk = dailyPct >= 100

  const overallDrawdown = Math.abs(stats?.drawdown_percent ?? 0)
  const overallPct = (overallDrawdown / OVERALL_DRAWDOWN_LIMIT) * 100
  const overallAtRisk = overallPct >= 100

  const targetRows = [
    {
      key: "profit",
      label: "Profit Target",
      icon: TrendingUp,
      current: `$${profit.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      limit: `$${target.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
      pct: profitPct,
      ok: profitOk,
      atRisk: false,
      variant: "profit" as const,
    },
    {
      key: "daily",
      label: "Daily Drawdown",
      icon: Clock,
      current: worstDaily ? `${worstDaily.drawdown.toFixed(2)}%` : "—",
      limit: `${DAILY_DRAWDOWN_LIMIT}%`,
      pct: Math.min(100, dailyPct),
      ok: dailyPct < 80,
      atRisk: dailyAtRisk,
      variant: "drawdown" as const,
    },
    {
      key: "overall",
      label: "Overall Drawdown",
      icon: ArrowDownRight,
      current: stats != null ? `${(stats.drawdown_percent ?? 0).toFixed(2)}%` : "—",
      limit: `${OVERALL_DRAWDOWN_LIMIT}%`,
      pct: Math.min(100, overallPct),
      ok: overallPct < 80,
      atRisk: overallAtRisk,
      variant: "drawdown" as const,
    },
  ]

  return (
    <Card className="overflow-hidden animate-slide-in-up bg-card border-border min-w-0 ring-1 ring-border/50 shadow-sm">
      {/* Header */}
      <div className="border-b border-border/80 bg-muted/30 px-4 py-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Target className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold tracking-tight text-foreground">Challenge Targets</h3>
              <p className="text-xs text-muted-foreground">Progress toward your challenge objectives</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {targetRows.map((row) => {
          const Icon = row.icon
          const isProfit = row.variant === "profit"
          const barColor = row.atRisk
            ? "bg-destructive"
            : isProfit
              ? row.ok
                ? "bg-emerald-500"
                : "bg-primary"
              : row.pct >= 80
                ? "bg-amber-500"
                : "bg-emerald-500/90"

          return (
            <div
              key={row.key}
              className="rounded-lg border border-border/60 bg-muted/20 p-3 transition-colors hover:bg-muted/30"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${isProfit ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" : "bg-amber-500/15 text-amber-600 dark:text-amber-400"}`}>
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">{row.label}</span>
                </div>
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold tabular-nums uppercase tracking-wide ${
                    row.atRisk
                      ? "bg-destructive/15 text-destructive"
                      : row.ok
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                        : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                  }`}
                >
                  {row.atRisk ? "Limit reached" : row.ok ? "On track" : "In progress"}
                </span>
              </div>
              <div className="flex items-baseline justify-between gap-2 text-sm mb-2">
                <span className="font-semibold tabular-nums text-foreground">{row.current}</span>
                <span className="text-xs text-muted-foreground tabular-nums">Limit: {row.limit}</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ease-out ${barColor}`}
                  style={{ width: `${row.pct}%` }}
                />
              </div>
              <div className="mt-1.5 flex justify-end">
                <span className="text-[10px] font-medium tabular-nums text-muted-foreground">
                  {isProfit ? `${Math.round(row.pct)}% of target` : `${Math.round(row.pct)}% of limit used`}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

function ViolationsCard({
  stats,
  dailyPerf,
}: {
  stats: { drawdown_percent?: number; drawdown_on_balance_percent?: number } | null
  dailyPerf: { date: string; drawdown: number }[];
}) {
  const overallDrawdown = Math.abs(stats?.drawdown_percent ?? 0)
  const overallHit = overallDrawdown >= OVERALL_DRAWDOWN_LIMIT

  const dailyViolations = dailyPerf.filter((d) => Math.abs(d.drawdown) >= DAILY_DRAWDOWN_LIMIT)
  const dailyHit = dailyViolations.length > 0
  const worstDaily = dailyPerf.length
    ? dailyPerf.reduce((worst, d) => (Math.abs(d.drawdown) > Math.abs(worst.drawdown) ? d : worst))
    : null

  const violations = [
    {
      label: "Daily Drawdown",
      limit: `${DAILY_DRAWDOWN_LIMIT}%`,
      hit: dailyHit,
      value: worstDaily ? `${worstDaily.drawdown.toFixed(2)}%` : "—",
      date: worstDaily?.date,
    },
    {
      label: "Overall Drawdown",
      limit: `${OVERALL_DRAWDOWN_LIMIT}%`,
      hit: overallHit,
      value: stats != null ? `${(stats.drawdown_percent ?? 0).toFixed(2)}%` : "—",
    },
  ]

  const hasViolation = dailyHit || overallHit

  return (
    <Card className="p-4 md:p-5 animate-slide-in-up bg-card border-border min-w-0">
      <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
        <AlertTriangle className={`h-4 w-4 ${hasViolation ? "text-destructive" : "text-muted-foreground"}`} />
        Rule Violations
      </h3>
      <div className="space-y-2">
        {violations.map((v) => (
          <div
            key={v.label}
            className={`flex items-center justify-between gap-2 rounded-lg px-2.5 py-2 ${
              v.hit ? "bg-destructive/10 border border-destructive/30" : "bg-muted/50"
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              {v.hit ? (
                <XCircle className="h-4 w-4 shrink-0 text-destructive" />
              ) : (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />
              )}
              <div>
                <p className="text-xs font-medium text-foreground">{v.label}</p>
                <p className="text-[10px] text-muted-foreground">Max {v.limit}</p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className={`text-xs font-bold tabular-nums ${v.hit ? "text-destructive" : "text-foreground"}`}>
                {v.value}
              </p>
              {v.date && (
                <p className="text-[10px] text-muted-foreground">{v.date}</p>
              )}
            </div>
          </div>
        ))}
      </div>
      {hasViolation && (
        <p className="text-[10px] text-destructive mt-2 font-medium">
          Rule limit exceeded. Review challenge terms.
        </p>
      )}
    </Card>
  )
}

export default function PerformancePage() {
  const params = useParams()
  const router = useRouter()
  // Support order IDs with # (e.g. Genz#11261783) – segment may be encoded as Genz%2311261783
  const orderIdFromUrl = (params["order-id"] as string) || ""
  const decodedOrderId = orderIdFromUrl ? decodeURIComponent(orderIdFromUrl) : ""

  const [selectedOrderId, setSelectedOrderId] = useState(decodedOrderId)
  const [orders, setOrders] = useState<Order[]>([])
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null)
  const [perf, setPerf] = useState<PerformanceResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Sync selected order from URL when navigating (e.g. back/forward)
  useEffect(() => {
    if (decodedOrderId) setSelectedOrderId(decodedOrderId)
  }, [decodedOrderId])

  // Fetch orders once; on 401/404 show technical issue message and blur
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
        if (cancelled) return
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

  // When user changes order in dropdown, update URL with encoded order ID (so # works in path)
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
  const dailyPerf = perf?.statistics?.equity_curve?.daily_performance || []
  // Trade history: backend nests it under advanced_statistics.charts.recent_trades_duration
  const trades =
    perf?.statistics?.advanced_statistics?.charts?.recent_trades_duration ??
    perf?.statistics?.advanced_statistics?.recent_trades_duration ??
    []

  if (loading && !perf) {
    return (
      <div className="flex min-h-screen bg-background">
        <div className="hidden lg:block">
          <Sidebar />
        </div>
        <main className="min-w-0 flex-1 flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <main className="min-w-0 flex-1 flex flex-col overflow-x-hidden p-3 md:p-4 lg:p-5 lg:ml-64">
        <div className="mx-auto w-full max-w-[1400px] flex flex-col flex-1">
          <Header
            title="Performance Details"
            description="Balance, equity, profit, drawdown, and trade history for your account."
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
                  <Link href="/buys">
                    <ShoppingCart className="h-4 w-4" />
                    Buy Challenge
                  </Link>
                </Button>
              </div>
            }
          />

          {error && (
            <div
              className={`rounded-lg border px-4 py-3 text-sm ${
                error === ACCOUNT_API_ERROR_MESSAGE || error.includes("within 12 hours")
                  ? "border-primary/30 bg-primary/5 text-foreground"
                  : "border-destructive/50 bg-destructive/10 text-destructive"
              }`}
            >
              {error}
            </div>
          )}

          <div
            className={`mt-4 md:mt-5 space-y-3 md:space-y-4 flex-1 min-w-0 transition-all duration-300 ${
              error === ACCOUNT_API_ERROR_MESSAGE ? "pointer-events-none select-none blur-sm" : ""
            }`}
          >
            {/* Stats cards: Balance, Equity, Profit, Daily Drawdown */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 md:gap-3 min-w-0">
              <Card className="min-h-[88px] p-3 md:p-4 flex flex-col gap-2 justify-center bg-card border-primary/40 ring-1 ring-primary/20 border-border">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <Banknote className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <span className="text-xs text-muted-foreground font-medium">Balance</span>
                </div>
                <p className="text-sm sm:text-base font-bold text-foreground tabular-nums">
                  {accountInfo
                    ? `$${accountInfo.balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                    : "—"}
                </p>
              </Card>
              <Card className="min-h-[88px] p-3 md:p-4 flex flex-col gap-2 justify-center bg-card border-border">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <TrendingUp className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <span className="text-xs text-muted-foreground font-medium">Equity</span>
                </div>
                <p className="text-sm sm:text-base font-bold text-foreground tabular-nums">
                  {accountInfo
                    ? `$${accountInfo.equity.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                    : "—"}
                </p>
              </Card>
              <Card className="min-h-[88px] p-3 md:p-4 flex flex-col gap-2 justify-center bg-card border-border">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <Target className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <span className="text-xs text-muted-foreground font-medium">Profit</span>
                </div>
                <p
                  className={`text-sm sm:text-base font-bold tabular-nums ${
                    (stats?.profit ?? 0) >= 0 ? "text-foreground" : "text-destructive"
                  }`}
                >
                  {stats != null
                    ? `$${stats.profit.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                    : "—"}
                </p>
              </Card>
              <Card className="min-h-[88px] p-3 md:p-4 flex flex-col gap-2 justify-center bg-card border-border">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <ArrowDownRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <span className="text-xs text-muted-foreground font-medium">Daily Drawdown</span>
                </div>
                <p className="text-sm sm:text-base font-bold text-destructive tabular-nums">
                  {stats != null
                    ? `${(stats.drawdown_percent ?? 0).toFixed(2)}%`
                    : "—"}
                </p>
              </Card>
            </div>

            {/* Graph (Equity / Profit / Draw Down) + Credentials + Market session — same as dashboard */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-4 min-w-0">
              <div className="lg:col-span-2 min-w-0">
                <ProjectAnalytics stats={perf} />
              </div>
              <div className="space-y-3 md:space-y-4 min-w-0">
                <CredentialsCards order={currentOrder} />
                <MarketSessionCard />
              </div>
            </div>

            {/* Targets & Violations - below graphs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 min-w-0">
              <TargetsCard
                stats={stats ?? null}
                dailyPerf={dailyPerf}
                profitTarget={creds?.profit_target ? Number(creds.profit_target) : undefined}
                initialBalance={stats?.total_deposits ?? 50000}
              />
              <ViolationsCard stats={stats ?? null} dailyPerf={dailyPerf} />
            </div>

            {/* Trade history — as returned by backend (recent_trades_duration) */}
            <Card className="p-4 md:p-5 animate-slide-in-up bg-card border-border min-w-0 overflow-hidden">
              <h3 className="text-sm font-semibold text-foreground mb-4">Trade History</h3>
              {trades.length > 0 ? (
                <div className="overflow-x-auto -mx-2">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Symbol</TableHead>
                        <TableHead>Ticket</TableHead>
                        <TableHead>Volume</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Open Time</TableHead>
                        <TableHead>Close Time</TableHead>
                        <TableHead className="text-right">Net Profit</TableHead>
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
                          <TableRow key={key}>
                            <TableCell className="font-medium">{symbol != null ? String(symbol) : "—"}</TableCell>
                            <TableCell className="text-muted-foreground tabular-nums">{ticket != null ? String(ticket) : "—"}</TableCell>
                            <TableCell className="tabular-nums">{volume != null ? String(volume) : "—"}</TableCell>
                            <TableCell className="text-muted-foreground tabular-nums whitespace-nowrap">
                              {durationSec != null && Number.isFinite(durationSec) ? formatTradeDuration(durationSec) : "—"}
                            </TableCell>
                            <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                              {openTime ? new Date(String(openTime)).toLocaleString() : "—"}
                            </TableCell>
                            <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                              {closeTime ? new Date(String(closeTime)).toLocaleString() : "—"}
                            </TableCell>
                            <TableCell
                              className={`text-right font-medium tabular-nums ${
                                netProfit >= 0 ? "text-foreground" : "text-destructive"
                              }`}
                            >
                              ${netProfit.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No trades yet</p>
              )}
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