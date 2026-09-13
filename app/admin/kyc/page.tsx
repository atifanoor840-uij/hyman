"use client"

import { useEffect, useState } from "react"
import { AdminShell } from "@/components/admin/admin-shell"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import EmptyState from "@/components/ui/empty-state"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { adminListKyc, adminSetKycStatus, type AdminKycRow } from "@/lib/api/app-client"
import { ApiClientError } from "@/lib/api/client"
import { Loader2, ShieldAlert, ShieldCheck } from "lucide-react"

export default function AdminKycPage() {
  const [rows, setRows] = useState<AdminKycRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [rejectReasons, setRejectReasons] = useState<Record<string, string>>({})

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

  const handleDecision = async (userId: string, status: "approved" | "rejected") => {
    setBusyId(userId)
    try {
      await adminSetKycStatus(userId, status, status === "rejected" ? rejectReasons[userId] : undefined)
      await refresh()
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Failed to update KYC status.")
    } finally {
      setBusyId(null)
    }
  }

  return (
    <AdminShell title="KYC review" description="Approve or reject customer identity verification submissions.">
      <Card className="overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <EmptyState icon={<ShieldAlert className="w-8 h-8 text-muted-foreground" />} title="Failed to load" description={error} />
        ) : rows.length === 0 ? (
          <EmptyState icon={<ShieldCheck className="w-8 h-8 text-muted-foreground" />} title="No submissions" description="No KYC submissions yet." />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Document</TableHead>
                  <TableHead>Files</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.userId}>
                    <TableCell className="font-mono text-xs">{r.userId.slice(0, 8)}</TableCell>
                    <TableCell className="capitalize">{r.documentType}</TableCell>
                    <TableCell>
                      <div className="flex gap-2 text-xs">
                        {r.frontUrl && <a href={r.frontUrl} target="_blank" rel="noreferrer" className="underline text-primary">Front</a>}
                        {r.backUrl && <a href={r.backUrl} target="_blank" rel="noreferrer" className="underline text-primary">Back</a>}
                        {r.selfieUrl && <a href={r.selfieUrl} target="_blank" rel="noreferrer" className="underline text-primary">Selfie</a>}
                        {r.addressUrl && <a href={r.addressUrl} target="_blank" rel="noreferrer" className="underline text-primary">Address</a>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          r.status === "approved"
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                            : r.status === "rejected"
                              ? "bg-red-500/10 text-red-600 border-red-500/20"
                              : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                        }
                      >
                        {r.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{r.updatedAt ? new Date(r.updatedAt).toLocaleString() : "—"}</TableCell>
                    <TableCell>
                      {r.status === "pending" ? (
                        <div className="flex flex-col gap-2">
                          <div className="flex gap-2">
                            <Button size="sm" disabled={busyId === r.userId} onClick={() => handleDecision(r.userId, "approved")}>
                              Approve
                            </Button>
                            <Button size="sm" variant="destructive" disabled={busyId === r.userId} onClick={() => handleDecision(r.userId, "rejected")}>
                              Reject
                            </Button>
                          </div>
                          <Input
                            placeholder="Reject reason (optional)"
                            className="h-7 text-xs"
                            value={rejectReasons[r.userId] ?? ""}
                            onChange={(e) => setRejectReasons((prev) => ({ ...prev, [r.userId]: e.target.value }))}
                          />
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">Reviewed</span>
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
