"use client"

import { useState, useEffect, type ReactNode } from "react"
import { adminApiRequest } from "@/lib/api/admin-auth"
import {
  MagnifyingGlassIcon,
  UsersIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  UserGroupIcon,
  ShoppingBagIcon,
} from "@heroicons/react/24/outline"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface MemberRow {
  id: number
  user_code?: string | null
  username?: string | null
  email?: string | null
  name?: string | null
  country?: string | null
  phone_no?: string | null
  address?: string | null
  referral_code?: string | null
  referral_code_access_enabled?: boolean
  points_balance?: number
  profile_picture_url?: string | null
  created_at?: string | null
  is_verified?: boolean
  total_orders?: number
  admin_access_password_plain?: string | null
  hashed_password?: string | null
  admin_access_password?: string | null
  [key: string]: unknown
}

function formatDate(value: string | null | undefined): string {
  if (value == null || value === "") return "—"
  try {
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return value
    return d.toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" })
  } catch {
    return value
  }
}

function DataField({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-neutral-100 py-2 last:border-0">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">{label}</span>
      <span className="font-mono text-sm text-neutral-900 break-all">{value ?? "—"}</span>
    </div>
  )
}

function ViewMemberDialog({
  member,
  open,
  onOpenChange,
}: {
  member: MemberRow | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  if (!member) return null
  const entries = Object.entries(member).filter(([k]) => !k.startsWith("_"))
  const displayValue = (value: unknown): string => {
    if (value === true) return "true"
    if (value === false) return "false"
    if (value == null) return "—"
    if (typeof value === "object" && !(value instanceof Date)) return JSON.stringify(value)
    return String(value)
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] max-w-2xl flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-100">
              <UsersIcon className="h-5 w-5 text-neutral-600" />
            </span>
            <span className="font-mono font-semibold">{member.user_code ?? member.email ?? String(member.id)}</span>
          </DialogTitle>
        </DialogHeader>
        <p className="-mt-1 text-xs text-neutral-500">Complete data returned by backend for this member.</p>
        <div className="min-h-0 flex-1 space-y-0 overflow-y-auto rounded-xl border border-neutral-200 bg-neutral-50/60 p-4">
          {entries.map(([key, value]) => (
            <DataField key={key} label={key.replace(/_/g, " ")} value={displayValue(value)} />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<MemberRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [viewMember, setViewMember] = useState<MemberRow | null>(null)

  const fetchUsers = () => {
    setLoading(true)
    setError(null)
    adminApiRequest<MemberRow[]>("/auth/members")
      .then((data) => {
        const list = Array.isArray(data) ? data : []
        setUsers(list)
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load members")
        setUsers([])
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const filtered = users.filter((u) => {
    const term = search.trim().toLowerCase()
    if (!term) return true
    return [u.user_code, u.username, u.email, u.name, u.country].some((v) =>
      String(v ?? "").toLowerCase().includes(term)
    )
  })

  const displayUsers = filtered.slice(0, 200)
  const totalMembers = users.length
  const verifiedCount = users.filter((u) => u.is_verified).length
  const withOrdersCount = users.filter((u) => (u.total_orders ?? 0) > 0).length
  const totalOrdersSum = users.reduce((acc, u) => acc + (u.total_orders ?? 0), 0)

  return (
    <div className="min-w-0 space-y-8">
      {/* Page header */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight sm:text-3xl">
            Members
          </h1>
          <p className="mt-1.5 max-w-xl text-sm text-neutral-500">
            Manage user accounts, verification status, and activity. Data from <code className="rounded bg-neutral-100 px-1 py-0.5 text-xs">/auth/members</code>.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="shrink-0 gap-2 border-neutral-200"
          onClick={fetchUsers}
          disabled={loading}
        >
          <ArrowPathIcon className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-100">
              <UserGroupIcon className="h-5 w-5 text-neutral-600" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">Total members</p>
              <p className="text-xl font-bold tabular-nums text-neutral-900">{totalMembers}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-emerald-200/60 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
              <CheckCircleIcon className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600/80">Verified</p>
              <p className="text-xl font-bold tabular-nums text-emerald-700">{verifiedCount}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-blue-200/60 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10">
              <UsersIcon className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-600/80">With orders</p>
              <p className="text-xl font-bold tabular-nums text-blue-700">{withOrdersCount}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-100">
              <ShoppingBagIcon className="h-5 w-5 text-neutral-600" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">Total orders</p>
              <p className="text-xl font-bold tabular-nums text-neutral-900">{totalOrdersSum}</p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/80 px-4 py-3 shadow-sm">
          <ExclamationTriangleIcon className="h-5 w-5 shrink-0 text-amber-600" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-amber-800">Could not load members</p>
            <p className="mt-0.5 text-sm text-amber-700">{error}</p>
          </div>
          <button
            type="button"
            onClick={() => setError(null)}
            className="shrink-0 rounded-md p-1 text-amber-600 hover:bg-amber-100 hover:text-amber-800"
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      )}

      <div className="rounded-2xl border border-neutral-200 bg-white shadow-md overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col gap-4 border-b border-neutral-200 bg-neutral-50/90 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-sm">
            <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by code, email, name, country…"
              className="h-9 rounded-lg border-neutral-200 bg-white pl-9 text-sm"
            />
          </div>
          {!loading && (
            <p className="text-xs text-neutral-500">
              Showing <span className="font-semibold text-neutral-700">{Math.min(displayUsers.length, 200)}</span>
              {filtered.length > 200 ? ` of ${filtered.length} ` : " "}
              member{filtered.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-neutral-200 border-t-neutral-700" />
            <p className="mt-3 text-sm font-medium text-neutral-500">Loading members…</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="sticky top-0 z-10 bg-neutral-50">
                <tr>
                  <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-widest text-neutral-500">
                    User code
                  </th>
                  <th className="px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-widest text-neutral-500">
                    Email
                  </th>
                  <th className="px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-widest text-neutral-500">
                    Name
                  </th>
                  <th className="px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-widest text-neutral-500">
                    Country
                  </th>
                  <th className="px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-widest text-neutral-500">
                    Verified
                  </th>
                  <th className="px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-widest text-neutral-500">
                    Orders
                  </th>
                  <th className="px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-widest text-neutral-500">
                    Created
                  </th>
                  <th className="px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-widest text-neutral-500">
                    Admin password
                  </th>
                  <th className="px-5 py-3.5 text-right text-[11px] font-semibold uppercase tracking-widest text-neutral-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {displayUsers.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-5 py-20 text-center">
                      <div className="flex flex-col items-center gap-4 text-neutral-500">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-100">
                          <UsersIcon className="h-7 w-7 text-neutral-400" />
                        </div>
                        <div>
                          <p className="font-medium text-neutral-700">No members match your search</p>
                          <p className="mt-1 text-sm text-neutral-400">
                            {users.length === 0
                              ? "Members will appear here once the API returns data."
                              : "Try a different search term."}
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  displayUsers.map((u, idx) => (
                    <tr
                      key={u.id}
                      className={`border-t border-neutral-100 transition-colors ${
                        idx % 2 === 0 ? "bg-white" : "bg-neutral-50/30"
                      } hover:bg-neutral-50`}
                    >
                      <td className="px-5 py-3.5 font-mono text-[13px] font-semibold text-neutral-900">
                        {u.user_code ?? "—"}
                      </td>
                      <td className="px-4 py-3.5 text-neutral-700">{u.email ?? "—"}</td>
                      <td className="px-4 py-3.5 text-neutral-700">{u.name ?? "—"}</td>
                      <td className="px-4 py-3.5 text-neutral-600">{u.country ?? "—"}</td>
                      <td className="px-4 py-3.5">
                        {u.is_verified ? (
                          <span className="inline-flex items-center gap-1 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                            <CheckCircleIcon className="h-3.5 w-3.5" />
                            Yes
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-md border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-xs font-medium text-neutral-500">
                            <XCircleIcon className="h-3.5 w-3.5" />
                            No
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 font-medium tabular-nums text-neutral-700">
                        {u.total_orders ?? "—"}
                      </td>
                      <td className="px-4 py-3.5 text-neutral-500 whitespace-nowrap">
                        {formatDate(u.created_at)}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-xs text-neutral-700 max-w-[140px] truncate" title={String(u.admin_access_password_plain ?? "")}>
                        {u.admin_access_password_plain ?? "—"}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => setViewMember(u)}
                          title="View full data"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ViewMemberDialog
        member={viewMember}
        open={!!viewMember}
        onOpenChange={(open) => !open && setViewMember(null)}
      />
    </div>
  )
}
