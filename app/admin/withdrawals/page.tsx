"use client"

import { useEffect, useState } from "react"
import { AdminShell } from "@/components/admin/admin-shell"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import EmptyState from "@/components/ui/empty-state"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { adminListPayouts, adminSetPayoutStatus, type Payout } from "@/lib/api/app-client"
import { ApiClientError } from "@/lib/api/client"
import { Loader2, ShieldAlert, Wallet } from "lucide-react"

export default function AdminWithdrawalsPage() {
  const [payouts, setPayouts] = useState<Payout[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

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

  const handleAction = async (id: string, status: "approved" | "rejected" | "paid") => {
    setBusyId(id)
    try {
      await adminSetPayoutStatus(id, status)
      await refresh()
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Failed to update payout.")
    } finally {
      setBusyId(null)
    }
  }

  return (
    <AdminShell title="Withdrawals" description="Review and approve customer payout requests.">
      <Card className="overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <EmptyState icon={<ShieldAlert className="w-8 h-8 text-muted-foreground" />} title="Failed to load" description={error} />
        ) : payouts.length === 0 ? (
          <EmptyState icon={<Wallet className="w-8 h-8 text-muted-foreground" />} title="No withdrawal requests" description="Customer payout requests will appear here." />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payouts.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-semibold">${p.amount.toFixed(2)}</TableCell>
                    <TableCell className="capitalize">{p.paymentMethod}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          p.status === "paid"
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                            : p.status === "rejected"
                              ? "bg-red-500/10 text-red-600 border-red-500/20"
                              : p.status === "approved"
                                ? "bg-blue-500/10 text-blue-600 border-blue-500/20"
                                : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                        }
                      >
                        {p.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{p.createdAt ? new Date(p.createdAt).toLocaleString() : "—"}</TableCell>
                    <TableCell>
                      {p.status === "requested" ? (
                        <div className="flex gap-2">
                          <Button size="sm" disabled={busyId === p.id} onClick={() => handleAction(p.id, "approved")}>Approve</Button>
                          <Button size="sm" variant="destructive" disabled={busyId === p.id} onClick={() => handleAction(p.id, "rejected")}>Reject</Button>
                        </div>
                      ) : p.status === "approved" ? (
                        <Button size="sm" disabled={busyId === p.id} onClick={() => handleAction(p.id, "paid")}>Mark paid</Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </AdminShell>
  )
}
