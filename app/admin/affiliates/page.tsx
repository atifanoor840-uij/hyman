"use client"

import { useEffect, useMemo, useState } from "react"
import { AdminShell } from "@/components/admin/admin-shell"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import EmptyState from "@/components/ui/empty-state"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  adminListAffiliates,
  adminCreateAffiliate,
  adminUpdateAffiliate,
  adminDeleteAffiliate,
  adminListReferrals,
  adminSetReferralStatus,
  type AdminAffiliate,
  type AdminReferral,
} from "@/lib/api/app-client"
import { ApiClientError } from "@/lib/api/client"
import { Loader2, ShieldAlert, Handshake, Trash2, Users2 } from "lucide-react"

const EMPTY_FORM = { email: "", referralCode: "", commissionRate: "10" }

function referralStatusClass(status: string) {
  if (status === "paid") return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
  if (status === "confirmed") return "bg-blue-500/10 text-blue-600 border-blue-500/20"
  return "bg-amber-500/10 text-amber-600 border-amber-500/20"
}

export default function AdminAffiliatesPage() {
  const [affiliates, setAffiliates] = useState<AdminAffiliate[]>([])
  const [referrals, setReferrals] = useState<AdminReferral[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState(EMPTY_FORM)
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  const refresh = async () => {
    setLoading(true)
    setError(null)
    try {
      const [aff, ref] = await Promise.all([adminListAffiliates(), adminListReferrals()])
      setAffiliates(aff.affiliates)
      setReferrals(ref.referrals)
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Failed to load affiliate program data.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  const referralsByAffiliate = useMemo(() => {
    const map = new Map<string, AdminReferral[]>()
    for (const r of referrals) {
      if (!r.affiliateId) continue
      const list = map.get(r.affiliateId) ?? []
      list.push(r)
      map.set(r.affiliateId, list)
    }
    return map
  }, [referrals])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreateError(null)
    const rate = Number(form.commissionRate)
    if (!form.email.trim() || !form.referralCode.trim() || !Number.isFinite(rate) || rate <= 0 || rate > 100) {
      setCreateError("Enter the user's email, a referral code, and a commission rate between 1 and 100.")
      return
    }
    setCreating(true)
    try {
      await adminCreateAffiliate({ email: form.email.trim(), referralCode: form.referralCode.trim(), commissionRate: rate })
      setForm(EMPTY_FORM)
      await refresh()
    } catch (err) {
      setCreateError(err instanceof ApiClientError ? err.message : "Failed to create affiliate.")
    } finally {
      setCreating(false)
    }
  }

  const handleRateChange = async (userId: string, rate: number) => {
    setBusyId(userId)
    try {
      await adminUpdateAffiliate(userId, { commissionRate: rate })
      await refresh()
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Failed to update affiliate.")
    } finally {
      setBusyId(null)
    }
  }

  const handleDelete = async (userId: string) => {
    setBusyId(userId)
    try {
      await adminDeleteAffiliate(userId)
      await refresh()
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Failed to remove affiliate.")
    } finally {
      setBusyId(null)
    }
  }

  const handleReferralStatus = async (r: AdminReferral, status: "pending" | "confirmed" | "paid") => {
    setBusyId(`${r.referredUserId}:${r.orderId}`)
    try {
      await adminSetReferralStatus(r.referredUserId, r.orderId, status)
      await refresh()
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Failed to update referral.")
    } finally {
      setBusyId(null)
    }
  }

  return (
    <AdminShell title="Affiliate program" description="Enroll affiliates, track referral commissions, and manage payout status.">
      <Card className="p-4 mb-4">
        <form onSubmit={handleCreate} className="grid grid-cols-2 sm:grid-cols-4 gap-3 items-end">
          <div className="space-y-1">
            <Label className="text-xs">User email</Label>
            <Input value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="user@example.com" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Referral code</Label>
            <Input
              value={form.referralCode}
              onChange={(e) => setForm((f) => ({ ...f, referralCode: e.target.value.toUpperCase() }))}
              placeholder="JANE10"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Commission %</Label>
            <Input
              type="number"
              min={1}
              max={100}
              value={form.commissionRate}
              onChange={(e) => setForm((f) => ({ ...f, commissionRate: e.target.value }))}
            />
          </div>
          <div>
            <Button type="submit" size="sm" disabled={creating} className="gap-1">
              <Handshake className="w-3.5 h-3.5" /> {creating ? "Enrolling…" : "Enroll affiliate"}
            </Button>
          </div>
          {createError && <p className="col-span-full text-sm text-destructive">{createError}</p>}
        </form>
      </Card>

      <Card className="overflow-hidden mb-6">
        <div className="border-b border-border/80 bg-muted/20 px-4 sm:px-6 py-3.5">
          <h3 className="text-sm font-semibold text-foreground">Affiliates</h3>
        </div>
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <EmptyState icon={<ShieldAlert className="w-8 h-8 text-muted-foreground" />} title="Failed to load" description={error} />
        ) : affiliates.length === 0 ? (
          <EmptyState icon={<Handshake className="w-8 h-8 text-muted-foreground" />} title="No affiliates yet" description="Enroll a user above to get started." />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Affiliate</TableHead>
                  <TableHead>Referral code</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>Referrals</TableHead>
                  <TableHead>Total earned</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {affiliates.map((a) => {
                  const theirReferrals = referralsByAffiliate.get(a.userId) ?? []
                  const totalEarned = theirReferrals.reduce((s, r) => s + r.commissionAmount, 0)
                  return (
                    <TableRow key={a.userId}>
                      <TableCell>
                        <div className="font-medium">{a.users?.name ?? "—"}</div>
                        <div className="text-xs text-muted-foreground">{a.users?.email}</div>
                      </TableCell>
                      <TableCell className="font-mono font-semibold">{a.referralCode}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min={1}
                          max={100}
                          defaultValue={a.commissionRate}
                          className="h-8 w-20"
                          disabled={busyId === a.userId}
                          onBlur={(e) => {
                            const v = Number(e.target.value)
                            if (Number.isFinite(v) && v !== a.commissionRate) handleRateChange(a.userId, v)
                          }}
                        />
                      </TableCell>
                      <TableCell>{theirReferrals.length}</TableCell>
                      <TableCell className="font-semibold">${totalEarned.toFixed(2)}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="ghost" disabled={busyId === a.userId} onClick={() => handleDelete(a.userId)}>
                          <Trash2 className="w-3.5 h-3.5 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      <Card className="overflow-hidden">
        <div className="border-b border-border/80 bg-muted/20 px-4 sm:px-6 py-3.5">
          <h3 className="text-sm font-semibold text-foreground">Referrals</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Commission earned per referred order — recorded automatically when a referred customer's order is paid.</p>
        </div>
        {!loading && !error && referrals.length === 0 ? (
          <EmptyState icon={<Users2 className="w-8 h-8 text-muted-foreground" />} title="No referrals yet" description="Referral commissions appear here once a referred customer pays for an order." />
        ) : !loading && !error ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Referred customer</TableHead>
                  <TableHead>Affiliate</TableHead>
                  <TableHead>Order amount</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {referrals.map((r) => {
                  const key = `${r.referredUserId}:${r.orderId}`
                  return (
                    <TableRow key={key}>
                      <TableCell>
                        <div className="font-medium">{r.referredUser?.name ?? "—"}</div>
                        <div className="text-xs text-muted-foreground">{r.referredUser?.email}</div>
                      </TableCell>
                      <TableCell className="text-xs">
                        {r.affiliateUser?.name ?? "—"} ({r.affiliateReferralCode ?? "—"})
                      </TableCell>
                      <TableCell>${r.order?.amountPaid.toFixed(2) ?? "—"}</TableCell>
                      <TableCell className="font-semibold">${r.commissionAmount.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge className={`${referralStatusClass(r.status)} capitalize`}>{r.status}</Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "—"}
                      </TableCell>
                      <TableCell>
                        {r.status !== "paid" && (
                          <div className="flex gap-2">
                            {r.status === "pending" && (
                              <Button size="sm" disabled={busyId === key} onClick={() => handleReferralStatus(r, "confirmed")}>
                                Confirm
                              </Button>
                            )}
                            {r.status === "confirmed" && (
                              <Button size="sm" disabled={busyId === key} onClick={() => handleReferralStatus(r, "paid")}>
                                Mark paid
                              </Button>
                            )}
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        ) : null}
      </Card>
    </AdminShell>
  )
}
