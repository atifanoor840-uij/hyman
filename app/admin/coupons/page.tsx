"use client"

import { useEffect, useMemo, useState } from "react"
import { AdminShell } from "@/components/admin/admin-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  adminListCoupons,
  adminCreateCoupon,
  adminUpdateCoupon,
  adminDeleteCoupon,
  type AdminCoupon,
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
  SearchBox,
  StatusPill,
  Toolbar,
  inputClass,
  shortDate,
  useConfirm,
} from "@/components/admin/admin-ui"
import { Check, Copy, Percent, Plus, Trash2 } from "lucide-react"

type Filter = "all" | "active" | "inactive" | "expired"

const EMPTY_FORM = { code: "", discountPercent: "", expiresAt: "", showAtCheckout: false }

const isExpired = (c: AdminCoupon) => !!c.expiresAt && new Date(c.expiresAt).getTime() < Date.now()

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<AdminCoupon[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<Filter>("all")
  const [search, setSearch] = useState("")
  const [createOpen, setCreateOpen] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [busyCode, setBusyCode] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [notice, setNotice] = useState<{ tone: "success" | "error"; text: string } | null>(null)
  const { confirm, dialog } = useConfirm()

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

  const counts = useMemo(
    () => ({
      all: coupons.length,
      active: coupons.filter((c) => c.status === "active" && !isExpired(c)).length,
      inactive: coupons.filter((c) => c.status !== "active").length,
      expired: coupons.filter(isExpired).length,
    }),
    [coupons],
  )

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase()
    return coupons.filter((c) => {
      if (filter === "active" && !(c.status === "active" && !isExpired(c))) return false
      if (filter === "inactive" && c.status === "active") return false
      if (filter === "expired" && !isExpired(c)) return false
      return !q || c.code.toLowerCase().includes(q)
    })
  }, [coupons, filter, search])

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
        showAtCheckout: form.showAtCheckout,
      })
      setNotice({ tone: "success", text: `Coupon ${form.code.trim()} created.` })
      setForm(EMPTY_FORM)
      setCreateOpen(false)
      await refresh()
    } catch (err) {
      setCreateError(err instanceof ApiClientError ? err.message : "Failed to create coupon.")
    } finally {
      setCreating(false)
    }
  }

  const toggleVisibility = async (coupon: AdminCoupon) => {
    setBusyCode(coupon.code)
    try {
      await adminUpdateCoupon(coupon.code, { showAtCheckout: !coupon.showAtCheckout })
      await refresh()
    } catch (err) {
      setNotice({ tone: "error", text: err instanceof ApiClientError ? err.message : "Failed to update coupon." })
    } finally {
      setBusyCode(null)
    }
  }

  const toggleStatus = async (coupon: AdminCoupon) => {
    setBusyCode(coupon.code)
    try {
      await adminUpdateCoupon(coupon.code, { status: coupon.status === "active" ? "inactive" : "active" })
      await refresh()
    } catch (err) {
      setNotice({ tone: "error", text: err instanceof ApiClientError ? err.message : "Failed to update coupon." })
    } finally {
      setBusyCode(null)
    }
  }

  const handleDelete = async (code: string) => {
    const { ok } = await confirm({
      title: `Delete coupon ${code}?`,
      description: "Customers won’t be able to use this code any more. To pause it instead, switch it off.",
      confirmLabel: "Delete coupon",
      tone: "danger",
    })
    if (!ok) return
    setBusyCode(code)
    try {
      await adminDeleteCoupon(code)
      setNotice({ tone: "success", text: `Coupon ${code} deleted.` })
      await refresh()
    } catch (err) {
      setNotice({ tone: "error", text: err instanceof ApiClientError ? err.message : "Failed to delete coupon." })
    } finally {
      setBusyCode(null)
    }
  }

  const copyCode = (code: string) => {
    void navigator.clipboard?.writeText(code)
    setCopied(code)
    setTimeout(() => setCopied(null), 1500)
  }

  return (
    <AdminShell
      title="Coupons"
      description="Discount codes customers can enter at checkout."
      actions={
        <Button
          className="h-10 gap-2 rounded-xl"
          onClick={() => {
            setForm(EMPTY_FORM)
            setCreateError(null)
            setCreateOpen(true)
          }}
        >
          <Plus className="h-4 w-4" /> New coupon
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
                { value: "inactive", label: "Switched off", count: counts.inactive },
                { value: "expired", label: "Expired", count: counts.expired },
              ]}
            />
            <SearchBox value={search} onChange={setSearch} placeholder="Search code" />
          </Toolbar>

          {loading && coupons.length === 0 ? (
            <LoadingBlock label="Loading coupons…" />
          ) : error ? (
            <ErrorBlock message={error} onRetry={() => void refresh()} />
          ) : visible.length === 0 ? (
            <EmptyBlock
              icon={Percent}
              title={coupons.length ? "No matching coupons" : "No coupons yet"}
              description={coupons.length ? "Try another filter or clear the search." : "Create a discount code to share with customers."}
            />
          ) : (
            <DataTable head={["Code", "Discount", "Status", "Shown at checkout", "Expires", "Created", "On / off"]}>
              {visible.map((c) => {
                const expired = isExpired(c)
                return (
                  <tr key={c.code}>
                    <td>
                      <button
                        type="button"
                        onClick={() => copyCode(c.code)}
                        className="group inline-flex items-center gap-2 rounded-lg border border-dashed border-border bg-muted/50 px-2.5 py-1 font-mono text-sm font-semibold text-foreground hover:border-primary/40"
                        title="Copy code"
                      >
                        {c.code}
                        {copied === c.code ? (
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground" />
                        )}
                      </button>
                    </td>
                    <td className="text-base font-semibold tabular-nums text-foreground">{c.discountPercent}% off</td>
                    <td>{expired ? <StatusPill status="expired" /> : <StatusPill status={c.status === "active" ? "active" : "inactive"} />}</td>
                    <td>
                      <Switch
                        checked={c.showAtCheckout}
                        disabled={busyCode === c.code}
                        onCheckedChange={() => void toggleVisibility(c)}
                        aria-label={c.showAtCheckout ? `Hide ${c.code} at checkout` : `Show ${c.code} at checkout`}
                      />
                    </td>
                    <td className="whitespace-nowrap text-xs text-muted-foreground">{c.expiresAt ? shortDate(c.expiresAt) : "Never"}</td>
                    <td className="whitespace-nowrap text-xs text-muted-foreground">{shortDate(c.createdAt)}</td>
                    <td>
                      <div className="flex items-center justify-end gap-2">
                        <Switch
                          checked={c.status === "active"}
                          disabled={busyCode === c.code}
                          onCheckedChange={() => void toggleStatus(c)}
                          aria-label={c.status === "active" ? `Switch off ${c.code}` : `Switch on ${c.code}`}
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 rounded-lg text-muted-foreground hover:bg-red-50 hover:text-red-600"
                          disabled={busyCode === c.code}
                          onClick={() => void handleDelete(c.code)}
                          aria-label={`Delete ${c.code}`}
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

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New coupon</DialogTitle>
            <DialogDescription>Customers enter this code at checkout to get the discount.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <Field label="Code" hint="Letters and numbers, shown in capitals." htmlFor="c-code">
              <Input
                id="c-code"
                className={`${inputClass} font-mono uppercase`}
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                placeholder="WELCOME10"
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Discount (%)" htmlFor="c-discount">
                <Input
                  id="c-discount"
                  type="number"
                  min={1}
                  max={100}
                  className={inputClass}
                  value={form.discountPercent}
                  onChange={(e) => setForm((f) => ({ ...f, discountPercent: e.target.value }))}
                  placeholder="10"
                />
              </Field>
              <Field label="Expires on" hint="Leave empty for no expiry." htmlFor="c-exp">
                <Input id="c-exp" type="date" className={inputClass} value={form.expiresAt} onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))} />
              </Field>
            </div>
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border p-3">
              <Switch
                checked={form.showAtCheckout}
                onCheckedChange={(v) => setForm((f) => ({ ...f, showAtCheckout: v }))}
                aria-label="Show at checkout"
              />
              <span className="min-w-0">
                <span className="block text-sm font-medium text-foreground">Show at checkout</span>
                <span className="block text-xs text-muted-foreground">
                  Lists this code in the checkout sidebar so customers can apply it with one tap. Leave off for private
                  codes — they still work when typed in.
                </span>
              </span>
            </label>
            {createError && <Notice tone="error">{createError}</Notice>}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" className="rounded-xl" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="rounded-xl" disabled={creating}>
                {creating ? "Creating…" : "Create coupon"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {dialog}
    </AdminShell>
  )
}
