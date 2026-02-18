"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Search, Mail, Bell, Loader2, KeyRound, Copy, Check, Wallet, TrendingUp, ChevronLeft } from "lucide-react"
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
import { getMyAccount, type Order, type OrderCredentials } from "@/lib/api/auth"
import { getUser } from "@/lib/auth-utils"
import { getShowMyTradesStats } from "@/lib/api/showmytrades"
import type { PerformanceResponse } from "@/lib/api/performance"
import type { ReactNode } from "react"

interface HeaderProps {
  title?: string
  description?: string
  actions?: ReactNode
  useOrderIdSelect?: boolean
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

  useEffect(() => {
    if (!useOrderIdSelect || ordersSource.length === 0) return
    const selectable = ordersSource.filter((o) => o.status !== "Pending")
    if (selectable.length === 0) return
    const isSelectable = selectable.some((o) => o.order_id === selectedOrderId)
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
  const hasCredentials = !!(
    currentOrder?.credentials ||
    currentOrder?.stage2_credentials ||
    currentOrder?.live_credentials
  )

  const [stage2Stats, setStage2Stats] = useState<PerformanceResponse | null>(null)
  const [stage2StatsLoading, setStage2StatsLoading] = useState(false)
  useEffect(() => {
    if (!credentialsOpen || !currentOrder?.stage2_credentials || !currentOrder.platform) {
      setStage2Stats(null)
      return
    }
    let cancelled = false
    setStage2StatsLoading(true)
    setStage2Stats(null)
    getShowMyTradesStats(
      currentOrder.platform,
      currentOrder.stage2_credentials!.platform_login
    )
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
  }, [credentialsOpen, currentOrder?.order_id, currentOrder?.platform, currentOrder?.stage2_credentials?.platform_login])

  const copyToClipboard = (label: string, value: string) => {
    navigator.clipboard.writeText(value)
    setCopiedField(label)
    setTimeout(() => setCopiedField(null), 1500)
  }

  return (
    <header className="space-y-3 md:space-y-4 animate-slide-in-up w-full min-w-0">
      <div className="relative -mx-3 -mt-3 overflow-hidden border-b border-border bg-muted/50 py-2.5 md:-mx-4 md:-mt-4 lg:-mx-5 lg:-mt-5">
        <div className="flex w-max animate-ticker whitespace-nowrap text-xs sm:text-sm font-semibold text-muted-foreground">
          <span>{saleTickerText.repeat(6)}</span>
          <span aria-hidden="true">{saleTickerText.repeat(6)}</span>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 min-w-0">
        <div className="flex items-center gap-2 flex-1 min-w-0 w-full sm:max-w-md">
          <MobileNav />

          <div className="relative flex flex-1 min-w-0 items-center gap-2">
            {useOrderIdSelect ? (
              <>
                <div className="relative flex-1 min-w-0">
                  <Select value={selectedOrderId} onValueChange={setSelectedOrderId}>
                    <SelectTrigger className="w-full min-h-[44px] sm:h-9 h-11 text-sm font-bold bg-card border-border text-foreground rounded-xl transition-all duration-300 focus:ring-2 focus:ring-ring/50 [&_[data-slot=select-value]]:font-bold [&_[data-slot=select-value]]:text-foreground" disabled={isLoadingOrders}>
                      {isLoadingOrders ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Loading orders...</span>
                        </div>
                      ) : (
                        <SelectValue placeholder={selectableOrders.length === 0 ? "No orders found" : "Select Order ID"} />
                      )}
                    </SelectTrigger>
                    <SelectContent>
                      {selectableOrders.length === 0 && !isLoadingOrders ? (
                        <div className="px-3 py-2 text-sm text-muted-foreground text-center">
                          No orders available
                        </div>
                      ) : (
                        selectableOrders.map((order) => (
                          <SelectItem key={order.order_id} value={order.order_id} className="font-bold">
                            <div className="flex flex-col">
                              <span>{order.order_id}</span>
                              <span className="text-xs font-normal text-muted-foreground">
                                {order.challenge_type} • ${order.account_size}
                              </span>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="min-h-[44px] sm:h-9 h-11 px-3 text-sm border-border bg-card text-foreground hover:bg-muted/60 gap-1.5 shrink-0 touch-manipulation rounded-xl"
                  disabled={!selectedOrderId || !hasCredentials}
                  onClick={() => setCredentialsOpen(true)}
                >
                  <KeyRound className="h-4 w-4 text-muted-foreground" />
                  Credentials
                </Button>
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
            {currentOrder?.credentials || currentOrder?.stage2_credentials || currentOrder?.live_credentials ? (
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
            <Avatar className="w-9 h-9 md:w-9 md:h-9 ring-2 ring-border transition-all duration-300 hover:ring-muted-foreground/30 shrink-0">
              <AvatarImage src={userData?.image ?? undefined} alt={userData?.username || userData?.name || 'User'} />
              <AvatarFallback className="text-xs bg-muted text-foreground font-semibold">{getUserInitials()}</AvatarFallback>
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
                <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  <span className="inline-flex h-1.5 w-1.5 rounded-full bg-foreground/60 animate-pulse" />
                  <span className="whitespace-nowrap">{badge ?? "Live trading overview"}</span>
                </div>
                <div className="space-y-1">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold tracking-tight text-foreground break-words">
                    {title}
                  </h1>
                  {description != null && (
                    <p className="text-sm leading-relaxed text-muted-foreground max-w-2xl break-words">
                      {description}
                    </p>
                  )}
                </div>
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
