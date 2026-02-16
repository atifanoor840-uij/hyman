"use client"

import { useState, useEffect } from "react"
import { adminApiRequest } from "@/lib/api/admin-auth"
import { BanknotesIcon } from "@heroicons/react/24/outline"

interface WithdrawalRow {
  id?: number
  user_id?: number
  email?: string
  amount?: number
  status?: string
  created_at?: string
  updated_at?: string
  [key: string]: unknown
}

export default function AdminWithdrawalPage() {
  const [requests, setRequests] = useState<WithdrawalRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    adminApiRequest<WithdrawalRow[] | { data?: WithdrawalRow[]; requests?: WithdrawalRow[] }>("/withdrawal/admin/requests")
      .then((data) => {
        if (cancelled) return
        const list = Array.isArray(data)
          ? data
          : (data as { requests?: WithdrawalRow[] }).requests ?? (data as { data?: WithdrawalRow[] }).data ?? []
        setRequests(list)
      })
      .catch((err) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : "Failed to load withdrawal requests")
        setRequests([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900 tracking-tight">Withdrawal Requests</h1>
        <p className="mt-1 text-sm text-neutral-500">Review and process user withdrawal requests.</p>
      </div>

      {error && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {error}
        </div>
      )}

      <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-9 w-9 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-900" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead>
                <tr className="bg-neutral-50/80">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">User / Email</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">Requested</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 bg-white">
                {requests.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-3 text-neutral-500">
                        <BanknotesIcon className="h-12 w-12 text-neutral-300" />
                        <p className="text-sm font-medium">No withdrawal requests found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  requests.map((r) => (
                    <tr key={r.id ?? String(r)} className="hover:bg-neutral-50/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-neutral-900">{r.id ?? "—"}</td>
                      <td className="px-6 py-4 text-sm text-neutral-600">{r.email ?? r.user_id ?? "—"}</td>
                      <td className="px-6 py-4 text-sm font-medium text-neutral-900">${r.amount ?? "—"}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex rounded-lg px-2.5 py-1 text-xs font-medium bg-neutral-100 text-neutral-700">
                          {r.status ?? "—"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-500">{r.created_at ? new Date(r.created_at).toLocaleString() : "—"}</td>
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
