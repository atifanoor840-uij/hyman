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
    getShowMyTradesStats(resolved.platform, resolved.platformLogin)
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

  return (
    <header className="space-y-3 md:space-y-4 animate-slide-in-up w-full min-w-0">
      <div className="relative -mx-3 -mt-3 overflow-hidden border-b border-purple-400/30 bg-gradient-to-r from-purple-800 via-purple-950 to-purple-800 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] md:-mx-4 md:-mt-4 lg:-mx-5 lg:-mt-5">
        <div className="flex w-max animate-ticker whitespace-nowrap text-xs sm:text-sm font-semibold text-white/90">
          <span>{saleTickerText.repeat(6)}</span>
          <span aria-hidden="true">{saleTickerText.repeat(6)}</span>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 min-w-0">
        <div className={`flex items-center gap-2 flex-1 min-w-0 w-full ${useOrderIdSelect ? "" : "sm:max-w-md"}`}>
          <MobileNav />

          <div className="relative flex flex-1 min-w-0 items-center gap-2">
            {useOrderIdSelect ? (
              <>
                <div className="flex w-full min-w-0 items-center gap-2">
                  <div className="relative min-w-0 flex-1">
                    <Select value={selectedOrderId} onValueChange={setSelectedOrderId}>
                      <SelectTrigger
                        className="w-full min-h-[44px] sm:h-9 h-11 px-3 sm:px-3.5 rounded-2xl bg-gradient-to-b from-background/80 to-background/60 border border-border/70 shadow-sm backdrop-blur-md transition-all duration-200 hover:border-border focus:ring-2 focus:ring-primary/30 focus:ring-offset-0"
                        disabled={isLoadingOrders}
                        aria-label="Select order ID"
                      >
                        {isLoadingOrders ? (
                          <div className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Loading orders...</span>
                          </div>
                        ) : (
                          <div className="flex min-w-0 flex-col items-start text-left leading-tight">
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                              Order ID
                            </span>
                            {selectedOrderMeta ? (
                              <span className="mt-0.5 flex min-w-0 items-center gap-2">
                                <span className="truncate text-sm font-bold text-foreground">
                                  {selectedOrderMeta.order_id}
                                </span>
                                <span className="hidden sm:inline text-xs text-muted-foreground">
                                  {selectedOrderMeta.challenge_type} • ${selectedOrderMeta.account_size}
                                </span>
                              </span>
                            ) : (
                              <span className="mt-0.5 text-sm font-bold text-foreground">
                                {selectableOrders.length === 0 ? "No orders found" : "Select an order"}
                              </span>
                            )}
                          </div>
                        )}
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border border-border/70 bg-background/95 backdrop-blur-md shadow-xl">
                        {selectableOrders.length === 0 && !isLoadingOrders ? (
                          <div className="px-3 py-2 text-sm text-muted-foreground text-center">
                            No orders available
                          </div>
                        ) : (
                          selectableOrders.map((order) => (
                            <SelectItem
                              key={order.order_id}
                              value={order.order_id}
                              textValue={order.order_id}
                              className="rounded-xl py-2.5 focus:bg-muted/60 data-[highlighted]:bg-muted/60"
                            >
                              <div className="flex flex-col">
                                <span className="text-sm font-semibold text-foreground">{order.order_id}</span>
                                <span className="text-xs text-muted-foreground">
                                  {order.challenge_type} • ${order.account_size}
                                </span>
                              </div>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="hidden md:flex items-center gap-1.5 rounded-xl border border-border/60 bg-card/80 px-2 py-1.5 shrink-0">
                    {stageFlow.steps.map((step, idx) => {
                      const isDone = stageFlow.current >= idx
                      const isCurrent = stageFlow.current === idx
                      return (
                        <div key={step} className="flex items-center gap-1.5">
                          <span
                            className={`rounded-md px-2 py-1 text-[11px] font-semibold whitespace-nowrap ${
                              isDone
                                ? isCurrent
                                  ? "bg-primary/15 text-primary"
                                  : "bg-emerald-500/15 text-emerald-600"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {step}
                          </span>
                          {idx < stageFlow.steps.length - 1 ? (
                            <span className="text-xs text-muted-foreground/70">→</span>
                          ) : null}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </>
            ) : (
              <>
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search trades, pairs..."
                  className="pl-9 pr-3 md:pr-16 h-9 text-sm bg-card border-border transition-all duration-300 focus:shadow-lg focus:shadow-primary/10"
                />
                <kbd className="hidden md:inline-block absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground bg-muted rounded border border-border">
                  ⌘F
                </kbd>
              </>
            )}
          </div>
        </div>

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

        <div className="flex items-center gap-1.5 md:gap-2 shrink-0 flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="relative hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-all duration-300 min-h-[44px] min-w-[44px] h-11 w-11 sm:h-8 sm:w-8 touch-manipulation rounded-xl"
          >
            <Mail className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="relative hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-all duration-300 min-h-[44px] min-w-[44px] h-11 w-11 sm:h-8 sm:w-8 touch-manipulation rounded-xl"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-destructive rounded-full animate-pulse" />
          </Button>

          <div className="flex items-center gap-2 pl-2 md:pl-3 border-l border-border min-w-0">
            <Avatar className="w-9 h-9 md:w-9 md:h-9 ring-2 ring-purple-400/35 shadow-[0_10px_24px_rgba(88,28,135,0.18)] transition-all duration-300 hover:ring-purple-300/55 shrink-0">
              <AvatarImage src={userData?.image ?? undefined} alt={userData?.username || userData?.name || 'User'} />
              <AvatarFallback className="bg-gradient-to-br from-purple-600/35 via-purple-950/35 to-muted text-white/90">
                <User className="h-4 w-4 opacity-90" aria-hidden />
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex flex-col justify-center">
              <p className="text-sm font-semibold text-foreground truncate" title={userData?.username || userData?.name || 'User'}>
                {userData?.username || userData?.name || 'User'}
              </p>
              <p className="text-xs text-muted-foreground truncate hidden sm:block" title={userData?.email || ''}>
                {userData?.email || ''}
              </p>
            </div>
          </div>
        </div>
      </div>

      {title != null && (
        variant === "dashboard-hero" ? (
          <div className="mt-1 rounded-2xl border border-border/80 bg-card px-4 py-4 md:px-6 md:py-5 shadow-sm">
            {backHref && (
              <Link
                href={backHref}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors w-fit mb-4"
              >
                <ChevronLeft className="h-4 w-4" />
                {backLabel}
              </Link>
            )}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-7">
              <div className="space-y-2 min-w-0">
                {!hideHeroInfoCards && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 w-full max-w-5xl">
                    {[
                      {
                        label: "Platform Login",
                        value:
                          resolvedForHeader?.credential?.platform_login != null
                            ? String(resolvedForHeader.credential.platform_login)
                            : "—",
                        key: "hero-login",
                        icon: MonitorSmartphone,
                      },
                      {
                        label: "Password",
                        value: resolvedForHeader?.credential?.platform_password || "—",
                        key: "hero-password",
                        icon: KeyRound,
                      },
                      {
                        label: "Server",
                        value: resolvedForHeader?.credential?.server || "—",
                        key: "hero-server",
                        icon: Server,
                      },
                      {
                        label: "Status",
                        value: headerStatus,
                        key: "hero-status",
                        icon: Activity,
                      },
                    ].map((item: { label: string; value: string; key: string; icon: LucideIcon }) => (
                      <div
                        key={item.key}
                        className="group rounded-xl border border-border/70 bg-gradient-to-br from-muted/45 to-muted/20 px-3 py-2.5 min-w-0 shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                              <item.icon className="h-3.5 w-3.5" />
                              {item.label}
                            </p>
                            <p className="text-sm font-semibold text-foreground truncate mt-1" title={item.value}>
                              {item.value}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 shrink-0 rounded-lg border border-border/60 bg-background/40 hover:bg-background/70"
                            onClick={() => item.value !== "—" && copyToClipboard(item.key, item.value)}
                            disabled={item.value === "—"}
                            aria-label={`Copy ${item.label}`}
                          >
                            {copiedField === item.key ? (
                              <Check className="h-3.5 w-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground" />
                            )}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {actions && (
                <div className="flex w-full md:w-auto flex-wrap items-center justify-start md:justify-end gap-2 md:gap-3">
                  {actions}
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="px-0 pl-0 sm:pl-10 md:pl-16 lg:pl-20 min-w-0">
              <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-foreground mb-1 break-words">
                {title}
              </h1>
              {description != null && (
                <p className="text-xs md:text-sm text-muted-foreground break-words">
                  {description}
                </p>
              )}
            </div>

            {actions && (
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto flex-wrap">
                {actions}
              </div>
            )}
          </>
        )
      )}
    </header>
  )
}
