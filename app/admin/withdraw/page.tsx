"use client"
import { useEffect, useState } from "react"
import AdminLayout from "@/components/admin-layout"
import AdminLoader from "@/components/ui/admin-loader"
import SectionCard from "@/components/ui/section-card"
import { useToast } from "@/hooks/use-toast"
import { getAdminToken } from "@/lib/admin-auth"
import {
  CurrencyDollarIcon,
  ArrowPathIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline"

const WITHDRAWAL_ADMIN_REQUESTS_URL = "https://genz-34f298f57a04.herokuapp.com/withdrawal/admin/requests"

interface PaymentDetails {
  crypto_type?: string
  network?: string
  wallet_address?: string
  notes?: string
}

interface WithdrawalRequest {
  id: number
  user_id: number
  amount: number
  currency: string
  payment_method: string
  payment_details: string | PaymentDetails
  status: string
  requested_at: string
  processed_at: string | null
  rejection_reason: string | null
  admin_notes: string | null
  transaction_id: string | null
}

function parsePaymentDetails(details: string | PaymentDetails): PaymentDetails | null {
  if (!details) return null
  if (typeof details === "object") return details
  try {
    return JSON.parse(details) as PaymentDetails
  } catch {
    return null
  }
}

function formatDate(iso: string | null): string {
  if (!iso) return "—"
  try {
    const d = new Date(iso)
    return d.toLocaleString()
  } catch {
    return iso
  }
}

export default function AdminWithdrawPage() {
  const { toast } = useToast()
  const [requests, setRequests] = useState<WithdrawalRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRequests = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const token = getAdminToken()
      if (!token) {
        toast({
          title: "Admin authentication required",
          description: "Please log in with admin credentials to access this page.",
          variant: "destructive" as any,
        })
        return
      }

      const response = await fetch(WITHDRAWAL_ADMIN_REQUESTS_URL, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        if (response.status === 401) {
          toast({
            title: "Unauthorized",
            description: "Your session has expired. Please log in again.",
            variant: "destructive" as any,
          })
          return
        }
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      setRequests(Array.isArray(data) ? data : [])
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load withdrawal requests"
      setError(msg)
      setRequests([])
      toast({
        title: "Error",
        description: msg,
        variant: "destructive" as any,
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [])

  const pendingCount = requests.filter((r) => r.status === "pending").length
  const approvedCount = requests.filter((r) => r.status === "approved").length
  const rejectedCount = requests.filter((r) => r.status === "rejected").length

  return (
    <AdminLayout
      title="Withdrawal Requests"
      subtitle="View and manage user withdrawal requests"
    >
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-8">
        <SectionCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Total Requests</p>
              <p className="text-2xl font-bold text-white">{requests.length}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
              <CurrencyDollarIcon className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </SectionCard>
        <SectionCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Pending</p>
              <p className="text-2xl font-bold text-white">{pendingCount}</p>
            </div>
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
              <ClockIcon className="w-6 h-6 text-amber-400" />
            </div>
          </div>
        </SectionCard>
        <SectionCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Approved</p>
              <p className="text-2xl font-bold text-white">{approvedCount}</p>
            </div>
            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30">
              <CheckCircleIcon className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </SectionCard>
        <SectionCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Rejected</p>
              <p className="text-2xl font-bold text-white">{rejectedCount}</p>
            </div>
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
              <XCircleIcon className="w-6 h-6 text-red-400" />
            </div>
          </div>
        </SectionCard>
      </div>

      {/* Table */}
      <SectionCard>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">All requests</h2>
          <button
            onClick={fetchRequests}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors"
          >
            <ArrowPathIcon className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {isLoading ? (
          <AdminLoader type="orders" message="Loading withdrawal requests..." />
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <ExclamationTriangleIcon className="w-12 h-12 text-amber-500 mb-4" />
            <p className="text-gray-600 mb-2">{error}</p>
            <button
              onClick={fetchRequests}
              className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
            >
              Retry
            </button>
          </div>
        ) : requests.length === 0 ? (
          <p className="py-12 text-center text-gray-500">No withdrawal requests found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-600 uppercase tracking-wider">ID</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-600 uppercase tracking-wider">User ID</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-600 uppercase tracking-wider">Amount</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-600 uppercase tracking-wider">Currency</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-600 uppercase tracking-wider">Method</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-600 uppercase tracking-wider">Payment details</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-600 uppercase tracking-wider">Requested</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-600 uppercase tracking-wider">Processed</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-600 uppercase tracking-wider">Rejection reason</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-600 uppercase tracking-wider">Admin notes</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-600 uppercase tracking-wider">Tx ID</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => {
                  const details = parsePaymentDetails(req.payment_details)
                  return (
                    <tr key={req.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-6 text-sm text-gray-900 font-mono">{req.id}</td>
                      <td className="py-4 px-6 text-sm text-gray-700">{req.user_id}</td>
                      <td className="py-4 px-6 text-sm font-medium text-gray-900">
                        {req.amount.toLocaleString()}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-700">{req.currency}</td>
                      <td className="py-4 px-6 text-sm text-gray-700">{req.payment_method}</td>
                      <td className="py-4 px-6 text-sm text-gray-700 max-w-[200px]">
                        {details ? (
                          <span className="block truncate" title={details.wallet_address || ""}>
                            {details.crypto_type && <span>{details.crypto_type}</span>}
                            {details.network && <span> · {details.network}</span>}
                            {details.wallet_address && (
                              <span className="block truncate font-mono text-xs mt-1">{details.wallet_address}</span>
                            )}
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            req.status === "pending"
                              ? "bg-amber-100 text-amber-800"
                              : req.status === "approved"
                              ? "bg-green-100 text-green-800"
                              : req.status === "rejected"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {req.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-700">{formatDate(req.requested_at)}</td>
                      <td className="py-4 px-6 text-sm text-gray-700">{formatDate(req.processed_at)}</td>
                      <td className="py-4 px-6 text-sm text-gray-700 max-w-[120px] truncate" title={req.rejection_reason || ""}>
                        {req.rejection_reason || "—"}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-700 max-w-[120px] truncate" title={req.admin_notes || ""}>
                        {req.admin_notes || "—"}
                      </td>
                      <td className="py-4 px-6 text-sm font-mono text-gray-700 max-w-[140px] truncate" title={req.transaction_id || ""}>
                        {req.transaction_id || "—"}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </AdminLayout>
  )
}
