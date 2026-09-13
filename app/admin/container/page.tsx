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
import { adminListInventory, adminCreateInventory, adminDeleteInventory, type InventoryItem } from "@/lib/api/app-client"
import { ApiClientError } from "@/lib/api/client"
import { Loader2, ShieldAlert, PackagePlus, Trash2 } from "lucide-react"

const EMPTY_FORM = { platform: "mt5", size: "", login: "", password: "", server: "" }

export default function AdminContainerPage() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  const refresh = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await adminListInventory()
      setItems(res.items)
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Failed to load inventory.")
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
    if (!form.login || !form.password || !form.server || !form.size) {
      setCreateError("All fields are required.")
      return
    }
    setCreating(true)
    try {
      await adminCreateInventory({ platform: form.platform, size: Number(form.size), login: form.login, password: form.password, server: form.server })
      setForm(EMPTY_FORM)
      await refresh()
    } catch (err) {
      setCreateError(err instanceof ApiClientError ? err.message : "Failed to add account.")
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await adminDeleteInventory(id)
      await refresh()
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Failed to delete account.")
    }
  }

  return (
    <AdminShell title="Account inventory" description="Pre-provisioned MT4/MT5 accounts ready to deliver to customers.">
      <Card className="p-4 mb-4">
        <form onSubmit={handleCreate} className="grid grid-cols-2 sm:grid-cols-5 gap-3 items-end">
          <div className="space-y-1">
            <Label className="text-xs">Platform</Label>
            <select value={form.platform} onChange={(e) => setForm((f) => ({ ...f, platform: e.target.value }))} className="flex h-9 w-full rounded-md border border-input bg-transparent px-2 text-sm">
              <option value="mt4">MT4</option>
              <option value="mt5">MT5</option>
            </select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Size</Label>
            <Input value={form.size} onChange={(e) => setForm((f) => ({ ...f, size: e.target.value }))} placeholder="10000" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Login</Label>
            <Input value={form.login} onChange={(e) => setForm((f) => ({ ...f, login: e.target.value }))} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Password</Label>
            <Input value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Server</Label>
            <Input value={form.server} onChange={(e) => setForm((f) => ({ ...f, server: e.target.value }))} />
          </div>
          <div className="col-span-2 sm:col-span-5 flex items-center gap-3">
            <Button type="submit" size="sm" disabled={creating} className="gap-1">
              <PackagePlus className="w-3.5 h-3.5" /> {creating ? "Adding…" : "Add account"}
            </Button>
            {createError && <p className="text-sm text-destructive">{createError}</p>}
          </div>
        </form>
      </Card>

      <Card className="overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <EmptyState icon={<ShieldAlert className="w-8 h-8 text-muted-foreground" />} title="Failed to load" description={error} />
        ) : items.length === 0 ? (
          <EmptyState icon={<PackagePlus className="w-8 h-8 text-muted-foreground" />} title="No inventory" description="Add pre-provisioned accounts above." />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Platform</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Login</TableHead>
                  <TableHead>Server</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((i) => (
                  <TableRow key={i.id}>
                    <TableCell className="uppercase">{i.platform}</TableCell>
                    <TableCell>${i.size.toLocaleString()}</TableCell>
                    <TableCell className="font-mono text-xs">{i.login}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{i.server}</TableCell>
                    <TableCell>
                      <Badge className={i.status === "available" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-muted text-muted-foreground"}>
                        {i.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{i.orderId ? i.orderId.slice(0, 8) : "—"}</TableCell>
                    <TableCell>
                      {i.status === "available" && (
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(i.id)}>
                          <Trash2 className="w-3.5 h-3.5 text-destructive" />
                        </Button>
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
