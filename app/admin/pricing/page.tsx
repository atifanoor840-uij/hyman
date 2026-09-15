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

const EMPTY_FORM = {
  name: "",
  size: "",
  price: "",
  profitTargetP1: "",
  profitTargetP2: "",
  maxDailyLoss: "",
  maxTotalLoss: "",
  profitSplit: "80",
  platform: "",
}

type FormState = typeof EMPTY_FORM

function toPlanInput(f: FormState) {
  return {
    name: f.name.trim(),
    size: Number(f.size),
    price: Number(f.price),
    profitTargetP1: Number(f.profitTargetP1) || 0,
    profitTargetP2: Number(f.profitTargetP2) || 0,
    maxDailyLoss: Number(f.maxDailyLoss) || 0,
    maxTotalLoss: Number(f.maxTotalLoss) || 0,
    profitSplit: Number(f.profitSplit) || 0,
    platform: f.platform.trim() || null,
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
    setSaveError(null)
    setEditing("new")
  }

  const openEdit = (p: ChallengePlan) => {
    setForm({
      name: p.name,
      size: String(p.size),
      price: String(p.price),
      profitTargetP1: String(p.profitTargetP1),
      profitTargetP2: String(p.profitTargetP2),
      maxDailyLoss: String(p.maxDailyLoss),
      maxTotalLoss: String(p.maxTotalLoss),
      profitSplit: String(p.profitSplit),
      platform: p.platform ?? "",
    })
    setSaveError(null)
    setEditing(p)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editing) return
    const input = toPlanInput(form)
    if (!input.name || !Number.isFinite(input.size) || input.size <= 0 || !Number.isFinite(input.price) || input.price < 0) {
      setSaveError("Name, a positive account size, and a price of 0 or more are required.")
      return
    }
    setSaving(true)
    setSaveError(null)
    try {
      if (editing === "new") await adminCreatePlan(input)
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
            <SearchBox value={search} onChange={setSearch} placeholder="Search name or size" />
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
            <DataTable head={["Plan", "Price", "Profit targets", "Loss limits", "Profit split", "Platform", ""]}>
              {visible.map((p) => (
                <tr key={p.id}>
                  <td>
                    <p className="font-medium text-foreground">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{money(p.size, 0)} account</p>
                  </td>
                  <td className="text-base font-semibold tabular-nums text-foreground">{money(p.price)}</td>
                  <td className="text-sm">
                    <span className="text-muted-foreground">P1</span> {p.profitTargetP1}%
                    <span className="mx-1.5 text-border">|</span>
                    <span className="text-muted-foreground">P2</span> {p.profitTargetP2 ? `${p.profitTargetP2}%` : "—"}
                  </td>
                  <td className="text-sm">
                    <span className="text-muted-foreground">Daily</span> {p.maxDailyLoss}%
                    <span className="mx-1.5 text-border">|</span>
                    <span className="text-muted-foreground">Max</span> {p.maxTotalLoss}%
                  </td>
                  <td className="text-sm tabular-nums">{p.profitSplit}%</td>
                  <td className="text-xs uppercase text-muted-foreground">{p.platform ?? "Any"}</td>
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
            <DialogDescription>Percentages are of the starting account balance.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-6">
            <FormSection title="Basics">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Plan name" hint="Plans with the same name are grouped together." className="sm:col-span-2" htmlFor="p-name">
                  <Input id="p-name" className={inputClass} value={form.name} onChange={set("name")} placeholder="e.g. Two Step" />
                </Field>
                <Field label="Account size ($)" htmlFor="p-size">
                  {numberInput("size", "p-size", "10000")}
                </Field>
                <Field label="Price ($)" htmlFor="p-price">
                  {numberInput("price", "p-price", "89")}
                </Field>
                <Field label="Platform" className="sm:col-span-2" htmlFor="p-platform">
                  <NativeSelect id="p-platform" value={form.platform} onChange={(v) => setForm((f) => ({ ...f, platform: v }))}>
                    <option value="">Any platform</option>
                    <option value="mt4">MT4 only</option>
                    <option value="mt5">MT5 only</option>
                    {!["", "mt4", "mt5"].includes(form.platform) && <option value={form.platform}>{form.platform.toUpperCase()} only</option>}
                  </NativeSelect>
                </Field>
              </div>
            </FormSection>

            <FormSection title="Trading rules">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Phase 1 target (%)" htmlFor="p-t1">
                  {numberInput("profitTargetP1", "p-t1", "8")}
                </Field>
                <Field label="Phase 2 target (%)" hint="Use 0 for one-step plans." htmlFor="p-t2">
                  {numberInput("profitTargetP2", "p-t2", "5")}
                </Field>
                <Field label="Max daily loss (%)" htmlFor="p-dl">
                  {numberInput("maxDailyLoss", "p-dl", "5")}
                </Field>
                <Field label="Max total loss (%)" htmlFor="p-tl">
                  {numberInput("maxTotalLoss", "p-tl", "10")}
                </Field>
                <Field label="Profit split (%)" hint="Trader’s share of profits." htmlFor="p-split">
                  {numberInput("profitSplit", "p-split", "80")}
                </Field>
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
