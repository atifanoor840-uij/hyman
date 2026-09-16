"use client"

import { useEffect, useMemo, useState } from "react"
import { AdminShell } from "@/components/admin/admin-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  adminListPlans,
  adminCreatePlan,
  adminUpdatePlan,
  adminDeletePlan,
  type ChallengePlan,
} from "@/lib/api/app-client"
import { ApiClientError } from "@/lib/api/client"
import {
  DataTable,
  EmptyBlock,
  ErrorBlock,
  Field,
  FilterTabs,
  FormSection,
  LoadingBlock,
  NativeSelect,
  Notice,
  Panel,
  SearchBox,
  Toolbar,
  inputClass,
  money,
  useConfirm,
} from "@/components/admin/admin-ui"
import { Pencil, Plus, Tag, Trash2 } from "lucide-react"

const ACCOUNT_TYPES = ["Genz Step1", "Genz Step2", "Genz Instant"]
const ACCOUNT_SIZES = [3000, 5000, 10000, 50000, 100000, 200000, 500000]

const EMPTY_FORM = {
  name: ACCOUNT_TYPES[0],
  size: "10000",
  price: "",
}

type FormState = typeof EMPTY_FORM

function toPlanInput(f: FormState) {
  return {
    name: f.name.trim(),
    size: Number(f.size),
    price: Number(f.price),
  }
}

export default function AdminPricingPage() {
  const [plans, setPlans] = useState<ChallengePlan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [planType, setPlanType] = useState("all")
  /** `null` = closed, `"new"` = creating, otherwise the plan being edited. */
  const [editing, setEditing] = useState<ChallengePlan | "new" | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [isCustomSize, setIsCustomSize] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [notice, setNotice] = useState<{ tone: "success" | "error"; text: string } | null>(null)
  const { confirm, dialog } = useConfirm()

  const refresh = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await adminListPlans()
      setPlans(res.plans)
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Failed to load pricing catalog.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  const planNames = useMemo(() => Array.from(new Set(plans.map((p) => p.name))).sort(), [plans])

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase()
    return plans
      .filter((p) => (planType === "all" || p.name === planType) && (!q || p.name.toLowerCase().includes(q) || String(p.size).includes(q)))
      .sort((a, b) => a.name.localeCompare(b.name) || a.size - b.size)
  }, [plans, planType, search])

  const openCreate = () => {
    setForm(EMPTY_FORM)
    setIsCustomSize(false)
    setSaveError(null)
    setEditing("new")
  }

  const openEdit = (p: ChallengePlan) => {
    setForm({
      name: p.name,
      size: String(p.size),
      price: String(p.price),
    })
    setIsCustomSize(!ACCOUNT_SIZES.includes(p.size))
    setSaveError(null)
    setEditing(p)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editing) return
    const input = toPlanInput(form)
    if (!input.name || !Number.isFinite(input.size) || input.size <= 0 || !Number.isFinite(input.price) || input.price < 0) {
      setSaveError("Account type, a positive account size, and a price of 0 or more are required.")
      return
    }
    setSaving(true)
    setSaveError(null)
    try {
      if (editing === "new")
        await adminCreatePlan({ ...input, profitTargetP1: 0, profitTargetP2: 0, maxDailyLoss: 0, maxTotalLoss: 0, profitSplit: 0, platform: null })
      else await adminUpdatePlan(editing.id, input)
      setNotice({ tone: "success", text: editing === "new" ? `Plan “${input.name}” created.` : `Plan “${input.name}” updated.` })
      setEditing(null)
      await refresh()
    } catch (err) {
      setSaveError(err instanceof ApiClientError ? err.message : "Failed to save plan.")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (p: ChallengePlan) => {
    const { ok } = await confirm({
      title: `Delete ${p.name} ${money(p.size, 0)}?`,
      description: "Customers will no longer be able to buy this plan. Existing orders are not affected.",
      confirmLabel: "Delete plan",
      tone: "danger",
    })
    if (!ok) return
    try {
      await adminDeletePlan(p.id)
      setNotice({ tone: "success", text: `Plan “${p.name}” deleted.` })
      await refresh()
    } catch (err) {
      setNotice({ tone: "error", text: err instanceof ApiClientError ? err.message : "Failed to delete plan." })
    }
  }

  const set = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [key]: e.target.value }))
  const numberInput = (key: keyof FormState, id: string, placeholder?: string) => (
    <Input id={id} type="number" inputMode="decimal" className={inputClass} value={form[key]} onChange={set(key)} placeholder={placeholder} />
  )

  return (
    <AdminShell
      title="Pricing"
      description="The challenge plans customers can buy on the Buy Challenge page."
      actions={
        <Button className="h-10 gap-2 rounded-xl" onClick={openCreate}>
          <Plus className="h-4 w-4" /> New plan
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
            <FilterTabs<string>
              value={planType}
              onChange={setPlanType}
              options={[{ value: "all", label: "All plans", count: plans.length }, ...planNames.map((n) => ({ value: n, label: n, count: plans.filter((p) => p.name === n).length }))]}
            />
            <SearchBox value={search} onChange={setSearch} placeholder="Search account type or size" />
          </Toolbar>

          {loading && plans.length === 0 ? (
            <LoadingBlock label="Loading plans…" />
          ) : error ? (
            <ErrorBlock message={error} onRetry={() => void refresh()} />
          ) : visible.length === 0 ? (
            <EmptyBlock
              icon={Tag}
              title={plans.length ? "No matching plans" : "No plans yet"}
              description={plans.length ? "Try another filter or clear the search." : "Create your first plan so customers can buy a challenge."}
              action={
                !plans.length && (
                  <Button className="gap-2 rounded-xl" onClick={openCreate}>
                    <Plus className="h-4 w-4" /> New plan
                  </Button>
                )
              }
            />
          ) : (
            <DataTable head={["Account type", "Account size", "Price", ""]}>
              {visible.map((p) => (
                <tr key={p.id}>
                  <td className="font-medium text-foreground">{p.name}</td>
                  <td className="text-sm tabular-nums">{money(p.size, 0)}</td>
                  <td className="text-base font-semibold tabular-nums text-foreground">{money(p.price)}</td>
                  <td>
                    <div className="flex justify-end gap-1.5">
                      <Button size="sm" variant="outline" className="h-8 gap-1.5 rounded-lg border-border" onClick={() => openEdit(p)}>
                        <Pencil className="h-3.5 w-3.5" /> Edit
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 rounded-lg text-muted-foreground hover:bg-red-50 hover:text-red-600"
                        onClick={() => void handleDelete(p)}
                        aria-label={`Delete ${p.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </DataTable>
          )}
        </Panel>
      </div>

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing === "new" ? "New plan" : "Edit plan"}</DialogTitle>
            <DialogDescription>Set the account type, account size, and price.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-6">
            <FormSection title="Plan">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Account type" className="sm:col-span-2" htmlFor="p-name">
                  <NativeSelect id="p-name" value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))}>
                    {ACCOUNT_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                    {!ACCOUNT_TYPES.includes(form.name) && <option value={form.name}>{form.name}</option>}
                  </NativeSelect>
                </Field>
                <Field label="Account size ($)" htmlFor="p-size-select">
                  <NativeSelect
                    id="p-size-select"
                    value={isCustomSize ? "custom" : form.size}
                    onChange={(v) => {
                      if (v === "custom") {
                        setIsCustomSize(true)
                        if (ACCOUNT_SIZES.includes(Number(form.size))) {
                          setForm((f) => ({ ...f, size: "" }))
                        }
                      } else {
                        setIsCustomSize(false)
                        setForm((f) => ({ ...f, size: v }))
                      }
                    }}
                  >
                    {ACCOUNT_SIZES.map((s) => (
                      <option key={s} value={String(s)}>
                        {money(s, 0)}
                      </option>
                    ))}
                    <option value="custom">Custom size…</option>
                  </NativeSelect>
                </Field>
                <Field label="Price ($)" htmlFor="p-price">
                  {numberInput("price", "p-price", "89")}
                </Field>
                {isCustomSize && (
                  <Field label="Custom size ($)" className="sm:col-span-2" htmlFor="p-size-custom">
                    {numberInput("size", "p-size-custom", "Enter custom size, e.g. 25000")}
                  </Field>
                )}
              </div>
            </FormSection>

            {saveError && <Notice tone="error">{saveError}</Notice>}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" className="rounded-xl" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button type="submit" className="rounded-xl" disabled={saving}>
                {saving ? "Saving…" : editing === "new" ? "Create plan" : "Save changes"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {dialog}
    </AdminShell>
  )
}
