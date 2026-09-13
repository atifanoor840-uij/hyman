"use client"

import { useEffect, useMemo, useState } from "react"
import { AdminShell } from "@/components/admin/admin-shell"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import EmptyState from "@/components/ui/empty-state"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  adminListOrders,
  adminPassOrder,
  adminFailOrder,
  adminCompleteFromInventory,
  adminCompleteManual,
  adminListInventory,
  crmImpersonate,
  type AdminOrderRow,
  type InventoryItem,
} from "@/lib/api/app-client"
import { ApiClientError } from "@/lib/api/client"
import { OrderDetailsView } from "@/components/admin/order-details-view"
import { Loader2, Search, ShieldAlert, LogIn, PackageCheck, Eye } from "lucide-react"

function formatDate(input: string | null) {
  if (!input) return "—"
  const d = new Date(input)
  if (!Number.isFinite(d.getTime())) return "—"
  return d.toLocaleString()
}

function statusBadgeClass(status: string) {
  switch (status) {
    case "active":
    case "passed":
    case "funded":
      return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
    case "failed":
      return "bg-red-500/10 text-red-600 border-red-500/20"
    case "processing":
      return "bg-purple-500/10 text-purple-600 border-purple-500/20"
    default:
      return "bg-amber-500/10 text-amber-600 border-amber-500/20"
  }
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrderRow[]>([])
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<AdminOrderRow | null>(null)
  const [viewId, setViewId] = useState<string | null>(null)
  const [deliverFor, setDeliverFor] = useState<AdminOrderRow | null>(null)
  const [busy, setBusy] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [failReason, setFailReason] = useState("")
  const [manualForm, setManualForm] = useState({
    phase: "phase1",
    platform: "mt5",
    login: "",
    passwordMaster: "",
    server: "",
    profitTarget: "",
    balance: "",
    graphLink: "",
  })
  const [inventoryId, setInventoryId] = useState("")
  const [pageError, setPageError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const emptyManualForm = { phase: "phase1", platform: "mt5", login: "", passwordMaster: "", server: "", profitTarget: "", balance: "", graphLink: "" }

  const refresh = async () => {
    setLoading(true)
    setError(null)
    try {
      const [ordersRes, inventoryRes] = await Promise.all([adminListOrders(), adminListInventory()])
      setOrders(ordersRes.orders)
      setInventory(inventoryRes.items.filter((i) => i.status === "available"))
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Failed to load orders.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return orders
    return orders.filter(
      (o) =>
        o.id.toLowerCase().includes(q) ||
        o.users?.email.toLowerCase().includes(q) ||
        o.users?.name.toLowerCase().includes(q) ||
        o.challenge_plans?.name.toLowerCase().includes(q)
    )
  }, [orders, search])

  const runAction = async (fn: () => Promise<unknown>, successMessage: string) => {
    setBusy(true)
    setActionError(null)
    try {
      await fn()
      setSelected(null)
      setDeliverFor(null)
      setFailReason("")
      setInventoryId("")
      setManualForm(emptyManualForm)
      setNotice(successMessage)
      await refresh()
    } catch (err) {
      setActionError(err instanceof ApiClientError ? err.message : "Action failed.")
    } finally {
      setBusy(false)
    }
  }

  const handleImpersonate = async (userId: string) => {
    if (!window.confirm("This will sign you out of admin in this browser and log you in as the user. Continue?")) return
    setPageError(null)
    try {
      await crmImpersonate(userId)
      window.open("/dashboard/overview", "_blank")
    } catch (err) {
      const msg = err instanceof ApiClientError ? err.message : "Failed to impersonate user."
      setActionError(msg)
      setPageError(msg)
    }
  }

  return (
    <AdminShell title="Orders" description="Review, approve, and fulfill customer orders.">
      <Card className="p-4 mb-4">
        <div className="flex items-center gap-2 max-w-sm">
          <Search className="w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by order, email, plan…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </Card>

      {notice && (
        <div className="mb-4 flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700">
          <span>{notice}</span>
          <button type="button" className="text-xs font-semibold hover:underline" onClick={() => setNotice(null)}>Dismiss</button>
        </div>
      )}
      {pageError && (
        <div className="mb-4 flex items-center justify-between rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <span>{pageError}</span>
          <button type="button" className="text-xs font-semibold hover:underline" onClick={() => setPageError(null)}>Dismiss</button>
        </div>
      )}

      <Card className="overflow-hidden">
        {loading && orders.length === 0 ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <EmptyState icon={<ShieldAlert className="w-8 h-8 text-muted-foreground" />} title="Failed to load" description={error} />
        ) : filtered.length === 0 ? (
          <EmptyState icon={<PackageCheck className="w-8 h-8 text-muted-foreground" />} title="No orders" description="No orders match your search." />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Payment status</TableHead>
                  <TableHead>Account status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell>
                      <div className="font-medium">{o.users?.name ?? "—"}</div>
                      <div className="text-xs text-muted-foreground">{o.users?.email}</div>
                    </TableCell>
                    <TableCell>
                      {o.challenge_plans?.name} ({o.challenge_plans ? `$${o.challenge_plans.size.toLocaleString()}` : "—"})
                    </TableCell>
                    <TableCell>${o.amountPaid.toFixed(2)}</TableCell>
                    <TableCell className="capitalize">{o.paymentMethod}</TableCell>
                    <TableCell>
                      <Badge className={`${statusBadgeClass(o.status)} capitalize`}>{o.status.replace(/_/g, " ")}</Badge>
                    </TableCell>
                    <TableCell>
                      {o.accounts.length === 0 ? (
                        <span className="text-xs text-muted-foreground">Not delivered</span>
                      ) : (
                        <div className="flex flex-col items-start gap-1">
                          <Badge className={`${statusBadgeClass(o.accounts[0].status)} capitalize`}>{o.accounts[0].status}</Badge>
                          <span className="text-xs text-muted-foreground capitalize">
                            {o.accounts[0].phase ?? "—"} · #{o.accounts[0].login}
                            {o.accounts.length > 1 ? ` (+${o.accounts.length - 1})` : ""}
                          </span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{formatDate(o.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" onClick={() => setViewId(o.id)}>
                          <Eye className="w-3.5 h-3.5 mr-1" /> View
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-emerald-500/40 text-emerald-700 hover:bg-emerald-500/10"
                          onClick={() => {
                            setActionError(null)
                            setInventoryId("")
                            setManualForm({ ...emptyManualForm, balance: o.challenge_plans ? String(o.challenge_plans.size) : "" })
                            setDeliverFor(o)
                          }}
                        >
                          <PackageCheck className="w-3.5 h-3.5 mr-1" /> Deliver
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => { setActionError(null); setFailReason(""); setSelected(o) }}>
                          Manage
                        </Button>
                        {o.userId && (
                          <Button size="sm" variant="outline" onClick={() => handleImpersonate(o.userId!)} title="Login to user dashboard">
                            <LogIn className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order {selected?.id.slice(0, 8)}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-muted-foreground text-xs">Customer</div>
                  <div>{selected.users?.name} ({selected.users?.email})</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs">Plan</div>
                  <div>{selected.challenge_plans?.name} — ${selected.challenge_plans?.size.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs">Status</div>
                  <Badge className={`${statusBadgeClass(selected.status)} capitalize`}>{selected.status.replace(/_/g, " ")}</Badge>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs">Amount</div>
                  <div>${selected.amountPaid.toFixed(2)} via {selected.paymentMethod}</div>
                </div>
              </div>

              {selected.accounts.length > 0 && (
                <div>
                  <div className="text-sm font-semibold mb-2">Delivered accounts</div>
                  <div className="space-y-2">
                    {selected.accounts.map((a) => (
                      <div key={a.id} className="rounded-lg border border-border p-3 text-xs">
                        <div className="flex justify-between">
                          <span className="font-medium capitalize">{a.phase} · {a.status}</span>
                          <span className="text-muted-foreground">{a.platform} — {a.login}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {actionError && <p className="text-sm text-destructive">{actionError}</p>}

              <div className="flex flex-wrap gap-2">
                <Button size="sm" disabled={busy || selected.status === "passed"} onClick={() => {
                    if (!window.confirm("Mark this order as PASSED? The user will be notified and a certificate issued.")) return
                    void runAction(() => adminPassOrder(selected.id), "Order marked as passed.")
                  }}>
                  Pass
                </Button>
                <div className="flex items-center gap-2">
                  <Input placeholder="Fail reason" value={failReason} onChange={(e) => setFailReason(e.target.value)} className="h-8 w-40" />
                  <Button size="sm" variant="destructive" disabled={busy || selected.status === "failed"} onClick={() => {
                    if (!window.confirm("Mark this order as FAILED? The user will be notified.")) return
                    void runAction(() => adminFailOrder(selected.id, failReason), "Order marked as failed.")
                  }}>
                    Fail
                  </Button>
                </div>
                {selected.userId && (
                  <Button size="sm" variant="outline" disabled={busy} onClick={() => handleImpersonate(selected.userId!)}>
                    <LogIn className="w-3.5 h-3.5 mr-1" /> Login as user
                  </Button>
                )}
              </div>

            </div>
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={!!viewId} onOpenChange={(open) => !open && setViewId(null)}>
        <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order details</DialogTitle>
          </DialogHeader>
          {viewId && <OrderDetailsView orderId={viewId} />}
        </DialogContent>
      </Dialog>

      <Dialog open={!!deliverFor} onOpenChange={(open) => !open && setDeliverFor(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Deliver account — order {deliverFor?.id.slice(0, 8)}</DialogTitle>
          </DialogHeader>
          {deliverFor && (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                {deliverFor.users?.name} ({deliverFor.users?.email}) · {deliverFor.challenge_plans?.name}{" "}
                {deliverFor.challenge_plans ? `$${deliverFor.challenge_plans.size.toLocaleString()}` : ""}
                {deliverFor.accounts.length > 0 && (
                  <span className="block mt-1 text-amber-600">
                    This order already has {deliverFor.accounts.length} delivered account{deliverFor.accounts.length === 1 ? "" : "s"}.
                  </span>
                )}
              </div>
              {actionError && <p className="text-sm text-destructive">{actionError}</p>}
              <div className="space-y-3">
                <div className="text-sm font-semibold">Deliver from inventory</div>
                <div className="flex flex-wrap items-end gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Phase</Label>
                    <select
                      value={manualForm.phase}
                      onChange={(e) => setManualForm((f) => ({ ...f, phase: e.target.value }))}
                      className="h-8 rounded-md border border-input bg-transparent px-2 text-sm"
                    >
                      <option value="phase1">Phase 1</option>
                      <option value="phase2">Phase 2</option>
                      <option value="funded">Funded</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Available account</Label>
                    <select
                      value={inventoryId}
                      onChange={(e) => setInventoryId(e.target.value)}
                      className="h-8 rounded-md border border-input bg-transparent px-2 text-sm min-w-[220px]"
                    >
                      <option value="">Select…</option>
                      {[...inventory]
                        .sort((a, b) => Number(b.size === deliverFor.challenge_plans?.size) - Number(a.size === deliverFor.challenge_plans?.size))
                        .map((i) => (
                          <option key={i.id} value={i.id}>
                            {i.size === deliverFor.challenge_plans?.size ? "(matches plan) " : ""}
                            {i.platform} — {i.login} (${i.size.toLocaleString()})
                          </option>
                        ))}
                    </select>
                  </div>
                  {inventory.length === 0 && <p className="w-full text-xs text-muted-foreground">No available inventory accounts — enter credentials manually below.</p>}
                  <Button
                    size="sm"
                    disabled={busy || !inventoryId}
                    onClick={() => void runAction(() => adminCompleteFromInventory(deliverFor.id, inventoryId, manualForm.phase), "Account delivered from inventory.")}
                  >
                    Deliver
                  </Button>
                </div>

                <div className="text-sm font-semibold pt-2">Or enter credentials manually</div>
                <div className="grid grid-cols-2 gap-2">
                  <Input placeholder="Platform (mt4/mt5)" value={manualForm.platform} onChange={(e) => setManualForm((f) => ({ ...f, platform: e.target.value }))} className="h-8" />
                  <Input placeholder="Server" value={manualForm.server} onChange={(e) => setManualForm((f) => ({ ...f, server: e.target.value }))} className="h-8" />
                  <Input placeholder="Login" value={manualForm.login} onChange={(e) => setManualForm((f) => ({ ...f, login: e.target.value }))} className="h-8" />
                  <Input placeholder="Password" value={manualForm.passwordMaster} onChange={(e) => setManualForm((f) => ({ ...f, passwordMaster: e.target.value }))} className="h-8" />
                  <Input placeholder="Profit target %" value={manualForm.profitTarget} onChange={(e) => setManualForm((f) => ({ ...f, profitTarget: e.target.value }))} className="h-8" />
                  <Input placeholder="Balance" value={manualForm.balance} onChange={(e) => setManualForm((f) => ({ ...f, balance: e.target.value }))} className="h-8" />
                  <Input placeholder="Graph link (optional)" value={manualForm.graphLink} onChange={(e) => setManualForm((f) => ({ ...f, graphLink: e.target.value }))} className="h-8 col-span-2" />
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={busy}
                  onClick={() => {
                    const missing = [
                      !manualForm.platform.trim() && "platform",
                      !manualForm.server.trim() && "server",
                      !manualForm.login.trim() && "login",
                      !manualForm.passwordMaster.trim() && "password",
                    ].filter(Boolean)
                    if (missing.length) {
                      setActionError(`Please fill in: ${missing.join(", ")}.`)
                      return
                    }
                    void runAction(() =>
                      adminCompleteManual(deliverFor.id, {
                        phase: manualForm.phase,
                        platform: manualForm.platform,
                        login: manualForm.login,
                        passwordMaster: manualForm.passwordMaster,
                        server: manualForm.server,
                        profitTarget: Number(manualForm.profitTarget) || 0,
                        balance: Number(manualForm.balance) || 0,
                        graphLink: manualForm.graphLink.trim() || undefined,
                      }),
                      "Account delivered."
                    )
                  }}
                >
                  Deliver manually
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminShell>
  )
}
