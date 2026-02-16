"use client"

import { useState, useEffect, type ReactNode } from "react"
import { adminApiRequest } from "@/lib/api/admin-auth"
import {
  ClipboardDocumentListIcon,
  KeyIcon,
  PencilIcon,
  EyeIcon,
  DocumentTextIcon,
  CreditCardIcon,
  CubeIcon,
  ClockIcon,
  CheckCircleIcon,
  UserCircleIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface CredentialBlock {
  credential_id?: number | null
  server?: string | null
  platform_login?: string | null
  platform_password?: string | null
  session_id?: string | null
  terminal_id?: number | null
  profit_target?: number | null
  profit_share?: number | null
  status?: string | null
  created_at?: string | null
}

interface OrderRow {
  id?: number
  order_id?: string
  username?: string
  email?: string
  amount?: number
  challenge_type?: string
  account_size?: string | number
  platform?: string
  payment_method?: string
  payment_status?: string
  status?: string
  created_at?: string
  credential_id?: number | null
  server?: string | null
  platform_login?: string | null
  platform_password?: string | null
  stage2_account?: CredentialBlock | null
  live_account?: CredentialBlock | null
  has_account_credential?: boolean
  [key: string]: unknown
}

/** Format backend date/time for display; accepts string (ISO etc), number (Unix sec/ms), or undefined. Shows raw value if parse fails. */
function formatDate(value: string | number | null | undefined): string {
  if (value === undefined || value === null) return "—"
  if (typeof value === "number") {
    const d = value > 1e12 ? new Date(value) : new Date(value * 1000)
    if (Number.isNaN(d.getTime())) return String(value)
    return d.toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" })
  }
  const s = String(value).trim()
  if (!s) return "—"
  try {
    const d = new Date(s)
    if (Number.isNaN(d.getTime())) return s
    return d.toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" })
  } catch {
    return s
  }
}

/** Get created time from order using common backend field names. */
function getOrderCreated(o: OrderRow): string | number | null | undefined {
  return (o as Record<string, unknown>).created_at ?? (o as Record<string, unknown>).created ?? (o as Record<string, unknown>).order_created_at ?? (o as Record<string, unknown>).date ?? (o as Record<string, unknown>).timestamp ?? o.created_at
}

function Field({ label, value, mono }: { label: string; value: ReactNode; mono?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider">
        {label}
      </span>
      <span className={`text-sm font-medium text-neutral-900 break-all ${mono ? "font-mono" : ""}`}>
        {value ?? "—"}
      </span>
    </div>
  )
}

function StatusBadge({ status, variant = "neutral" }: { status: string; variant?: "success" | "warning" | "error" | "neutral" }) {
  const styles = {
    success: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
    warning: "bg-amber-500/10 text-amber-700 border-amber-500/20",
    error: "bg-red-500/10 text-red-700 border-red-500/20",
    neutral: "bg-neutral-100 text-neutral-700 border-neutral-200",
  }
  return (
    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold ${styles[variant]}`}>
      {status}
    </span>
  )
}

function BoolBadge({ value }: { value: boolean }) {
  return value ? (
    <StatusBadge status="Yes" variant="success" />
  ) : (
    <span className="inline-flex items-center rounded-md border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-xs font-medium text-neutral-500">
      No
    </span>
  )
}

function FilterChip({
  children,
  active,
  onClick,
  variant = "neutral",
}: {
  children: ReactNode
  active: boolean
  onClick: () => void
  variant?: "neutral" | "success" | "warning"
}) {
  const base = "inline-flex items-center rounded-lg border px-3 py-1.5 text-xs font-medium transition-all focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-1"
  const activeStyles =
    variant === "success"
      ? "border-emerald-600 bg-emerald-600 text-white shadow-sm hover:bg-emerald-700"
      : variant === "warning"
      ? "border-amber-600 bg-amber-600 text-white shadow-sm hover:bg-amber-700"
      : "border-neutral-800 bg-neutral-800 text-white shadow-sm hover:bg-neutral-700"
  const inactiveStyles = "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50"
  return (
    <button
      type="button"
      onClick={onClick}
      className={active ? `${base} ${activeStyles}` : `${base} ${inactiveStyles}`}
    >
      {children}
    </button>
  )
}

function SectionCard({
  title,
  icon: Icon,
  children,
  accent = "neutral",
}: {
  title: string
  icon: typeof DocumentTextIcon
  children: ReactNode
  accent?: "neutral" | "blue" | "emerald" | "amber"
}) {
  const borderColors = {
    neutral: "border-l-neutral-400",
    blue: "border-l-blue-500",
    emerald: "border-l-emerald-500",
    amber: "border-l-amber-500",
  }
  return (
    <section className={`rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden border-l-4 ${borderColors[accent]}`}>
      <div className="flex items-center gap-3 px-4 py-3 bg-neutral-50/80 border-b border-neutral-100">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white border border-neutral-200 shadow-sm">
          <Icon className="h-4 w-4 text-neutral-600" />
        </div>
        <h3 className="text-sm font-semibold text-neutral-800 tracking-tight">
          {title}
        </h3>
      </div>
      <div className="p-4">{children}</div>
    </section>
  )
}

function ViewOrderDialog({
  order,
  open,
  onOpenChange,
}: {
  order: OrderRow | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  if (!order) return null

  const timeline = (order.timeline as { event_type?: string; event_date?: string; notes?: string }[] | undefined) ?? []
  const status = (order.status as string) ?? ""
  const statusVariant =
    status === "Live" || status === "Passed" || status === "Delivered"
      ? "success"
      : status === "Pending" || status === "Stage 2"
        ? "warning"
        : status === "Failed"
          ? "error"
          : "neutral"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0">
        {/* Header strip */}
        <div className="shrink-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-6 py-4 border-b border-neutral-200 bg-neutral-50/50">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-900 text-white">
              <DocumentTextIcon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-neutral-900 truncate font-mono">
                {order.order_id ?? "—"}
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                ID {order.id ?? "—"} · {order.username ?? order.email ?? "—"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <StatusBadge status={status} variant={statusVariant} />
            {order.amount != null && (
              <span className="rounded-md bg-white border border-neutral-200 px-3 py-1.5 text-sm font-semibold text-neutral-800">
                ${order.amount}
              </span>
            )}
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5 space-y-5 max-h-[calc(90vh-180px)]">
          {/* Order info */}
          <SectionCard title="Order & customer" icon={UserCircleIcon} accent="blue">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Order ID" value={order.order_id} mono />
              <Field label="Internal ID" value={order.id != null ? String(order.id) : undefined} mono />
              <Field label="Username" value={order.username} />
              <Field label="Email" value={order.email} />
              <Field label="Created" value={formatDate(getOrderCreated(order))} />
              <Field label="Completed" value={formatDate(order.completed_at as string)} />
            </div>
          </SectionCard>

          {/* Account */}
          <SectionCard title="Account" icon={CubeIcon} accent="emerald">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Challenge type" value={order.challenge_type} />
              <Field label="Account size" value={order.account_size != null ? String(order.account_size) : undefined} />
              <Field label="Platform" value={order.platform} />
              <div>
                <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider block mb-1">Status</span>
                <StatusBadge status={status} variant={statusVariant} />
              </div>
              {order.is_active != null && (
                <div>
                  <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider block mb-1">Active</span>
                  <BoolBadge value={order.is_active} />
                </div>
              )}
              {order.completed != null && (
                <div>
                  <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider block mb-1">Completed</span>
                  <BoolBadge value={order.completed} />
                </div>
              )}
              {order.passed != null && (
                <div>
                  <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider block mb-1">Passed</span>
                  <BoolBadge value={order.passed} />
                </div>
              )}
              {order.failed != null && (
                <div>
                  <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider block mb-1">Failed</span>
                  <BoolBadge value={order.failed} />
                </div>
              )}
              {order.is_stage2 != null && (
                <div>
                  <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider block mb-1">Stage 2</span>
                  <BoolBadge value={order.is_stage2} />
                </div>
              )}
              {order.is_live != null && (
                <div>
                  <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider block mb-1">Live</span>
                  <BoolBadge value={order.is_live} />
                </div>
              )}
              <Field label="Profit target" value={order.profit_target != null ? `${order.profit_target}%` : undefined} />
            </div>
          </SectionCard>

          {/* Payment */}
          <SectionCard title="Payment" icon={CreditCardIcon} accent="amber">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Amount" value={order.amount != null ? `$${order.amount}` : undefined} />
              <Field label="Method" value={order.payment_method} />
              <div>
                <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider block mb-1">Payment status</span>
                <StatusBadge
                  status={(order.payment_status as string) ?? "—"}
                  variant={(order.payment_status as string) === "completed" ? "success" : (order.payment_status as string) === "pending" ? "warning" : "neutral"}
                />
              </div>
              <Field label="Oxapay status" value={order.oxapay_payment_status as string} />
              <Field label="TXID" value={order.txid as string} mono />
              {(order.checkout_session_url as string) && (
                <div className="sm:col-span-2">
                  <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider block mb-1">Checkout URL</span>
                  <a
                    href={order.checkout_session_url as string}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline break-all"
                  >
                    {String(order.checkout_session_url).slice(0, 70)}…
                  </a>
                </div>
              )}
            </div>
          </SectionCard>

          {/* Main credentials */}
          {(order.credential_id != null || order.server != null || order.platform_login != null) && (
            <SectionCard title="Main credentials" icon={KeyIcon}>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Credential ID" value={order.credential_id != null ? String(order.credential_id) : undefined} mono />
                <Field label="Server" value={order.server as string} mono />
                <Field label="Login" value={order.platform_login as string} mono />
                {order.has_account_credential != null && (
                  <div>
                    <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider block mb-1">Has credential</span>
                    <BoolBadge value={order.has_account_credential} />
                  </div>
                )}
              </div>
            </SectionCard>
          )}

          {/* Stage 2 */}
          {order.stage2_account && (
            <SectionCard title="Stage 2 account" icon={CubeIcon} accent="emerald">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Credential ID" value={order.stage2_account.credential_id != null ? String(order.stage2_account.credential_id) : undefined} mono />
                <Field label="Server" value={order.stage2_account.server} mono />
                <Field label="Login" value={order.stage2_account.platform_login} mono />
                <div>
                  <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider block mb-1">Status</span>
                  <StatusBadge status={order.stage2_account.status ?? "—"} variant="neutral" />
                </div>
                <Field label="Created" value={formatDate(order.stage2_account.created_at ?? undefined)} />
              </div>
            </SectionCard>
          )}

          {/* Live */}
          {order.live_account && (
            <SectionCard title="Live account" icon={CheckCircleIcon} accent="emerald">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Credential ID" value={order.live_account.credential_id != null ? String(order.live_account.credential_id) : undefined} mono />
                <Field label="Server" value={order.live_account.server} mono />
                <Field label="Login" value={order.live_account.platform_login} mono />
                <Field label="Profit share" value={order.live_account.profit_share != null ? `${order.live_account.profit_share}%` : undefined} />
                <div>
                  <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider block mb-1">Status</span>
                  <StatusBadge status={order.live_account.status ?? "—"} variant="success" />
                </div>
                <Field label="Created" value={formatDate(order.live_account.created_at ?? undefined)} />
              </div>
            </SectionCard>
          )}

          {/* Timeline */}
          {timeline.length > 0 && (
            <SectionCard title="Timeline" icon={ClockIcon}>
              <div className="relative pl-4 border-l-2 border-neutral-200 space-y-0">
                {timeline.map((e, i) => (
                  <div key={i} className="relative pb-5 last:pb-0">
                    <span className="absolute -left-4 top-0.5 h-3 w-3 rounded-full bg-neutral-300 border-2 border-white shadow-sm" />
                    <div className="pt-0">
                      <p className="text-sm font-semibold text-neutral-900 capitalize">
                        {e.event_type?.replace(/_/g, " ") ?? "—"}
                      </p>
                      <p className="text-xs text-neutral-500 mt-0.5">{formatDate(e.event_date)}</p>
                      {e.notes && <p className="text-sm text-neutral-600 mt-1">{e.notes}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}
        </div>

        <DialogFooter className="shrink-0 border-t border-neutral-200 bg-white px-6 py-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function EditCredentialDialog({
  order,
  blockLabel,
  blockData,
  open,
  onOpenChange,
  onSaved,
}: {
  order: OrderRow | null
  blockLabel: string
  blockData: CredentialBlock | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved?: () => void
}) {
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ server: "", platform_login: "", platform_password: "" })

  useEffect(() => {
    if (blockData) {
      setForm({
        server: (blockData.server as string) ?? "",
        platform_login: (blockData.platform_login as string) ?? "",
        platform_password: (blockData.platform_password as string) ?? "",
      })
    }
  }, [blockData])

  const handleSave = async () => {
    if (!order?.order_id) return
    setSaving(true)
    try {
      if (blockLabel === "Main account") {
        await adminApiRequest(`/orders/${order.order_id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        })
      } else if (blockData?.credential_id != null) {
        await adminApiRequest(`/credentials/${blockData.credential_id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        })
      }
      onSaved?.()
      onOpenChange(false)
    } catch {
      onOpenChange(false)
    } finally {
      setSaving(false)
    }
  }

  if (!order || !blockData) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit credential — {blockLabel}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label>Server</Label>
            <Input
              value={form.server}
              onChange={(e) => setForm((f) => ({ ...f, server: e.target.value }))}
              placeholder="Server"
            />
          </div>
          <div className="grid gap-2">
            <Label>Login</Label>
            <Input
              value={form.platform_login}
              onChange={(e) => setForm((f) => ({ ...f, platform_login: e.target.value }))}
              placeholder="Platform login"
            />
          </div>
          <div className="grid gap-2">
            <Label>Password</Label>
            <Input
              type="password"
              value={form.platform_password}
              onChange={(e) => setForm((f) => ({ ...f, platform_password: e.target.value }))}
              placeholder="Password"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function CredentialsDialog({
  order,
  open,
  onOpenChange,
  onSaved,
}: {
  order: OrderRow | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved?: () => void
}) {
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({})
  const [editingBlock, setEditingBlock] = useState<{ label: string; data: CredentialBlock } | null>(null)

  if (!order) return null

  const blocks: { label: string; data: CredentialBlock | null }[] = [
    {
      label: "Main account",
      data:
        order.credential_id != null || order.server != null || order.platform_login != null
          ? {
              credential_id: order.credential_id,
              server: order.server,
              platform_login: order.platform_login,
              platform_password: order.platform_password,
            }
          : null,
    },
    { label: "Stage 2", data: order.stage2_account ?? null },
    { label: "Live", data: order.live_account ?? null },
  ].filter((b) => b.data != null)

  const toggleShow = (key: string) =>
    setShowPasswords((prev) => ({ ...prev, [key]: !prev[key] }))

  /** Label above value (column layout), professional style */
  const Field = ({ label, value, mono = true }: { label: string; value: React.ReactNode; mono?: boolean }) => (
    <div className="space-y-1.5">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">{label}</p>
      <p className={`text-base font-bold text-slate-900 break-all ${mono ? "font-mono" : ""}`}>{value ?? "—"}</p>
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[min(96vw,900px)] w-full max-h-[92vh] overflow-hidden flex flex-col gap-0 p-0 rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <DialogHeader className="shrink-0 px-8 pt-8 pb-6 border-b border-slate-200">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white">
              <KeyIcon className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-xl font-bold text-slate-900 tracking-tight">
                Account credentials
              </DialogTitle>
              <p className="text-sm font-mono font-medium text-slate-600 mt-0.5">
                Order {order.order_id ?? "—"}
              </p>
            </div>
          </div>
        </DialogHeader>
        <div className="flex-1 min-h-0 overflow-y-auto px-8 py-8">
          {blocks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 rounded-xl border border-dashed border-slate-200 bg-slate-50/50">
              <KeyIcon className="h-14 w-14 text-slate-300 mb-4" />
              <p className="text-base font-semibold text-slate-700">No credentials available</p>
              <p className="text-sm text-slate-500 mt-2">Credentials will appear here when assigned to this order.</p>
            </div>
          ) : (
            <div className="space-y-10">
              {blocks.map(({ label, data }, idx) => {
                if (!data) return null
                const key = `${label}-${data.credential_id ?? ""}`
                const show = showPasswords[key]
                const statusVal = (data.status as string) ?? ""
                const createdFormatted = data.created_at
                  ? (() => {
                      try {
                        return new Date(data.created_at).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" })
                      } catch {
                        return data.created_at
                      }
                    })()
                  : null
                return (
                  <div
                    key={key}
                    className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-4 mb-6">
                      <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                        {label}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="shrink-0 gap-2 border-slate-300 text-slate-700 h-9"
                        onClick={() => setEditingBlock({ label, data })}
                      >
                        <PencilIcon className="h-4 w-4" />
                        Edit
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-8">
                      <Field label="Credential ID" value={data.credential_id != null ? String(data.credential_id) : null} />
                      <Field label="Server" value={data.server} />
                      <Field label="Login" value={data.platform_login} />
                      <Field label="Password" value={
                        data.platform_password != null ? (
                          <span className="flex items-center gap-2 flex-wrap">
                            <span>{show ? data.platform_password : "••••••••••••"}</span>
                            <button
                              type="button"
                              onClick={() => toggleShow(key)}
                              className="text-xs font-semibold text-slate-600 hover:text-slate-900 underline"
                            >
                              {show ? "Hide" : "Show"}
                            </button>
                          </span>
                        ) : null
                      } />
                      {createdFormatted && <Field label="Created" value={createdFormatted} mono={false} />}
                      {data.profit_share != null && <Field label="Profit share" value={`${data.profit_share}%`} />}
                      {statusVal && (
                        <div className="space-y-1.5">
                          <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">Status</p>
                          <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-bold text-slate-900 capitalize">
                            {statusVal}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
        {blocks.length > 0 && (
          <DialogFooter className="shrink-0 border-t border-slate-200 bg-slate-50/50 px-8 py-4 rounded-b-2xl">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="min-w-[120px] h-10 font-medium border-slate-300 text-slate-700">
              Close
            </Button>
          </DialogFooter>
        )}
        <EditCredentialDialog
          order={order}
          blockLabel={editingBlock?.label ?? ""}
          blockData={editingBlock?.data ?? null}
          open={!!editingBlock}
          onOpenChange={(open) => !open && setEditingBlock(null)}
          onSaved={onSaved}
        />
      </DialogContent>
    </Dialog>
  )
}

function EditOrderDialog({
  order,
  open,
  onOpenChange,
  onSaved,
}: {
  order: OrderRow | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved?: () => void
}) {
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    status: "",
    platform_login: "",
    platform_password: "",
    server: "",
  })

  useEffect(() => {
    if (order) {
      setForm({
        status: order.status ?? "",
        platform_login: (order.platform_login as string) ?? "",
        platform_password: (order.platform_password as string) ?? "",
        server: (order.server as string) ?? "",
      })
    }
  }, [order])

  const handleSave = async () => {
    if (!order?.order_id) return
    setSaving(true)
    try {
      await adminApiRequest(`/orders/${order.order_id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      onSaved?.()
      onOpenChange(false)
    } catch {
      // If backend doesn't support PATCH, just close (you can add toast later)
      onOpenChange(false)
    } finally {
      setSaving(false)
    }
  }

  if (!order) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit order — {order.order_id ?? "—"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label>Status</Label>
            <Input
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
              placeholder="e.g. Live, Pending"
            />
          </div>
          <div className="grid gap-2">
            <Label>Server</Label>
            <Input
              value={form.server}
              onChange={(e) => setForm((f) => ({ ...f, server: e.target.value }))}
              placeholder="MT4/MT5 server"
            />
          </div>
          <div className="grid gap-2">
            <Label>Platform login</Label>
            <Input
              value={form.platform_login}
              onChange={(e) =>
                setForm((f) => ({ ...f, platform_login: e.target.value }))
              }
              placeholder="Login"
            />
          </div>
          <div className="grid gap-2">
            <Label>Platform password</Label>
            <Input
              type="password"
              value={form.platform_password}
              onChange={(e) =>
                setForm((f) => ({ ...f, platform_password: e.target.value }))
              }
              placeholder="Password"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [credentialsOrder, setCredentialsOrder] = useState<OrderRow | null>(null)
  const [editOrder, setEditOrder] = useState<OrderRow | null>(null)
  const [viewOrder, setViewOrder] = useState<OrderRow | null>(null)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<
    "all" | "pending" | "passed" | "live" | "stage2" | "stage1" | "alpha" | "beta" | "sigma" | "card" | "crypto" | "active"
  >("all")

  const fetchOrders = () => {
    setLoading(true)
    setError(null)
    adminApiRequest<OrderRow[] | { orders?: OrderRow[] }>("/orders/list/all")
      .then((data) => {
        const list =
          Array.isArray(data) ? data : (data as { orders?: OrderRow[] }).orders ?? []
        setOrders(list)
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load orders")
        setOrders([])
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const accountSizeDisplay = (o: OrderRow) => {
    const v = o.account_size
    if (v == null) return "—"
    if (typeof v === "number") return `$${v.toLocaleString()}`
    if (String(v).startsWith("$")) return v
    return `$${Number(v).toLocaleString() || v}`
  }

  const filteredOrders = orders.filter((o) => {
    const term = search.trim().toLowerCase()
    const matchesSearch =
      !term ||
      [o.order_id, o.username, o.email, o.status, o.challenge_type, o.payment_method]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(term))

    if (!matchesSearch) return false
    if (filter === "all") return true

    const s = (o.status as string | undefined)?.toLowerCase() ?? ""
    const normalizedStatus = s.replace(/\s+/g, "")
    const challenge = (o.challenge_type as string | undefined)?.toLowerCase() ?? ""
    const payment = (o.payment_method as string | undefined)?.toLowerCase() ?? ""
    const isActive = !["failed", "cancelled", "refunded"].some((x) => s.includes(x))

    if (filter === "pending") return s === "pending"
    if (filter === "passed") return s === "passed"
    if (filter === "live") return s === "live"
    if (filter === "stage2") return normalizedStatus === "stage2"
    if (filter === "stage1") return normalizedStatus === "stage1"
    if (filter === "alpha") return challenge.includes("alpha")
    if (filter === "beta") return challenge.includes("beta")
    if (filter === "sigma") return challenge.includes("sigma")
    if (filter === "card") return payment.includes("card") || payment.includes("stripe") || payment.includes("paypal")
    if (filter === "crypto") return payment.includes("crypto") || payment.includes("btc") || payment.includes("usdt") || payment.includes("coin")
    if (filter === "active") return isActive

    return true
  })

  const total = orders.length
  const liveCount = orders.filter((o) => (o.status as string | undefined)?.toLowerCase() === "live").length
  const pendingCount = orders.filter((o) => (o.status as string | undefined)?.toLowerCase() === "pending").length
  const failedCount = orders.filter((o) => (o.status as string | undefined)?.toLowerCase() === "failed").length

  const showingCount = filteredOrders.length
  const displayOrders = filteredOrders.slice(0, 100)

  return (
    <div className="min-w-0 space-y-8">
      {/* Page header */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight sm:text-3xl">
            Orders
          </h1>
          <p className="mt-1.5 max-w-xl text-sm text-neutral-500">
            Manage challenge orders, credentials, and account lifecycle. Search, filter, and take action from one place.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="shrink-0 gap-2 border-neutral-200"
          onClick={() => fetchOrders()}
          disabled={loading}
        >
          <ArrowPathIcon className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-100">
              <ChartBarIcon className="h-5 w-5 text-neutral-600" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">Total orders</p>
              <p className="text-xl font-bold tabular-nums text-neutral-900">{total}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-emerald-200/60 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
              <CheckCircleIcon className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600/80">Live</p>
              <p className="text-xl font-bold tabular-nums text-emerald-700">{liveCount}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-amber-200/60 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
              <ClockIcon className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-600/80">Pending</p>
              <p className="text-xl font-bold tabular-nums text-amber-700">{pendingCount}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-red-200/60 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-500/10">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-red-600/80">Failed</p>
              <p className="text-xl font-bold tabular-nums text-red-700">{failedCount}</p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/80 px-4 py-3 shadow-sm">
          <ExclamationTriangleIcon className="h-5 w-5 shrink-0 text-amber-600" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-amber-800">Could not load orders</p>
            <p className="mt-0.5 text-sm text-amber-700">{error}</p>
          </div>
          <button
            type="button"
            onClick={() => setError(null)}
            className="shrink-0 rounded-md p-1 text-amber-600 hover:bg-amber-100 hover:text-amber-800"
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      )}

      <div className="rounded-2xl border border-neutral-200 bg-white shadow-md overflow-hidden">
        {/* Filters toolbar — single selection: only one can be selected */}
        <div className="flex flex-wrap items-center gap-2 border-b border-neutral-200 bg-neutral-50/90 px-4 py-3">
          {(
            [
              { key: "all", label: "All orders" },
              { key: "pending", label: "Pending" },
              { key: "passed", label: "Passed" },
              { key: "live", label: "Live" },
              { key: "stage2", label: "Stage 2" },
              { key: "stage1", label: "Stage 1" },
              { key: "alpha", label: "Alpha" },
              { key: "beta", label: "Beta" },
              { key: "sigma", label: "Sigma" },
              { key: "card", label: "Card payment" },
              { key: "crypto", label: "Crypto payment" },
              { key: "active", label: "Active" },
            ] as const
          ).map(({ key, label }) => (
            <FilterChip
              key={key}
              active={filter === key}
              onClick={() => setFilter(key)}
              variant={key === "all" ? "neutral" : key === "live" || key === "passed" || key === "active" ? "success" : key === "pending" ? "warning" : "neutral"}
            >
              {label}
            </FilterChip>
          ))}
          <div className="ml-auto flex shrink-0">
            <div className="relative w-48 sm:w-56">
              <MagnifyingGlassIcon className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search…"
                className="h-8 w-full rounded-lg border-neutral-200 bg-white pl-8 text-sm"
              />
            </div>
          </div>
        </div>

        {!loading && (
          <div className="border-b border-neutral-100 bg-white px-4 py-2">
            <p className="text-xs text-neutral-500">
              Showing <span className="font-semibold text-neutral-700">{Math.min(showingCount, 100)}</span>
              {showingCount > 100 ? ` of ${showingCount} ` : " "}
              order{showingCount !== 1 ? "s" : ""}
            </p>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-neutral-200 border-t-neutral-700" />
            <p className="mt-3 text-sm font-medium text-neutral-500">Loading orders…</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="sticky top-0 z-10 bg-neutral-50">
                <tr>
                  <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-widest text-neutral-500">
                    Order
                  </th>
                  <th className="px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-widest text-neutral-500">
                    Account
                  </th>
                  <th className="px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-widest text-neutral-500">
                    Size
                  </th>
                  <th className="px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-widest text-neutral-500">
                    Status
                  </th>
                  <th className="px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-widest text-neutral-500">
                    Payment
                  </th>
                  <th className="px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-widest text-neutral-500">
                    Created
                  </th>
                  <th className="px-5 py-3.5 text-right text-[11px] font-semibold uppercase tracking-widest text-neutral-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {displayOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-20 text-center">
                      <div className="flex flex-col items-center gap-4 text-neutral-500">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-100">
                          <ClipboardDocumentListIcon className="h-7 w-7 text-neutral-400" />
                        </div>
                        <div>
                          <p className="font-medium text-neutral-700">No orders match your filters</p>
                          <p className="mt-1 text-sm text-neutral-400">
                            {total > 0
                              ? "Try a different status or clear the search to see all orders."
                              : "Orders will appear here once they are created."}
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  displayOrders.map((o, idx) => {
                    const rowStatus = (o.status as string) ?? "—"
                    const rowStatusLower = rowStatus.toLowerCase()
                    const rowVariant =
                      rowStatusLower === "live" || rowStatusLower === "passed"
                        ? "success"
                        : rowStatusLower === "pending" || rowStatusLower === "stage 2"
                        ? "warning"
                        : rowStatusLower === "failed"
                        ? "error"
                        : "neutral"

                    return (
                      <tr
                        key={o.order_id ?? o.id ?? String(o)}
                        className={`border-t border-neutral-100 transition-colors ${
                          idx % 2 === 0 ? "bg-white" : "bg-neutral-50/30"
                        } hover:bg-neutral-50`}
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex flex-col gap-0.5">
                            <span className="font-mono text-[13px] font-semibold text-neutral-900">
                              {o.order_id ?? "—"}
                            </span>
                            <span className="text-xs text-neutral-500 truncate max-w-[180px]">
                              {o.username ?? o.email ?? "—"}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-neutral-700">
                          {o.challenge_type ?? "—"}
                        </td>
                        <td className="px-4 py-3.5 font-medium text-neutral-700 tabular-nums">
                          {accountSizeDisplay(o)}
                        </td>
                        <td className="px-4 py-3.5">
                          <StatusBadge status={rowStatus} variant={rowVariant as "success" | "warning" | "error" | "neutral"} />
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-neutral-700">{o.payment_method ?? "—"}</span>
                            {o.payment_status && (
                              <span className="text-[11px] uppercase tracking-wide text-neutral-400">
                                {o.payment_status}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-neutral-500 whitespace-nowrap">
                          {formatDate(getOrderCreated(o))}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => setViewOrder(o)}
                              title="View details"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => setCredentialsOrder(o)}
                              title="Credentials"
                            >
                              <KeyIcon className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => setEditOrder(o)}
                              title="Edit"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ViewOrderDialog
        order={viewOrder}
        open={!!viewOrder}
        onOpenChange={(open) => !open && setViewOrder(null)}
      />
      <CredentialsDialog
        order={credentialsOrder}
        open={!!credentialsOrder}
        onOpenChange={(open) => !open && setCredentialsOrder(null)}
        onSaved={fetchOrders}
      />
      <EditOrderDialog
        order={editOrder}
        open={!!editOrder}
        onOpenChange={(open) => !open && setEditOrder(null)}
        onSaved={fetchOrders}
      />
    </div>
  )
}
