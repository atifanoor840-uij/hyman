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
  TrendingDown,
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
  Lock,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Server,
  KeyRound,
  CircleDollarSign,
  MonitorSmartphone,
  Eye,
  EyeOff,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  getMyAccount,
  getOrderCredentialsForStats,
  findOrderById,
  type Order,
  type OrderCredentials,
} from "@/lib/api/auth"
import { type PerformanceResponse, type OpenTrade } from "@/lib/api/performance"
import { getShowMyTradesStats } from "@/lib/api/showmytrades"
import { ApiClientError } from "@/lib/api/client"
import { PerformanceGraphPanel, DetailedStatisticsCard } from "@/components/dashboard/performance-graph-stats"

const ACCOUNT_API_ERROR_MESSAGE =
  "Your account is not showing any statistics due to technical issue. Contact support team to solve it."

const NO_MT_CREDENTIALS_MESSAGE =
  "MT trading credentials (platform login) are not available for this order yet. Performance will show live data from ShowMyTrades once your account is assigned."

function getAccountStatusLabel(order: Order | null): string {
  if (!order) return "—"
  if (order.status === "Pending" || order.status_type === "Pending") return "Pending"
  if (order.live_credentials) return "Live"
  if (order.stage2_credentials) return "Stage 2"
  if (order.credentials) return "Phase 1"
  const active = order.credentials_with_status?.find(
    (c) => String(c.account_status ?? "").toLowerCase() === "active"
  )
  if (active?.status_type) return active.status_type
  return order.status_type || order.status || "Active"
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

function getOpenDurationSec(openTime: string | undefined): number | null {
  if (!openTime) return null
  const t = new Date(openTime).getTime()
  if (!Number.isFinite(t)) return null
  return Math.max(0, Math.floor((Date.now() - t) / 1000))
}

function formatOrderType(type: unknown): string {
  if (type === 0 || type === "0" || type === "buy" || type === "Buy") return "Buy"
  if (type === 1 || type === "1" || type === "sell" || type === "Sell") return "Sell"
  return "—"
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
  const [showPassword, setShowPassword] = useState(false)
  const copy = (label: string, value: string) => {
    navigator.clipboard.writeText(value)
    setCopied(label)
    setTimeout(() => setCopied(null), 1500)
  }
  const fields: {
    label: string
    value: string
    icon: LucideIcon
    isPassword?: boolean
  }[] = [
    { label: "Server", value: creds.server, icon: Server },
    { label: "Login", value: String(creds.platform_login), icon: MonitorSmartphone },
    { label: "Password", value: creds.platform_password, icon: KeyRound, isPassword: true },
  ]
  if (creds.profit_target != null) {
    fields.push({ label: "Profit target", value: String(creds.profit_target), icon: CircleDollarSign })
  }
  if (creds.session_id != null && String(creds.session_id) !== "") {
    fields.push({ label: "Session ID", value: String(creds.session_id), icon: Lock })
  }
  if (creds.terminal_id != null) {
    fields.push({ label: "Terminal ID", value: String(creds.terminal_id), icon: Briefcase })
  }
  return (
    <Card className="min-w-0 overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-br from-card via-card to-muted/10 shadow-[0_10px_30px_rgba(2,6,23,0.08)]">
      <div className="border-b border-border/70 bg-gradient-to-r from-muted/35 to-transparent px-4 py-3.5 md:px-5">
        <h3 className="text-sm font-semibold tracking-tight text-foreground">{title}</h3>
      </div>
      <div className="space-y-2.5 p-4 md:p-5">
        {fields.map(({ label, value, icon: Icon, isPassword }) => {
          const copyKey = `${prefix}-${label}`
          const displayValue = isPassword && !showPassword ? "••••••••••••" : value
          return (
            <div
              key={label}
              className="group flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-muted/20 p-2.5"
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border/70 bg-background/70 text-muted-foreground">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
                  <code
                    className="mt-0.5 block max-w-[170px] truncate rounded-md border border-border/60 bg-background/80 px-2 py-1 text-xs font-mono text-foreground sm:max-w-[220px]"
                    title={value}
                  >
                    {displayValue}
                  </code>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                {isPassword ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0 rounded-lg border border-border/60 bg-background/60 hover:bg-background"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                ) : null}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 rounded-lg border border-border/60 bg-background/60 hover:bg-background"
                  onClick={() => copy(copyKey, value)}
                  aria-label={`Copy ${label}`}
                >
                  {copied === copyKey ? (
                    <Check className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <Copy className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                  )}
                </Button>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

function CredentialsSection({ order }: { order: Order | null }) {
  const hasCompleted = order?.credentials || order?.live_credentials
  const hasStage2 = !!order?.stage2_credentials
  const fromList = order?.credentials_with_status?.length
    ? order.credentials_with_status
    : null
  if (!hasCompleted && !hasStage2 && !fromList?.length) return null
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
      {fromList?.map((c) => (
        <CredentialBlock
          key={c.credential_id}
          title={c.status_type ?? "Trading account"}
          creds={{
            credential_id: c.credential_id,
            server: c.server,
            platform_login: c.platform_login,
            platform_password: c.platform_password,
            profit_target: c.profit_target,
          }}
          prefix={`cw-${c.credential_id}`}
        />
      ))}
    </div>
  )
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
    const order = findOrderById(orders, selectedOrderId) ?? null
    setCurrentOrder(order)
    const resolved = getOrderCredentialsForStats(order)
    if (!resolved) {
      setPerf(null)
      setError(NO_MT_CREDENTIALS_MESSAGE)
      setLoading(false)
      return
    }
    const { platform, platformLogin } = resolved
    const graphLink =
      (resolved as any)?.credential?.graph_link ??
      (order as any)?.graph_link ??
      (order as any)?.credentials_with_status?.[0]?.graph_link ??
      null
    let cancelled = false
    setLoading(true)
    setError(null)
    getShowMyTradesStats(platform, platformLogin, graphLink)
      .then((data) => { if (!cancelled) { setPerf(data); setError(null) } })
      .catch((e) => {
        if (cancelled) return
        const status = e && typeof e === "object" && "status" in e ? (e as { status: number }).status : 0
        const is401or404 = status === 401 || status === 404
        setPerf(null)
        setError(
          is401or404
            ? "ShowMyTrades could not return statistics yet (404). Data usually appears within 12 hours of trading. If it persists, contact support."
            : e instanceof Error ? e.message : "Failed to load performance from ShowMyTrades."
        )
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [selectedOrderId, orders])

  const handleOrderChange = (id: string) => {
    setSelectedOrderId(id)
    if (id) router.push(`/dashboard/performance/${encodeURIComponent(id)}`)
  }

  const resolvedCreds = getOrderCredentialsForStats(currentOrder)

  /** Clear stale "no credentials" error once order state catches up (fixes double banner). */
  useEffect(() => {
    if (error === NO_MT_CREDENTIALS_MESSAGE && resolvedCreds) {
      setError(null)
    }
  }, [error, resolvedCreds])

  const creds: OrderCredentials | null =
    resolvedCreds?.credential ??
    (currentOrder?.credentials ||
      currentOrder?.stage2_credentials ||
      currentOrder?.live_credentials ||
      (perf?.account_info
        ? {
            credential_id: 0,
            server: perf.account_info.server,
            platform_login: perf.account_info.account_number,
            platform_password: "••••••••",
          }
        : null))

  const stats = perf?.statistics?.account_stats
  const initialBalance = stats?.total_deposits ?? 50000

  const closedTrades =
    perf?.statistics?.advanced_statistics?.charts?.recent_trades_duration ??
    perf?.statistics?.advanced_statistics?.recent_trades_duration ??
    []
  const openTrades: OpenTrade[] = Array.isArray(perf?.open_trades?.data) ? perf.open_trades.data : []

  useEffect(() => {
    setTradesPage(1)
    setOpenTradesPage(1)
  }, [selectedOrderId, closedTrades.length, openTrades.length])

  const TRADES_PER_PAGE = 10
  const paginatedClosedTrades = closedTrades.slice((tradesPage - 1) * TRADES_PER_PAGE, tradesPage * TRADES_PER_PAGE)
  const hasNextPage = closedTrades.length > tradesPage * TRADES_PER_PAGE
  const hasPrevPage = tradesPage > 1
  const [openTradesPage, setOpenTradesPage] = useState(1)
  const paginatedOpenTrades = openTrades.slice((openTradesPage - 1) * TRADES_PER_PAGE, openTradesPage * TRADES_PER_PAGE)
  const hasNextOpenPage = openTrades.length > openTradesPage * TRADES_PER_PAGE
  const hasPrevOpenPage = openTradesPage > 1

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
    <div className="flex min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <main className="min-w-0 flex-1 flex flex-col overflow-x-hidden p-3 sm:p-4 md:p-5 lg:ml-64 pb-8">
        <div className="mx-auto w-full max-w-[1600px] flex flex-col flex-1 min-w-0">
          <Header
            useOrderIdSelect
            selectedOrderId={selectedOrderId}
            onOrderIdChange={handleOrderChange}
            orders={orders}
          />

          {error &&
            !(error === NO_MT_CREDENTIALS_MESSAGE && resolvedCreds) && (
            <div
              className={`rounded-xl border px-4 py-3.5 text-sm font-medium shadow-sm backdrop-blur-sm ${
                error === ACCOUNT_API_ERROR_MESSAGE || error.includes("within 12 hours") || error === NO_MT_CREDENTIALS_MESSAGE
                  ? "border-primary/30 bg-primary/8 text-foreground"
                  : "border-destructive/40 bg-destructive/12 text-destructive"
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
            <Card className="overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-br from-card via-card to-muted/10 shadow-[0_10px_40px_rgba(2,6,23,0.18)]">
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
                      <div className="flex items-center gap-2.5 px-3 py-2.5 sm:py-2 rounded-xl bg-gradient-to-br from-muted/45 to-muted/15 border border-border/50 min-h-[52px] sm:min-h-0 shadow-sm">
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
                      <div className="flex items-center gap-2.5 px-3 py-2.5 sm:py-2 rounded-xl bg-gradient-to-br from-muted/45 to-muted/15 border border-border/50 min-h-[52px] sm:min-h-0 shadow-sm">
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
                      <div className="flex items-center gap-2.5 px-3 py-2.5 sm:py-2 rounded-xl bg-gradient-to-br from-muted/45 to-muted/15 border border-border/50 min-h-[52px] sm:min-h-0 sm:col-span-2 shadow-sm">
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
                      className="rounded-xl border-border/80 font-medium hover:bg-muted/80 transition-colors min-h-[44px] touch-manipulation"
                    >
                      <Link href="/buy-challenge" className="flex items-center justify-center">Start New Challenge</Link>
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setShowCredentials((v) => !v)}
                      className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 gap-2 font-medium shadow-md shadow-primary/25 transition-all duration-200 min-h-[44px] touch-manipulation"
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

            {/* Main: full-width chart and metrics */}
            <div className="space-y-4 min-w-0">
              <PerformanceGraphPanel stats={perf} />
              <DetailedStatisticsCard stats={perf} />
            </div>

            <Card className="overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-br from-card via-card to-muted/10 shadow-[0_8px_30px_rgba(2,6,23,0.14)] min-w-0" id="open-trades">
              <div className="border-b border-border/70 bg-gradient-to-r from-muted/35 to-transparent px-4 sm:px-5 py-3 sm:py-3.5">
                <h3 className="text-sm font-semibold text-foreground tracking-tight">Open Trades</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Currently open positions</p>
              </div>
              <div className="p-4 sm:p-5 overflow-hidden">
                {openTrades.length > 0 ? (
                  <>
                    <div className="overflow-x-auto -mx-1 px-1 rounded-xl border border-border/60 min-w-0 bg-background/30" style={{ WebkitOverflowScrolling: "touch" }}>
                      <Table>
                        <TableHeader>
                          <TableRow className="border-b border-border/80 bg-muted/35 hover:bg-muted/35">
                            <TableHead className="font-semibold text-foreground">Symbol</TableHead>
                            <TableHead className="font-semibold text-foreground">Ticket</TableHead>
                            <TableHead className="font-semibold text-foreground">Volume</TableHead>
                            <TableHead className="font-semibold text-foreground">Type</TableHead>
                            <TableHead className="font-semibold text-foreground">Open Time</TableHead>
                            <TableHead className="font-semibold text-foreground">Open</TableHead>
                            <TableHead className="font-semibold text-foreground">Duration</TableHead>
                            <TableHead className="text-right font-semibold text-foreground">Floating P/L</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paginatedOpenTrades.map((raw, idx) => {
                            const t = raw as OpenTrade
                            const rec = raw as Record<string, unknown>
                            const ticket = t.ticket ?? rec.ticket
                            const symbol = t.symbol ?? rec.symbol
                            const volume = t.volume ?? rec.volume
                            const openTime = t.open_time ?? rec.open_time
                            const openStr = openTime != null ? String(openTime) : ""
                            const openDurSec = getOpenDurationSec(openStr || undefined)
                            const typeVal = t.type ?? rec.type
                            const priceOpen = t.price_open ?? rec.price_open
                            const priceCur = t.price_current ?? rec.price_current
                            const floating =
                              typeof t.profit === "number"
                                ? t.profit
                                : rec.profit != null
                                  ? Number(rec.profit)
                                  : rec.floating_profit != null
                                    ? Number(rec.floating_profit)
                                    : rec.net_profit != null
                                      ? Number(rec.net_profit)
                                      : 0
                            const key = String(ticket ?? idx)
                            return (
                              <TableRow key={key} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                                <TableCell className="font-medium py-3">{symbol != null ? String(symbol) : "—"}</TableCell>
                                <TableCell className="text-muted-foreground tabular-nums py-3">{ticket != null ? String(ticket) : "—"}</TableCell>
                                <TableCell className="tabular-nums py-3">{volume != null ? String(volume) : "—"}</TableCell>
                                <TableCell className="text-muted-foreground py-3 text-xs">{formatOrderType(typeVal)}</TableCell>
                                <TableCell className="text-muted-foreground text-xs whitespace-nowrap py-3">
                                  {openStr ? new Date(openStr).toLocaleString() : "—"}
                                </TableCell>
                                <TableCell className="text-muted-foreground tabular-nums text-xs py-3">
                                  {priceOpen != null && Number.isFinite(Number(priceOpen))
                                    ? Number(priceOpen).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 5 })
                                    : "—"}
                                  {priceCur != null && Number.isFinite(Number(priceCur)) && (
                                    <span className="block text-[11px] opacity-80">
                                      Now: {Number(priceCur).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 5 })}
                                    </span>
                                  )}
                                </TableCell>
                                <TableCell className="text-muted-foreground tabular-nums whitespace-nowrap py-3">
                                  {openDurSec != null ? formatTradeDuration(openDurSec) : "—"}
                                </TableCell>
                                <TableCell className={`text-right font-semibold tabular-nums py-3 ${floating >= 0 ? "text-foreground" : "text-destructive"}`}>
                                  ${floating.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </TableCell>
                              </TableRow>
                            )
                          })}
                        </TableBody>
                      </Table>
                    </div>
                    {(hasPrevOpenPage || hasNextOpenPage) && (
                      <div className="flex items-center justify-between gap-4 mt-4 px-1">
                        <span className="text-xs text-muted-foreground">
                          Showing {((openTradesPage - 1) * TRADES_PER_PAGE) + 1}–{Math.min(openTradesPage * TRADES_PER_PAGE, openTrades.length)} of {openTrades.length}
                        </span>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setOpenTradesPage((p) => p - 1)}
                            disabled={!hasPrevOpenPage}
                            className="rounded-lg gap-1.5"
                          >
                            <ChevronLeft className="h-4 w-4" />
                            Previous
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setOpenTradesPage((p) => p + 1)}
                            disabled={!hasNextOpenPage}
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
                    <p className="text-sm font-medium text-foreground">No open positions</p>
                    <p className="text-xs text-muted-foreground mt-1 text-center max-w-sm">
                      Open positions will appear here when you have trades on the market.
                    </p>
                  </div>
                )}
              </div>
            </Card>

            {/* Trade History */}
            <Card className="overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-br from-card via-card to-muted/10 shadow-[0_8px_30px_rgba(2,6,23,0.14)] min-w-0" id="rules">
              <div className="border-b border-border/70 bg-gradient-to-r from-muted/35 to-transparent px-4 sm:px-5 py-3 sm:py-3.5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-foreground tracking-tight">Trade History</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Recent closed positions</p>
                </div>
                <Button asChild variant="outline" size="sm" className="rounded-xl border-border/80">
                  <Link href="#open-trades">Filter Open Trades</Link>
                </Button>
              </div>
              <div className="p-4 sm:p-5 overflow-hidden">
              {closedTrades.length > 0 ? (
                  <>
                  <div className="overflow-x-auto -mx-1 px-1 rounded-xl border border-border/60 min-w-0 bg-background/30" style={{ WebkitOverflowScrolling: "touch" }}>
                  <Table>
                    <TableHeader>
                        <TableRow className="border-b border-border/80 bg-muted/35 hover:bg-muted/35">
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
                      {paginatedClosedTrades.map((t, idx) => {
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
                      Showing {((tradesPage - 1) * TRADES_PER_PAGE) + 1}–{Math.min(tradesPage * TRADES_PER_PAGE, closedTrades.length)} of {closedTrades.length}
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
                    <p className="text-sm font-medium text-foreground">No closed trades yet</p>
                    <p className="text-xs text-muted-foreground mt-1 text-center max-w-sm">
                      Closed positions will appear here when you close trades.
                    </p>
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
