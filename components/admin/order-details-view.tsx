"use client"


import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import EmptyState from "@/components/ui/empty-state"
import { adminApprovePayment, adminGetOrder, adminRejectPayment, crmImpersonate, type AdminOrderDetail, type TradingAccount } from "@/lib/api/app-client"
import { ApiClientError } from "@/lib/api/client"
import { BarChart3, Copy, Check, Eye, EyeOff, LineChart, Loader2, LogIn, ShieldAlert } from "lucide-react"

function formatDate(input: string | null | undefined) {
  if (!input) return "—"
  const d = new Date(input)
  if (!Number.isFinite(d.getTime())) return "—"
  return d.toLocaleString()
}

function money(n: number | null | undefined) {
  if (n == null || !Number.isFinite(n)) return "—"
  return `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function statusBadgeClass(status: string) {
  switch (status) {
    case "active":
    case "passed":
    case "delivered":
    case "funded":
      return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
    case "failed":
    case "payment_rejected":
    case "breached":
    case "disabled":
      return "bg-red-500/10 text-red-600 border-red-500/20"
    case "processing":
    case "pending_review":
      return "bg-purple-500/10 text-purple-600 border-purple-500/20"
    default:
      return "bg-amber-500/10 text-amber-600 border-amber-500/20"
  }
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-1 text-base font-medium text-foreground break-words">{children}</div>
    </div>
  )
}

function SecretField({ label, value }: { label: string; value: string | null }) {
  const [shown, setShown] = useState(false)
  const [copied, setCopied] = useState(false)
  if (!value) return <Field label={label}>—</Field>
  return (
    <Field label={label}>
      <span className="inline-flex items-center gap-1.5">
        <code className="rounded bg-muted px-2 py-0.5 font-mono text-sm">{shown ? value : "••••••••"}</code>
        <button type="button" onClick={() => setShown((s) => !s)} className="p-1 text-muted-foreground hover:text-foreground" aria-label={shown ? "Hide" : "Show"}>
          {shown ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
        <button
          type="button"
          onClick={() => {
            void navigator.clipboard.writeText(value)
            setCopied(true)
            setTimeout(() => setCopied(false), 1500)
          }}
          className="p-1 text-muted-foreground hover:text-foreground"
          aria-label="Copy"
        >
          {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
        </button>
      </span>
    </Field>
  )
}

export function OrderDetailsView({ orderId }: { orderId: string }) {
  const [order, setOrder] = useState<AdminOrderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    setLoading(true)
    setError(null)
    setOrder(null)
    adminGetOrder(orderId)
      .then((res) => setOrder(res.order))
      .catch((err) => setError(err instanceof ApiClientError ? err.message : "Failed to load order."))
      .finally(() => setLoading(false))
  }, [orderId, reloadKey])

  const reviewPayment = async (approve: boolean) => {
    if (!order) return
    let reason: string | undefined
    if (approve) {
      if (!window.confirm(`Approve ${money(order.amountPaid)} and activate this order? Only do this after confirming the transfer on-chain.`)) return
    } else {
      const input = window.prompt("Reason for rejecting (sent to the customer, optional):")
      if (input === null) return
      reason = input.trim() || undefined
    }
    setBusy(true)
    setActionError(null)
    try {
      if (approve) await adminApprovePayment(order.id)
      else await adminRejectPayment(order.id, reason)
      setReloadKey((k) => k + 1)
    } catch (err) {
      setActionError(err instanceof ApiClientError ? err.message : "Failed to update payment.")
    } finally {
      setBusy(false)
    }
  }

  // Replaces the admin session in this browser with the user's session, then opens their dashboard.
  const openAsUser = async (path: string) => {
    if (!order?.userId) return
    setBusy(true)
    setActionError(null)
    try {
      await crmImpersonate(order.userId)
      window.open(path, "_blank")
    } catch (err) {
      setActionError(err instanceof ApiClientError ? err.message : "Failed to log in as user.")
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }
  if (error || !order) {
    return <EmptyState icon={<ShieldAlert className="w-8 h-8 text-muted-foreground" />} title="Failed to load" description={error ?? "Order not found."} />
  }

  const analyticsPath = `/dashboard?orderId=${encodeURIComponent(order.id)}`

  return (
        <div className="space-y-4 md:space-y-5">
          <Card className="rounded-2xl p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className={`${statusBadgeClass(order.status)} capitalize text-sm px-3 py-1`}>Payment: {order.status.replace(/_/g, " ")}</Badge>
                <Badge variant="outline" className="text-sm px-3 py-1">
                  {order.accounts.length} account{order.accounts.length === 1 ? "" : "s"}
                </Badge>
              </div>
              {order.userId && (
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" className="h-10 rounded-xl" disabled={busy} onClick={() => openAsUser(analyticsPath)}>
                    <BarChart3 className="h-4 w-4 mr-2" /> View analytics
                  </Button>
                  <Button className="h-10 rounded-xl" disabled={busy} onClick={() => openAsUser("/dashboard/overview")}>
                    {busy ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <LogIn className="h-4 w-4 mr-2" />}
                    Login to user dashboard
                  </Button>
                </div>
              )}
            </div>
            {actionError && <p className="mt-3 text-sm text-destructive">{actionError}</p>}
          </Card>

          {order.paymentProof && (
            <Card className="rounded-2xl p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Payment screenshot</h3>
                  <p className="text-sm text-muted-foreground">
                    Paid {money(order.amountPaid)} via {order.paymentProof.network ?? "crypto"}. Check the TXID on-chain before approving.
                  </p>
                </div>
                {order.status === "pending_review" && (
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" className="h-10 rounded-xl" disabled={busy} onClick={() => reviewPayment(false)}>
                      Reject
                    </Button>
                    <Button className="h-10 rounded-xl" disabled={busy} onClick={() => reviewPayment(true)}>
                      {busy && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Approve payment
                    </Button>
                  </div>
                )}
              </div>
              <div className="mb-4">
                <Field label="Transaction ID (TXID)">
                  {order.paymentProof.txid ? (
                    <span className="inline-flex flex-wrap items-center gap-2">
                      <code className="break-all rounded bg-muted px-2 py-0.5 font-mono text-sm">{order.paymentProof.txid}</code>
                      {order.paymentProof.explorerUrl && (
                        <a href={order.paymentProof.explorerUrl} target="_blank" rel="noreferrer" className="text-sm font-medium text-primary hover:underline">
                          View on explorer ↗
                        </a>
                      )}
                    </span>
                  ) : (
                    "—"
                  )}
                </Field>
              </div>
              {order.paymentProof.url ? (
                <a href={order.paymentProof.url} target="_blank" rel="noreferrer" className="block w-fit">
                  {/* eslint-disable-next-line @next/next/no-img-element -- short-lived signed URL */}
                  <img src={order.paymentProof.url} alt="Payment screenshot" className="max-h-[420px] rounded-xl border border-border object-contain" />
                </a>
              ) : (
                <p className="text-sm text-muted-foreground">Screenshot could not be loaded.</p>
              )}
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5">
            <Card className="rounded-2xl p-5 sm:p-6">
              <h3 className="text-lg font-semibold mb-4">Order</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Order ID"><code className="font-mono text-sm">{order.id}</code></Field>
                <Field label="Plan">
                  {order.challenge_plans ? `${order.challenge_plans.name} — $${order.challenge_plans.size.toLocaleString()}` : "—"}
                </Field>
                <Field label="Platform">{order.challenge_plans?.platform ?? "—"}</Field>
                <Field label="Plan price">{money(order.challenge_plans?.price)}</Field>
                <Field label="Amount paid">{money(order.amountPaid)}</Field>
                <Field label="Payment method"><span className="capitalize">{order.paymentMethod}</span></Field>
                <Field label="Coupon">{order.couponUsed ?? "—"}</Field>
                <Field label="Offer">{order.offerCode ?? "—"}</Field>
                {order.retryOfOrderId && (
                  <Field label="Free retry of">
                    <code className="font-mono text-sm">{order.retryOfOrderId}</code>
                  </Field>
                )}
                <Field label="Gateway ref"><code className="font-mono text-sm">{order.gatewayRef ?? "—"}</code></Field>
                <Field label="Created">{formatDate(order.createdAt)}</Field>
                <Field label="Updated">{formatDate(order.updatedAt)}</Field>
              </div>
            </Card>

            <Card className="rounded-2xl p-5 sm:p-6">
              <h3 className="text-lg font-semibold mb-4">Customer</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Name">{order.users?.name ?? "—"}</Field>
                <Field label="Email">{order.users?.email ?? "—"}</Field>
                <Field label="Phone">{order.users?.phone ?? "—"}</Field>
                <Field label="Country">{order.users?.country ?? "—"}</Field>
                <Field label="User status"><span className="capitalize">{order.users?.status ?? "—"}</span></Field>
                <Field label="Joined">{formatDate(order.users?.createdAt)}</Field>
                <Field label="User ID"><code className="font-mono text-sm">{order.userId ?? "—"}</code></Field>
              </div>
            </Card>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Trading accounts</h3>
            {order.accounts.length === 0 ? (
              <Card className="rounded-2xl p-6 text-base text-muted-foreground">No account has been delivered for this order yet.</Card>
            ) : (
              <div className="space-y-4">
                {order.accounts.map((a) => (
                  <AccountCard key={a.id} account={a} busy={busy} onAnalytics={order.userId ? () => openAsUser(analyticsPath) : undefined} />
                ))}
              </div>
            )}
          </div>
        </div>
  )
}

function AccountCard({ account: a, busy, onAnalytics }: { account: TradingAccount; busy: boolean; onAnalytics?: () => void }) {
  return (
    <Card className="rounded-2xl p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-lg font-bold uppercase">{a.platform}</span>
          <span className="font-mono text-base text-muted-foreground">#{a.login}</span>
          <Badge className={`${statusBadgeClass(a.status)} capitalize`}>Status: {a.status}</Badge>
          {a.phase && <Badge variant="outline" className="capitalize">{a.phase}</Badge>}
          <Badge className={`${statusBadgeClass(a.deliveryStatus)} capitalize`}>Delivery: {a.deliveryStatus}</Badge>
        </div>
        <div className="flex flex-wrap gap-2">
          {a.graphLink ? (
            <Button asChild variant="outline" className="h-10 rounded-xl">
              <a href={a.graphLink} target="_blank" rel="noopener noreferrer">
                <LineChart className="h-4 w-4 mr-2" /> View graph
              </a>
            </Button>
          ) : (
            <Button variant="outline" className="h-10 rounded-xl" disabled title="No graph link set for this account">
              <LineChart className="h-4 w-4 mr-2" /> No graph link
            </Button>
          )}
          {onAnalytics && (
            <Button variant="outline" className="h-10 rounded-xl" disabled={busy} onClick={onAnalytics}>
              <BarChart3 className="h-4 w-4 mr-2" /> Analytics
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {[
          { label: "Balance", value: money(a.balance) },
          { label: "Equity", value: money(a.equity) },
          { label: "Today P/L", value: money(a.todayPl), tone: a.todayPl },
          { label: "Total P/L", value: money(a.totalPl), tone: a.totalPl },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border/60 bg-muted/30 p-4">
            <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{s.label}</div>
            <div
              className={`mt-1 text-2xl font-bold tabular-nums ${
                s.tone == null ? "text-foreground" : s.tone > 0 ? "text-emerald-600" : s.tone < 0 ? "text-red-600" : "text-foreground"
              }`}
            >
              {s.value}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Field label="Login"><code className="font-mono text-sm">{a.login}</code></Field>
        <Field label="Server">{a.server || "—"}</Field>
        <SecretField label="Master password" value={a.passwordMaster} />
        <SecretField label="Investor password" value={a.passwordInvestor} />
        <Field label="Profit target">{a.profitTarget ? `${a.profitTarget}%` : "—"}</Field>
        <Field label="Delivered">{formatDate(a.deliveredAt)}</Field>
        <Field label="Created">{formatDate(a.createdAt)}</Field>
        <Field label="Account ID"><code className="font-mono text-xs">{a.id}</code></Field>
      </div>
    </Card>
  )
}
