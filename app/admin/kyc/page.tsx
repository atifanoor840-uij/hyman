"use client"

import { useEffect, useMemo, useState } from "react"
import { AdminShell } from "@/components/admin/admin-shell"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import EmptyState from "@/components/ui/empty-state"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { listDiditSessions, type DiditAdminSession } from "@/lib/api/admin-kyc"
import { ApiClientError } from "@/lib/api/client"
import { formatDateKarachi } from "@/lib/utils"
import { ExternalLink, Loader2, RefreshCcw, ShieldAlert, ShieldCheck } from "lucide-react"

function statusTone(status: string | null | undefined) {
  const s = String(status ?? "").toLowerCase()
  if (s.includes("approved") || s.includes("verified")) return "bg-emerald-500/15 text-emerald-600 border-emerald-500/20"
  if (s.includes("pending") || s.includes("in progress") || s.includes("in_review") || s.includes("review")) return "bg-amber-500/15 text-amber-600 border-amber-500/20"
  if (s.includes("rejected") || s.includes("failed")) return "bg-destructive/10 text-destructive border-destructive/20"
  if (s.includes("not started")) return "bg-muted/40 text-muted-foreground border-border/60"
  return "bg-muted/40 text-muted-foreground border-border/60"
}

export default function AdminKycPage() {
  const [sessions, setSessions] = useState<DiditAdminSession[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await listDiditSessions()
      setSessions(Array.isArray(data) ? data : [])
      setError(null)
    } catch (e) {
      if (e instanceof ApiClientError) {
        setError(e.status === 401 ? "Session expired. Please sign in again." : e.message || "Failed to load KYC sessions.")
      } else {
        setError("Failed to load KYC sessions.")
      }
      setSessions([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const sorted = useMemo(() => {
    return sessions
      .slice()
      .sort((a, b) => String(a.updated_at ?? a.created_at ?? "") < String(b.updated_at ?? b.created_at ?? "") ? 1 : -1)
  }, [sessions])

  return (
    <AdminShell
      title="KYC"
      description="Review verification status and resolve pending cases."
      actions={
        <Button
          variant="outline"
          className="h-9 rounded-full border-border/70"
          onClick={() => void load()}
          disabled={loading}
        >
          {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCcw className="h-4 w-4 mr-2" />}
          Refresh
        </Button>
      }
    >
      <Card className="rounded-2xl border border-border/80 bg-card shadow-sm overflow-hidden">
        <div className="border-b border-border/80 bg-muted/20 px-4 sm:px-6 py-3.5 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-foreground tracking-tight">KYC queue</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{loading ? "Loading sessions..." : `${sorted.length} sessions`}</p>
          </div>
          <Badge variant="outline" className="rounded-full border-border/70 bg-background/40 px-3 py-1 text-xs">Live</Badge>
        </div>

        <div className="p-0">
          {error ? (
            <div className="px-4 sm:px-6 py-4">
              <div className="rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-foreground flex items-start gap-3">
                <ShieldAlert className="h-5 w-5 text-destructive mt-0.5" />
                <div className="min-w-0">
                  <div className="font-semibold">Couldn’t load KYC sessions</div>
                  <div className="text-muted-foreground text-xs mt-0.5">{error}</div>
                </div>
              </div>
            </div>
          ) : null}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Workflow</TableHead>
                <TableHead>Session</TableHead>
                <TableHead>Callback</TableHead>
                <TableHead className="text-right">Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-10">
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading…
                    </div>
                  </TableCell>
                </TableRow>
              ) : sorted.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="p-6">
                    <EmptyState
                      title="No KYC sessions found"
                      description="If you recently signed in, try refreshing."
                      icon={
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border/70 bg-muted/40">
                          <ShieldCheck className="h-6 w-6 text-muted-foreground" />
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
                sorted.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-semibold tabular-nums">{s.id}</TableCell>
                    <TableCell className="text-muted-foreground">
                      <div className="text-foreground font-semibold">User #{s.user_id ?? "—"}</div>
                      <div className="text-[11px] text-muted-foreground mt-1">vendor: {s.vendor_data ?? "—"}</div>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusTone(s.status)}`}>
                        {s.status ?? "—"}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      <code className="text-xs font-mono">{s.workflow_id ?? "—"}</code>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      <code className="text-xs font-mono">{s.session_id ?? "—"}</code>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {s.callback_url ? (
                        <a
                          href={s.callback_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
                        >
                          Open <ExternalLink className="h-4 w-4" />
                        </a>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground text-xs">
                      {formatDateKarachi(s.updated_at || s.created_at || null)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </AdminShell>
  )
}

