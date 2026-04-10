"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { ProjectAnalytics, type ProjectAnalyticsProps } from "@/components/dashboard/project-analytics"
import { ProjectProgress, type ProjectProgressProps } from "@/components/dashboard/project-progress"
import { MT5PlatformCard } from "@/components/dashboard/mt5-platform-card"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ShoppingCart, BarChart3, CheckCircle2, AlertTriangle, XCircle, Mail } from "lucide-react"
import { getMyAccount, getOrderCredentialsForStats, findOrderById, type Order } from "@/lib/api/auth"
import { Card } from "@/components/ui/card"
import { Activity } from "lucide-react"
import { getAccountRules } from "@/lib/rules-config"

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
import { fetchDashboardStats } from "@/lib/api/dashboard-stats"
import type { PerformanceResponse } from "@/lib/api/performance"
import { ApiClientError } from "@/lib/api/client"

const ACCOUNT_API_ERROR_MESSAGE =
  "Your account is not showing any statistics due to technical issue. Contact support team to solve it."

export default function DashboardPage() {
  const [selectedOrderId, setSelectedOrderId] = useState<string>("")
  const [orders, setOrders] = useState<Order[]>([])
  const [ordersLoading, setOrdersLoading] = useState<boolean>(true)
  const [stats, setStats] = useState<PerformanceResponse | null>(null)
  const [statsError, setStatsError] = useState<boolean>(false)
  const [statsLoading, setStatsLoading] = useState<boolean>(false)
  const [accountApiError, setAccountApiError] = useState<boolean>(false)
  /** Latest stats loader for Retry (avoids an extra useEffect dependency that changes array length across renders/HMR) */
  const loadStatsRef = useRef<() => Promise<void>>(async () => {})

  useEffect(() => {
    let cancelled = false
    setOrdersLoading(true)
    setAccountApiError(false)
    getMyAccount()
      .then((res) => {
        if (!cancelled) {
          setOrders(res.orders ?? [])
          setAccountApiError(false)
        }
      })
      .catch((e) => {
        if (cancelled) return
        setOrders([])
        const is401or404 = e instanceof ApiClientError && (e.status === 401 || e.status === 404)
        setAccountApiError(!!is401or404)
      })
      .finally(() => {
        if (!cancelled) setOrdersLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  /** Non-pending order to load stats for: selected row, or first active order if none selected yet */
  const orderForStats = useMemo(() => {
    if (orders.length === 0) return null
    const selectable = orders.filter((o) => o.status !== "Pending")
    if (selectable.length === 0) return null
    const match = selectedOrderId ? findOrderById(selectable, selectedOrderId) : null
    return match ?? selectable[0]
  }, [orders, selectedOrderId])

  // Keep dropdown in sync when order list loads or selection is empty (Header also does this; this guarantees fetch runs)
  useEffect(() => {
    if (!orderForStats) return
    if (selectedOrderId !== orderForStats.order_id) {
      setSelectedOrderId(orderForStats.order_id)
    }
  }, [orderForStats, selectedOrderId])

  useEffect(() => {
    let cancelled = false

    async function load() {
      if (ordersLoading) return
      if (!orderForStats) {
        setStats(null)
        setStatsError(false)
        return
      }
      const resolved = getOrderCredentialsForStats(orderForStats)
      if (!resolved) {
        setStats(null)
        setStatsError(true)
        return
      }
      const { platform, platformLogin } = resolved
      setStatsLoading(true)
      setStatsError(false)
      try {
        const data = await fetchDashboardStats(platform, platformLogin)
        if (!cancelled) {
          setStats(data)
          setStatsError(false)
        }
      } catch {
        if (!cancelled) {
          setStats(null)
          setStatsError(true)
        }
      } finally {
        if (!cancelled) setStatsLoading(false)
      }
    }

    loadStatsRef.current = load
    void load()

    return () => {
      cancelled = true
    }
  }, [orderForStats, ordersLoading])

  const hasActiveOrder = orders.some((o) => o.status !== "Pending")
  const noActiveAccount = !ordersLoading && !hasActiveOrder
  const currentOrderForStatus: Order | null =
    hasActiveOrder && orderForStats ? orderForStats : null
  const statusLabel = getAccountStatusLabel(currentOrderForStatus)
  // Blur only when the user has no active (non-Pending) challenge — not when stats API is slow or fails.
  // Otherwise "Active" accounts stayed blurred whenever getShowMyTradesStats errored or was still loading.
  const analyticsBlur = noActiveAccount
  const blurClass =
    analyticsBlur
      ? "pointer-events-none select-none blur-sm"
      : ""
  const statsUnavailable =
    hasActiveOrder && !!orderForStats && !ordersLoading && !statsLoading && !stats && statsError
  const accountRules = getAccountRules(orderForStats?.challenge_type)
  const resolvedCreds = getOrderCredentialsForStats(orderForStats)
  const accountStats = stats?.statistics?.account_stats
  const dailyPerf = stats?.statistics?.equity_curve?.daily_performance || []
  const initialBalance = accountStats?.total_deposits ?? 50000
  const profitTargetAmount =
    resolvedCreds?.credential?.profit_target != null
      ? Number(resolvedCreds.credential.profit_target)
      : (initialBalance * 8) / 100
  const dailyDrawdownLimit = parseInt(accountRules.dailyDrawdown, 10) || 5
  const maxDrawdownLimit = parseInt(accountRules.maxDrawdown, 10) || 10
  const dailyDrawdownCurrent = dailyPerf.length
    ? Math.abs(dailyPerf.reduce((w, d) => (Math.abs(d.drawdown) > Math.abs(w.drawdown) ? d : w)).drawdown ?? 0)
    : 0
  const drawdownUsed = Math.abs(accountStats?.drawdown_percent ?? 0)
  const minTradingDaysRequired = accountRules.minTradingDays > 0 ? accountRules.minTradingDays : 5
  const minTradingDaysOk = dailyPerf.length >= minTradingDaysRequired
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
        value: accountStats != null ? `${(accountStats.drawdown_percent ?? 0).toFixed(2)}%` : "—",
        limit: `Max ${maxDrawdownLimit}%`,
        date: dailyPerf.length ? dailyPerf[dailyPerf.length - 1]!.date : "Current",
      })
    }
    return list
  }, [dailyPerf, dailyDrawdownLimit, drawdownUsed, maxDrawdownLimit, accountStats])

  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <main className="min-w-0 flex-1 flex flex-col overflow-x-hidden p-3 sm:p-4 md:p-5 lg:ml-64 pb-8">
        <div className="mx-auto w-full max-w-[1400px] flex flex-col flex-1 min-w-0">
          <Header
            title="Forex Trading Dashboard"
            description="Monitor your trading performance, analyze market trends, and manage your positions."
            useOrderIdSelect
            selectedOrderId={selectedOrderId}
            onOrderIdChange={setSelectedOrderId}
            orders={orders}
            variant="dashboard-hero"
            actions={
              <div className="flex w-full flex-col items-end gap-2 md:w-auto">
                {currentOrderForStatus && (
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${getAccountStatusVariant(
                      statusLabel,
                    )}`}
                  >
                    {(statusLabel === "Phase 1" || statusLabel === "Stage 2" || statusLabel === "Live") && (
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    )}
                    {statusLabel}
                  </span>
                )}

                <div className="flex w-full flex-wrap items-center justify-end gap-2 md:w-auto md:gap-3">
                  <Button
                    asChild
                    variant="outline"
                    className="h-9 rounded-full border-border/70 bg-background/80 px-4 text-xs sm:text-sm font-semibold text-foreground shadow-sm hover:bg-background hover:border-border focus-visible:ring-2 focus-visible:ring-primary/40 gap-2"
                    disabled={!hasActiveOrder || !selectedOrderId}
                  >
                    <Link href={selectedOrderId && hasActiveOrder ? `/dashboard/performance/${selectedOrderId}` : "#"}>
                      <BarChart3 className="h-4 w-4" />
                      View Detail Performance
                    </Link>
                  </Button>
                  <Button
                    asChild
                    className="h-9 rounded-full bg-gradient-to-r from-primary to-primary/80 px-5 text-xs sm:text-sm font-semibold text-primary-foreground shadow-md shadow-primary/30 hover:from-primary/95 hover:to-primary/80 hover:shadow-lg hover:shadow-primary/40 transition-all duration-300 gap-2"
                  >
                    <Link href="/buys">
                      <ShoppingCart className="h-4 w-4" />
                      Buy Challenge
                    </Link>
                  </Button>
                </div>
              </div>
            }
          />

          {accountApiError && (
            <div className="rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-foreground">
              {ACCOUNT_API_ERROR_MESSAGE}
            </div>
          )}

          {statsUnavailable && (
            <div className="flex flex-col gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-foreground">
                Live statistics could not be loaded. The server may be busy — try again or contact support if this continues.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="shrink-0 rounded-lg border-amber-500/40"
                onClick={() => void loadStatsRef.current?.()}
              >
                Retry
              </Button>
            </div>
          )}

          {noActiveAccount && (
            <div className="mt-4 rounded-lg border border-border bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
              You have not active account.
            </div>
          )}

          <div className="mt-4 md:mt-5 space-y-3 md:space-y-4 flex-1 min-w-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-4 min-w-0">
              <div className={`lg:col-span-2 space-y-3 md:space-y-4 min-w-0 transition-all duration-300 ${blurClass}`}>
                <ProjectAnalytics {...({ stats } satisfies ProjectAnalyticsProps)} />
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
                        value={accountStats?.profit ?? 0}
                        max={profitTargetAmount > 0 ? profitTargetAmount : 1}
                        label="Profit target"
                        maxLabel={`$${profitTargetAmount.toLocaleString("en-US", { maximumFractionDigits: 0 })}`}
                        displayValue={`$${(accountStats?.profit ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
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
                            {dailyPerf.length} of {minTradingDaysRequired}
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
                        <Link href={selectedOrderId ? `/dashboard/performance/${encodeURIComponent(selectedOrderId)}#violations` : "/dashboard"}>
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
              </div>

              <div className="space-y-3 md:space-y-4 min-w-0">
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
                                {v.date === "Current"
                                  ? v.date
                                  : new Date(v.date).toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                    })}
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
                      <a href="mailto:support@GenzProp.com" className="text-primary hover:underline font-medium">
                        support@GenzProp.com
                      </a>
                    </p>
                  </div>
                </Card>
                <div className="rounded-xl overflow-hidden border border-border bg-card shadow-sm animate-slide-in-up" style={{ animationDelay: "500ms" }}>
                  <img
                    src="https://res.cloudinary.com/dqzibxdtn/image/upload/v1769775710/Black_White_Grunge_Modern_Buy_One_Get_One_Black_Friday_Instagram_Post_plnvf9.png"
                    alt="Promo"
                    className="w-full h-auto max-h-[320px] object-cover object-center"
                  />
                </div>
                <div className={`transition-all duration-300 ${blurClass}`}>
                  <ProjectProgress {...({ stats } satisfies ProjectProgressProps)} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 min-w-0">
              <MT5PlatformCard variant="timer" />
              <MT5PlatformCard />
              <MT5PlatformCard variant="discord" />
            </div>
          </div>

          <div className="mt-8">
            <Footer />
          </div>
        </div>
      </main>
    </div>
  )
}






















