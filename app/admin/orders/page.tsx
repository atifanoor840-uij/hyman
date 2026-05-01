"use client"

import { useEffect, useMemo, useState } from "react"
import { AdminShell } from "@/components/admin/admin-shell"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import EmptyState from "@/components/ui/empty-state"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { completeOrder, completeOrderByCredential, failOrder, listAllOrders, passOrder, updateOrderCredential, type AdminOrder } from "@/lib/api/admin-orders"
import { listAccountCredentials, type AccountCredential } from "@/lib/api/admin-container"
import { ApiClientError } from "@/lib/api/client"
import { getShowMyTradesStats } from "@/lib/api/showmytrades"
import type { PerformanceResponse } from "@/lib/api/performance"
import { PerformanceGraphPanel, DetailedStatisticsCard } from "@/components/dashboard/performance-graph-stats"
import { ExternalLink, Eye, EyeOff, Loader2, Pencil, RefreshCcw, ShieldAlert, ShoppingCart, LogIn, LineChart, PackageCheck } from "lucide-react"

function parseBackendDate(input: string | number | Date) {
  if (input instanceof Date) return input
  if (typeof input === "number") return new Date(input)
  const raw = String(input).trim()
  // If backend sends a "naive" datetime (no timezone), assume it's UTC.
  const hasTimezone = /([zZ]|[+-]\d{2}:?\d{2})$/.test(raw)
  if (!hasTimezone) {
    // Support common forms like "2026-05-01 16:52:53" or "2026-05-01T16:52:53"
    const isoish = raw.includes("T") ? raw : raw.replace(" ", "T")
    return new Date(`${isoish}Z`)
  }
  return new Date(raw)
}

function formatDatePakistan(input: string | number | Date | null | undefined) {
  if (!input) return "—"
  const d = parseBackendDate(input)
  if (!Number.isFinite(d.getTime())) return "—"
  return new Intl.DateTimeFormat(undefined, {
    timeZone: "Asia/Karachi",
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).format(d)
}

function paymentTone(status: string | null | undefined) {
  const s = String(status ?? "").toLowerCase()
  if (s === "paid" || s === "success" || s === "completed") return "bg-emerald-500/15 text-emerald-600 border-emerald-500/20"
  if (s === "pending") return "bg-amber-500/15 text-amber-600 border-amber-500/20"
  if (s === "failed" || s === "canceled" || s === "cancelled") return "bg-destructive/10 text-destructive border-destructive/20"
  return "bg-muted/40 text-muted-foreground border-border/60"
}

function statusTone(status: string | null | undefined) {
  const s = String(status ?? "").toLowerCase()
  if (s.includes("live") || s === "active") return "bg-emerald-500/15 text-emerald-600 border-emerald-500/20"
  if (s.includes("stage") || s.includes("phase")) return "bg-primary/15 text-primary border-primary/20"
  if (s.includes("pending")) return "bg-amber-500/15 text-amber-600 border-amber-500/20"
  return "bg-muted/40 text-muted-foreground border-border/60"
}

function latestEventDate(o: AdminOrder): string | null {
  const t = Array.isArray(o.timeline) ? o.timeline : []
  if (!t.length) return o.completed_at ?? null
  return t
    .slice()
    .sort((a, b) => (a.event_date < b.event_date ? 1 : -1))[0]?.event_date ?? null
}

export default function AdminOrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showSensitive, setShowSensitive] = useState(false)
  const [viewOrder, setViewOrder] = useState<AdminOrder | null>(null)
  const [editOrder, setEditOrder] = useState<AdminOrder | null>(null)

  const [passSaving, setPassSaving] = useState(false)
  const [passError, setPassError] = useState<string | null>(null)

  const [failOpen, setFailOpen] = useState(false)
  const [failSaving, setFailSaving] = useState(false)
  const [failError, setFailError] = useState<string | null>(null)
  const [failForm, setFailForm] = useState({
    date_time: "",
    details: "",
    reason: "",
  })

  const [deliverOpen, setDeliverOpen] = useState(false)
  const [deliverContainerOpen, setDeliverContainerOpen] = useState(false)
  const [deliverSaving, setDeliverSaving] = useState(false)
  const [deliverError, setDeliverError] = useState<string | null>(null)
  const [deliverForm, setDeliverForm] = useState({
    platform: "",
    platform_login: "",
    platform_password: "",
    server: "",
    profit_target: "",
    graph_link: "",
  })

  const [containersLoading, setContainersLoading] = useState(false)
  const [containersError, setContainersError] = useState<string | null>(null)
  const [containers, setContainers] = useState<AccountCredential[]>([])
  const [selectedContainerId, setSelectedContainerId] = useState<string>("")
  const [deliverSizeKey, setDeliverSizeKey] = useState<string>("")
  const [editCredentialOpen, setEditCredentialOpen] = useState(false)
  const [editCredential, setEditCredential] = useState<any | null>(null)
  const [editCredentialOrderId, setEditCredentialOrderId] = useState<number | string | null>(null)
  const [credForm, setCredForm] = useState({
    platform_login: "",
    platform_password: "",
    server: "",
    profit_target: "",
    account_status: "",
    status_type: "",
    fail_reason: "",
  })
  const [credSaving, setCredSaving] = useState(false)
  const [credError, setCredError] = useState<string | null>(null)
  const [graphOrder, setGraphOrder] = useState<AdminOrder | null>(null)
  const [graphStep, setGraphStep] = useState<"overview" | "details">("overview")
  const [graphLoading, setGraphLoading] = useState(false)
  const [graphError, setGraphError] = useState<string | null>(null)
  const [graphData, setGraphData] = useState<PerformanceResponse | null>(null)
  const STATUS_OPTIONS = useMemo(
    () => [
      "active",
      "stage2",
      "live",
      "failed",
      "fail",
      "passed",
      "stage1",
      "instant",
      "reset stage1",
      "replaced",
    ],
    []
  )

  const openDeliver = (o: AdminOrder) => {
    setDeliverError(null)
    setDeliverSaving(false)
    const firstCred = Array.isArray((o as any).credentials_with_status) ? (o as any).credentials_with_status[0] : null
    setDeliverForm({
      platform: String(firstCred?.platform ?? o.platform ?? "MT5"),
      platform_login: String(firstCred?.platform_login ?? ""),
      platform_password: String(firstCred?.platform_password ?? ""),
      server: String(firstCred?.server ?? ""),
      profit_target: firstCred?.profit_target != null ? String(firstCred.profit_target) : String((o as any).profit_target ?? ""),
      graph_link: "",
    })
    setDeliverOpen(true)
  }

  const orderIdOf = (o: AdminOrder | null | undefined) => {
    if (!o) return null
    return (o as any).id ?? o.order_id ?? null
  }

  const submitPass = async (o: AdminOrder) => {
    setPassSaving(true)
    setPassError(null)
    try {
      const orderId = orderIdOf(o)
      if (!orderId) throw new Error("Missing order id.")
      await passOrder(orderId, { profit_amount: 1000 })
      setEditOrder(null)
      await load()
    } catch (e) {
      setPassError(e instanceof ApiClientError ? e.message : e instanceof Error ? e.message : "Failed to pass order.")
    } finally {
      setPassSaving(false)
    }
  }

  const openFail = (o: AdminOrder) => {
    setFailError(null)
    setFailSaving(false)
    setFailForm({
      date_time: "",
      details: "",
      reason: "",
    })
    setFailOpen(true)
  }

  const submitFail = async (o: AdminOrder) => {
    setFailSaving(true)
    setFailError(null)
    try {
      const orderId = orderIdOf(o)
      if (!orderId) throw new Error("Missing order id.")
      await failOrder(orderId, {
        date_time: failForm.date_time,
        details: failForm.details,
        reason: failForm.reason,
      })
      setFailOpen(false)
      setEditOrder(null)
      await load()
    } catch (e) {
      setFailError(e instanceof ApiClientError ? e.message : e instanceof Error ? e.message : "Failed to fail order.")
    } finally {
      setFailSaving(false)
    }
  }

  const loadContainers = async () => {
    setContainersLoading(true)
    setContainersError(null)
    try {
      const data = await listAccountCredentials()
      setContainers(Array.isArray(data) ? data : [])
    } catch (e) {
      setContainersError(e instanceof ApiClientError ? e.message : "Failed to load containers.")
      setContainers([])
    } finally {
      setContainersLoading(false)
    }
  }

  const availableContainers = useMemo(() => {
    const normalizeSizeKey = (raw: any) => {
      const s = String(raw ?? "").toLowerCase().trim()
      if (!s) return ""
      // Handle common forms like "50k"
      const kMatch = s.match(/^(\d+(?:\.\d+)?)\s*k$/)
      if (kMatch) return String(Math.round(Number(kMatch[1]) * 1000))
      // Strip everything except digits (handles "$50,000", "50,000", "50000")
      const digits = s.replace(/[^\d]/g, "")
      return digits || ""
    }

    return containers.filter((c) => {
      const s = String(c.status ?? "").toLowerCase()
      const isAvailable = s.includes("available")
      if (!isAvailable || c.is_assigned) return false
      if (!deliverSizeKey) return true
      return normalizeSizeKey((c as any).account_size) === deliverSizeKey
    })
  }, [containers, deliverSizeKey])

  const openDeliverWithContainer = async (o: AdminOrder) => {
    setDeliverError(null)
    setContainersError(null)
    setSelectedContainerId("")
    const normalizeSizeKey = (raw: any) => {
      const s = String(raw ?? "").toLowerCase().trim()
      if (!s) return ""
      const kMatch = s.match(/^(\d+(?:\.\d+)?)\s*k$/)
      if (kMatch) return String(Math.round(Number(kMatch[1]) * 1000))
      return s.replace(/[^\d]/g, "") || ""
    }
    setDeliverSizeKey(normalizeSizeKey((o as any).account_size))
    setDeliverContainerOpen(true)
    await loadContainers()
  }

  const applySelectedContainer = (id: string) => {
    setSelectedContainerId(id)
    const c = availableContainers.find((x) => String(x.id) === String(id))
    if (!c) return
    setDeliverForm((p) => ({
      ...p,
      platform: String((c as any).platform ?? "MT5"),
      platform_login: String((c as any).platform_login ?? ""),
      platform_password: String((c as any).platform_password ?? ""),
      server: String((c as any).server ?? ""),
      profit_target: (c as any).profit_target != null ? String((c as any).profit_target) : p.profit_target,
    }))
  }

  const submitDeliver = async (o: AdminOrder) => {
    setDeliverSaving(true)
    setDeliverError(null)
    try {
      const orderId = (o as any).id ?? o.order_id
      if (!orderId) throw new Error("Missing order id.")
      await completeOrder(orderId, {
        server: deliverForm.server,
        platform_login: deliverForm.platform_login,
        platform_password: deliverForm.platform_password,
        profit_target: deliverForm.profit_target,
        graph_link: deliverForm.graph_link,
      })
      setDeliverOpen(false)
      setDeliverContainerOpen(false)
      await load()
    } catch (e) {
      setDeliverError(e instanceof Error ? e.message : "Failed to deliver credentials.")
    } finally {
      setDeliverSaving(false)
    }
  }

  const submitDeliverWithContainer = async (o: AdminOrder) => {
    setDeliverSaving(true)
    setDeliverError(null)
    try {
      const orderId = (o as any).id ?? o.order_id
      if (!orderId) throw new Error("Missing order id.")
      if (!selectedContainerId) throw new Error("Select an available container account first.")

      await completeOrderByCredential(orderId, {
        credential_id: selectedContainerId,
        profit_target: deliverForm.profit_target,
        graph_link: "",
      })

      setDeliverContainerOpen(false)
      await load()
    } catch (e) {
      setDeliverError(e instanceof Error ? e.message : "Failed to deliver with container.")
    } finally {
      setDeliverSaving(false)
    }
  }

  const openCredentialEditor = (order: AdminOrder, c: any) => {
    setEditCredentialOrderId(order.id ?? order.order_id)
    setEditCredential(c)
    setCredError(null)
    setCredForm({
      platform_login: String(c?.platform_login ?? ""),
      platform_password: String(c?.platform_password ?? ""),
      server: String(c?.server ?? ""),
      profit_target: c?.profit_target != null ? String(c.profit_target) : "",
      account_status: String(c?.account_status ?? ""),
      status_type: String(c?.status_type ?? ""),
      fail_reason: String(c?.fail_reason ?? ""),
    })
    setEditCredentialOpen(true)
  }

  const saveCredential = async () => {
    if (!editCredentialOrderId || !editCredential?.credential_id) return
    setCredSaving(true)
    setCredError(null)
    try {
      await updateOrderCredential(editCredentialOrderId, editCredential.credential_id, {
        platform_login: credForm.platform_login,
        platform_password: credForm.platform_password,
        server: credForm.server,
        profit_target: credForm.profit_target,
        account_status: credForm.account_status,
        status_type: credForm.status_type,
        fail_reason: credForm.fail_reason,
      })
      setEditCredentialOpen(false)
      setEditCredential(null)
      setEditCredentialOrderId(null)
      await load()
    } catch (e) {
      setCredError(e instanceof ApiClientError ? e.message : "Failed to update credential.")
    } finally {
      setCredSaving(false)
    }
  }

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await listAllOrders()
      setOrders(Array.isArray(data) ? data : [])
      setError(null)
    } catch (e) {
      if (e instanceof ApiClientError) {
        setError(e.status === 401 ? "Session expired. Please sign in again." : e.message || "Failed to load orders.")
      } else {
        setError("Failed to load orders.")
      }
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const openGraph = async (o: AdminOrder) => {
    setGraphOrder(o)
    setGraphStep("overview")
    setGraphLoading(true)
    setGraphError(null)
    setGraphData(null)
    try {
      const platform = String((o as any).platform ?? "mt5")
      const graphLink =
        (o as any).graph_link ??
        (Array.isArray((o as any).credentials_with_status) ? (o as any).credentials_with_status[0]?.graph_link : null) ??
        null
      const login = String((o as any).platform_login ?? (o as any).platformLogin ?? "").trim()
      if (!login && !graphLink) {
        throw new Error("Missing platform login / graph link for this order.")
      }
      const data = await getShowMyTradesStats(platform, login || "0", graphLink)
      setGraphData(data)
    } catch (e) {
      setGraphError(e instanceof Error ? e.message : "Failed to load graph data.")
    } finally {
      setGraphLoading(false)
    }
  }

  const loginAsUser = (o: AdminOrder) => {
    const email = String(o.email ?? "").trim()
    const pass = String((o as any).admin_access_password_plain ?? "").trim()
    if (!email || !pass) {
      setError("Missing user email or admin password for this order.")
      return
    }
    try {
      sessionStorage.setItem(
        "admin_auto_login",
        JSON.stringify({ email, password: pass, remember: false })
      )
    } catch {
      // ignore
    }
    router.push("/login?adminAutoLogin=1")
  }

  const sorted = useMemo(() => {
    return orders
      .slice()
      .sort((a, b) => {
        const da = latestEventDate(a) || a.completed_at || ""
        const db = latestEventDate(b) || b.completed_at || ""
        return da < db ? 1 : -1
      })
  }, [orders])

  const summary = useMemo(() => {
    const total = orders.length
    const paid = orders.filter((o) => {
      const s = String(o.payment_status ?? "").toLowerCase()
      return s === "paid" || s === "success" || s === "completed"
    }).length
    const pending = orders.filter((o) => String(o.payment_status ?? "").toLowerCase() === "pending").length
    const failed = orders.filter((o) => {
      const s = String(o.payment_status ?? "").toLowerCase()
      return s === "failed" || s === "canceled" || s === "cancelled"
    }).length

    const now = new Date()
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1)
    const startOfTomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
    const dayOfWeek = startOfToday.getDay() // 0 (Sun) -> 6 (Sat)
    const startOfWeek = new Date(startOfToday)
    startOfWeek.setDate(startOfToday.getDate() - dayOfWeek)
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const getOrderDate = (o: AdminOrder) => {
      const d = latestEventDate(o) || o.completed_at || null
      if (!d) return null
      const dt = new Date(d)
      return Number.isFinite(dt.getTime()) ? dt : null
    }

    let today = 0
    let yesterday = 0
    let thisWeek = 0
    let thisMonth = 0
    for (const o of orders) {
      const d = getOrderDate(o)
      if (!d) continue
      if (d >= startOfToday && d < startOfTomorrow) today += 1
      if (d >= startOfYesterday && d < startOfToday) yesterday += 1
      if (d >= startOfWeek && d < startOfTomorrow) thisWeek += 1
      if (d >= startOfMonth && d < startOfTomorrow) thisMonth += 1
    }

    // Trend: last 14 days order count (based on latest event date / completed_at)
    const days = 14
    const buckets: { label: string; date: Date; count: number }[] = Array.from({ length: days }).map((_, i) => {
      const d = new Date(startOfToday)
      d.setDate(startOfToday.getDate() - (days - 1 - i))
      return {
        label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        date: d,
        count: 0,
      }
    })
    for (const o of orders) {
      const d = getOrderDate(o)
      if (!d) continue
      // map to start-of-day
      const sd = new Date(d.getFullYear(), d.getMonth(), d.getDate())
      const idx = Math.round((sd.getTime() - buckets[0].date.getTime()) / (24 * 60 * 60 * 1000))
      if (idx >= 0 && idx < buckets.length) buckets[idx].count += 1
    }

    return { total, paid, pending, failed, today, yesterday, thisWeek, thisMonth, trend: buckets }
  }, [orders])

  return (
    <AdminShell
      title="Orders"
      description="Track new purchases, payment status, and fulfillment timelines."
      actions={
        <div className="flex items-center gap-2">
          <Button
            className="h-9 rounded-full border border-purple-400/30 bg-gradient-to-r from-purple-800 via-purple-950 to-purple-800 px-4 text-xs font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] hover:from-purple-700 hover:via-purple-900 hover:to-purple-700"
            onClick={() => void load()}
            disabled={loading}
          >
            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCcw className="h-4 w-4 mr-2" />}
            Refresh
          </Button>
          <Button
            className="h-9 rounded-full border border-purple-400/30 bg-gradient-to-r from-purple-800 via-purple-950 to-purple-800 px-4 text-xs font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] hover:from-purple-700 hover:via-purple-900 hover:to-purple-700"
            onClick={() => setShowSensitive((v) => !v)}
          >
            {showSensitive ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            {showSensitive ? "Hide sensitive" : "Show sensitive"}
          </Button>
        </div>
      }
    >
      <Card className="mb-3 md:mb-4 overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-br from-card via-card to-muted/30 shadow-sm">
        <div className="relative p-5 sm:p-6">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-purple-500/10 blur-3xl" aria-hidden />
          <div className="absolute -left-24 -bottom-24 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" aria-hidden />
          <div className="relative flex flex-col gap-4">
            <div className="flex items-end justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Orders snapshot</p>
                <h2 className="mt-1 text-xl sm:text-2xl font-bold tracking-tight text-foreground">Orders overview</h2>
                <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                  Quick view of payment health and total order volume.
                </p>
              </div>
              <Badge variant="outline" className="rounded-full border-border/70 bg-background/40 px-3 py-1 text-xs">
                {loading ? "Loading…" : `${summary.total} total`}
              </Badge>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
              <StatChip label="Paid" value={summary.paid} tone="success" />
              <StatChip label="Pending" value={summary.pending} tone="warning" />
              <StatChip label="Failed" value={summary.failed} tone="danger" />
              <StatChip label="All" value={summary.total} tone="muted" />
              <StatChip label="Today" value={summary.today} tone="primary" />
              <StatChip label="Yesterday" value={summary.yesterday} tone="muted" />
              <StatChip label="This week" value={summary.thisWeek} tone="primary" />
              <StatChip label="This month" value={summary.thisMonth} tone="muted" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-4">
              <div className="lg:col-span-2 rounded-3xl border border-border/70 bg-background/40 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                  Orders trend (last 14 days)
                </p>
                <MiniTrendChart points={summary.trend.map((x) => x.count)} />
                <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>{summary.trend[0]?.label}</span>
                  <span>{summary.trend[summary.trend.length - 1]?.label}</span>
                </div>
              </div>
              <div className="rounded-3xl border border-border/70 bg-background/40 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Overview
                </p>
                <div className="mt-3 space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Paid rate</span>
                    <span className="font-semibold text-foreground">
                      {summary.total ? `${Math.round((summary.paid / summary.total) * 100)}%` : "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Pending rate</span>
                    <span className="font-semibold text-foreground">
                      {summary.total ? `${Math.round((summary.pending / summary.total) * 100)}%` : "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Failed rate</span>
                    <span className="font-semibold text-foreground">
                      {summary.total ? `${Math.round((summary.failed / summary.total) * 100)}%` : "—"}
                    </span>
                  </div>
                  <div className="h-px w-full bg-border/60 my-2" />
                  <div className="text-xs text-muted-foreground">
                    Trend uses each order’s latest timeline update date.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card className="rounded-2xl border border-border/80 bg-card shadow-sm overflow-hidden">
        <div className="border-b border-border/80 bg-muted/20 px-4 sm:px-6 py-3.5 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-foreground tracking-tight">Recent orders</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {loading ? "Loading orders..." : `${sorted.length} orders`}
            </p>
          </div>
          <Badge variant="outline" className="rounded-full border-border/70 bg-background/40 px-3 py-1 text-xs">
            Live
          </Badge>
        </div>

        <div className="p-0">
          {error ? (
            <div className="px-4 sm:px-6 py-4">
              <div className="rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-foreground flex items-start gap-3">
                <ShieldAlert className="h-5 w-5 text-destructive mt-0.5" />
                <div className="min-w-0">
                  <div className="font-semibold">Couldn’t load orders</div>
                  <div className="text-muted-foreground text-xs mt-0.5">{error}</div>
                </div>
              </div>
            </div>
          ) : null}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Challenge</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Status</TableHead>
                {showSensitive ? <TableHead>Admin pass</TableHead> : null}
                <TableHead className="text-right">Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={showSensitive ? 9 : 8} className="py-10">
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading…
                    </div>
                  </TableCell>
                </TableRow>
              ) : sorted.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={showSensitive ? 9 : 8} className="p-6">
                    <EmptyState
                      title="No orders found"
                      description="If you just signed in, try refreshing. Otherwise confirm the admin token has access."
                      icon={
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border/70 bg-muted/40">
                          <ShoppingCart className="h-6 w-6 text-muted-foreground" />
                        </div>
                      }
                      action={
                        <Button variant="outline" className="rounded-2xl border-border/70" onClick={() => void load()}>
                          Refresh
                        </Button>
                      }
                    />
                  </TableCell>
                </TableRow>
              ) : (
                sorted.map((o) => {
                  const updated = latestEventDate(o)
                  return (
                    <TableRow key={o.id ?? o.order_id}>
                      <TableCell className="font-semibold">
                        <div className="flex items-center gap-2">
                          <span className="truncate" title={o.order_id}>
                            {o.order_id}
                          </span>
                          {o.checkout_session_url ? (
                            <a
                              href={o.checkout_session_url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center text-muted-foreground hover:text-foreground"
                              aria-label="Open checkout session"
                              title="Open checkout session"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          ) : null}
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-1 truncate">
                          {o.platform} • {o.account_size}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold text-foreground">{o.username}</div>
                        <div className="text-[11px] text-muted-foreground truncate" title={o.email}>
                          {o.email}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        <div className="text-foreground font-semibold">{o.challenge_type}</div>
                        <div className="text-[11px] text-muted-foreground mt-1">
                          {o.payment_method}
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold tabular-nums">${Number(o.amount ?? 0).toFixed(0)}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${paymentTone(o.payment_status)}`}>
                          {o.payment_status ?? "—"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusTone(o.status_type || o.account_status)}`}>
                          {o.status_type || o.account_status || "—"}
                        </span>
                      </TableCell>
                      {showSensitive ? (
                        <TableCell>
                          <code className="text-xs font-mono text-muted-foreground">
                            {o.admin_access_password_plain ? String(o.admin_access_password_plain) : "—"}
                          </code>
                        </TableCell>
                      ) : null}
                      <TableCell className="text-right text-muted-foreground text-xs">
                        {formatDatePakistan(updated)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="grid w-[220px] grid-cols-2 gap-2 ml-auto">
                          <Button
                            type="button"
                            size="sm"
                            className="h-9 w-full justify-center rounded-xl border border-purple-400/30 bg-gradient-to-r from-purple-800 via-purple-950 to-purple-800 px-3 text-xs font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] hover:from-purple-700 hover:via-purple-900 hover:to-purple-700"
                            onClick={() => setViewOrder(o)}
                          >
                            <Eye className="h-4 w-4 mr-1.5" />
                            View
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            className="h-9 w-full justify-center rounded-xl border border-purple-400/30 bg-gradient-to-r from-purple-800 via-purple-950 to-purple-800 px-3 text-xs font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] hover:from-purple-700 hover:via-purple-900 hover:to-purple-700"
                            onClick={() => setEditOrder(o)}
                          >
                            <Pencil className="h-4 w-4 mr-1.5" />
                            Edit
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            className="h-9 w-full justify-center rounded-xl border border-purple-400/30 bg-gradient-to-r from-purple-800 via-purple-950 to-purple-800 px-3 text-xs font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] hover:from-purple-700 hover:via-purple-900 hover:to-purple-700"
                            onClick={() => loginAsUser(o)}
                          >
                            <LogIn className="h-4 w-4 mr-1.5" />
                            Login
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            className="h-9 w-full justify-center rounded-xl border border-purple-400/30 bg-gradient-to-r from-purple-800 via-purple-950 to-purple-800 px-3 text-xs font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] hover:from-purple-700 hover:via-purple-900 hover:to-purple-700"
                            onClick={() => void openGraph(o)}
                          >
                            <LineChart className="h-4 w-4 mr-1.5" />
                            Graph
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* View modal */}
      <Dialog open={viewOrder != null} onOpenChange={(o) => { if (!o) setViewOrder(null) }}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order details</DialogTitle>
          </DialogHeader>
          {viewOrder ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-end gap-2">
                <Button
                  type="button"
                  className="h-9 rounded-full border border-purple-400/30 bg-gradient-to-r from-purple-800 via-purple-950 to-purple-800 px-4 text-xs font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] hover:from-purple-700 hover:via-purple-900 hover:to-purple-700"
                  onClick={() => void openGraph(viewOrder)}
                >
                  <LineChart className="h-4 w-4 mr-2" />
                  Performance
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <InfoRow label="Order ID" value={String(viewOrder.order_id ?? "—")} mono />
                <InfoRow label="User" value={String(viewOrder.username ?? "—")} />
                <InfoRow label="Email" value={String(viewOrder.email ?? "—")} />
                <InfoRow label="Challenge" value={String(viewOrder.challenge_type ?? "—")} />
                <InfoRow label="Account size" value={String(viewOrder.account_size ?? "—")} />
                <InfoRow label="Platform" value={String(viewOrder.platform ?? "—")} />
                <InfoRow label="Payment status" value={String(viewOrder.payment_status ?? "—")} />
                <InfoRow label="Status" value={String(viewOrder.status_type || viewOrder.account_status || "—")} />
              </div>

              <div className="rounded-3xl border border-border/70 bg-gradient-to-br from-card via-card to-muted/30 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                  Payment & tracking
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <InfoRow label="Payment method" value={String((viewOrder as any).payment_method ?? "—")} />
                  <InfoRow label="Amount" value={`$${Number((viewOrder as any).amount ?? 0).toFixed(0)}`} mono />
                  <InfoRow label="Oxapay status" value={String((viewOrder as any).oxapay_payment_status ?? "—")} />
                  <InfoRow label="Payment intent" value={String((viewOrder as any).payment_intent_id ?? "—")} mono />
                  <InfoRow label="TXID" value={String((viewOrder as any).txid ?? "—")} mono />
                  <InfoRow label="Checkout session id" value={String((viewOrder as any).checkout_session_id ?? "—")} mono />
                  <InfoRow label="Payment tracking id" value={String((viewOrder as any).payment_tracking_id ?? "—")} mono />
                </div>
              </div>

              <div className="rounded-3xl border border-border/70 bg-gradient-to-br from-card via-card to-muted/30 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                  Fulfillment
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <InfoRow label="Completed" value={String(Boolean((viewOrder as any).completed))} />
                  <InfoRow label="Completed at" value={formatDatePakistan((viewOrder as any).completed_at)} mono />
                  <InfoRow label="Credential id" value={String((viewOrder as any).credential_id ?? "—")} mono />
                  <InfoRow label="Account status" value={String((viewOrder as any).account_status ?? "—")} />
                  <InfoRow label="Profit target" value={String((viewOrder as any).profit_target ?? "—")} mono />
                  <InfoRow label="Graph link" value={(viewOrder as any).graph_link ? "Available" : "—"} />
                  <InfoRow label="Passed" value={String(Boolean((viewOrder as any).passed))} />
                  <InfoRow label="Failed" value={String(Boolean((viewOrder as any).failed))} />
                  <InfoRow label="Is stage2" value={String(Boolean((viewOrder as any).is_stage2))} />
                  <InfoRow label="Is live" value={String(Boolean((viewOrder as any).is_live))} />
                  <InfoRow label="Has account credential" value={String(Boolean((viewOrder as any).has_account_credential))} />
                </div>
                {(viewOrder as any).graph_link ? (
                  <a
                    href={String((viewOrder as any).graph_link)}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-foreground hover:underline"
                  >
                    Open graph <ExternalLink className="h-4 w-4" />
                  </a>
                ) : null}
              </div>

              {Array.isArray((viewOrder as any).timeline) && (viewOrder as any).timeline.length > 0 ? (
                <div className="rounded-3xl border border-border/70 bg-gradient-to-br from-card via-card to-muted/30 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                    Timeline
                  </p>
                  <div className="space-y-2">
                    {(viewOrder as any).timeline.map((t: any, idx: number) => (
                      <div key={`${t.event_type ?? "event"}-${idx}`} className="rounded-2xl border border-border/70 bg-muted/20 px-4 py-3">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-semibold text-foreground">{String(t.event_type ?? "—")}</p>
                          <p className="text-xs text-muted-foreground tabular-nums">{formatDatePakistan(t.event_date)}</p>
                        </div>
                        {t.notes ? (
                          <p className="mt-1 text-xs text-muted-foreground">{String(t.notes)}</p>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {Array.isArray((viewOrder as any).credentials_with_status) && (viewOrder as any).credentials_with_status.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Credentials with status
                  </p>
                  <div className="flex gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory">
                    {(viewOrder as any).credentials_with_status.map((c: any) => (
                      <div
                        key={String(c.credential_id ?? c.platform_login ?? Math.random())}
                        className="min-w-[360px] snap-start rounded-3xl border border-purple-400/20 bg-gradient-to-br from-purple-500/10 via-card to-muted/20 p-4"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <InfoRow label="Credential ID" value={String(c.credential_id ?? "—")} mono />
                          <InfoRow label="Status type" value={String(c.status_type ?? "—")} />
                          <InfoRow label="Account status" value={String(c.account_status ?? "—")} />
                          <InfoRow label="Platform" value={String(c.platform ?? "—")} />
                          <InfoRow label="Server" value={String(c.server ?? "—")} />
                          <InfoRow label="Login" value={String(c.platform_login ?? "—")} mono />
                          <InfoRow label="Profit target" value={c.profit_target != null ? String(c.profit_target) : "—"} mono />
                          <InfoRow label="Graph" value={c.graph_link ? "Available" : "—"} />
                        </div>
                        {showSensitive ? (
                          <div className="mt-3 rounded-2xl border border-purple-400/15 bg-purple-500/5 p-4">
                            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Password</p>
                            <p className="mt-1 font-mono text-sm text-foreground break-all">
                              {c.platform_password ? String(c.platform_password) : "—"}
                            </p>
                          </div>
                        ) : null}
                        {c.graph_link ? (
                          <a
                            href={String(c.graph_link)}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-foreground hover:underline"
                          >
                            Open graph <ExternalLink className="h-4 w-4" />
                          </a>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {showSensitive ? (
                <div className="rounded-2xl border border-border/70 bg-muted/20 px-4 py-3">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Admin pass</p>
                  <p className="mt-1 font-mono text-sm text-foreground break-all">
                    {viewOrder.admin_access_password_plain ? String(viewOrder.admin_access_password_plain) : "—"}
                  </p>
                </div>
              ) : null}
              {viewOrder.checkout_session_url ? (
                <a
                  href={viewOrder.checkout_session_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-sm font-semibold text-foreground hover:underline"
                >
                  Open checkout session <ExternalLink className="h-4 w-4" />
                </a>
              ) : null}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Edit modal (UI-only for now) */}
      <Dialog open={editOrder != null} onOpenChange={(o) => { if (!o) setEditOrder(null) }}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit order</DialogTitle>
          </DialogHeader>
          {editOrder ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="inline-flex items-center gap-2">
                  <Button
                    type="button"
                    className="h-9 rounded-full border border-purple-400/30 bg-gradient-to-r from-purple-800 via-purple-950 to-purple-800 px-4 text-xs font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] hover:from-purple-700 hover:via-purple-900 hover:to-purple-700"
                    onClick={() => void openGraph(editOrder)}
                  >
                    <LineChart className="h-4 w-4 mr-2" />
                    Show graph
                  </Button>
                  <Button
                    type="button"
                    className="h-9 rounded-full border border-purple-400/30 bg-gradient-to-r from-purple-800 via-purple-950 to-purple-800 px-4 text-xs font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] hover:from-purple-700 hover:via-purple-900 hover:to-purple-700"
                    onClick={() => openDeliver(editOrder)}
                  >
                    <PackageCheck className="h-4 w-4 mr-2" />
                    Deliver
                  </Button>
                  <Button
                    type="button"
                    className="h-9 rounded-full border border-purple-400/30 bg-gradient-to-r from-purple-800 via-purple-950 to-purple-800 px-4 text-xs font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] hover:from-purple-700 hover:via-purple-900 hover:to-purple-700"
                    onClick={() => void openDeliverWithContainer(editOrder)}
                  >
                    <PackageCheck className="h-4 w-4 mr-2" />
                    Deliver with container
                  </Button>
                </div>

                <div className="inline-flex items-center gap-2">
                  <Button
                    type="button"
                    className="h-9 rounded-full bg-emerald-600 px-4 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                    onClick={() => void submitPass(editOrder)}
                    disabled={passSaving || failSaving}
                  >
                    {passSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                    PASS
                  </Button>
                  <Button
                    type="button"
                    className="h-9 rounded-full bg-destructive px-4 text-xs font-semibold text-destructive-foreground hover:bg-destructive/90 disabled:opacity-60"
                    onClick={() => openFail(editOrder)}
                    disabled={passSaving || failSaving}
                  >
                    FAIL
                  </Button>
                </div>
              </div>

              {passError ? (
                <div className="rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-foreground">
                  {passError}
                </div>
              ) : null}
              <div className="rounded-2xl border border-border/70 bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
                Editing is not wired to an update endpoint yet — but the latest backend data is shown below.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <InfoRow label="Order ID" value={String(editOrder.order_id ?? "—")} mono />
                <InfoRow label="User" value={String(editOrder.username ?? "—")} />
                <InfoRow label="Email" value={String(editOrder.email ?? "—")} />
                <InfoRow label="Status type" value={String(editOrder.status_type ?? "—")} />
              </div>

              {Array.isArray((editOrder as any).credentials_with_status) && (editOrder as any).credentials_with_status.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Credentials with status
                  </p>
                  <div className="flex gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory">
                    {(editOrder as any).credentials_with_status.map((c: any) => (
                      <div
                        key={String(c.credential_id ?? c.platform_login ?? Math.random())}
                        className="min-w-[360px] snap-start rounded-3xl border border-purple-400/20 bg-gradient-to-br from-purple-500/10 via-card to-muted/20 p-4"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                              {String(c.status_type ?? "Credential")} • {String(c.account_status ?? "—")}
                            </p>
                            <p className="mt-1 text-sm font-bold text-foreground">
                              {String(c.platform ?? "—")} • {String(c.platform_login ?? "—")}
                            </p>
                          </div>
                          <Button
                            type="button"
                            size="sm"
                            className="h-9 rounded-xl border border-purple-400/30 bg-gradient-to-r from-purple-800 via-purple-950 to-purple-800 px-3 text-xs font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] hover:from-purple-700 hover:via-purple-900 hover:to-purple-700"
                            onClick={() => {
                              openCredentialEditor(editOrder, c)
                            }}
                          >
                            <Pencil className="h-4 w-4 mr-1.5" />
                            Edit
                          </Button>
                        </div>

                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <InfoRow label="Credential ID" value={String(c.credential_id ?? "—")} mono />
                          <InfoRow label="Server" value={String(c.server ?? "—")} />
                          <InfoRow label="Profit target" value={c.profit_target != null ? String(c.profit_target) : "—"} mono />
                          <InfoRow label="Graph" value={c.graph_link ? "Available" : "—"} />
                        </div>

                        <div className="mt-3 rounded-2xl border border-purple-400/15 bg-purple-500/5 p-4">
                          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Password</p>
                          <p className="mt-1 font-mono text-sm text-foreground break-all">
                            {c.platform_password ? String(c.platform_password) : "—"}
                          </p>
                        </div>

                        {c.graph_link ? (
                          <a
                            href={String(c.graph_link)}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-foreground hover:underline"
                          >
                            Open graph <ExternalLink className="h-4 w-4" />
                          </a>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-border/70 bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
                  No `credentials_with_status` returned for this order.
                </div>
              )}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Fail modal */}
      <Dialog
        open={failOpen}
        onOpenChange={(o) => {
          setFailOpen(o)
          if (!o) {
            setFailError(null)
            setFailSaving(false)
          }
        }}
      >
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Fail order</DialogTitle>
          </DialogHeader>

          {failError ? (
            <div className="rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-foreground">
              {failError}
            </div>
          ) : null}

          {!editOrder ? (
            <div className="text-sm text-muted-foreground">No order selected.</div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Date time</Label>
                  <Input
                    value={failForm.date_time}
                    onChange={(e) => setFailForm((p) => ({ ...p, date_time: e.target.value }))}
                    className="h-11 rounded-2xl"
                    placeholder="2026-05-01 15:30"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Details</Label>
                  <Input
                    value={failForm.details}
                    onChange={(e) => setFailForm((p) => ({ ...p, details: e.target.value }))}
                    className="h-11 rounded-2xl"
                    placeholder="Write details"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Reason</Label>
                  <Input
                    value={failForm.reason}
                    onChange={(e) => setFailForm((p) => ({ ...p, reason: e.target.value }))}
                    className="h-11 rounded-2xl"
                    placeholder="Write reason"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <Button
                  type="button"
                  className="h-9 rounded-xl border border-border/70 bg-background px-4 text-xs font-semibold text-foreground hover:bg-muted/40"
                  onClick={() => setFailOpen(false)}
                  disabled={failSaving}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  className="h-9 rounded-xl bg-destructive px-4 text-xs font-semibold text-destructive-foreground hover:bg-destructive/90 disabled:opacity-60"
                  onClick={() => void submitFail(editOrder)}
                  disabled={failSaving}
                >
                  {failSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  FAIL
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit credential modal (UI-only) */}
      <Dialog
        open={editCredentialOpen}
        onOpenChange={(o) => {
          setEditCredentialOpen(o)
          if (!o) {
            setEditCredential(null)
            setEditCredentialOrderId(null)
            setCredError(null)
            setCredSaving(false)
          }
        }}
      >
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit credential</DialogTitle>
          </DialogHeader>
          {!editCredential ? (
            <div className="text-sm text-muted-foreground">No credential selected.</div>
          ) : (
            <div className="space-y-4">
              {credError ? (
                <div className="rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-foreground">
                  {credError}
                </div>
              ) : null}

              <div className="rounded-3xl border border-purple-400/20 bg-gradient-to-br from-purple-500/10 via-card to-muted/20 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                      Credential ID {String(editCredential.credential_id ?? "—")}
                    </p>
                    <p className="mt-1 text-sm font-bold text-foreground">
                      {String(editCredential.platform ?? "—")} • {String(editCredential.platform_login ?? "—")}
                    </p>
                  </div>
                  {editCredential.graph_link ? (
                    <a
                      href={String(editCredential.graph_link)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-sm font-semibold text-foreground hover:underline"
                    >
                      Open graph <ExternalLink className="h-4 w-4" />
                    </a>
                  ) : null}
                </div>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Platform login</Label>
                    <Input
                      value={credForm.platform_login}
                      onChange={(e) => setCredForm((p) => ({ ...p, platform_login: e.target.value }))}
                      className="h-11 rounded-2xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Server</Label>
                    <Input
                      value={credForm.server}
                      onChange={(e) => setCredForm((p) => ({ ...p, server: e.target.value }))}
                      className="h-11 rounded-2xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Platform password</Label>
                    <Input
                      value={credForm.platform_password}
                      onChange={(e) => setCredForm((p) => ({ ...p, platform_password: e.target.value }))}
                      className="h-11 rounded-2xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Profit target</Label>
                    <Input
                      value={credForm.profit_target}
                      onChange={(e) => setCredForm((p) => ({ ...p, profit_target: e.target.value }))}
                      className="h-11 rounded-2xl"
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Account status</Label>
                    <Select value={credForm.account_status} onValueChange={(v) => setCredForm((p) => ({ ...p, account_status: v }))}>
                      <SelectTrigger className="h-11 rounded-2xl">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl">
                        {STATUS_OPTIONS.map((v) => (
                          <SelectItem key={`as-${v}`} value={v}>
                            {v}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Status type</Label>
                    <Select value={credForm.status_type} onValueChange={(v) => setCredForm((p) => ({ ...p, status_type: v }))}>
                      <SelectTrigger className="h-11 rounded-2xl">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl">
                        {STATUS_OPTIONS.map((v) => (
                          <SelectItem key={`st-${v}`} value={v}>
                            {v}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Fail reason</Label>
                    <Input
                      value={credForm.fail_reason}
                      onChange={(e) => setCredForm((p) => ({ ...p, fail_reason: e.target.value }))}
                      className="h-11 rounded-2xl"
                      placeholder="Optional"
                    />
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-end gap-2">
                  <Button
                    type="button"
                    className="h-9 rounded-xl border border-purple-400/30 bg-gradient-to-r from-purple-800 via-purple-950 to-purple-800 px-4 text-xs font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] hover:from-purple-700 hover:via-purple-900 hover:to-purple-700"
                    onClick={() => setEditCredentialOpen(false)}
                    disabled={credSaving}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    className="h-9 rounded-xl bg-purple-600 px-4 text-xs font-semibold text-white hover:bg-purple-700"
                    onClick={() => void saveCredential()}
                    disabled={credSaving}
                  >
                    {credSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                    Save
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Deliver modal */}
      <Dialog open={deliverOpen} onOpenChange={(o) => { setDeliverOpen(o); if (!o) setDeliverError(null) }}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Deliver</DialogTitle>
          </DialogHeader>
          {deliverError ? (
            <div className="rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-foreground">
              {deliverError}
            </div>
          ) : null}
          {!editOrder ? null : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Server</Label>
                  <Input value={deliverForm.server} onChange={(e) => setDeliverForm((p) => ({ ...p, server: e.target.value }))} className="h-11 rounded-2xl" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Platform login</Label>
                  <Input value={deliverForm.platform_login} onChange={(e) => setDeliverForm((p) => ({ ...p, platform_login: e.target.value }))} className="h-11 rounded-2xl" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Platform password</Label>
                  <Input value={deliverForm.platform_password} onChange={(e) => setDeliverForm((p) => ({ ...p, platform_password: e.target.value }))} className="h-11 rounded-2xl" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Profit target</Label>
                  <Input value={deliverForm.profit_target} onChange={(e) => setDeliverForm((p) => ({ ...p, profit_target: e.target.value }))} className="h-11 rounded-2xl" placeholder="0" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Graph link</Label>
                  <Input value={deliverForm.graph_link} onChange={(e) => setDeliverForm((p) => ({ ...p, graph_link: e.target.value }))} className="h-11 rounded-2xl" placeholder="Optional" />
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-1">
                <Button
                  type="button"
                  className="h-9 rounded-xl border border-purple-400/30 bg-gradient-to-r from-purple-800 via-purple-950 to-purple-800 px-4 text-xs font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] hover:from-purple-700 hover:via-purple-900 hover:to-purple-700"
                  onClick={() => setDeliverOpen(false)}
                  disabled={deliverSaving}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  className="h-9 rounded-xl bg-purple-600 px-4 text-xs font-semibold text-white hover:bg-purple-700"
                  onClick={() => void submitDeliver(editOrder)}
                  disabled={deliverSaving}
                >
                  {deliverSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  Deliver
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Deliver with container modal */}
      <Dialog open={deliverContainerOpen} onOpenChange={(o) => { setDeliverContainerOpen(o); if (!o) setDeliverError(null) }}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Deliver with container</DialogTitle>
          </DialogHeader>
          {containersError ? (
            <div className="rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-foreground">
              {containersError}
            </div>
          ) : null}
          {!editOrder ? null : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Available containers</Label>
                <Select value={selectedContainerId} onValueChange={(v) => applySelectedContainer(v)} disabled={containersLoading}>
                  <SelectTrigger className="h-11 rounded-2xl">
                    <SelectValue placeholder={containersLoading ? "Loading..." : "Select an available account"} />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    {availableContainers.map((c) => (
                      <SelectItem key={String(c.id)} value={String(c.id)}>
                        {String(c.account_size ?? "—")} • {String(c.platform ?? "—")} • {String(c.platform_login ?? "—")} • {String(c.server ?? "—")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!containersLoading && availableContainers.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    No available container accounts match this order size.
                  </p>
                ) : null}
              </div>

              <div className="rounded-3xl border border-purple-400/20 bg-gradient-to-br from-purple-500/10 via-card to-muted/20 p-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Platform</Label>
                    <Input value={deliverForm.platform} className="h-11 rounded-2xl" disabled />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Profit target</Label>
                    <Input value={deliverForm.profit_target} className="h-11 rounded-2xl" disabled />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Login</Label>
                    <Input value={deliverForm.platform_login} className="h-11 rounded-2xl" disabled />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Password</Label>
                    <Input value={deliverForm.platform_password} className="h-11 rounded-2xl" disabled />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Server</Label>
                    <Input value={deliverForm.server} className="h-11 rounded-2xl" disabled />
                  </div>
                </div>
              </div>

              {deliverError ? (
                <div className="rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-foreground">
                  {deliverError}
                </div>
              ) : null}

              <div className="flex items-center justify-end gap-2 pt-1">
                <Button
                  type="button"
                  className="h-9 rounded-xl border border-purple-400/30 bg-gradient-to-r from-purple-800 via-purple-950 to-purple-800 px-4 text-xs font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] hover:from-purple-700 hover:via-purple-900 hover:to-purple-700"
                  onClick={() => setDeliverContainerOpen(false)}
                  disabled={deliverSaving}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  className="h-9 rounded-xl bg-purple-600 px-4 text-xs font-semibold text-white hover:bg-purple-700 disabled:opacity-60"
                  onClick={() => void submitDeliverWithContainer(editOrder)}
                  disabled={deliverSaving || !selectedContainerId}
                >
                  {deliverSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  Deliver
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Graph modal */}
      <Dialog open={graphOrder != null} onOpenChange={(o) => { if (!o) { setGraphOrder(null); setGraphData(null); setGraphError(null); setGraphStep("overview") } }}>
        <DialogContent className="sm:max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{graphStep === "overview" ? "Performance overview" : "Detailed performance"}</DialogTitle>
          </DialogHeader>
          {graphLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading…
            </div>
          ) : graphError ? (
            <div className="rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-foreground">
              {graphError}
            </div>
          ) : graphData ? (
            <div className="space-y-4">
              {graphStep === "overview" ? (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-sm text-muted-foreground">
                      Source: ShowMyTrades • {graphOrder?.order_id}
                    </div>
                    <Button
                      type="button"
                      className="h-9 rounded-full border border-purple-400/30 bg-gradient-to-r from-purple-800 via-purple-950 to-purple-800 px-4 text-xs font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] hover:from-purple-700 hover:via-purple-900 hover:to-purple-700"
                      onClick={() => setGraphStep("details")}
                    >
                      Detail performance
                    </Button>
                  </div>
                  <PerformanceOverviewCards data={graphData} />
                  <GraphPanel data={graphData} />
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between gap-2">
                    <Button
                      type="button"
                      className="h-9 rounded-full border border-purple-400/30 bg-gradient-to-r from-purple-800 via-purple-950 to-purple-800 px-4 text-xs font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] hover:from-purple-700 hover:via-purple-900 hover:to-purple-700"
                      onClick={() => setGraphStep("overview")}
                    >
                      ← Back
                    </Button>
                    <div className="text-sm text-muted-foreground">
                      {graphOrder?.order_id}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <PerformanceGraphPanel stats={graphData} />
                    <DetailedStatisticsCard stats={graphData} />
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">No data.</div>
          )}
        </DialogContent>
      </Dialog>
    </AdminShell>
  )
}

function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-2xl border border-border/70 bg-muted/20 px-4 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className={`mt-1 text-sm font-semibold text-foreground break-all ${mono ? "font-mono" : ""}`}>{value}</p>
    </div>
  )
}

function GraphPanel({ data }: { data: PerformanceResponse }) {
  const pointsRaw = data?.statistics?.equity_curve?.daily_performance ?? []
  const series = pointsRaw
    .map((d) => Number((d as any).twr_equity_percent ?? (d as any).twr_percent ?? (d as any).cumulative_profit))
    .filter((n) => Number.isFinite(n))

  const last = series.length ? series[series.length - 1] : null
  const dd = Number((data?.statistics?.account_stats as any)?.drawdown_percent ?? NaN)
  const bal = Number((data?.account_info as any)?.balance ?? NaN)

  const width = 720
  const height = 180
  const min = series.length ? Math.min(...series) : 0
  const max = series.length ? Math.max(...series) : 1
  const range = max - min || 1
  const path = series
    .map((v, i) => {
      const x = (i / Math.max(1, series.length - 1)) * (width - 2) + 1
      const y = height - ((v - min) / range) * (height - 2) - 1
      return `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`
    })
    .join(" ")

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <InfoRow label="Return ratio (TWR %)" value={last == null ? "—" : `${last.toFixed(2)}%`} />
        <InfoRow label="Drawdown" value={Number.isFinite(dd) ? `${dd.toFixed(2)}%` : "—"} />
        <InfoRow label="Balance" value={Number.isFinite(bal) ? `$${bal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "—"} />
      </div>

      <div className="rounded-3xl border border-border/70 bg-gradient-to-br from-card via-card to-muted/30 p-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">
          Return ratio progression
        </p>
        {series.length < 2 ? (
          <div className="text-sm text-muted-foreground">Not enough data to draw a graph.</div>
        ) : (
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-[180px]">
            <defs>
              <linearGradient id="g1" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="rgba(168,85,247,0.45)" />
                <stop offset="60%" stopColor="rgba(99,102,241,0.28)" />
                <stop offset="100%" stopColor="rgba(16,185,129,0.20)" />
              </linearGradient>
            </defs>
            <path d={path} fill="none" stroke="url(#g1)" strokeWidth="3" />
          </svg>
        )}
      </div>
    </div>
  )
}

function PerformanceOverviewCards({ data }: { data: PerformanceResponse }) {
  const stats = data?.statistics?.account_stats
  const adv = data?.statistics?.advanced_statistics
  const equity = Number(stats?.equity ?? NaN)
  const balance = Number(stats?.balance ?? NaN)
  const profit = Number(stats?.profit ?? NaN)
  const dd = Number(stats?.drawdown_percent ?? NaN)
  const winRate = Number((adv as any)?.win_rate ?? NaN)
  const totalTrades = Number((adv as any)?.total_trades ?? NaN)
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
      <StatChip label="Balance" value={Number.isFinite(balance) ? balance : 0} tone="muted" format="money" />
      <StatChip label="Equity" value={Number.isFinite(equity) ? equity : 0} tone="primary" format="money" />
      <StatChip label="Profit" value={Number.isFinite(profit) ? profit : 0} tone={Number.isFinite(profit) && profit < 0 ? "danger" : "success"} format="money" />
      <StatChip label="Drawdown" value={Number.isFinite(dd) ? dd : 0} tone="warning" format="percent" />
      <StatChip label="Win rate" value={Number.isFinite(winRate) ? winRate : 0} tone="muted" format="percent" />
      <StatChip label="Trades" value={Number.isFinite(totalTrades) ? totalTrades : 0} tone="muted" />
    </div>
  )
}

function StatChip({
  label,
  value,
  tone,
  format,
}: {
  label: string
  value: number
  tone: "success" | "warning" | "danger" | "primary" | "muted"
  format?: "money" | "percent"
}) {
  const classes =
    tone === "success"
      ? "bg-emerald-500/10 border-emerald-500/20"
      : tone === "warning"
        ? "bg-amber-500/10 border-amber-500/20"
        : tone === "danger"
          ? "bg-destructive/10 border-destructive/20"
          : tone === "primary"
            ? "bg-primary/10 border-primary/20"
          : "bg-muted/40 border-border/60"
  return (
    <div className={`rounded-2xl border p-3 ${classes}`}>
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/80">{label}</p>
      <p className="mt-1 text-lg font-bold tabular-nums text-foreground">
        {format === "money"
          ? `$${Number(value ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
          : format === "percent"
            ? `${Number(value ?? 0).toFixed(2)}%`
            : value}
      </p>
    </div>
  )
}

function MiniTrendChart({ points }: { points: number[] }) {
  const width = 720
  const height = 160
  const safe = points.length ? points : [0]
  const max = Math.max(...safe, 1)
  const stepX = (width - 2) / Math.max(1, safe.length - 1)
  const path = safe
    .map((v, i) => {
      const x = 1 + i * stepX
      const y = height - 1 - (v / max) * (height - 2)
      return `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`
    })
    .join(" ")
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-[160px]">
      <defs>
        <linearGradient id="ordersTrend" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(168,85,247,0.55)" />
          <stop offset="50%" stopColor="rgba(99,102,241,0.38)" />
          <stop offset="100%" stopColor="rgba(16,185,129,0.28)" />
        </linearGradient>
      </defs>
      <path d={path} fill="none" stroke="url(#ordersTrend)" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

