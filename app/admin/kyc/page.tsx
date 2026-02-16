"use client"

import { useState, useEffect } from "react"
import { adminApiRequest } from "@/lib/api/admin-auth"
import {
  ShieldCheckIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline"
import { Button } from "@/components/ui/button"

interface KycItem {
  id: number
  user_id: number
  provider?: string | null
  status?: string | null
  rejection_reason?: string | null
  reviewed_at?: string | null
  created_at?: string | null
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

export default function AdminKycPage() {
  const [items, setItems] = useState<KycItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchKyc = () => {
    setLoading(true)
    setError(null)
    adminApiRequest<{ items?: KycItem[] }>("/kyc/admin/list")
      .then((data) => {
        const list = Array.isArray(data) ? data : (data?.items ?? [])
        setItems(list)
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load KYC list")
        setItems([])
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchKyc()
  }, [])

  const statusStyle = (s: string | null | undefined) => {
    const v = (s ?? "").toLowerCase()
    if (v === "approved" || v === "verified") return "border-emerald-500/20 bg-emerald-500/10 text-emerald-700"
    if (v === "rejected" || v === "failed") return "border-red-500/20 bg-red-500/10 text-red-700"
    return "border-amber-500/20 bg-amber-500/10 text-amber-700"
  }

  return (
    <div className="min-w-0 space-y-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight sm:text-3xl">
            KYC
          </h1>
          <p className="mt-1.5 max-w-xl text-sm text-neutral-500">
            Review KYC submissions from <code className="rounded bg-neutral-100 px-1 py-0.5 text-xs">/kyc/admin/list</code>. Status, provider, and review details.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="shrink-0 gap-2 border-neutral-200"
          onClick={fetchKyc}
          disabled={loading}
        >
          <ArrowPathIcon className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/80 px-4 py-3 shadow-sm">
          <ExclamationTriangleIcon className="h-5 w-5 shrink-0 text-amber-600" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-amber-800">Could not load KYC list</p>
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
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-neutral-200 border-t-neutral-700" />
            <p className="mt-3 text-sm font-medium text-neutral-500">Loading KYC list…</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="sticky top-0 z-10 bg-neutral-50">
                <tr>
                  <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-widest text-neutral-500">
                    ID
                  </th>
                  <th className="px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-widest text-neutral-500">
                    User ID
                  </th>
                  <th className="px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-widest text-neutral-500">
                    Provider
                  </th>
                  <th className="px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-widest text-neutral-500">
                    Status
                  </th>
                  <th className="px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-widest text-neutral-500">
                    Rejection reason
                  </th>
                  <th className="px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-widest text-neutral-500">
                    Reviewed at
                  </th>
                  <th className="px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-widest text-neutral-500">
                    Created at
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-20 text-center">
                      <div className="flex flex-col items-center gap-4 text-neutral-500">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-100">
                          <ShieldCheckIcon className="h-7 w-7 text-neutral-400" />
                        </div>
                        <p className="font-medium text-neutral-700">No KYC items found</p>
                        <p className="text-sm text-neutral-400">Submissions will appear here when available.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  items.map((s, idx) => (
                    <tr
                      key={s.id}
                      className={`border-t border-neutral-100 transition-colors ${
                        idx % 2 === 0 ? "bg-white" : "bg-neutral-50/30"
                      } hover:bg-neutral-50`}
                    >
                      <td className="px-5 py-3.5 font-mono text-[13px] font-semibold text-neutral-900">
                        {s.id}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-neutral-700">{s.user_id}</td>
                      <td className="px-4 py-3.5 text-neutral-700">{s.provider ?? "—"}</td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex rounded-md border px-2 py-0.5 text-xs font-semibold capitalize ${statusStyle(s.status)}`}>
                          {s.status ?? "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-neutral-600 max-w-[200px] truncate" title={String(s.rejection_reason ?? "")}>
                        {s.rejection_reason ?? "—"}
                      </td>
                      <td className="px-4 py-3.5 text-neutral-500 whitespace-nowrap">
                        {formatDate(s.reviewed_at)}
                      </td>
                      <td className="px-4 py-3.5 text-neutral-500 whitespace-nowrap">
                        {formatDate(s.created_at)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
