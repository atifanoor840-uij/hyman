"use client"
import { useEffect, useState } from "react"
import { getApiBaseUrl } from "@/lib/api"
import AdminLayout from "@/components/admin-layout"
import SectionCard from "@/components/ui/section-card"
import AdminLoader from "@/components/ui/admin-loader"
import { useAdminCache } from "@/hooks/use-admin-cache"
import { 
  UsersIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  UserPlusIcon,
  CalendarIcon
} from "@heroicons/react/24/outline"

interface User {
  user_code: string
  email: string
  admin_access_password_plain: string
  country: string
  created_at: string
}

export default function AdminUsersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [dateFilter, setDateFilter] = useState<string>("")
  
  // Use cached users data
  const { data: usersData, isLoading, error: fetchError, updateData } = useAdminCache<User[]>({
    endpoint: `${getApiBaseUrl()}/auth/members`,
    storageKey: 'admin_cache_users',
    transformData: (data) => Array.isArray(data) ? data : [],
  })

  const users = usersData || []
  const error = fetchError

  // Calculate users by date
  const getUsersByDate = () => {
    const usersByDate: Record<string, number> = {}
    users.forEach(user => {
      try {
        const date = new Date(user.created_at)
        const dateKey = date.toISOString().split('T')[0] // YYYY-MM-DD format
        usersByDate[dateKey] = (usersByDate[dateKey] || 0) + 1
      } catch (error) {
        // Skip invalid dates
      }
    })
    return usersByDate
  }

  const usersByDate = getUsersByDate()
  const sortedDates = Object.keys(usersByDate).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

  const filteredUsers = users
    .filter(user => {
      const searchLower = searchTerm.toLowerCase()
      const matchesSearch = !searchTerm || 
                           (user.email?.toLowerCase().includes(searchLower) ||
                           user.country?.toLowerCase().includes(searchLower) ||
                           user.user_code?.toLowerCase().includes(searchLower) ||
                           user.admin_access_password_plain?.toLowerCase().includes(searchLower))
      
      const matchesDate = !dateFilter || (() => {
        try {
          const userDate = new Date(user.created_at).toISOString().split('T')[0]
          return userDate === dateFilter
        } catch (error) {
          return false
        }
      })()
      
      return matchesSearch && matchesDate
    })
    .sort((a, b) => {
      // Sort by created_at in descending order (newest first)
      try {
        const dateA = new Date(a.created_at).getTime()
        const dateB = new Date(b.created_at).getTime()
        return dateB - dateA // Descending order (newest first)
      } catch (error) {
        return 0 // Keep original order if date parsing fails
      }
    })

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (error) {
      return dateString
    }
  }

  const formatDateDisplay = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric'
      })
    } catch (error) {
      return dateString
    }
  }

  const totalUsers = users.length
  const filteredUsersCount = filteredUsers.length

  // Calculate statistics for today, this week, and this month
  const getTimeStats = () => {
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekStart = new Date(todayStart)
    weekStart.setDate(weekStart.getDate() - weekStart.getDay()) // Start of week (Sunday)
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    let todayCount = 0
    let weekCount = 0
    let monthCount = 0

    users.forEach(user => {
      try {
        const userDate = new Date(user.created_at)
        if (userDate >= todayStart) {
          todayCount++
        }
        if (userDate >= weekStart) {
          weekCount++
        }
        if (userDate >= monthStart) {
          monthCount++
        }
      } catch (error) {
        // Skip invalid dates
      }
    })

    return { todayCount, weekCount, monthCount }
  }

  const timeStats = getTimeStats()

  return (
    <AdminLayout
        title="User Management"
        subtitle="Manage all platform users and their accounts"
      headerActions={(
        <button className="px-3 sm:px-6 py-2 text-sm sm:text-base bg-red-600 text-white font-semibold rounded-lg hover:bg-red-600/90 transition-colors flex items-center gap-2">
          <span className="hidden sm:inline">Add User</span>
          <span className="sm:hidden">Add</span>
          <UserPlusIcon className="w-4 h-4" />
        </button>
      )}
    >
      {/* Professional Statistics Cards */}
      {!isLoading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <SectionCard>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Today</p>
                <p className="text-3xl font-bold text-gray-900">{timeStats.todayCount}</p>
                <p className="text-xs text-gray-500 mt-1">New users today</p>
              </div>
              <div className="p-4 rounded-lg bg-gray-100 border border-gray-300">
                <UsersIcon className="w-8 h-8 text-gray-800" />
              </div>
            </div>
          </SectionCard>
          <SectionCard>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">This Week</p>
                <p className="text-3xl font-bold text-gray-900">{timeStats.weekCount}</p>
                <p className="text-xs text-gray-500 mt-1">New users this week</p>
              </div>
              <div className="p-4 rounded-lg bg-gray-100 border border-gray-300">
                <CalendarIcon className="w-8 h-8 text-gray-800" />
              </div>
            </div>
          </SectionCard>
          <SectionCard>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">This Month</p>
                <p className="text-3xl font-bold text-gray-900">{timeStats.monthCount}</p>
                <p className="text-xs text-gray-500 mt-1">New users this month</p>
              </div>
              <div className="p-4 rounded-lg bg-gray-100 border border-gray-300">
                <UserPlusIcon className="w-8 h-8 text-gray-800" />
              </div>
            </div>
          </SectionCard>
        </div>
      )}

      {/* Total Users Card */}
      {!isLoading && !error && (
        <SectionCard className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Users</p>
              <p className="text-4xl font-bold text-gray-900">{totalUsers.toLocaleString()}</p>
              {dateFilter && (
                <p className="text-sm text-gray-600 mt-2">
                  Showing: <span className="text-gray-900 font-semibold">{filteredUsersCount}</span> user{filteredUsersCount !== 1 ? 's' : ''} for selected date
                  <button
                    onClick={() => setDateFilter("")}
                    className="ml-2 text-red-600 hover:text-red-700 underline"
                  >
                    Clear filter
                  </button>
                </p>
              )}
            </div>
            <div className="p-4 rounded-lg bg-gray-100 border border-gray-300">
              <UsersIcon className="w-10 h-10 text-gray-800" />
            </div>
          </div>
        </SectionCard>
      )}

      {/* Filters */}
      <SectionCard>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
                placeholder="Filter by date"
              />
            </div>
            {dateFilter && (
                <button
                  onClick={() => setDateFilter("")}
                  className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  Clear Date
                </button>
            )}
          </div>
        </div>
      </SectionCard>

      {/* Error Display */}
      {error && (
        <SectionCard>
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="text-red-400 text-sm">{error}</div>
            </div>
          </div>
        </SectionCard>
      )}

      {/* Users Table */}
      <SectionCard padded={false}>
        {isLoading ? (
          <AdminLoader type="users" message="Loading users..." />
        ) : error ? (
          <div className="p-8 text-center">
            <UsersIcon className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <p className="text-red-600">Failed to load users</p>
            <p className="text-gray-600 text-sm mt-2">{error}</p>
          </div>
        ) : filteredUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-600 uppercase tracking-wider">User Code</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-600 uppercase tracking-wider">Email</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-600 uppercase tracking-wider">Admin Access Password</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-600 uppercase tracking-wider">Country</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-600 uppercase tracking-wider">Created At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((user, index) => (
                  <tr key={`${user.user_code}-${index}`} className="hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <span className="text-gray-900 font-mono font-medium">{user.user_code || '—'}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-gray-700">{user.email || '—'}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-gray-700 font-mono text-sm">{user.admin_access_password_plain || '—'}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-gray-900">{user.country || '—'}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-gray-600 text-sm">{formatDate(user.created_at)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center">
            <UsersIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No users found</p>
          </div>
        )}
      </SectionCard>
    </AdminLayout>
  )
}
