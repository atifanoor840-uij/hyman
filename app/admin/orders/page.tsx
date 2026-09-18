"use client"

import { useEffect, useMemo, useState } from "react"
import { AdminShell } from "@/components/admin/admin-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import {
  DataTable,
  EmptyBlock,
  ErrorBlock,
  Field,
  FilterTabs,
  LoadingBlock,
  NativeSelect,
  Notice,
  Panel,
  Person,
  SearchBox,
  StatRow,
  StatusPill,
  Toolbar,
  inputClass,
  money,
  shortDate,
  useConfirm,
} from "@/components/admin/admin-ui"
import { CheckCircle2, Eye, LogIn, MoreHorizontal, PackageCheck, RefreshCcw, ShoppingCart, XCircle } from "lucide-react"

type Filter = "all" | "review" | "delivery" | "unpaid" | "active" | "passed" | "failed"

/** Orders that never turned into a confirmed payment. */
const UNPAID = ["pending_payment", "pending_review", "payment_rejected"]

/** Paid, but the customer hasn't received trading credentials yet. */
const needsDelivery = (o: AdminOrderRow) => o.status === "processing" || (o.status === "active" && o.accounts.length === 0)

const EMPTY_MANUAL = { phase: "phase1", platform: "mt5", login: "", passwordMaster: "", server: "", profitTarget: "", balance: "", graphLink: "" }

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrderRow[]>([])
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<Filter>("all")
  const [viewId, setViewId] = useState<string | null>(null)
  const [deliverFor, setDeliverFor] = useState<AdminOrderRow | null>(null)
  const [deliverMode, setDeliverMode] = useState<"inventory" | "manual">("inventory")
  const [busy, setBusy] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [manualForm, setManualForm] = useState(EMPTY_MANUAL)
  const [inventoryId, setInventoryId] = useState("")
  const [notice, setNotice] = useState<{ tone: "success" | "error"; text: string } | null>(null)
  const { confirm, dialog } = useConfirm()

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

  const counts = useMemo(
    () => ({
      all: orders.length,
      review: orders.filter((o) => o.status === "pending_review").length,
      delivery: orders.filter(needsDelivery).length,
      unpaid: orders.filter((o) => o.status === "pending_payment").length,
      active: orders.filter((o) => o.status === "active" && o.accounts.length > 0).length,
      passed: orders.filter((o) => o.status === "passed").length,
      failed: orders.filter((o) => o.status === "failed").length,
    }),
    [orders],
  )

  const revenue = useMemo(
    () => orders.filter((o) => !UNPAID.includes(o.status)).reduce((s, o) => s + (o.amountPaid || 0), 0),
    [orders],
  )

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return orders.filter((o) => {
      if (filter === "review" && o.status !== "pending_review") return false
      if (filter === "delivery" && !needsDelivery(o)) return false
      if (filter === "unpaid" && o.status !== "pending_payment") return false
      if (filter === "active" && !(o.status === "active" && o.accounts.length > 0)) return false
      if (filter === "passed" && o.status !== "passed") return false
      if (filter === "failed" && o.status !== "failed") return false
      if (!q) return true
      return (
        o.id.toLowerCase().includes(q) ||
        o.users?.email.toLowerCase().includes(q) ||
        o.users?.name.toLowerCase().includes(q) ||
        o.challenge_plans?.name.toLowerCase().includes(q)
      )
    })
  }, [orders, search, filter])

  const runAction = async (fn: () => Promise<unknown>, successMessage: string) => {
    setBusy(true)
    setActionError(null)
    try {
      await fn()
      setDeliverFor(null)
      setInventoryId("")
      setManualForm(EMPTY_MANUAL)
      setNotice({ tone: "success", text: successMessage })
      await refresh()
    } catch (err) {
      const msg = err instanceof ApiClientError ? err.message : "Action failed."
      if (deliverFor) setActionError(msg)
      else setNotice({ tone: "error", text: msg })
    } finally {
      setBusy(false)
    }
  }

  const handlePass = async (o: AdminOrderRow) => {
    const { ok } = await confirm({
      title: "Mark order as passed?",
      description: `${o.users?.name ?? "The customer"} will be notified and a certificate will be issued.`,
      confirmLabel: "Mark as passed",
    })
    if (ok) void runAction(() => adminPassOrder(o.id), "Order marked as passed.")
  }

  const handleFail = async (o: AdminOrderRow) => {
    const { ok, reason } = await confirm({
      title: "Mark order as failed?",
      description: `${o.users?.name ?? "The customer"} will be notified that their challenge ended.`,
      confirmLabel: "Mark as failed",
      tone: "danger",
      reasonLabel: "Reason (shown to the customer)",
      reasonPlaceholder: "e.g. Daily loss limit breached on May 4",
    })
    if (ok) void runAction(() => adminFailOrder(o.id, reason), "Order marked as failed.")
  }

  const handleImpersonate = async (userId: string) => {
    const { ok } = await confirm({
      title: "Log in as this customer?",
      description: "You’ll be signed out of admin in this browser and their dashboard opens in a new tab.",
      confirmLabel: "Continue",
    })
    if (!ok) return
    try {
      await crmImpersonate(userId)
      window.open("/dashboard/overview", "_blank")
    } catch (err) {
      setNotice({ tone: "error", text: err instanceof ApiClientError ? err.message : "Failed to log in as user." })
    }
  }

  const openDeliver = (o: AdminOrderRow) => {
    setActionError(null)
    setInventoryId("")
    setManualForm({ ...EMPTY_MANUAL, balance: o.challenge_plans ? String(o.challenge_plans.size) : "" })
    setDeliverMode(inventory.length ? "inventory" : "manual")
    setDeliverFor(o)
  }

  const submitManual = () => {
    if (!deliverFor) return
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
    void runAction(
      () =>
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
      "Account delivered.",
    )
  }

  const setManual = (key: keyof typeof EMPTY_MANUAL) => (v: string) => setManualForm((f) => ({ ...f, [key]: v }))

  return (
    <AdminShell
      title="Orders"
      description="Deliver trading accounts, and pass or fail challenges."
      actions={
        <Button variant="outline" className="h-10 gap-2 rounded-xl border-border bg-card" onClick={() => void refresh()} disabled={loading}>
          <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
        </Button>
      }
    >
      <div className="space-y-4">
        <StatRow
          items={[
            { label: "Payment review", value: counts.review, tone: "warning", hint: "Scan & pay screenshots to check" },
            { label: "Needs delivery", value: counts.delivery, tone: "warning", hint: "Paid, no account sent yet" },
            { label: "Awaiting payment", value: counts.unpaid, tone: "neutral", hint: "Checkout not completed" },
            { label: "Active challenges", value: counts.active, tone: "success", hint: "Customers trading now" },
            { label: "Revenue", value: money(revenue, 0), tone: "brand", hint: "All paid orders" },
          ]}
        />

        {notice && (
          <Notice tone={notice.tone} onDismiss={() => setNotice(null)}>
            {notice.text}
          </Notice>
        )}

        <Panel>
          <Toolbar>
            <FilterTabs<Filter>
              value={filter}
              onChange={setFilter}
              options={[
                { value: "all", label: "All", count: counts.all },
                { value: "review", label: "Payment review", count: counts.review },
                { value: "delivery", label: "Needs delivery", count: counts.delivery },
                { value: "unpaid", label: "Awaiting payment", count: counts.unpaid },
                { value: "active", label: "Active", count: counts.active },
                { value: "passed", label: "Passed", count: counts.passed },
                { value: "failed", label: "Failed", count: counts.failed },
              ]}
            />
            <SearchBox value={search} onChange={setSearch} placeholder="Search customer, plan or order ID" />
          </Toolbar>

          {loading && orders.length === 0 ? (
            <LoadingBlock label="Loading orders…" />
          ) : error ? (
            <ErrorBlock message={error} onRetry={() => void refresh()} />
          ) : filtered.length === 0 ? (
            <EmptyBlock
              icon={ShoppingCart}
              title={search || filter !== "all" ? "No matching orders" : "No orders yet"}
              description={search || filter !== "all" ? "Try another filter or clear the search." : "New customer orders will show up here."}
            />
          ) : (
            <DataTable head={["Customer", "Plan", "Amount", "Status", "Trading account", "Created", ""]}>
              {filtered.map((o) => {
                const acct = o.accounts[0]
                const deliver = needsDelivery(o)
                return (
                  <tr key={o.id}>
                    <td>
                      <Person name={o.users?.name} email={o.users?.email} />
                    </td>
                    <td>
                      <p className="font-medium text-foreground">{o.challenge_plans?.name ?? "—"}</p>
                      <p className="text-xs text-muted-foreground">
                        {o.challenge_plans ? money(o.challenge_plans.size, 0) : "—"} account · #{o.id.slice(0, 8)}
                      </p>
                    </td>
                    <td>
                      <p className="font-medium tabular-nums text-foreground">{money(o.amountPaid)}</p>
                      <p className="text-xs capitalize text-muted-foreground">{o.paymentMethod}</p>
                    </td>
                    <td>
                      {deliver ? <StatusPill label="Needs delivery" tone="warning" /> : <StatusPill status={o.status} />}
                    </td>
                    <td>
                      {acct ? (
                        <div>
                          <p className="font-mono text-xs text-foreground">#{acct.login}</p>
                          <p className="text-xs capitalize text-muted-foreground">
                            {acct.phase ?? "—"} · {acct.status}
                            {o.accounts.length > 1 ? ` · +${o.accounts.length - 1} more` : ""}
                          </p>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">Not delivered</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap text-xs text-muted-foreground">{shortDate(o.createdAt)}</td>
                    <td>
                      <div className="flex items-center justify-end gap-2">
                        {deliver ? (
                          <Button size="sm" className="h-8 gap-1.5 rounded-lg" onClick={() => openDeliver(o)}>
                            <PackageCheck className="h-3.5 w-3.5" /> Deliver
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" className="h-8 gap-1.5 rounded-lg border-border" onClick={() => setViewId(o.id)}>
                            <Eye className="h-3.5 w-3.5" /> View
                          </Button>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg" aria-label="More actions">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-52 rounded-xl">
                            <DropdownMenuItem onClick={() => setViewId(o.id)}>
                              <Eye className="mr-2 h-4 w-4" /> View details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openDeliver(o)} disabled={o.status === "pending_payment"}>
                              <PackageCheck className="mr-2 h-4 w-4" /> {o.accounts.length ? "Deliver another account" : "Deliver account"}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => void handlePass(o)} disabled={busy || o.status === "passed"}>
                              <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-600" /> Mark as passed
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => void handleFail(o)} disabled={busy || o.status === "failed"} className="text-destructive focus:text-destructive">
                              <XCircle className="mr-2 h-4 w-4" /> Mark as failed
                            </DropdownMenuItem>
                            {o.userId && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => void handleImpersonate(o.userId!)}>
                                  <LogIn className="mr-2 h-4 w-4" /> Log in as customer
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </DataTable>
          )}
        </Panel>
      </div>

      {/* Order details */}
      <Dialog open={!!viewId} onOpenChange={(open) => !open && setViewId(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl sm:max-w-5xl">
          <DialogHeader>
            <DialogTitle>Order details</DialogTitle>
          </DialogHeader>
          {viewId && <OrderDetailsView orderId={viewId} />}
        </DialogContent>
      </Dialog>

      {/* Deliver account */}
      <Dialog open={!!deliverFor} onOpenChange={(open) => !open && setDeliverFor(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Deliver trading account</DialogTitle>
            <DialogDescription>Send login credentials to the customer for this order.</DialogDescription>
          </DialogHeader>
          {deliverFor && (
            <div className="space-y-5">
              <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/50 p-3">
                <Person name={deliverFor.users?.name} email={deliverFor.users?.email} />
                <div className="shrink-0 text-right">
                  <p className="text-sm font-semibold text-foreground">{deliverFor.challenge_plans?.name}</p>
                  <p className="text-xs text-muted-foreground">{deliverFor.challenge_plans ? money(deliverFor.challenge_plans.size, 0) : ""}</p>
                </div>
              </div>

              {deliverFor.accounts.length > 0 && (
                <Notice tone="error">
                  This order already has {deliverFor.accounts.length} delivered account{deliverFor.accounts.length === 1 ? "" : "s"}. Only continue if
                  you’re sending the next phase.
                </Notice>
              )}

              <Field label="Phase to deliver" htmlFor="phase">
                <NativeSelect id="phase" value={manualForm.phase} onChange={setManual("phase")}>
                  <option value="phase1">Phase 1</option>
                  <option value="phase2">Phase 2</option>
                  <option value="funded">Funded</option>
                </NativeSelect>
              </Field>

              <FilterTabs<"inventory" | "manual">
                value={deliverMode}
                onChange={setDeliverMode}
                options={[
                  { value: "inventory", label: "From inventory", count: inventory.length },
                  { value: "manual", label: "Enter manually" },
                ]}
              />

              {deliverMode === "inventory" ? (
                inventory.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
                    No available accounts in inventory. Add some under <span className="font-medium text-foreground">Container</span>, or enter
                    credentials manually.
                  </p>
                ) : (
                  <div className="space-y-4">
                    <Field label="Available account" hint="Accounts matching the plan size are listed first." htmlFor="inv">
                      <NativeSelect id="inv" value={inventoryId} onChange={setInventoryId}>
                        <option value="">Choose an account…</option>
                        {[...inventory]
                          .sort((a, b) => Number(b.size === deliverFor.challenge_plans?.size) - Number(a.size === deliverFor.challenge_plans?.size))
                          .map((i) => (
                            <option key={i.id} value={i.id}>
                              {i.platform.toUpperCase()} · {i.login} · {money(i.size, 0)}
                              {i.size === deliverFor.challenge_plans?.size ? "  ✓ matches plan" : ""}
                            </option>
                          ))}
                      </NativeSelect>
                    </Field>
                    <Button
                      className="h-10 w-full rounded-xl"
                      disabled={busy || !inventoryId}
                      onClick={() => void runAction(() => adminCompleteFromInventory(deliverFor.id, inventoryId, manualForm.phase), "Account delivered from inventory.")}
                    >
                      <PackageCheck className="h-4 w-4" /> {busy ? "Delivering…" : "Deliver selected account"}
                    </Button>
                  </div>
                )
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Field label="Platform" htmlFor="m-platform">
                      <NativeSelect id="m-platform" value={manualForm.platform} onChange={setManual("platform")}>
                        <option value="mt5">MT5</option>
                        <option value="mt4">MT4</option>
                      </NativeSelect>
                    </Field>
                    <Field label="Server" htmlFor="m-server">
                      <Input id="m-server" className={inputClass} value={manualForm.server} onChange={(e) => setManual("server")(e.target.value)} />
                    </Field>
                    <Field label="Login" htmlFor="m-login">
                      <Input id="m-login" className={inputClass} value={manualForm.login} onChange={(e) => setManual("login")(e.target.value)} />
                    </Field>
                    <Field label="Password" htmlFor="m-pass">
                      <Input id="m-pass" className={inputClass} value={manualForm.passwordMaster} onChange={(e) => setManual("passwordMaster")(e.target.value)} />
                    </Field>
                    <Field label="Profit target (%)" htmlFor="m-target">
                      <Input id="m-target" type="number" className={inputClass} value={manualForm.profitTarget} onChange={(e) => setManual("profitTarget")(e.target.value)} />
                    </Field>
                    <Field label="Starting balance ($)" htmlFor="m-balance">
                      <Input id="m-balance" type="number" className={inputClass} value={manualForm.balance} onChange={(e) => setManual("balance")(e.target.value)} />
                    </Field>
                    <Field label="Graph link" hint="Optional — used for live statistics." className="sm:col-span-2" htmlFor="m-graph">
                      <Input id="m-graph" className={inputClass} value={manualForm.graphLink} onChange={(e) => setManual("graphLink")(e.target.value)} />
                    </Field>
                  </div>
                  <Button className="h-10 w-full rounded-xl" disabled={busy} onClick={submitManual}>
                    <PackageCheck className="h-4 w-4" /> {busy ? "Delivering…" : "Deliver account"}
                  </Button>
                </div>
              )}

              {actionError && <Notice tone="error">{actionError}</Notice>}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {dialog}
    </AdminShell>
  )
}
