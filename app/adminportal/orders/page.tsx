"use client"

import { useState, Fragment } from "react"
import { AdminPageContainer } from "@/components/admin/page-container"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { MagnifyingGlass, Export, Eye, Key, Pencil, Check, X, CreditCard, Clock, User, ChartLineUp, Buildings } from "@phosphor-icons/react"

export type OrderTimelineEvent = {
  event_type: string
  event_date: string
  notes: string
}

export type OrderAccountCredential = {
  credential_id: number
  server: string
  platform_login: string
  platform_password: string
  session_id?: string
  terminal_id?: number
  profit_target?: number
  profit_share?: number
  status: string
  created_at: string
}

export type AdminOrder = {
  id: number
  order_id: string
  username: string
  email: string
  amount: number
  challenge_type: string
  account_size: string
  platform: string
  payment_method: string
  payment_status: string | null
  oxapay_payment_status: string | null
  payment_intent_id: string | null
  txid: string
  checkout_session_url: string | null
  image: string | null
  status: string
  is_active: boolean
  timeline: OrderTimelineEvent[]
  completed: boolean
  credential_id: number | null
  server: string
  platform_login: string
  platform_password: string
  profit_target: number
  completed_at: string | null
  passed: boolean
  is_stage2: boolean
  stage2_account: OrderAccountCredential | null
  is_live: boolean
  live_account: OrderAccountCredential | null
  failed: boolean
  has_account_credential: boolean
}

const mockOrders: AdminOrder[] = [
  {
    id: 74452136,
    order_id: "DFA#74452136",
    username: "kivivi5624",
    email: "kivivi5624@lawior.com",
    amount: 250,
    challenge_type: "Dragon 1",
    account_size: "50000",
    platform: "MT5",
    payment_method: "CARD",
    payment_status: null,
    oxapay_payment_status: null,
    payment_intent_id: null,
    txid: "TX744521361765389941",
    checkout_session_url: "https://checkout.stripe.com/...",
    image: null,
    status: "Live",
    is_active: true,
    timeline: [
      { event_type: "live_created", event_date: "2025-12-11T04:02:46.448701", notes: "Live account created" },
      { event_type: "stage2_created", event_date: "2025-12-11T03:54:10.835741", notes: "Stage 2 account created" },
      { event_type: "passed", event_date: "2025-12-10T18:13:48.405542", notes: "Order passed" },
      { event_type: "completed", event_date: "2025-12-10T18:06:23.812877", notes: "Order completed" },
      { event_type: "created", event_date: "2025-12-10T18:05:41.288797", notes: "Order created" },
    ],
    completed: true,
    credential_id: 92176,
    server: "FxGenz-Live",
    platform_login: "10001234",
    platform_password: "SecretPass1",
    profit_target: 223,
    completed_at: "2025-12-10T18:06:23.812877",
    passed: true,
    is_stage2: true,
    stage2_account: {
      credential_id: 92907,
      server: "FxGenz-Stage2",
      platform_login: "10005678",
      platform_password: "Stage2Pass",
      session_id: "string",
      terminal_id: 0,
      profit_target: 6,
      status: "active",
      created_at: "2025-12-11T03:54:10.835741",
    },
    is_live: true,
    live_account: {
      credential_id: 66532,
      server: "FxGenz-Live",
      platform_login: "10009999",
      platform_password: "LivePass99",
      session_id: "string",
      terminal_id: 0,
      profit_share: 80,
      status: "active",
      created_at: "2025-12-11T04:02:46.448701",
    },
    failed: false,
    has_account_credential: false,
  },
  {
    id: 74452135,
    order_id: "DFA#74452135",
    username: "trader_jane",
    email: "jane@example.com",
    amount: 299,
    challenge_type: "Phase 1",
    account_size: "100000",
    platform: "MT5",
    payment_method: "Crypto",
    payment_status: "paid",
    oxapay_payment_status: null,
    payment_intent_id: null,
    txid: "TX744521351765389940",
    checkout_session_url: null,
    image: null,
    status: "Stage 2",
    is_active: true,
    timeline: [
      { event_type: "stage2_created", event_date: "2025-12-09T10:00:00.000000", notes: "Stage 2 started" },
      { event_type: "passed", event_date: "2025-12-08T15:00:00.000000", notes: "Passed" },
      { event_type: "completed", event_date: "2025-12-08T14:00:00.000000", notes: "Completed" },
      { event_type: "created", event_date: "2025-12-08T12:00:00.000000", notes: "Order created" },
    ],
    completed: true,
    credential_id: 92906,
    server: "FxGenz-Stage2",
    platform_login: "10001111",
    platform_password: "Stage2Pass2",
    profit_target: 6,
    completed_at: "2025-12-08T14:00:00.000000",
    passed: true,
    is_stage2: true,
    stage2_account: {
      credential_id: 92906,
      server: "FxGenz-Stage2",
      platform_login: "10001111",
      platform_password: "Stage2Pass2",
      profit_target: 6,
      status: "active",
      created_at: "2025-12-09T10:00:00.000000",
    },
    is_live: false,
    live_account: null,
    failed: false,
    has_account_credential: true,
  },
]

function getCreatedAt(order: AdminOrder): string {
  const created = order.timeline?.find((e) => e.event_type === "created")
  if (created?.event_date) {
    try {
      const d = new Date(created.event_date)
      return d.toLocaleDateString(undefined, { dateStyle: "medium" }) + " " + d.toLocaleTimeString(undefined, { timeStyle: "short" })
    } catch {
      return created.event_date
    }
  }
  return "—"
}

function formatDate(iso: string) {
  try {
    const d = new Date(iso)
    return d.toLocaleDateString(undefined, { dateStyle: "medium" }) + " " + d.toLocaleTimeString(undefined, { timeStyle: "short" })
  } catch {
    return iso
  }
}

type CredentialSection = "main" | "stage2" | "live"

function getAllCredentialSections(order: AdminOrder): { label: string; key: CredentialSection; cred: OrderAccountCredential | (Pick<AdminOrder, "credential_id" | "server" | "platform_login" | "platform_password" | "profit_target"> & { status?: string; created_at?: string }) }[] {
  const sections: { label: string; key: CredentialSection; cred: OrderAccountCredential | (Pick<AdminOrder, "credential_id" | "server" | "platform_login" | "platform_password" | "profit_target"> & { status?: string; created_at?: string }) }[] = []
  if (order.credential_id != null && (order.server || order.platform_login || order.platform_password)) {
    sections.push({
      label: "Main / Phase 1",
      key: "main",
      cred: {
        credential_id: order.credential_id,
        server: order.server,
        platform_login: order.platform_login,
        platform_password: order.platform_password,
        profit_target: order.profit_target,
        status: "—",
        created_at: "—",
      },
    })
  }
  if (order.stage2_account) {
    sections.push({ label: "Stage 2 account", key: "stage2", cred: order.stage2_account })
  }
  if (order.live_account) {
    sections.push({ label: "Live account", key: "live", cred: order.live_account })
  }
  return sections
}

export default function AdminOrdersPage() {
  const [search, setSearch] = useState("")
  const [orders, setOrders] = useState<AdminOrder[]>(mockOrders)
  const [viewOrder, setViewOrder] = useState<AdminOrder | null>(null)
  const [credentialsOrder, setCredentialsOrder] = useState<AdminOrder | null>(null)
  const [editingCredential, setEditingCredential] = useState<{ order: AdminOrder; section: CredentialSection } | null>(null)
  const [editForm, setEditForm] = useState({ server: "", platform_login: "", platform_password: "" })

  const filtered = orders.filter(
    (o) =>
      o.order_id.toLowerCase().includes(search.toLowerCase()) ||
      o.email.toLowerCase().includes(search.toLowerCase()) ||
      o.username.toLowerCase().includes(search.toLowerCase()) ||
      o.challenge_type.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <AdminPageContainer
      title="Orders"
      description="View and manage all orders and transactions."
      actions={
        <Button variant="outline" size="sm" className="gap-2">
          <Export size={16} weight="duotone" />
          Export
        </Button>
      }
    >
      <Card className="rounded-xl border-2 border-border bg-card shadow-sm animate-slide-in-up">
        <CardHeader className="pb-4 border-b border-border bg-muted/20">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className="text-lg font-bold tracking-tight">All Orders</CardTitle>
            <div className="relative w-full sm:w-64">
              <MagnifyingGlass
                className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
                size={16}
                weight="duotone"
              />
              <Input
                placeholder="Search orders..."
                className="pl-9 h-9 text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
<TableHeader>
            <TableRow className="border-b-2 border-border">
                <TableHead className="font-semibold text-foreground">Order ID</TableHead>
                <TableHead className="font-semibold text-foreground">Account type</TableHead>
                <TableHead className="font-semibold text-foreground">Platform</TableHead>
                <TableHead className="font-semibold text-foreground">Payment method</TableHead>
                <TableHead className="font-semibold text-foreground">Status</TableHead>
                <TableHead className="font-semibold text-foreground">Created at</TableHead>
                <TableHead className="text-right font-semibold text-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((order) => (
                <TableRow key={order.id} className="hover:bg-muted/30">
                  <TableCell className="font-mono text-xs font-semibold text-foreground">{order.order_id}</TableCell>
                  <TableCell>
                    <span className="font-semibold">{order.challenge_type}</span>
                    <span className="text-muted-foreground text-xs block font-medium">{order.account_size}</span>
                  </TableCell>
                  <TableCell className="text-muted-foreground font-medium">{order.platform}</TableCell>
                  <TableCell>
                    <span className="text-muted-foreground">{order.payment_method}</span>
                    {order.payment_status && (
                      <Badge variant="secondary" className="ml-1 text-[10px]">
                        {order.payment_status}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        order.status === "Live" || order.status === "Passed" || order.status === "Completed"
                          ? "default"
                          : order.status === "Stage 2" || order.status === "Pending"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">{getCreatedAt(order)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 gap-1.5"
                        onClick={() => setViewOrder(order)}
                      >
                        <Eye size={14} weight="duotone" />
                        View
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 gap-1.5"
                        onClick={() => setCredentialsOrder(order)}
                      >
                        <Key size={14} weight="duotone" />
                        Credentials
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View order dialog - professional structured layout */}
      <Dialog open={!!viewOrder} onOpenChange={(open) => !open && setViewOrder(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden min-h-0">
          {viewOrder && (
            <>
              {/* Header: order ID, status, amount */}
              <div className="shrink-0 border-b border-border bg-muted/30 px-6 py-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Eye size={22} weight="duotone" className="text-primary" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold tracking-tight text-foreground font-mono">
                        {viewOrder.order_id}
                      </h2>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        ID {viewOrder.id} · {viewOrder.challenge_type} ({viewOrder.account_size})
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={
                        viewOrder.status === "Live" || viewOrder.status === "Passed" || viewOrder.status === "Completed"
                          ? "default"
                          : viewOrder.status === "Stage 2" || viewOrder.status === "Pending"
                            ? "secondary"
                            : "outline"
                      }
                      className="text-xs font-medium"
                    >
                      {viewOrder.status}
                    </Badge>
                    <span className="text-lg font-bold text-foreground">${viewOrder.amount}</span>
                  </div>
                </div>
              </div>

              <ScrollArea className="flex-1 min-h-0 h-full">
                <div className="px-6 py-4 space-y-6">
                  {/* Overview row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="rounded-lg border border-border bg-card p-4 space-y-1">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <User size={12} weight="duotone" />
                        User
                      </p>
                      <p className="text-sm font-medium truncate" title={viewOrder.email}>{viewOrder.username}</p>
                      <p className="text-xs text-muted-foreground truncate" title={viewOrder.email}>{viewOrder.email}</p>
                    </div>
                    <div className="rounded-lg border border-border bg-card p-4 space-y-1">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <ChartLineUp size={12} weight="duotone" />
                        Challenge
                      </p>
                      <p className="text-sm font-medium">{viewOrder.challenge_type}</p>
                      <p className="text-xs text-muted-foreground">{viewOrder.account_size} · {viewOrder.platform}</p>
                    </div>
                    <div className="rounded-lg border border-border bg-card p-4 space-y-1">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <CreditCard size={12} weight="duotone" />
                        Payment
                      </p>
                      <p className="text-sm font-medium">{viewOrder.payment_method}</p>
                      <p className="text-xs text-muted-foreground">{viewOrder.payment_status ?? "—"}</p>
                    </div>
                    <div className="rounded-lg border border-border bg-card p-4 space-y-1">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <Clock size={12} weight="duotone" />
                        Dates
                      </p>
                      <p className="text-xs font-medium">{getCreatedAt(viewOrder)}</p>
                      <p className="text-xs text-muted-foreground">
                        {viewOrder.completed_at ? "Completed " + formatDate(viewOrder.completed_at) : "—"}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  {/* Order details – structured key/value */}
                  <section className="space-y-3">
                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <ChartLineUp size={16} weight="duotone" className="text-muted-foreground" />
                      Order details
                    </h3>
                    <div className="rounded-lg border border-border overflow-hidden">
                      <div className="grid grid-cols-[1fr_1fr] sm:grid-cols-[140px_1fr] divide-x divide-y divide-border [&>div]:px-4 [&>div]:py-2.5 [&>div]:text-sm">
                        <div className="text-muted-foreground bg-muted/20">Order ID</div>
                        <div className="font-mono text-xs">{viewOrder.order_id}</div>
                        <div className="text-muted-foreground bg-muted/20">Internal ID</div>
                        <div className="font-mono">{viewOrder.id}</div>
                        <div className="text-muted-foreground bg-muted/20">Challenge type</div>
                        <div>{viewOrder.challenge_type}</div>
                        <div className="text-muted-foreground bg-muted/20">Account size</div>
                        <div>{viewOrder.account_size}</div>
                        <div className="text-muted-foreground bg-muted/20">Platform</div>
                        <div>{viewOrder.platform}</div>
                        <div className="text-muted-foreground bg-muted/20">Status</div>
                        <div><Badge variant="secondary" className="text-xs">{viewOrder.status}</Badge></div>
                        <div className="text-muted-foreground bg-muted/20">Amount</div>
                        <div className="font-medium">${viewOrder.amount}</div>
                        <div className="text-muted-foreground bg-muted/20">Completed</div>
                        <div>{viewOrder.completed ? "Yes" : "No"}</div>
                        <div className="text-muted-foreground bg-muted/20">Passed</div>
                        <div>{viewOrder.passed ? "Yes" : "No"}</div>
                        <div className="text-muted-foreground bg-muted/20">Active</div>
                        <div>{viewOrder.is_active ? "Yes" : "No"}</div>
                        <div className="text-muted-foreground bg-muted/20">Stage 2</div>
                        <div>{viewOrder.is_stage2 ? "Yes" : "No"}</div>
                        <div className="text-muted-foreground bg-muted/20">Live</div>
                        <div>{viewOrder.is_live ? "Yes" : "No"}</div>
                        <div className="text-muted-foreground bg-muted/20">Profit target</div>
                        <div>{viewOrder.profit_target}</div>
                        <div className="text-muted-foreground bg-muted/20">Credential ID</div>
                        <div className="font-mono">{viewOrder.credential_id ?? "—"}</div>
                      </div>
                    </div>
                  </section>

                  {/* Payment details */}
                  <section className="space-y-3">
                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <CreditCard size={16} weight="duotone" className="text-muted-foreground" />
                      Payment
                    </h3>
                    <div className="rounded-lg border border-border overflow-hidden">
                      <div className="grid grid-cols-[1fr_1fr] sm:grid-cols-[140px_1fr] divide-x divide-y divide-border [&>div]:px-4 [&>div]:py-2.5 [&>div]:text-sm">
                        <div className="text-muted-foreground bg-muted/20">Method</div>
                        <div>{viewOrder.payment_method}</div>
                        <div className="text-muted-foreground bg-muted/20">Status</div>
                        <div>{viewOrder.payment_status ?? "—"}</div>
                        <div className="text-muted-foreground bg-muted/20">Oxapay status</div>
                        <div>{viewOrder.oxapay_payment_status ?? "—"}</div>
                        <div className="text-muted-foreground bg-muted/20">Transaction ID</div>
                        <div className="font-mono text-xs break-all">{viewOrder.txid}</div>
                        <div className="text-muted-foreground bg-muted/20">Payment intent</div>
                        <div className="font-mono text-xs break-all">{viewOrder.payment_intent_id ?? "—"}</div>
                        <div className="text-muted-foreground bg-muted/20">Checkout URL</div>
                        <div className="text-xs break-all text-muted-foreground">
                          {viewOrder.checkout_session_url ? (
                            <a href={viewOrder.checkout_session_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                              Open link
                            </a>
                          ) : "—"}
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Timeline */}
                  <section className="space-y-3">
                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <Clock size={16} weight="duotone" className="text-muted-foreground" />
                      Timeline
                    </h3>
                    <div className="rounded-lg border border-border overflow-hidden">
                      {viewOrder.timeline?.length ? (
                        <ul className="divide-y divide-border">
                          {viewOrder.timeline.map((e, i) => (
                            <li key={i} className="flex gap-4 px-4 py-3 hover:bg-muted/20 transition-colors">
                              <div className="shrink-0 w-2 h-2 rounded-full bg-primary mt-1.5" aria-hidden />
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-foreground">{e.event_type.replace(/_/g, " ")}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">{formatDate(e.event_date)}</p>
                                {e.notes && <p className="text-xs text-muted-foreground mt-1">{e.notes}</p>}
                              </div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="px-4 py-6 text-sm text-muted-foreground text-center">No timeline events</p>
                      )}
                    </div>
                  </section>

                  {/* Stage 2 account */}
                  {viewOrder.stage2_account && (
                    <section className="space-y-3">
                      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <Buildings size={16} weight="duotone" className="text-muted-foreground" />
                        Stage 2 account
                      </h3>
                      <div className="rounded-lg border border-border overflow-hidden">
                        <div className="grid grid-cols-[1fr_1fr] sm:grid-cols-[130px_1fr] divide-x divide-y divide-border [&>div]:px-4 [&>div]:py-2.5 [&>div]:text-sm">
                          <div className="text-muted-foreground bg-muted/20">Credential ID</div>
                          <div className="font-mono">{viewOrder.stage2_account.credential_id}</div>
                          <div className="text-muted-foreground bg-muted/20">Server</div>
                          <div className="font-mono text-xs break-all">{viewOrder.stage2_account.server}</div>
                          <div className="text-muted-foreground bg-muted/20">Platform login</div>
                          <div className="font-mono">{viewOrder.stage2_account.platform_login}</div>
                          <div className="text-muted-foreground bg-muted/20">Platform password</div>
                          <div className="font-mono">{viewOrder.stage2_account.platform_password ? "••••••••" : "—"}</div>
                          <div className="text-muted-foreground bg-muted/20">Profit target</div>
                          <div>{viewOrder.stage2_account.profit_target ?? "—"}</div>
                          <div className="text-muted-foreground bg-muted/20">Status</div>
                          <div><Badge variant="secondary" className="text-xs">{viewOrder.stage2_account.status}</Badge></div>
                          <div className="text-muted-foreground bg-muted/20">Created at</div>
                          <div className="text-muted-foreground">{formatDate(viewOrder.stage2_account.created_at)}</div>
                        </div>
                      </div>
                    </section>
                  )}

                  {/* Live account */}
                  {viewOrder.live_account && (
                    <section className="space-y-3">
                      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <Buildings size={16} weight="duotone" className="text-muted-foreground" />
                        Live account
                      </h3>
                      <div className="rounded-lg border border-border overflow-hidden">
                        <div className="grid grid-cols-[1fr_1fr] sm:grid-cols-[130px_1fr] divide-x divide-y divide-border [&>div]:px-4 [&>div]:py-2.5 [&>div]:text-sm">
                          <div className="text-muted-foreground bg-muted/20">Credential ID</div>
                          <div className="font-mono">{viewOrder.live_account.credential_id}</div>
                          <div className="text-muted-foreground bg-muted/20">Server</div>
                          <div className="font-mono text-xs break-all">{viewOrder.live_account.server}</div>
                          <div className="text-muted-foreground bg-muted/20">Platform login</div>
                          <div className="font-mono">{viewOrder.live_account.platform_login}</div>
                          <div className="text-muted-foreground bg-muted/20">Platform password</div>
                          <div className="font-mono">{viewOrder.live_account.platform_password ? "••••••••" : "—"}</div>
                          <div className="text-muted-foreground bg-muted/20">Profit share</div>
                          <div>{viewOrder.live_account.profit_share ?? "—"}%</div>
                          <div className="text-muted-foreground bg-muted/20">Status</div>
                          <div><Badge variant="secondary" className="text-xs">{viewOrder.live_account.status}</Badge></div>
                          <div className="text-muted-foreground bg-muted/20">Created at</div>
                          <div className="text-muted-foreground">{formatDate(viewOrder.live_account.created_at)}</div>
                        </div>
                      </div>
                    </section>
                  )}

                  {/* Footer spacing */}
                  <div className="h-4" />
                </div>
              </ScrollArea>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Credentials dialog - all credentials for the order + edit */}
      <Dialog
        open={!!credentialsOrder}
        onOpenChange={(open) => {
          if (!open) {
            setCredentialsOrder(null)
            setEditingCredential(null)
          }
        }}
      >
        <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col overflow-hidden min-h-0">
          <DialogHeader className="shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <Key size={20} weight="duotone" />
              Account credentials
            </DialogTitle>
          </DialogHeader>
          {credentialsOrder && (() => {
            const sections = getAllCredentialSections(credentialsOrder)
            const currentOrder = orders.find((o) => o.id === credentialsOrder.id) ?? credentialsOrder

            const handleStartEdit = (sectionKey: CredentialSection) => {
              const section = sections.find((s) => s.key === sectionKey)
              if (!section) return
              const c = section.cred
              setEditingCredential({ order: currentOrder, section: sectionKey })
              setEditForm({
                server: c.server ?? "",
                platform_login: c.platform_login ?? "",
                platform_password: c.platform_password ?? "",
              })
            }

            const handleSaveEdit = () => {
              if (!editingCredential) return
              const { order, section } = editingCredential
              let updated: AdminOrder
              if (section === "main") {
                updated = { ...order, server: editForm.server, platform_login: editForm.platform_login, platform_password: editForm.platform_password }
              } else if (section === "stage2" && order.stage2_account) {
                updated = {
                  ...order,
                  stage2_account: { ...order.stage2_account, server: editForm.server, platform_login: editForm.platform_login, platform_password: editForm.platform_password },
                }
              } else if (section === "live" && order.live_account) {
                updated = {
                  ...order,
                  live_account: { ...order.live_account, server: editForm.server, platform_login: editForm.platform_login, platform_password: editForm.platform_password },
                }
              } else {
                setEditingCredential(null)
                return
              }
              setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)))
              setCredentialsOrder(updated)
              setEditingCredential(null)
            }

            const handleCancelEdit = () => setEditingCredential(null)

            if (sections.length === 0) {
              return (
                <p className="text-sm text-muted-foreground py-4">
                  No credentials available for this order yet.
                </p>
              )
            }

            return (
              <ScrollArea className="flex-1 min-h-0 h-full pr-4 -mr-4">
                <div className="grid gap-6 py-2">
                  <p className="text-xs text-muted-foreground">Order {currentOrder.order_id}</p>
                  {sections.map(({ label, key, cred }) => {
                    const isEditing = editingCredential?.order.id === currentOrder.id && editingCredential?.section === key
                    const profitLabel = "profit_share" in cred && cred.profit_share != null ? "Profit share (%)" : "Profit target"
                    const profitValue = "profit_share" in cred && cred.profit_share != null ? cred.profit_share : cred.profit_target ?? "—"
                    return (
                      <div key={key} className="rounded-lg border border-border p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-sm">{label}</h4>
                          {!isEditing ? (
                            <Button variant="outline" size="sm" className="h-8 gap-1.5" onClick={() => handleStartEdit(key)}>
                              <Pencil size={14} weight="duotone" />
                              Edit
                            </Button>
                          ) : (
                            <div className="flex gap-1">
                              <Button size="sm" className="h-8 gap-1" onClick={handleSaveEdit}>
                                <Check size={14} weight="bold" />
                                Save
                              </Button>
                              <Button variant="ghost" size="sm" className="h-8 gap-1" onClick={handleCancelEdit}>
                                <X size={14} weight="bold" />
                                Cancel
                              </Button>
                            </div>
                          )}
                        </div>
                        {isEditing ? (
                          <div className="grid gap-3 pt-2">
                            <div className="space-y-1.5">
                              <Label className="text-xs">Server</Label>
                              <Input className="h-9 font-mono text-sm" value={editForm.server} onChange={(e) => setEditForm((f) => ({ ...f, server: e.target.value }))} />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-xs">Platform login</Label>
                              <Input className="h-9 font-mono text-sm" value={editForm.platform_login} onChange={(e) => setEditForm((f) => ({ ...f, platform_login: e.target.value }))} />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-xs">Platform password</Label>
                              <Input className="h-9 font-mono text-sm" type="password" value={editForm.platform_password} onChange={(e) => setEditForm((f) => ({ ...f, platform_password: e.target.value }))} />
                            </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-[120px_1fr] gap-x-4 gap-y-2 text-sm">
                            <span className="text-muted-foreground">Credential ID</span>
                            <span className="font-mono">{cred.credential_id}</span>
                            <span className="text-muted-foreground">Server</span>
                            <span className="font-mono break-all">{cred.server}</span>
                            <span className="text-muted-foreground">Platform login</span>
                            <span className="font-mono bg-muted px-2 py-1 rounded">{cred.platform_login}</span>
                            <span className="text-muted-foreground">Platform password</span>
                            <span className="font-mono bg-muted px-2 py-1 rounded">{cred.platform_password}</span>
                            <span className="text-muted-foreground">{profitLabel}</span>
                            <span>{profitValue}</span>
                            {"created_at" in cred && cred.created_at && (
                              <>
                                <span className="text-muted-foreground">Created at</span>
                                <span className="text-muted-foreground">{formatDate(cred.created_at)}</span>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </ScrollArea>
            )
          })()}
        </DialogContent>
      </Dialog>
    </AdminPageContainer>
  )
}
