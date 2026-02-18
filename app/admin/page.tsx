"use client"
import SectionCard from "@/components/ui/section-card"
import { 
  EnvelopeIcon,
  ClipboardDocumentListIcon,
  ArchiveBoxIcon,
  ArrowRightIcon
} from "@heroicons/react/24/outline"

export default function AdminDashboardPage() {
  const handleSectionSelect = (href: string) => {
    window.open(href, '_blank')
  }

  // Show 3 section cards (no login required)
  return (
    <div className="min-h-screen bg-white">
      <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-10">
        <div className="space-y-6">
          <div className="mb-6 p-6 bg-gray-50 border border-gray-200 rounded-2xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome to Admin Dashboard
            </h2>
            <p className="text-gray-600 text-sm">
              Select one of the sections below to access specific admin features.
            </p>
          </div>

          {/* Three Main Sections */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Section 1: Email Marketing */}
            <SectionCard className="hover:shadow-lg transition-shadow cursor-pointer relative"
              onClick={() => handleSectionSelect('/admin/email-sender')}
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <EnvelopeIcon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Email Marketing</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4 flex-1">
                  Access email marketing tools and email sender page.
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center text-blue-600 text-sm font-medium">
                    <span>Access Section</span>
                    <ArrowRightIcon className="w-4 h-4 ml-2" />
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* Section 2: Order Management */}
            <SectionCard className="hover:shadow-lg transition-shadow cursor-pointer relative"
              onClick={() => handleSectionSelect('/admin/orders')}
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <ClipboardDocumentListIcon className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Order Management</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4 flex-1">
                  Access order management features including users, orders, KYC, referrals, and more.
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center text-green-600 text-sm font-medium">
                    <span>Access Section</span>
                    <ArrowRightIcon className="w-4 h-4 ml-2" />
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* Section 3: Container Management */}
            <SectionCard className="hover:shadow-lg transition-shadow cursor-pointer relative"
              onClick={() => handleSectionSelect('/admin/container')}
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <ArchiveBoxIcon className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Container Management</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4 flex-1">
                  Access container management features.
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center text-purple-600 text-sm font-medium">
                    <span>Access Section</span>
                    <ArrowRightIcon className="w-4 h-4 ml-2" />
                  </div>
                </div>
              </div>
            </SectionCard>
          </div>
        </div>
      </div>
    </div>
  )
}
