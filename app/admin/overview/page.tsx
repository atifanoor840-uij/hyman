"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { AdminShell } from "@/components/admin/admin-shell"
import { Button } from "@/components/ui/button"
import {
  ArrowRight,
  ArrowUpRight,
  Boxes,
  Handshake,
  Link as LinkIcon,
  Mail,
  Percent,
  ShieldCheck,
  ShoppingCart,
  Tag,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react"
import { adminListOrders, adminListUsers, adminListKyc, adminListPayouts } from "@/lib/api/app-client"

type Stats = { ordersToday: number; newUsers: number; kycPending: number; withdrawalsPending: number }

function isToday(iso: string | null) {
  if (!iso) return false
  return new Date(iso).toDateString() === new Date().toDateString()
}

const TONES = {
  violet: "bg-[#efecff] text-[#5235ff]",
  sky: "bg-sky-50 text-sky-600",
  amber: "bg-amber-50 text-amber-600",
  emerald: "bg-emerald-50 text-emerald-600",
} as const

function StatCard({
  label,
  hint,
  value,
  href,
  Icon,
  tone,
  loading,
}: {
  label: string
  hint: string
  value: number | undefined
  href: string
  Icon: LucideIcon
  tone: keyof typeof TONES
  loading: boolean
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-border bg-card p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition-shadow hover:shadow-[0_12px_32px_rgba(16,24,40,0.08)]"
    >
      <div className="flex items-center justify-between">
        <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${TONES[tone]}`}>
          <Icon className="h-5 w-5" />
        </span>
        <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-foreground" />
      </div>
      <p className="mt-4 text-sm font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-3xl font-semibold tracking-tight tabular-nums text-foreground">
        {loading ? <span className="inline-block h-8 w-14 animate-pulse rounded-md bg-muted align-middle" /> : value ?? "—"}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </Link>
  )
}

const QUICK_ACTIONS: { title: string; desc: string; href: string; Icon: LucideIcon }[] = [
  { title: "Review orders", href: "/admin/orders", desc: "Payment status, timelines, and fulfillment.", Icon: ShoppingCart },
  { title: "Manage users", href: "/admin/users", desc: "Search, verify, and support users.", Icon: Users },
  { title: "Pricing catalog", href: "/admin/pricing", desc: "Manage challenge plans and pricing.", Icon: Tag },
  { title: "Coupons", href: "/admin/coupons", desc: "Create and manage discount codes.", Icon: Percent },
  { title: "Affiliates", href: "/admin/affiliates", desc: "Enroll affiliates and track commissions.", Icon: Handshake },
  { title: "Email sender", href: "/admin/email-sender", desc: "Send announcements and notices.", Icon: Mail },
]

const TOOLS: { title: string; href: string; Icon: LucideIcon }[] = [
  { title: "Container", href: "/admin/container", Icon: Boxes },
  { title: "Payment links", href: "/admin/payment-links", Icon: LinkIcon },
]

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

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
      .finally(() => setLoading(false))
  }, [])

  const queues = [
    { label: "KYC submissions", count: stats?.kycPending, href: "/admin/kyc", Icon: ShieldCheck, tone: "amber" as const },
    { label: "Withdrawal requests", count: stats?.withdrawalsPending, href: "/admin/withdrawals", Icon: Wallet, tone: "emerald" as const },
  ]
  const pendingTotal = (stats?.kycPending ?? 0) + (stats?.withdrawalsPending ?? 0)

  return (
    <AdminShell
      title="Admin overview"
      description="Monitor operations, review compliance, and manage the platform."
      actions={
        <Button asChild variant="outline" className="h-10 gap-2 rounded-xl border-border bg-card px-4 text-sm font-semibold">
          <Link href="/dashboard">
            <ArrowUpRight className="h-4 w-4" />
            Open user dashboard
          </Link>
        </Button>
      }
    >
      {/* KPIs */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4 xl:grid-cols-4">
        <StatCard label="Orders today" hint="New orders since midnight" value={stats?.ordersToday} href="/admin/orders" Icon={ShoppingCart} tone="violet" loading={loading} />
        <StatCard label="New users today" hint="Accounts created today" value={stats?.newUsers} href="/admin/users" Icon={Users} tone="sky" loading={loading} />
        <StatCard label="KYC pending" hint="Awaiting compliance review" value={stats?.kycPending} href="/admin/kyc" Icon={ShieldCheck} tone="amber" loading={loading} />
        <StatCard label="Withdrawals pending" hint="Payout requests to process" value={stats?.withdrawalsPending} href="/admin/withdrawals" Icon={Wallet} tone="emerald" loading={loading} />
      </div>

      {!loading && !stats && (
        <div className="mt-4 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-foreground">
          Couldn&apos;t load platform stats. Check your admin session and try refreshing.
        </div>
      )}

      <div className="mt-4 grid grid-cols-1 gap-3 md:gap-4 lg:grid-cols-3">
        {/* Quick actions */}
        <section className="rounded-2xl border border-border bg-card shadow-[0_1px_2px_rgba(16,24,40,0.04)] lg:col-span-2">
          <div className="flex items-center justify-between border-b border-border px-5 py-4 sm:px-6">
            <div>
              <h2 className="text-base font-semibold tracking-tight text-foreground">Quick actions</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">Jump into the most common admin flows.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-px bg-border sm:grid-cols-2">
            {QUICK_ACTIONS.map(({ title, desc, href, Icon }) => (
              <Link key={href} href={href} className="group flex items-start gap-4 bg-card p-5 transition-colors hover:bg-muted/60 sm:p-6">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-muted/60 text-foreground transition-colors group-hover:border-primary/30 group-hover:bg-accent group-hover:text-accent-foreground">
                  <Icon className="h-[18px] w-[18px]" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2 text-sm font-semibold text-foreground">
                    {title}
                    <ArrowRight className="h-4 w-4 -translate-x-1 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                  </span>
                  <span className="mt-1 block text-sm text-muted-foreground">{desc}</span>
                </span>
              </Link>
            ))}
          </div>
        </section>

        <div className="space-y-3 md:space-y-4">
          {/* Needs attention */}
          <section className="relative overflow-hidden rounded-2xl bg-[#0b1020] p-5 text-white sm:p-6">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_120%_at_100%_0%,rgba(82,53,255,0.45),transparent_60%)]" />
            <div className="relative">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Needs attention</p>
              <p className="mt-2 text-4xl font-semibold tabular-nums">{loading ? "…" : stats ? pendingTotal : "—"}</p>
              <p className="mt-1 text-sm text-slate-300">Items waiting in compliance queues</p>
              <ul className="mt-5 space-y-2">
                {queues.map(({ label, count, href, Icon }) => (
                  <li key={href}>
                    <Link href={href} className="flex items-center justify-between gap-3 rounded-xl bg-white/[0.06] px-3.5 py-3 ring-1 ring-white/10 transition hover:bg-white/10">
                      <span className="flex items-center gap-3 text-sm font-medium">
                        <Icon className="h-4 w-4 text-[#a89bff]" />
                        {label}
                      </span>
                      <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-semibold tabular-nums">{count ?? "—"}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Tools */}
          <section className="rounded-2xl border border-border bg-card shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
            <div className="border-b border-border px-5 py-4">
              <h2 className="text-base font-semibold tracking-tight text-foreground">Admin tools</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">Operational shortcuts</p>
            </div>
            <ul className="divide-y divide-border">
              {TOOLS.map(({ title, href, Icon }) => (
                <li key={href}>
                  <Link href={href} className="flex items-center justify-between px-5 py-3.5 text-sm font-medium text-foreground transition-colors hover:bg-muted/60">
                    <span className="flex items-center gap-3">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      {title}
                    </span>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </AdminShell>
  )
}
