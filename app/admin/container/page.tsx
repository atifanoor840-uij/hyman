"use client"

import { useEffect, useMemo, useState } from "react"
import { AdminShell } from "@/components/admin/admin-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { adminListInventory, adminCreateInventory, adminDeleteInventory, type InventoryItem } from "@/lib/api/app-client"
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
  StatRow,
  StatusPill,
  Toolbar,
  inputClass,
  money,
  useConfirm,
} from "@/components/admin/admin-ui"
import { Boxes, PackagePlus, Plus, Trash2 } from "lucide-react"

type Filter = "available" | "used" | "all"

const EMPTY_FORM = { platform: "mt5", size: "", login: "", password: "", server: "" }

export default function AdminContainerPage() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<Filter>("available")
  const [search, setSearch] = useState("")
  const [addOpen, setAddOpen] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [notice, setNotice] = useState<{ tone: "success" | "error"; text: string } | null>(null)
  const { confirm, dialog } = useConfirm()

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

  const available = useMemo(() => items.filter((i) => i.status === "available"), [items])

  /** Available stock per account size, so it's obvious which sizes are running low. */
  const stockBySize = useMemo(() => {
    const map = new Map<number, number>()
    for (const i of available) map.set(i.size, (map.get(i.size) ?? 0) + 1)
    return Array.from(map.entries()).sort((a, b) => a[0] - b[0])
  }, [available])

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase()
    return items.filter((i) => {
      if (filter === "available" && i.status !== "available") return false
      if (filter === "used" && i.status === "available") return false
      return !q || i.login.toLowerCase().includes(q) || i.server.toLowerCase().includes(q) || String(i.size).includes(q)
    })
  }, [items, filter, search])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreateError(null)
    if (!form.login || !form.password || !form.server || !form.size) {
      setCreateError("Please fill in every field.")
      return
    }
    setCreating(true)
    try {
      await adminCreateInventory({ platform: form.platform, size: Number(form.size), login: form.login, password: form.password, server: form.server })
      setNotice({ tone: "success", text: `Account ${form.login} added to inventory.` })
      // Keep platform/size/server so several accounts of the same kind can be added quickly.
      setForm((f) => ({ ...f, login: "", password: "" }))
      await refresh()
    } catch (err) {
      setCreateError(err instanceof ApiClientError ? err.message : "Failed to add account.")
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (i: InventoryItem) => {
    const { ok } = await confirm({
      title: `Remove account ${i.login}?`,
      description: "It will no longer be available to deliver to customers.",
      confirmLabel: "Remove",
      tone: "danger",
    })
    if (!ok) return
    try {
      await adminDeleteInventory(i.id)
      setNotice({ tone: "success", text: `Account ${i.login} removed.` })
      await refresh()
    } catch (err) {
      setNotice({ tone: "error", text: err instanceof ApiClientError ? err.message : "Failed to delete account." })
    }
  }

  const set = (key: keyof typeof EMPTY_FORM) => (v: string) => setForm((f) => ({ ...f, [key]: v }))

  return (
    <AdminShell
      title="Account inventory"
      description="Ready-made MT4/MT5 accounts you can deliver instantly from the Orders page."
      actions={
        <Button
          className="h-10 gap-2 rounded-xl"
          onClick={() => {
            setForm(EMPTY_FORM)
            setCreateError(null)
            setAddOpen(true)
          }}
        >
          <Plus className="h-4 w-4" /> Add accounts
        </Button>
      }
    >
      <div className="space-y-4">
        <StatRow
          items={[
            { label: "Available", value: available.length, tone: "success", hint: "Ready to deliver" },
            { label: "Used", value: items.length - available.length, tone: "neutral", hint: "Assigned to orders" },
            { label: "Total", value: items.length, hint: "All accounts in inventory" },
          ]}
        />

        {stockBySize.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-xs">
            <span className="font-medium text-foreground">In stock by size:</span>
            {stockBySize.map(([size, n]) => (
              <span
                key={size}
                className={`rounded-full px-2.5 py-1 font-medium ring-1 ring-inset ${
                  n <= 2 ? "bg-amber-50 text-amber-700 ring-amber-200" : "bg-muted text-foreground ring-border"
                }`}
              >
                {money(size, 0)} · {n}
              </span>
            ))}
            <span className="text-muted-foreground">Amber = 2 or fewer left.</span>
          </div>
        )}

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
                { value: "available", label: "Available", count: available.length },
                { value: "used", label: "Used", count: items.length - available.length },
                { value: "all", label: "All", count: items.length },
              ]}
            />
            <SearchBox value={search} onChange={setSearch} placeholder="Search login, server or size" />
          </Toolbar>

          {loading && items.length === 0 ? (
            <LoadingBlock label="Loading inventory…" />
          ) : error ? (
            <ErrorBlock message={error} onRetry={() => void refresh()} />
          ) : visible.length === 0 ? (
            <EmptyBlock
              icon={Boxes}
              title={items.length ? "No matching accounts" : "Inventory is empty"}
              description={items.length ? "Try another filter or clear the search." : "Add pre-created trading accounts so orders can be delivered in one click."}
            />
          ) : (
            <DataTable head={["Account", "Size", "Server", "Status", "Order", ""]}>
              {visible.map((i) => (
                <tr key={i.id}>
                  <td>
                    <p className="font-mono text-sm font-medium text-foreground">{i.login}</p>
                    <p className="text-xs uppercase text-muted-foreground">{i.platform}</p>
                  </td>
                  <td className="font-medium tabular-nums text-foreground">{money(i.size, 0)}</td>
                  <td className="text-sm text-muted-foreground">{i.server}</td>
                  <td>
                    <StatusPill status={i.status === "available" ? "available" : "assigned"} label={i.status === "available" ? "Available" : "Used"} />
                  </td>
                  <td className="font-mono text-xs text-muted-foreground">{i.orderId ? `#${i.orderId.slice(0, 8)}` : "—"}</td>
                  <td>
                    {i.status === "available" ? (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 rounded-lg text-muted-foreground hover:bg-red-50 hover:text-red-600"
                        onClick={() => void handleDelete(i)}
                        aria-label={`Remove ${i.login}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground">In use</span>
                    )}
                  </td>
                </tr>
              ))}
            </DataTable>
          )}
        </Panel>
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="rounded-2xl sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add account to inventory</DialogTitle>
            <DialogDescription>The form stays open after saving so you can add several in a row.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Platform" htmlFor="i-platform">
                <NativeSelect id="i-platform" value={form.platform} onChange={set("platform")}>
                  <option value="mt5">MT5</option>
                  <option value="mt4">MT4</option>
                </NativeSelect>
              </Field>
              <Field label="Account size ($)" htmlFor="i-size">
                <Input id="i-size" type="number" className={inputClass} value={form.size} onChange={(e) => set("size")(e.target.value)} placeholder="10000" />
              </Field>
              <Field label="Server" className="sm:col-span-2" htmlFor="i-server">
                <Input id="i-server" className={inputClass} value={form.server} onChange={(e) => set("server")(e.target.value)} />
              </Field>
              <Field label="Login" htmlFor="i-login">
                <Input id="i-login" className={inputClass} value={form.login} onChange={(e) => set("login")(e.target.value)} />
              </Field>
              <Field label="Password" htmlFor="i-pass">
                <Input id="i-pass" className={inputClass} value={form.password} onChange={(e) => set("password")(e.target.value)} />
              </Field>
            </div>
            {createError && <Notice tone="error">{createError}</Notice>}
            {notice?.tone === "success" && addOpen && <Notice tone="success">{notice.text}</Notice>}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" className="rounded-xl" onClick={() => setAddOpen(false)}>
                Done
              </Button>
              <Button type="submit" className="gap-2 rounded-xl" disabled={creating}>
                <PackagePlus className="h-4 w-4" /> {creating ? "Adding…" : "Add account"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {dialog}
    </AdminShell>
  )
}
