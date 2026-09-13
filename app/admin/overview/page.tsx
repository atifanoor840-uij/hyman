"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { AdminShell } from "@/components/admin/admin-shell"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowUpRight, ShoppingCart, Users, ShieldCheck, Wallet } from "lucide-react"
import { adminListOrders, adminListUsers, adminListKyc, adminListPayouts } from "@/lib/api/app-client"

function isToday(iso: string | null) {
  if (!iso) return false
  const d = new Date(iso)
  const now = new Date()
  return d.toDateString() === now.toDateString()
}

function StatCard({
  label,
  value,
  tone = "default",
  Icon,
}: {
  label: string
  value: string
  tone?: "default" | "success" | "warning"
  Icon: React.ComponentType<{ className?: string }>
}) {
  const toneClass =
    tone === "success"
      ? "bg-emerald-500/10 border-emerald-500/20"
      : tone === "warning"
        ? "bg-amber-500/10 border-amber-500/20"
        : "bg-muted/40 border-border/60"

  return (
    <Card className={`rounded-2xl border ${toneClass} p-5`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{label}</p>
          <p className="mt-2 text-3xl font-bold tabular-nums text-foreground">{value}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-border/60 bg-background/30">
          <Icon className="h-5 w-5 text-muted-foreground" />
        </div>
      </div>
    </Card>
  )
}

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<{ ordersToday: number; newUsers: number; kycPending: number; withdrawalsPending: number } | null>(null)

  useEffect(() => {
    Promise.all([adminListOrders(), adminListUsers(), adminListKyc(), adminListPayouts()])
      .then(([orders, users, kyc, payouts]) => {
        setStats({
          ordersToday: orders.orders.filter((o) => isToday(o.createdAt)).length,
          newUsers: users.users.filter((u) => isToday(u.createdAt)).length,
          kycPending: kyc.submissions.filter((k) => k.status === "pending").length,
          withdrawalsPending: payouts.payouts.filter((p) => p.status === "requested").length,
        })
      })
      .catch(() => setStats(null))
  }, [])

  const val = (n: number | undefined) => (n == null ? "—" : String(n))

  return (
    <AdminShell
      title="Admin overview"
      description="Monitor operations, review compliance, and manage the platform."
      actions={
        <Button asChild className="h-9 rounded-full px-4 text-xs font-semibold">
          <Link href="/dashboard">
            <ArrowUpRight className="h-4 w-4 mr-2" />
            Open user dashboard
          </Link>
        </Button>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-4 min-w-0">
        <div className="lg:col-span-2 space-y-3 md:space-y-4 min-w-0">
          <Card className="overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-br from-card via-card to-muted/30 shadow-sm">
            <div className="relative p-5 sm:p-6">
              <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" aria-hidden />
              <div className="absolute -left-24 -bottom-24 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" aria-hidden />

              <div className="relative flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                      Operations snapshot
                    </p>
                    <h2 className="mt-1 text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                      Platform health
                    </h2>
                    <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                      Quick view of key queues — orders, users, compliance, and payouts.
                    </p>
                  </div>
                  <Badge variant="outline" className="w-fit rounded-full border-border/70 bg-background/40 px-3 py-1 text-xs">
                    Live
                  </Badge>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
                  <StatCard label="Orders today" value={val(stats?.ordersToday)} Icon={ShoppingCart} />
                  <StatCard label="New users" value={val(stats?.newUsers)} Icon={Users} />
                  <StatCard label="KYC pending" value={val(stats?.kycPending)} Icon={ShieldCheck} tone="warning" />
                  <StatCard label="Withdrawals" value={val(stats?.withdrawalsPending)} Icon={Wallet} />
                </div>
              </div>
            </div>
          </Card>

          <Card className="rounded-2xl border border-border/80 bg-card shadow-sm overflow-hidden">
            <div className="border-b border-border/80 bg-muted/20 px-4 sm:px-6 py-3.5">
              <h3 className="text-base font-semibold text-foreground tracking-tight">Quick actions</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Jump into the most common admin flows.</p>
            </div>
            <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { title: "Review orders", href: "/admin/orders", desc: "Payment status, timelines, and fulfillment." },
                { title: "Manage users", href: "/admin/users", desc: "Search, verify, and support users." },
                { title: "KYC queue", href: "/admin/kyc", desc: "Compliance review and status checks." },
                { title: "Withdrawals", href: "/admin/withdrawals", desc: "Approve and track payout requests." },
                { title: "Pricing catalog", href: "/admin/pricing", desc: "Manage challenge plans and pricing." },
                { title: "Coupons", href: "/admin/coupons", desc: "Create and manage discount codes." },
                { title: "Affiliates", href: "/admin/affiliates", desc: "Enroll affiliates and track referral commissions." },
              ].map((x) => (
                <Link
                  key={x.href}
                  href={x.href}
                  className="group rounded-2xl border border-border/70 bg-muted/20 p-5 hover:bg-muted/35 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-base font-semibold text-foreground">{x.title}</p>
                      <p className="text-sm text-muted-foreground mt-1">{x.desc}</p>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-3 md:space-y-4 min-w-0">
          <Card className="rounded-2xl border border-border/80 bg-card shadow-sm overflow-hidden">
            <div className="border-b border-border/80 bg-muted/20 px-4 sm:px-5 py-3.5">
              <h3 className="text-base font-semibold text-foreground tracking-tight">Admin tools</h3>
              <p className="text-[11px] text-muted-foreground">Operational shortcuts</p>
            </div>
            <div className="p-4 sm:p-5 space-y-2">
              <Button asChild variant="outline" className="h-11 w-full justify-between rounded-xl border-border/70">
                <Link href="/admin/container">
                  Container
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-11 w-full justify-between rounded-xl border-border/70">
                <Link href="/admin/payment-links">
                  Payment links
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </AdminShell>
  )
}

