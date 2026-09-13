"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Receipt, Loader2 } from "lucide-react"
import { listMyOrders, payOrder, type OrderWithPlan } from "@/lib/api/app-client"
import { ApiClientError } from "@/lib/api/client"
import { trackPurchaseEnhanced } from "@/components/MetaPixel"

function formatCreatedAt(iso: string | null): string {
  if (!iso) return "—"
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return iso
  }
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "active":
    case "passed":
      return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs capitalize">{status}</Badge>
    case "pending_payment":
      return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-xs">Pending payment</Badge>
    case "processing":
      return <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/20 text-xs">Processing</Badge>
    case "failed":
      return <Badge className="bg-red-500/10 text-red-600 border-red-500/20 text-xs">Failed</Badge>
    default:
      return <Badge variant="secondary" className="text-xs capitalize">{status}</Badge>
  }
}

export function BillingContent() {
  const [orders, setOrders] = useState<OrderWithPlan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [payingId, setPayingId] = useState<string | null>(null)

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
    async function fetchOrders() {
      setIsLoading(true)
      setError(null)
      try {
        const data = await listMyOrders()
        if (!cancelled) setOrders(data.orders ?? [])
      } catch (err) {
        if (!cancelled) setError(err instanceof ApiClientError ? err.message : "Failed to load orders.")
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    fetchOrders()
    return () => {
      cancelled = true
    }
  }, [])

  const handleComplete = async (orderId: string) => {
    setPayingId(orderId)
    try {
      const { checkoutUrl } = await payOrder(orderId)
      window.location.href = checkoutUrl
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Unable to start payment. Please try again.")
    } finally {
      setPayingId(null)
    }
  }

  return (
    <div className="space-y-4 animate-fade-in font-sans">
      <Card className="border border-border shadow-sm">
        <CardHeader className="pb-3 px-4 pt-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Receipt className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base font-semibold">Order History</CardTitle>
            </div>
            {!isLoading && !error && <span className="text-xs text-muted-foreground">Total: {orders.length}</span>}
          </div>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="px-4 pb-6 text-sm text-destructive">{error}</div>
          ) : orders.length === 0 ? (
            <div className="px-4 pb-6 text-sm text-muted-foreground">No orders yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border bg-muted/30 hover:bg-muted/30">
                    <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide h-9 px-4">Plan</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide h-9">Platform</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide h-9">Order ID</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide h-9">Created At</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide h-9">Payment Method</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide h-9">Amount</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide h-9">Status</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide h-9 px-4">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order, index) => (
                    <TableRow
                      key={order.id}
                      className="border-border hover:bg-muted/40 transition-colors"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <TableCell className="text-sm font-medium px-4 py-3">{order.challenge_plans?.name ?? "—"}</TableCell>
                      <TableCell className="text-sm py-3 uppercase">{order.challenge_plans?.platform ?? "—"}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground py-3">{order.id.slice(0, 8)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground py-3">{formatCreatedAt(order.createdAt)}</TableCell>
                      <TableCell className="text-sm py-3 capitalize">{order.paymentMethod || "—"}</TableCell>
                      <TableCell className="text-sm py-3">${order.amountPaid.toFixed(2)}</TableCell>
                      <TableCell className="py-3">{getStatusBadge(order.status)}</TableCell>
                      <TableCell className="px-4 py-3">
                        {order.status === "pending_payment" ? (
                          <Button
                            variant="default"
                            size="sm"
                            className="h-7 text-xs px-3"
                            disabled={payingId === order.id}
                            onClick={() => handleComplete(order.id)}
                          >
                            {payingId === order.id ? "Starting…" : "Complete"}
                          </Button>
                        ) : (
                          <Button variant="outline" size="sm" className="h-7 text-xs px-3" disabled>
                            Download
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
