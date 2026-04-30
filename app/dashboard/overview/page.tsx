"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { Footer } from "@/components/footer"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, BarChart3, ShoppingCart, CalendarDays, CheckCircle2, XCircle, Clock3 } from "lucide-react"
import { getMyAccount, type Order } from "@/lib/api/auth"
import { ApiClientError } from "@/lib/api/client"

function orderStageLabel(order: Order): "Live" | "Stage 2" | "Phase 1" | "Pending" {
  if (String(order.status).toLowerCase() === "pending") return "Pending"
  if (order.live_credentials) return "Live"
  if (order.stage2_credentials) return "Stage 2"
  if (order.credentials) return "Phase 1"
  return "Phase 1"
}

function stageBadgeClasses(stage: ReturnType<typeof orderStageLabel>) {
  if (stage === "Live") return "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
  if (stage === "Stage 2") return "bg-primary/15 text-primary border-primary/20"
  if (stage === "Pending") return "bg-muted text-muted-foreground border-border"
  return "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
}

export default function OverviewPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setError(null)
    getMyAccount()
      .then((res) => {
        if (cancelled) return
        setOrders(res.orders ?? [])
        setError(null)
      })
      .catch((e) => {
        if (cancelled) return
        const msg =
          e instanceof ApiClientError
            ? e.message || "Failed to load your orders."
            : "Failed to load your orders."
        setOrders([])
        setError(msg)
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const summary = useMemo(() => {
    const total = orders.length
    const pending = orders.filter((o) => String(o.status).toLowerCase() === "pending").length
    const active = total - pending
    const passed = orders.filter((o) => String(o.status).toLowerCase() === "passed").length
    const failed = orders.filter((o) => String(o.status).toLowerCase() === "failed").length
    return { total, active, pending, passed, failed }
  }, [orders])

  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <main className="min-w-0 flex-1 flex flex-col overflow-x-hidden p-3 sm:p-4 md:p-5 lg:ml-64 pb-8">
        <div className="mx-auto w-full max-w-[1400px] flex flex-col flex-1 min-w-0">
          <Header
            title="Overview"
            description="Your account snapshot and all orders in one place."
            variant="dashboard-hero"
            hideHeroInfoCards
            actions={
              <div className="flex w-full flex-wrap items-center justify-start md:justify-end gap-2 md:gap-3">
                <Button
                  asChild
                  variant="outline"
                  className="h-9 rounded-full border-border/70 bg-background/80 px-4 text-xs sm:text-sm font-semibold text-foreground shadow-sm hover:bg-background hover:border-border focus-visible:ring-2 focus-visible:ring-primary/40 gap-2"
                >
                  <Link href="/dashboard">
                    <BarChart3 className="h-4 w-4" />
                    Go to Dashboard
                  </Link>
                </Button>
                <Button
                  asChild
                  className="h-9 rounded-full bg-gradient-to-r from-primary to-primary/80 px-5 text-xs sm:text-sm font-semibold text-primary-foreground shadow-md shadow-primary/30 hover:from-primary/95 hover:to-primary/80 hover:shadow-lg hover:shadow-primary/40 transition-all duration-300 gap-2"
                >
                  <Link href="/dashboard/buys">
                    <ShoppingCart className="h-4 w-4" />
                    Buy Challenge
                  </Link>
                </Button>
              </div>
            }
          />

          <Card className="overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-br from-card via-card to-muted/30 shadow-sm">
            <div className="relative p-5 sm:p-6">
              <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" aria-hidden />
              <div className="absolute -left-24 -bottom-24 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" aria-hidden />

              <div className="relative flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                      Account snapshot
                    </p>
                    <h2 className="mt-1 text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                      Orders overview
                    </h2>
                    <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                      Quick view of your challenges, statuses, and order history.
                    </p>
                  </div>
                  <Badge variant="outline" className="w-fit rounded-full border-border/70 bg-background/40 px-3 py-1 text-xs">
                    {isLoading ? "Loading…" : `${summary.total} total`}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2.5">
                  <Stat label="Active" value={summary.active} Icon={BarChart3} tone="primary" />
                  <Stat label="Pending" value={summary.pending} Icon={Clock3} tone="muted" />
                  <Stat label="Passed" value={summary.passed} Icon={CheckCircle2} tone="success" />
                  <Stat label="Failed" value={summary.failed} Icon={XCircle} tone="danger" />
                  <div className="hidden lg:block">
                    <Stat
                      label="Last updated"
                      value={new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      Icon={CalendarDays}
                      tone="muted"
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <div className="mt-4 md:mt-5 flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-foreground tracking-tight">Your orders</h3>
                <p className="text-xs text-muted-foreground">Select an order to view performance or details.</p>
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-foreground">
                {error}
              </div>
            )}

            {isLoading ? (
              <div className="mt-3 flex gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="min-w-[320px] sm:min-w-[360px] snap-start rounded-2xl border border-border/70 bg-card/60 p-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm font-medium">Loading…</span>
                    </div>
                  </Card>
                ))}
              </div>
            ) : orders.length === 0 ? (
              <Card className="relative mt-3 overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-br from-card via-card to-muted/30 p-6">
                <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-purple-500/10 blur-3xl" aria-hidden />
                <div className="pointer-events-none absolute -left-24 -bottom-24 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" aria-hidden />
                <div className="relative flex flex-col items-center text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border/60 bg-background/50 shadow-sm">
                    <ShoppingCart className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="mt-4 text-base font-bold tracking-tight text-foreground">
                    No orders found yet
                  </p>
                  <p className="mt-1 max-w-md text-sm text-muted-foreground">
                    When you purchase a challenge, your order will show up here with status and analytics.
                  </p>
                  <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                    <Button
                      asChild
                      className="h-9 rounded-full bg-purple-600 px-5 text-xs sm:text-sm font-semibold text-white hover:bg-purple-700"
                    >
                      <Link href="/dashboard/buys">Buy a challenge</Link>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      className="h-9 rounded-full border-border/70 bg-background/60 px-5 text-xs sm:text-sm font-semibold hover:bg-background"
                    >
                      <Link href="/rules">View rules</Link>
                    </Button>
                  </div>
                  <p className="mt-4 text-xs text-muted-foreground">
                    Orders will appear in the row above after purchase.
                  </p>
                </div>
              </Card>
            ) : (
              <div className="mt-3 flex gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory">
                {orders
                  .slice()
                  .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
                  .map((o) => (
                    <OrderCard key={o.order_id} order={o} />
                  ))}
              </div>
            )}
          </div>

          <div className="mt-8">
            <Footer />
          </div>
        </div>
      </main>
    </div>
  )
}

function Stat({
  label,
  value,
  Icon,
  tone,
}: {
  label: string
  value: string | number
  Icon: React.ComponentType<{ className?: string }>
  tone: "primary" | "success" | "danger" | "muted"
}) {
  const toneClasses =
    tone === "success"
      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
      : tone === "danger"
        ? "bg-destructive/10 border-destructive/20 text-destructive"
        : tone === "primary"
          ? "bg-primary/10 border-primary/20 text-primary"
          : "bg-muted/40 border-border/60 text-muted-foreground"

  return (
    <div className={`rounded-2xl border p-3 sm:p-3.5 ${toneClasses}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-widest opacity-80">{label}</p>
          <p className="mt-1 text-lg sm:text-xl font-bold tabular-nums text-foreground">{value}</p>
        </div>
        <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-xl bg-background/40 border border-border/50">
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </div>
  )
}

function OrderCard({ order }: { order: Order }) {
  const stage = orderStageLabel(order)
  const createdLabel =
    order.created_at && String(order.created_at).trim() !== ""
      ? new Date(order.created_at).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "—"

  return (
    <Card className="group relative min-w-[320px] sm:min-w-[360px] snap-start overflow-hidden rounded-3xl border border-border/70 bg-card shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
      <div className="pointer-events-none absolute -inset-24 bg-[radial-gradient(circle_at_20%_0%,rgba(168,85,247,0.22),transparent_55%)] opacity-60" aria-hidden />
      <div className="pointer-events-none absolute -inset-24 bg-[radial-gradient(circle_at_90%_20%,rgba(16,185,129,0.14),transparent_55%)] opacity-70" aria-hidden />

      <div className="relative p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              {order.challenge_type} • ${order.account_size}
            </p>
            <p className="mt-1 text-base font-bold text-foreground truncate" title={order.order_id}>
              {order.order_id}
            </p>
          </div>
          <span className={`shrink-0 inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${stageBadgeClasses(stage)}`}>
            {stage}
          </span>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="rounded-2xl border border-border/60 bg-background/40 px-3 py-2 backdrop-blur">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Platform</p>
            <p className="mt-1 text-sm font-semibold text-foreground">{order.platform || "—"}</p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-background/40 px-3 py-2 backdrop-blur">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Created</p>
            <p className="mt-1 text-sm font-semibold text-foreground">{createdLabel}</p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button
            asChild
            className="h-9 rounded-2xl px-3 text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Link href="/dashboard">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </Link>
          </Button>
        </div>
      </div>

      <div className="h-1 w-full bg-gradient-to-r from-purple-500/35 via-primary/25 to-transparent" />
    </Card>
  )
}

