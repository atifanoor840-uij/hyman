"use client"

import { useEffect, useState } from "react"
import { AdminShell } from "@/components/admin/admin-shell"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import EmptyState from "@/components/ui/empty-state"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  adminListPlans,
  adminCreatePlan,
  adminUpdatePlan,
  adminDeletePlan,
  type ChallengePlan,
} from "@/lib/api/app-client"
import { ApiClientError } from "@/lib/api/client"
import { Loader2, ShieldAlert, Tag, Trash2, Plus } from "lucide-react"

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
  const [createOpen, setCreateOpen] = useState(false)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [editing, setEditing] = useState<ChallengePlan | null>(null)
  const [editForm, setEditForm] = useState<FormState>(EMPTY_FORM)

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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaveError(null)
    const input = toPlanInput(form)
    if (!input.name || !Number.isFinite(input.size) || input.size <= 0 || !Number.isFinite(input.price) || input.price < 0) {
      setSaveError("Name, a positive size, and a non-negative price are required.")
      return
    }
    setSaving(true)
    try {
      await adminCreatePlan(input)
      setForm(EMPTY_FORM)
      setCreateOpen(false)
      await refresh()
    } catch (err) {
      setSaveError(err instanceof ApiClientError ? err.message : "Failed to create plan.")
    } finally {
      setSaving(false)
    }
  }

  const openEdit = (p: ChallengePlan) => {
    setEditing(p)
    setEditForm({
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
  }

  const handleSaveEdit = async () => {
    if (!editing) return
    setSaving(true)
    setSaveError(null)
    try {
      await adminUpdatePlan(editing.id, toPlanInput(editForm))
      setEditing(null)
      await refresh()
    } catch (err) {
      setSaveError(err instanceof ApiClientError ? err.message : "Failed to save plan.")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await adminDeletePlan(id)
      await refresh()
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Failed to delete plan.")
    }
  }

  const renderFormFields = (state: FormState, setState: (updater: (f: FormState) => FormState) => void) => (
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-1 col-span-2">
        <Label className="text-xs">Name</Label>
        <Input value={state.name} onChange={(e) => setState((f) => ({ ...f, name: e.target.value }))} placeholder="One Step" />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Size ($)</Label>
        <Input type="number" value={state.size} onChange={(e) => setState((f) => ({ ...f, size: e.target.value }))} placeholder="10000" />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Price ($)</Label>
        <Input type="number" value={state.price} onChange={(e) => setState((f) => ({ ...f, price: e.target.value }))} placeholder="45" />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Phase 1 target %</Label>
        <Input type="number" value={state.profitTargetP1} onChange={(e) => setState((f) => ({ ...f, profitTargetP1: e.target.value }))} />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Phase 2 target %</Label>
        <Input type="number" value={state.profitTargetP2} onChange={(e) => setState((f) => ({ ...f, profitTargetP2: e.target.value }))} />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Max daily loss %</Label>
        <Input type="number" value={state.maxDailyLoss} onChange={(e) => setState((f) => ({ ...f, maxDailyLoss: e.target.value }))} />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Max total loss %</Label>
        <Input type="number" value={state.maxTotalLoss} onChange={(e) => setState((f) => ({ ...f, maxTotalLoss: e.target.value }))} />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Profit split %</Label>
        <Input type="number" value={state.profitSplit} onChange={(e) => setState((f) => ({ ...f, profitSplit: e.target.value }))} />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Platform (optional)</Label>
        <Input value={state.platform} onChange={(e) => setState((f) => ({ ...f, platform: e.target.value }))} placeholder="mt4 / mt5 / blank = any" />
      </div>
    </div>
  )

  return (
    <AdminShell
      title="Pricing catalog"
      description="Manage the challenge plans customers see on the buy-challenge page."
      actions={
        <Button size="sm" className="gap-1" onClick={() => setCreateOpen(true)}>
          <Plus className="w-3.5 h-3.5" /> New plan
        </Button>
      }
    >
      <Card className="overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <EmptyState icon={<ShieldAlert className="w-8 h-8 text-muted-foreground" />} title="Failed to load" description={error} />
        ) : plans.length === 0 ? (
          <EmptyState icon={<Tag className="w-8 h-8 text-muted-foreground" />} title="No plans" description="Add a plan to populate the buy-challenge page." />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>P1 / P2 target</TableHead>
                  <TableHead>Daily / Total loss</TableHead>
                  <TableHead>Split</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plans.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell>${p.size.toLocaleString()}</TableCell>
                    <TableCell>${p.price}</TableCell>
                    <TableCell className="text-xs">{p.profitTargetP1}% / {p.profitTargetP2}%</TableCell>
                    <TableCell className="text-xs">{p.maxDailyLoss}% / {p.maxTotalLoss}%</TableCell>
                    <TableCell className="text-xs">{p.profitSplit}%</TableCell>
                    <TableCell className="text-xs uppercase text-muted-foreground">{p.platform ?? "any"}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => openEdit(p)}>Edit</Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(p.id)}>
                          <Trash2 className="w-3.5 h-3.5 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>New plan</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            {renderFormFields(form, setForm)}
            {saveError && <p className="text-sm text-destructive">{saveError}</p>}
            <Button type="submit" className="w-full" disabled={saving}>
              {saving ? "Creating…" : "Create plan"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit {editing?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {renderFormFields(editForm, setEditForm)}
            {saveError && <p className="text-sm text-destructive">{saveError}</p>}
            <Button className="w-full" disabled={saving} onClick={handleSaveEdit}>
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminShell>
  )
}
