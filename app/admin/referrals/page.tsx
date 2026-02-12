"use client"
import { useEffect, useState } from "react"
import { getApiBaseUrl, API_ENDPOINTS, authenticatedApiRequest, apiRequest, formDataApiRequest, handleApiSuccess } from '@/lib/api'
import AdminLayout from "@/components/admin-layout"
import SectionCard from "@/components/ui/section-card"
import { useToast } from "@/hooks/use-toast"
import { getAdminToken } from "@/lib/admin-auth"
import { 
  UserGroupIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  CurrencyDollarIcon,
  GiftIcon,
  CheckCircleIcon,
  XCircleIcon
} from "@heroicons/react/24/outline"

interface FirstOrderUser {
  user_id: number
  username: string
  email: string
  name: string
  order_id: number
  order_created_at: string
  account_size: string
  challenge_type: string
  payment_method: string
  referral_code_access_enabled: boolean
  has_referral_code: boolean
}

interface GrantReferralRequest {
  user_id: number
  order_id: number
  notes: string
}

export default function AdminReferralsPage() {
  const { toast } = useToast()
  const [firstOrderUsers, setFirstOrderUsers] = useState<FirstOrderUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [grantingAccess, setGrantingAccess] = useState<number | null>(null)
  const [grantNotes, setGrantNotes] = useState("")
  const [showGrantModal, setShowGrantModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<FirstOrderUser | null>(null)

  useEffect(() => {
    const loadFirstOrderUsers = async () => {
      try {
        setIsLoading(true)
        const token = getAdminToken()
        if (!token) {
          toast({ title: "Admin authentication required", description: "Please log in with admin credentials to access this page.", variant: "destructive" as any })
          return
        }
        
        const response = await fetch(`${getApiBaseUrl()}/management/first-order-users?limit=1000&offset=0`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          if (response.status === 401) {
            toast({ title: "Unauthorized", description: "Your session has expired. Please log in again.", variant: "destructive" as any })
            return
          }
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        setFirstOrderUsers(data)
      } catch (error) {
        console.error("Failed to load first order users:", error)
        toast({ title: "Error", description: "Failed to load first order users. Please try again.", variant: "destructive" as any })
      } finally {
        setIsLoading(false)
      }
    }
    loadFirstOrderUsers()
  }, [toast])

  const grantReferralAccess = async (user: FirstOrderUser, notes: string) => {
    try {
      setGrantingAccess(user.user_id)
      const token = getAdminToken()
      if (!token) {
        toast({ title: "Admin authentication required", description: "Please log in with admin credentials to perform this action.", variant: "destructive" as any })
        return
      }

      const requestData: GrantReferralRequest = {
        user_id: user.user_id,
        order_id: user.order_id,
        notes: notes
      }

      const response = await fetch(`${getApiBaseUrl()}/management/grant-referral-access`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })

      if (!response.ok) {
        if (response.status === 401) {
          toast({ title: "Unauthorized", description: "Your session has expired. Please log in again.", variant: "destructive" as any })
          return
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      toast({ title: "Success", description: `Referral access granted to ${user.name}`, variant: "default" as any })
      
      // Update the user's referral access status in the local state
      setFirstOrderUsers(prev => prev.map(u => 
        u.user_id === user.user_id 
          ? { ...u, referral_code_access_enabled: true, has_referral_code: true }
          : u
      ))
      
      setShowGrantModal(false)
      setSelectedUser(null)
      setGrantNotes("")
    } catch (error) {
      console.error("Failed to grant referral access:", error)
      toast({ title: "Error", description: "Failed to grant referral access. Please try again.", variant: "destructive" as any })
    } finally {
      setGrantingAccess(null)
    }
  }

  const filteredUsers = firstOrderUsers.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.user_id.toString().includes(searchTerm)
    
    let matchesStatus = true
    if (statusFilter === "has_access") {
      matchesStatus = user.referral_code_access_enabled
    } else if (statusFilter === "no_access") {
      matchesStatus = !user.referral_code_access_enabled
    }
    
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (hasAccess: boolean) => {
    return hasAccess ? "bg-slate-500/20 text-slate-700" : "bg-yellow-500/20 text-yellow-400"
  }

  const totalUsers = firstOrderUsers.length
  const usersWithAccess = firstOrderUsers.filter(u => u.referral_code_access_enabled).length
  const usersWithoutAccess = totalUsers - usersWithAccess

  return (
    <AdminLayout
        title="Referral Management"
        subtitle="Monitor and manage user referrals and rewards"
      >
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <SectionCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Total First Order Users</p>
              <p className="text-2xl font-bold text-white">{totalUsers}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
              <UserGroupIcon className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </SectionCard>
        <SectionCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Users with Referral Access</p>
              <p className="text-2xl font-bold text-white">{usersWithAccess}</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-500/10 border border-slate-300">
              <CheckCircleIcon className="w-6 h-6 text-slate-600" />
            </div>
          </div>
        </SectionCard>
        <SectionCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Users without Access</p>
              <p className="text-2xl font-bold text-white">{usersWithoutAccess}</p>
            </div>
            <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
              <XCircleIcon className="w-6 h-6 text-yellow-400" />
            </div>
          </div>
        </SectionCard>
      </div>

      {/* Filters */}
      <SectionCard>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search users by name, email, username, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500"
            >
              <option value="all">All Users</option>
              <option value="has_access">Has Referral Access</option>
              <option value="no_access">No Referral Access</option>
            </select>
            <button className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white hover:bg-gray-600 transition-colors flex items-center gap-2">
              <FunnelIcon className="w-4 h-4" />
              Filter
            </button>
          </div>
        </div>
      </SectionCard>

      {/* First Order Users Table */}
      <SectionCard padded={false}>
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading first order users...</p>
          </div>
        ) : filteredUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-700">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-400 uppercase tracking-wider">User ID</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-400 uppercase tracking-wider">User Details</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-400 uppercase tracking-wider">Order Info</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-400 uppercase tracking-wider">Account Details</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-400 uppercase tracking-wider">Referral Access</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredUsers.map((user) => (
                  <tr key={user.user_id} className="hover:bg-gray-800/30">
                    <td className="py-4 px-6">
                      <div className="text-white font-medium">#{user.user_id}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <div className="text-white font-medium">{user.name || user.username}</div>
                        <div className="text-gray-400 text-sm">{user.email}</div>
                        <div className="text-gray-500 text-xs">@{user.username}</div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <div className="text-white font-medium">Order #{user.order_id}</div>
                        <div className="text-gray-400 text-sm">{new Date(user.order_created_at).toLocaleDateString()}</div>
                        <div className="text-gray-500 text-xs">{user.payment_method}</div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <div className="text-white font-medium">{user.account_size}</div>
                        <div className="text-gray-400 text-sm">{user.challenge_type}</div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.referral_code_access_enabled)}`}>
                          {user.referral_code_access_enabled ? 'Access Granted' : 'No Access'}
                        </span>
                        {user.has_referral_code && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
                            Has Code
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        {!user.referral_code_access_enabled && (
                          <button 
                            onClick={() => {
                              setSelectedUser(user)
                              setShowGrantModal(true)
                            }}
                            disabled={grantingAccess === user.user_id}
                            className="px-3 py-1 bg-slate-900 hover:bg-slate-800 disabled:bg-gray-600 text-white text-sm rounded-md transition-colors flex items-center gap-1"
                          >
                            {grantingAccess === user.user_id ? (
                              <>
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                                Granting...
                              </>
                            ) : (
                              <>
                                <GiftIcon className="w-3 h-3" />
                                Grant Access
                              </>
                            )}
                          </button>
                        )}
                        <button className="p-2 text-gray-400 hover:text-blue-400 transition-colors">
                          <EyeIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center">
            <UserGroupIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400">No first order users found</p>
          </div>
        )}
      </SectionCard>

      {/* Grant Referral Access Modal */}
      {showGrantModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-white mb-4">Grant Referral Access</h3>
            <div className="mb-4">
              <p className="text-gray-400 text-sm mb-2">User: {selectedUser.name || selectedUser.username}</p>
              <p className="text-gray-400 text-sm mb-2">Email: {selectedUser.email}</p>
              <p className="text-gray-400 text-sm mb-4">Order ID: #{selectedUser.order_id}</p>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={grantNotes}
                onChange={(e) => setGrantNotes(e.target.value)}
                placeholder="Add any notes about granting referral access..."
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500 resize-none"
                rows={3}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowGrantModal(false)
                  setSelectedUser(null)
                  setGrantNotes("")
                }}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => grantReferralAccess(selectedUser, grantNotes)}
                disabled={grantingAccess === selectedUser.user_id}
                className="flex-1 px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:bg-gray-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {grantingAccess === selectedUser.user_id ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Granting...
                  </>
                ) : (
                  <>
                    <GiftIcon className="w-4 h-4" />
                    Grant Access
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      </AdminLayout>
  )
}

