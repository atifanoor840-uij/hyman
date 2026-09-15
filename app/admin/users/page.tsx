"use client"

import { useEffect, useMemo, useState } from "react"
import { AdminShell } from "@/components/admin/admin-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { adminListUsers, adminUpdateUser, crmImpersonate, type AdminUserRow } from "@/lib/api/app-client"
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
  Person,
  SearchBox,
  StatusPill,
  Toolbar,
  inputClass,
  shortDate,
  useConfirm,
} from "@/components/admin/admin-ui"
import { BadgeCheck, LogIn, Pencil, RefreshCcw, Users } from "lucide-react"

type Filter = "all" | "active" | "suspended" | "unverified" | "staff"

const ROLE_LABEL: Record<string, string> = {
  customer: "Customer",
  collaborator: "Collaborator",
  support: "Support",
  admin: "Admin",
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<Filter>("all")
  const [editing, setEditing] = useState<AdminUserRow | null>(null)
  const [form, setForm] = useState({ name: "", phone: "", country: "", role: "customer", status: "active" })
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [notice, setNotice] = useState<{ tone: "success" | "error"; text: string } | null>(null)
  const { confirm, dialog } = useConfirm()

  const refresh = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await adminListUsers()
      setUsers(res.users)
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Failed to load users.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  const counts = useMemo(
    () => ({
      all: users.length,
      active: users.filter((u) => u.status === "active").length,
      suspended: users.filter((u) => u.status !== "active").length,
      unverified: users.filter((u) => !u.emailVerified).length,
      staff: users.filter((u) => u.role !== "customer").length,
    }),
    [users],
  )

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return users.filter((u) => {
      if (filter === "active" && u.status !== "active") return false
      if (filter === "suspended" && u.status === "active") return false
      if (filter === "unverified" && u.emailVerified) return false
      if (filter === "staff" && u.role === "customer") return false
      return !q || u.email.toLowerCase().includes(q) || u.name.toLowerCase().includes(q)
    })
  }, [users, search, filter])

  const openEdit = (u: AdminUserRow) => {
    setEditing(u)
    setForm({ name: u.name, phone: u.phone ?? "", country: u.country ?? "", role: u.role, status: u.status })
    setSaveError(null)
  }

  const handleSave = async () => {
    if (!editing) return
    if (form.status === "suspended" && editing.status !== "suspended") {
      const { ok } = await confirm({
        title: "Suspend this user?",
        description: `${editing.email} won’t be able to sign in until you reactivate the account.`,
        confirmLabel: "Suspend",
        tone: "danger",
      })
      if (!ok) return
    }
    setSaving(true)
    setSaveError(null)
    try {
      await adminUpdateUser(editing.id, form)
      await refresh()
      setEditing(null)
      setNotice({ tone: "success", text: `Saved changes for ${editing.email}.` })
    } catch (err) {
      setSaveError(err instanceof ApiClientError ? err.message : "Failed to save.")
    } finally {
      setSaving(false)
    }
  }

  const handleImpersonate = async (u: AdminUserRow) => {
    const { ok } = await confirm({
      title: `Log in as ${u.name || u.email}?`,
      description: "You’ll be signed out of admin in this browser and their dashboard opens in a new tab.",
      confirmLabel: "Continue",
    })
    if (!ok) return
    try {
      await crmImpersonate(u.id)
      window.open("/dashboard/overview", "_blank")
    } catch (err) {
      setNotice({ tone: "error", text: err instanceof ApiClientError ? err.message : "Failed to log in as user." })
    }
  }

  const set = (key: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [key]: v }))

  return (
    <AdminShell
      title="Users"
      description="Find customers, update their details, or suspend access."
      actions={
        <Button variant="outline" className="h-10 gap-2 rounded-xl border-border bg-card" onClick={() => void refresh()} disabled={loading}>
          <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
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
                { value: "active", label: "Active", count: counts.active },
                { value: "suspended", label: "Suspended", count: counts.suspended },
                { value: "unverified", label: "Unverified email", count: counts.unverified },
                { value: "staff", label: "Staff", count: counts.staff },
              ]}
            />
            <SearchBox value={search} onChange={setSearch} placeholder="Search name or email" />
          </Toolbar>

          {loading && users.length === 0 ? (
            <LoadingBlock label="Loading users…" />
          ) : error ? (
            <ErrorBlock message={error} onRetry={() => void refresh()} />
          ) : filtered.length === 0 ? (
            <EmptyBlock icon={Users} title="No matching users" description="Try another filter or clear the search." />
          ) : (
            <DataTable head={["User", "Role", "Status", "Email", "Country", "Joined", ""]}>
              {filtered.map((u) => (
                <tr key={u.id}>
                  <td>
                    <Person name={u.name} email={u.email} />
                  </td>
                  <td>
                    <span className="text-sm text-foreground">{ROLE_LABEL[u.role] ?? u.role}</span>
                  </td>
                  <td>
                    <StatusPill status={u.status} />
                  </td>
                  <td>
                    {u.emailVerified ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                        <BadgeCheck className="h-4 w-4" /> Verified
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">Not verified</span>
                    )}
                  </td>
                  <td className="text-sm text-muted-foreground">{u.country || "—"}</td>
                  <td className="whitespace-nowrap text-xs text-muted-foreground">{shortDate(u.createdAt)}</td>
                  <td>
                    <div className="flex items-center justify-end gap-1.5">
                      <Button size="sm" variant="outline" className="h-8 gap-1.5 rounded-lg border-border" onClick={() => openEdit(u)}>
                        <Pencil className="h-3.5 w-3.5" /> Edit
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 rounded-lg"
                        onClick={() => void handleImpersonate(u)}
                        title="Log in as this user"
                        aria-label={`Log in as ${u.email}`}
                      >
                        <LogIn className="h-4 w-4" />
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
        <DialogContent className="rounded-2xl sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit user</DialogTitle>
            <DialogDescription>{editing?.email}</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Full name" className="sm:col-span-2" htmlFor="u-name">
              <Input id="u-name" className={inputClass} value={form.name} onChange={(e) => set("name")(e.target.value)} />
            </Field>
            <Field label="Phone" htmlFor="u-phone">
              <Input id="u-phone" className={inputClass} value={form.phone} onChange={(e) => set("phone")(e.target.value)} />
            </Field>
            <Field label="Country" htmlFor="u-country">
              <Input id="u-country" className={inputClass} value={form.country} onChange={(e) => set("country")(e.target.value)} />
            </Field>
            <Field label="Role" hint="Controls admin access." htmlFor="u-role">
              <NativeSelect id="u-role" value={form.role} onChange={set("role")}>
                <option value="customer">Customer</option>
                <option value="collaborator">Collaborator</option>
                <option value="support">Support</option>
                <option value="admin">Admin</option>
              </NativeSelect>
            </Field>
            <Field label="Account status" hint="Suspended users can’t sign in." htmlFor="u-status">
              <NativeSelect id="u-status" value={form.status} onChange={set("status")}>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </NativeSelect>
            </Field>
          </div>
          {saveError && <Notice tone="error">{saveError}</Notice>}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" className="rounded-xl" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button className="rounded-xl" disabled={saving} onClick={() => void handleSave()}>
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {dialog}
    </AdminShell>
  )
}
