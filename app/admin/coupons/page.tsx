"use client"

import { useEffect, useState } from "react"
import { AdminShell } from "@/components/admin/admin-shell"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import EmptyState from "@/components/ui/empty-state"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  adminListCoupons,
  adminCreateCoupon,
  adminUpdateCoupon,
  adminDeleteCoupon,
  type AdminCoupon,
} from "@/lib/api/app-client"
import { ApiClientError } from "@/lib/api/client"
import { Loader2, ShieldAlert, Percent, Trash2 } from "lucide-react"

const EMPTY_FORM = { code: "", discountPercent: "", expiresAt: "" }

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<AdminCoupon[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [busyCode, setBusyCode] = useState<string | null>(null)

  const refresh = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await adminListCoupons()
      setCoupons(res.coupons)
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Failed to load coupons.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreateError(null)
    const discount = Number(form.discountPercent)
    if (!form.code.trim() || !Number.isFinite(discount) || discount <= 0 || discount > 100) {
      setCreateError("Enter a code and a discount between 1 and 100.")
      return
    }
    setCreating(true)
    try {
      await adminCreateCoupon({
        code: form.code.trim(),
        discountPercent: discount,
        expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
      })
      setForm(EMPTY_FORM)
      await refresh()
    } catch (err) {
      setCreateError(err instanceof ApiClientError ? err.message : "Failed to create coupon.")
    } finally {
      setCreating(false)
    }
  }

  const toggleStatus = async (coupon: AdminCoupon) => {
    setBusyCode(coupon.code)
    try {
      await adminUpdateCoupon(coupon.code, { status: coupon.status === "active" ? "inactive" : "active" })
      await refresh()
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Failed to update coupon.")
    } finally {
      setBusyCode(null)
    }
  }

  const handleDelete = async (code: string) => {
    setBusyCode(code)
    try {
      await adminDeleteCoupon(code)
      await refresh()
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Failed to delete coupon.")
    } finally {
      setBusyCode(null)
    }
  }

  return (
    <AdminShell title="Coupons" description="Create and manage discount codes for the checkout flow.">
      <Card className="p-4 mb-4">
        <form onSubmit={handleCreate} className="grid grid-cols-2 sm:grid-cols-4 gap-3 items-end">
          <div className="space-y-1">
            <Label className="text-xs">Code</Label>
            <Input value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="WELCOME10" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Discount %</Label>
            <Input
              type="number"
              min={1}
              max={100}
              value={form.discountPercent}
              onChange={(e) => setForm((f) => ({ ...f, discountPercent: e.target.value }))}
              placeholder="10"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Expires (optional)</Label>
            <Input type="date" value={form.expiresAt} onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))} />
          </div>
          <div className="flex items-center gap-3">
            <Button type="submit" size="sm" disabled={creating} className="gap-1">
              <Percent className="w-3.5 h-3.5" /> {creating ? "Adding…" : "Add coupon"}
            </Button>
          </div>
          {createError && <p className="col-span-full text-sm text-destructive">{createError}</p>}
        </form>
      </Card>

      <Card className="overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <EmptyState icon={<ShieldAlert className="w-8 h-8 text-muted-foreground" />} title="Failed to load" description={error} />
        ) : coupons.length === 0 ? (
          <EmptyState icon={<Percent className="w-8 h-8 text-muted-foreground" />} title="No coupons" description="Add a discount code above." />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {coupons.map((c) => (
                  <TableRow key={c.code}>
                    <TableCell className="font-mono font-semibold">{c.code}</TableCell>
                    <TableCell>{c.discountPercent}%</TableCell>
                    <TableCell>
                      <button onClick={() => toggleStatus(c)} disabled={busyCode === c.code}>
                        <Badge
                          className={
                            c.status === "active"
                              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 cursor-pointer"
                              : "bg-muted text-muted-foreground cursor-pointer"
                          }
                        >
                          {c.status}
                        </Badge>
                      </button>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : "Never"}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "—"}
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="ghost" disabled={busyCode === c.code} onClick={() => handleDelete(c.code)}>
                        <Trash2 className="w-3.5 h-3.5 text-destructive" />
                      </Button>
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
