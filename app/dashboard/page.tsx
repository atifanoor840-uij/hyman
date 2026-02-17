"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { ProjectAnalytics, type ProjectAnalyticsProps } from "@/components/dashboard/project-analytics"
import { ChallengeStatsCards, type ChallengeStatsCardsProps } from "@/components/dashboard/challenge-stats-cards"
import { ProjectProgress, type ProjectProgressProps } from "@/components/dashboard/project-progress"
import { MT5PlatformCard } from "@/components/dashboard/mt5-platform-card"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ShoppingCart, BarChart3 } from "lucide-react"
import { getMyAccount, type Order } from "@/lib/api/auth"
import { Card } from "@/components/ui/card"
import { Activity } from "lucide-react"

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
import { getShowMyTradesStats } from "@/lib/api/showmytrades"
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

  useEffect(() => {
    if (!selectedOrderId || orders.length === 0) {
      setStats(null)
      setStatsError(false)
      return
    }
    const order = orders.find((o) => o.order_id === selectedOrderId)
    const creds = order?.credentials ?? order?.stage2_credentials ?? order?.live_credentials
    const platform = (order?.platform ?? "mt5").toLowerCase()
    const platformLogin = creds?.platform_login
    if (!platformLogin) {
      setStats(null)
      setStatsError(true)
      return
    }
    let cancelled = false
    setStatsLoading(true)
    setStatsError(false)
    // ShowMyTrades: https://showmytrades.com/api/statistics/mt5-{platform_login} (or mt4-{platform_login})
    getShowMyTradesStats(platform, String(platformLogin))
      .then((data) => { if (!cancelled) { setStats(data); setStatsError(false) } })
      .catch(() => { if (!cancelled) { setStats(null); setStatsError(true) } })
      .finally(() => { if (!cancelled) setStatsLoading(false) })
    return () => { cancelled = true }
  }, [selectedOrderId, orders])

  const hasActiveOrder = orders.some((o) => o.status !== "Pending")
  const noActiveAccount = !ordersLoading && !hasActiveOrder
  const currentOrderForStatus: Order | null =
    hasActiveOrder && orders.length > 0
      ? (orders.find((o) => o.order_id === selectedOrderId) || orders.find((o) => o.status !== "Pending") || null)
      : null
  const statusLabel = getAccountStatusLabel(currentOrderForStatus)
  const statsBlur = (accountApiError || statsError || statsLoading) && !stats
  const analyticsBlur = noActiveAccount || statsBlur
  const blurClass =
    analyticsBlur
      ? "pointer-events-none select-none blur-sm"
      : ""

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

          {noActiveAccount && (
            <div className="mt-4 rounded-lg border border-border bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
              You have not active account.
            </div>
          )}

          <div className="mt-4 md:mt-5 space-y-3 md:space-y-4 flex-1 min-w-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-4 min-w-0">
              <div className={`lg:col-span-2 space-y-3 md:space-y-4 min-w-0 transition-all duration-300 ${blurClass}`}>
                <ProjectAnalytics {...({ stats } satisfies ProjectAnalyticsProps)} />
                <ChallengeStatsCards {...({ stats } satisfies ChallengeStatsCardsProps)} />
              </div>

              <div className="space-y-3 md:space-y-4 min-w-0">
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






















