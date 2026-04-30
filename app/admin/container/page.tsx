"use client"

import { useEffect, useMemo, useState } from "react"
import { AdminShell } from "@/components/admin/admin-shell"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import EmptyState from "@/components/ui/empty-state"
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
import {
  createAccountCredential,
  listAccountCredentials,
  updateAccountCredential,
  type AccountCredential,
  type UpsertAccountCredential,
} from "@/lib/api/admin-container"
import { ApiClientError } from "@/lib/api/client"
import { formatDateKarachi } from "@/lib/utils"
import { ExternalLink, Eye, Loader2, Plus, Pencil, RefreshCcw, ServerCrash, ShieldAlert } from "lucide-react"

function statusTone(status: string | null | undefined) {
  const s = String(status ?? "").toLowerCase()
  if (s.includes("available")) return "bg-emerald-500/15 text-emerald-600 border-emerald-500/20"
  if (s.includes("assigned")) return "bg-primary/15 text-primary border-primary/20"
  if (s.includes("not_available") || s.includes("unavailable")) return "bg-muted/40 text-muted-foreground border-border/60"
  return "bg-muted/40 text-muted-foreground border-border/60"
}

export default function AdminContainerPage() {
  const [rows, setRows] = useState<AccountCredential[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedSize, setSelectedSize] = useState<string>("all")

  const [createOpen, setCreateOpen] = useState(false)
  const [viewRow, setViewRow] = useState<AccountCredential | null>(null)
  const [editRow, setEditRow] = useState<AccountCredential | null>(null)
  const [saving, setSaving] = useState(false)
  const [mutateError, setMutateError] = useState<string | null>(null)

  const [createForm, setCreateForm] = useState<UpsertAccountCredential>({
    platform: "mt5",
    platform_login: "",
    platform_password: "",
    server: "",
    account_size: "",
    status: "available",
  })
  const [editForm, setEditForm] = useState<Partial<UpsertAccountCredential>>({})

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await listAccountCredentials()
      setRows(Array.isArray(data) ? data : [])
      setError(null)
    } catch (e) {
      if (e instanceof ApiClientError) {
        setError(e.message || "Failed to load credentials.")
      } else {
        setError("Failed to load credentials.")
      }
      setRows([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const sorted = useMemo(() => {
    return rows
      .slice()
      .sort((a, b) => String(a.updated_at ?? a.created_at ?? "") < String(b.updated_at ?? b.created_at ?? "") ? 1 : -1)
  }, [rows])

  const sizeOptions = useMemo(() => {
    const uniq = new Set<string>()
    for (const r of rows) {
      const s = String(r.account_size ?? "").trim()
      if (s) uniq.add(s)
    }
    return Array.from(uniq).sort((a, b) => {
      const na = Number(String(a).replace(/[^\d.]/g, ""))
      const nb = Number(String(b).replace(/[^\d.]/g, ""))
      if (Number.isFinite(na) && Number.isFinite(nb) && na !== nb) return na - nb
      return String(a).localeCompare(String(b))
    })
  }, [rows])

  const filtered = useMemo(() => {
    if (selectedSize === "all") return sorted
    return sorted.filter((r) => String(r.account_size ?? "") === selectedSize)
  }, [sorted, selectedSize])

  const stats = useMemo(() => {
    const total = rows.length
    const available = rows.filter((r) => String(r.status ?? "").toLowerCase().includes("available")).length
    const unavailable = rows.filter((r) => {
      const s = String(r.status ?? "").toLowerCase()
      return s.includes("not_available") || s.includes("unavailable")
    }).length
    const assigned = rows.filter((r) => Boolean(r.is_assigned)).length
    return { total, available, unavailable, assigned }
  }, [rows])

  const createSubmit = async () => {
    setMutateError(null)
    if (!String(createForm.platform_login).trim()) return setMutateError("Platform login is required.")
    if (!String(createForm.platform_password).trim()) return setMutateError("Platform password is required.")
    if (!String(createForm.server).trim()) return setMutateError("Server is required.")
    if (!String(createForm.account_size).trim()) return setMutateError("Account size is required.")

    setSaving(true)
    try {
      await createAccountCredential({
        ...createForm,
        platform: (createForm.platform || "mt5").trim(),
        platform_login: String(createForm.platform_login).trim(),
        platform_password: String(createForm.platform_password).trim(),
        server: String(createForm.server).trim(),
        account_size: String(createForm.account_size).trim(),
      })
      setCreateOpen(false)
      setCreateForm({
        platform: "mt5",
        platform_login: "",
        platform_password: "",
        server: "",
        account_size: "",
        status: "available",
      })
      await load()
    } catch (e) {
      setMutateError(e instanceof ApiClientError ? e.message : "Failed to create account.")
    } finally {
      setSaving(false)
    }
  }

  const startEdit = (row: AccountCredential) => {
    setMutateError(null)
    setEditRow(row)
    setEditForm({
      platform: row.platform,
      platform_login: row.platform_login,
      platform_password: row.platform_password,
      server: row.server,
      account_size: row.account_size,
      status: row.status ?? undefined,
      graph_link: row.graph_link ?? undefined,
    })
  }

  const editSubmit = async () => {
    if (!editRow) return
    setSaving(true)
    setMutateError(null)
    try {
      await updateAccountCredential(editRow.id, {
        ...editForm,
        platform: editForm.platform?.trim(),
        platform_login: editForm.platform_login ? String(editForm.platform_login).trim() : undefined,
        platform_password: editForm.platform_password ? String(editForm.platform_password).trim() : undefined,
        server: editForm.server ? String(editForm.server).trim() : undefined,
        account_size: editForm.account_size ? String(editForm.account_size).trim() : undefined,
      })
      setEditRow(null)
      setEditForm({})
      await load()
    } catch (e) {
      setMutateError(e instanceof ApiClientError ? e.message : "Failed to update account.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminShell
      title="Container"
      description="Account credentials inventory (no auth required by this endpoint)."
      actions={
        <div className="flex items-center gap-2">
          <Button
            className="h-9 rounded-full bg-purple-600 hover:bg-purple-700 text-white"
            onClick={() => {
              setMutateError(null)
              setCreateForm((p) => ({ ...p, platform: "mt5" }))
              setCreateOpen(true)
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add account
          </Button>
          <Button
            variant="outline"
            className="h-9 rounded-full border border-purple-400/30 bg-gradient-to-r from-purple-800 via-purple-950 to-purple-800 px-4 text-xs font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] hover:from-purple-700 hover:via-purple-900 hover:to-purple-700"
            onClick={() => void load()}
            disabled={loading}
          >
            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCcw className="h-4 w-4 mr-2" />}
            Refresh
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-4 mb-3 md:mb-4">
        <Card className="lg:col-span-2 overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-br from-card via-card to-muted/30 shadow-sm">
          <div className="relative p-5 sm:p-6">
            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-purple-500/10 blur-3xl" aria-hidden />
            <div className="absolute -left-24 -bottom-24 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" aria-hidden />
            <div className="relative flex flex-col gap-4">
              <div className="flex items-end justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Inventory</p>
                  <h2 className="mt-1 text-xl sm:text-2xl font-bold tracking-tight text-foreground">Container overview</h2>
                  <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                    Track available vs unavailable accounts, and filter by account size.
                  </p>
                </div>
                <Badge variant="outline" className="rounded-full border-border/70 bg-background/40 px-3 py-1 text-xs">
                  {loading ? "Loading…" : `${stats.total} total`}
                </Badge>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <StatChip label="Available" value={stats.available} tone="success" />
                <StatChip label="Unavailable" value={stats.unavailable} tone="muted" />
                <StatChip label="Assigned" value={stats.assigned} tone="primary" />
                <StatChip label="All" value={stats.total} tone="muted" />
              </div>
            </div>
          </div>
        </Card>

        <Card className="rounded-3xl border border-border/80 bg-card shadow-sm overflow-hidden">
          <div className="border-b border-border/80 bg-muted/20 px-4 sm:px-5 py-3.5">
            <h3 className="text-sm font-semibold text-foreground tracking-tight">Filter by account size</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">Click a size to filter the table below.</p>
          </div>
          <div className="p-4 sm:p-5">
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant={selectedSize === "all" ? "default" : "outline"}
                className={`h-9 rounded-full px-4 text-xs font-semibold ${selectedSize === "all" ? "bg-purple-600 hover:bg-purple-700 text-white" : "border-border/70"}`}
                onClick={() => setSelectedSize("all")}
              >
                All
              </Button>
              {sizeOptions.map((s) => (
                <Button
                  key={s}
                  type="button"
                  variant={selectedSize === s ? "default" : "outline"}
                  className={`h-9 rounded-full px-4 text-xs font-semibold ${selectedSize === s ? "bg-purple-600 hover:bg-purple-700 text-white" : "border-border/70"}`}
                  onClick={() => setSelectedSize(s)}
                >
                  {s}
                </Button>
              ))}
            </div>
            <div className="mt-4 rounded-2xl border border-border/70 bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{loading ? "—" : filtered.length}</span>{" "}
              accounts {selectedSize === "all" ? "" : <>for size <span className="font-semibold text-foreground">{selectedSize}</span></>}
            </div>
          </div>
        </Card>
      </div>

      <Card className="rounded-2xl border border-border/80 bg-card shadow-sm overflow-hidden">
        <div className="border-b border-border/80 bg-muted/20 px-4 sm:px-6 py-3.5 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-foreground tracking-tight">Account credentials</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{loading ? "Loading..." : `${filtered.length} credentials`}</p>
          </div>
          <Badge variant="outline" className="rounded-full border-border/70 bg-background/40 px-3 py-1 text-xs">Live</Badge>
        </div>

        <div className="p-0">
          {error ? (
            <div className="px-4 sm:px-6 py-4">
              <div className="rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-foreground flex items-start gap-3">
                <ShieldAlert className="h-5 w-5 text-destructive mt-0.5" />
                <div className="min-w-0">
                  <div className="font-semibold">Couldn’t load credentials</div>
                  <div className="text-muted-foreground text-xs mt-0.5">{error}</div>
                </div>
              </div>
            </div>
          ) : null}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead>Server</TableHead>
                <TableHead>Login</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Assigned</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} className="py-10">
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading…
                    </div>
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="p-6">
                    <EmptyState
                      title="No credentials found"
                      description={selectedSize === "all" ? "Try refreshing — or confirm the backend is returning credentials." : "No credentials match this account size filter."}
                      icon={
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border/70 bg-muted/40">
                          <ServerCrash className="h-6 w-6 text-muted-foreground" />
                        </div>
                      }
                      action={
                        <div className="flex items-center gap-2">
                          <Button
                            className="rounded-2xl bg-purple-600 hover:bg-purple-700 text-white"
                            onClick={() => setCreateOpen(true)}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add account
                          </Button>
                          <Button variant="outline" className="rounded-2xl border-border/70" onClick={() => void load()}>
                            Refresh
                          </Button>
                        </div>
                      }
                    />
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-semibold tabular-nums">{c.id}</TableCell>
                    <TableCell className="text-muted-foreground">
                      <div className="text-foreground font-semibold">{c.platform}</div>
                      {c.graph_link ? (
                        <a
                          href={c.graph_link}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-1 inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
                        >
                          Graph <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      ) : null}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{c.server}</TableCell>
                    <TableCell className="text-muted-foreground font-mono text-xs">{c.platform_login}</TableCell>
                    <TableCell className="font-semibold tabular-nums">{c.account_size}</TableCell>
                    <TableCell className="text-muted-foreground">{c.is_assigned ? "Yes" : "No"}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusTone(c.status)}`}>
                        {c.status ?? "—"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground text-xs">
                      {formatDateKarachi(c.updated_at || c.created_at || null)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <Button
                          type="button"
                          size="sm"
                          className="h-9 rounded-xl border border-purple-400/30 bg-gradient-to-r from-purple-800 via-purple-950 to-purple-800 px-3 text-xs font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] hover:from-purple-700 hover:via-purple-900 hover:to-purple-700"
                          onClick={() => setViewRow(c)}
                        >
                          <Eye className="h-4 w-4 mr-1.5" />
                          View
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          className="h-9 rounded-xl border border-purple-400/30 bg-gradient-to-r from-purple-800 via-purple-950 to-purple-800 px-3 text-xs font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] hover:from-purple-700 hover:via-purple-900 hover:to-purple-700"
                          onClick={() => startEdit(c)}
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

      {/* Create modal */}
      <Dialog open={createOpen} onOpenChange={(o) => { setCreateOpen(o); if (!o) setMutateError(null) }}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add account</DialogTitle>
          </DialogHeader>
          {mutateError ? (
            <div className="rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-foreground">
              {mutateError}
            </div>
          ) : null}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Platform</Label>
              <Input
                value={createForm.platform}
                onChange={(e) => setCreateForm((p) => ({ ...p, platform: e.target.value }))}
                className="h-11 rounded-2xl"
                placeholder="mt5"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Account size</Label>
              <Select
                value={createForm.account_size}
                onValueChange={(v) => setCreateForm((p) => ({ ...p, account_size: v }))}
              >
                <SelectTrigger className="h-11 rounded-2xl">
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  {["3000","5000","10000","50000","100000","200000","500000"].map((v) => (
                    <SelectItem key={v} value={v}>
                      {Number(v).toLocaleString("en-US")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Platform login</Label>
              <Input
                value={createForm.platform_login}
                onChange={(e) => setCreateForm((p) => ({ ...p, platform_login: e.target.value }))}
                className="h-11 rounded-2xl"
                placeholder="Login"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Password</Label>
              <Input
                value={createForm.platform_password}
                onChange={(e) => setCreateForm((p) => ({ ...p, platform_password: e.target.value }))}
                className="h-11 rounded-2xl"
                placeholder="Password"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Server</Label>
              <Input
                value={createForm.server}
                onChange={(e) => setCreateForm((p) => ({ ...p, server: e.target.value }))}
                className="h-11 rounded-2xl"
                placeholder="Server"
              />
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" className="rounded-2xl border border-purple-400/30 bg-gradient-to-r from-purple-800 via-purple-950 to-purple-800 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] hover:from-purple-700 hover:via-purple-900 hover:to-purple-700" onClick={() => setCreateOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button type="button" className="rounded-2xl bg-purple-600 hover:bg-purple-700 text-white" onClick={() => void createSubmit()} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Create
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View modal */}
      <Dialog open={viewRow != null} onOpenChange={(o) => { if (!o) setViewRow(null) }}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Account details</DialogTitle>
          </DialogHeader>
          {viewRow ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <InfoRow label="Platform" value={viewRow.platform} />
                <InfoRow label="Size" value={String(viewRow.account_size ?? "—")} />
                <InfoRow label="Login" value={String(viewRow.platform_login ?? "—")} mono />
                <InfoRow label="Server" value={String(viewRow.server ?? "—")} />
                <InfoRow label="Status" value={String(viewRow.status ?? "—")} />
                <InfoRow label="Assigned" value={viewRow.is_assigned ? "Yes" : "No"} />
              </div>
              <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Password</p>
                <p className="mt-1 font-mono text-sm text-foreground break-all">
                  {viewRow.platform_password ? String(viewRow.platform_password) : "—"}
                </p>
              </div>
              {viewRow.graph_link ? (
                <a
                  href={viewRow.graph_link}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-sm font-semibold text-foreground hover:underline"
                >
                  Open graph <ExternalLink className="h-4 w-4" />
                </a>
              ) : null}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Edit modal */}
      <Dialog open={editRow != null} onOpenChange={(o) => { if (!o) { setEditRow(null); setEditForm({}); setMutateError(null) } }}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit account</DialogTitle>
          </DialogHeader>
          {mutateError ? (
            <div className="rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-foreground">
              {mutateError}
            </div>
          ) : null}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Platform</Label>
              <Input
                value={String(editForm.platform ?? "")}
                onChange={(e) => setEditForm((p) => ({ ...p, platform: e.target.value }))}
                className="h-11 rounded-2xl"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Account size</Label>
              <Input
                value={String(editForm.account_size ?? "")}
                onChange={(e) => setEditForm((p) => ({ ...p, account_size: e.target.value }))}
                className="h-11 rounded-2xl"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Platform login</Label>
              <Input
                value={String(editForm.platform_login ?? "")}
                onChange={(e) => setEditForm((p) => ({ ...p, platform_login: e.target.value }))}
                className="h-11 rounded-2xl"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Password</Label>
              <Input
                value={String(editForm.platform_password ?? "")}
                onChange={(e) => setEditForm((p) => ({ ...p, platform_password: e.target.value }))}
                className="h-11 rounded-2xl"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Server</Label>
              <Input
                value={String(editForm.server ?? "")}
                onChange={(e) => setEditForm((p) => ({ ...p, server: e.target.value }))}
                className="h-11 rounded-2xl"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Graph link (optional)</Label>
              <Input
                value={String(editForm.graph_link ?? "")}
                onChange={(e) => setEditForm((p) => ({ ...p, graph_link: e.target.value }))}
                className="h-11 rounded-2xl"
                placeholder="https://..."
              />
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" className="rounded-2xl border border-purple-400/30 bg-gradient-to-r from-purple-800 via-purple-950 to-purple-800 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] hover:from-purple-700 hover:via-purple-900 hover:to-purple-700" onClick={() => setEditRow(null)} disabled={saving}>
              Cancel
            </Button>
            <Button type="button" className="rounded-2xl bg-purple-600 hover:bg-purple-700 text-white" onClick={() => void editSubmit()} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminShell>
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

function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-2xl border border-border/70 bg-muted/20 px-4 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className={`mt-1 text-sm font-semibold text-foreground break-all ${mono ? "font-mono" : ""}`}>{value}</p>
    </div>
  )
}

