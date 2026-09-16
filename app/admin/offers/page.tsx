"use client"

import { useEffect, useMemo, useState } from "react"
import { AdminShell } from "@/components/admin/admin-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  adminListOffers,
  adminCreateOffer,
  adminUpdateOffer,
  adminDeleteOffer,
  adminListPlans,
  type AdminOffer,
  type AdminOfferInput,
  type OfferType,
  type ChallengePlan,
} from "@/lib/api/app-client"
import { ApiClientError } from "@/lib/api/client"
import {
  DataTable,
  EmptyBlock,
  ErrorBlock,
  Field,
  FilterTabs,
  LoadingBlock,
  NativeSelect,
  Notice,
  Panel,
  SearchBox,
  StatusPill,
  Toolbar,
  inputClass,
  shortDate,
  useConfirm,
} from "@/components/admin/admin-ui"
import { Check, Copy, Gift, Pencil, Plus, Trash2 } from "lucide-react"
import { OFFER_TYPE_META as TYPE_META, OFFER_TYPE_ORDER as TYPE_ORDER } from "@/lib/offers-shared"

type Filter = "all" | "active" | "inactive" | "scheduled" | "expired"

const EMPTY_FORM = {
  code: "",
  name: "",
  type: "bogo" as OfferType,
  planIds: [] as string[],
  startsAt: "",
  expiresAt: "",
  maxRedemptions: "",
  perUserLimit: "",
  description: "",
}

type FormState = typeof EMPTY_FORM

const isExpired = (o: AdminOffer) => !!o.expiresAt && new Date(o.expiresAt).getTime() < Date.now()
const isScheduled = (o: AdminOffer) => !!o.startsAt && new Date(o.startsAt).getTime() > Date.now()
const isLive = (o: AdminOffer) => o.status === "active" && !isExpired(o) && !isScheduled(o)

/** ISO timestamp -> value for <input type="date">. */
const toDateInput = (iso: string | null) => (iso ? new Date(iso).toISOString().slice(0, 10) : "")
const fromDateInput = (v: string) => (v ? new Date(v).toISOString() : null)

const usd = (n: number) => `$${n.toLocaleString("en-US", { maximumFractionDigits: 2 })}`

function offerValueLabel(o: AdminOffer) {
  return TYPE_META[o.type].label
}

export default function AdminOffersPage() {
  const [offers, setOffers] = useState<AdminOffer[]>([])
  const [plans, setPlans] = useState<ChallengePlan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<Filter>("all")
  const [search, setSearch] = useState("")
  const [editing, setEditing] = useState<AdminOffer | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [notice, setNotice] = useState<{ tone: "success" | "error"; text: string } | null>(null)
  const { confirm, dialog } = useConfirm()

  const refresh = async () => {
    setLoading(true)
    setError(null)
    try {
      const [offerRes, planRes] = await Promise.all([adminListOffers(), adminListPlans()])
      setOffers(offerRes.offers)
      setPlans(planRes.plans)
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Failed to load offers.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
  }, [])

  const plansById = useMemo(() => new Map(plans.map((p) => [p.id, p])), [plans])
  const sortedPlans = useMemo(
    () => [...plans].sort((a, b) => a.name.localeCompare(b.name) || a.size - b.size),
    [plans],
  )

  const counts = useMemo(
    () => ({
      all: offers.length,
      active: offers.filter(isLive).length,
      inactive: offers.filter((o) => o.status !== "active").length,
      scheduled: offers.filter(isScheduled).length,
      expired: offers.filter(isExpired).length,
    }),
    [offers],
  )

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase()
    return offers.filter((o) => {
      if (filter === "active" && !isLive(o)) return false
      if (filter === "inactive" && o.status === "active") return false
      if (filter === "scheduled" && !isScheduled(o)) return false
      if (filter === "expired" && !isExpired(o)) return false
      return !q || (o.code ?? "").toLowerCase().includes(q) || o.name.toLowerCase().includes(q)
    })
  }, [offers, filter, search])

  const openCreate = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setFormError(null)
    setDialogOpen(true)
  }

  const openEdit = (o: AdminOffer) => {
    setEditing(o)
    setForm({
      code: o.code ?? "",
      name: o.name,
      type: o.type,
      planIds: o.planIds ?? [],
      startsAt: toDateInput(o.startsAt),
      expiresAt: toDateInput(o.expiresAt),
      maxRedemptions: o.maxRedemptions == null ? "" : String(o.maxRedemptions),
      perUserLimit: o.perUserLimit == null ? "" : String(o.perUserLimit),
      description: o.description ?? "",
    })
    setFormError(null)
    setDialogOpen(true)
  }

  const togglePlan = (planId: string) =>
    setForm((f) => ({
      ...f,
      planIds: f.planIds.includes(planId) ? f.planIds.filter((id) => id !== planId) : [...f.planIds, planId],
    }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!form.name.trim()) return setFormError("Enter a name for this offer.")
    if (form.startsAt && form.expiresAt && new Date(form.startsAt) > new Date(form.expiresAt)) {
      return setFormError("The start date must be before the end date.")
    }

    const payload: AdminOfferInput = {
      code: form.code.trim().toUpperCase() || null,
      name: form.name.trim(),
      type: form.type,
      planIds: form.planIds,
      status: editing?.status ?? "active",
      startsAt: fromDateInput(form.startsAt),
      expiresAt: fromDateInput(form.expiresAt),
      maxRedemptions: form.maxRedemptions ? Number(form.maxRedemptions) : null,
      perUserLimit: form.perUserLimit ? Number(form.perUserLimit) : null,
      description: form.description.trim() || null,
    }

    setSaving(true)
    try {
      if (editing) {
        await adminUpdateOffer(editing.id, payload)
        setNotice({ tone: "success", text: `Offer ${payload.name} updated.` })
      } else {
        await adminCreateOffer(payload)
        setNotice({ tone: "success", text: `Offer ${payload.name} created.` })
      }
      setDialogOpen(false)
      setForm(EMPTY_FORM)
      setEditing(null)
      await refresh()
    } catch (err) {
      setFormError(err instanceof ApiClientError ? err.message : "Failed to save offer.")
    } finally {
      setSaving(false)
    }
  }

  const toggleStatus = async (offer: AdminOffer) => {
    setBusyId(offer.id)
    try {
      await adminUpdateOffer(offer.id, { status: offer.status === "active" ? "inactive" : "active" })
      await refresh()
    } catch (err) {
      setNotice({ tone: "error", text: err instanceof ApiClientError ? err.message : "Failed to update offer." })
    } finally {
      setBusyId(null)
    }
  }

  const handleDelete = async (offer: AdminOffer) => {
    const { ok } = await confirm({
      title: `Delete offer ${offer.name}?`,
      description:
        "New orders will stop receiving this perk. Perks already granted to existing orders are kept. To pause it instead, switch it off.",
      confirmLabel: "Delete offer",
      tone: "danger",
    })
    if (!ok) return
    setBusyId(offer.id)
    try {
      await adminDeleteOffer(offer.id)
      setNotice({ tone: "success", text: `Offer ${offer.code} deleted.` })
      await refresh()
    } catch (err) {
      setNotice({ tone: "error", text: err instanceof ApiClientError ? err.message : "Failed to delete offer." })
    } finally {
      setBusyId(null)
    }
  }

  const copyCode = (code: string) => {
    void navigator.clipboard?.writeText(code)
    setCopied(code)
    setTimeout(() => setCopied(null), 1500)
  }

  const appliesToLabel = (o: AdminOffer) => {
    if (!o.planIds?.length) return "All plans"
    const names = o.planIds.map((id) => {
      const plan = plansById.get(id)
      return plan ? `${plan.name} ${usd(plan.size)}` : "Removed plan"
    })
    return names.join(", ")
  }

  return (
    <AdminShell
      title="Offers"
      description="Perks that apply automatically to every matching order — no code for customers to type. For money off, use Coupons."
      actions={
        <Button className="h-10 gap-2 rounded-xl" onClick={openCreate}>
          <Plus className="h-4 w-4" /> New offer
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
                { value: "all", label: "All", count: counts.all },
                { value: "active", label: "Usable now", count: counts.active },
                { value: "scheduled", label: "Scheduled", count: counts.scheduled },
                { value: "inactive", label: "Switched off", count: counts.inactive },
                { value: "expired", label: "Expired", count: counts.expired },
              ]}
            />
            <SearchBox value={search} onChange={setSearch} placeholder="Search code or name" />
          </Toolbar>

          {loading && offers.length === 0 ? (
            <LoadingBlock label="Loading offers…" />
          ) : error ? (
            <ErrorBlock message={error} onRetry={() => void refresh()} />
          ) : visible.length === 0 ? (
            <EmptyBlock
              icon={Gift}
              title={offers.length ? "No matching offers" : "No offers yet"}
              description={
                offers.length
                  ? "Try another filter or clear the search."
                  : "Create a BOGO, free retry, or discount code and choose which plans it applies to."
              }
            />
          ) : (
            <DataTable head={["Offer", "Perk", "Applies to", "Used", "Runs", "Status", "On / off"]}>
              {visible.map((o) => {
                const expired = isExpired(o)
                const scheduled = isScheduled(o)
                return (
                  <tr key={o.id}>
                    <td>
                      <p className="text-sm font-semibold text-foreground">{o.name}</p>
                      {o.code ? (
                        <button
                          type="button"
                          onClick={() => copyCode(o.code!)}
                          className="group mt-1 inline-flex items-center gap-1.5 rounded border border-dashed border-border bg-muted/50 px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground hover:border-primary/40"
                          title="Copy internal reference"
                        >
                          {o.code}
                          {copied === o.code ? (
                            <Check className="h-3 w-3 text-emerald-600" />
                          ) : (
                            <Copy className="h-3 w-3 group-hover:text-foreground" />
                          )}
                        </button>
                      ) : null}
                    </td>
                    <td>
                      <span className="text-sm font-semibold text-foreground">{offerValueLabel(o)}</span>
                      <p className="mt-0.5 max-w-[260px] text-xs text-muted-foreground">{TYPE_META[o.type].blurb}</p>
                    </td>
                    <td className="max-w-[220px] text-xs text-muted-foreground">
                      {o.planIds?.length ? (
                        <span>{appliesToLabel(o)}</span>
                      ) : (
                        <span className="font-medium text-foreground">All plans</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap text-sm tabular-nums text-foreground">
                      {o.timesRedeemed}
                      {o.maxRedemptions != null && <span className="text-muted-foreground"> / {o.maxRedemptions}</span>}
                      {o.perUserLimit != null && (
                        <p className="text-xs text-muted-foreground">max {o.perUserLimit} per customer</p>
                      )}
                    </td>
                    <td className="whitespace-nowrap text-xs text-muted-foreground">
                      {o.startsAt ? shortDate(o.startsAt) : "Now"} → {o.expiresAt ? shortDate(o.expiresAt) : "No end"}
                    </td>
                    <td>
                      {expired ? (
                        <StatusPill status="expired" />
                      ) : scheduled ? (
                        <StatusPill label="Scheduled" tone="info" />
                      ) : (
                        <StatusPill status={o.status === "active" ? "active" : "inactive"} />
                      )}
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-2">
                        <Switch
                          checked={o.status === "active"}
                          disabled={busyId === o.id}
                          onCheckedChange={() => void toggleStatus(o)}
                          aria-label={o.status === "active" ? `Switch off ${o.code}` : `Switch on ${o.code}`}
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
                          disabled={busyId === o.id}
                          onClick={() => openEdit(o)}
                          aria-label={`Edit ${o.code}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 rounded-lg text-muted-foreground hover:bg-red-50 hover:text-red-600"
                          disabled={busyId === o.id}
                          onClick={() => void handleDelete(o)}
                          aria-label={`Delete ${o.code}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </DataTable>
          )}
        </Panel>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? `Edit ${editing.code}` : "New offer"}</DialogTitle>
            <DialogDescription>
              While this offer is switched on, every matching order gets it automatically — there is nothing for the
              customer to enter. It is shown at checkout as included, and granted once the order is paid.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Name" hint="Shown to the customer at checkout." htmlFor="o-name">
                <Input
                  id="o-name"
                  className={inputClass}
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="New year buy one get one"
                />
              </Field>
              <Field label="Reference" hint="Optional, for your reports. Customers never type this." htmlFor="o-code">
                <Input
                  id="o-code"
                  className={`${inputClass} font-mono uppercase`}
                  value={form.code}
                  onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                  placeholder="BOGO2026"
                />
              </Field>
            </div>

            <Field label="Offer type" hint={TYPE_META[form.type].blurb} htmlFor="o-type">
              <NativeSelect
                id="o-type"
                value={form.type}
                onChange={(v) => setForm((f) => ({ ...f, type: v as OfferType }))}
              >
                {TYPE_ORDER.map((t) => (
                  <option key={t} value={t}>
                    {TYPE_META[t].label}
                  </option>
                ))}
              </NativeSelect>
            </Field>

            {/* Plan targeting */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">Applies to</p>
                {form.planIds.length > 0 && (
                  <button
                    type="button"
                    className="text-xs font-medium text-primary hover:underline"
                    onClick={() => setForm((f) => ({ ...f, planIds: [] }))}
                  >
                    Clear — apply to all plans
                  </button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {form.planIds.length === 0
                  ? "Nothing selected, so this code works on every plan. Tick plans to restrict it."
                  : `Only works on the ${form.planIds.length} selected plan${form.planIds.length === 1 ? "" : "s"}.`}
              </p>
              <div className="max-h-52 overflow-y-auto rounded-xl border border-border">
                {sortedPlans.length === 0 ? (
                  <p className="px-3 py-4 text-sm text-muted-foreground">No plans found.</p>
                ) : (
                  <ul className="divide-y divide-border">
                    {sortedPlans.map((p) => {
                      const checked = form.planIds.includes(p.id)
                      return (
                        <li key={p.id}>
                          <label className="flex cursor-pointer items-center gap-3 px-3 py-2.5 hover:bg-muted/40">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => togglePlan(p.id)}
                              className="h-4 w-4 rounded border-input accent-[#5235ff]"
                            />
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-medium text-foreground">{p.name}</span>
                              <span className="block text-xs text-muted-foreground">
                                {usd(p.size)} account · {usd(p.price)}
                                {p.platform ? ` · ${p.platform.toUpperCase()}` : ""}
                              </span>
                            </span>
                          </label>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Starts on" hint="Leave empty to start immediately." htmlFor="o-start">
                <Input
                  id="o-start"
                  type="date"
                  className={inputClass}
                  value={form.startsAt}
                  onChange={(e) => setForm((f) => ({ ...f, startsAt: e.target.value }))}
                />
              </Field>
              <Field label="Expires on" hint="Leave empty for no expiry." htmlFor="o-exp">
                <Input
                  id="o-exp"
                  type="date"
                  className={inputClass}
                  value={form.expiresAt}
                  onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))}
                />
              </Field>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Total redemptions" hint="Leave empty for unlimited." htmlFor="o-max">
                <Input
                  id="o-max"
                  type="number"
                  min={1}
                  className={inputClass}
                  value={form.maxRedemptions}
                  onChange={(e) => setForm((f) => ({ ...f, maxRedemptions: e.target.value }))}
                  placeholder="Unlimited"
                />
              </Field>
              <Field label="Per customer" hint="Leave empty for unlimited." htmlFor="o-per">
                <Input
                  id="o-per"
                  type="number"
                  min={1}
                  className={inputClass}
                  value={form.perUserLimit}
                  onChange={(e) => setForm((f) => ({ ...f, perUserLimit: e.target.value }))}
                  placeholder="Unlimited"
                />
              </Field>
            </div>

            <Field label="Notes" hint="Optional. For your team only." htmlFor="o-desc">
              <Input
                id="o-desc"
                className={inputClass}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Ran for the January campaign"
              />
            </Field>

            {formError && <Notice tone="error">{formError}</Notice>}

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" className="rounded-xl" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="rounded-xl" disabled={saving}>
                {saving ? "Saving…" : editing ? "Save changes" : "Create offer"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {dialog}
    </AdminShell>
  )
}
