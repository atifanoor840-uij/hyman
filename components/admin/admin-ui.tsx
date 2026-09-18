"use client"

import { useCallback, useRef, useState, type ReactNode } from "react"
import { AlertTriangle, CheckCircle2, Loader2, Search, ShieldAlert, X, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

/* -------------------------------------------------------------------------- */
/* Layout                                                                     */
/* -------------------------------------------------------------------------- */

export function Panel({
  title,
  description,
  actions,
  children,
  className,
  bodyClassName,
}: {
  title?: ReactNode
  description?: ReactNode
  actions?: ReactNode
  children: ReactNode
  className?: string
  bodyClassName?: string
}) {
  return (
    <section className={cn("overflow-hidden rounded-2xl border border-border bg-card shadow-[0_1px_2px_rgba(16,24,40,0.04)]", className)}>
      {(title || actions) && (
        <div className="flex flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            {title && <h2 className="text-base font-semibold tracking-tight text-foreground">{title}</h2>}
            {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
          </div>
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className={bodyClassName}>{children}</div>
    </section>
  )
}

/** Row of small summary numbers shown above a list. */
export function StatRow({ items }: { items: { label: string; value: ReactNode; tone?: Tone; hint?: string }[] }) {
  return (
    <div className={cn("grid gap-3", items.length >= 5 ? "grid-cols-2 lg:grid-cols-5" : items.length >= 4 ? "grid-cols-2 lg:grid-cols-4" : "grid-cols-1 sm:grid-cols-3")}>
      {items.map((s) => (
        <div key={s.label} className="rounded-2xl border border-border bg-card px-4 py-3.5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
          <p className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            {s.tone && <span className={cn("h-2 w-2 rounded-full", TONE[s.tone].dot)} />}
            {s.label}
          </p>
          <p className="mt-1 text-2xl font-semibold tracking-tight tabular-nums text-foreground">{s.value}</p>
          {s.hint && <p className="mt-0.5 text-xs text-muted-foreground">{s.hint}</p>}
        </div>
      ))}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Toolbar: filter tabs + search                                              */
/* -------------------------------------------------------------------------- */

export type FilterOption<T extends string> = { value: T; label: string; count?: number }

export function FilterTabs<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T
  onChange: (v: T) => void
  options: FilterOption<T>[]
}) {
  return (
    <div className="flex max-w-full gap-1 overflow-x-auto rounded-xl bg-muted p-1" role="tablist">
      {options.map((o) => {
        const active = o.value === value
        return (
          <button
            key={o.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.value)}
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              active ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {o.label}
            {o.count != null && (
              <span
                className={cn(
                  "min-w-5 rounded-full px-1.5 text-center text-[11px] font-semibold tabular-nums",
                  active ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground",
                )}
              >
                {o.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

export function SearchBox({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string
  onChange: (v: string) => void
  placeholder: string
  className?: string
}) {
  return (
    <div className={cn("relative w-full sm:w-72", className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-10 rounded-xl border-border bg-card pl-9 pr-9 shadow-none"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Clear search"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
}

export function Toolbar({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-3 border-b border-border px-4 py-3 sm:px-5 lg:flex-row lg:items-center lg:justify-between">{children}</div>
}

/* -------------------------------------------------------------------------- */
/* Status                                                                     */
/* -------------------------------------------------------------------------- */

export type Tone = "neutral" | "success" | "warning" | "danger" | "info" | "brand"

const TONE: Record<Tone, { pill: string; dot: string }> = {
  neutral: { pill: "bg-slate-100 text-slate-600 ring-slate-200", dot: "bg-slate-400" },
  success: { pill: "bg-emerald-50 text-emerald-700 ring-emerald-200", dot: "bg-emerald-500" },
  warning: { pill: "bg-amber-50 text-amber-700 ring-amber-200", dot: "bg-amber-500" },
  danger: { pill: "bg-red-50 text-red-700 ring-red-200", dot: "bg-red-500" },
  info: { pill: "bg-sky-50 text-sky-700 ring-sky-200", dot: "bg-sky-500" },
  brand: { pill: "bg-[#efecff] text-[#3b24d9] ring-[#d9d3ff]", dot: "bg-[#5235ff]" },
}

/** Known statuses across admin sections, mapped to a readable label and color. */
const STATUS: Record<string, { label: string; tone: Tone }> = {
  pending_payment: { label: "Awaiting payment", tone: "warning" },
  pending: { label: "Pending", tone: "warning" },
  requested: { label: "Requested", tone: "warning" },
  processing: { label: "Processing", tone: "info" },
  active: { label: "Active", tone: "success" },
  available: { label: "Available", tone: "success" },
  approved: { label: "Approved", tone: "info" },
  confirmed: { label: "Confirmed", tone: "info" },
  delivered: { label: "Delivered", tone: "brand" },
  assigned: { label: "Assigned", tone: "neutral" },
  passed: { label: "Passed", tone: "success" },
  funded: { label: "Funded", tone: "brand" },
  paid: { label: "Paid", tone: "success" },
  failed: { label: "Failed", tone: "danger" },
  breached: { label: "Breached", tone: "danger" },
  rejected: { label: "Rejected", tone: "danger" },
  suspended: { label: "Suspended", tone: "danger" },
  disabled: { label: "Disabled", tone: "neutral" },
  inactive: { label: "Inactive", tone: "neutral" },
  expired: { label: "Expired", tone: "neutral" },
}

export function statusLabel(status: string) {
  return STATUS[status]?.label ?? status.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase())
}

export function StatusPill({ status, label, tone }: { status?: string; label?: string; tone?: Tone }) {
  const meta = status ? STATUS[status] : undefined
  const t = TONE[tone ?? meta?.tone ?? "neutral"]
  return (
    <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset", t.pill)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", t.dot)} />
      {label ?? (status ? statusLabel(status) : "—")}
    </span>
  )
}

/* -------------------------------------------------------------------------- */
/* Table                                                                      */
/* -------------------------------------------------------------------------- */

export function DataTable({ head, children }: { head: ReactNode[]; children: ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            {head.map((h, i) => (
              <th
                key={i}
                className={cn(
                  "h-10 whitespace-nowrap px-4 text-left text-xs font-medium text-muted-foreground first:pl-5 last:pr-5",
                  i === head.length - 1 && "text-right",
                )}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border [&_td]:px-4 [&_td]:py-3.5 [&_td:first-child]:pl-5 [&_td:last-child]:pr-5 [&_td:last-child]:text-right [&_tr]:transition-colors [&_tr:hover]:bg-muted/40">
          {children}
        </tbody>
      </table>
    </div>
  )
}

export function Person({ name, email, sub }: { name?: string | null; email?: string | null; sub?: ReactNode }) {
  const label = name || email || "Unknown"
  const initials = label
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("")
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">
        {initials || "?"}
      </span>
      <div className="min-w-0">
        <p className="truncate font-medium text-foreground">{label}</p>
        {(sub ?? email) && <p className="truncate text-xs text-muted-foreground">{sub ?? email}</p>}
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* States                                                                     */
/* -------------------------------------------------------------------------- */

export function LoadingBlock({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-20 text-sm text-muted-foreground">
      <Loader2 className="h-5 w-5 animate-spin" />
      {label}
    </div>
  )
}

export function EmptyBlock({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
        <Icon className="h-6 w-6" />
      </span>
      <p className="mt-4 text-base font-semibold text-foreground">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function ErrorBlock({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <EmptyBlock
      icon={ShieldAlert}
      title="Couldn’t load this data"
      description={message}
      action={
        onRetry && (
          <Button variant="outline" className="rounded-xl" onClick={onRetry}>
            Try again
          </Button>
        )
      }
    />
  )
}

export function Notice({ tone, children, onDismiss }: { tone: "success" | "error"; children: ReactNode; onDismiss?: () => void }) {
  const Icon = tone === "success" ? CheckCircle2 : AlertTriangle
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "flex items-start gap-3 rounded-xl border px-4 py-3 text-sm",
        tone === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-800",
      )}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="min-w-0 flex-1">{children}</div>
      {onDismiss && (
        <button type="button" onClick={onDismiss} className="shrink-0 rounded-md p-0.5 opacity-70 hover:opacity-100" aria-label="Dismiss">
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Forms                                                                      */
/* -------------------------------------------------------------------------- */

export function Field({
  label,
  hint,
  children,
  className,
  htmlFor,
}: {
  label: string
  hint?: string
  children: ReactNode
  className?: string
  htmlFor?: string
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={htmlFor} className="text-sm font-medium text-foreground">
        {label}
      </Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

export const inputClass = "h-10 rounded-xl border-input bg-card shadow-none focus-visible:ring-4 focus-visible:ring-primary/10 focus-visible:ring-offset-0"

export function NativeSelect({
  value,
  onChange,
  children,
  className,
  id,
}: {
  value: string
  onChange: (v: string) => void
  children: ReactNode
  className?: string
  id?: string
}) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        "flex h-10 w-full rounded-xl border border-input bg-card px-3 text-sm outline-none focus:ring-4 focus:ring-primary/10",
        className,
      )}
    >
      {children}
    </select>
  )
}

export function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="space-y-3">
      <legend className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">{title}</legend>
      {children}
    </fieldset>
  )
}

/* -------------------------------------------------------------------------- */
/* Confirmation dialog (replaces window.confirm)                              */
/* -------------------------------------------------------------------------- */

type ConfirmOptions = {
  title: string
  description?: ReactNode
  confirmLabel?: string
  tone?: "default" | "danger"
  /** When set, shows a text box and resolves with its value. */
  reasonLabel?: string
  reasonPlaceholder?: string
}

export function useConfirm() {
  const [opts, setOpts] = useState<ConfirmOptions | null>(null)
  const [reason, setReason] = useState("")
  const resolver = useRef<((v: { ok: boolean; reason: string }) => void) | null>(null)

  const confirm = useCallback((o: ConfirmOptions) => {
    setReason("")
    setOpts(o)
    return new Promise<{ ok: boolean; reason: string }>((resolve) => {
      resolver.current = resolve
    })
  }, [])

  const close = (ok: boolean) => {
    resolver.current?.({ ok, reason: reason.trim() })
    resolver.current = null
    setOpts(null)
  }

  const dialog = (
    <AlertDialog open={!!opts} onOpenChange={(open) => !open && close(false)}>
      <AlertDialogContent className="rounded-2xl sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>{opts?.title}</AlertDialogTitle>
          {opts?.description && <AlertDialogDescription>{opts.description}</AlertDialogDescription>}
        </AlertDialogHeader>
        {opts?.reasonLabel && (
          <Field label={opts.reasonLabel}>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={opts.reasonPlaceholder}
              className="min-h-[88px] rounded-xl border-input shadow-none"
            />
          </Field>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => close(true)}
            className={cn("rounded-xl", opts?.tone === "danger" && "bg-destructive text-destructive-foreground hover:bg-destructive/90")}
          >
            {opts?.confirmLabel ?? "Confirm"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )

  return { confirm, dialog }
}

/* -------------------------------------------------------------------------- */
/* Formatting                                                                 */
/* -------------------------------------------------------------------------- */

export const money = (n: number | null | undefined, digits = 2) =>
  n == null || !Number.isFinite(n) ? "—" : `$${n.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits })}`

export function shortDate(iso: string | null | undefined, withTime = false) {
  if (!iso) return "—"
  const d = new Date(iso)
  if (!Number.isFinite(d.getTime())) return "—"
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...(withTime ? { hour: "numeric", minute: "2-digit" } : {}),
  })
}

export function countBy<T>(rows: T[], pick: (row: T) => string) {
  const map: Record<string, number> = {}
  for (const r of rows) {
    const k = pick(r)
    map[k] = (map[k] ?? 0) + 1
  }
  return map
}
