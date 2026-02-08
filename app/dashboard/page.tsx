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
import { getShowMyTradesStats } from "@/lib/api/showmytrades"
import type { PerformanceResponse } from "@/lib/api/performance"
import { ApiClientError } from "@/lib/api/client"

const ACCOUNT_API_ERROR_MESSAGE =
  "Your account is not showing any statistics due to technical issue. Contact support team to solve it."

export default function DashboardPage() {
  const [selectedOrderId, setSelectedOrderId] = useState<string>("")
  const [orders, setOrders] = useState<Order[]>([])
  const [stats, setStats] = useState<PerformanceResponse | null>(null)
  const [statsError, setStatsError] = useState<boolean>(false)
  const [statsLoading, setStatsLoading] = useState<boolean>(false)
  const [accountApiError, setAccountApiError] = useState<boolean>(false)

  useEffect(() => {
    let cancelled = false
    setAccountApiError(false)
    getMyAccount()
      .then((res) => { if (!cancelled) { setOrders(res.orders ?? []); setAccountApiError(false) } })
      .catch((e) => {
        if (cancelled) return
        setOrders([])
        const is401or404 = e instanceof ApiClientError && (e.status === 401 || e.status === 404)
        setAccountApiError(!!is401or404)
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

  // Only blur when backend has not returned data; if we have stats, show cards clear
  const blurClass =
    (accountApiError || statsError || statsLoading) && !stats
      ? "pointer-events-none select-none blur-sm"
      : ""

  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <main className="min-w-0 flex-1 flex flex-col overflow-x-hidden p-3 md:p-4 lg:p-5 lg:ml-64">
        <div className="mx-auto w-full max-w-[1400px] flex flex-col flex-1">
          <Header
            title="Forex Trading Dashboard"
            description="Monitor your trading performance, analyze market trends, and manage your positions."
            useOrderIdSelect
            selectedOrderId={selectedOrderId}
            onOrderIdChange={setSelectedOrderId}
            orders={orders}
            actions={
              <div className="flex w-full justify-end gap-2">
                <Button
                  asChild
                  variant="outline"
                  className="h-9 text-sm border-border hover:bg-muted gap-2"
                  disabled={!selectedOrderId}
                >
                  <Link href={selectedOrderId ? `/dashboard/performance/${selectedOrderId}` : "#"}>
                    <BarChart3 className="h-4 w-4" />
                    View Detail Performance
                  </Link>
                </Button>
                <Button asChild className="h-9 text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 hover:shadow-md gap-2">
                  <Link href="/buys">
                    <ShoppingCart className="h-4 w-4" />
                    Buy Challenge
                  </Link>
                </Button>
              </div>
            }
          />

          {accountApiError && (
            <div className="rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-foreground">
              {ACCOUNT_API_ERROR_MESSAGE}
            </div>
          )}

          <div className="mt-4 md:mt-5 space-y-3 md:space-y-4 flex-1 min-w-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-4 min-w-0">
              <div className={`lg:col-span-2 space-y-3 md:space-y-4 min-w-0 transition-all duration-300 ${blurClass}`}>
                <ProjectAnalytics {...({ stats } satisfies ProjectAnalyticsProps)} />
                <ChallengeStatsCards {...({ stats } satisfies ChallengeStatsCardsProps)} />
                <div className="flex justify-end">
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="gap-2 border-border"
                    disabled={!selectedOrderId}
                  >
                    <Link href={selectedOrderId ? `/dashboard/performance/${selectedOrderId}` : "#"}>
                      <BarChart3 className="h-3.5 w-3.5" />
                      View Detail Performance
                    </Link>
                  </Button>
                </div>
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






















