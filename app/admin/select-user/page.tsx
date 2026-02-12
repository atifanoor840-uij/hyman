"use client"
import { useEffect, useState } from "react"
import { getApiBaseUrl } from "@/lib/api"
import { useRouter } from "next/navigation"
import AdminLayout from "@/components/admin-layout"
import SectionCard from "@/components/ui/section-card"
import AdminLoader from "@/components/ui/admin-loader"
import { useAdminCache } from "@/hooks/use-admin-cache"
import { 
  UsersIcon,
  MagnifyingGlassIcon,
  ArrowRightIcon
} from "@heroicons/react/24/outline"

interface User {
  user_code: string
  email: string
  country: string
  created_at: string
}

export default function SelectUserPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  
  // Use cached users data
  const { data: usersData, isLoading } = useAdminCache<User>({
    endpoint: `${getApiBaseUrl()}/auth/members`,
    storageKey: 'admin_cache_users',
    transformData: (data) => Array.isArray(data) ? data : [],
  })

  const users = usersData || []

  const filteredUsers = users
    .filter(user => {
      if (!searchTerm) return true
      const searchLower = searchTerm.toLowerCase()
      return (
        user.email?.toLowerCase().includes(searchLower) ||
        user.country?.toLowerCase().includes(searchLower) ||
        user.user_code?.toLowerCase().includes(searchLower)
      )
    })
    .sort((a, b) => {
      try {
        const dateA = new Date(a.created_at).getTime()
        const dateB = new Date(b.created_at).getTime()
        return dateB - dateA
      } catch (error) {
        return 0
      }
    })

  const handleUserSelect = (user: User) => {
    setSelectedUser(user)
    // Store selected user in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('admin_selected_user', JSON.stringify(user))
    }
    // Navigate to admin dashboard
    router.push('/admin')
  }

  if (isLoading) {
    return (
      <AdminLayout title="Select User" subtitle="Choose a user to manage">
        <AdminLoader type="users" message="Loading users..." />
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Select User" subtitle="Choose a user to manage">
      <div className="space-y-6">
        {/* Search Section */}
        <SectionCard>
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Select User</h2>
            <p className="text-sm text-gray-600">
              Search and select a user to access the admin dashboard
            </p>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search users by email, code, or country..."
                className="w-full pl-10 pr-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
              />
            </div>
          </div>
        </SectionCard>

        {/* Users List */}
        <SectionCard>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">
                Users ({filteredUsers.length})
              </h3>
            </div>
            
            {filteredUsers.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <UsersIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No users found</p>
              </div>
            ) : (
              <div className="border border-gray-200 rounded-lg max-h-[600px] overflow-y-auto">
                <div className="divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <button
                      key={user.email || user.user_code}
                      onClick={() => handleUserSelect(user)}
                      className="w-full p-4 hover:bg-gray-50 transition-colors text-left"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-gray-100 rounded-lg">
                              <UsersIcon className="w-5 h-5 text-gray-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-900 truncate">
                                {user.email || 'No email'}
                              </p>
                              <div className="flex items-center gap-3 mt-1">
                                {user.user_code && (
                                  <span className="text-xs text-gray-500">
                                    Code: {user.user_code}
                                  </span>
                                )}
                                {user.country && (
                                  <span className="text-xs text-gray-500">
                                    {user.country}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        <ArrowRightIcon className="w-5 h-5 text-gray-400 flex-shrink-0 ml-4" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </SectionCard>
      </div>
    </AdminLayout>
  )
}
