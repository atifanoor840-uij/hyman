"use client"

import { useEffect, useMemo, useState } from "react"
import { AdminShell } from "@/components/admin/admin-shell"
import { Button } from "@/components/ui/button"
import { adminListKyc, adminSetKycStatus, type AdminKycRow } from "@/lib/api/app-client"
import { ApiClientError } from "@/lib/api/client"
import {
  EmptyBlock,
  ErrorBlock,
  FilterTabs,
  LoadingBlock,
  Notice,
  Panel,
  StatusPill,
  Toolbar,
  shortDate,
  useConfirm,
} from "@/components/admin/admin-ui"
import { Check, ExternalLink, FileText, RefreshCcw, ShieldCheck, X } from "lucide-react"

type Filter = "pending" | "approved" | "rejected" | "all"

const DOCS: { key: keyof AdminKycRow; label: string }[] = [
  { key: "frontUrl", label: "ID front" },
  { key: "backUrl", label: "ID back" },
  { key: "selfieUrl", label: "Selfie" },
  { key: "addressUrl", label: "Proof of address" },
]

export default function AdminKycPage() {
  const [rows, setRows] = useState<AdminKycRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<Filter>("pending")
  const [busyId, setBusyId] = useState<string | null>(null)
  const [notice, setNotice] = useState<{ tone: "success" | "error"; text: string } | null>(null)
  const { confirm, dialog } = useConfirm()

  const refresh = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await adminListKyc()
      setRows(res.submissions)
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Failed to load KYC submissions.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  const counts = useMemo(
    () => ({
      pending: rows.filter((r) => r.status === "pending").length,
      approved: rows.filter((r) => r.status === "approved").length,
      rejected: rows.filter((r) => r.status === "rejected").length,
      all: rows.length,
    }),
    [rows],
  )

  const visible = useMemo(() => (filter === "all" ? rows : rows.filter((r) => r.status === filter)), [rows, filter])

  const decide = async (r: AdminKycRow, status: "approved" | "rejected") => {
    const shortId = r.userId.slice(0, 8)
    const result =
      status === "approved"
        ? await confirm({
            title: "Approve this verification?",
            description: `User ${shortId} will be marked as identity verified.`,
            confirmLabel: "Approve",
          })
        : await confirm({
            title: "Reject this verification?",
            description: `User ${shortId} will be asked to submit their documents again.`,
            confirmLabel: "Reject",
            tone: "danger",
            reasonLabel: "Reason (shown to the user)",
            reasonPlaceholder: "e.g. Photo is blurry — please upload a clearer image of your ID",
          })
    if (!result.ok) return

    setBusyId(r.userId)
    try {
      await adminSetKycStatus(r.userId, status, status === "rejected" ? result.reason || undefined : undefined)
      setNotice({ tone: "success", text: `Verification ${status} for user ${shortId}.` })
      await refresh()
    } catch (err) {
      setNotice({ tone: "error", text: err instanceof ApiClientError ? err.message : "Failed to update KYC status." })
    } finally {
      setBusyId(null)
    }
  }

  return (
    <AdminShell
      title="KYC review"
      description="Check each customer’s documents, then approve or reject."
      actions={
        <Button variant="outline" className="h-10 gap-2 rounded-xl border-border bg-card" onClick={() => void refresh()} disabled={loading}>
          <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
        </Button>
      }
    >
      <div className="space-y-4">
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
                { value: "pending", label: "To review", count: counts.pending },
                { value: "approved", label: "Approved", count: counts.approved },
                { value: "rejected", label: "Rejected", count: counts.rejected },
                { value: "all", label: "All", count: counts.all },
              ]}
            />
            <p className="text-xs text-muted-foreground">Open every document before deciding.</p>
          </Toolbar>

          {loading && rows.length === 0 ? (
            <LoadingBlock label="Loading submissions…" />
          ) : error ? (
            <ErrorBlock message={error} onRetry={() => void refresh()} />
          ) : visible.length === 0 ? (
            <EmptyBlock
              icon={ShieldCheck}
              title={filter === "pending" ? "You’re all caught up" : "Nothing here"}
              description={filter === "pending" ? "There are no submissions waiting for review." : "No submissions with this status."}
            />
          ) : (
            <ul className="divide-y divide-border">
              {visible.map((r) => {
                const docs = DOCS.filter((d) => r[d.key])
                return (
                  <li key={r.userId} className="flex flex-col gap-4 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0 space-y-2.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-foreground">
                          User <span className="font-mono text-sm">{r.userId.slice(0, 8)}</span>
                        </p>
                        <StatusPill status={r.status} />
                        <span className="text-xs capitalize text-muted-foreground">
                          {r.documentType.replace(/_/g, " ")} · updated {shortDate(r.updatedAt, true)}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {docs.length === 0 ? (
                          <span className="text-xs text-muted-foreground">No files uploaded</span>
                        ) : (
                          docs.map((d) => (
                            <a
                              key={d.key}
                              href={r[d.key] as string}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-accent hover:text-accent-foreground"
                            >
                              <FileText className="h-3.5 w-3.5" />
                              {d.label}
                              <ExternalLink className="h-3 w-3 opacity-60" />
                            </a>
                          ))
                        )}
                      </div>
                      {r.status === "rejected" && r.rejectReason && (
                        <p className="text-xs text-red-700">
                          <span className="font-medium">Reason:</span> {r.rejectReason}
                        </p>
                      )}
                    </div>

                    {r.status === "pending" && (
                      <div className="flex shrink-0 gap-2">
                        <Button
                          variant="outline"
                          className="h-9 gap-1.5 rounded-lg border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
                          disabled={busyId === r.userId}
                          onClick={() => void decide(r, "rejected")}
                        >
                          <X className="h-4 w-4" /> Reject
                        </Button>
                        <Button className="h-9 gap-1.5 rounded-lg" disabled={busyId === r.userId} onClick={() => void decide(r, "approved")}>
                          <Check className="h-4 w-4" /> Approve
                        </Button>
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </Panel>
      </div>
      {dialog}
    </AdminShell>
  )
}
