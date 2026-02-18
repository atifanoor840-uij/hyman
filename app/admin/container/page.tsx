"use client"
import { useEffect, useState } from "react"
import { getApiBaseUrl, API_ENDPOINTS, authenticatedApiRequest, apiRequest, formDataApiRequest, handleApiSuccess } from '@/lib/api'
import AdminLayout from "@/components/admin-layout"
import SectionCard from "@/components/ui/section-card"
import { useAdminCache } from "@/hooks/use-admin-cache"
import { 
  ArchiveBoxIcon,
  MagnifyingGlassIcon,
  ChartBarIcon,
  EyeIcon,
  EyeSlashIcon,
  CalendarIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  ClipboardDocumentIcon
} from "@heroicons/react/24/outline"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { getAdminToken } from "@/lib/admin-auth"
import AdminLoader from "@/components/ui/admin-loader"
import { AdminOrderStatisticsView } from "@/components/admin-order-statistics-view"
import { formatDateKarachi } from '@/lib/utils'

interface Container {
  id: number
  platform: string
  server: string
  platform_login: string
  platform_password: string
  account_size: string
  account_type: string
  is_assigned: boolean
  order_id: number
  created_at: string
  updated_at: string
  status: string
}

interface NewAccountForm {
  platform: string
  server: string
  platform_login: string
  platform_password: string
  account_size: string
  account_type: string
  profit_target: number
}

export default function AdminContainerPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [accountTypeFilter, setAccountTypeFilter] = useState("all")
  const [platformFilter, setPlatformFilter] = useState("all")
  const [availabilityFilter, setAvailabilityFilter] = useState<"all" | "available" | "assigned">("all")
  const [accountSizeFilter, setAccountSizeFilter] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)

  // Account size options for filter dropdown (same tiers as "Accounts by size" cards)
  const accountSizeFilterOptions = [
    { value: "all", label: "All sizes" },
    { value: "3000", label: "$3,000" },
    { value: "5000", label: "$5,000" },
    { value: "10000", label: "$10,000" },
    { value: "20000", label: "$20,000" },
    { value: "25000", label: "$25,000" },
    { value: "50000", label: "$50,000" },
    { value: "100000", label: "$100,000" },
    { value: "200000", label: "$200,000" },
    { value: "500000", label: "$500,000" },
  ]

  // Normalize account_size string to numeric (for filtering and "by size" cards)
  const getNumericAccountSize = (sizeStr: string): number => {
    if (!sizeStr) return 0
    const cleaned = String(sizeStr).toLowerCase().trim().replace(/[^0-9lakhs]/g, '')
    if (cleaned.includes('lakh')) {
      const numMatch = cleaned.match(/(\d+)/)
      if (numMatch) return parseInt(numMatch[1]) * 100000
    }
    const numMatch = String(sizeStr).match(/(\d+)/)
    return numMatch ? parseInt(numMatch[1]) : 0
  }
  
  // Use cached containers data
  const { data: cachedContainers, isLoading, error: fetchError, updateData, refresh } = useAdminCache<Container[]>({
    endpoint: 'https://genz-34f298f57a04.herokuapp.com/accounts/credentials',
    storageKey: 'admin_cache_containers',
    transformData: (data) => {
      const containersList = Array.isArray(data) ? data : []
      // Sort by newest first (by created_at or id)
      return containersList.sort((a: Container, b: Container) => {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : a.id
        const dateB = b.created_at ? new Date(b.created_at).getTime() : b.id
        return dateB - dateA // Descending order (newest first)
      })
    },
    requiresAuth: false,
  })

  const containers = cachedContainers || []
  const error = fetchError
  const [selectedContainer, setSelectedContainer] = useState<Container | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [editingContainer, setEditingContainer] = useState<Container | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [updateError, setUpdateError] = useState<string | null>(null)
  const [updateSuccess, setUpdateSuccess] = useState(false)
  const [showEditPassword, setShowEditPassword] = useState(false)
  const [showStatisticsModal, setShowStatisticsModal] = useState(false)
  const [statisticsContainer, setStatisticsContainer] = useState<Container | null>(null)
  const [statisticsData, setStatisticsData] = useState<any>(null)
  const [statisticsLoading, setStatisticsLoading] = useState(false)
  const [statisticsError, setStatisticsError] = useState<string | null>(null)
  const [newAccount, setNewAccount] = useState<NewAccountForm>({
    platform: "",
    server: "",
    platform_login: "",
    platform_password: "",
    account_size: "",
    account_type: "",
    profit_target: 0
  })

  // Containers are loaded via the cache hook, no need for separate useEffect

  const searchLower = searchTerm.trim().toLowerCase()
  const filteredContainers = containers.filter(container => {
    const matchesSearch = !searchLower ||
                         (container.id != null && String(container.id).toLowerCase().includes(searchLower)) ||
                         (container.platform != null && container.platform.toLowerCase().includes(searchLower)) ||
                         (container.account_type != null && container.account_type.toLowerCase().includes(searchLower)) ||
                         (container.order_id != null && String(container.order_id).toLowerCase().includes(searchLower))
    const matchesStatus = statusFilter === "all" || container.status.toLowerCase() === statusFilter.toLowerCase()
    // Filter by account_type matching buy page challenge_type values (exact match with same spelling and spacing)
    const matchesAccountType = accountTypeFilter === "all" || 
                               container.account_type === accountTypeFilter
    // Filter by platform matching buy page platform values (exact match with same spelling and spacing)
    const matchesPlatform = platformFilter === "all" || 
                            container.platform === platformFilter
    const matchesAvailability =
      availabilityFilter === "all" ||
      (availabilityFilter === "available" && !container.is_assigned) ||
      (availabilityFilter === "assigned" && container.is_assigned)
    const targetSize = accountSizeFilter === "all" ? null : parseInt(accountSizeFilter, 10)
    const matchesAccountSize =
      targetSize === null || getNumericAccountSize(container.account_size || '') === targetSize
    return matchesSearch && matchesStatus && matchesAccountType && matchesPlatform && matchesAvailability && matchesAccountSize
  })

  // Sort all containers: Newest first (by created_at or ID)
  const sortedContainers = [...filteredContainers].sort((a, b) => {
    // Primary sort: By creation date (newest first)
    const dateA = a.created_at ? new Date(a.created_at).getTime() : 0
    const dateB = b.created_at ? new Date(b.created_at).getTime() : 0
    
    if (dateA !== dateB) {
      return dateB - dateA // Newest first
    }
    
    // If no created_at or same date, sort by ID (newest first)
    return b.id - a.id
  })

  // Single pagination for all containers
  const containersPerPage = 20
  const totalPages = Math.ceil(sortedContainers.length / containersPerPage)
  const startIndex = (currentPage - 1) * containersPerPage
  const endIndex = startIndex + containersPerPage
  const paginatedContainers = sortedContainers.slice(startIndex, endIndex)

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilter, accountTypeFilter, platformFilter, availabilityFilter, accountSizeFilter])

  const getStatusColor = (status: string) => {
    if (!status) return "bg-gray-100 text-gray-600 border border-gray-300"
    switch (status.toLowerCase()) {
      case "active": return "bg-green-100 text-green-700 border border-green-300"
      case "inactive": return "bg-gray-100 text-gray-600 border border-gray-300"
      case "paused": return "bg-yellow-100 text-yellow-700 border border-yellow-300"
      case "error": return "bg-red-100 text-red-700 border border-red-300"
      default: return "bg-gray-100 text-gray-600 border border-gray-300"
    }
  }

  const getPlatformColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "mt4": return "text-green-600"
      case "mt5": return "text-purple-600"
      case "ctrader": return "text-orange-600"
      case "tradelocker": return "text-blue-600"
      default: return "text-gray-600"
    }
  }

  const buildStatisticsAccountId = (container: Container): string | null => {
    const platformLogin = container.platform_login?.trim()
    if (!platformLogin) return null
    const platform = (container.platform || '').toUpperCase()
    const isMT4 = platform === 'MT4' || platform.includes('MT4')
    const prefix = isMT4 ? 'mt4-' : 'mt5-'
    if (platformLogin.startsWith('mt4-') || platformLogin.startsWith('mt5-')) return platformLogin
    return `${prefix}${platformLogin}`
  }

  const handleShowStatistics = async (container: Container) => {
    const accountId = buildStatisticsAccountId(container)
    setStatisticsContainer(container)
    setShowStatisticsModal(true)
    setStatisticsData(null)
    if (!accountId) {
      setStatisticsError('This account has no platform login. Statistics are available after the account is configured.')
      setStatisticsLoading(false)
      return
    }
    setStatisticsError(null)
    setStatisticsLoading(true)
    try {
      const response = await fetch(`/api/statistics/${accountId}`, { method: 'GET', headers: { 'Content-Type': 'application/json' } })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) {
        setStatisticsError('Statistics are not available for this account.')
        setStatisticsData(null)
        return
      }
      if (result.success && result.statistics) {
        setStatisticsData(result)
        setStatisticsError(null)
      } else {
        setStatisticsError('Statistics are not available for this account.')
        setStatisticsData(null)
      }
    } catch (err) {
      console.error('Error fetching statistics:', err)
      setStatisticsError('Failed to load statistics.')
      setStatisticsData(null)
    } finally {
      setStatisticsLoading(false)
    }
  }

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError(null)
    setSubmitSuccess(false)

    try {
      const token = getAdminToken()
      if (!token) {
        setSubmitError("No access token found. Please log in again.")
        return
      }

      const response = await fetch('https://genz-34f298f57a04.herokuapp.com/accounts/credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          credentials: [newAccount]
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        setSubmitError(`Failed to add account: ${response.status} ${response.statusText} - ${errorText}`)
        return
      }

      setSubmitSuccess(true)
      setNewAccount({
        platform: "",
        server: "",
        platform_login: "",
        platform_password: "",
        account_size: "",
        account_type: "",
        profit_target: 0
      })
      
      // Reload the containers list
      await refresh()

      // Close form after 2 seconds
      setTimeout(() => {
        setShowAddForm(false)
        setSubmitSuccess(false)
      }, 2000)

    } catch (error: any) {
      console.error("Failed to add account:", error)
      setSubmitError(`Network error: ${error.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof NewAccountForm, value: string | number) => {
    setNewAccount(prev => ({
      ...prev,
      [field]: field === 'profit_target' ? (typeof value === 'string' ? parseFloat(value) || 0 : value) : value
    }))
  }

  const handleDeleteAccount = async (credentialId: number) => {
    setIsDeleting(true)
    setDeleteError(null)

    try {
      const token = getAdminToken()
      if (!token) {
        setDeleteError("No access token found. Please log in again.")
        setIsDeleting(false)
        return
      }

      const response = await fetch(`https://genz-34f298f57a04.herokuapp.com/accounts/credentials/${credentialId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        const errorText = await response.text()
        setDeleteError(`Failed to delete account: ${response.status} ${response.statusText} - ${errorText}`)
        setIsDeleting(false)
        setDeleteConfirmId(null)
        return
      }

      // Remove deleted container from cache
      updateData((prev) => (prev ? prev.filter((c) => c.id !== credentialId) : []))

      setDeleteConfirmId(null)
    } catch (error: any) {
      console.error("Failed to delete account:", error)
      setDeleteError(`Network error: ${error.message}`)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleEditAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingContainer) return

    setIsUpdating(true)
    setUpdateError(null)
    setUpdateSuccess(false)

    try {
      const token = getAdminToken()
      if (!token) {
        setUpdateError("No access token found. Please log in again.")
        return
      }

      const requestBody = {
        platform: editingContainer.platform || '',
        server: editingContainer.server || '',
        platform_login: editingContainer.platform_login || '',
        platform_password: editingContainer.platform_password || '',
        account_size: editingContainer.account_size || '',
        account_type: editingContainer.account_type || '',
        profit_target: 0
      }

      const response = await fetch(`https://genz-34f298f57a04.herokuapp.com/accounts/credentials/${editingContainer.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        const errorText = await response.text()
        setUpdateError(`Failed to update account: ${response.status} ${response.statusText} - ${errorText}`)
        return
      }

      setUpdateSuccess(true)
      
      // Reload the containers list
      await refresh()

      // Close form after 2 seconds
      setTimeout(() => {
        setEditingContainer(null)
        setUpdateSuccess(false)
      }, 2000)

    } catch (error: any) {
      console.error("Failed to update account:", error)
      setUpdateError(`Network error: ${error.message}`)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleEditInputChange = (field: keyof Container, value: string) => {
    if (!editingContainer) return
    setEditingContainer({
      ...editingContainer,
      [field]: value
    })
  }

  // Group containers by account_size and calculate stats
  // Include ALL containers regardless of status to show accurate totals
  const accountSizeGroups = containers.reduce((acc, container) => {
    const size = container.account_size || 'Unknown'
    if (!acc[size]) {
      acc[size] = {
        available: 0,
        assigned: 0,
        total: 0
      }
    }
    // Count all containers for this size
    acc[size].total++
    
    // Available: active and not assigned
    if (container.status === "active" && !container.is_assigned) {
      acc[size].available++
    }
    // Assigned: is_assigned is true (regardless of status)
    if (container.is_assigned) {
      acc[size].assigned++
    }
    return acc
  }, {} as Record<string, { available: number; assigned: number; total: number }>)

  // Sort account sizes numerically (handles 3000, 5000, 10000, 200000, etc.)
  const sortedAccountSizes = Object.entries(accountSizeGroups).sort((a, b) => {
    // Extract numeric value from account size (handles "3000", "2 lakhs", "200000", etc.)
    const getNumericSize = (sizeStr: string): number => {
      // Remove all non-numeric characters except for "lakh" conversion
      const cleaned = sizeStr.toLowerCase().replace(/[^0-9lakhs]/g, '')
      
      // Check if it contains "lakh" or "lakhs"
      if (cleaned.includes('lakh')) {
        const numMatch = cleaned.match(/(\d+)/)
        if (numMatch) {
          return parseInt(numMatch[1]) * 100000 // Convert lakhs to number
        }
      }
      
      // Try to extract pure number
      const numMatch = sizeStr.match(/(\d+)/)
      return numMatch ? parseInt(numMatch[1]) : 0
    }
    
    const sizeA = getNumericSize(a[0])
    const sizeB = getNumericSize(b[0])
    return sizeA - sizeB
  })

  // Fixed account sizes to show: available vs assigned per size
  const accountSizeTiers = [
    { label: '$3,000', value: 3000 },
    { label: '$5,000', value: 5000 },
    { label: '$10,000', value: 10000 },
    { label: '$20,000', value: 20000 },
    { label: '$25,000', value: 25000 },
    { label: '$50,000', value: 50000 },
    { label: '$100,000', value: 100000 },
    { label: '$200,000', value: 200000 },
    { label: '$500,000', value: 500000 },
  ]

  const getCountBySizeAndAvailability = (numericSize: number, assigned: boolean) => {
    return containers.filter(c => {
      const num = getNumericAccountSize(c.account_size || '')
      return num === numericSize && c.is_assigned === assigned
    }).length
  }

  const totalAvailable = containers.filter(c => !c.is_assigned).length
  const totalAssigned = containers.filter(c => c.is_assigned).length

  return (
    <AdminLayout
        title="Container Management"
        subtitle="Monitor and manage system containers and services"
      >
      {/* Top stats cards - professional pastel style */}
      {!isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="rounded-xl border border-gray-200 bg-violet-50 shadow-sm p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Total Accounts</p>
                <p className="text-2xl font-bold text-gray-900">{containers.length}</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-amber-50 shadow-sm p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Available</p>
                <p className="text-2xl font-bold text-gray-900">{totalAvailable}</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-emerald-50 shadow-sm p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Assigned</p>
                <p className="text-2xl font-bold text-gray-900">{totalAssigned}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Accounts by size - Professional pastel cards */}
      {!isLoading && containers.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Accounts by size</h3>
          <p className="text-sm text-gray-600 mb-4">Available vs assigned per account size</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {accountSizeTiers.map(({ label, value }) => {
              const available = getCountBySizeAndAvailability(value, false)
              const assigned = getCountBySizeAndAvailability(value, true)
              const total = available + assigned
              return (
                <div key={value} className="rounded-xl border border-gray-200 bg-white shadow-sm p-4 min-w-0">
                  <h4 className="text-sm font-bold text-gray-900 mb-3">{label}</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200">
                      <span className="text-xs font-medium text-gray-700">Available</span>
                      <span className="text-sm font-bold text-emerald-700">{available}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-gray-50 border border-gray-200">
                      <span className="text-xs font-medium text-gray-700">Assigned</span>
                      <span className="text-sm font-bold text-gray-700">{assigned}</span>
                    </div>
                    {total > 0 && (
                      <div className="text-xs text-gray-500 pt-1 border-t border-gray-200">
                        Total: {total}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Filters - Professional light style */}
      <SectionCard className="mb-6">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Availability</p>
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            type="button"
            onClick={() => setAvailabilityFilter("all")}
            className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors ${availabilityFilter === "all" ? "bg-gray-900 text-white shadow-sm" : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"}`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setAvailabilityFilter("available")}
            className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors ${availabilityFilter === "available" ? "bg-gray-900 text-white shadow-sm" : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"}`}
          >
            Available
          </button>
          <button
            type="button"
            onClick={() => setAvailabilityFilter("assigned")}
            className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors ${availabilityFilter === "assigned" ? "bg-gray-900 text-white shadow-sm" : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"}`}
          >
            Assigned
          </button>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search containers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900"
              />
            </div>
          </div>
          <div className="flex gap-3 flex-wrap">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="paused">Paused</option>
              <option value="error">Error</option>
            </select>
            <select
              value={accountTypeFilter}
              onChange={(e) => setAccountTypeFilter(e.target.value)}
              className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900"
            >
              <option value="all">All Account Types</option>
              <option value="Dragon Instant Pro">Dragon Instant Pro</option>
              <option value="HFT Dragon">HFT Dragon</option>
              <option value="Swing">Swing</option>
              <option value="Dragon Prime">Dragon Prime</option>
              <option value="Dragon Apex">Dragon Apex</option>
            </select>
            <select
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
              className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900"
            >
              <option value="all">All Platforms</option>
              <option value="MT5">MT5</option>
              <option value="MT4">MT4</option>
              <option value="cTrader">cTrader</option>
              <option value="TradeLocker">TradeLocker</option>
            </select>
            <select
              value={accountSizeFilter}
              onChange={(e) => setAccountSizeFilter(e.target.value)}
              className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900"
              title="Filter by account size"
            >
              {accountSizeFilterOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <button 
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors flex items-center gap-2 font-medium shadow-sm"
            >
              <PlusIcon className="w-4 h-4" />
              Add Account
            </button>
          </div>
        </div>
      </SectionCard>

      {/* Loading State */}
      {isLoading && (
        <SectionCard>
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-300 border-t-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading account credentials...</p>
          </div>
        </SectionCard>
      )}

      {/* Error Display */}
      {error && !isLoading && (
        <SectionCard>
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="text-red-700 text-sm font-medium">{error}</div>
          </div>
        </SectionCard>
      )}

      {/* All Accounts Table - Single Flow */}
      {!isLoading && sortedContainers.length > 0 && (
        <SectionCard padded={false}>
          <div className="mb-4 px-6 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">All Accounts ({sortedContainers.length})</h3>
            <p className="text-sm text-gray-600">All container accounts in one view</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1200px]">
              <thead className="border-b-2 border-gray-200 bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-3 text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">Account ID</th>
                  <th className="text-left py-3 px-3 text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">Platform</th>
                  <th className="text-left py-3 px-3 text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">Account Type</th>
                  <th className="text-left py-3 px-3 text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">Account Size</th>
                  <th className="text-left py-3 px-3 text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">Login/Password</th>
                  <th className="text-left py-3 px-3 text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">Order ID</th>
                  <th className="text-left py-3 px-3 text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">Status</th>
                  <th className="text-left py-3 px-3 text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">Availability</th>
                  <th className="text-left py-3 px-3 text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedContainers.map((container) => {
                  const isAvailable = !container.is_assigned
                  return (
                  <tr
                    key={container.id}
                    className={`border-b border-gray-200 transition-colors ${
                      isAvailable
                        ? 'bg-emerald-50/60 hover:bg-emerald-100/70'
                        : 'bg-gray-100/80 hover:bg-gray-200/80'
                    }`}
                  >
                    <td className="py-3 px-3">
                      <div className="text-gray-900 font-bold text-sm">{container.id}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-gray-700 font-semibold text-sm capitalize">{container.platform}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-gray-900 font-semibold text-sm capitalize">{container.account_type}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-gray-900 font-bold text-sm">${container.account_size}</span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex flex-col gap-1">
                        <span className="text-gray-900 font-mono font-semibold text-sm">{container.platform_login}</span>
                        <span className="text-gray-600 font-mono text-xs">{container.platform_password}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-gray-700 font-mono text-sm">{container.order_id || '—'}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap ${getStatusColor(container.status)}`}>
                        {container.status || '—'}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
                        isAvailable
                          ? 'bg-emerald-200/80 text-emerald-800 border border-emerald-400'
                          : 'bg-gray-300 text-gray-700 border border-gray-400'
                      }`}>
                        {isAvailable ? 'Available' : 'Assigned'}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        <button 
                          onClick={() => setSelectedContainer(container)}
                          className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="View Details"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleShowStatistics(container)}
                          className="p-1.5 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                          title="Statistics"
                        >
                          <ChartBarIcon className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setEditingContainer(container)}
                          className="p-1.5 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                          title="Edit Account"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setDeleteConfirmId(container.id)}
                          className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete Account"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  )
                })}
              </tbody>
            </table>

            {/* Single Pagination Controls */}
            {sortedContainers.length > containersPerPage && (
              <div className="mt-6 flex items-center justify-between px-6 py-4 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  Showing {startIndex + 1} to {Math.min(endIndex, sortedContainers.length)} of {sortedContainers.length} accounts
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                    }`}
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === totalPages
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </SectionCard>
      )}

      {/* No Accounts Found */}
      {!isLoading && !error && filteredContainers.length === 0 && (
        <SectionCard>
          <div className="p-12 text-center">
            <ArchiveBoxIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">No containers found</p>
          </div>
        </SectionCard>
      )}

      {/* Add Account Modal */}
      <Dialog open={showAddForm} onOpenChange={(open) => !isSubmitting && setShowAddForm(open)}>
        <DialogContent className="bg-white text-gray-900 border border-gray-200 max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">
              Add New Account Credentials
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleAddAccount} className="space-y-6">
            {/* Success Message */}
            {submitSuccess && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                <div className="text-emerald-700 text-sm font-medium">Account added successfully!</div>
              </div>
            )}

            {/* Error Message */}
            {submitError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="text-red-700 text-sm font-medium">{submitError}</div>
              </div>
            )}

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Platform *
                </label>
                <select
                  value={newAccount.platform}
                  onChange={(e) => handleInputChange('platform', e.target.value)}
                  required
                  className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900"
                >
                  <option value="">Select Platform</option>
                  <option value="MT5">MT5</option>
                  <option value="MT4">MT4</option>
                  <option value="cTrader">cTrader</option>
                  <option value="TradeLocker">TradeLocker</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Server *
                </label>
                <input
                  type="text"
                  value={newAccount.server}
                  onChange={(e) => handleInputChange('server', e.target.value)}
                  required
                  placeholder="Enter server"
                  className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Platform Login *
                </label>
                <input
                  type="text"
                  value={newAccount.platform_login}
                  onChange={(e) => handleInputChange('platform_login', e.target.value)}
                  required
                  placeholder="Enter platform login"
                  className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Platform Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newAccount.platform_password}
                    onChange={(e) => handleInputChange('platform_password', e.target.value)}
                    required
                    placeholder="Enter platform password"
                    className="w-full px-3 py-2.5 pr-10 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-900 transition-colors"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="w-5 h-5" />
                    ) : (
                      <EyeIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Size *
                </label>
                <select
                  value={newAccount.account_size}
                  onChange={(e) => handleInputChange('account_size', e.target.value)}
                  required
                  className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900"
                >
                  <option value="">Select Account Size</option>
                  <option value="3000">$3,000</option>
                  <option value="5000">$5,000</option>
                  <option value="10000">$10,000</option>
                  <option value="25000">$25,000</option>
                  <option value="50000">$50,000</option>
                  <option value="100000">$100,000</option>
                  <option value="200000">$200,000</option>
                  <option value="500000">$500,000</option>
                </select>
              </div>

            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors flex items-center gap-2 disabled:opacity-50 font-medium shadow-sm"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-white"></div>
                    Adding...
                  </>
                ) : (
                  <>
                    <PlusIcon className="w-4 h-4" />
                    Add Account
                  </>
                )}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Account Details Modal - Professional View (matches credentials page style) */}
      <Dialog open={!!selectedContainer} onOpenChange={(open) => !open && setSelectedContainer(null)}>
        <DialogContent className="bg-rose-50/80 text-gray-900 border border-gray-200 shadow-2xl max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl">
          <DialogHeader className="pb-4 border-b border-gray-200">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <DialogTitle className="text-xl font-bold text-gray-900 tracking-tight">
                Account Credentials
              </DialogTitle>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-gray-900 text-white">
                #{selectedContainer?.id}
              </span>
            </div>
          </DialogHeader>
          
          {selectedContainer && (
            <div className="space-y-6 pt-4">
              {/* Credential boxes: pastel cards, top to bottom, left to right */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {[
                  { label: 'Account ID', value: String(selectedContainer.id), mono: true },
                  { label: 'Platform', value: selectedContainer.platform || '—', mono: false, color: getPlatformColor(selectedContainer.platform) },
                  { label: 'Account Type', value: selectedContainer.account_type || '—', mono: false },
                  { label: 'Account Size', value: `$${selectedContainer.account_size || '—'}`, mono: false },
                  { label: 'Order ID', value: selectedContainer.order_id ? String(selectedContainer.order_id) : '—', mono: true },
                  { label: 'Status', value: selectedContainer.status || '—', mono: false },
                  { label: 'Availability', value: selectedContainer.is_assigned ? 'Assigned' : 'Available', mono: false },
                  { label: 'Server', value: selectedContainer.server || '—', mono: true },
                  { label: 'Platform Login', value: selectedContainer.platform_login || '—', mono: true },
                  { label: 'Platform Password', value: selectedContainer.platform_password || '—', mono: true },
                ].map(({ label, value, mono, color }) => (
                  <div
                    key={label}
                    className="flex flex-col rounded-xl border border-gray-200 bg-white shadow-sm p-4 hover:shadow-md transition-shadow"
                  >
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">{label}</span>
                    <div className="flex items-center justify-between gap-2 min-w-0">
                      <span className={`text-sm font-medium truncate ${mono ? 'font-mono' : ''} ${color || 'text-gray-900'}`}>
                        {value}
                      </span>
                      <button
                        onClick={() => navigator.clipboard.writeText(value)}
                        className="p-1.5 hover:bg-gray-100 rounded-lg shrink-0 text-gray-500 hover:text-gray-900 transition-colors"
                        title={`Copy ${label}`}
                      >
                        <ClipboardDocumentIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Timestamps row */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="flex flex-col rounded-xl border border-gray-200 bg-white shadow-sm p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CalendarIcon className="w-4 h-4 text-blue-500" />
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Created</span>
                  </div>
                  <span className="text-sm text-gray-900">{formatDateKarachi(selectedContainer.created_at)}</span>
                </div>
                <div className="flex flex-col rounded-xl border border-gray-200 bg-white shadow-sm p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CalendarIcon className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Updated</span>
                  </div>
                  <span className="text-sm text-gray-900">{formatDateKarachi(selectedContainer.updated_at)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200">
                <button
                  onClick={() => setEditingContainer(selectedContainer)}
                  className="px-4 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors flex items-center gap-2 text-sm font-medium shadow-sm"
                >
                  <PencilIcon className="w-4 h-4" />
                  Edit Account
                </button>
                <button
                  onClick={() => setSelectedContainer(null)}
                  className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Account Modal */}
      <Dialog open={!!editingContainer} onOpenChange={(open) => !open && !isUpdating && setEditingContainer(null)}>
        <DialogContent className="bg-white text-gray-900 border border-gray-200 max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">
              Edit Account Credentials - ID: {editingContainer?.id}
            </DialogTitle>
          </DialogHeader>
          
          {editingContainer && (
            <form onSubmit={handleEditAccount} className="space-y-6">
              {/* Success Message */}
              {updateSuccess && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <div className="text-emerald-700 text-sm font-medium">Account updated successfully!</div>
                </div>
              )}

              {/* Error Message */}
              {updateError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                  <div className="text-red-700 text-sm font-medium">{updateError}</div>
                </div>
              )}

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Platform *
                  </label>
                  <select
                    value={editingContainer.platform}
                    onChange={(e) => handleEditInputChange('platform', e.target.value)}
                    required
                    className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900"
                  >
                    <option value="">Select Platform</option>
                    <option value="MT5">MT5</option>
                    <option value="MT4">MT4</option>
                    <option value="cTrader">cTrader</option>
                    <option value="TradeLocker">TradeLocker</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Server *
                  </label>
                  <input
                    type="text"
                    value={editingContainer.server}
                    onChange={(e) => handleEditInputChange('server', e.target.value)}
                    required
                    placeholder="Enter server"
                    className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Platform Login *
                  </label>
                  <input
                    type="text"
                    value={editingContainer.platform_login}
                    onChange={(e) => handleEditInputChange('platform_login', e.target.value)}
                    required
                    placeholder="Enter platform login"
                    className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Platform Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showEditPassword ? "text" : "password"}
                      value={editingContainer.platform_password}
                      onChange={(e) => handleEditInputChange('platform_password', e.target.value)}
                      required
                      placeholder="Enter platform password"
                      className="w-full px-3 py-2.5 pr-10 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900"
                    />
                    <button
                      type="button"
                      onClick={() => setShowEditPassword(!showEditPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-900 transition-colors"
                    >
                      {showEditPassword ? (
                        <EyeSlashIcon className="w-5 h-5" />
                      ) : (
                        <EyeIcon className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Account Size *
                  </label>
                  <select
                    value={editingContainer.account_size}
                    onChange={(e) => handleEditInputChange('account_size', e.target.value)}
                    required
                    className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900"
                  >
                    <option value="">Select Account Size</option>
                    <option value="3000">$3,000</option>
                    <option value="5000">$5,000</option>
                    <option value="10000">$10,000</option>
                    <option value="25000">$25,000</option>
                    <option value="50000">$50,000</option>
                    <option value="100000">$100,000</option>
                    <option value="200000">$200,000</option>
                    <option value="500000">$500,000</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Account Type *
                  </label>
                  <select
                    value={editingContainer.account_type}
                    onChange={(e) => handleEditInputChange('account_type', e.target.value)}
                    required
                    className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900"
                  >
                    <option value="">Select Account Type</option>
                    <option value="Dragon Instant Pro">Dragon Instant Pro</option>
                    <option value="HFT Dragon">HFT Dragon</option>
                    <option value="Swing">Swing</option>
                    <option value="Dragon Prime">Dragon Prime</option>
                    <option value="Dragon Apex">Dragon Apex</option>
                  </select>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setEditingContainer(null)}
                  className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                  disabled={isUpdating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-4 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors flex items-center gap-2 disabled:opacity-50 font-medium shadow-sm"
                >
                  {isUpdating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-white"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <PencilIcon className="w-4 h-4" />
                      Update Account
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Statistics Modal - professional light theme like credentials */}
      <Dialog open={showStatisticsModal} onOpenChange={(open) => { if (!open) { setShowStatisticsModal(false); setStatisticsContainer(null); setStatisticsData(null); setStatisticsError(null) } }}>
        <DialogContent className="bg-rose-50/80 text-gray-900 border border-gray-200 shadow-2xl max-w-5xl w-[95vw] max-h-[90vh] overflow-y-auto rounded-2xl">
          <DialogHeader className="pb-4 border-b border-gray-200">
            <DialogTitle className="text-xl font-bold text-gray-900 tracking-tight">
              Account Statistics — {statisticsContainer ? `#${statisticsContainer.id} • ${statisticsContainer.platform_login}` : ''}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            {statisticsLoading && (
              <div className="flex justify-center py-12">
                <AdminLoader type="orders" message="Loading statistics..." />
              </div>
            )}
            {!statisticsLoading && statisticsError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium">
                {statisticsError}
              </div>
            )}
            {!statisticsLoading && statisticsData && statisticsContainer && !statisticsError && (
              <AdminOrderStatisticsView
                order={{
                  id: statisticsContainer.id,
                  order_id: String(statisticsContainer.order_id || statisticsContainer.id),
                  challenge_type: statisticsContainer.account_type,
                  account_type: statisticsContainer.account_type,
                  platform: statisticsContainer.platform,
                  profit_target: undefined,
                  status: statisticsContainer.status,
                  is_live: false,
                  is_stage2: false,
                  stage2_account: null,
                  live_account: null,
                  platform_login: statisticsContainer.platform_login,
                  credentials: statisticsContainer.platform_login ? { platform_login: statisticsContainer.platform_login } : undefined,
                  stage2_credentials: undefined,
                  live_credentials: undefined
                }}
                data={statisticsData}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={!!deleteConfirmId} onOpenChange={(open) => { if (!open && !isDeleting) { setDeleteConfirmId(null); setDeleteError(null) } }}>
        <DialogContent className="bg-white text-gray-900 border border-gray-200 max-w-md shadow-xl rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">
              Delete Account Credential
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-gray-600">
              Are you sure you want to delete account credential ID: <span className="font-bold text-gray-900">{deleteConfirmId}</span>?
            </p>
            <p className="text-sm text-red-600 font-medium">
              This action cannot be undone.
            </p>

            {deleteError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                <div className="text-red-700 text-sm font-medium">{deleteError}</div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => { setDeleteConfirmId(null); setDeleteError(null) }}
                className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => deleteConfirmId && handleDeleteAccount(deleteConfirmId)}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50 font-medium"
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-white"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <TrashIcon className="w-4 h-4" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}
