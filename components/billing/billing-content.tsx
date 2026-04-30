"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Receipt, Loader2 } from "lucide-react"
import { getMyAccount, type Order } from "@/lib/api/auth"
import { ApiClientError } from "@/lib/api/client"
import { trackPurchaseEnhanced } from "@/components/MetaPixel"

function formatCreatedAt(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleDateString(undefined, {
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
    case "Completed":
      return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs">Completed</Badge>
    case "Pending":
      return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-xs">Pending</Badge>
    case "Processing":
      return <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/20 text-xs">Processing</Badge>
    default:
      return <Badge variant="secondary" className="text-xs">{status}</Badge>
  }
}

const getPaymentStatusBadge = (paymentStatus: string | null) => {
  if (paymentStatus == null || paymentStatus === "") {
    return <span className="text-muted-foreground/70 text-sm">—</span>
  }
  switch (String(paymentStatus).toLowerCase()) {
    case "paid":
    case "completed":
      return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs">Paid</Badge>
    case "pending":
      return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-xs">Pending</Badge>
    case "failed":
      return <Badge className="bg-red-500/10 text-red-600 border-red-500/20 text-xs">Failed</Badge>
    default:
      return <Badge variant="secondary" className="text-xs">{paymentStatus}</Badge>
  }
}

export function BillingContent() {
  const [orders, setOrders] = useState<Order[]>([])
  const [totalOrders, setTotalOrders] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
      const orderId = String((order as any).order_id ?? "")
      if (!orderId || tracked.has(orderId)) continue

      const paymentStatus = String((order as any).payment_status ?? "").toLowerCase()
      const oxapayPaymentStatus = String((order as any).oxapay_payment_status ?? "").toLowerCase()
      const orderStatus = String((order as any).status ?? "").toLowerCase()

      const isPaid =
        paymentStatus === "paid" ||
        paymentStatus === "completed" ||
        oxapayPaymentStatus === "paid" ||
        oxapayPaymentStatus === "completed" ||
        orderStatus === "completed"

      if (!isPaid) continue

      const valueRaw = (order as any).amount
      const value = typeof valueRaw === "number" ? valueRaw : Number(valueRaw)
      const safeValue = Number.isFinite(value) ? value : 0

      const currency = String((order as any).currency ?? "USD") || "USD"
      const challengeType = String((order as any).challenge_type ?? "").trim()
      const accountSize = String((order as any).account_size ?? "").trim()
      const platform = String((order as any).platform ?? "").trim()
      const contentName = [challengeType, accountSize ? `$${Number(accountSize).toLocaleString("en-US")}` : ""]
        .filter(Boolean)
        .join(" - ") || "GenzProp Challenge"

      trackPurchaseEnhanced(
        safeValue,
        currency,
        contentName,
        challengeType || undefined,
        platform || undefined
      )

      tracked.add(orderId)
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
        const data = await getMyAccount()
        if (!cancelled) {
          setOrders(data.orders ?? [])
          setTotalOrders(data.total_orders ?? 0)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiClientError ? err.message : "Failed to load orders.")
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    fetchOrders()
    return () => { cancelled = true }
  }, [])

  return (
    <div className="space-y-4 animate-fade-in font-sans">
      <Card className="border border-border shadow-sm">
        <CardHeader className="pb-3 px-4 pt-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Receipt className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base font-semibold">Order History</CardTitle>
            </div>
            {!isLoading && !error && (
              <span className="text-xs text-muted-foreground">Total: {totalOrders}</span>
            )}
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
                    <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide h-9 px-4">Challenge Type</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide h-9">Platform</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide h-9">Order ID</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide h-9">Created At</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide h-9">Payment Method</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide h-9">Payment Status</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide h-9">Status</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide h-9 px-4">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order, index) => (
                    <TableRow
                      key={order.order_id}
                      className="border-border hover:bg-muted/40 transition-colors"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <TableCell className="text-sm font-medium px-4 py-3 capitalize">{order.challenge_type}</TableCell>
                      <TableCell className="text-sm py-3 uppercase">{order.platform}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground py-3">{order.order_id}</TableCell>
                      <TableCell className="text-sm text-muted-foreground py-3">{formatCreatedAt(order.created_at)}</TableCell>
                      <TableCell className="text-sm py-3">{order.payment_method || "—"}</TableCell>
                      <TableCell className="py-3">{getPaymentStatusBadge(order.payment_status)}</TableCell>
                      <TableCell className="py-3">{getStatusBadge(order.status)}</TableCell>
                      <TableCell className="px-4 py-3">
                        {order.status === "Pending" ? (
                          order.checkout_session_url ? (
                            <Button
                              variant="default"
                              size="sm"
                              className="h-7 text-xs px-3"
                              asChild
                            >
                              <a
                                href={order.checkout_session_url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                Complete
                              </a>
                            </Button>
                          ) : (
                            <Button variant="default" size="sm" className="h-7 text-xs px-3" disabled>
                              Complete
                            </Button>
                          )
                        ) : (
                          <Button variant="outline" size="sm" className="h-7 text-xs px-3">
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
