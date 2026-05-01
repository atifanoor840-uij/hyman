"use client"

import { useEffect, useMemo, useState } from "react"
import { AdminShell } from "@/components/admin/admin-shell"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import EmptyState from "@/components/ui/empty-state"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { listMembers, type AdminMember } from "@/lib/api/admin-users"
import { ApiClientError } from "@/lib/api/client"
import { CheckCircle2, Eye, EyeOff, Loader2, Pencil, RefreshCcw, ShieldAlert, Users } from "lucide-react"

function parseBackendDate(input: string | number | Date) {
  if (input instanceof Date) return input
  if (typeof input === "number") return new Date(input)
  const raw = String(input).trim()
  // If backend sends a "naive" datetime (no timezone), assume it's UTC.
  const hasTimezone = /([zZ]|[+-]\d{2}:?\d{2})$/.test(raw)
  if (!hasTimezone) {
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

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showSensitive, setShowSensitive] = useState(false)
  const [viewUser, setViewUser] = useState<AdminMember | null>(null)
  const [editUser, setEditUser] = useState<AdminMember | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await listMembers()
      setUsers(Array.isArray(data) ? data : [])
      setError(null)
    } catch (e) {
      if (e instanceof ApiClientError) {
        setError(e.status === 401 ? "Session expired. Please sign in again." : e.message || "Failed to load users.")
      } else {
        setError("Failed to load users.")
      }
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const sorted = useMemo(() => {
    return users
      .slice()
      .sort((a, b) => String(a.created_at ?? "") < String(b.created_at ?? "") ? 1 : -1)
  }, [users])

  const summary = useMemo(() => {
    const total = users.length
    const verified = users.filter((u) => Boolean(u.is_verified)).length
    const unverified = total - verified
    const withOrders = users.filter((u) => Number(u.total_orders ?? 0) > 0).length
    return { total, verified, unverified, withOrders }
  }, [users])

  return (
    <AdminShell
      title="Users"
      description="Search, review, and manage user accounts."
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
                <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Users snapshot</p>
                <h2 className="mt-1 text-xl sm:text-2xl font-bold tracking-tight text-foreground">User overview</h2>
                <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                  Quick view of verification and activity (orders).
                </p>
              </div>
              <Badge variant="outline" className="rounded-full border-border/70 bg-background/40 px-3 py-1 text-xs">
                {loading ? "Loading…" : `${summary.total} total`}
              </Badge>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <StatChip label="Verified" value={summary.verified} tone="success" />
              <StatChip label="Unverified" value={summary.unverified} tone="muted" />
              <StatChip label="With orders" value={summary.withOrders} tone="primary" />
              <StatChip label="All" value={summary.total} tone="muted" />
            </div>
          </div>
        </div>
      </Card>

      <Card className="rounded-2xl border border-border/80 bg-card shadow-sm overflow-hidden">
        <div className="border-b border-border/80 bg-muted/20 px-4 sm:px-6 py-3.5 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-foreground tracking-tight">User directory</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {loading ? "Loading users..." : `${sorted.length} users`}
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
                  <div className="font-semibold">Couldn’t load users</div>
                  <div className="text-muted-foreground text-xs mt-0.5">{error}</div>
                </div>
              </div>
            </div>
          ) : null}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Status</TableHead>
                {showSensitive ? <TableHead>Admin pass</TableHead> : null}
                <TableHead className="text-right">Joined</TableHead>
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
                      title="No users found"
                      description="Try refreshing or confirm the admin token has access to members."
                      icon={
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border/70 bg-muted/40">
                          <Users className="h-6 w-6 text-muted-foreground" />
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
                sorted.map((u) => (
                  <TableRow key={u.id ?? u.email ?? u.username}>
                    <TableCell className="font-semibold">
                      <div className="text-foreground font-semibold">{u.name || u.username || "—"}</div>
                      <div className="text-[11px] text-muted-foreground mt-1 truncate">{u.username}</div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      <div className="text-foreground font-semibold">{u.email}</div>
                      <div className="text-[11px] text-muted-foreground mt-1 truncate">{u.phone_no || "—"}</div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{u.country || "—"}</TableCell>
                    <TableCell className="font-semibold tabular-nums">{Number(u.total_orders ?? 0)}</TableCell>
                    <TableCell className="font-semibold tabular-nums">{Number(u.points_balance ?? 0)}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                          u.is_verified
                            ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/20"
                            : "bg-muted/40 text-muted-foreground border-border/60"
                        }`}
                      >
                        {u.is_verified ? <CheckCircle2 className="h-3.5 w-3.5" /> : null}
                        {u.is_verified ? "Verified" : "Unverified"}
                      </span>
                    </TableCell>
                    {showSensitive ? (
                      <TableCell>
                        <code className="text-xs font-mono text-muted-foreground">
                          {u.admin_access_password_plain ? String(u.admin_access_password_plain) : "—"}
                        </code>
                      </TableCell>
                    ) : null}
                    <TableCell className="text-right text-muted-foreground text-xs">
                      {formatDatePakistan(u.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <Button
                          type="button"
                          size="sm"
                          className="h-9 rounded-xl border border-purple-400/30 bg-gradient-to-r from-purple-800 via-purple-950 to-purple-800 px-3 text-xs font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] hover:from-purple-700 hover:via-purple-900 hover:to-purple-700"
                          onClick={() => setViewUser(u)}
                        >
                          <Eye className="h-4 w-4 mr-1.5" />
                          View
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          className="h-9 rounded-xl border border-purple-400/30 bg-gradient-to-r from-purple-800 via-purple-950 to-purple-800 px-3 text-xs font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] hover:from-purple-700 hover:via-purple-900 hover:to-purple-700"
                          onClick={() => setEditUser(u)}
                        >
                          <Pencil className="h-4 w-4 mr-1.5" />
                          Edit
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* View modal */}
      <Dialog open={viewUser != null} onOpenChange={(o) => { if (!o) setViewUser(null) }}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>User details</DialogTitle>
          </DialogHeader>
          {viewUser ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <InfoRow label="Name" value={String(viewUser.name || viewUser.username || "—")} />
                <InfoRow label="Username" value={String(viewUser.username || "—")} />
                <InfoRow label="Email" value={String(viewUser.email || "—")} />
                <InfoRow label="Country" value={String(viewUser.country || "—")} />
                <InfoRow label="Phone" value={String(viewUser.phone_no || "—")} />
                <InfoRow label="Orders" value={String(Number(viewUser.total_orders ?? 0))} mono />
                <InfoRow label="Balance" value={String(Number(viewUser.points_balance ?? 0))} mono />
                <InfoRow label="Status" value={viewUser.is_verified ? "Verified" : "Unverified"} />
              </div>
              {showSensitive ? (
                <div className="rounded-2xl border border-border/70 bg-muted/20 px-4 py-3">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Admin pass</p>
                  <p className="mt-1 font-mono text-sm text-foreground break-all">
                    {viewUser.admin_access_password_plain ? String(viewUser.admin_access_password_plain) : "—"}
                  </p>
                </div>
              ) : null}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Edit modal (UI-only for now) */}
      <Dialog open={editUser != null} onOpenChange={(o) => { if (!o) setEditUser(null) }}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit user</DialogTitle>
          </DialogHeader>
          {editUser ? (
            <div className="rounded-2xl border border-border/70 bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
              Editing users is not wired to an admin update endpoint yet. If you share the backend route for updating users, I’ll connect this modal to it.
            </div>
          ) : null}
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

function StatChip({
  label,
  value,
  tone,
}: {
  label: string
  value: number
  tone: "success" | "primary" | "muted"
}) {
  const classes =
    tone === "success"
      ? "bg-emerald-500/10 border-emerald-500/20"
      : tone === "primary"
        ? "bg-primary/10 border-primary/20"
        : "bg-muted/40 border-border/60"
  return (
    <div className={`rounded-2xl border p-3 ${classes}`}>
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/80">{label}</p>
      <p className="mt-1 text-lg font-bold tabular-nums text-foreground">{value}</p>
    </div>
  )
}

