"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { Footer } from "@/components/footer"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  AlertCircle,
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Check,
  CreditCard,
  Hourglass,
  LineChart,
  Loader2,
  ShoppingCart,
  Trophy,
  Wallet,
  type LucideIcon,
} from "lucide-react"
import { listMyOrders, listMyAccounts, payOrder, type OrderWithPlan, type TradingAccount } from "@/lib/api/app-client"
import { ApiClientError } from "@/lib/api/client"
import { trackPurchaseEnhanced } from "@/components/MetaPixel"
import { GLOBAL_RULES, getAccountRules, getAccountRuleType, getMinDays, getMaxDrawdownPct } from "@/lib/rules-config"

// ---------------------------------------------------------------------------
// Order state, expressed in plain language
// ---------------------------------------------------------------------------

type OrderState = "awaiting_payment" | "preparing" | "phase1" | "phase2" | "funded" | "passed" | "failed"
type Tone = "neutral" | "info" | "success" | "danger" | "warning"
type Filter = "all" | "active" | "attention" | "completed"

const STATE_META: Record<OrderState, { label: string; hint: string; tone: Tone }> = {
  awaiting_payment: { label: "Awaiting payment", hint: "Complete payment to receive your trading account.", tone: "warning" },
  preparing: { label: "Preparing account", hint: "Payment received — your login details are on the way.", tone: "info" },
  phase1: { label: "Phase 1 · Trading", hint: "Reach the profit target while staying within the loss limits.", tone: "info" },
  phase2: { label: "Phase 2 · Trading", hint: "One more target to reach before you get funded.", tone: "info" },
  funded: { label: "Funded", hint: "You're trading a funded account. Request payouts from Withdrawals.", tone: "success" },
  passed: { label: "Passed", hint: "Challenge completed — check Achievements for your certificate.", tone: "success" },
  failed: { label: "Ended", hint: "This challenge ended because a rule was breached.", tone: "danger" },
}

const TONE_CLASSES: Record<Tone, { pill: string; dot: string }> = {
  neutral: { pill: "bg-muted text-muted-foreground", dot: "bg-muted-foreground" },
  info: { pill: "bg-sky-500/10 text-sky-700 dark:text-sky-300", dot: "bg-sky-500" },
  success: { pill: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300", dot: "bg-emerald-500" },
  danger: { pill: "bg-red-500/10 text-red-700 dark:text-red-300", dot: "bg-red-500" },
  warning: { pill: "bg-amber-500/10 text-amber-700 dark:text-amber-300", dot: "bg-amber-500" },
}

function latestAccount(accounts: TradingAccount[]): TradingAccount | null {
  const rank = (p: string | null) => (p === "funded" ? 3 : p === "phase2" ? 2 : p === "phase1" ? 1 : 0)
  return [...accounts].sort((a, b) => rank(b.phase) - rank(a.phase))[0] ?? null
}

function orderState(order: OrderWithPlan, account: TradingAccount | null): OrderState {
  if (order.status === "pending_payment") return "awaiting_payment"
  if (order.status === "failed") return "failed"
  if (order.status === "passed") return account?.phase === "funded" ? "funded" : "passed"
  if (!account) return "preparing"
  if (account.phase === "funded") return "funded"
  if (account.phase === "phase2") return "phase2"
  return "phase1"
}

function isOneStep(order: OrderWithPlan) {
  return /one|1[\s-]?step|instant/i.test(order.challenge_plans?.name ?? "")
}

const usd = (n: number, digits = 0) =>
  `$${n.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits })}`

const shortDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function OverviewPage() {
  const [orders, setOrders] = useState<OrderWithPlan[]>([])
  const [accounts, setAccounts] = useState<TradingAccount[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<Filter>("all")

  const accountsByOrder = useMemo(() => {
    const map = new Map<string, TradingAccount[]>()
    for (const a of accounts) {
      if (!a.orderId) continue
      const list = map.get(a.orderId) ?? []
      list.push(a)
      map.set(a.orderId, list)
    }
    return map
  }, [accounts])

  // Fire Purchase events when orders become paid/completed, but only once per order.
  useEffect(() => {
    if (typeof window === "undefined") return
    if (!orders.length) return

    const storageKey = "meta_pixel_purchase_tracked_order_ids"
    let tracked = new Set<string>()
    try {
      const raw = window.localStorage.getItem(storageKey)
      const ids = raw ? (JSON.parse(raw) as unknown) : []
      if (Array.isArray(ids)) tracked = new Set(ids.map((v) => String(v)))
    } catch {
      tracked = new Set()
    }

    let changed = false
    for (const order of orders) {
      if (tracked.has(order.id)) continue
      const isPaid = order.status === "active" || order.status === "passed" || order.status === "processing"
      if (!isPaid) continue

      trackPurchaseEnhanced(
        order.amountPaid,
        "USD",
        order.challenge_plans?.name ?? "GenzProp Challenge",
        order.challenge_plans?.name ?? undefined,
        order.challenge_plans?.platform ?? undefined
      )

      tracked.add(order.id)
      changed = true
    }

    if (changed) {
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(Array.from(tracked)))
      } catch {
        // ignore
      }
    }
  }, [orders])

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setError(null)
    Promise.all([listMyOrders(), listMyAccounts()])
      .then(([ordersRes, accountsRes]) => {
        if (cancelled) return
        setOrders(ordersRes.orders ?? [])
        setAccounts(accountsRes.accounts ?? [])
        setError(null)
      })
      .catch((e) => {
        if (cancelled) return
        const msg = e instanceof ApiClientError ? e.message || "Failed to load your orders." : "Failed to load your orders."
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

  const rows = useMemo(
    () =>
      orders
        .slice()
        .sort((a, b) => ((a.createdAt ?? "") < (b.createdAt ?? "") ? 1 : -1))
        .map((order) => {
          const account = latestAccount(accountsByOrder.get(order.id) ?? [])
          return { order, account, state: orderState(order, account) }
        }),
    [orders, accountsByOrder]
  )

  const summary = useMemo(() => {
    const count = (states: OrderState[]) => rows.filter((r) => states.includes(r.state)).length
    return {
      trading: count(["phase1", "phase2", "preparing"]),
      funded: count(["funded"]),
      attention: count(["awaiting_payment"]),
      passed: count(["passed", "funded"]),
      ended: count(["failed"]),
      invested: rows.filter((r) => r.state !== "awaiting_payment").reduce((sum, r) => sum + (r.order.amountPaid || 0), 0),
    }
  }, [rows])

  const visibleRows = rows.filter((r) => {
    if (filter === "active") return ["preparing", "phase1", "phase2", "funded"].includes(r.state)
    if (filter === "attention") return r.state === "awaiting_payment"
    if (filter === "completed") return r.state === "passed" || r.state === "failed"
    return true
  })

  const nextStep = rows.find((r) => r.state === "awaiting_payment") ?? rows.find((r) => r.state === "phase1" || r.state === "phase2")

  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <main className="min-w-0 flex-1 flex flex-col overflow-x-hidden p-3 sm:p-4 md:p-5 lg:ml-64 pb-8">
        <div className="mx-auto w-full max-w-[1600px] flex flex-col flex-1 min-w-0">
          <Header
            title="Overview"
            description="Everything about your challenges, in one place."
            variant="dashboard-hero"
            hideHeroInfoCards
            actions={
              <div className="flex w-full flex-wrap items-center justify-start md:justify-end gap-2">
                <Button asChild variant="outline" className="h-10 rounded-xl border-border bg-card px-4 text-sm font-medium gap-2">
                  <Link href="/dashboard">
                    <BarChart3 className="h-4 w-4" />
                    Trading dashboard
                  </Link>
                </Button>
                <Button asChild className="h-10 rounded-xl px-5 text-sm font-medium gap-2 shadow-sm shadow-primary/25">
                  <Link href="/buy-challenge">
                    <ShoppingCart className="h-4 w-4" />
                    New challenge
                  </Link>
                </Button>
              </div>
            }
          />

          {error && (
            <div className="mt-5 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-foreground">{error}</div>
          )}

          {/* Summary */}
          <div className="mt-6 grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
            <SummaryItem icon={LineChart} tone="violet" label="In progress" value={summary.trading} hint="Challenges you're trading now" loading={isLoading} />
            <SummaryItem icon={BadgeCheck} tone="emerald" label="Funded" value={summary.funded} hint="Accounts eligible for payouts" loading={isLoading} />
            <SummaryItem
              icon={AlertCircle}
              tone="amber"
              label="Needs action"
              value={summary.attention}
              hint={summary.attention ? "Orders waiting for payment" : "Nothing waiting on you"}
              loading={isLoading}
              highlight={summary.attention > 0}
            />
            <SummaryItem
              icon={Wallet}
              tone="sky"
              label="Total invested"
              value={usd(summary.invested)}
              hint={`${summary.passed} passed · ${summary.ended} ended`}
              loading={isLoading}
            />
          </div>

          {/* Next step */}
          {!isLoading && nextStep && <NextStep row={nextStep} />}

          {/* Orders */}
          <section className="mt-6 flex-1 min-w-0">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold tracking-tight text-foreground">Your challenges</h2>
                <p className="mt-0.5 text-sm text-muted-foreground">Track progress, finish payments, and open analytics for each account.</p>
              </div>
              {rows.length > 0 && (
                <div className="inline-flex w-fit max-w-full overflow-x-auto rounded-xl border border-border bg-card p-1 text-sm">
                  {(
                    [
                      ["all", `All (${rows.length})`],
                      ["active", "Active"],
                      ["attention", "Needs payment"],
                      ["completed", "Completed"],
                    ] as [Filter, string][]
                  ).map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setFilter(key)}
                      className={`whitespace-nowrap rounded-lg px-3.5 py-1.5 font-medium transition-colors ${
                        filter === key ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {Array.from({ length: 2 }).map((_, i) => (
                  <Card key={i} className="h-64 rounded-2xl border border-border/70 bg-card shadow-none animate-pulse" />
                ))}
              </div>
            ) : rows.length === 0 ? (
              <EmptyOrders />
            ) : visibleRows.length === 0 ? (
              <Card className="rounded-2xl border border-dashed border-border bg-card/50 p-10 text-center text-sm text-muted-foreground shadow-none">
                No challenges in this view.
              </Card>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {visibleRows.map((r) => (
                  <ChallengeCard key={r.order.id} order={r.order} account={r.account} state={r.state} />
                ))}
              </div>
            )}
          </section>

          <div className="mt-10">
            <Footer />
          </div>
        </div>
      </main>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Pieces
// ---------------------------------------------------------------------------

const ICON_TONES = {
  violet: "bg-[#efecff] text-[#5235ff]",
  emerald: "bg-emerald-50 text-emerald-600",
  amber: "bg-amber-50 text-amber-600",
  sky: "bg-sky-50 text-sky-600",
} as const

function SummaryItem({
  icon: Icon,
  tone,
  label,
  value,
  hint,
  loading,
  highlight,
}: {
  icon: LucideIcon
  tone: keyof typeof ICON_TONES
  label: string
  value: string | number
  hint: string
  loading: boolean
  highlight?: boolean
}) {
  return (
    <div
      className={`rounded-2xl border bg-card p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)] sm:p-5 ${
        highlight ? "border-amber-300 ring-4 ring-amber-100" : "border-border"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${ICON_TONES[tone]}`}>
          <Icon className="h-[18px] w-[18px]" />
        </span>
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-tight tabular-nums text-foreground sm:text-3xl">
        {loading ? <span className="inline-block h-8 w-16 animate-pulse rounded-md bg-muted align-middle" /> : value}
      </p>
      <p className="mt-1 truncate text-xs text-muted-foreground sm:text-sm">{hint}</p>
    </div>
  )
}

function usePay(orderId: string) {
  const [paying, setPaying] = useState(false)
  const [payError, setPayError] = useState<string | null>(null)
  const pay = async () => {
    setPaying(true)
    setPayError(null)
    try {
      const { checkoutUrl } = await payOrder(orderId)
      window.location.href = checkoutUrl
    } catch (e) {
      setPayError(e instanceof ApiClientError ? e.message : "Could not start payment. Please try again.")
      setPaying(false)
    }
  }
  return { pay, paying, payError }
}

function NextStep({ row }: { row: { order: OrderWithPlan; account: TradingAccount | null; state: OrderState } }) {
  const { pay, paying, payError } = usePay(row.order.id)
  const plan = row.order.challenge_plans
  const title = plan ? `${usd(plan.size)} ${plan.name}` : "Your challenge"
  const awaiting = row.state === "awaiting_payment"

  return (
    <div className="relative mt-4 overflow-hidden rounded-2xl bg-[#0b1020] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_120%_at_100%_0%,rgba(82,53,255,0.45),transparent_60%)]" />
      <div className="relative flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex min-w-0 items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15">
            {awaiting ? <CreditCard className="h-5 w-5 text-amber-300" /> : <BarChart3 className="h-5 w-5 text-[#a89bff]" />}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Next step</p>
            <p className="mt-1 text-base font-semibold sm:text-lg">
              {awaiting ? `Complete payment for your ${title}` : `Keep trading your ${title}`}
            </p>
            <p className="mt-0.5 text-sm text-slate-300">{STATE_META[row.state].hint}</p>
            {payError && <p className="mt-1 text-sm text-red-300">{payError}</p>}
          </div>
        </div>
        {awaiting ? (
          <Button onClick={pay} disabled={paying} className="h-10 shrink-0 gap-2 rounded-xl bg-white px-5 text-[#0b1020] hover:bg-white/90">
            {paying ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
            Pay {usd(row.order.amountPaid, 2)}
          </Button>
        ) : (
          <Button asChild className="h-10 shrink-0 gap-2 rounded-xl bg-white px-5 text-[#0b1020] hover:bg-white/90">
            <Link href={`/dashboard?orderId=${encodeURIComponent(row.order.id)}`}>
              Open analytics <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        )}
      </div>
    </div>
  )
}

function ProgressSteps({ order, state }: { order: OrderWithPlan; state: OrderState }) {
  const steps = isOneStep(order) ? ["Payment", "Evaluation", "Funded"] : ["Payment", "Phase 1", "Phase 2", "Funded"]
  const oneStep = steps.length === 3
  const currentIndex: number = (() => {
    switch (state) {
      case "awaiting_payment":
        return 0
      case "preparing":
      case "phase1":
        return 1
      case "phase2":
        return oneStep ? 1 : 2
      case "funded":
      case "passed":
        return steps.length // everything complete
      case "failed":
        return -1
    }
  })()

  return (
    <ol className="flex items-center gap-2">
      {steps.map((step, i) => {
        const done = currentIndex > i || (state === "passed" && i < steps.length)
        const current = currentIndex === i
        const failedHere = state === "failed" && i === steps.length - 1
        return (
          <li key={step} className="flex flex-1 items-center gap-2 min-w-0">
            <div className="flex flex-col items-start gap-1.5 min-w-0 w-full">
              <div
                className={`h-1.5 w-full rounded-full ${
                  failedHere ? "bg-red-500/60" : done ? "bg-emerald-500" : current ? "bg-sky-500" : "bg-muted"
                }`}
              />
              <span
                className={`flex items-center gap-1 text-xs truncate ${
                  done || current ? "font-medium text-foreground" : "text-muted-foreground"
                }`}
              >
                {done && <Check className="h-3 w-3 text-emerald-600" />}
                {step}
              </span>
            </div>
          </li>
        )
      })}
    </ol>
  )
}

function ChallengeCard({ order, account, state }: { order: OrderWithPlan; account: TradingAccount | null; state: OrderState }) {
  const { pay, paying, payError } = usePay(order.id)
  const meta = STATE_META[state]
  const tone = TONE_CLASSES[meta.tone]
  const plan = order.challenge_plans
  const size = plan?.size ?? 0

  const target = account && account.profitTarget > 0 && size > 0 ? (size * account.profitTarget) / 100 : 0
  const progress = target > 0 ? Math.max(0, Math.min(100, ((account?.totalPl ?? 0) / target) * 100)) : 0
  const showAccount = account && ["phase1", "phase2", "funded"].includes(state)

  // Rule limits for this plan, straight from lib/rules-config.ts.
  const ruleType = getAccountRuleType(plan?.name)
  const rules = getAccountRules(plan?.name)
  const stage: "challenge" | "funded" = state === "funded" ? "funded" : "challenge"
  const maxDdPct = getMaxDrawdownPct(ruleType, stage)
  const minDays = getMinDays(ruleType, stage)
  const usdPct = (pct: number) => (size > 0 ? usd(Math.round((size * pct) / 100)) : `${pct}%`)

  return (
    <Card className="flex flex-col rounded-2xl border border-border bg-card shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition-shadow hover:shadow-[0_12px_32px_rgba(16,24,40,0.08)]">
      <div className="p-5 sm:p-6 flex-1">
        {/* Title row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0b1020] text-xs font-bold text-white">
            {size >= 1000 ? `${Math.round(size / 1000)}K` : "—"}
          </span>
          <div className="min-w-0">
            <h3 className="text-lg font-semibold tracking-tight text-foreground">
              {plan ? `${usd(size)} ${plan.name}` : "Challenge"}
            </h3>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {[plan?.platform?.toUpperCase(), `Purchased ${shortDate(order.createdAt)}`].filter(Boolean).join(" · ")}
            </p>
          </div>
          </div>
          <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${tone.pill}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} />
            {meta.label}
          </span>
        </div>

        <p className="mt-3 text-sm text-muted-foreground">{meta.hint}</p>

        {/* Journey */}
        <div className="mt-5">
          <ProgressSteps order={order} state={state} />
        </div>

        {/* Account figures */}
        {showAccount && account && (
          <div className="mt-5 rounded-xl border border-border bg-muted/50 p-4">
            <div className="grid grid-cols-3 gap-4">
              <Figure label="Balance" value={usd(account.balance, 2)} />
              <Figure label="Equity" value={usd(account.equity, 2)} />
              <Figure
                label="Total P/L"
                value={`${account.totalPl >= 0 ? "+" : "−"}${usd(Math.abs(account.totalPl), 2)}`}
                className={account.totalPl > 0 ? "text-emerald-600 dark:text-emerald-400" : account.totalPl < 0 ? "text-red-600 dark:text-red-400" : ""}
              />
            </div>
            {target > 0 && state !== "funded" && (
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    Profit target {account.profitTarget}% ({usd(target)})
                  </span>
                  <span className="font-medium tabular-nums text-foreground">{progress.toFixed(0)}%</span>
                </div>
                <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-border">
                  <div className="h-full rounded-full bg-gradient-to-r from-[#5235ff] to-[#00b386] transition-all" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}
            <p className="mt-3 text-xs text-muted-foreground">
              Login <span className="font-mono text-foreground">{account.login}</span>
              {account.server ? <> · {account.server}</> : null}
            </p>
          </div>
        )}

        {/* Rule limits that apply to this account */}
        {state !== "awaiting_payment" && state !== "failed" && (
          <div className="mt-5 rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {rules.label} · rules for this account
              </p>
              <Link href="/rules" className="text-xs font-medium text-primary hover:underline">
                Full rules
              </Link>
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2.5 sm:grid-cols-3">
              <RuleFigure label="Daily loss limit" value={`${GLOBAL_RULES.dailyDrawdownPct}%`} sub={usdPct(GLOBAL_RULES.dailyDrawdownPct)} />
              <RuleFigure label="Max loss limit" value={`${maxDdPct}%`} sub={usdPct(maxDdPct)} />
              <RuleFigure
                label={minDays.tradingDays > 0 ? "Minimum days" : "Profitable days"}
                value={String(minDays.total)}
                sub={minDays.tradingDays > 0 ? `${minDays.profitableDays} profitable + ${minDays.tradingDays} trading` : `${GLOBAL_RULES.profitableDayPct}% profit each`}
              />
              <RuleFigure label="Min holding time" value={rules.minHoldingTime} />
              <RuleFigure label="Leverage" value={rules.leverage} />
              <RuleFigure label="Consistency rule" value="None" />
            </dl>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              Loss limits are static from your initial balance and include floating losses. Counters reset at{" "}
              {GLOBAL_RULES.dailyResetUtc}. Overnight holding is included; weekend holding ({GLOBAL_RULES.weekendWindow})
              needs the paid add-on.{" "}
              {stage === "funded" ? rules.newsFunded === "—" ? null : `News: ${rules.newsFunded}.` : "News trading is unrestricted during the challenge."}
            </p>
          </div>
        )}

        {state === "preparing" && (
          <div className="mt-5 flex items-center gap-3 rounded-xl bg-muted/40 p-4 text-sm text-muted-foreground">
            <Hourglass className="h-4 w-4 shrink-0" />
            We&apos;ll email you and show your login details here as soon as the account is ready.
          </div>
        )}

        {payError && <p className="mt-3 text-sm text-destructive">{payError}</p>}
      </div>

      {/* Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-b-2xl border-t border-border bg-muted/40 px-5 py-3.5 sm:px-6">
        <span className="text-xs text-muted-foreground">
          Order <span className="font-mono">#{order.id.slice(0, 8)}</span> · {usd(order.amountPaid, 2)}
        </span>
        {state === "awaiting_payment" ? (
          <Button size="sm" onClick={pay} disabled={paying} className="h-9 rounded-lg px-4 gap-2">
            {paying ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
            Complete payment
          </Button>
        ) : state === "passed" ? (
          <Button asChild size="sm" variant="outline" className="h-9 rounded-lg px-4 gap-2">
            <Link href="/dashboard/achievement">
              <Trophy className="h-4 w-4" /> View certificate
            </Link>
          </Button>
        ) : state === "preparing" ? (
          <Button size="sm" variant="outline" disabled className="h-9 rounded-lg px-4">
            Awaiting delivery
          </Button>
        ) : (
          <Button asChild size="sm" variant={state === "failed" ? "outline" : "default"} className="h-9 rounded-lg px-4 gap-2">
            <Link href={`/dashboard?orderId=${encodeURIComponent(order.id)}`}>
              <BarChart3 className="h-4 w-4" /> View analytics
            </Link>
          </Button>
        )}
      </div>
    </Card>
  )
}

function RuleFigure({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="min-w-0">
      <dt className="truncate text-[11px] text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 truncate text-sm font-semibold tabular-nums text-foreground">{value}</dd>
      {sub ? <p className="truncate text-[11px] text-muted-foreground">{sub}</p> : null}
    </div>
  )
}

function Figure({ label, value, className = "" }: { label: string; value: string; className?: string }) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`mt-0.5 truncate text-base font-semibold tabular-nums text-foreground ${className}`}>{value}</p>
    </div>
  )
}

function EmptyOrders() {
  const steps = [
    { title: "Pick a challenge", text: "Choose an account size and platform that fits your trading." },
    { title: "Pass the evaluation", text: "Hit the profit target while respecting the loss limits." },
    { title: "Get funded", text: "Trade a funded account and request payouts." },
  ]
  return (
    <Card className="rounded-2xl border border-border/70 bg-card p-6 sm:p-10 shadow-none">
      <div className="mx-auto max-w-2xl text-center">
        <h3 className="text-xl font-semibold tracking-tight text-foreground">You don&apos;t have any challenges yet</h3>
        <p className="mt-2 text-sm text-muted-foreground">Here&apos;s how it works — it takes a few minutes to get started.</p>
      </div>
      <ol className="mx-auto mt-8 grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
        {steps.map((s, i) => (
          <li key={s.title} className="rounded-xl bg-muted/40 p-4">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-foreground text-xs font-semibold text-background">{i + 1}</span>
            <p className="mt-3 text-sm font-semibold text-foreground">{s.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{s.text}</p>
          </li>
        ))}
      </ol>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
        <Button asChild className="h-10 rounded-xl px-5 gap-2">
          <Link href="/buy-challenge">
            Start a challenge <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-10 rounded-xl px-5">
          <Link href="/rules">Read the rules</Link>
        </Button>
      </div>
    </Card>
  )
}
