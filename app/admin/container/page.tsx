"use client"

import { useState, useEffect } from "react"
import { adminApiRequest } from "@/lib/api/admin-auth"
import { ArchiveBoxIcon } from "@heroicons/react/24/outline"

interface ContainerRow {
  id?: number
  order_id?: string
  platform_login?: string
  server?: string
  platform?: string
  [key: string]: unknown
}

export default function AdminContainerPage() {
  const [containers, setContainers] = useState<ContainerRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    adminApiRequest<ContainerRow[] | { data?: ContainerRow[] }>("/accounts/credentials")
      .then((data) => {
        if (cancelled) return
        const list = Array.isArray(data) ? data : (data as { data?: ContainerRow[] }).data ?? []
        setContainers(list)
      })
      .catch((err) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : "Failed to load credentials")
        setContainers([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900 tracking-tight">Container / Credentials</h1>
        <p className="mt-1 text-sm text-neutral-500">Account credentials and container management.</p>
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
                  <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">Platform Login</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">Server</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">Platform</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 bg-white">
                {containers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-3 text-neutral-500">
                        <ArchiveBoxIcon className="h-12 w-12 text-neutral-300" />
                        <p className="text-sm font-medium">No containers found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  containers.slice(0, 100).map((c) => (
                    <tr key={c.id ?? c.order_id ?? String(c)} className="hover:bg-neutral-50/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-neutral-900">{c.order_id ?? "—"}</td>
                      <td className="px-6 py-4 text-sm text-neutral-600 font-mono">{c.platform_login ?? "—"}</td>
                      <td className="px-6 py-4 text-sm text-neutral-600">{c.server ?? "—"}</td>
                      <td className="px-6 py-4 text-sm text-neutral-600">{c.platform ?? "—"}</td>
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
