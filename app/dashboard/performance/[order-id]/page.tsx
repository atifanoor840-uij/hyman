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
  BarChart2,
  ShoppingCart,
  Loader2,
  Wallet,
  Briefcase,
  Calendar,
  CalendarDays,
  Activity,
  Lock,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Mail,
} from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { getMyAccount, type Order, type OrderCredentials } from "@/lib/api/auth"
import { type PerformanceResponse } from "@/lib/api/performance"
import { getShowMyTradesStats } from "@/lib/api/showmytrades"
import { MOCK_PERFORMANCE_DATA } from "@/lib/api/performance-mock"
import { ApiClientError } from "@/lib/api/client"
import { getAccountRules } from "@/lib/rules-config"
import { ProjectAnalytics } from "@/components/dashboard/project-analytics"

const ACCOUNT_API_ERROR_MESSAGE =
  "Your account is not showing any statistics due to technical issue. Contact support team to solve it."

const DAILY_DRAWDOWN_LIMIT = 5
const OVERALL_DRAWDOWN_LIMIT = 10
const PROFIT_TARGET_PERCENT = 8
const MIN_TRADING_DAYS_REQUIRED = 5

function DayResetCountdown() {
  const [times, setTimes] = useState(() => getDayResetTimes())
  useEffect(() => {
    const t = setInterval(() => setTimes(getDayResetTimes()), 1000)
    return () => clearInterval(t)
  }, [])
  const circumference = 2 * Math.PI * 45
  const strokeDashoffset = circumference - (times.progress / 100) * circumference
  return (
    <Card className="overflow-hidden rounded-full border border-border/80 bg-card shadow-sm mt-4 w-44 h-44 flex items-center justify-center relative shrink-0">
      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="4" className="text-muted/30" />
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          className="text-foreground/80"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: "stroke-dashoffset 1s linear" }}
        />
      </svg>
      <div className="relative flex flex-col items-center justify-center gap-0.5 text-center">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Elapsed Time</span>
        <span className="text-sm font-medium text-foreground tabular-nums">{formatHMS(times.elapsed)}</span>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mt-0.5">Day Reset In</span>
        <span className="text-xl font-bold text-foreground tabular-nums">{formatHMS(times.remaining)}</span>
      </div>
    </Card>
  )
}

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

function formatHMS(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds % 60))
  const m = Math.max(0, Math.floor((seconds / 60) % 60))
  const h = Math.max(0, Math.floor(seconds / 3600))
  return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
}

function getDayResetTimes(): { elapsed: number; remaining: number; progress: number } {
  const now = new Date()
  const midnight = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  const elapsedSec = (now.getTime() - midnight.getTime()) / 1000
  const totalSec = 86400
  const remainingSec = Math.max(0, totalSec - elapsedSec)
  const progress = (elapsedSec / totalSec) * 100
  return { elapsed: elapsedSec, remaining: remainingSec, progress }
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

// Semi-circular gauge with needle and 0/max labels (dashboard style like reference image)
function Gauge({
  value,
  max,
  label,
  maxLabel,
  displayValue,
  color = "hsl(var(--primary))",
}: {
  value: number
  max: number
  label: string
  maxLabel?: string
  displayValue?: string
  color?: string
}) {
  const clamped = Math.min(max, Math.max(0, value))
  const pct = max > 0 ? (clamped / max) * 100 : 0
  const angleDeg = 180 * (1 - pct / 100)
  const angleRad = (angleDeg * Math.PI) / 180
  const cx = 60
  const cy = 52
  const r = 42
  const needleLength = 36
  const needleX = cx + needleLength * Math.cos(angleRad)
  const needleY = cy - needleLength * Math.sin(angleRad)
  const circumference = Math.PI * r
  const strokeDashoffset = circumference - (pct / 100) * circumference

  return (
    <div className="flex flex-col items-center p-3 rounded-xl bg-muted/20 border border-border/50 hover:bg-muted/40 transition-colors duration-200">
      <p className="text-xs font-bold text-foreground mb-1 w-full text-center truncate">{label}</p>
      <div className="relative w-full max-w-[120px] aspect-[120/72]">
        <svg viewBox="0 0 120 72" className="w-full h-full" aria-hidden>
          <path
            d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-muted/25"
            strokeLinecap="round"
          />
          <path
            d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
          <line
            x1={cx}
            y1={cy}
            x2={needleX}
            y2={needleY}
            stroke="#1f2937"
            strokeWidth="2.5"
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
          <circle cx={cx} cy={cy} r="4" fill="#1f2937" />
        </svg>
        <span className="absolute bottom-0 left-0 text-[9px] font-medium text-muted-foreground">0</span>
        <span className="absolute bottom-0 right-0 text-[9px] font-medium text-muted-foreground">{maxLabel ?? String(max)}</span>
      </div>
      <p className="text-sm font-bold tabular-nums text-foreground mt-1">
        {displayValue ?? clamped.toFixed(1)}
      </p>
    </div>
  )
}

// Circular consistency achievement gauge (dark ring, green fill, center %)
function ConsistencyCircleGauge({
  achievedPct,
  maxDayPct,
  limitPct,
  periodLabel = "Period: Last 30 days",
}: {
  achievedPct: number
  maxDayPct: number
  limitPct: number
  periodLabel?: string
}) {
  const isOverLimit = maxDayPct >= limitPct
  // Ring fill: when over limit show exact max day % (capped at 100% for display); when under show achieved %
  const displayPct = isOverLimit
    ? Math.min(100, (maxDayPct / limitPct) * 100)
    : Math.min(100, Math.max(0, achievedPct))
  const circumference = 2 * Math.PI * 42
  const strokeDashoffset = circumference - (displayPct / 100) * circumference
  return (
    <div className="rounded-xl border-2 border-primary/30 bg-primary/5 p-4 flex flex-col items-center">
      <p className="text-xs font-semibold text-foreground mb-1 w-full">Consistency Rule</p>
      <p className="text-[10px] text-muted-foreground mb-3 w-full">{periodLabel}</p>
      <div className="relative w-36 h-36">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          {/* Dark outer ring (track) */}
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke="currentColor"
            strokeWidth="10"
            className="text-muted-foreground/40"
          />
          {/* Progress arc: green when under limit, red when over (shows exact result) */}
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke={isOverLimit ? "hsl(var(--destructive))" : "#22c55e"}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-700 ease-out"
          />
          {/* Inner radial segments (gear-like) */}
          {Array.from({ length: 12 }).map((_, i) => {
            const a = (i * 30 * Math.PI) / 180
            const x1 = 50 + 28 * Math.cos(a)
            const y1 = 50 + 28 * Math.sin(a)
            const x2 = 50 + 35 * Math.cos(a)
            const y2 = 50 + 35 * Math.sin(a)
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="currentColor"
                strokeWidth="1.5"
                className="text-muted-foreground/30"
              />
            )
          })}
          {/* Inner circle fill */}
          <circle cx="50" cy="50" r="26" className="fill-muted/20" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {isOverLimit ? (
            <>
              <span className="text-2xl font-bold tabular-nums text-destructive">
                {maxDayPct.toFixed(1)}%
              </span>
              <span className="text-[10px] text-muted-foreground mt-0.5">max day (limit {limitPct}%)</span>
            </>
          ) : (
            <>
              <span className="text-2xl font-bold tabular-nums text-emerald-500">
                {Math.round(Math.min(100, Math.max(0, achievedPct)))}%
              </span>
              <span className="text-[10px] text-muted-foreground mt-0.5">achieved</span>
            </>
          )}
        </div>
      </div>
      <p className="text-[10px] text-muted-foreground mt-2 text-center">
        Max single day: {maxDayPct.toFixed(1)}% (limit {limitPct}%)
      </p>
    </div>
  )
}

// Horizontal rule bar for compliance card (graph-style)
function RuleBar({
  label,
  description,
  valuePct,
  limitPct,
  status,
  valueLabel,
}: {
  label: string
  description: string
  valuePct?: number
  limitPct?: number
  status?: "allowed" | "not-allowed" | "compliant" | "flagged"
  valueLabel?: string
}) {
  const isOk = status === "allowed" || status === "compliant"
  const isBad = status === "flagged" || status === "not-allowed"
  const pct = valuePct ?? 0
  const limit = limitPct ?? 100
  const showBar = valuePct != null && limitPct != null
  return (
    <div className="rounded-lg border border-border/50 bg-muted/20 p-3 space-y-1.5">
      <div className="flex justify-between items-start gap-2">
        <p className="text-xs font-semibold text-foreground">{label}</p>
        {valueLabel != null && (
          <span className={`text-xs font-bold tabular-nums shrink-0 ${isBad ? "text-destructive" : isOk ? "text-emerald-600" : "text-foreground"}`}>
            {valueLabel}
          </span>
        )}
      </div>
      <p className="text-[10px] text-muted-foreground leading-snug">{description}</p>
      {showBar && (
        <div className="space-y-0.5">
          <div className="h-2 w-full rounded-full bg-muted/50 overflow-hidden relative">
            {limit > 0 && limit < 100 && (() => {
              const maxVal = Math.max(limit, pct, 1)
              const fillPct = (pct / maxVal) * 100
              const limitLinePct = (limit / maxVal) * 100
              return (
                <>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${fillPct}%`,
                      backgroundColor: pct > limit ? "hsl(var(--destructive))" : "hsl(var(--primary))",
                    }}
                  />
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-foreground/50"
                    style={{ left: `${limitLinePct}%` }}
                  />
                </>
              )
            })()}
            {limit >= 100 && (
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, (pct / Math.max(limit, 1)) * 100)}%`,
                  backgroundColor: pct > limit ? "hsl(var(--destructive))" : "hsl(var(--primary))",
                }}
              />
            )}
          </div>
          <p className="text-[9px] text-muted-foreground">Limit: {limit}%</p>
        </div>
      )}
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
  const [tradesPage, setTradesPage] = useState(1)
  const [complianceDetailsOpen, setComplianceDetailsOpen] = useState<"minHolding" | "layering" | "weekend" | null>(null)

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
  const accountRules = getAccountRules(currentOrder?.challenge_type)
  const dailyDrawdownLimit = parseInt(accountRules.dailyDrawdown, 10) || DAILY_DRAWDOWN_LIMIT
  const maxDrawdownLimit = parseInt(accountRules.maxDrawdown, 10) || OVERALL_DRAWDOWN_LIMIT
  const minTradingDaysRequired = accountRules.minTradingDays > 0 ? accountRules.minTradingDays : MIN_TRADING_DAYS_REQUIRED

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

  useEffect(() => {
    setTradesPage(1)
  }, [selectedOrderId, trades.length])

  const TRADES_PER_PAGE = 10
  const paginatedTrades = trades.slice((tradesPage - 1) * TRADES_PER_PAGE, tradesPage * TRADES_PER_PAGE)
  const hasNextPage = trades.length > tradesPage * TRADES_PER_PAGE
  const hasPrevPage = tradesPage > 1

  const complianceMetrics = useMemo(() => {
    const MIN_HOLDING_SEC = 150
    type TradeRow = { duration?: number; open_time?: string; close_time?: string; symbol?: string; ticket?: string }
    const tradeList = trades as TradeRow[]
    const minHoldingViolations: { ticket: string; symbol: string; open_time: string; duration: number }[] = []
    tradeList.forEach((t) => {
      const dur = typeof t.duration === "number" ? t.duration : 0
      if (dur > 0 && dur < MIN_HOLDING_SEC) {
        minHoldingViolations.push({
          ticket: String(t.ticket ?? "—"),
          symbol: String(t.symbol ?? "—"),
          open_time: String(t.open_time ?? ""),
          duration: dur,
        })
      }
    })
    const layeringViolations: { ticket: string; symbol: string; open_time: string }[] = []
    const bySymbol = new Map<string, Array<{ open_time: string; ticket: string; symbol: string }>>()
    tradeList.forEach((t) => {
      const sym = String(t.symbol ?? "")
      if (!sym) return
      if (!bySymbol.has(sym)) bySymbol.set(sym, [])
      bySymbol.get(sym)!.push({
        open_time: String(t.open_time ?? ""),
        ticket: String(t.ticket ?? "—"),
        symbol: sym,
      })
    })
    bySymbol.forEach((arr) => {
      arr.sort((a, b) => new Date(a.open_time).getTime() - new Date(b.open_time).getTime())
      for (let i = 0; i < arr.length; i++) {
        const t0 = new Date(arr[i]!.open_time).getTime()
        const inWindow = arr.filter((x) => {
          const t = new Date(x.open_time).getTime()
          return t >= t0 && t <= t0 + 10 * 1000
        })
        if (inWindow.length > 2) {
          inWindow.forEach((x) => {
            if (!layeringViolations.some((v) => v.ticket === x.ticket && v.open_time === x.open_time)) {
              layeringViolations.push({ ticket: x.ticket, symbol: x.symbol, open_time: x.open_time })
            }
          })
        }
      }
    })
    const weekendHoldingViolations: { ticket: string; symbol: string; open_time: string; close_time: string }[] = []
    tradeList.forEach((t) => {
      const openStr = t.open_time ? String(t.open_time) : ""
      const closeStr = t.close_time ? String(t.close_time) : ""
      if (!openStr || !closeStr) return
      const openD = new Date(openStr)
      const closeD = new Date(closeStr)
      let d = new Date(openD)
      d.setHours(0, 0, 0, 0)
      const endD = new Date(closeD)
      endD.setHours(0, 0, 0, 0)
      while (d.getTime() <= endD.getTime()) {
        const day = d.getDay()
        if (day === 0 || day === 6) {
          weekendHoldingViolations.push({
            ticket: String(t.ticket ?? "—"),
            symbol: String(t.symbol ?? "—"),
            open_time: openStr,
            close_time: closeStr,
          })
          break
        }
        d.setDate(d.getDate() + 1)
      }
    })
    let totalProfit = 0
    let maxSingleDayProfit = 0
    const daily = dailyPerf
    if (daily.length > 0) {
      let prevCum = 0
      for (const d of daily) {
        const cum = d.cumulative_profit ?? d.cumulative_equity ?? 0
        const dayProfit = cum - prevCum
        totalProfit += dayProfit
        if (dayProfit > maxSingleDayProfit) maxSingleDayProfit = dayProfit
        prevCum = cum
      }
      if (totalProfit < 0) totalProfit = 0
    }
    const consistencyMaxDayPct = totalProfit > 0 ? (maxSingleDayProfit / totalProfit) * 100 : 0
    const totalTrades = tradeList.length
    const minHoldingNonCompliant = minHoldingViolations.length
    const minHoldingCompliantPct = totalTrades > 0 ? ((totalTrades - minHoldingNonCompliant) / totalTrades) * 100 : 100
    return {
      minHoldingNonCompliant,
      minHoldingCompliantPct,
      totalTradesForHolding: totalTrades,
      minHoldingViolations,
      layeringFlagged: layeringViolations.length > 0,
      layeringViolations,
      weekendHoldingViolations,
      consistencyMaxDayPct,
      consistencyLimitPct: 30,
    }
  }, [trades, dailyPerf])

  const winRate = adv?.win_rate ?? 0
  const profitFactor = adv?.profit_factor ?? 0
  const winLossRatio = profitFactor >= 1 ? Math.min(2, profitFactor) : profitFactor

  const currentDrawdownAmount = stats?.drawdown_percent != null ? (initialBalance * Math.abs(stats.drawdown_percent)) / 100 : 0
  const dailyDrawdownCurrent = dailyPerf.length ? Math.abs(dailyPerf.reduce((w, d) => (Math.abs(d.drawdown) > Math.abs(w.drawdown) ? d : w))?.drawdown ?? 0) : 0
  const minTradingDaysOk = consistency.totalDays >= minTradingDaysRequired

  const violationsWithDates = useMemo(() => {
    const list: { type: string; value: string; limit: string; date: string }[] = []
    dailyPerf.forEach((d) => {
      if (Math.abs(d.drawdown) >= dailyDrawdownLimit) {
        list.push({
          type: "Daily Drawdown",
          value: `${d.drawdown.toFixed(2)}%`,
          limit: `Max ${dailyDrawdownLimit}%`,
          date: d.date,
        })
      }
    })
    if (drawdownUsed >= maxDrawdownLimit) {
      list.push({
        type: "Overall Drawdown",
        value: stats != null ? `${(stats.drawdown_percent ?? 0).toFixed(2)}%` : "—",
        limit: `Max ${maxDrawdownLimit}%`,
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
            useOrderIdSelect
            selectedOrderId={selectedOrderId}
            onOrderIdChange={handleOrderChange}
            orders={orders}
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
                {/* Performance: key metrics — comfortable on dark bg */}
                <Card className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm min-w-0">
                  <div className="border-b border-border/80 bg-muted/30 px-5 sm:px-6 py-4">
                    <h3 className="text-base font-semibold tracking-tight text-foreground">Performance</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Key metrics at a glance</p>
                  </div>
                  <div className="p-0">
                    <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-border/80 [&>div]:border-border/80">
                      <div className="flex flex-col p-5 sm:p-6 min-w-0">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted/60 text-muted-foreground">
                          <Banknote className="h-4 w-4" strokeWidth={2} />
                        </div>
                        <p className="mt-4 text-xl font-semibold tabular-nums tracking-tight text-foreground truncate">
                          {accountInfo ? `$${accountInfo.balance.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : "—"}
                        </p>
                        <p className="mt-1.5 text-[11px] font-medium uppercase tracking-widest text-muted-foreground">Balance</p>
                      </div>
                      <div className="flex flex-col p-5 sm:p-6 min-w-0">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted/60 text-muted-foreground">
                          <BarChart2 className="h-4 w-4" strokeWidth={2} />
                        </div>
                        <p className={`mt-4 text-xl font-semibold tabular-nums tracking-tight truncate ${(stats?.profit ?? 0) >= 0 ? "text-foreground" : "text-destructive"}`}>
                          {stats != null ? `$${stats.profit.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : "—"}
                        </p>
                        <p className="mt-1.5 text-[11px] font-medium uppercase tracking-widest text-muted-foreground">Profit/Loss</p>
                      </div>
                      <div className="flex flex-col p-5 sm:p-6 min-w-0">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted/60 text-muted-foreground">
                          <Activity className="h-4 w-4" strokeWidth={2} />
                        </div>
                        <p className="mt-4 text-xl font-semibold tabular-nums tracking-tight text-foreground truncate">
                          {accountInfo ? `$${accountInfo.equity.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : "—"}
                        </p>
                        <p className="mt-1.5 text-[11px] font-medium uppercase tracking-widest text-muted-foreground">Equity</p>
                      </div>
                      <div className="flex flex-col p-5 sm:p-6 min-w-0">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted/60 text-muted-foreground">
                          <CalendarDays className="h-4 w-4" strokeWidth={2} />
                        </div>
                        <p className="mt-4 text-xl font-semibold tabular-nums tracking-tight text-foreground">
                          {consistency.totalDays}
                        </p>
                        <p className="mt-1.5 text-[11px] font-medium uppercase tracking-widest text-muted-foreground">Trading Days</p>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Objectives & Rules — below Performance, left side */}
                <Card className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm min-w-0" id="rules">
                  <div className="border-b border-border/80 bg-muted/20 px-4 sm:px-6 py-3.5">
                    <h3 className="text-sm font-semibold text-foreground tracking-tight">Objectives & Rules</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {accountRules.label} · Targets and rules
                    </p>
                  </div>
                  <div className="p-4 sm:p-5 space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <Gauge
                        value={stats?.profit ?? 0}
                        max={profitTargetAmount > 0 ? profitTargetAmount : 1}
                        label="Profit target"
                        maxLabel={`$${profitTargetAmount.toLocaleString("en-US", { maximumFractionDigits: 0 })}`}
                        displayValue={`$${(stats?.profit ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                        color="#10b981"
                      />
                      <Gauge
                        value={dailyDrawdownCurrent}
                        max={dailyDrawdownLimit}
                        label="Daily drawdown"
                        maxLabel={`Max ${accountRules.dailyDrawdown}`}
                        displayValue={`${dailyDrawdownCurrent.toFixed(2)}%`}
                        color={dailyDrawdownCurrent >= dailyDrawdownLimit ? "#dc2626" : "#f97316"}
                      />
                      <Gauge
                        value={drawdownUsed}
                        max={maxDrawdownLimit}
                        label="Max drawdown"
                        maxLabel={`Max ${accountRules.maxDrawdown}`}
                        displayValue={`${drawdownUsed.toFixed(2)}%`}
                        color={drawdownUsed >= maxDrawdownLimit ? "#dc2626" : "#f97316"}
                      />
                    </div>
                    <div className="space-y-2 pt-2 border-t border-border/60">
                      {minTradingDaysRequired > 0 && (
                        <div className="flex justify-between items-center gap-2 py-2 border-b border-border/40">
                          <span className="text-xs font-medium text-muted-foreground">Minimum Trading Days</span>
                          <span className={`text-sm font-semibold tabular-nums ${minTradingDaysOk ? "text-emerald-600" : "text-foreground"}`}>
                            {consistency.totalDays} of {minTradingDaysRequired}
                          </span>
                          {minTradingDaysOk ? <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" /> : null}
                        </div>
                      )}
                      <div className="flex justify-between items-center gap-2 py-2 border-b border-border/40">
                        <span className="text-xs font-medium text-muted-foreground">Weekend Holding</span>
                        <span className="text-sm font-semibold text-foreground">{accountRules.weekendHolding}</span>
                      </div>
                      <div className="flex justify-between items-center gap-2 py-2 border-b border-border/40">
                        <span className="text-xs font-medium text-muted-foreground">Overnight Holding</span>
                        <span className="text-sm font-semibold text-foreground">{accountRules.overnightHolding}</span>
                      </div>
                      <div className="flex justify-between items-center gap-2 py-2 border-b border-border/40">
                        <span className="text-xs font-medium text-muted-foreground">Hedging</span>
                        <span className="text-sm font-semibold text-foreground">{accountRules.hedging}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button asChild variant="outline" size="sm" className="flex-1 rounded-lg border-border/80">
                        <Link href={`/dashboard/performance/${encodeURIComponent(selectedOrderId)}#violations`}>
                          View Violations →
                        </Link>
                      </Button>
                      <Button asChild variant="outline" size="sm" className="flex-1 rounded-lg border-border/80">
                        <Link href="/rules" target="_blank" rel="noopener noreferrer">
                          Full Rules →
                        </Link>
                      </Button>
                    </div>
                  </div>
                </Card>

                {/* Compliance & Rules — left side, just below Violations (second on left column) */}
                <Card className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm min-w-0" id="compliance">
                  <div className="border-b border-border/80 bg-muted/20 px-4 sm:px-6 py-3.5">
                    <h3 className="text-sm font-semibold text-foreground tracking-tight">Compliance & Rules</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Holding time, layering, consistency, weekend</p>
                  </div>
                  <div className="p-4 sm:p-5 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <ConsistencyCircleGauge
                        achievedPct={Math.max(
                          0,
                          100 - (complianceMetrics.consistencyMaxDayPct / complianceMetrics.consistencyLimitPct) * 100
                        )}
                        maxDayPct={complianceMetrics.consistencyMaxDayPct}
                        limitPct={complianceMetrics.consistencyLimitPct}
                        periodLabel="No single day &gt;30% of total profit"
                      />
                      <div className="rounded-xl border-2 border-primary/30 bg-primary/5 p-3 shadow-sm">
                        <RuleBar
                          label="Min Holding Time"
                          description="Trades closed within 2 minutes 30 seconds are marked as non-compliant."
                          valuePct={complianceMetrics.minHoldingCompliantPct}
                          limitPct={100}
                          valueLabel={
                            complianceMetrics.totalTradesForHolding === 0
                              ? "—"
                              : complianceMetrics.minHoldingNonCompliant > 0
                                ? `${complianceMetrics.minHoldingNonCompliant} non-compliant`
                                : "Compliant"
                          }
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <RuleBar
                        label="Layering"
                        description="Flags if more than 2 positions on the same pair at the same direction are placed within 10 seconds."
                        valueLabel={complianceMetrics.layeringFlagged ? "Flagged" : "Compliant"}
                        status={complianceMetrics.layeringFlagged ? "flagged" : "compliant"}
                      />
                      <RuleBar
                        label="Weekend Holding"
                        description="Whether holding positions over the weekend is allowed for your account type."
                        valueLabel={accountRules.weekendHolding}
                        status={accountRules.weekendHolding === "Allowed" ? "allowed" : "not-allowed"}
                      />
                    </div>
                    {(complianceMetrics.minHoldingViolations?.length ?? 0) > 0 && (
                      <Collapsible
                        open={complianceDetailsOpen === "minHolding"}
                        onOpenChange={(open) => setComplianceDetailsOpen(open ? "minHolding" : null)}
                      >
                        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 overflow-hidden">
                          <div className="flex items-center justify-between gap-2 p-3">
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-foreground">Min Holding Time</p>
                              <p className="text-[10px] text-muted-foreground mt-0.5">Closed within 2 min 30 sec · {complianceMetrics.minHoldingViolations.length} trade(s)</p>
                            </div>
                            <CollapsibleTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="shrink-0 h-8 px-3 text-xs text-foreground hover:bg-amber-500/10"
                              >
                                Details
                                <ChevronDown className={`h-3.5 w-3.5 ml-1 transition-transform ${complianceDetailsOpen === "minHolding" ? "rotate-180" : ""}`} />
                              </Button>
                            </CollapsibleTrigger>
                          </div>
                          <CollapsibleContent>
                            <div className="border-t border-amber-500/20 px-3 py-2 max-h-40 overflow-y-auto">
                              <ul className="space-y-1.5">
                                {complianceMetrics.minHoldingViolations.map((v, i) => (
                                  <li key={`min-${v.ticket}-${v.open_time}-${i}`} className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs py-1 border-b border-border/30 last:border-0">
                                    <span className="font-medium tabular-nums text-foreground">#{v.ticket}</span>
                                    <span className="text-muted-foreground">{v.symbol}</span>
                                    <span className="text-muted-foreground">{v.open_time ? new Date(v.open_time).toLocaleString() : "—"}</span>
                                    <span className="text-amber-600 dark:text-amber-500 font-medium">({Math.floor(v.duration / 60)}m {v.duration % 60}s)</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </CollapsibleContent>
                        </div>
                      </Collapsible>
                    )}
                    {(complianceMetrics.layeringViolations?.length ?? 0) > 0 && (
                      <Collapsible
                        open={complianceDetailsOpen === "layering"}
                        onOpenChange={(open) => setComplianceDetailsOpen(open ? "layering" : null)}
                      >
                        <div className="rounded-lg border border-destructive/30 bg-destructive/5 overflow-hidden">
                          <div className="flex items-center justify-between gap-2 p-3">
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-foreground">Layering</p>
                              <p className="text-[10px] text-muted-foreground mt-0.5">More than 2 positions on same pair within 10 sec · {complianceMetrics.layeringViolations.length} trade(s)</p>
                            </div>
                            <CollapsibleTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="shrink-0 h-8 px-3 text-xs text-foreground hover:bg-destructive/10"
                              >
                                Details
                                <ChevronDown className={`h-3.5 w-3.5 ml-1 transition-transform ${complianceDetailsOpen === "layering" ? "rotate-180" : ""}`} />
                              </Button>
                            </CollapsibleTrigger>
                          </div>
                          <CollapsibleContent>
                            <div className="border-t border-destructive/20 px-3 py-2 max-h-40 overflow-y-auto">
                              <ul className="space-y-1.5">
                                {complianceMetrics.layeringViolations.map((v, i) => (
                                  <li key={`lay-${v.ticket}-${v.open_time}-${i}`} className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs py-1 border-b border-border/30 last:border-0">
                                    <span className="font-medium tabular-nums text-foreground">#{v.ticket}</span>
                                    <span className="text-muted-foreground">{v.symbol}</span>
                                    <span className="text-muted-foreground">{v.open_time ? new Date(v.open_time).toLocaleString() : "—"}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </CollapsibleContent>
                        </div>
                      </Collapsible>
                    )}
                    {(complianceMetrics.weekendHoldingViolations?.length ?? 0) > 0 && (
                      <Collapsible
                        open={complianceDetailsOpen === "weekend"}
                        onOpenChange={(open) => setComplianceDetailsOpen(open ? "weekend" : null)}
                      >
                        <div className="rounded-lg border border-destructive/30 bg-destructive/5 overflow-hidden">
                          <div className="flex items-center justify-between gap-2 p-3">
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-foreground">Weekend Holding</p>
                              <p className="text-[10px] text-muted-foreground mt-0.5">Position held over Saturday or Sunday · {complianceMetrics.weekendHoldingViolations.length} trade(s)</p>
                            </div>
                            <CollapsibleTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="shrink-0 h-8 px-3 text-xs text-foreground hover:bg-destructive/10"
                              >
                                Details
                                <ChevronDown className={`h-3.5 w-3.5 ml-1 transition-transform ${complianceDetailsOpen === "weekend" ? "rotate-180" : ""}`} />
                              </Button>
                            </CollapsibleTrigger>
                          </div>
                          <CollapsibleContent>
                            <div className="border-t border-destructive/20 px-3 py-2 max-h-40 overflow-y-auto">
                              <ul className="space-y-1.5">
                                {complianceMetrics.weekendHoldingViolations.map((v, i) => (
                                  <li key={`week-${v.ticket}-${v.open_time}-${i}`} className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs py-1 border-b border-border/30 last:border-0">
                                    <span className="font-medium tabular-nums text-foreground">#{v.ticket}</span>
                                    <span className="text-muted-foreground">{v.symbol}</span>
                                    <span className="text-muted-foreground">
                                      {v.open_time ? new Date(v.open_time).toLocaleString() : "—"}
                                      {" → "}
                                      {v.close_time ? new Date(v.close_time).toLocaleString() : "—"}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </CollapsibleContent>
                        </div>
                      </Collapsible>
                    )}
                  </div>
                </Card>

                {/* Equity graph */}
                <ProjectAnalytics stats={perf} />
              </div>

              {/* Right: Violations, then Compliance & Rules below — sticky so it stays visible when scrolling */}
              <div className="min-w-0 lg:sticky lg:top-6 lg:self-start">
                <Card className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm" id="violations">
                  <div className="border-b border-border/80 bg-muted/20 px-4 sm:px-5 py-3.5 flex items-center gap-2.5">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-destructive/10 border border-destructive/20">
                      <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground tracking-tight">Violations</h3>
                      <p className="text-[11px] text-muted-foreground">Rule breaches on record</p>
                    </div>
                  </div>
                  <div className="p-0">
                    {violationsWithDates.length > 0 ? (
                      <div className="divide-y divide-border/60">
                        {violationsWithDates.map((v, i) => (
                          <div
                            key={`${v.type}-${v.date}-${i}`}
                            className="flex items-start justify-between gap-4 px-4 sm:px-5 py-3.5 min-w-0"
                          >
                            <div className="flex items-start gap-3 min-w-0">
                              <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-destructive/30 bg-destructive/5">
                                <XCircle className="h-3 w-3 text-destructive" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-semibold text-foreground">{v.type}</p>
                                <p className="text-[11px] text-muted-foreground mt-0.5">{v.limit}</p>
                              </div>
                            </div>
                            <div className="shrink-0 text-right">
                              <p className="text-sm font-semibold tabular-nums text-destructive">{v.value}</p>
                              <p className="text-[11px] text-muted-foreground mt-0.5">
                                {v.date === "Current" ? v.date : new Date(v.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="px-4 sm:px-5 py-8 text-center">
                        <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-muted/60 border border-border/60">
                          <AlertTriangle className="h-4 w-4 text-muted-foreground/70" />
                        </div>
                        <p className="text-sm font-medium text-foreground">No violations</p>
                        <p className="text-xs text-muted-foreground mt-0.5">All rules within limit</p>
                      </div>
                    )}
                  </div>
                  <div className="border-t border-border/80 px-4 sm:px-5 py-3 bg-muted/10">
                    <p className="text-xs text-muted-foreground flex items-center justify-center gap-1.5">
                      <Mail className="h-3.5 w-3.5" />
                      Questions?{" "}
                      <a href="mailto:support@fxgenz.com" className="text-primary hover:underline font-medium">
                        support@fxgenz.com
                      </a>
                    </p>
                  </div>
                </Card>

                <Card className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm mt-4">
                  <div className="px-4 sm:px-5 py-3.5">
                    <p className="text-sm">
                      <span className="font-bold text-foreground">Market Close Time:</span>{" "}
                      <span className="text-muted-foreground">Friday 22:00 GMT</span>
                    </p>
                  </div>
                </Card>

                <div className="mt-4 flex flex-col items-center">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-2">Day Reset</p>
                  <DayResetCountdown />
                </div>
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
                  <>
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
                      {paginatedTrades.map((t, idx) => {
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
                {(hasPrevPage || hasNextPage) && (
                  <div className="flex items-center justify-between gap-4 mt-4 px-1">
                    <span className="text-xs text-muted-foreground">
                      Showing {((tradesPage - 1) * TRADES_PER_PAGE) + 1}–{Math.min(tradesPage * TRADES_PER_PAGE, trades.length)} of {trades.length}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setTradesPage((p) => p - 1)}
                        disabled={!hasPrevPage}
                        className="rounded-lg gap-1.5"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setTradesPage((p) => p + 1)}
                        disabled={!hasNextPage}
                        className="rounded-lg gap-1.5"
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
                  </>
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
