"use client"

import { useEffect, useState, useMemo, useRef } from "react"
import Link from "next/link"
import { Search, Mail, Bell, Loader2, KeyRound, Copy, Check, Wallet, TrendingUp, ChevronLeft, Server, MonitorSmartphone, Activity, User } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { MobileNav } from "./mobile-nav"
import {
  getMyAccount,
  getOrderCredentialsForStats,
  findOrderById,
  orderIdsMatch,
  type Order,
  type OrderCredentials,
} from "@/lib/api/auth"
import { getUser } from "@/lib/auth-utils"
import { getShowMyTradesStats } from "@/lib/api/showmytrades"
import type { PerformanceResponse } from "@/lib/api/performance"
import type { ReactNode } from "react"

interface HeaderProps {
  title?: string
  description?: string
  actions?: ReactNode
  useOrderIdSelect?: boolean
  /** Hide the hero mini-cards (Platform Login / Password / Server / Status) */
  hideHeroInfoCards?: boolean
  /** Controlled order ID (when set, parent controls selection) */
  selectedOrderId?: string
  onOrderIdChange?: (orderId: string) => void
  /** When provided, Header uses these orders instead of fetching */
  orders?: Order[]
  /** Visual style for the title/description/actions section */
  variant?: "default" | "dashboard-hero"
  /** Back link for sub-pages (shown above hero when variant is dashboard-hero) */
  backHref?: string
  backLabel?: string
  /** Badge text for dashboard-hero (e.g. "Live trading overview", "Achievements") */
  badge?: string
}

const saleTickerText = "🔥 Sale — 20% off challenges • Use code WELCOME20 • Limited time • "

export function Header({
  title,
  description,
  actions,
  useOrderIdSelect,
  hideHeroInfoCards = false,
  selectedOrderId: controlledOrderId,
  onOrderIdChange,
  orders: ordersProp,
  variant = "default",
  backHref,
  backLabel = "Back",
  badge,
}: HeaderProps) {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoadingOrders, setIsLoadingOrders] = useState(false)
  const [internalOrderId, setInternalOrderId] = useState<string>("")
  const [userData, setUserData] = useState<{ name: string; username: string; email: string; image?: string | null } | null>(null)
  const [credentialsOpen, setCredentialsOpen] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const isControlled = controlledOrderId !== undefined
  const selectedOrderId = isControlled ? controlledOrderId : internalOrderId
  const setSelectedOrderId = isControlled && onOrderIdChange ? onOrderIdChange : (id: string) => { setInternalOrderId(id) }
  const ordersSource = ordersProp ?? orders

  // Prefer API user so we never show stale/fake stored data
  const fetchCurrentUser = () => {
    getMyAccount()
      .then((res) => {
        if (res?.user) {
          setUserData({
            name: res.user.name || res.user.username || 'User',
            username: res.user.username || res.user.email || res.user.name || 'User',
            email: res.user.email || '',
            image: null,
          })
        }
      })
      .catch(() => {
        const user = getUser()
        if (user) {
          const username = (user as { username?: string }).username ?? user.email ?? ''
          setUserData({
            name: user.name || username || 'User',
            username: username || user.name || 'User',
            email: user.email || '',
            image: (user as { image?: string | null }).image ?? (user as { avatar?: string }).avatar ?? (user as { profile_picture_url?: string }).profile_picture_url ?? null,
          })
        }
      })
  }

  useEffect(() => {
    if (useOrderIdSelect && ordersProp === undefined) {
      fetchOrders()
    } else {
      fetchCurrentUser()
    }
  }, [useOrderIdSelect, ordersProp])


  const fetchOrders = async () => {
    setIsLoadingOrders(true)
    try {
      const response = await getMyAccount()
      const all = response.orders || []
      setOrders(all)
      if (response?.user) {
        setUserData({
          name: response.user.name || response.user.username || 'User',
          username: response.user.username || response.user.email || response.user.name || 'User',
          email: response.user.email || '',
          image: null,
        })
      }
      const selectable = all.filter((o) => o.status !== "Pending")
      if (selectable.length > 0) {
        setSelectedOrderId(selectable[0].order_id)
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error)
      setOrders([])
      const user = getUser()
      if (user) {
        const username = (user as { username?: string }).username ?? user.email ?? ''
        setUserData({
          name: user.name || username || 'User',
          username: username || user.name || 'User',
          email: user.email || '',
          image: (user as { image?: string | null }).image ?? (user as { avatar?: string }).avatar ?? (user as { profile_picture_url?: string }).profile_picture_url ?? null,
        })
      }
    } finally {
      setIsLoadingOrders(false)
    }
  }

  const selectableOrders = ordersSource.filter((o) => o.status !== "Pending")
  const selectedOrderMeta = useMemo(() => {
    if (!selectedOrderId) return null
    return selectableOrders.find((o) => orderIdsMatch(o.order_id, selectedOrderId)) ?? null
  }, [selectableOrders, selectedOrderId])

  useEffect(() => {
    if (!useOrderIdSelect || ordersSource.length === 0) return
    const selectable = ordersSource.filter((o) => o.status !== "Pending")
    if (selectable.length === 0) return
    const isSelectable = selectable.some((o) => orderIdsMatch(o.order_id, selectedOrderId))
    if (!isSelectable) {
      setSelectedOrderId(selectable[0].order_id)
    }
  }, [useOrderIdSelect, ordersSource, selectedOrderId])

  const getUserInitials = () => {
    if (!userData?.name) return 'U'
    const names = userData.name.split(' ')
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase()
    }
    return userData.name.substring(0, 2).toUpperCase()
  }

  const currentOrder = ordersSource.find((o) => o.order_id === selectedOrderId)
  const resolvedForHeader = getOrderCredentialsForStats(currentOrder)

  const stageFlow = useMemo(() => {
    const raw = String(currentOrder?.status_type || currentOrder?.status || "").toLowerCase()
    const current =
      currentOrder?.live_credentials || raw.includes("live")
        ? 2
        : currentOrder?.stage2_credentials || raw.includes("stage 2") || raw.includes("phase 2")
          ? 1
          : currentOrder?.credentials || raw.includes("phase 1") || raw.includes("evaluation")
            ? 0
            : -1
    return {
      current,
      steps: ["Phase 1", "Stage 2", "Live"],
    }
  }, [currentOrder])

  const headerStatus =
    currentOrder?.status_type ||
    currentOrder?.status ||
    (currentOrder?.live_credentials
      ? "Live"
      : currentOrder?.stage2_credentials
        ? "Stage 2"
        : currentOrder?.credentials
          ? "Phase 1"
          : "—")

  /** Stable string so the credentials-dialog stats effect does not depend on `currentOrder` object identity */
  const credentialStatsFetchKey = useMemo(() => {
    const o = findOrderById(ordersSource, selectedOrderId ?? "")
    if (!o) return ""
    const r = getOrderCredentialsForStats(o)
    return r ? `${o.order_id}|${r.platform}|${r.platformLogin}` : `${o.order_id}|nocreds`
  }, [selectedOrderId, ordersSource])

  /** Always read latest orders in the dialog-stats effect without listing `ordersSource` in deps (avoids unstable array identity). */
  const ordersSourceRef = useRef(ordersSource)
  ordersSourceRef.current = ordersSource

  /** Single object dep so useEffect always has dependency array length === 1 (fixes React "changed size" / HMR issues). */
  const dialogStatsDeps = useMemo(
    () => ({
      credentialsOpen,
      selectedOrderId: selectedOrderId ?? "",
      credentialStatsFetchKey,
    }),
    [credentialsOpen, selectedOrderId, credentialStatsFetchKey]
  )

  const [stage2Stats, setStage2Stats] = useState<PerformanceResponse | null>(null)
  const [stage2StatsLoading, setStage2StatsLoading] = useState(false)
  useEffect(() => {
    const { credentialsOpen: open, selectedOrderId: oid, credentialStatsFetchKey: key } = dialogStatsDeps
    if (!open) {
      setStage2Stats(null)
      return
    }
    const order = findOrderById(ordersSourceRef.current, oid)
    if (!order) {
      setStage2Stats(null)
      return
    }
    const resolved = getOrderCredentialsForStats(order)
    if (!resolved || !key || key.endsWith("|nocreds")) {
      setStage2Stats(null)
      return
    }
    let cancelled = false
    setStage2StatsLoading(true)
    setStage2Stats(null)
    getShowMyTradesStats(resolved.platform, resolved.platformLogin, resolved.credential?.graph_link ?? null)
      .then((data) => {
        if (!cancelled) setStage2Stats(data)
      })
      .catch(() => {
        if (!cancelled) setStage2Stats(null)
      })
      .finally(() => {
        if (!cancelled) setStage2StatsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [dialogStatsDeps])

  const copyToClipboard = (label: string, value: string) => {
    navigator.clipboard.writeText(value)
    setCopiedField(label)
    setTimeout(() => setCopiedField(null), 1500)
  }

  const displayName = userData?.name || userData?.username || "Trader"
  const firstName = displayName.split(" ")[0]
  const showAccountCard = useOrderIdSelect || (variant === "dashboard-hero" && !hideHeroInfoCards)

  return (
    <header className="w-full min-w-0 space-y-5">
      {/* Promo strip */}
      <div className="relative -mx-3 -mt-3 overflow-hidden bg-[#0b1020] py-2 md:-mx-4 md:-mt-4 lg:-mx-5 lg:-mt-5">
        <div className="flex w-max animate-ticker whitespace-nowrap text-xs font-medium tracking-wide text-slate-300">
          <span>{saleTickerText.repeat(6)}</span>
          <span aria-hidden="true">{saleTickerText.repeat(6)}</span>
        </div>
      </div>

      {/* Utility bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <MobileNav />
          <div className="relative hidden md:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search pages, orders…"
              className="h-10 w-72 rounded-xl border-border bg-card pl-9 pr-12 text-sm shadow-none"
            />
            <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md border border-border bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
              ⌘K
            </kbd>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border-border bg-card text-muted-foreground hover:text-foreground" aria-label="Messages">
            <Mail className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="relative h-10 w-10 rounded-xl border-border bg-card text-muted-foreground hover:text-foreground" aria-label="Notifications">
            <Bell className="h-4 w-4" />
            <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-primary ring-2 ring-card" />
          </Button>
          <div className="flex min-w-0 items-center gap-2.5 rounded-xl border border-border bg-card py-1.5 pl-1.5 pr-3">
            <Avatar className="h-7 w-7 shrink-0">
              <AvatarImage src={userData?.image ?? undefined} alt={displayName} />
              <AvatarFallback className="bg-gradient-to-br from-[#5235ff] to-[#7c3aed] text-[11px] font-semibold text-white">
                {userData ? getUserInitials() : <User className="h-3.5 w-3.5" aria-hidden />}
              </AvatarFallback>
            </Avatar>
            <div className="hidden min-w-0 leading-tight sm:block">
              <p className="max-w-[160px] truncate text-sm font-semibold text-foreground" title={displayName}>{displayName}</p>
              <p className="max-w-[160px] truncate text-[11px] text-muted-foreground" title={userData?.email || ""}>{userData?.email || ""}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Page title */}
      {title != null && (
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0">
            {backHref && (
              <Link
                href={backHref}
                className="mb-2 inline-flex w-fit items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                <ChevronLeft className="h-4 w-4" />
                {backLabel}
              </Link>
            )}
            {badge ? (
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-primary">{badge}</p>
            ) : variant === "dashboard-hero" && userData ? (
              <p className="mb-1.5 text-sm text-muted-foreground">Welcome back, {firstName} 👋</p>
            ) : null}
            <h1 className="break-words text-2xl font-semibold tracking-tight text-foreground md:text-[28px]">{title}</h1>
            {description != null && <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>}
          </div>
          {actions && !showAccountCard && (
            <div className="flex w-full flex-wrap items-center gap-2 md:w-auto md:justify-end">{actions}</div>
          )}
        </div>
      )}

      {/* Account card: order selector, stage flow, credentials */}
      {showAccountCard && (
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
          <div className="flex flex-col gap-4 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
            {useOrderIdSelect ? (
              <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center">
                <div className="min-w-0 sm:w-80">
                  <Select value={selectedOrderId} onValueChange={setSelectedOrderId}>
                    <SelectTrigger
                      className="h-12 w-full rounded-xl border-border bg-muted/50 px-3.5 shadow-none focus:ring-2 focus:ring-primary/25 focus:ring-offset-0"
                      disabled={isLoadingOrders}
                      aria-label="Select order ID"
                    >
                      {isLoadingOrders ? (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Loading orders…
                        </div>
                      ) : (
                        <div className="flex min-w-0 flex-col items-start text-left leading-tight">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Trading account</span>
                          {selectedOrderMeta ? (
                            <span className="mt-0.5 flex min-w-0 items-center gap-2">
                              <span className="truncate text-sm font-semibold text-foreground">{selectedOrderMeta.order_id}</span>
                              <span className="hidden truncate text-xs text-muted-foreground sm:inline">
                                {selectedOrderMeta.challenge_type} · ${selectedOrderMeta.account_size}
                              </span>
                            </span>
                          ) : (
                            <span className="mt-0.5 text-sm font-semibold text-foreground">
                              {selectableOrders.length === 0 ? "No orders found" : "Select an order"}
                            </span>
                          )}
                        </div>
                      )}
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border border-border bg-popover shadow-xl">
                      {selectableOrders.length === 0 && !isLoadingOrders ? (
                        <div className="px-3 py-2 text-center text-sm text-muted-foreground">No orders available</div>
                      ) : (
                        selectableOrders.map((order) => (
                          <SelectItem key={order.order_id} value={order.order_id} textValue={order.order_id} className="rounded-lg py-2.5">
                            <div className="flex flex-col">
                              <span className="text-sm font-semibold">{order.order_id}</span>
                              <span className="text-xs text-muted-foreground">
                                {order.challenge_type} · ${order.account_size}
                              </span>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Stage flow */}
                <ol className="flex items-center gap-2">
                  {stageFlow.steps.map((step, idx) => {
                    const isDone = stageFlow.current > idx
                    const isCurrent = stageFlow.current === idx
                    return (
                      <li key={step} className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${
                            isCurrent
                              ? "bg-primary text-primary-foreground"
                              : isDone
                                ? "bg-emerald-500/10 text-emerald-700"
                                : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {isDone && <Check className="h-3 w-3" />}
                          {step}
                        </span>
                        {idx < stageFlow.steps.length - 1 && <span className="h-px w-4 bg-border" />}
                      </li>
                    )
                  })}
                </ol>
              </div>
            ) : (
              <div />
            )}
            {actions && <div className="flex flex-wrap items-center gap-2 lg:justify-end">{actions}</div>}
          </div>

          {variant === "dashboard-hero" && !hideHeroInfoCards && (
            <div className="grid grid-cols-1 gap-px border-t border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  label: "Platform login",
                  value:
                    resolvedForHeader?.credential?.platform_login != null
                      ? String(resolvedForHeader.credential.platform_login)
                      : "—",
                  key: "hero-login",
                  icon: MonitorSmartphone,
                },
                { label: "Password", value: resolvedForHeader?.credential?.platform_password || "—", key: "hero-password", icon: KeyRound },
                { label: "Server", value: resolvedForHeader?.credential?.server || "—", key: "hero-server", icon: Server },
                { label: "Status", value: headerStatus, key: "hero-status", icon: Activity },
              ].map((item: { label: string; value: string; key: string; icon: LucideIcon }) => (
                <div key={item.key} className="group flex items-center justify-between gap-3 bg-card px-4 py-3.5 sm:px-5">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                      <item.icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[11px] font-medium text-muted-foreground">{item.label}</p>
                      <p className="truncate font-mono text-sm font-semibold text-foreground" title={item.value}>
                        {item.value}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                    onClick={() => item.value !== "—" && copyToClipboard(item.key, item.value)}
                    disabled={item.value === "—"}
                    aria-label={`Copy ${item.label}`}
                  >
                    {copiedField === item.key ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

        <Dialog open={credentialsOpen} onOpenChange={setCredentialsOpen}>
          <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Account credentials</DialogTitle>
            </DialogHeader>
            {currentOrder?.credentials ||
            currentOrder?.stage2_credentials ||
            currentOrder?.live_credentials ||
            (currentOrder?.credentials_with_status && currentOrder.credentials_with_status.length > 0) ? (
              <div className="space-y-5">
                {/* Phase 1 / Completed credentials */}
                {(currentOrder?.credentials || currentOrder?.live_credentials) && (() => {
                  const creds = currentOrder!.credentials ?? currentOrder!.live_credentials!
                  const sectionLabel = currentOrder!.live_credentials ? "Live account" : "Phase 1 / Completed"
                  return (
                    <div className="space-y-3">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-border pb-1.5">
                        {sectionLabel}
                      </h4>
                      {[
                        { label: "Login", value: String(creds.platform_login), key: "p1-login" },
                        { label: "Password", value: creds.platform_password, key: "p1-password" },
                        { label: "Server", value: creds.server, key: "p1-server" },
                        { label: "Profit target", value: creds.profit_target != null ? String(creds.profit_target) : "—", key: "p1-profit_target" },
                      ].map(({ label, value, key }) => (
                        <div key={key} className="flex items-center justify-between gap-2">
                          <span className="text-sm font-medium text-muted-foreground">{label}</span>
                          <div className="flex items-center gap-1.5 min-w-0">
                            <code className="text-xs font-mono bg-muted px-2 py-1.5 rounded truncate max-w-[200px]">
                              {value}
                            </code>
                            {value !== "—" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 shrink-0"
                                onClick={() => copyToClipboard(`${sectionLabel}-${label}`, value)}
                              >
                                {copiedField === `${sectionLabel}-${label}` ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                })()}

                {/* Stage 2 credentials */}
                {currentOrder?.stage2_credentials && (() => {
                  const creds = currentOrder.stage2_credentials!
                  const fields: { label: string; value: string; key: string }[] = [
                    { label: "Login", value: String(creds.platform_login), key: "s2-login" },
                    { label: "Password", value: creds.platform_password, key: "s2-password" },
                    { label: "Server", value: creds.server, key: "s2-server" },
                  ]
                  if (creds.session_id != null && String(creds.session_id) !== "") {
                    fields.push({ label: "Session ID", value: String(creds.session_id), key: "s2-session_id" })
                  }
                  if (creds.terminal_id != null) {
                    fields.push({ label: "Terminal ID", value: String(creds.terminal_id), key: "s2-terminal_id" })
                  }
                  fields.push({
                    label: "Profit target",
                    value: creds.profit_target != null ? String(creds.profit_target) : "—",
                    key: "s2-profit_target",
                  })
                  return (
                    <div className="space-y-3">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-border pb-1.5">
                        Stage 2
                      </h4>
                      {fields.map(({ label, value, key }) => (
                        <div key={key} className="flex items-center justify-between gap-2">
                          <span className="text-sm font-medium text-muted-foreground">{label}</span>
                          <div className="flex items-center gap-1.5 min-w-0">
                            <code className="text-xs font-mono bg-muted px-2 py-1.5 rounded truncate max-w-[200px]">
                              {value}
                            </code>
                            {value !== "—" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 shrink-0"
                                onClick={() => copyToClipboard(`Stage2-${label}`, value)}
                              >
                                {copiedField === `Stage2-${label}` ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                      {/* Stage 2 stats */}
                      <div className="rounded-lg border border-border bg-muted/30 p-3 mt-3">
                        <p className="text-xs font-semibold text-muted-foreground mb-2">Stage 2 account stats</p>
                        {stage2StatsLoading ? (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Loading…
                          </div>
                        ) : stage2Stats?.account_info ? (
                          <div className="grid grid-cols-3 gap-2 text-sm">
                            <div className="flex items-center gap-1.5">
                              <Wallet className="h-4 w-4 text-muted-foreground" />
                              <span className="text-muted-foreground">Balance:</span>
                              <span className="font-medium tabular-nums">
                                ${(stage2Stats.account_info.balance ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <TrendingUp className="h-4 w-4 text-muted-foreground" />
                              <span className="text-muted-foreground">Equity:</span>
                              <span className="font-medium tabular-nums">
                                ${(stage2Stats.account_info.equity ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            </div>
                            <div className="col-span-1 flex items-center gap-1.5">
                              <span className="text-muted-foreground">Profit:</span>
                              <span className={`font-medium tabular-nums ${(stage2Stats.statistics?.account_stats?.profit ?? 0) >= 0 ? "text-foreground" : "text-destructive"}`}>
                                ${(stage2Stats.statistics?.account_stats?.profit ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground">Stats unavailable</p>
                        )}
                      </div>
                    </div>
                  )
                })()}

                {/* credentials_with_status (new my-account API) */}
                {currentOrder?.credentials_with_status &&
                  currentOrder.credentials_with_status.length > 0 &&
                  !currentOrder.credentials &&
                  !currentOrder.stage2_credentials &&
                  !currentOrder.live_credentials &&
                  currentOrder.credentials_with_status.map((c) => (
                    <div key={c.credential_id} className="space-y-3">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-border pb-1.5">
                        {c.status_type ?? "Trading account"}
                      </h4>
                      {[
                        { label: "Login", value: String(c.platform_login), key: "cw-login" },
                        { label: "Password", value: c.platform_password, key: "cw-password" },
                        { label: "Server", value: c.server, key: "cw-server" },
                        {
                          label: "Profit target",
                          value: c.profit_target != null ? String(c.profit_target) : "—",
                          key: "cw-profit",
                        },
                        {
                          label: "Status",
                          value: c.account_status ?? "—",
                          key: "cw-status",
                        },
                      ].map(({ label, value, key }) => (
                        <div key={key} className="flex items-center justify-between gap-2">
                          <span className="text-sm font-medium text-muted-foreground">{label}</span>
                          <div className="flex items-center gap-1.5 min-w-0">
                            <code className="text-xs font-mono bg-muted px-2 py-1.5 rounded truncate max-w-[200px]">
                              {value}
                            </code>
                            {value !== "—" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 shrink-0"
                                onClick={() => copyToClipboard(`cw-${c.credential_id}-${label}`, value)}
                              >
                                {copiedField === `cw-${c.credential_id}-${label}` ? (
                                  <Check className="h-4 w-4 text-green-600" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}

                {currentOrder?.credentials_with_status &&
                  !currentOrder.credentials &&
                  !currentOrder.stage2_credentials &&
                  !currentOrder.live_credentials && (
                    <div className="rounded-lg border border-border bg-muted/30 p-3 mt-3">
                      <p className="text-xs font-semibold text-muted-foreground mb-2">Account statistics (ShowMyTrades)</p>
                      {stage2StatsLoading ? (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Loading…
                        </div>
                      ) : stage2Stats?.account_info ? (
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div className="flex items-center gap-1.5">
                            <Wallet className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Balance:</span>
                            <span className="font-medium tabular-nums">
                              ${(stage2Stats.account_info.balance ?? 0).toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Equity:</span>
                            <span className="font-medium tabular-nums">
                              ${(stage2Stats.account_info.equity ?? 0).toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </span>
                          </div>
                          <div className="col-span-1 flex items-center gap-1.5">
                            <span className="text-muted-foreground">Profit:</span>
                            <span
                              className={`font-medium tabular-nums ${(stage2Stats.statistics?.account_stats?.profit ?? 0) >= 0 ? "text-foreground" : "text-destructive"}`}
                            >
                              ${(stage2Stats.statistics?.account_stats?.profit ?? 0).toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">Stats unavailable</p>
                      )}
                    </div>
                  )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No credentials available for this order yet.</p>
            )}
          </DialogContent>
        </Dialog>
    </header>
  )
}
