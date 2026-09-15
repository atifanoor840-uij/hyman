"use client"

import { useEffect, useMemo, useState } from "react"
import { AdminShell } from "@/components/admin/admin-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
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
import {
  DataTable,
  EmptyBlock,
  ErrorBlock,
  Field,
  FilterTabs,
  LoadingBlock,
  Notice,
  Panel,
  Person,
  SearchBox,
  StatRow,
  StatusPill,
  Toolbar,
  inputClass,
  money,
  shortDate,
  useConfirm,
} from "@/components/admin/admin-ui"
import { ArrowRight, BadgeDollarSign, Check, Handshake, Plus, Trash2, Users2 } from "lucide-react"

type View = "affiliates" | "referrals"
type RefFilter = "all" | "pending" | "confirmed" | "paid"

const EMPTY_FORM = { email: "", referralCode: "", commissionRate: "10" }

export default function AdminAffiliatesPage() {
  const [affiliates, setAffiliates] = useState<AdminAffiliate[]>([])
  const [referrals, setReferrals] = useState<AdminReferral[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [view, setView] = useState<View>("affiliates")
  const [refFilter, setRefFilter] = useState<RefFilter>("all")
  const [search, setSearch] = useState("")

  const [enrollOpen, setEnrollOpen] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [notice, setNotice] = useState<{ tone: "success" | "error"; text: string } | null>(null)
  const { confirm, dialog } = useConfirm()

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

  const totals = useMemo(() => {
    const sum = (s: string) => referrals.filter((r) => r.status === s).reduce((t, r) => t + r.commissionAmount, 0)
    return {
      pending: sum("pending"),
      confirmed: sum("confirmed"),
      paid: sum("paid"),
      count: (s: string) => referrals.filter((r) => r.status === s).length,
    }
  }, [referrals])

  const q = search.trim().toLowerCase()
  const visibleAffiliates = affiliates.filter(
    (a) => !q || a.referralCode.toLowerCase().includes(q) || a.users?.email.toLowerCase().includes(q) || a.users?.name?.toLowerCase().includes(q),
  )
  const visibleReferrals = referrals.filter(
    (r) =>
      (refFilter === "all" || r.status === refFilter) &&
      (!q ||
        r.referredUser?.email?.toLowerCase().includes(q) ||
        r.referredUser?.name?.toLowerCase().includes(q) ||
        r.affiliateReferralCode?.toLowerCase().includes(q)),
  )

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreateError(null)
    const rate = Number(form.commissionRate)
    if (!form.email.trim() || !form.referralCode.trim() || !Number.isFinite(rate) || rate <= 0 || rate > 100) {
      setCreateError("Enter the user’s email, a referral code, and a commission between 1 and 100%.")
      return
    }
    setCreating(true)
    try {
      await adminCreateAffiliate({ email: form.email.trim(), referralCode: form.referralCode.trim(), commissionRate: rate })
      setNotice({ tone: "success", text: `${form.email.trim()} is now an affiliate with code ${form.referralCode.trim()}.` })
      setForm(EMPTY_FORM)
      setEnrollOpen(false)
      await refresh()
    } catch (err) {
      setCreateError(err instanceof ApiClientError ? err.message : "Failed to create affiliate.")
    } finally {
      setCreating(false)
    }
  }

  const handleRateChange = async (a: AdminAffiliate, rate: number) => {
    if (!Number.isFinite(rate) || rate <= 0 || rate > 100) {
      setNotice({ tone: "error", text: "Commission must be between 1 and 100%." })
      return
    }
    setBusyId(a.userId)
    try {
      await adminUpdateAffiliate(a.userId, { commissionRate: rate })
      setNotice({ tone: "success", text: `Commission for ${a.referralCode} set to ${rate}%.` })
      await refresh()
    } catch (err) {
      setNotice({ tone: "error", text: err instanceof ApiClientError ? err.message : "Failed to update affiliate." })
    } finally {
      setBusyId(null)
    }
  }

  const handleDelete = async (a: AdminAffiliate) => {
    const { ok } = await confirm({
      title: `Remove ${a.users?.name ?? a.referralCode} from the program?`,
      description: `Code ${a.referralCode} will stop earning commission. Past referral records are kept.`,
      confirmLabel: "Remove affiliate",
      tone: "danger",
    })
    if (!ok) return
    setBusyId(a.userId)
    try {
      await adminDeleteAffiliate(a.userId)
      setNotice({ tone: "success", text: `Affiliate ${a.referralCode} removed.` })
      await refresh()
    } catch (err) {
      setNotice({ tone: "error", text: err instanceof ApiClientError ? err.message : "Failed to remove affiliate." })
    } finally {
      setBusyId(null)
    }
  }

  const handleReferralStatus = async (r: AdminReferral, status: "confirmed" | "paid") => {
    const amount = money(r.commissionAmount)
    const { ok } = await confirm(
      status === "confirmed"
        ? { title: `Confirm ${amount} commission?`, description: "Confirm once the referred order is valid (not refunded or charged back).", confirmLabel: "Confirm" }
        : { title: `Mark ${amount} as paid?`, description: `Only do this after you’ve paid ${r.affiliateUser?.name ?? "the affiliate"}.`, confirmLabel: "Mark as paid" },
    )
    if (!ok) return
    const key = `${r.referredUserId}:${r.orderId}`
    setBusyId(key)
    try {
      await adminSetReferralStatus(r.referredUserId, r.orderId, status)
      setNotice({ tone: "success", text: `Commission ${status === "paid" ? "marked as paid" : "confirmed"}.` })
      await refresh()
    } catch (err) {
      setNotice({ tone: "error", text: err instanceof ApiClientError ? err.message : "Failed to update referral." })
    } finally {
      setBusyId(null)
    }
  }

  return (
    <AdminShell
      title="Affiliates"
      description="Partners who earn commission when customers buy with their referral code."
      actions={
        <Button
          className="h-10 gap-2 rounded-xl"
          onClick={() => {
            setForm(EMPTY_FORM)
            setCreateError(null)
            setEnrollOpen(true)
          }}
        >
          <Plus className="h-4 w-4" /> Enroll affiliate
        </Button>
      }
    >
      <div className="space-y-4">
        <StatRow
          items={[
            { label: "Affiliates", value: affiliates.length, tone: "brand", hint: `${referrals.length} referred orders` },
            { label: "Pending commission", value: money(totals.pending), tone: "warning", hint: `${totals.count("pending")} to confirm` },
            { label: "Confirmed, unpaid", value: money(totals.confirmed), tone: "info", hint: `${totals.count("confirmed")} to pay` },
            { label: "Paid out", value: money(totals.paid), tone: "success", hint: `${totals.count("paid")} commissions` },
          ]}
        />

        {notice && (
          <Notice tone={notice.tone} onDismiss={() => setNotice(null)}>
            {notice.text}
          </Notice>
        )}

        <Panel>
          <Toolbar>
            <FilterTabs<View>
              value={view}
              onChange={(v) => {
                setView(v)
                setSearch("")
              }}
              options={[
                { value: "affiliates", label: "Affiliates", count: affiliates.length },
                { value: "referrals", label: "Referral commissions", count: referrals.length },
              ]}
            />
            <SearchBox
              value={search}
              onChange={setSearch}
              placeholder={view === "affiliates" ? "Search name, email or code" : "Search customer or code"}
            />
          </Toolbar>

          {loading && affiliates.length === 0 && referrals.length === 0 ? (
            <LoadingBlock label="Loading affiliate program…" />
          ) : error ? (
            <ErrorBlock message={error} onRetry={() => void refresh()} />
          ) : view === "affiliates" ? (
            visibleAffiliates.length === 0 ? (
              <EmptyBlock
                icon={Handshake}
                title={affiliates.length ? "No matching affiliates" : "No affiliates yet"}
                description={affiliates.length ? "Try a different search." : "Enroll an existing user to give them a referral code."}
              />
            ) : (
              <DataTable head={["Affiliate", "Referral code", "Commission", "Referred orders", "Earned", ""]}>
                {visibleAffiliates.map((a) => {
                  const theirs = referralsByAffiliate.get(a.userId) ?? []
                  const earned = theirs.reduce((s, r) => s + r.commissionAmount, 0)
                  return (
                    <tr key={a.userId}>
                      <td>
                        <Person name={a.users?.name} email={a.users?.email} />
                      </td>
                      <td>
                        <span className="rounded-lg border border-dashed border-border bg-muted/50 px-2.5 py-1 font-mono text-sm font-semibold text-foreground">
                          {a.referralCode}
                        </span>
                      </td>
                      <td>
                        <div className="relative w-24">
                          <Input
                            type="number"
                            min={1}
                            max={100}
                            defaultValue={a.commissionRate}
                            className={`${inputClass} h-9 pr-7`}
                            disabled={busyId === a.userId}
                            aria-label={`Commission for ${a.referralCode}`}
                            onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
                            onBlur={(e) => {
                              const v = Number(e.target.value)
                              if (v !== a.commissionRate) void handleRateChange(a, v)
                            }}
                          />
                          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">%</span>
                        </div>
                      </td>
                      <td className="tabular-nums text-foreground">{theirs.length}</td>
                      <td className="font-semibold tabular-nums text-foreground">{money(earned)}</td>
                      <td>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 rounded-lg text-muted-foreground hover:bg-red-50 hover:text-red-600"
                          disabled={busyId === a.userId}
                          onClick={() => void handleDelete(a)}
                          aria-label={`Remove ${a.referralCode}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </DataTable>
            )
          ) : (
            <>
              <div className="flex flex-col gap-3 border-b border-border px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
                <FilterTabs<RefFilter>
                  value={refFilter}
                  onChange={setRefFilter}
                  options={[
                    { value: "all", label: "All", count: referrals.length },
                    { value: "pending", label: "Pending", count: totals.count("pending") },
                    { value: "confirmed", label: "Confirmed", count: totals.count("confirmed") },
                    { value: "paid", label: "Paid", count: totals.count("paid") },
                  ]}
                />
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <StatusPill status="pending" /> <ArrowRight className="h-3 w-3" /> <StatusPill status="confirmed" /> <ArrowRight className="h-3 w-3" />
                  <StatusPill status="paid" />
                </div>
              </div>
              {visibleReferrals.length === 0 ? (
                <EmptyBlock
                  icon={Users2}
                  title={referrals.length ? "No matching commissions" : "No referrals yet"}
                  description={referrals.length ? "Try another filter or search." : "Commissions are recorded automatically when a referred customer pays."}
                />
              ) : (
                <DataTable head={["Referred customer", "Affiliate", "Order", "Commission", "Status", "Date", ""]}>
                  {visibleReferrals.map((r) => {
                    const key = `${r.referredUserId}:${r.orderId}`
                    return (
                      <tr key={key}>
                        <td>
                          <Person name={r.referredUser?.name} email={r.referredUser?.email} />
                        </td>
                        <td>
                          <p className="text-sm text-foreground">{r.affiliateUser?.name ?? "—"}</p>
                          <p className="font-mono text-xs text-muted-foreground">{r.affiliateReferralCode ?? "—"}</p>
                        </td>
                        <td className="tabular-nums text-foreground">{r.order ? money(r.order.amountPaid) : "—"}</td>
                        <td className="font-semibold tabular-nums text-foreground">{money(r.commissionAmount)}</td>
                        <td>
                          <StatusPill status={r.status} />
                        </td>
                        <td className="whitespace-nowrap text-xs text-muted-foreground">{shortDate(r.createdAt)}</td>
                        <td>
                          {r.status === "pending" ? (
                            <Button size="sm" className="h-8 gap-1.5 rounded-lg" disabled={busyId === key} onClick={() => void handleReferralStatus(r, "confirmed")}>
                              <Check className="h-3.5 w-3.5" /> Confirm
                            </Button>
                          ) : r.status === "confirmed" ? (
                            <Button
                              size="sm"
                              className="h-8 gap-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                              disabled={busyId === key}
                              onClick={() => void handleReferralStatus(r, "paid")}
                            >
                              <BadgeDollarSign className="h-3.5 w-3.5" /> Mark as paid
                            </Button>
                          ) : (
                            <span className="text-xs text-muted-foreground">Done</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </DataTable>
              )}
            </>
          )}
        </Panel>
      </div>

      <Dialog open={enrollOpen} onOpenChange={setEnrollOpen}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Enroll affiliate</DialogTitle>
            <DialogDescription>The person must already have a GenzProp account.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <Field label="User’s email" htmlFor="a-email">
              <Input id="a-email" type="email" className={inputClass} value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="partner@example.com" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Referral code" hint="Customers enter this at signup." htmlFor="a-code">
                <Input
                  id="a-code"
                  className={`${inputClass} font-mono uppercase`}
                  value={form.referralCode}
                  onChange={(e) => setForm((f) => ({ ...f, referralCode: e.target.value.toUpperCase() }))}
                  placeholder="JANE10"
                />
              </Field>
              <Field label="Commission (%)" hint="Of each referred order." htmlFor="a-rate">
                <Input
                  id="a-rate"
                  type="number"
                  min={1}
                  max={100}
                  className={inputClass}
                  value={form.commissionRate}
                  onChange={(e) => setForm((f) => ({ ...f, commissionRate: e.target.value }))}
                />
              </Field>
            </div>
            {createError && <Notice tone="error">{createError}</Notice>}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" className="rounded-xl" onClick={() => setEnrollOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="rounded-xl" disabled={creating}>
                {creating ? "Enrolling…" : "Enroll affiliate"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {dialog}
    </AdminShell>
  )
}
