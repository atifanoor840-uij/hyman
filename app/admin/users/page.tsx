"use client"

import { useEffect, useMemo, useState } from "react"
import { AdminShell } from "@/components/admin/admin-shell"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import EmptyState from "@/components/ui/empty-state"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { adminListUsers, adminUpdateUser, crmImpersonate, type AdminUserRow } from "@/lib/api/app-client"
import { ApiClientError } from "@/lib/api/client"
import { Loader2, Search, ShieldAlert, Users, LogIn } from "lucide-react"

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [editing, setEditing] = useState<AdminUserRow | null>(null)
  const [form, setForm] = useState({ name: "", phone: "", country: "", role: "customer", status: "active" })
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

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

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return users
    return users.filter((u) => u.email.toLowerCase().includes(q) || u.name.toLowerCase().includes(q))
  }, [users, search])

  const openEdit = (u: AdminUserRow) => {
    setEditing(u)
    setForm({ name: u.name, phone: u.phone ?? "", country: u.country ?? "", role: u.role, status: u.status })
    setSaveError(null)
  }

  const handleSave = async () => {
    if (!editing) return
    setSaving(true)
    setSaveError(null)
    try {
      await adminUpdateUser(editing.id, form)
      await refresh()
      setEditing(null)
    } catch (err) {
      setSaveError(err instanceof ApiClientError ? err.message : "Failed to save.")
    } finally {
      setSaving(false)
    }
  }

  const handleImpersonate = async (userId: string) => {
    try {
      await crmImpersonate(userId)
      window.open("/dashboard/overview", "_blank")
    } catch (err) {
      setSaveError(err instanceof ApiClientError ? err.message : "Failed to impersonate user.")
    }
  }

  return (
    <AdminShell title="Users" description="View and manage customer accounts.">
      <Card className="p-4 mb-4">
        <div className="flex items-center gap-2 max-w-sm">
          <Search className="w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by name or email…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </Card>

      <Card className="overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <EmptyState icon={<ShieldAlert className="w-8 h-8 text-muted-foreground" />} title="Failed to load" description={error} />
        ) : filtered.length === 0 ? (
          <EmptyState icon={<Users className="w-8 h-8 text-muted-foreground" />} title="No users" description="No users match your search." />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Verified</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{u.email}</TableCell>
                    <TableCell><Badge variant="secondary" className="capitalize">{u.role}</Badge></TableCell>
                    <TableCell>
                      <Badge className={u.status === "active" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-red-500/10 text-red-600 border-red-500/20"}>
                        {u.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{u.emailVerified ? "Yes" : "No"}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => openEdit(u)}>Edit</Button>
                        <Button size="sm" variant="ghost" onClick={() => handleImpersonate(u.id)}>
                          <LogIn className="w-3.5 h-3.5" />
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

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit {editing?.email}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Phone</Label>
              <Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Country</Label>
              <Input value={form.country} onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Role</Label>
              <select
                value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
              >
                <option value="customer">Customer</option>
                <option value="collaborator">Collaborator</option>
                <option value="support">Support</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="space-y-1">
              <Label>Status</Label>
              <select
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
              >
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
            {saveError && <p className="text-sm text-destructive">{saveError}</p>}
            <Button className="w-full" disabled={saving} onClick={handleSave}>
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminShell>
  )
}
