"use client"
import SectionCard from "@/components/ui/section-card"
import { 
  EnvelopeIcon,
  ClipboardDocumentListIcon,
  ArchiveBoxIcon
} from "@heroicons/react/24/outline"
import { useRouter } from "next/navigation"

export default function AdminDashboardPage() {
  const router = useRouter()

  const handleSectionSelect = (href: string) => {
    router.push(href)
  }

  // Show 3 section cards (no login required)
  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-10">
        <div className="space-y-6">
          <div className="mb-8 p-6 sm:p-8 bg-white border border-slate-200 rounded-2xl shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center border border-slate-600/50">
                <span className="text-white font-bold text-lg">FX</span>
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                  fxgenzy Admin Portal
                </h2>
                <p className="text-slate-500 text-sm mt-0.5">Control center</p>
              </div>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed max-w-2xl">
              Select one of the sections below to access specific admin features. Manage users, orders, email campaigns, and trading accounts from a single dashboard.
            </p>
          </div>

          {/* Three Main Sections */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
            {/* Section 1: Email Marketing */}
            <SectionCard className="hover:shadow-md hover:border-slate-300 transition-all cursor-pointer relative group"
              onClick={() => handleSectionSelect('/admin/email-sender')}
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 bg-slate-100 rounded-xl">
                    <EnvelopeIcon className="w-6 h-6 text-slate-700" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">Email Marketing</h3>
                </div>
                <p className="text-sm text-slate-600 mb-4 flex-1 leading-relaxed">
                  Send campaigns, manage templates, and reach users.
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <span className="text-slate-600 text-sm font-medium group-hover:text-slate-900">Access →</span>
                </div>
              </div>
            </SectionCard>

            {/* Section 2: Order Management */}
            <SectionCard className="hover:shadow-md hover:border-slate-300 transition-all cursor-pointer relative group"
              onClick={() => handleSectionSelect('/admin/orders')}
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 bg-slate-100 rounded-xl">
                    <ClipboardDocumentListIcon className="w-6 h-6 text-slate-700" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">Order Management</h3>
                </div>
                <p className="text-sm text-slate-600 mb-4 flex-1 leading-relaxed">
                  Manage orders, users, KYC, referrals, and certificates.
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <span className="text-slate-600 text-sm font-medium group-hover:text-slate-900">Access →</span>
                </div>
              </div>
            </SectionCard>

            {/* Section 3: Container Management */}
            <SectionCard className="hover:shadow-md hover:border-slate-300 transition-all cursor-pointer relative group"
              onClick={() => handleSectionSelect('/admin/container')}
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 bg-slate-100 rounded-xl">
                    <ArchiveBoxIcon className="w-6 h-6 text-slate-700" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">Container Management</h3>
                </div>
                <p className="text-sm text-slate-600 mb-4 flex-1 leading-relaxed">
                  Manage trading accounts, credentials, and assignments.
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <span className="text-slate-600 text-sm font-medium group-hover:text-slate-900">Access →</span>
                </div>
              </div>
            </SectionCard>
          </div>
        </div>
      </div>
    </div>
  )
}
