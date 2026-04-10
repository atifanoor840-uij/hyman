"use client"
import { useEffect, useState, useMemo, type ReactElement } from "react"
import { toast } from "@/hooks/use-toast"
import AdminLayout from "@/components/admin-layout"
import SectionCard from "@/components/ui/section-card"
import { formatDateKarachi, formatDateExact } from '@/lib/utils'
import { useCachedOrders } from '@/hooks/use-cached-orders'
import { invalidateCachesForStatusChange, broadcastCacheInvalidation } from '@/lib/order-cache-utils'
import {
  ClipboardDocumentListIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckIcon,
  XMarkIcon,
  ClockIcon,
  ArrowTopRightOnSquareIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  CreditCardIcon,
  CheckCircleIcon,
  PlayIcon,
  XCircleIcon,
  PencilIcon,
  ClipboardIcon,
  ArrowRightOnRectangleIcon,
  ChartBarIcon,
  BookmarkIcon,
  ChevronRightIcon,
  UserGroupIcon
} from "@heroicons/react/24/outline"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import AdminLoader from "@/components/ui/admin-loader"
import AdminLoginAsUserModal from "@/components/admin-login-as-user-modal"
import { AdminOrderStatisticsView } from "@/components/admin-order-statistics-view"

interface Order {
  id: number
  order_id: string
  username: string
  email: string
  admin_access_password?: string
  amount: number | null
  challenge_type: string
  account_size: string
  platform: string
  payment_method: string | null
  txid: string | null
  payment_intent_id?: string | null
  checkout_session_url: string | null
  image: {
    url: string
    public_id: string
    created_at: string
  } | null
  status: string | null
  created_at: string | null
  is_active: boolean
  timeline: Array<{
    event_type: string
    event_date: string
    notes: string
  }>
  completed: boolean
  server: string | null
  platform_login: string | null
  platform_password: string | null
  profit_target: number | null
  completed_at: string | null
  passed: boolean
  is_stage2: boolean
  is_live: boolean
  failed: boolean
  fail_order?: {
    reason: string
    failed_at: string
  }
  stage2_account?: {
    credential_id?: number
    account_status?: string
    server: string
    platform_login: string
    platform_password: string
    session_id: string
    terminal_id: number
    profit_target: number
    status: string
    created_at: string
  }
  live_account?: {
    credential_id?: number
    account_status?: string
    server: string
    platform_login: string
    platform_password: string
    session_id: string
    terminal_id: number
    profit_share: number
    status: string
    created_at: string
  }
  credential_id?: number
  account_status?: string
  has_account_credential?: boolean
  credentials_with_status?: Array<{ credential_id: number; account_type: string; account_status: string }>
}

interface OrdersAnalytics {
  users: { total_users: number }
  orders: {
    total_orders: number
    completed_orders: number
    passed_orders: number
    failed_orders: number
    stage2_accounts: number
    live_accounts: number
    running_orders: number
    pending_orders: number
    recent_orders_30d: number
  }
}

export default function AdminOrdersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState<string>("")
  const [quickFilter, setQuickFilter] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showPaymentImage, setShowPaymentImage] = useState<string | null>(null)
  const [editingOrder, setEditingOrder] = useState<Order | null>(null)
  const [showCredentialsModal, setShowCredentialsModal] = useState(false)
  const [showLoginAsUserModal, setShowLoginAsUserModal] = useState(false)
  const [loginAsUserEmail, setLoginAsUserEmail] = useState("")
  const [loginAsUserPassword, setLoginAsUserPassword] = useState("")
  const [isFetchingPassword, setIsFetchingPassword] = useState<string | null>(null) // Store email being processed
  const [credentialsOrder, setCredentialsOrder] = useState<Order | null>(null)
  const [showStatisticsModal, setShowStatisticsModal] = useState(false)
  const [statisticsOrder, setStatisticsOrder] = useState<Order | null>(null)
  const [statisticsData, setStatisticsData] = useState<any>(null)
  const [statisticsLoading, setStatisticsLoading] = useState(false)
  const [statisticsError, setStatisticsError] = useState<string | null>(null)
  const [isEditingCredentials, setIsEditingCredentials] = useState(false)
  const [credentialsForm, setCredentialsForm] = useState({
    credential_id: '',
    server: '',
    platform_login: '',
    platform_password: '',
    profit_target: '',
    profit_share: '',
    account_type: 'completed' as 'completed' | 'stage2' | 'live'
  })
  const [isSavingCredentials, setIsSavingCredentials] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoadingOrderDetails, setIsLoadingOrderDetails] = useState(false)
  const [availableContainers, setAvailableContainers] = useState<any[]>([])
  const [isLoadingContainers, setIsLoadingContainers] = useState(false)
  const [selectedContainerId, setSelectedContainerId] = useState<number | null>(null)
  const [showEditPassword, setShowEditPassword] = useState(false)
  const [manualChangeStatus, setManualChangeStatus] = useState<string>('active')
  const [changeStatusLoading, setChangeStatusLoading] = useState(false)
  const [editForm, setEditForm] = useState({
    status: '',
    server: '',
    login: '',
    password: '',
    profitTarget: '',
    accountType: '',
    reason: '',
    date: '',
    profitAmount: '',
    sessionId: '',
    terminalId: ''
  })

  const apiBase = 'https://genz-34f298f57a04.herokuapp.com'

  const [analytics, setAnalytics] = useState<OrdersAnalytics | null>(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(true)
  const [analyticsError, setAnalyticsError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setAnalyticsLoading(true)
    setAnalyticsError(null)
    fetch(`${apiBase}/orders/analytics`)
      .then((res) => {
        if (!res.ok) throw new Error(`Analytics failed: ${res.status}`)
        return res.json()
      })
      .then((data: OrdersAnalytics) => {
        if (!cancelled) setAnalytics(data)
      })
      .catch((err) => {
        if (!cancelled) setAnalyticsError(err?.message ?? 'Failed to load analytics')
      })
      .finally(() => {
        if (!cancelled) setAnalyticsLoading(false)
      })
    return () => { cancelled = true }
  }, [apiBase])

  // Use cached orders hook for "all" orders (backend may exclude failed)
  const { data: rawOrders, isLoading, error: fetchError, refresh } = useCachedOrders<Order>({
    endpoint: `${apiBase}/orders/list/all`,
    storageKey: 'admin_orders_all',
    transformData: (data) => {
      const allOrders = Array.isArray(data) ? data : []
      return allOrders.sort((a: Order, b: Order) => {
        const dateA = a.timeline && a.timeline.length > 0 ? new Date(a.timeline[0].event_date).getTime() : a.id
        const dateB = b.timeline && b.timeline.length > 0 ? new Date(b.timeline[0].event_date).getTime() : b.id
        return dateB - dateA
      })
    },
    mergeStrategy: 'smart',
  })

  // Fetch failed orders separately so they always show when user clicks "Failed orders" (don't hide them)
  const { data: failedOrdersList } = useCachedOrders<Order>({
    endpoint: `${apiBase}/orders/list/failed`,
    storageKey: 'admin_orders_failed_merge',
    transformData: (data) => Array.isArray(data) ? data : [],
    mergeStrategy: 'smart',
  })

  // Local error state for specific actions (editing, etc.)
  const [error, setError] = useState<string | null>(null)

  // Store orders state: merge "all" + "failed" so failed orders are never hidden
  const [orders, setOrders] = useState<Order[]>([])

  const isOrderFailed = (order: Order) =>
    order.failed === true ||
    order.status?.toLowerCase() === 'failed' ||
    !!(order as any).fail_order

  const sortOrdersNewestFirst = (list: Order[]) =>
    [...list].sort((a, b) => {
      const dateA = a.timeline?.length ? new Date(a.timeline[0].event_date).getTime() : (a.created_at ? new Date(a.created_at).getTime() : a.id)
      const dateB = b.timeline?.length ? new Date(b.timeline[0].event_date).getTime() : (b.created_at ? new Date(b.created_at).getTime() : b.id)
      return dateB - dateA
    })

  // Merge backend data into existing orders: never drop an order we already have.
  // So when one order is delivered/failed/passed, only that order moves section; rest stay as-is.
  useEffect(() => {
    setOrders((prevOrders) => {
      const byId = new Map<number, Order>()
      // Keep all existing orders first (preserve structure – don't drop delivered/passed/live)
      prevOrders.forEach((o: Order) => { byId.set(o.id, o) })
      // Overwrite with fresh backend data when we have it (same order ID = update only that one)
      rawOrders.forEach((o: Order) => { byId.set(o.id, o) })
      failedOrdersList.forEach((o: Order) => { byId.set(o.id, o) })
      return sortOrdersNewestFirst(Array.from(byId.values()))
    })
  }, [rawOrders, failedOrdersList])

  // Enhanced search function that searches specific fields
  const matchesSearch = (order: Order, searchTerm: string): boolean => {
    if (!searchTerm) return true
    
    const searchLower = searchTerm.toLowerCase().trim()
    
    // Search in specific fields:
    // 1. Order ID
    if (order.order_id?.toLowerCase().includes(searchLower)) return true
    
    // 2. User email
    if (order.email?.toLowerCase().includes(searchLower)) return true
    
    // 3. Username
    if (order.username?.toLowerCase().includes(searchLower)) return true
    
    // 4. Account credentials - Platform Login
    if (order.platform_login?.toLowerCase().includes(searchLower)) return true
    
    // 5. Account credentials - Platform Password
    if (order.platform_password?.toLowerCase().includes(searchLower)) return true
    
    // 6. Account credentials - Server
    if (order.server?.toLowerCase().includes(searchLower)) return true
    
    // 7. Stage 2 account credentials
    if (order.stage2_account?.platform_login?.toLowerCase().includes(searchLower)) return true
    if (order.stage2_account?.platform_password?.toLowerCase().includes(searchLower)) return true
    if (order.stage2_account?.server?.toLowerCase().includes(searchLower)) return true
    
    // 8. Live account credentials
    if (order.live_account?.platform_login?.toLowerCase().includes(searchLower)) return true
    if (order.live_account?.platform_password?.toLowerCase().includes(searchLower)) return true
    if (order.live_account?.server?.toLowerCase().includes(searchLower)) return true
    
    // 9. Challenge type
    if (order.challenge_type?.toLowerCase().includes(searchLower)) return true
    
    // 10. Account size
    if (order.account_size?.toLowerCase().includes(searchLower)) return true
    
    // 11. Platform
    if (order.platform?.toLowerCase().includes(searchLower)) return true
    
    // 12. Payment method
    if (order.payment_method?.toLowerCase().includes(searchLower)) return true
    
    // 13. Transaction ID
    if (order.txid?.toLowerCase().includes(searchLower)) return true
    
    // 14. Payment intent ID
    if (order.payment_intent_id?.toLowerCase().includes(searchLower)) return true
    
    // 15. Status
    if (order.status?.toLowerCase().includes(searchLower)) return true
    
    // 16. Order ID (numeric)
    if (order.id?.toString().includes(searchLower)) return true
    
    return false
  }

  // Calculate orders by date
  const getOrdersByDate = () => {
    const ordersByDate: Record<string, number> = {}
    orders.forEach(order => {
      try {
        // Use created_at if available, otherwise use first timeline event date
        const dateStr = order.created_at || (order.timeline && order.timeline.length > 0 ? order.timeline[0].event_date : null)
        if (dateStr) {
          const date = new Date(dateStr)
          const dateKey = date.toISOString().split('T')[0] // YYYY-MM-DD format
          ordersByDate[dateKey] = (ordersByDate[dateKey] || 0) + 1
        }
      } catch (error) {
        // Skip invalid dates
      }
    })
    return ordersByDate
  }

  const ordersByDate = getOrdersByDate()
  const sortedDates = Object.keys(ordersByDate).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

  const filteredOrders = orders.filter(order => {
    const matchesSearchTerm = matchesSearch(order, searchTerm)
    const matchesStatus = statusFilter === "all" || order.status?.toLowerCase() === statusFilter.toLowerCase()
    
    const matchesDate = !dateFilter || (() => {
      try {
        const dateStr = order.created_at || (order.timeline && order.timeline.length > 0 ? order.timeline[0].event_date : null)
        if (!dateStr) return false
        const orderDate = new Date(dateStr).toISOString().split('T')[0]
        return orderDate === dateFilter
      } catch (error) {
        return false
      }
    })()

    const isPending = order.status?.toLowerCase() === "pending"
    const isPaid = !isPending
    const matchesQuickFilter = (() => {
      if (quickFilter === "all") return true
      if (quickFilter === "pending") return isPending
      if (quickFilter === "passed") return order.passed === true || order.status?.toLowerCase() === "passed"
      if (quickFilter === "failed") return order.failed === true || order.status?.toLowerCase() === "failed"
      if (quickFilter === "delivered") {
        const isDelivered = order.completed === true || order.status?.toLowerCase() === "completed" || order.status?.toLowerCase() === "delivered"
        if (!isDelivered) return false
        if (order.failed === true || order.status?.toLowerCase() === "failed") return false
        if (order.passed === true || order.status?.toLowerCase() === "passed") return false
        if (order.is_live === true) return false
        if (order.is_stage2 === true) return false
        if (order.challenge_type?.toLowerCase().includes("instant")) return false
        return true
      }
      if (quickFilter === "stage2") return order.is_stage2 === true && !order.challenge_type?.toLowerCase().includes("instant")
      if (quickFilter === "dragon_instant_pro") return order.challenge_type?.toLowerCase().includes("instant pro") || order.challenge_type?.toLowerCase().includes("dragon instant pro")
      if (quickFilter === "dragon_prime") return order.challenge_type?.toLowerCase().includes("dragon prime") || order.challenge_type?.toLowerCase().includes("dragon 2") || order.challenge_type?.toLowerCase().includes("dragon2")
      if (quickFilter === "dragon_apex") return order.challenge_type?.toLowerCase().includes("dragon apex") || order.challenge_type?.toLowerCase().includes("dragon 1") || order.challenge_type?.toLowerCase().includes("dragon1")
      if (quickFilter === "crypto") return (order.payment_method?.toUpperCase() === "CRYPTO") && isPending
      if (quickFilter === "card") return (order.payment_method?.toUpperCase() === "CARD") && isPending
      if (quickFilter === "crypto_paid") return (order.payment_method?.toUpperCase() === "CRYPTO") && isPaid
      if (quickFilter === "card_paid") return (order.payment_method?.toUpperCase() === "CARD") && isPaid
      return true
    })()
    
    return matchesSearchTerm && matchesStatus && matchesDate && matchesQuickFilter
  })

  // Pagination
  const ordersPerPage = 20
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage)
  const startIndex = (currentPage - 1) * ordersPerPage
  const endIndex = startIndex + ordersPerPage
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex)

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilter, dateFilter, quickFilter])

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

  const totalOrders = orders.length
  const filteredOrdersCount = filteredOrders.length

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

    orders.forEach(order => {
      try {
        const dateStr = order.created_at || (order.timeline && order.timeline.length > 0 ? order.timeline[0].event_date : null)
        if (!dateStr) return
        const orderDate = new Date(dateStr)
        if (orderDate >= todayStart) {
          todayCount++
        }
        if (orderDate >= weekStart) {
          weekCount++
        }
        if (orderDate >= monthStart) {
          monthCount++
        }
      } catch (error) {
        // Skip invalid dates
      }
    })

    return { todayCount, weekCount, monthCount }
  }

  const timeStats = getTimeStats()

  const getStatusColor = (status: string | null | undefined) => {
    if (!status) return "bg-white/10 text-white/70"
    switch (status.toLowerCase()) {
      case "pending": return "bg-yellow-500/20 text-yellow-400"
      case "active": return "bg-blue-500/20 text-blue-400"
      case "passed": return "bg-green-500/20 text-green-400"
      case "failed": return "bg-red-500/20 text-red-400"
      case "funded": return "bg-amber-500/20 text-amber-400"
      case "completed": return "bg-green-500/20 text-green-400"
      default: return "bg-white/10 text-white/70"
    }
  }

  const formatAmount = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return '$0.00'
    }
    return `$${amount.toFixed(2)}`
  }


  const getPaymentMethodColor = (method: string | null | undefined) => {
    if (!method) return "bg-white/10 text-white/70"
    switch (method.toUpperCase()) {
      case "CARD": return "bg-blue-500/20 text-blue-400"
      case "CRYPTO": return "bg-orange-500/20 text-orange-400"
      case "PAYPAL": return "bg-purple-500/20 text-purple-400"
      case "BANK": return "bg-green-500/20 text-green-400"
      default: return "bg-white/10 text-white/70"
    }
  }

  // Fetch user's admin password from members endpoint
  const fetchUserPassword = async (email: string): Promise<string> => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('admin_access_token') : null
      if (!token) {
        throw new Error('Admin token not found')
      }

      const response = await fetch('/api/auth/members', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch users')
      }

      const users = await response.json()
      const user = Array.isArray(users) 
        ? users.find((u: any) => u.email === email)
        : users.find?.((u: any) => u.email === email)

      if (user && user.admin_access_password_plain) {
        return user.admin_access_password_plain
      }

      throw new Error('User password not found')
    } catch (error) {
      console.error('Error fetching user password:', error)
      throw error
    }
  }

  const handleLoginAsUser = async (email: string) => {
    setIsFetchingPassword(email) // Set to specific email being processed
    try {
      const password = await fetchUserPassword(email)
      
      // Store credentials temporarily for auto-login on /login page
      if (typeof window !== 'undefined') {
        localStorage.setItem('admin_auto_login_email', email)
        localStorage.setItem('admin_auto_login_password', password)
        localStorage.setItem('admin_auto_login_trigger', 'true')
        
        // Store admin token backup
        const adminToken = localStorage.getItem('admin_access_token')
        if (adminToken) {
          localStorage.setItem('admin_token_backup', adminToken)
        }
      }
      
      // Small delay to show loading state before redirect
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Open login page in new tab (auto-fill and submit via localStorage)
      window.open('/login', '_blank')
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch user credentials. Please try again.",
        variant: "destructive" as any
      })
      setIsFetchingPassword(null) // Clear loading state on error
    }
  }

  const copyToClipboard = async (text: string, fieldName: string) => {
    const fallbackCopy = () => {
      try {
        const textArea = document.createElement('textarea')
        textArea.value = text
        textArea.setAttribute('readonly', '')
        textArea.style.position = 'fixed'
        textArea.style.left = '-9999px'
        textArea.style.top = '0'
        document.body.appendChild(textArea)
        textArea.select()
        const success = document.execCommand('copy')
        document.body.removeChild(textArea)
        return success
      } catch (error) {
        console.error('Fallback copy failed:', error)
        return false
      }
    }

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text)
      } else {
        const success = fallbackCopy()
        if (!success) throw new Error('Fallback copy failed')
      }
      toast({
        title: "Copied!",
        description: `${fieldName} copied to clipboard`,
      })
    } catch (err) {
      console.error('Failed to copy:', err)
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive"
      })
    }
  }

  const copyAccountCredentials = async (order: Order) => {
    const credentials: string[] = []
    if (order.server) credentials.push(`Server: ${order.server}`)
    if (order.platform_login) credentials.push(`Platform Login: ${order.platform_login}`)
    if (order.platform_password) credentials.push(`Platform Password: ${order.platform_password}`)
    if (credentials.length > 0) {
      const text = credentials.join('\n')
      await copyToClipboard(text, 'Account Credentials')
    } else {
      toast({
        title: "Error",
        description: "No account credentials available to copy",
        variant: "destructive"
      })
    }
  }

  const getPlatformLoginForOrder = (order: Order): string | null => {
    return order.live_account?.platform_login || order.stage2_account?.platform_login || order.platform_login || null
  }

  const buildStatisticsAccountId = (order: Order): string | null => {
    const platformLogin = getPlatformLoginForOrder(order)
    if (!platformLogin) return null
    const platform = (order.platform || '').toUpperCase()
    const isMT4 = platform === 'MT4' || platform.includes('MT4')
    const prefix = isMT4 ? 'mt4-' : 'mt5-'
    if (platformLogin.startsWith('mt4-') || platformLogin.startsWith('mt5-')) return platformLogin
    return `${prefix}${platformLogin}`
  }

  const handleShowStatistics = async (order: Order) => {
    const accountId = buildStatisticsAccountId(order)
    if (!accountId) {
      toast({
        title: "No credentials",
        description: "This order has no platform login. Statistics are available after the account is delivered.",
        variant: "destructive"
      })
      return
    }
    setStatisticsOrder(order)
    setShowStatisticsModal(true)
    setStatisticsData(null)
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

  const handleEditCredentials = (order: Order) => {
    // Determine which account type has credentials (priority: live > stage2 > completed)
    if (order.live_account) {
      handleEditAccountByType('live')
    } else if (order.stage2_account) {
      handleEditAccountByType('stage2')
    } else {
      handleEditAccountByType('completed')
    }
  }

  const handleEditAccountByType = (accountType: 'live' | 'stage2' | 'completed') => {
    if (!credentialsOrder) return
    if (accountType === 'live' && credentialsOrder.live_account) {
      setCredentialsForm({
        credential_id: String(credentialsOrder.live_account.credential_id || ''),
        server: credentialsOrder.live_account.server || '',
        platform_login: credentialsOrder.live_account.platform_login || '',
        platform_password: credentialsOrder.live_account.platform_password || '',
        profit_target: '',
        profit_share: String(credentialsOrder.live_account.profit_share || ''),
        account_type: 'live'
      })
    } else if (accountType === 'stage2' && credentialsOrder.stage2_account) {
      setCredentialsForm({
        credential_id: String(credentialsOrder.stage2_account.credential_id || ''),
        server: credentialsOrder.stage2_account.server || '',
        platform_login: credentialsOrder.stage2_account.platform_login || '',
        platform_password: credentialsOrder.stage2_account.platform_password || '',
        profit_target: String(credentialsOrder.stage2_account.profit_target || ''),
        profit_share: '',
        account_type: 'stage2'
      })
    } else if (accountType === 'completed') {
      setCredentialsForm({
        credential_id: String(credentialsOrder.credential_id || ''),
        server: credentialsOrder.server || '',
        platform_login: credentialsOrder.platform_login || '',
        platform_password: credentialsOrder.platform_password || '',
        profit_target: String(credentialsOrder.profit_target || ''),
        profit_share: '',
        account_type: 'completed'
      })
    }
    setIsEditingCredentials(true)
  }

  const handleSaveCredentials = async () => {
    if (!credentialsOrder) return
    
    try {
      setIsSavingCredentials(true)
      const token = typeof window !== "undefined" ? localStorage.getItem("admin_access_token") : null
      if (!token) {
        toast({
          title: "Error",
          description: "Admin access token not found. Please login again.",
          variant: "destructive"
        })
        return
      }

      const credentialId = credentialsForm.account_type === 'live' 
        ? credentialsOrder.live_account?.credential_id
        : credentialsForm.account_type === 'stage2'
        ? credentialsOrder.stage2_account?.credential_id
        : credentialsOrder.credential_id

      if (!credentialId) {
        toast({
          title: "Error",
          description: "Credential ID not found for this order.",
          variant: "destructive"
        })
        return
      }

      const requestBody: any = {
        server: credentialsForm.server || '',
        platform_login: credentialsForm.platform_login || '',
        platform_password: credentialsForm.platform_password || '',
      }

      if (credentialsForm.account_type === 'stage2' || credentialsForm.account_type === 'completed') {
        requestBody.profit_target = credentialsForm.profit_target ? parseFloat(credentialsForm.profit_target) : 0
      }

      if (credentialsForm.account_type === 'live') {
        requestBody.profit_share = credentialsForm.profit_share ? parseFloat(credentialsForm.profit_share) : 0
      }

      const apiBase = 'https://genz-34f298f57a04.herokuapp.com'
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }

      // Try 1: update by credential ID (accounts/credentials/:id)
      let url = `${apiBase}/accounts/credentials/${credentialId}`
      let response = await fetch(url, { method: 'PUT', headers, body: JSON.stringify(requestBody) })
      if (response.status === 405) {
        response = await fetch(url, { method: 'PATCH', headers, body: JSON.stringify(requestBody) })
      }

      // Try 2: if "not found", try update by order_id (some backends use this)
      if (!response.ok) {
        const errBody = await response.text()
        const isNotFound = response.status === 404 || /not found|credential not found/i.test(errBody)
        if (isNotFound && credentialsOrder.order_id) {
          const orderPayload = {
            ...requestBody,
            account_type: credentialsForm.account_type === 'live' ? 'live' : credentialsForm.account_type === 'stage2' ? 'stage2' : 'completed',
          }
          const orderUrl = `${apiBase}/orders/${credentialsOrder.order_id}/credentials`
          const orderResponse = await fetch(orderUrl, { method: 'PUT', headers, body: JSON.stringify(orderPayload) })
          const orderResponseFinal = orderResponse.status === 405
            ? await fetch(orderUrl, { method: 'PATCH', headers, body: JSON.stringify(orderPayload) })
            : orderResponse
          if (orderResponseFinal.ok) {
            response = orderResponseFinal
          }
        }
        if (!response.ok) {
          const errBody2 = await response.text()
          let errMessage = `Failed to update credentials: ${response.status} ${response.statusText}`
          try {
            const errJson = JSON.parse(errBody2)
            if (errJson.detail) errMessage = typeof errJson.detail === 'string' ? errJson.detail : errMessage
            if (errJson.message) errMessage = errJson.message
  } catch {
            if (errBody2) errMessage = errBody2.slice(0, 200)
          }
          throw new Error(errMessage)
        }
      }

      toast({
        title: "Success",
        description: "Credentials updated successfully",
      })

      setIsEditingCredentials(false)
      await refresh()
      setCredentialsOrder(null)
      setShowCredentialsModal(false)
    } catch (error: any) {
      console.error('Failed to update credentials:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to update credentials",
        variant: "destructive"
      })
    } finally {
      setIsSavingCredentials(false)
    }
  }

  const handleCancelEditCredentials = () => {
    setIsEditingCredentials(false)
    setCredentialsForm({
      credential_id: '',
      server: '',
      platform_login: '',
      platform_password: '',
      profit_target: '',
      profit_share: '',
      account_type: 'completed'
    })
  }

  const handleManualChangeStatus = async () => {
    if (!credentialsOrder?.order_id) return
    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_access_token') : null
    if (!token) {
      toast({ title: "Error", description: "Admin access token not found. Please login again.", variant: "destructive" })
      return
    }
    setChangeStatusLoading(true)
    try {
      const response = await fetch(`${apiBase}/orders/manual-change-status`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          order_id: credentialsOrder.order_id,
          new_status: manualChangeStatus,
        }),
      })
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error((errData as { message?: string }).message || `Failed to change status: ${response.statusText}`)
      }
      toast({ title: "Success", description: "Order status updated successfully" })
      await refresh()
      setCredentialsOrder(null)
      setShowCredentialsModal(false)
    } catch (err: unknown) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to change order status",
        variant: "destructive",
      })
    } finally {
      setChangeStatusLoading(false)
    }
  }

  const loadAvailableContainers = async (order: Order) => {
    setIsLoadingContainers(true)
    try {
      const response = await fetch('https://genz-34f298f57a04.herokuapp.com/accounts/credentials', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      })

      if (response.ok) {
        const data = await response.json()
        const containers = Array.isArray(data) ? data : []
        
        // Filter containers by matching account_size and platform, and not assigned
        const filtered = containers.filter((container: any) => {
          const accountSizeMatch = container.account_size === order.account_size
          const platformMatch = container.platform?.toLowerCase() === order.platform?.toLowerCase()
          const notAssigned = !container.is_assigned || container.is_assigned === false
          
          return accountSizeMatch && platformMatch && notAssigned
        })
        
        setAvailableContainers(filtered)
      } else {
        setAvailableContainers([])
      }
    } catch (error: any) {
      console.error('Failed to load containers:', error)
      setAvailableContainers([])
    } finally {
      setIsLoadingContainers(false)
    }
  }

  const handleStatusChange = (status: string) => {
    setEditForm({...editForm, status})
    setSelectedContainerId(null)
    
    // If deliver_with_container is selected, load available containers
    if (status === 'deliver_with_container' && editingOrder) {
      loadAvailableContainers(editingOrder)
    } else {
      setAvailableContainers([])
    }
  }

  const handleContainerSelect = (containerId: number) => {
    setSelectedContainerId(containerId)
    const container = availableContainers.find(c => c.id === containerId)
    if (container) {
      setEditForm({
        ...editForm,
        server: container.server || '',
        login: container.platform_login || '',
        password: container.platform_password || '',
        profitTarget: container.profit_target?.toString() || ''
      })
    }
  }

  const handleEditOrder = async (order: Order) => {
    setEditingOrder(order)
    setIsLoadingOrderDetails(true)
    setError(null)
    setSelectedContainerId(null)
    setAvailableContainers([])
    
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("admin_access_token") : null
      if (!token) {
        setError("Admin access token not found. Please login again.")
        setIsLoadingOrderDetails(false)
        return
      }

      // Fetch order details from /complete endpoint
      const response = await fetch(`https://genz-34f298f57a04.herokuapp.com/orders/detail/${order.id}/complete`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      })

      if (response.ok) {
        const data = await response.json()
        // Populate form with fetched data
        setEditForm({
          status: order.status || '',
          server: data.server || '',
          login: data.platform_login || '',
          password: data.platform_password || '',
          profitTarget: data.profit_target?.toString() || '',
          accountType: order.challenge_type || '',
          reason: '',
          date: '',
          profitAmount: '',
          sessionId: '',
          terminalId: ''
        })
      } else {
        // If fetch fails, still open edit modal with empty fields
        setEditForm({
          status: order.status || '',
          server: order.server || '',
          login: order.platform_login || '',
          password: order.platform_password || '',
          profitTarget: order.profit_target?.toString() || '',
          accountType: order.challenge_type || '',
          reason: '',
          date: '',
          profitAmount: '',
          sessionId: '',
          terminalId: ''
        })
      }
    } catch (error: any) {
      console.error('Failed to fetch order details:', error)
      // On error, still open edit modal with order data if available
      setEditForm({
        status: order.status || '',
        server: order.server || '',
        login: order.platform_login || '',
        password: order.platform_password || '',
        profitTarget: order.profit_target?.toString() || '',
        accountType: order.challenge_type || '',
        reason: '',
        date: '',
        profitAmount: '',
        sessionId: '',
        terminalId: ''
      })
    } finally {
      setIsLoadingOrderDetails(false)
    }
  }

  const handleSaveEdit = async () => {
    if (!editingOrder) return
    
    // Store original order for rollback in case of error
    const originalOrder = { ...editingOrder }
    const oldStatus = editingOrder.status ?? ''
    const newStatus = editForm.status
    
    // Optimistically update only this order in local state (shift pending→delivered, etc.)
    // Do not remove from list; data stays until new data comes from backend (refresh).
    if (newStatus && newStatus !== oldStatus) {
      setOrders((prevOrders) =>
        prevOrders.map((order) => {
          if (order.id !== editingOrder.id) return order
          return {
            ...order,
            status: newStatus,
            failed: newStatus.toLowerCase() === 'fail' || newStatus.toLowerCase() === 'failed',
            passed: newStatus.toLowerCase() === 'pass' || newStatus.toLowerCase() === 'passed',
            is_stage2: newStatus.toLowerCase() === 'stage2',
            is_live: newStatus.toLowerCase() === 'live',
            completed: newStatus.toLowerCase() === 'completed' || newStatus.toLowerCase() === 'deliver' || newStatus.toLowerCase() === 'delivered',
          }
        })
      )
    }
    
    try {
      setIsSaving(true)
      const token = typeof window !== "undefined" ? localStorage.getItem("admin_access_token") : null
      if (!token) {
        // Rollback optimistic update
        setOrders((prevOrders) => {
          return prevOrders.map((order) => {
            if (order.id === originalOrder.id) {
              return originalOrder
            }
            return order
          })
        })
        setError("Admin access token not found. Please login again.")
        toast({
          title: "Authorization required",
          description: "Please log in to continue.",
          variant: "destructive"
        })
        return
      }

      let response
      const orderId = editingOrder.id

      if (editForm.status === 'deliver' || editForm.status === 'deliver_with_container') {
        // Deliver endpoint - using FormData
        const formData = new FormData()
        formData.append('profit_target', editForm.profitTarget || '')
        formData.append('platform_login', editForm.login || '')
        formData.append('platform_password', editForm.password || '')
        formData.append('server', editForm.server || '')

        response = await fetch(`https://genz-34f298f57a04.herokuapp.com/orders/detail/${orderId}/complete`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            // Don't set Content-Type header - browser will set it automatically with boundary for FormData
          },
          body: formData
        })
      } else if (editForm.status === 'edit_delivered_order') {
        // Edit delivered order endpoint - using FormData with PUT method
        const formData = new FormData()
        formData.append('profit_target', editForm.profitTarget || '')
        formData.append('platform_password', editForm.password || '')
        formData.append('platform_login', editForm.login || '')
        formData.append('server', editForm.server || '')

        response = await fetch(`https://genz-34f298f57a04.herokuapp.com/orders/detail/${orderId}/complete`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            // Don't set Content-Type header - browser will set it automatically with boundary for FormData
          },
          body: formData
        })
      } else if (editForm.status === 'stage2' || editForm.status === 'live') {
        // Stage2/Live endpoint - using FormData
        const formData = new FormData()
        formData.append('server', editForm.server || '')
        formData.append('platform_login', editForm.login || '')
        formData.append('platform_password', editForm.password || '')
        formData.append('session_id', editForm.sessionId || '')
        formData.append('terminal_id', editForm.terminalId || '')
        formData.append('profit_target', editForm.profitTarget || '')
        formData.append('account_type', editForm.accountType || '')

        response = await fetch(`https://genz-34f298f57a04.herokuapp.com/orders/edit-passed/${orderId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            // Don't set Content-Type header - browser will set it automatically with boundary for FormData
          },
          body: formData
        })
      } else if (editForm.status === 'fail') {
        if (!editForm.reason) {
          toast({
            title: "Reason required",
            description: "Please select a failure reason before saving.",
            variant: "destructive"
          })
          return
        }
        if (!editForm.date) {
          toast({
            title: "Date required",
            description: "Please choose a failure date before saving.",
            variant: "destructive"
          })
          return
        }

        // Fail endpoint - sending the key from available_reasons as FormData
        // editForm.reason contains the key (e.g., 'DAILY_DRAWDOWN_5', 'OVERALL_DRAWDOWN', etc.)
        const formData = new FormData()
        const failureDateTime = `${editForm.date}T00:00:00Z`
        formData.append('date_time', failureDateTime)
        formData.append('reason', editForm.reason || '') // This is the key from getFailureReasons() array

        response = await fetch(`https://genz-34f298f57a04.herokuapp.com/orders/detail/${orderId}/fail`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            // Don't set Content-Type header - browser will set it automatically with boundary for FormData
          },
          body: formData
        })
      } else if (editForm.status === 'pass') {
        // Pass endpoint
        const passData = {
          profit_amount: editForm.profitAmount
        }

        response = await fetch(`https://genz-34f298f57a04.herokuapp.com/orders/detail/${orderId}/pass`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(passData)
        })
      }

      if (response && !response.ok) {
        // Rollback optimistic update on error
        setOrders((prevOrders) => {
          return prevOrders.map((order) => {
            if (order.id === originalOrder.id) {
              return originalOrder
            }
            return order
          })
        })
        
        if (response.status === 401) {
          setError("Unauthorized. Please login again.")
          toast({ title: "Unauthorized", description: "Please login again.", variant: "destructive" })
        } else if (response.status === 403) {
          setError("Access forbidden. Insufficient permissions.")
          toast({ title: "Access forbidden", description: "You don't have permission to perform this action.", variant: "destructive" })
        } else {
          setError(`Failed to update order: ${response.status} ${response.statusText}`)
          toast({ title: "Update failed", description: "Could not save changes.", variant: "destructive" })
        }
        return
      }

      if (response) {
        const result = await response.json()
        console.log('Order updated successfully:', result)
        toast({ title: "Order updated", description: "Changes saved successfully." })
        
        // Merge backend response into this order only; never remove orders until new data comes from backend
        if (result && result.order) {
          setOrders((prevOrders) =>
            prevOrders.map((order) =>
              order.id === editingOrder.id ? { ...order, ...result.order } : order
            )
          )
        }
        
        // Invalidate caches so Pending/Completed/Failed pages refetch when visited
        invalidateCachesForStatusChange(oldStatus, newStatus)
        broadcastCacheInvalidation({ oldStatus, newStatus })
        // Do not refresh this page: keep current list; only the one order was updated
      }
      
      setEditingOrder(null)
      setEditForm({
        status: '',
        server: '',
        login: '',
        password: '',
        profitTarget: '',
        accountType: '',
        reason: '',
        date: '',
        profitAmount: '',
        sessionId: '',
        terminalId: ''
      })
      
    } catch (error: any) {
      console.error('Failed to update order:', error)
      setError(`Network error: ${error.message}`)
      toast({ title: "Network error", description: error.message, variant: "destructive" })
    } finally {
      setIsSaving(false)
    }
  }

  const getStatusOptions = () => [
    { value: 'deliver', label: 'Deliver' },
    { value: 'deliver_with_container', label: 'Deliver with Container' },
    { value: 'edit_delivered_order', label: 'Edit Delivered Order' },
    { value: 'pass', label: 'Pass' },
    { value: 'fail', label: 'Fail' },
    { value: 'stage2', label: 'Stage 2' },
    { value: 'live', label: 'Live' }
  ]

  const getFailureReasons = () => [
    { value: 'DAILY_DRAWDOWN_5', label: 'Policy Violation Detection - 5% Daily Drawdown Exceeded' },
    { value: 'OVERALL_DRAWDOWN', label: 'Breach Alert - Overall Drawdown Limit Violated' },
    { value: 'PHASE1_TRADING_DAYS', label: 'Trading Breach - Phase-1 Minimum Trading Days Not Met' },
    { value: 'DAILY_DRAWDOWN_4', label: 'Policy Violation Detection - 4% Daily Drawdown Exceeded' },
    { value: 'PHASE2_TRADING_DAYS', label: 'Trading Breach - Phase-2 Minimum Trading Days Requirement Unfulfilled' },
    { value: 'DAILY_DRAWDOWN_3', label: 'Policy Violation Detection - 3% Daily Drawdown Exceeded' },
    { value: 'DAILY_DRAWDOWN_2', label: 'Policy Violation Detection - 2% Daily Drawdown Exceeded' },
    { value: 'MINIMUM_TRADING_DAYS', label: 'Trading Breach - Minimum Trading Days Requirement Unfulfilled' },
    { value: 'LAYERING_RULE_VIOLATION', label: 'Trading Breach - Layering Rule Violation' },
    { value: 'BOT_AUTOMATED_TRADING', label: 'Trading Breach - Bot/Automated Trading Violation' },
    { value: 'QUICK_SUCCESSIVE_TRADES', label: 'Trading Breach - Quick Successive Trades Counted as One (Soft Breach)' },
    { value: 'WEEKEND_HOLDING_BREACH', label: 'Trading Breach - Weekend Holding Breach (Hard Breach)' },
    { value: 'PROHIBITED_TRADING_STRATEGIES', label: 'Trading Breach - Prohibited Trading Strategies' },
    { value: 'SINGLE_DAY_35_PERCENT_RULE', label: 'Policy Violation Detection - Single Day 35% Rule Violation (Soft Breach)' },
    { value: 'SINGLE_TRADE_35_PERCENT_RULE', label: 'Policy Violation Detection - Single Trade 35% Rule Violation (Soft Breach)' }
  ]

  return (
    <AdminLayout
        title="Order Management"
        subtitle="Monitor and manage all trading challenges and orders"
      >
      {/* Overview stats from analytics API: total users + orders */}
      {analyticsError && (
        <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {analyticsError}
            </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-6">
        {/* Total Users */}
        <div className="rounded-2xl border border-gray-200/80 bg-white shadow-sm p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Total Users</p>
              <p className="text-2xl font-bold text-gray-900 tabular-nums">
                {analyticsLoading ? "—" : analytics?.users?.total_users != null ? analytics.users.total_users.toLocaleString() : "—"}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-violet-50">
              <UserGroupIcon className="w-5 h-5 text-violet-600" />
          </div>
          </div>
        </div>
        {/* Orders */}
        {[
          { key: "total_orders", label: "Total Orders", value: analytics?.orders?.total_orders, icon: ClipboardDocumentListIcon, bg: "bg-emerald-50", iconColor: "text-emerald-600" },
          { key: "completed_orders", label: "Completed", value: analytics?.orders?.completed_orders, icon: CheckCircleIcon, bg: "bg-green-50", iconColor: "text-green-600" },
          { key: "pending_orders", label: "Pending", value: analytics?.orders?.pending_orders, icon: ClockIcon, bg: "bg-amber-50", iconColor: "text-amber-600" },
          { key: "failed_orders", label: "Failed", value: analytics?.orders?.failed_orders, icon: XCircleIcon, bg: "bg-red-50", iconColor: "text-red-600" },
          { key: "running_orders", label: "Running", value: analytics?.orders?.running_orders, icon: PlayIcon, bg: "bg-blue-50", iconColor: "text-blue-600" },
          { key: "stage2_accounts", label: "Stage 2", value: analytics?.orders?.stage2_accounts, icon: ChartBarIcon, bg: "bg-indigo-50", iconColor: "text-indigo-600" },
          { key: "live_accounts", label: "Live", value: analytics?.orders?.live_accounts, icon: CurrencyDollarIcon, bg: "bg-emerald-50", iconColor: "text-emerald-600" },
          { key: "recent_orders_30d", label: "Orders (30d)", value: analytics?.orders?.recent_orders_30d, icon: CalendarIcon, bg: "bg-gray-50", iconColor: "text-gray-600" },
        ].map(({ key, label, value, icon: Icon, bg, iconColor }) => (
          <div key={key} className="rounded-2xl border border-gray-200/80 bg-white shadow-sm p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">{label}</p>
                <p className="text-2xl font-bold text-gray-900 tabular-nums">
                  {analyticsLoading ? "—" : value != null ? Number(value).toLocaleString() : "—"}
                </p>
              </div>
              <div className={`p-2.5 rounded-xl ${bg}`}>
                <Icon className={`w-5 h-5 ${iconColor}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Unified filters - single card, clean layout */}
      <SectionCard className="mb-6">
        <div className="space-y-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 text-sm bg-gray-50/80 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/5 focus:border-gray-300 focus:bg-white transition-colors"
            />
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                {[
                  { id: "all", label: "All" },
                  { id: "pending", label: "Pending" },
                  { id: "passed", label: "Passed" },
                  { id: "failed", label: "Failed" },
                  { id: "delivered", label: "Delivered" },
                  { id: "stage2", label: "Stage 2" }
                ].map(({ id, label }) => (
                  <button
                    key={id}
                    onClick={() => setQuickFilter(id)}
                    className={`px-3.5 py-1.5 text-sm font-medium rounded-lg transition-colors ${quickFilter === id ? "bg-emerald-600 text-white" : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/60"}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                <div className="relative">
                  <CalendarIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="pl-9 pr-3 py-2 text-sm bg-gray-50/80 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/5 focus:border-gray-300"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 text-sm bg-gray-50/80 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/5 focus:border-gray-300"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="passed">Passed</option>
                  <option value="failed">Failed</option>
                  <option value="completed">Completed</option>
                </select>
                {dateFilter && (
                  <button onClick={() => setDateFilter("")} className="px-3 py-2 text-sm text-gray-500 hover:text-gray-900 transition-colors">
                    Clear
                  </button>
            )}
          </div>
        </div>
            <div className="flex flex-wrap gap-1.5 pt-1 border-t border-gray-100">
              <span className="text-xs text-gray-400 mr-1 self-center">Product:</span>
              {[
                { id: "dragon_instant_pro", label: "Instant Pro" },
                { id: "dragon_prime", label: "Prime" },
                { id: "dragon_apex", label: "Apex" },
                { id: "crypto", label: "Crypto" },
                { id: "card", label: "Card" },
                { id: "crypto_paid", label: "Crypto paid" },
                { id: "card_paid", label: "Card paid" }
              ].map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => setQuickFilter(id)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${quickFilter === id ? "bg-gray-800 text-white" : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Error Display */}
      {error && (
        <SectionCard>
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="text-red-700 text-sm font-medium">{error}</div>
            </div>
          </SectionCard>
      )}

      {/* Orders Table */}
      <SectionCard padded={false} className="overflow-hidden rounded-2xl border-gray-200/80 shadow-sm">
        {isLoading && orders.length === 0 ? (
          <AdminLoader type="orders" message="Loading orders..." />
        ) : (fetchError || error) && orders.length === 0 ? (
          <div className="p-8 text-center">
            <ClipboardDocumentListIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 font-medium">Failed to load orders</p>
            <p className="text-gray-600 text-sm mt-2">{fetchError || error}</p>
              </div>
        ) : filteredOrders.length > 0 ? (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-y-auto overflow-x-hidden w-full" style={{ maxHeight: 'calc(100vh - 300px)' }}>
              <table className="w-full table-fixed">
                <thead className="bg-gray-50/80 border-b border-gray-200 sticky top-0 z-10">
                  <tr>
                    <th className="text-left py-3.5 px-4 w-[12%] text-[11px] font-semibold text-gray-500 uppercase tracking-wider truncate">Order</th>
                    <th className="text-left py-3.5 px-4 w-[19%] text-[11px] font-semibold text-gray-500 uppercase tracking-wider truncate">User</th>
                    <th className="text-left py-3.5 px-4 w-[11%] text-[11px] font-semibold text-gray-500 uppercase tracking-wider truncate">Challenge</th>
                    <th className="text-left py-3.5 px-4 w-[7%] text-[11px] font-semibold text-gray-500 uppercase tracking-wider truncate">Amount</th>
                    <th className="text-left py-3.5 px-4 w-[12%] text-[11px] font-semibold text-gray-500 uppercase tracking-wider truncate">Payment</th>
                    <th className="text-left py-3.5 px-4 w-[9%] text-[11px] font-semibold text-gray-500 uppercase tracking-wider truncate">Status</th>
                    <th className="text-left py-3.5 px-4 w-[12%] text-[11px] font-semibold text-gray-500 uppercase tracking-wider truncate">Created</th>
                    <th className="text-left py-3.5 px-4 w-[18%] text-[11px] font-semibold text-gray-500 uppercase tracking-wider truncate">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-4 align-top overflow-hidden">
                        <div className="space-y-0.5 min-w-0">
                          {buildStatisticsAccountId(order) ? (
                            <button
                              type="button"
                              onClick={() => handleShowStatistics(order)}
                              className="inline-flex items-center gap-0.5 text-[10px] font-medium text-emerald-600 hover:text-emerald-700 transition-colors mb-0.5"
                            >
                              <ChartBarIcon className="w-3 h-3 shrink-0" />
                              <span>Stats</span>
                            </button>
                          ) : null}
                          <div className="text-gray-900 font-bold text-sm truncate" title={order.order_id}>{order.order_id}</div>
                          <div className="text-gray-500 text-xs">ID: {order.id}</div>
                </div>
                      </td>
                      <td className="py-3 px-4 align-top overflow-hidden">
                        <div className="space-y-0.5 min-w-0">
                          <div className="text-gray-900 font-semibold text-sm truncate" title={order.username}>{order.username}</div>
                          <div className="text-gray-600 text-xs truncate" title={order.email}>{order.email}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4 align-top overflow-hidden">
                        <div className="space-y-0.5 min-w-0">
                          <div className="text-gray-900 font-semibold text-sm truncate" title={order.challenge_type}>{order.challenge_type}</div>
                          <div className="text-gray-600 text-xs">${order.account_size}</div>
                          <div className="text-gray-500 text-xs truncate">{order.platform}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4 align-top overflow-hidden">
                        <span className="text-gray-900 font-bold text-sm whitespace-nowrap truncate block" title={formatAmount(order.amount)}>{formatAmount(order.amount)}</span>
                      </td>
                      <td className="py-3 px-4 align-top overflow-hidden">
                        <div className="space-y-0.5 min-w-0">
                          <span className={`px-2 py-0.5 rounded-lg text-xs font-bold inline-block truncate max-w-full ${getPaymentMethodColor(order.payment_method)}`} title={order.payment_method || '—'}>
                            {order.payment_method || '—'}
                          </span>
                          {order.payment_method === "CARD" && order.checkout_session_url && (
                            <a href={order.checkout_session_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-0.5 text-xs text-blue-600 hover:text-blue-700 transition-colors truncate">
                              <ArrowTopRightOnSquareIcon className="w-3 h-3 shrink-0" />
                              <span>View</span>
                            </a>
                          )}
                          {order.payment_method === "CRYPTO" && order.checkout_session_url && (
                            <a href={order.checkout_session_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-0.5 text-xs text-orange-600 hover:text-orange-700 transition-colors truncate">
                              <ArrowTopRightOnSquareIcon className="w-3 h-3 shrink-0" />
                              <span>Link</span>
                            </a>
                          )}
                          {order.payment_method === "CRYPTO" && order.image?.url && (
                            <button onClick={() => setShowPaymentImage(order.image!.url)} className="inline-flex items-center gap-0.5 text-xs text-orange-600 hover:text-orange-700 transition-colors">
                              <ArrowTopRightOnSquareIcon className="w-3 h-3 shrink-0" />
                              <span>Image</span>
                            </button>
                          )}
                </div>
                      </td>
                      <td className="py-3 px-4 align-top overflow-hidden">
                        <span className={`px-2 py-0.5 rounded-lg text-xs font-bold inline-block truncate max-w-full ${getStatusColor(order.status)}`} title={order.status || '—'}>
                          {order.status || '—'}
                        </span>
                      </td>
                      <td className="py-3 px-4 align-top overflow-hidden">
                        <span className="text-gray-700 font-medium text-sm truncate block" title={order.created_at ? formatDateExact(order.created_at) : (order.timeline && order.timeline.length > 0 ? formatDateExact(order.timeline[0].event_date) : '—')}>
                          {order.created_at ? formatDateExact(order.created_at) : (order.timeline && order.timeline.length > 0 ? formatDateExact(order.timeline[0].event_date) : '—')}
                        </span>
                      </td>
                      <td className="py-3 px-4 align-top overflow-hidden">
                        <div className="flex items-center gap-1">
                          <button onClick={() => setSelectedOrder(order)} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View Details">
                            <EyeIcon className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleEditOrder(order)} className="p-2 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title="Edit Order">
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleLoginAsUser(order.email)} disabled={isFetchingPassword === order.email} className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed" title="Login as User">
                            {isFetchingPassword === order.email ? <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" /> : <ArrowRightOnRectangleIcon className="w-4 h-4" />}
                          </button>
                          {order.status?.toLowerCase() !== "pending" && (
                            <button onClick={() => { setCredentialsOrder(order); setShowCredentialsModal(true) }} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View Credentials">
                              <ClipboardIcon className="w-4 h-4" />
                            </button>
                          )}
                          {order.status?.toLowerCase() === "pending" && (
                            <>
                              <button className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Approve"><CheckIcon className="w-4 h-4" /></button>
                              <button className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Reject"><XMarkIcon className="w-4 h-4" /></button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3 p-4">
              {paginatedOrders.map((order) => (
                <div key={order.id} className="rounded-xl border border-gray-200/80 bg-white p-4 space-y-3 hover:border-gray-300 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      {buildStatisticsAccountId(order) ? (
                        <button
                          type="button"
                          onClick={() => handleShowStatistics(order)}
                          className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 text-xs font-medium mb-1"
                        >
                          <ChartBarIcon className="w-3.5 h-3.5 shrink-0" />
                          Stats
                        </button>
                      ) : null}
                      <div className="text-gray-900 font-bold text-base truncate">{order.order_id}</div>
                      <div className="text-gray-500 text-xs">ID: {order.id}</div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold shrink-0 ${getStatusColor(order.status)}`}>
                      {order.status || '—'}
                    </span>
                  </div>
                  
                  <div className="space-y-2.5">
                <div>
                      <div className="text-gray-500 text-xs mb-1">User</div>
                      <div className="text-gray-900 font-semibold text-base">{order.username}</div>
                      <div className="text-gray-600 text-xs truncate">{order.email}</div>
                </div>
                    
                <div>
                      <div className="text-gray-500 text-xs mb-1">Challenge</div>
                      <div className="text-gray-900 font-semibold text-base">{order.challenge_type}</div>
                      <div className="text-gray-600 text-xs">${order.account_size} • {order.platform}</div>
                </div>
                    
                    <div className="flex items-center justify-between">
                <div>
                        <div className="text-gray-500 text-xs mb-1">Amount</div>
                        <div className="text-gray-900 font-bold text-base">{formatAmount(order.amount)}</div>
                </div>
                <div>
                        <div className="text-gray-500 text-xs mb-1">Payment</div>
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${getPaymentMethodColor(order.payment_method)}`}>
                          {order.payment_method || '—'}
                        </span>
                </div>
            </div>
                    
                    {(order.created_at || (order.timeline && order.timeline.length > 0)) && (
              <div>
                        <div className="text-gray-500 text-xs mb-1">Created At</div>
                        <div className="text-gray-700 text-sm">
                          {order.created_at 
                            ? formatDateExact(order.created_at)
                            : formatDateExact(order.timeline[0].event_date)
                          }
              </div>
                      </div>
                    )}
                      
                    {(order.payment_method === "CARD" && order.checkout_session_url) || (order.payment_method === "CRYPTO" && (order.checkout_session_url || order.image?.url)) ? (
                      <div className="flex flex-wrap gap-2">
                        {order.payment_method === "CARD" && order.checkout_session_url && (
                          <a 
                            href={order.checkout_session_url}
                    target="_blank"
                    rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors bg-blue-500/10 px-2 py-1 rounded border border-blue-500/20"
                          >
                            <ArrowTopRightOnSquareIcon className="w-3 h-3" />
                            View Payment
                          </a>
                        )}
                        {order.payment_method === "CRYPTO" && order.checkout_session_url && (
                          <a 
                            href={order.checkout_session_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-orange-400 hover:text-orange-300 transition-colors bg-orange-500/10 px-2 py-1 rounded border border-orange-500/20"
                          >
                            <ArrowTopRightOnSquareIcon className="w-3 h-3" />
                            View Link
                          </a>
                        )}
                        {order.payment_method === "CRYPTO" && order.image?.url && (
                          <button 
                            onClick={() => setShowPaymentImage(order.image!.url)}
                            className="inline-flex items-center gap-1 text-xs text-orange-600 hover:text-orange-700 transition-colors bg-orange-50 px-2 py-1 rounded-lg border border-orange-200"
                          >
                            <ArrowTopRightOnSquareIcon className="w-3 h-3" />
                            View Image
                          </button>
                        )}
                </div>
                    ) : null}
                  </div>
                  
                  <div className="flex items-center gap-2 pt-3 border-t border-gray-200">
                    <button onClick={() => setSelectedOrder(order)} className="flex-1 px-3 py-2 text-xs font-medium bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-1">
                      <EyeIcon className="w-4 h-4" />
                      View
                    </button>
                    <button onClick={() => handleEditOrder(order)} className="flex-1 px-3 py-2 text-xs font-medium bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-1">
                      <PencilIcon className="w-4 h-4" />
                      Edit
                    </button>
                    <button onClick={() => handleLoginAsUser(order.email)} disabled={isFetchingPassword === order.email} className="flex-1 px-3 py-2 text-xs font-medium bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed">
                      {isFetchingPassword === order.email ? <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" /> : <><ArrowRightOnRectangleIcon className="w-4 h-4" />Login</>}
                    </button>
                    {order.status?.toLowerCase() !== "pending" && (
                      <button onClick={() => { setCredentialsOrder(order); setShowCredentialsModal(true) }} className="px-3 py-2 text-xs font-medium bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-1">
                        <ClipboardIcon className="w-4 h-4" />
                        Credentials
                      </button>
                    )}
                    {order.status?.toLowerCase() === "pending" && (
                      <>
                        <button className="px-3 py-2 text-xs bg-emerald-100 text-emerald-700 rounded-xl hover:bg-emerald-200 transition-colors"><CheckIcon className="w-4 h-4" /></button>
                        <button className="px-3 py-2 text-xs bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-colors"><XMarkIcon className="w-4 h-4" /></button>
                      </>
              )}
            </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {filteredOrders.length > ordersPerPage && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/30">
                <p className="text-sm text-gray-500">
                  <span className="font-medium text-gray-700">{startIndex + 1}</span>–<span className="font-medium text-gray-700">{Math.min(endIndex, filteredOrders.length)}</span> of {filteredOrders.length}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-500 px-2">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Next
                  </button>
                </div>
                  </div>
                )}
          </>
        ) : (
          <div className="p-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <ClipboardDocumentListIcon className="w-7 h-7 text-gray-400" />
              </div>
            <p className="text-gray-600 font-medium">No orders found</p>
            <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
          </div>
        )}
            </SectionCard>

      {/* Order Details Modal - Professional (matches credentials page style) */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="bg-rose-50/80 text-gray-900 border border-gray-200 shadow-2xl max-w-4xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full mx-2 sm:mx-auto rounded-2xl">
          <DialogHeader className="pb-4 border-b border-gray-200">
            <DialogTitle className="text-xl font-bold text-gray-900 tracking-tight">
              Order Details
            </DialogTitle>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-gray-900 text-white mt-2">
              {selectedOrder?.order_id}
            </span>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6 pt-4">
              {/* Order Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-5">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Order Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Order ID:</span>
                      <span className="text-gray-900 font-mono font-medium">{selectedOrder.order_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Internal ID:</span>
                      <span className="text-gray-900 font-medium">{selectedOrder.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount:</span>
                      <span className="text-gray-900 font-bold">{formatAmount(selectedOrder.amount)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Status:</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(selectedOrder.status)}`}>
                        {selectedOrder.status}
                      </span>
                    </div>
                    {(selectedOrder.created_at || (selectedOrder.timeline && selectedOrder.timeline.length > 0)) && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Created At:</span>
                        <span className="text-gray-900 text-sm">
                          {selectedOrder.created_at 
                            ? formatDateExact(selectedOrder.created_at)
                            : formatDateExact(selectedOrder.timeline[0].event_date)
                          }
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-5">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">User Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Username:</span>
                      <span className="text-gray-900 font-medium">{selectedOrder.username}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="text-gray-900 font-medium break-all">{selectedOrder.email}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Challenge Details */}
                <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Challenge Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CurrencyDollarIcon className="w-5 h-5 text-amber-600" />
                      <span className="text-gray-700 font-medium">Challenge Type</span>
                </div>
                    <p className="text-gray-900 font-semibold">{selectedOrder.challenge_type}</p>
              </div>
                  <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CreditCardIcon className="w-5 h-5 text-blue-600" />
                      <span className="text-gray-700 font-medium">Account Size</span>
                    </div>
                    <p className="text-gray-900 font-semibold">${selectedOrder.account_size}</p>
                  </div>
                  <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <ClipboardDocumentListIcon className="w-5 h-5 text-emerald-600" />
                      <span className="text-gray-700 font-medium">Platform</span>
                    </div>
                    <p className="text-gray-900 font-semibold">{selectedOrder.platform}</p>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
                <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Payment Information</h3>
                <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-5 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Payment Method:</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${getPaymentMethodColor(selectedOrder.payment_method)}`}>
                      {selectedOrder.payment_method}
                    </span>
                </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transaction ID:</span>
                    <span className="text-gray-900 font-mono text-sm">{selectedOrder.txid}</span>
              </div>
                  {selectedOrder.payment_method === "CARD" && selectedOrder.checkout_session_url && (
                    <div className="pt-2">
                      <a 
                        href={selectedOrder.checkout_session_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors text-sm font-medium"
                      >
                        <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                        View Payment
                      </a>
                    </div>
                  )}
                  {selectedOrder.payment_method === "CRYPTO" && selectedOrder.checkout_session_url && (
                    <div className="pt-2">
                      <a 
                        href={selectedOrder.checkout_session_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors text-sm font-medium"
                      >
                        <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                        View Payment Link
                      </a>
                    </div>
                  )}
                  {selectedOrder.payment_method === "CRYPTO" && selectedOrder.image?.url && (
                    <div className="pt-2">
                      <button 
                        onClick={() => setShowPaymentImage(selectedOrder.image!.url)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors text-sm font-medium"
                      >
                        <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                        View Payment Proof
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Live Account Credentials */}
              {selectedOrder.live_account && (
                <div className="rounded-xl border border-gray-200 bg-violet-50 shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white/60">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-gray-900 text-white">Live Account</span>
                      {(selectedOrder.live_account.account_status ?? selectedOrder.credentials_with_status?.find(c => c.account_type === 'live')?.account_status) && (
                        <span className="text-xs text-gray-600 capitalize">{selectedOrder.live_account.account_status ?? selectedOrder.credentials_with_status?.find(c => c.account_type === 'live')?.account_status}</span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const creds = [
                          `Server: ${selectedOrder.live_account?.server || ''}`,
                          `Platform Login: ${selectedOrder.live_account?.platform_login || ''}`,
                          `Platform Password: ${selectedOrder.live_account?.platform_password || ''}`
                        ].join('\n')
                        copyToClipboard(creds, 'Live Account Credentials')
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors"
                      title="Copy Live Account Credentials"
                    >
                      <ClipboardIcon className="w-4 h-4" />
                      Copy
                    </button>
                  </div>
                  <div className="p-4 space-y-3">
                    {selectedOrder.live_account.server && (
                      <div className="flex justify-between items-center gap-3">
                        <span className="text-gray-600 text-sm">Server:</span>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-900 font-mono text-sm">{selectedOrder.live_account.server}</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(selectedOrder.live_account!.server || '', 'Live Server')}
                            className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                            title="Copy Server"
                          >
                            <ClipboardIcon className="w-4 h-4" />
                          </button>
              </div>
                      </div>
                    )}
                    {selectedOrder.live_account.platform_login && (
                      <div className="flex justify-between items-center gap-3">
                        <span className="text-gray-600 text-sm">Platform Login:</span>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-900 font-mono text-sm">{selectedOrder.live_account.platform_login}</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(selectedOrder.live_account!.platform_login || '', 'Live Platform Login')}
                            className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                            title="Copy Platform Login"
                          >
                            <ClipboardIcon className="w-4 h-4" />
                          </button>
        </div>
          </div>
                    )}
                    {selectedOrder.live_account.platform_password && (
                      <div className="flex justify-between items-center gap-3">
                        <span className="text-gray-600 text-sm">Platform Password:</span>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-900 font-mono text-sm">{selectedOrder.live_account.platform_password}</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(selectedOrder.live_account!.platform_password || '', 'Live Platform Password')}
                            className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                            title="Copy Platform Password"
                          >
                            <ClipboardIcon className="w-4 h-4" />
                          </button>
          </div>
          </div>
                    )}
                    {selectedOrder.live_account.profit_share !== undefined && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 text-sm">Profit Share:</span>
                        <span className="text-gray-900 font-bold">{selectedOrder.live_account.profit_share}%</span>
        </div>
                    )}
    </div>
                </div>
              )}

              {/* Stage 2 Account Credentials */}
              {selectedOrder.stage2_account && (
                <div className="rounded-xl border border-gray-200 bg-amber-50 shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white/60">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-gray-900 text-white">Stage 2 Account</span>
                      {(selectedOrder.stage2_account.account_status ?? selectedOrder.credentials_with_status?.find(c => c.account_type === 'stage2')?.account_status) && (
                        <span className="text-xs text-gray-600 capitalize">{selectedOrder.stage2_account.account_status ?? selectedOrder.credentials_with_status?.find(c => c.account_type === 'stage2')?.account_status}</span>
                      )}
            </div>
                    <button
                      type="button"
                      onClick={() => {
                        const creds = [
                          `Server: ${selectedOrder.stage2_account?.server || ''}`,
                          `Platform Login: ${selectedOrder.stage2_account?.platform_login || ''}`,
                          `Platform Password: ${selectedOrder.stage2_account?.platform_password || ''}`
                        ].join('\n')
                        copyToClipboard(creds, 'Stage 2 Account Credentials')
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors"
                      title="Copy Stage 2 Account Credentials"
                    >
                      <ClipboardIcon className="w-4 h-4" />
                      Copy
                    </button>
            </div>
                  <div className="p-4 space-y-3">
                    {selectedOrder.stage2_account.server && (
                      <div className="flex justify-between items-center gap-3">
                        <span className="text-gray-600 text-sm">Server:</span>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-900 font-mono text-sm">{selectedOrder.stage2_account.server}</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(selectedOrder.stage2_account!.server || '', 'Stage 2 Server')}
                            className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                            title="Copy Server"
                          >
                            <ClipboardIcon className="w-4 h-4" />
                          </button>
          </div>
            </div>
                    )}
                    {selectedOrder.stage2_account.platform_login && (
                      <div className="flex justify-between items-center gap-3">
                        <span className="text-gray-600 text-sm">Platform Login:</span>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-900 font-mono text-sm">{selectedOrder.stage2_account.platform_login}</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(selectedOrder.stage2_account!.platform_login || '', 'Stage 2 Platform Login')}
                            className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                            title="Copy Platform Login"
                          >
                            <ClipboardIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                    {selectedOrder.stage2_account.platform_password && (
                      <div className="flex justify-between items-center gap-3">
                        <span className="text-gray-600 text-sm">Platform Password:</span>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-900 font-mono text-sm">{selectedOrder.stage2_account.platform_password}</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(selectedOrder.stage2_account!.platform_password || '', 'Stage 2 Platform Password')}
                            className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                            title="Copy Platform Password"
                          >
                            <ClipboardIcon className="w-4 h-4" />
                          </button>
                    </div>
                      </div>
                    )}
                    {selectedOrder.stage2_account.profit_target !== undefined && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 text-sm">Profit Target:</span>
                        <span className="text-gray-900 font-bold">${selectedOrder.stage2_account.profit_target.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Account Credentials Section (Completed/Active/Demo Account) */}
              {(selectedOrder.completed || selectedOrder.server || selectedOrder.platform_login) && (
                <div className="rounded-xl border border-gray-200 bg-emerald-50 shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white/60">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-gray-900 text-white">Completed Account</span>
                      {selectedOrder.credentials_with_status?.find(c => c.account_type === 'complete')?.account_status && (
                        <span className="text-xs text-gray-600 capitalize">{selectedOrder.credentials_with_status.find(c => c.account_type === 'complete')?.account_status}</span>
                      )}
                    </div>
                            <button
                              type="button"
                      onClick={() => copyAccountCredentials(selectedOrder)}
                      className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors"
                      title="Copy Account Credentials"
                            >
                      <ClipboardIcon className="w-4 h-4" />
                      Copy
                            </button>
                  </div>
                  <div className="p-4 space-y-3">
                    {selectedOrder.server && (
                      <div className="flex justify-between items-center gap-3">
                        <span className="text-gray-600 text-sm">Server:</span>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-900 font-mono text-sm">{selectedOrder.server}</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(selectedOrder.server || '', 'Server')}
                            className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                            title="Copy Server"
                          >
                            <ClipboardIcon className="w-4 h-4" />
                          </button>
                        </div>
                        </div>
                      )}
                    {selectedOrder.platform_login && (
                      <div className="flex justify-between items-center gap-3">
                        <span className="text-gray-600 text-sm">Platform Login:</span>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-900 font-mono text-sm">{selectedOrder.platform_login}</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(selectedOrder.platform_login || '', 'Platform Login')}
                            className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                            title="Copy Platform Login"
                          >
                            <ClipboardIcon className="w-4 h-4" />
                          </button>
                    </div>
                  </div>
                    )}
                    {selectedOrder.platform_password && (
                      <div className="flex justify-between items-center gap-3">
                        <span className="text-gray-600 text-sm">Platform Password:</span>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-900 font-mono text-sm">{selectedOrder.platform_password}</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(selectedOrder.platform_password || '', 'Platform Password')}
                            className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                            title="Copy Platform Password"
                          >
                            <ClipboardIcon className="w-4 h-4" />
                          </button>
                        </div>
            </div>
          )}
                    {selectedOrder.profit_target !== null && selectedOrder.profit_target !== undefined && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 text-sm">Profit Target:</span>
                        <span className="text-gray-900 font-bold">${selectedOrder.profit_target.toLocaleString()}</span>
        </div>
                    )}
                  </div>
                </div>
              )}

              {/* Order Status Flags */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Order Status</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  <div className={`rounded-xl border p-3 ${selectedOrder.is_active ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-gray-50 border-gray-200 text-gray-600'}`}>
                    <div className="text-sm font-semibold">Active</div>
                    <div className="text-xs">{selectedOrder.is_active ? 'Yes' : 'No'}</div>
                  </div>
                  <div className={`rounded-xl border p-3 ${selectedOrder.completed ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-gray-50 border-gray-200 text-gray-600'}`}>
                    <div className="text-sm font-semibold">Completed</div>
                    <div className="text-xs">{selectedOrder.completed ? 'Yes' : 'No'}</div>
                  </div>
                  <div className={`rounded-xl border p-3 ${selectedOrder.passed ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-gray-50 border-gray-200 text-gray-600'}`}>
                    <div className="text-sm font-semibold">Passed</div>
                    <div className="text-xs">{selectedOrder.passed ? 'Yes' : 'No'}</div>
                  </div>
                  <div className={`rounded-xl border p-3 ${selectedOrder.is_stage2 ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-gray-50 border-gray-200 text-gray-600'}`}>
                    <div className="text-sm font-semibold">Stage 2</div>
                    <div className="text-xs">{selectedOrder.is_stage2 ? 'Yes' : 'No'}</div>
                  </div>
                  <div className={`rounded-xl border p-3 ${selectedOrder.is_live ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-gray-50 border-gray-200 text-gray-600'}`}>
                    <div className="text-sm font-semibold">Live</div>
                    <div className="text-xs">{selectedOrder.is_live ? 'Yes' : 'No'}</div>
                  </div>
                  <div className={`rounded-xl border p-3 ${selectedOrder.failed ? 'bg-red-50 border-red-200 text-red-700' : 'bg-gray-50 border-gray-200 text-gray-600'}`}>
                    <div className="text-sm font-semibold">Failed</div>
                    <div className="text-xs">{selectedOrder.failed ? 'Yes' : 'No'}</div>
                  </div>
                </div>
                {selectedOrder.completed_at && (
                  <div className="mt-4 pt-4 border-t border-gray-200 rounded-xl bg-white p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Completed At:</span>
                      <span className="text-gray-900 font-medium text-sm">{formatDateExact(selectedOrder.completed_at)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Timeline */}
              {selectedOrder.timeline && selectedOrder.timeline.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Order Timeline</h3>
                  <div className="space-y-3">
                    {selectedOrder.timeline.map((event, index) => (
                      <div key={index} className="rounded-xl border border-gray-200 bg-white shadow-sm p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <CalendarIcon className="w-5 h-5 text-blue-600" />
                          <span className="text-gray-900 font-semibold capitalize">{event.event_type}</span>
                          <span className="text-gray-600 text-sm">{formatDateExact(event.event_date)}</span>
                        </div>
                        <p className="text-gray-700 text-sm">{event.notes}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
      </DialogContent>
    </Dialog>

      {/* Payment Image Modal */}
      <Dialog open={!!showPaymentImage} onOpenChange={() => setShowPaymentImage(null)}>
        <DialogContent className="bg-gray-900 text-white border border-gray-700 max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">
              Payment Proof
            </DialogTitle>
        </DialogHeader>
          
          {showPaymentImage && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <img 
                  src={showPaymentImage} 
                  alt="Payment Proof" 
                  className="max-w-full max-h-[70vh] object-contain rounded-lg border border-gray-700"
            />
          </div>
              <div className="flex justify-center">
                <a 
                  href={showPaymentImage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                  Open Full Size
                </a>
          </div>
          </div>
          )}
      </DialogContent>
    </Dialog>

      {/* Edit Order Modal - Professional (matches view/credentials style) */}
      <Dialog open={!!editingOrder} onOpenChange={() => setEditingOrder(null)}>
        <DialogContent className="bg-rose-50/80 text-gray-900 border border-gray-200 shadow-2xl max-w-4xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full mx-2 sm:mx-auto rounded-2xl">
          <DialogHeader className="pb-4 border-b border-gray-200">
            <DialogTitle className="text-xl font-bold text-gray-900 tracking-tight">
              Edit Order
            </DialogTitle>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-gray-900 text-white mt-2">
              {editingOrder?.order_id}
            </span>
          </DialogHeader>

          {editingOrder && (
            <div className="space-y-6 pt-4">
              {isLoadingOrderDetails && (
                <div className="flex items-center justify-center py-12">
                  <span className="h-8 w-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
                  <span className="ml-3 text-gray-600 font-medium">Loading order details...</span>
                </div>
              )}
              {!isLoadingOrderDetails && (
              <>
              {/* Status Selection */}
              <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-5">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Change Status</h3>
                <select
                  value={editForm.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900"
                >
                  <option value="">Select Status</option>
                  {getStatusOptions().map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Container Selection for Deliver with Container */}
              {editForm.status === 'deliver_with_container' && (
                <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-5">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Select Container Account</h3>
                  {isLoadingContainers ? (
                    <div className="flex items-center justify-center py-6">
                      <span className="h-5 w-5 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
                      <span className="ml-2 text-gray-600 text-sm">Loading available accounts...</span>
        </div>
                  ) : availableContainers.length > 0 ? (
                    <select
                      value={selectedContainerId || ''}
                      onChange={(e) => handleContainerSelect(Number(e.target.value))}
                      className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900"
                    >
                      <option value="">Select an account</option>
                      {availableContainers.map((container) => (
                        <option key={container.id} value={container.id}>
                          ID: {container.id} - {container.platform} - ${container.account_size} - {container.account_type}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                      <p className="text-amber-800 text-sm font-medium">
                        No available accounts found matching account size ({editingOrder?.account_size}) and platform ({editingOrder?.platform})
                      </p>
      </div>
                  )}
                </div>
              )}

              {/* Conditional Fields based on Status */}
              {(editForm.status === 'deliver' || editForm.status === 'deliver_with_container' || editForm.status === 'edit_delivered_order') && (
                <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-5 space-y-4">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Account Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Server</label>
                      <input
                        type="text"
                        value={editForm.server}
                        onChange={(e) => setEditForm({...editForm, server: e.target.value})}
                        className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900"
                        placeholder="Enter server"
                      />
            </div>
            <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Platform Login</label>
                      <input
                        type="text"
                        value={editForm.login}
                        onChange={(e) => setEditForm({...editForm, login: e.target.value})}
                        className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900"
                        placeholder="Enter platform login"
                      />
            </div>
          </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Platform Password</label>
                      <div className="relative">
                        <input
                          type={showEditPassword ? "text" : "password"}
                          value={editForm.password}
                          onChange={(e) => setEditForm({...editForm, password: e.target.value})}
                          className="w-full px-3 py-2.5 pr-10 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900"
                          placeholder="Enter platform password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowEditPassword(!showEditPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-900 transition-colors"
                          title={showEditPassword ? "Hide password" : "View password"}
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">Profit Target</label>
                      <input
                        type="text"
                        value={editForm.profitTarget}
                        onChange={(e) => setEditForm({...editForm, profitTarget: e.target.value})}
                        className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900"
                        placeholder="Enter profit target"
                      />
            </div>
          </div>
        </div>
              )}

              {(editForm.status === 'stage2' || editForm.status === 'live') && (
                <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-5 space-y-4">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Stage 2 / Live Account Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Server</label>
                      <input
                        type="text"
                        value={editForm.server}
                        onChange={(e) => setEditForm({...editForm, server: e.target.value})}
                        className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900"
                        placeholder="Enter server"
                      />
            </div>
            <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Platform Login</label>
                      <input
                        type="text"
                        value={editForm.login}
                        onChange={(e) => setEditForm({...editForm, login: e.target.value})}
                        className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900"
                        placeholder="Enter platform login"
                      />
            </div>
          </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Platform Password</label>
                      <div className="relative">
                        <input
                          type={showEditPassword ? "text" : "password"}
                          value={editForm.password}
                          onChange={(e) => setEditForm({...editForm, password: e.target.value})}
                          className="w-full px-3 py-2.5 pr-10 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900"
                          placeholder="Enter platform password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowEditPassword(!showEditPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-900 transition-colors"
                          title={showEditPassword ? "Hide password" : "View password"}
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">Session ID</label>
                      <input
                        type="text"
                        value={editForm.sessionId}
                        onChange={(e) => setEditForm({...editForm, sessionId: e.target.value})}
                        className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900"
                        placeholder="Enter session ID"
                      />
            </div>
          </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Terminal ID</label>
                      <input
                        type="text"
                        value={editForm.terminalId}
                        onChange={(e) => setEditForm({...editForm, terminalId: e.target.value})}
                        className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900"
                        placeholder="Enter terminal ID"
                      />
        </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Profit Target</label>
                      <input
                        type="text"
                        value={editForm.profitTarget}
                        onChange={(e) => setEditForm({...editForm, profitTarget: e.target.value})}
                        className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900"
                        placeholder="Enter profit target"
                      />
      </div>
          </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Account Type</label>
                    <select
                      value={editForm.accountType}
                      onChange={(e) => setEditForm({...editForm, accountType: e.target.value})}
                      className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900"
                    >
                      <option value="">Select Account Type</option>
                      <option value="stage2">Stage 2</option>
                      <option value="live">Live</option>
                    </select>
                  </div>
        </div>
      )}

              {editForm.status === 'pass' && (
                <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-5">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Pass Order</h3>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Profit Amount</label>
                  <input
                    type="text"
                    value={editForm.profitAmount}
                    onChange={(e) => setEditForm({...editForm, profitAmount: e.target.value})}
                    className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900"
                    placeholder="Enter profit amount"
                  />
                </div>
              )}

              {editForm.status === 'fail' && (
                <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-5 space-y-4">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Fail Order</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Reason</label>
                    <select
                      value={editForm.reason}
                      onChange={(e) => setEditForm({...editForm, reason: e.target.value})}
                      className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900"
                    >
                      <option value="">Select Reason</option>
                      {getFailureReasons().map((reason) => (
                        <option key={reason.value} value={reason.value}>
                          {reason.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                    <input
                      type="date"
                      value={editForm.date}
                      onChange={(e) => setEditForm({...editForm, date: e.target.value})}
                      className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900"
              />
            </div>
          </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setEditingOrder(null)}
                  className="w-full sm:w-auto px-5 py-2.5 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition-colors font-medium"
                  disabled={isLoadingOrderDetails}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={isSaving || isLoadingOrderDetails}
                  className="w-full sm:w-auto px-5 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <span className="h-4 w-4 border-2 border-white/60 border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckIcon className="w-5 h-5" />
                      Save Changes
                    </>
                  )}
                </button>
          </div>
              </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Credentials Modal - Professional card layout (reference design) */}
      <Dialog open={showCredentialsModal} onOpenChange={setShowCredentialsModal}>
        <DialogContent className="bg-rose-50/80 text-gray-900 border border-gray-200 shadow-2xl max-w-5xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full mx-2 sm:mx-auto rounded-2xl">
          <DialogHeader className="pb-4 border-b border-gray-200">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <DialogTitle className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                Account Credentials
              </DialogTitle>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">
                  Order: <span className="text-gray-900 font-mono font-semibold">{credentialsOrder?.order_id}</span>
                </span>
                {!isEditingCredentials && (
                  <button
                    onClick={() => handleEditCredentials(credentialsOrder!)}
                    className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2 text-sm font-medium"
                    title="Edit Credentials"
                  >
                    <PencilIcon className="w-4 h-4" />
                    Edit
                  </button>
                )}
          </div>
                        </div>
          </DialogHeader>
          {credentialsOrder && (
            <div className="space-y-6 mt-6">
              {/* Edit Credentials Form */}
              {isEditingCredentials && (
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <PencilIcon className="w-5 h-5 text-gray-700" />
                    Edit Credentials
                  </h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Server</label>
                        <input
                          type="text"
                          value={credentialsForm.server}
                          onChange={(e) => setCredentialsForm({...credentialsForm, server: e.target.value})}
                          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900"
                          placeholder="Enter server"
                        />
                        </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Platform Login</label>
                        <input
                          type="text"
                          value={credentialsForm.platform_login}
                          onChange={(e) => setCredentialsForm({...credentialsForm, platform_login: e.target.value})}
                          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900"
                          placeholder="Enter platform login"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Platform Password</label>
                      <input
                        type="text"
                        value={credentialsForm.platform_password}
                        onChange={(e) => setCredentialsForm({...credentialsForm, platform_password: e.target.value})}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900"
                        placeholder="Enter platform password"
                      />
                    </div>
                    {(credentialsForm.account_type === 'stage2' || credentialsForm.account_type === 'completed') && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Profit Target</label>
                        <input
                          type="text"
                          value={credentialsForm.profit_target}
                          onChange={(e) => setCredentialsForm({...credentialsForm, profit_target: e.target.value})}
                          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900"
                          placeholder="Enter profit target"
                        />
                      </div>
                    )}
                    {credentialsForm.account_type === 'live' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Profit Share (%)</label>
                        <input
                          type="text"
                          value={credentialsForm.profit_share}
                          onChange={(e) => setCredentialsForm({...credentialsForm, profit_share: e.target.value})}
                          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900"
                          placeholder="Enter profit share percentage"
                        />
                      </div>
                    )}
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                      <button
                        onClick={handleCancelEditCredentials}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                        disabled={isSavingCredentials}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveCredentials}
                        disabled={isSavingCredentials}
                        className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
                      >
                        {isSavingCredentials ? (
                          <>
                            <span className="h-4 w-4 border-2 border-white/60 border-t-transparent rounded-full animate-spin"></span>
                            Saving...
                          </>
                        ) : (
                          <>
                            <CheckIcon className="w-4 h-4" />
                            Save Changes
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* View Credentials - Professional card layout: 2 per row, pastel cards with View button */}
              {!isEditingCredentials && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  {(() => {
                    const STATUS_OPTIONS = [
                      { value: 'active', label: 'Active' },
                      { value: 'stage2', label: 'Stage 2' },
                      { value: 'live', label: 'Live' },
                    ]
                    const CredCard = ({
                      title,
                      subtitle,
                      topLabel,
                      topValue,
                      bottomLabel,
                      bottomValue,
                      bgClass,
                      fields,
                      onCopyAll,
                      onEdit,
                      showChangeStatus,
                      selectedStatus,
                      onStatusChange,
                      onUpdateStatus,
                      changeStatusLoading,
                    }: {
                      title: string
                      subtitle: string
                      topLabel: string
                      topValue: string
                      bottomLabel: string
                      bottomValue: string
                      bgClass: string
                      fields: { label: string; value: string }[]
                      onCopyAll: () => void
                      onEdit?: () => void
                      showChangeStatus?: boolean
                      selectedStatus?: string
                      onStatusChange?: (v: string) => void
                      onUpdateStatus?: () => void
                      changeStatusLoading?: boolean
                    }) => (
                      <div className={`relative rounded-2xl ${bgClass} p-5 shadow-lg border border-white/50 min-h-[200px] flex flex-col`}>
                        <div className="flex justify-between items-start mb-3">
                          <span className="text-sm font-bold text-gray-900">{topValue}</span>
                          <button onClick={onCopyAll} className="p-1.5 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-black/5 transition-colors" title="Copy all">
                            <BookmarkIcon className="w-5 h-5" />
                          </button>
                          </div>
                        <div className="flex-1">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-gray-900 text-white mb-2">
                            {title}
                              </span>
                          <p className="text-sm text-gray-600 mt-2">{bottomLabel}</p>
                          <p className="text-sm font-mono text-gray-900 truncate">{bottomValue}</p>
                          </div>
                        {showChangeStatus && selectedStatus !== undefined && onStatusChange && onUpdateStatus && (
                          <div className="mt-4 pt-4 border-t border-gray-300/50 space-y-2">
                            <span className="text-xs text-gray-600 uppercase font-medium">Change order status</span>
                            <div className="flex flex-wrap items-center gap-2">
                              <select
                                value={selectedStatus}
                                onChange={(e) => onStatusChange(e.target.value)}
                                className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900"
                              >
                                {STATUS_OPTIONS.map((o) => (
                                  <option key={o.value} value={o.value}>{o.label}</option>
                                ))}
                              </select>
                              <button
                                onClick={onUpdateStatus}
                                disabled={changeStatusLoading}
                                className="px-4 py-2 text-sm font-semibold bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                              >
                                {changeStatusLoading && (
                                  <span className="h-4 w-4 border-2 border-white/60 border-t-transparent rounded-full animate-spin" />
                                )}
                                {changeStatusLoading ? 'Updating...' : 'Update status'}
                              </button>
                          </div>
                          </div>
                        )}
                        <div className="mt-4 flex justify-end">
                          {onEdit && (
                            <button
                              onClick={onEdit}
                              className="px-4 py-2 text-gray-700 bg-white/80 hover:bg-white border border-gray-300 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
                            >
                              <PencilIcon className="w-4 h-4" />
                              Edit
                            </button>
                          )}
                        </div>
                        {/* Credential fields (Server shown at top only, excluded here) */}
                        {fields.filter((f) => f.label !== 'Server').length > 0 && (
                          <div className="mt-4 pt-4 border-t border-gray-300/50 grid grid-cols-2 gap-2">
                            {fields.filter((f) => f.label !== 'Server').map((f) => (
                              <div key={f.label} className="flex flex-col">
                                <span className="text-xs text-gray-600 uppercase">{f.label}</span>
                                <div className="flex items-center gap-1">
                                  <span className="text-sm font-mono text-gray-900 truncate">{f.value}</span>
                                  <button onClick={() => copyToClipboard(f.value, f.label)} className="p-1 hover:bg-black/5 rounded shrink-0" title={`Copy ${f.label}`}>
                                    <ClipboardIcon className="w-3.5 h-3.5 text-gray-600" />
                                  </button>
                                </div>
                              </div>
                            ))}
          </div>
        )}
      </div>
                    )
                    const cards: ReactElement[] = []
                    if (credentialsOrder.live_account) {
                      const acc = credentialsOrder.live_account
                      const fields = [
                        acc.credential_id != null && { label: 'Credential ID', value: String(acc.credential_id) },
                        acc.server && { label: 'Server', value: acc.server },
                        acc.platform_login && { label: 'Platform Login', value: acc.platform_login },
                        acc.platform_password && { label: 'Platform Password', value: acc.platform_password },
                        acc.profit_share != null && { label: 'Profit Share', value: `${acc.profit_share}%` },
                      ].filter(Boolean) as { label: string; value: string }[]
                      const copyAll = () => {
                        const text = fields.map(f => `${f.label}: ${f.value}`).join('\n')
                        copyToClipboard(text, 'Live Account Credentials')
                      }
                      cards.push(
                        <CredCard
                          key="live"
                          title="Live Account"
                          subtitle="Active trading"
                          topLabel="ID"
                          topValue={acc.credential_id != null ? `#${acc.credential_id}` : '—'}
                          bottomLabel="Server"
                          bottomValue={acc.server || acc.platform_login || '—'}
                          bgClass="bg-violet-100"
                          fields={fields}
                          onCopyAll={copyAll}
                          onEdit={() => handleEditAccountByType('live')}
                          showChangeStatus
                          selectedStatus={manualChangeStatus}
                          onStatusChange={setManualChangeStatus}
                          onUpdateStatus={handleManualChangeStatus}
                          changeStatusLoading={changeStatusLoading}
                        />
                      )
                    }
                    if (credentialsOrder.stage2_account) {
                      const acc = credentialsOrder.stage2_account
                      const fields = [
                        acc.credential_id != null && { label: 'Credential ID', value: String(acc.credential_id) },
                        acc.server && { label: 'Server', value: acc.server },
                        acc.platform_login && { label: 'Platform Login', value: acc.platform_login },
                        acc.platform_password && { label: 'Platform Password', value: acc.platform_password },
                        acc.profit_target != null && { label: 'Profit Target', value: `$${acc.profit_target.toLocaleString()}` },
                      ].filter(Boolean) as { label: string; value: string }[]
                      const copyAll = () => {
                        const text = fields.map(f => `${f.label}: ${f.value}`).join('\n')
                        copyToClipboard(text, 'Stage 2 Credentials')
                      }
                      cards.push(
                        <CredCard
                          key="stage2"
                          title="Stage 2 Account"
                          subtitle="Second stage"
                          topLabel="ID"
                          topValue={acc.credential_id != null ? `#${acc.credential_id}` : '—'}
                          bottomLabel="Server"
                          bottomValue={acc.server || acc.platform_login || '—'}
                          bgClass="bg-amber-50"
                          fields={fields}
                          onCopyAll={copyAll}
                          onEdit={() => handleEditAccountByType('stage2')}
                          showChangeStatus
                          selectedStatus={manualChangeStatus}
                          onStatusChange={setManualChangeStatus}
                          onUpdateStatus={handleManualChangeStatus}
                          changeStatusLoading={changeStatusLoading}
                        />
                      )
                    }
                    if (credentialsOrder.completed || credentialsOrder.server || credentialsOrder.platform_login) {
                      const fields = [
                        credentialsOrder.credential_id != null && { label: 'Credential ID', value: String(credentialsOrder.credential_id) },
                        credentialsOrder.server && { label: 'Server', value: credentialsOrder.server },
                        credentialsOrder.platform_login && { label: 'Platform Login', value: credentialsOrder.platform_login },
                        credentialsOrder.platform_password && { label: 'Platform Password', value: credentialsOrder.platform_password },
                        credentialsOrder.profit_target != null && { label: 'Profit Target', value: `$${credentialsOrder.profit_target.toLocaleString()}` },
                      ].filter(Boolean) as { label: string; value: string }[]
                      const copyAll = () => {
                        const text = fields.map(f => `${f.label}: ${f.value}`).join('\n')
                        copyToClipboard(text, 'Completed Credentials')
                      }
                      cards.push(
                        <CredCard
                          key="completed"
                          title="Completed Account"
                          subtitle="Initial challenge"
                          topLabel="ID"
                          topValue={credentialsOrder.credential_id != null ? `#${credentialsOrder.credential_id}` : '—'}
                          bottomLabel="Server"
                          bottomValue={credentialsOrder.server || credentialsOrder.platform_login || '—'}
                          bgClass="bg-emerald-50"
                          fields={fields}
                          onCopyAll={copyAll}
                          onEdit={() => handleEditAccountByType('completed')}
                          showChangeStatus
                          selectedStatus={manualChangeStatus}
                          onStatusChange={setManualChangeStatus}
                          onUpdateStatus={handleManualChangeStatus}
                          changeStatusLoading={changeStatusLoading}
                        />
                      )
                    }
                    if (cards.length === 0) {
                      return (
                        <div className="col-span-full text-center py-16 rounded-2xl border-2 border-dashed border-gray-300 bg-white/60">
                          <ClipboardIcon className="w-14 h-14 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600 font-medium text-lg">No credentials available</p>
                          <p className="text-gray-500 text-sm mt-1">Credentials will appear here once the order is completed</p>
    </div>
                      )
                    }
                    return <>{cards}</>
                  })()}
                </div>
              )}

              <div className="flex justify-end pt-6 mt-2 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowCredentialsModal(false)
                    setIsEditingCredentials(false)
                    handleCancelEditCredentials()
                  }}
                  className="px-6 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* User Statistics Modal - professional light theme like credentials */}
      <Dialog open={showStatisticsModal} onOpenChange={(open) => { if (!open) { setShowStatisticsModal(false); setStatisticsOrder(null); setStatisticsData(null); setStatisticsError(null) } }}>
        <DialogContent className="bg-rose-50/80 text-gray-900 border border-gray-200 shadow-2xl max-w-5xl w-[95vw] max-h-[90vh] overflow-y-auto rounded-2xl mx-2 sm:mx-auto">
          <DialogHeader className="pb-4 border-b border-gray-200">
            <DialogTitle className="text-xl font-bold text-gray-900 tracking-tight">
              User Statistics — {statisticsOrder?.order_id || ''}
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
            {!statisticsLoading && statisticsData && statisticsOrder && !statisticsError && (
              <AdminOrderStatisticsView
                order={{
                  id: statisticsOrder.id,
                  order_id: statisticsOrder.order_id,
                  challenge_type: statisticsOrder.challenge_type,
                  account_type: statisticsOrder.challenge_type,
                  platform: statisticsOrder.platform,
                  profit_target: statisticsOrder.profit_target ?? statisticsOrder.stage2_account?.profit_target,
                  status: statisticsOrder.status,
                  is_live: statisticsOrder.is_live,
                  is_stage2: statisticsOrder.is_stage2,
                  stage2_account: statisticsOrder.stage2_account,
                  live_account: statisticsOrder.live_account,
                  platform_login: statisticsOrder.platform_login,
                  credentials: statisticsOrder.platform_login ? { platform_login: statisticsOrder.platform_login, profit_target: statisticsOrder.profit_target ?? undefined } : undefined,
                  stage2_credentials: statisticsOrder.stage2_account ? { platform_login: statisticsOrder.stage2_account.platform_login, profit_target: statisticsOrder.stage2_account.profit_target } : undefined,
                  live_credentials: statisticsOrder.live_account ? { platform_login: statisticsOrder.live_account.platform_login } : undefined
                }}
                data={statisticsData}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Login as User Modal */}
      <AdminLoginAsUserModal
        isOpen={showLoginAsUserModal}
        onClose={() => {
          setShowLoginAsUserModal(false)
          setLoginAsUserEmail("")
          setLoginAsUserPassword("")
        }}
        prefilledEmail={loginAsUserEmail}
        prefilledPassword={loginAsUserPassword}
      />
    </AdminLayout>
  )
}
