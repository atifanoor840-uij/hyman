"use client"

import { useState } from "react"
import AdminLayout from "@/components/admin-layout"
import SectionCard from "@/components/ui/section-card"
import { 
  BanknotesIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon
} from "@heroicons/react/24/outline"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const mockWithdrawals = [
  { id: "WD-2041", user: "john@example.com", amount: "$1,250", method: "Bank Transfer", status: "Pending", requested: "2025-01-28" },
  { id: "WD-2040", user: "jane@example.com", amount: "$890", method: "PayPal", status: "Approved", requested: "2025-01-27" },
  { id: "WD-2039", user: "mike@example.com", amount: "$2,100", method: "Bank Transfer", status: "Rejected", requested: "2025-01-26" },
  { id: "WD-2038", user: "sara@example.com", amount: "$500", method: "Crypto", status: "Pending", requested: "2025-01-28" },
  { id: "WD-2037", user: "alex@example.com", amount: "$1,750", method: "Bank Transfer", status: "Approved", requested: "2025-01-25" },
]

export default function AdminWithdrawalPage() {
  const [searchTerm, setSearchTerm] = useState("")

  const getStatusClasses = (status: string) => {
    switch (status) {
      case "Approved": return "bg-slate-500/20 text-slate-700"
      case "Pending": return "bg-yellow-500/20 text-yellow-700"
      case "Rejected": return "bg-red-500/20 text-red-600"
      default: return "bg-gray-500/20 text-gray-600"
    }
  }

  const filteredWithdrawals = mockWithdrawals.filter(
    w => w.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
         w.user.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <AdminLayout
      title="Withdrawal"
      subtitle="Review and process withdrawal requests"
      headerActions={(
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <CheckCircleIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Approve selected</span>
          </Button>
          <Button variant="outline" size="sm" className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50">
            <XCircleIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Reject selected</span>
          </Button>
        </div>
      )}
    >
      <SectionCard padded={false}>
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <BanknotesIcon className="w-5 h-5 text-slate-600" />
            <h2 className="text-lg font-semibold text-slate-900">Withdrawal Requests</h2>
          </div>
          <div className="relative w-full sm:w-64">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Search by user or ID..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-slate-200 bg-slate-50/50">
              <tr>
                <th className="text-left py-3 px-4 text-xs font-medium text-slate-600 uppercase tracking-wider">ID</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-slate-600 uppercase tracking-wider">User</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-slate-600 uppercase tracking-wider">Amount</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-slate-600 uppercase tracking-wider">Method</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-slate-600 uppercase tracking-wider">Status</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-slate-600 uppercase tracking-wider">Requested</th>
                <th className="text-right py-3 px-4 text-xs font-medium text-slate-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredWithdrawals.map((w) => (
                <tr key={w.id} className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-mono text-sm text-slate-900">{w.id}</td>
                  <td className="py-3 px-4 text-sm text-slate-600">{w.user}</td>
                  <td className="py-3 px-4 text-sm font-medium text-slate-900">{w.amount}</td>
                  <td className="py-3 px-4 text-sm text-slate-600">{w.method}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${getStatusClasses(w.status)}`}>
                      {w.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-500">{w.requested}</td>
                  <td className="py-3 px-4 text-right">
                    {w.status === "Pending" && (
                      <div className="flex gap-1 justify-end">
                        <button className="px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded">Approve</button>
                        <button className="px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 rounded">Reject</button>
                      </div>
                    )}
                    <button className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded">
                      <EyeIcon className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </AdminLayout>
  )
}
