"use client"
import { useEffect, useState } from "react"
import { getApiBaseUrl, API_ENDPOINTS, authenticatedApiRequest, apiRequest, formDataApiRequest, handleApiSuccess } from '@/lib/api'
import AdminLayout from "@/components/admin-layout"
import SectionCard from "@/components/ui/section-card"
import { useAdminCache } from "@/hooks/use-admin-cache"
import { 
  ArchiveBoxIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  EyeSlashIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  KeyIcon,
  UserIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon
} from "@heroicons/react/24/outline"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { getAdminToken } from "@/lib/admin-auth"
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
  const [currentPage, setCurrentPage] = useState(1)
  
  // Use cached containers data (T = Container so data is Container[])
  const { data: cachedContainers, isLoading, error: fetchError, updateData } = useAdminCache<Container>({
    endpoint: `${getApiBaseUrl()}/accounts/credentials`,
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
  const [operationError, setOperationError] = useState<string | null>(null)
  const error = fetchError || operationError
  const [selectedContainer, setSelectedContainer] = useState<Container | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [editingContainer, setEditingContainer] = useState<Container | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [updateError, setUpdateError] = useState<string | null>(null)
  const [updateSuccess, setUpdateSuccess] = useState(false)
  const [showEditPassword, setShowEditPassword] = useState(false)
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

  const filteredContainers = containers.filter(container => {
    const matchesSearch = container.id.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
                         container.platform.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         container.account_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         container.order_id.toString().toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || container.status.toLowerCase() === statusFilter.toLowerCase()
    // Filter by account_type matching buy page challenge_type values (exact match with same spelling and spacing)
    const matchesAccountType = accountTypeFilter === "all" || 
                               container.account_type === accountTypeFilter
    // Filter by platform matching buy page platform values (exact match with same spelling and spacing)
    const matchesPlatform = platformFilter === "all" || 
                            container.platform === platformFilter
    return matchesSearch && matchesStatus && matchesAccountType && matchesPlatform
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
  }, [searchTerm, statusFilter, accountTypeFilter, platformFilter])

  const getStatusColor = (status: string) => {
    if (!status) return "bg-gray-100 text-gray-600 border border-gray-300"
    switch (status.toLowerCase()) {
      case "active": return "bg-slate-100 text-slate-700 border border-slate-300"
      case "inactive": return "bg-gray-100 text-gray-600 border border-gray-300"
      case "paused": return "bg-yellow-100 text-yellow-700 border border-yellow-300"
      case "error": return "bg-red-100 text-red-700 border border-red-300"
      default: return "bg-gray-100 text-gray-600 border border-gray-300"
    }
  }

  const getPlatformColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "mt4": return "text-slate-600"
      case "mt5": return "text-purple-400"
      case "ctrader": return "text-orange-400"
      case "tradelocker": return "text-blue-400"
      default: return "text-gray-400"
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

      const response = await fetch(`${getApiBaseUrl()}/accounts/credentials`, {
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
      const loadContainers = async () => {
        try {
          const response = await fetch(`${getApiBaseUrl()}/accounts/credentials`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            }
          })

          if (response.ok) {
            const data = await response.json()
            const containersList = Array.isArray(data) ? data : []
            // Sort by newest first (by created_at or id)
            const sortedContainers = containersList.sort((a: Container, b: Container) => {
              const dateA = a.created_at ? new Date(a.created_at).getTime() : a.id
              const dateB = b.created_at ? new Date(b.created_at).getTime() : b.id
              return dateB - dateA // Descending order (newest first)
            })
            updateData(sortedContainers)
          }
        } catch (error) {
          console.error("Failed to reload containers:", error)
        }
      }
      loadContainers()

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
    setOperationError(null)

    try {
      const token = getAdminToken()
      if (!token) {
        setOperationError("No access token found. Please log in again.")
        setIsDeleting(false)
        return
      }

      const response = await fetch(`${getApiBaseUrl()}/accounts/credentials/${credentialId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        const errorText = await response.text()
        setOperationError(`Failed to delete account: ${response.status} ${response.statusText} - ${errorText}`)
        setIsDeleting(false)
        setDeleteConfirmId(null)
        return
      }

      // Reload the containers list
      const loadContainers = async () => {
        try {
          const response = await fetch(`${getApiBaseUrl()}/accounts/credentials`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            }
          })

          if (response.ok) {
            const data = await response.json()
            const containersList = Array.isArray(data) ? data : []
            // Sort by newest first (by created_at or id)
            const sortedContainers = containersList.sort((a: Container, b: Container) => {
              const dateA = a.created_at ? new Date(a.created_at).getTime() : a.id
              const dateB = b.created_at ? new Date(b.created_at).getTime() : b.id
              return dateB - dateA // Descending order (newest first)
            })
            updateData(sortedContainers)
          }
        } catch (error) {
          console.error("Failed to reload containers:", error)
        }
      }
      await loadContainers()
      
      setDeleteConfirmId(null)
    } catch (error: any) {
      console.error("Failed to delete account:", error)
      setOperationError(`Network error: ${error.message}`)
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

      const response = await fetch(`${getApiBaseUrl()}/accounts/credentials/${editingContainer.id}`, {
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
      const loadContainers = async () => {
        try {
          const response = await fetch(`${getApiBaseUrl()}/accounts/credentials`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            }
          })

          if (response.ok) {
            const data = await response.json()
            const containersList = Array.isArray(data) ? data : []
            // Sort by newest first (by created_at or id)
            const sortedContainers = containersList.sort((a: Container, b: Container) => {
              const dateA = a.created_at ? new Date(a.created_at).getTime() : a.id
              const dateB = b.created_at ? new Date(b.created_at).getTime() : b.id
              return dateB - dateA // Descending order (newest first)
            })
            updateData(sortedContainers)
          }
        } catch (error) {
          console.error("Failed to reload containers:", error)
        }
      }
      loadContainers()

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

  // Calculate available accounts for specific account sizes
  const accountSizeCards = [
    { size: '3000', label: '$3,000', numericValue: 3000 },
    { size: '5000', label: '$5,000', numericValue: 5000 },
    { size: '10000', label: '$10,000', numericValue: 10000 },
    { size: '25000', label: '$25,000', numericValue: 25000 },
    { size: '50000', label: '$50,000', numericValue: 50000 },
    { size: '1 lakh', label: '$1 Lakh', numericValue: 100000 },
    { size: '2 lakh', label: '$2 Lakh', numericValue: 200000 },
    { size: '5 lakh', label: '$5 Lakh', numericValue: 500000 },
  ]

  // Helper function to convert account size string to numeric value
  const getNumericAccountSize = (sizeStr: string): number => {
    if (!sizeStr) return 0
    
    const cleaned = sizeStr.toLowerCase().trim()
    
    // Check if it contains "lakh" or "lakhs"
    if (cleaned.includes('lakh')) {
      const numMatch = cleaned.match(/(\d+)/)
      if (numMatch) {
        return parseInt(numMatch[1]) * 100000 // Convert lakhs to number (1 lakh = 100000)
      }
    }
    
    // Try to extract pure number
    const numMatch = sizeStr.match(/(\d+)/)
    return numMatch ? parseInt(numMatch[1]) : 0
  }

  const getAvailableCount = (targetSize: string, targetNumericValue: number) => {
    return containers.filter(container => {
      // Get numeric value of container's account size
      const containerNumeric = getNumericAccountSize(container.account_size || '')
      
      // Match by numeric value (handles "1 lakh" = "100000", "2 lakh" = "200000", etc.)
      const sizeMatch = containerNumeric === targetNumericValue
      
      // Check if status is "available" OR "pending" (case-insensitive)
      const status = container.status?.toLowerCase() || ''
      const isAvailableOrPending = status === 'available' || status === 'pending'
      
      return sizeMatch && isAvailableOrPending
    }).length
  }

  return (
    <AdminLayout
        title="Container Management"
        subtitle="Monitor and manage system containers and services"
      >
      {/* Account Size Cards - Available Accounts */}
      {!isLoading && containers.length > 0 && (
        <div className="mb-6">
          <div className="mb-3">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Available Accounts by Size</h3>
            <p className="text-sm text-gray-600">Accounts with status 'available' or 'pending'</p>
          </div>
          <div className="flex flex-wrap gap-3 overflow-x-auto pb-2">
            {accountSizeCards.map(({ size, label, numericValue }) => {
              const availableCount = getAvailableCount(size, numericValue)
              return (
                <SectionCard key={size} className="hover:shadow-md transition-shadow min-w-[140px] flex-shrink-0">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">{label}</h4>
                    </div>
                    <div className="p-1 rounded-lg bg-slate-100 border border-slate-300">
                      <ArchiveBoxIcon className="w-4 h-4 text-slate-600" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-xs font-medium text-gray-700">Available</span>
                    <span className="text-base font-bold text-slate-700">{availableCount}</span>
                  </div>
                </SectionCard>
              )
            })}
          </div>
        </div>
      )}

      {/* Filters */}
      <SectionCard>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search containers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
              />
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500"
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
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500"
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
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500"
            >
              <option value="all">All Platforms</option>
              <option value="MT5">MT5</option>
              <option value="MT4">MT4</option>
              <option value="cTrader">cTrader</option>
              <option value="TradeLocker">TradeLocker</option>
            </select>
            <button 
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-red-600 border border-red-500 rounded-lg text-white hover:bg-red-700 transition-colors flex items-center gap-2"
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
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading account credentials...</p>
          </div>
        </SectionCard>
      )}

      {/* Error Display */}
      {error && !isLoading && (
        <SectionCard>
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="text-red-400 text-sm">{error}</div>
            </div>
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
                  <th className="text-left py-3 px-3 text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">Assigned</th>
                  <th className="text-left py-3 px-3 text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedContainers.map((container) => (
                  <tr key={container.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
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
                        container.is_assigned 
                          ? 'bg-slate-100 text-slate-700 border border-slate-300' 
                          : 'bg-gray-100 text-gray-600 border border-gray-300'
                      }`}>
                        {container.is_assigned ? 'Yes' : 'No'}
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
                        <button className="p-1.5 text-gray-600 hover:text-yellow-600 hover:bg-yellow-50 rounded transition-colors" title="Credentials">
                          <KeyIcon className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setEditingContainer(container)}
                          className="p-1.5 text-gray-600 hover:text-slate-700 hover:bg-slate-50 rounded transition-colors"
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
                ))}
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
          <div className="p-8 text-center">
            <ArchiveBoxIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400">No containers found</p>
          </div>
        </SectionCard>
      )}

      {/* Add Account Modal */}
      <Dialog open={showAddForm} onOpenChange={(open) => !isSubmitting && setShowAddForm(open)}>
        <DialogContent className="bg-gray-900 text-white border border-gray-700 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">
              Add New Account Credentials
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleAddAccount} className="space-y-6">
            {/* Success Message */}
            {submitSuccess && (
              <div className="p-4 bg-slate-500/10 border border-slate-300 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="text-slate-700 text-sm">Account added successfully!</div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {submitError && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="text-red-400 text-sm">{submitError}</div>
                </div>
              </div>
            )}

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Platform *
                </label>
                <select
                  value={newAccount.platform}
                  onChange={(e) => handleInputChange('platform', e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500"
                >
                  <option value="">Select Platform</option>
                  <option value="MT5">MT5</option>
                  <option value="MT4">MT4</option>
                  <option value="cTrader">cTrader</option>
                  <option value="TradeLocker">TradeLocker</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Server *
                </label>
                <input
                  type="text"
                  value={newAccount.server}
                  onChange={(e) => handleInputChange('server', e.target.value)}
                  required
                  placeholder="Enter server"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Platform Login *
                </label>
                <input
                  type="text"
                  value={newAccount.platform_login}
                  onChange={(e) => handleInputChange('platform_login', e.target.value)}
                  required
                  placeholder="Enter platform login"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Platform Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newAccount.platform_password}
                    onChange={(e) => handleInputChange('platform_password', e.target.value)}
                    required
                    placeholder="Enter platform password"
                    className="w-full px-3 py-2 pr-10 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
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
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Account Size *
                </label>
                <select
                  value={newAccount.account_size}
                  onChange={(e) => handleInputChange('account_size', e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500"
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
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Account Type *
                </label>
                <select
                  value={newAccount.account_type}
                  onChange={(e) => handleInputChange('account_type', e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500"
                >
                  <option value="">Select Account Type</option>
                  <option value="Dragon Instant Pro">Dragon Instant Pro</option>
                  <option value="HFT Dragon">HFT Dragon</option>
                  <option value="Swing">Swing</option>
                  <option value="Dragon Prime">Dragon Prime</option>
                  <option value="Dragon Apex">Dragon Apex</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Profit Target *
                </label>
                <input
                  type="number"
                  value={newAccount.profit_target}
                  onChange={(e) => {
                    const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                    handleInputChange('profit_target', isNaN(val) ? 0 : val);
                  }}
                  required
                  min="0"
                  step="0.01"
                  placeholder="e.g., 0, 1000"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
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

      {/* Account Details Modal */}
      <Dialog open={!!selectedContainer} onOpenChange={(open) => !open && setSelectedContainer(null)}>
        <DialogContent className="bg-gray-900 text-white border border-gray-700 max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">
              Account Credentials - ID: {selectedContainer?.id}
            </DialogTitle>
          </DialogHeader>
          
          {selectedContainer && (
            <div className="space-y-6">
              {/* Account Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Account Information</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Account ID:</span>
                        <span className="text-white font-mono">{selectedContainer.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Platform:</span>
                        <span className={`capitalize ${getPlatformColor(selectedContainer.platform)}`}>
                          {selectedContainer.platform}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Account Type:</span>
                        <span className="text-white capitalize">{selectedContainer.account_type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Account Size:</span>
                        <span className="text-slate-300 font-semibold">${selectedContainer.account_size}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Assignment & Status</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Order ID:</span>
                        <span className="text-white font-mono">{selectedContainer.order_id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Status:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedContainer.status)}`}>
                          {selectedContainer.status}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Assigned:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          selectedContainer.is_assigned 
                            ? 'bg-slate-500/20 text-slate-700' 
                            : 'bg-gray-500/20 text-gray-400'
                        }`}>
                          {selectedContainer.is_assigned ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Trading Platform Details */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Trading Platform Details</h3>
                <div className="bg-gray-800/50 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Server:</span>
                    <span className="text-white font-mono">{selectedContainer.server}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Platform Login:</span>
                    <span className="text-white font-mono">{selectedContainer.platform_login}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Platform Password:</span>
                    <span className="text-white font-mono">{selectedContainer.platform_password}</span>
                  </div>
                </div>
              </div>

              {/* Timestamps */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Timestamps</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CalendarIcon className="w-5 h-5 text-blue-400" />
                      <span className="text-white font-medium">Created At</span>
                    </div>
                    <p className="text-gray-300 text-sm">{formatDateKarachi(selectedContainer.created_at)}</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CalendarIcon className="w-5 h-5 text-slate-600" />
                      <span className="text-white font-medium">Updated At</span>
                    </div>
                    <p className="text-gray-300 text-sm">{formatDateKarachi(selectedContainer.updated_at)}</p>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Quick Actions</h3>
                <div className="flex flex-wrap gap-3">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                    <KeyIcon className="w-4 h-4" />
                    Copy Credentials
                  </button>
                  <button className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-2">
                    <UserIcon className="w-4 h-4" />
                    Assign to User
                  </button>
                  <button className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors flex items-center gap-2">
                    <PencilIcon className="w-4 h-4" />
                    Edit Account
                  </button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Account Modal */}
      <Dialog open={!!editingContainer} onOpenChange={(open) => !open && !isUpdating && setEditingContainer(null)}>
        <DialogContent className="bg-gray-900 text-white border border-gray-700 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">
              Edit Account Credentials - ID: {editingContainer?.id}
            </DialogTitle>
          </DialogHeader>
          
          {editingContainer && (
            <form onSubmit={handleEditAccount} className="space-y-6">
              {/* Success Message */}
              {updateSuccess && (
                <div className="p-4 bg-slate-500/10 border border-slate-300 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="text-slate-700 text-sm">Account updated successfully!</div>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {updateError && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="text-red-400 text-sm">{updateError}</div>
                  </div>
                </div>
              )}

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Platform *
                  </label>
                  <select
                    value={editingContainer.platform}
                    onChange={(e) => handleEditInputChange('platform', e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="">Select Platform</option>
                    <option value="MT5">MT5</option>
                    <option value="MT4">MT4</option>
                    <option value="cTrader">cTrader</option>
                    <option value="TradeLocker">TradeLocker</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Server *
                  </label>
                  <input
                    type="text"
                    value={editingContainer.server}
                    onChange={(e) => handleEditInputChange('server', e.target.value)}
                    required
                    placeholder="Enter server"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Platform Login *
                  </label>
                  <input
                    type="text"
                    value={editingContainer.platform_login}
                    onChange={(e) => handleEditInputChange('platform_login', e.target.value)}
                    required
                    placeholder="Enter platform login"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Platform Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showEditPassword ? "text" : "password"}
                      value={editingContainer.platform_password}
                      onChange={(e) => handleEditInputChange('platform_password', e.target.value)}
                      required
                      placeholder="Enter platform password"
                      className="w-full px-3 py-2 pr-10 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowEditPassword(!showEditPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
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
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Account Size *
                  </label>
                  <select
                    value={editingContainer.account_size}
                    onChange={(e) => handleEditInputChange('account_size', e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500"
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
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Account Type *
                  </label>
                  <select
                    value={editingContainer.account_type}
                    onChange={(e) => handleEditInputChange('account_type', e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500"
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
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
                <button
                  type="button"
                  onClick={() => setEditingContainer(null)}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  disabled={isUpdating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {isUpdating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
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

      {/* Delete Confirmation Modal */}
      <Dialog open={!!deleteConfirmId} onOpenChange={(open) => !open && !isDeleting && setDeleteConfirmId(null)}>
        <DialogContent className="bg-gray-900 text-white border border-gray-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">
              Delete Account Credential
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-gray-300">
              Are you sure you want to delete account credential ID: <span className="font-bold text-white">{deleteConfirmId}</span>?
            </p>
            <p className="text-sm text-red-400">
              This action cannot be undone.
            </p>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <div className="text-red-400 text-sm">{error}</div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => deleteConfirmId && handleDeleteAccount(deleteConfirmId)}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
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
