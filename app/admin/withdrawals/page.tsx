"use client"

import { useEffect, useMemo, useState } from "react"
import { AdminShell } from "@/components/admin/admin-shell"
import { Button } from "@/components/ui/button"
import { adminListPayouts, adminSetPayoutStatus, type Payout } from "@/lib/api/app-client"
import { ApiClientError } from "@/lib/api/client"
import {
  DataTable,
  EmptyBlock,
  ErrorBlock,
  FilterTabs,
  LoadingBlock,
  Notice,
  Panel,
  StatRow,
  StatusPill,
  Toolbar,
  money,
  shortDate,
  useConfirm,
} from "@/components/admin/admin-ui"
import { ArrowRight, BadgeDollarSign, Check, RefreshCcw, Wallet, X } from "lucide-react"

type Filter = "requested" | "approved" | "paid" | "rejected" | "all"

export default function AdminWithdrawalsPage() {
  const [payouts, setPayouts] = useState<Payout[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<Filter>("requested")
  const [busyId, setBusyId] = useState<string | null>(null)
  const [notice, setNotice] = useState<{ tone: "success" | "error"; text: string } | null>(null)
  const { confirm, dialog } = useConfirm()

  const refresh = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await adminListPayouts()
      setPayouts(res.payouts)
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Failed to load withdrawals.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  const summary = useMemo(() => {
    const of = (s: string) => payouts.filter((p) => p.status === s)
    const sum = (list: Payout[]) => list.reduce((t, p) => t + p.amount, 0)
    return {
      requested: { count: of("requested").length, amount: sum(of("requested")) },
      approved: { count: of("approved").length, amount: sum(of("approved")) },
      paid: { count: of("paid").length, amount: sum(of("paid")) },
      rejected: { count: of("rejected").length },
    }
  }, [payouts])

  const visible = useMemo(() => (filter === "all" ? payouts : payouts.filter((p) => p.status === filter)), [payouts, filter])

  const act = async (p: Payout, status: "approved" | "rejected" | "paid") => {
    const amount = money(p.amount)
    const copy = {
      approved: { title: `Approve ${amount} withdrawal?`, description: "It moves to Approved. Mark it as paid once the money has been sent.", confirmLabel: "Approve" },
      rejected: { title: `Reject ${amount} withdrawal?`, description: "The request will be closed and no payment will be made.", confirmLabel: "Reject", tone: "danger" as const },
      paid: { title: `Mark ${amount} as paid?`, description: `Only do this after you’ve sent the funds via ${p.paymentMethod}.`, confirmLabel: "Mark as paid" },
    }[status]
    const { ok } = await confirm(copy)
    if (!ok) return

    setBusyId(p.id)
    try {
      await adminSetPayoutStatus(p.id, status)
      setNotice({ tone: "success", text: `${amount} withdrawal ${status === "paid" ? "marked as paid" : status}.` })
      await refresh()
    } catch (err) {
      setNotice({ tone: "error", text: err instanceof ApiClientError ? err.message : "Failed to update payout." })
    } finally {
      setBusyId(null)
    }
  }

  return (
    <AdminShell
      title="Withdrawals"
      description="Approve customer payout requests, then mark them paid once the money is sent."
      actions={
        <Button variant="outline" className="h-10 gap-2 rounded-xl border-border bg-card" onClick={() => void refresh()} disabled={loading}>
          <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
        </Button>
      }
    >
      <div className="space-y-4">
        <StatRow
          items={[
            { label: "To review", value: summary.requested.count, tone: "warning", hint: `${money(summary.requested.amount)} requested` },
            { label: "Approved, not paid", value: summary.approved.count, tone: "info", hint: `${money(summary.approved.amount)} to send` },
            { label: "Paid out", value: money(summary.paid.amount, 0), tone: "success", hint: `${summary.paid.count} payouts` },
            { label: "Rejected", value: summary.rejected.count, tone: "danger" },
          ]}
        />

        {/* Workflow hint */}
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">How it works:</span>
          <StatusPill status="requested" />
          <ArrowRight className="h-3.5 w-3.5" />
          <StatusPill status="approved" />
          <ArrowRight className="h-3.5 w-3.5" />
          <StatusPill status="paid" />
          <span className="ml-1">Send the money outside the platform before marking as paid.</span>
        </div>

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
                { value: "requested", label: "To review", count: summary.requested.count },
                { value: "approved", label: "Approved", count: summary.approved.count },
                { value: "paid", label: "Paid", count: summary.paid.count },
                { value: "rejected", label: "Rejected", count: summary.rejected.count },
                { value: "all", label: "All", count: payouts.length },
              ]}
            />
          </Toolbar>

          {loading && payouts.length === 0 ? (
            <LoadingBlock label="Loading withdrawals…" />
          ) : error ? (
            <ErrorBlock message={error} onRetry={() => void refresh()} />
          ) : visible.length === 0 ? (
            <EmptyBlock
              icon={Wallet}
              title={filter === "requested" ? "No requests to review" : "Nothing here"}
              description={filter === "requested" ? "New customer payout requests will appear here." : "No withdrawals with this status."}
            />
          ) : (
            <DataTable head={["Amount", "Method", "Status", "Requested", "Reference", ""]}>
              {visible.map((p) => (
                <tr key={p.id}>
                  <td className="text-base font-semibold tabular-nums text-foreground">{money(p.amount)}</td>
                  <td className="capitalize text-foreground">{p.paymentMethod}</td>
                  <td>
                    <StatusPill status={p.status} />
                  </td>
                  <td className="whitespace-nowrap text-xs text-muted-foreground">{shortDate(p.createdAt, true)}</td>
                  <td className="font-mono text-xs text-muted-foreground">#{p.id.slice(0, 8)}</td>
                  <td>
                    {p.status === "requested" ? (
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 gap-1.5 rounded-lg border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
                          disabled={busyId === p.id}
                          onClick={() => void act(p, "rejected")}
                        >
                          <X className="h-3.5 w-3.5" /> Reject
                        </Button>
                        <Button size="sm" className="h-8 gap-1.5 rounded-lg" disabled={busyId === p.id} onClick={() => void act(p, "approved")}>
                          <Check className="h-3.5 w-3.5" /> Approve
                        </Button>
                      </div>
                    ) : p.status === "approved" ? (
                      <Button
                        size="sm"
                        className="h-8 gap-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                        disabled={busyId === p.id}
                        onClick={() => void act(p, "paid")}
                      >
                        <BadgeDollarSign className="h-3.5 w-3.5" /> Mark as paid
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground">No action needed</span>
                    )}
                  </td>
                </tr>
              ))}
            </DataTable>
          )}
        </Panel>
      </div>
      {dialog}
    </AdminShell>
  )
}
