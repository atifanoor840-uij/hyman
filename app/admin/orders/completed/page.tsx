"use client"
import { useEffect, useState } from "react"
import { getApiBaseUrl } from "@/lib/api"
import { toast } from "@/hooks/use-toast"
import AdminLayout from "@/components/admin-layout"
import SectionCard from "@/components/ui/section-card"
import { formatDateKarachi } from '@/lib/utils'
import { useCachedOrders } from '@/hooks/use-cached-orders'
import { invalidateCachesForStatusChange, broadcastCacheInvalidation } from '@/lib/order-cache-utils'
import { 
  ClipboardDocumentListIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  CheckCircleIcon,
  ArrowTopRightOnSquareIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  CreditCardIcon,
  PencilIcon,
  ClipboardIcon,
  ArrowRightOnRectangleIcon
} from "@heroicons/react/24/outline"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import AdminLoader from "@/components/ui/admin-loader"
import AdminLoginAsUserModal from "@/components/admin-login-as-user-modal"

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
  checkout_session_url: string | null
  image: {
    url: string
    public_id: string
    created_at: string
  } | null
  status: string | null
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
  complete_order_id: number | null
  stage2_account?: {
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
    server: string
    platform_login: string
    platform_password: string
    session_id: string
    terminal_id: number
    profit_share: number
    status: string
    created_at: string
  }
  has_account_credential?: boolean
}

export default function AdminOrdersCompletedPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showPaymentImage, setShowPaymentImage] = useState<string | null>(null)
  const [editingOrder, setEditingOrder] = useState<Order | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [showLoginAsUserModal, setShowLoginAsUserModal] = useState(false)
  const [loginAsUserEmail, setLoginAsUserEmail] = useState("")
  const [loginAsUserPassword, setLoginAsUserPassword] = useState("")
  const [isFetchingPassword, setIsFetchingPassword] = useState<string | null>(null)
  const [isLoadingOrderDetails, setIsLoadingOrderDetails] = useState(false)
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

  // Use cached orders hook with custom transformation
  const { data: orders, isLoading, error: fetchError, refresh } = useCachedOrders<Order>({
    endpoint: `${getApiBaseUrl()}/orders/list/completed`,
    storageKey: 'admin_orders_completed',
    transformData: (data) => {
      // Handle nested array structure: [[{...}], "total_active_accounts": 41]
      let ordersList: Order[] = []
      
      if (data && typeof data === 'object') {
        if (Array.isArray(data)) {
          if (data.length > 0 && Array.isArray(data[0])) {
            ordersList = data[0] as Order[]
          } else {
            ordersList = data as Order[]
          }
        } else {
          for (const key of Object.keys(data)) {
            if (key !== 'total_active_accounts') {
              const ordersData = data[key]
              if (Array.isArray(ordersData)) {
                if (ordersData.length > 0 && Array.isArray(ordersData[0])) {
                  ordersList = ordersData[0] as Order[]
                } else {
                  ordersList = ordersData as Order[]
                }
                break
              }
            }
          }
        }
      }
      
      // Exclude failed orders - they only show on Failed page
      ordersList = ordersList.filter((o: Order) => !o.failed && o.status?.toLowerCase() !== 'failed')
      
      // Sort by newest first
      return ordersList.sort((a: Order, b: Order) => {
        const getSortDate = (order: Order) => {
          if (order.completed_at) {
            return new Date(order.completed_at).getTime()
          }
          if (order.timeline && order.timeline.length > 0) {
            const creationEvent = order.timeline.find(e => e.event_type === 'created')
            const eventDate = creationEvent 
              ? creationEvent.event_date 
              : order.timeline[order.timeline.length - 1].event_date
            return new Date(eventDate).getTime()
          }
          return order.id
        }
        return getSortDate(b) - getSortDate(a)
      })
    },
    mergeStrategy: 'smart',
  })

  // Local error state for specific actions
  const [error, setError] = useState<string | null>(null)
  // Optimistic removal: when we fail an order, remove from list instantly
  const [optimisticallyRemovedIds, setOptimisticallyRemovedIds] = useState<number[]>([])

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

  const filteredOrders = orders
    .filter(order => !optimisticallyRemovedIds.includes(order.id))
    .filter(order => matchesSearch(order, searchTerm))

  const getStatusColor = (status: string | null | undefined) => {
    if (!status) return "bg-gray-500/20 text-gray-400"
    switch (status.toLowerCase()) {
      case "pending": return "bg-yellow-500/20 text-yellow-400"
      case "active": return "bg-blue-500/20 text-blue-400"
      case "passed": return "bg-slate-500/20 text-slate-700"
      case "failed": return "bg-red-500/20 text-red-400"
      case "funded": return "bg-slate-500/20 text-slate-700"
      case "completed": return "bg-slate-500/20 text-slate-700"
      default: return "bg-gray-500/20 text-gray-400"
    }
  }

  const formatAmount = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return '$0.00'
    }
    return `$${amount.toFixed(2)}`
  }


  const getPaymentMethodColor = (method: string | null | undefined) => {
    if (!method) return "bg-gray-500/20 text-gray-400"
    switch (method.toUpperCase()) {
      case "CARD": return "bg-blue-500/20 text-blue-400"
      case "CRYPTO": return "bg-orange-500/20 text-orange-400"
      case "PAYPAL": return "bg-purple-500/20 text-purple-400"
      case "BANK": return "bg-slate-500/20 text-slate-700"
      default: return "bg-gray-500/20 text-gray-400"
    }
  }

  const fetchUserPassword = async (email: string): Promise<string> => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('admin_access_token') : null
      if (!token) {
        throw new Error('Admin token not found')
      }

      const response = await fetch(`${getApiBaseUrl()}/auth/members`, {
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
    setIsFetchingPassword(email)
    try {
      const password = await fetchUserPassword(email)
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('admin_auto_login_email', email)
        localStorage.setItem('admin_auto_login_password', password)
        localStorage.setItem('admin_auto_login_trigger', 'true')
        
        const adminToken = localStorage.getItem('admin_access_token')
        if (adminToken) {
          localStorage.setItem('admin_token_backup', adminToken)
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, 500))
      window.location.href = '/login'
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch user credentials. Please try again.",
        variant: "destructive" as any
      })
      setIsFetchingPassword(null)
    }
  }

  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text)
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

  const handleEditOrder = async (order: Order) => {
    setEditingOrder(order)
    setIsLoadingOrderDetails(true)
    setError(null)
    
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("admin_access_token") : null
      if (!token) {
        setError("Admin access token not found. Please login again.")
        setIsLoadingOrderDetails(false)
        return
      }

      // Fetch order details from /complete endpoint
      const response = await fetch(`${getApiBaseUrl()}/orders/detail/${order.id}/complete`, {
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
          server: '',
          login: '',
          password: '',
          profitTarget: '',
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
        server: '',
        login: '',
        password: '',
        profitTarget: '',
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

    if (!editForm.status) {
      toast({ title: "Action required", description: "Please select an action (e.g. Deliver, Edit Delivered Order, Stage 2, Live).", variant: "destructive" })
      return
    }
    
    try {
      setIsSaving(true)
      setError(null)
      const token = typeof window !== "undefined" ? localStorage.getItem("admin_access_token") : null
      if (!token) {
        setError("Admin access token not found. Please login again.")
        toast({ title: "Authorization required", description: "Please log in to continue.", variant: "destructive" })
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

        response = await fetch(`${getApiBaseUrl()}/orders/detail/${orderId}/complete`, {
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

        response = await fetch(`${getApiBaseUrl()}/orders/detail/${orderId}/complete`, {
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

        response = await fetch(`${getApiBaseUrl()}/orders/edit-passed/${orderId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            // Don't set Content-Type header - browser will set it automatically with boundary for FormData
          },
          body: formData
        })
      } else if (editForm.status === 'fail') {
        if (!editForm.reason?.trim()) {
          toast({ title: "Reason required", description: "Please select a failure reason before saving.", variant: "destructive" })
          setIsSaving(false)
          return
        }
        if (!editForm.date?.trim()) {
          toast({ title: "Date required", description: "Please choose a failure date before saving.", variant: "destructive" })
          setIsSaving(false)
          return
        }
        // Fail endpoint - send reason and date_time in FormData (backend expects form body)
        // order_id is in the path as orderId (numeric id); optionally include order_id in body for backend
        const formData = new FormData()
        const dateTime = editForm.date.includes('T') ? editForm.date : `${editForm.date}T00:00:00Z`
        formData.append('date_time', dateTime)
        formData.append('reason', editForm.reason.trim())
        if (editingOrder.order_id) formData.append('order_id', editingOrder.order_id)

        response = await fetch(`${getApiBaseUrl()}/orders/detail/${orderId}/fail`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData
        })
      } else if (editForm.status === 'pass') {
        // Pass endpoint
        const passData = {
          profit_amount: editForm.profitAmount
        }

        response = await fetch(`${getApiBaseUrl()}/orders/detail/${orderId}/pass`, {
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
        let serverMessage = ""
        try {
          const text = await response.text()
          if (text) {
            try {
              const errBody = JSON.parse(text)
              if (errBody && typeof errBody === "object") {
                serverMessage = errBody.message ?? errBody.error ?? errBody.msg ?? ""
                if (!serverMessage && errBody.detail) {
                  if (typeof errBody.detail === "string") serverMessage = errBody.detail
                  else if (Array.isArray(errBody.detail) && errBody.detail.length > 0) {
                    const first = errBody.detail[0]
                    serverMessage = first.msg ?? first.message ?? JSON.stringify(first)
                  }
                }
              }
            } catch {
              serverMessage = text
            }
          }
        } catch {
          // ignore
        }
        const description = serverMessage || "Could not save changes."
        if (response.status === 401) {
          setError("Unauthorized. Please login again.")
          toast({ title: "Unauthorized", description: "Please login again.", variant: "destructive" })
        } else if (response.status === 403) {
          setError("Access forbidden. Insufficient permissions.")
          toast({ title: "Access forbidden", description: "You don't have permission to perform this action.", variant: "destructive" })
        } else {
          setError(serverMessage || `Failed to update order: ${response.status} ${response.statusText}`)
          toast({ title: "Update failed", description, variant: "destructive" })
        }
        return
      }

      if (response) {
        const result = await response.json()
        console.log('Order updated successfully:', result)
        toast({ title: "Order updated", description: "Changes saved successfully." })
        
        // When failing: remove from list instantly (order only shows on Failed page)
        if (editForm.status === 'fail') {
          setOptimisticallyRemovedIds(prev => [...prev, editingOrder.id])
        }
        
        // Invalidate relevant caches based on status change
        const oldStatus = editingOrder.status
        const newStatus = editForm.status
        invalidateCachesForStatusChange(oldStatus, newStatus)
        
        // Broadcast invalidation to other tabs/pages
        broadcastCacheInvalidation({ oldStatus, newStatus })
      }
      
      // Close modal and reset form
      const failedOrderId = editForm.status === 'fail' ? editingOrder.id : null
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
      
      // Refresh orders data from cache/API
      await refresh()
      if (failedOrderId) {
        setOptimisticallyRemovedIds(prev => prev.filter(id => id !== failedOrderId))
      }
      
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

  // Calculate revenue statistics
  const calculateRevenue = () => {
    let cardRevenue = 0
    let cryptoRevenue = 0
    let cardCount = 0
    let cryptoCount = 0

    orders.forEach((order) => {
      if (order.amount && order.payment_method) {
        if (order.payment_method === "CARD") {
          cardRevenue += order.amount
          cardCount++
        } else if (order.payment_method === "CRYPTO") {
          cryptoRevenue += order.amount
          cryptoCount++
        }
      }
    })

    return { cardRevenue, cryptoRevenue, cardCount, cryptoCount }
  }

  const revenueStats = calculateRevenue()

  return (
    <AdminLayout
      title="Completed Orders"
      subtitle="Successfully completed trading challenges"
    >
      {/* Revenue Statistics Cards */}
      {!isLoading && !fetchError && !error && orders.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <SectionCard>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Card Payments Revenue</p>
                <p className="text-2xl font-bold text-gray-900">${revenueStats.cardRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                <p className="text-xs text-gray-500 mt-1">{revenueStats.cardCount} order{revenueStats.cardCount !== 1 ? 's' : ''}</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-100 border border-blue-300">
                <CreditCardIcon className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </SectionCard>
          <SectionCard>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Crypto Payments Revenue</p>
                <p className="text-2xl font-bold text-gray-900">${revenueStats.cryptoRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                <p className="text-xs text-gray-500 mt-1">{revenueStats.cryptoCount} order{revenueStats.cryptoCount !== 1 ? 's' : ''}</p>
              </div>
              <div className="p-3 rounded-lg bg-orange-100 border border-orange-300">
                <CurrencyDollarIcon className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </SectionCard>
        </div>
      )}

      {/* Search */}
      <SectionCard>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by order ID, email, username, account credentials (login/password/server), platform, etc..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
              />
            </div>
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

      {/* Orders Table */}
      <SectionCard padded={false}>
        {isLoading && orders.length === 0 ? (
          <AdminLoader type="completed" message="Loading completed orders..." />
        ) : (fetchError || error) && orders.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-12 h-12 text-red-500 mx-auto mb-4">⚠️</div>
            <p className="text-red-600">Failed to load orders</p>
            <p className="text-white/80 text-sm mt-2">{fetchError || error}</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-8 text-center">
            <ClipboardDocumentListIcon className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <p className="text-red-400">Failed to load completed orders</p>
            <p className="text-gray-400 text-sm mt-2">{error}</p>
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1200px]">
              <thead className="border-b border-gray-700">
                <tr>
                  <th className="text-left py-3 px-3 text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">Order ID</th>
                  <th className="text-left py-3 px-3 text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">User</th>
                  <th className="text-left py-3 px-3 text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">Challenge</th>
                  <th className="text-left py-3 px-3 text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">Amount</th>
                  <th className="text-left py-3 px-3 text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">Payment</th>
                  <th className="text-left py-3 px-3 text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">Completed</th>
                  <th className="text-left py-3 px-3 text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="border-b-2 border-gray-700 hover:bg-gray-800/30 transition-colors">
                    <td className="py-3 px-3">
                      <div className="space-y-1">
                        <div className="text-white font-bold text-sm">{order.order_id}</div>
                        <div className="text-gray-400 text-xs">ID: {order.id}</div>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="space-y-1">
                        <div className="text-white font-bold text-sm">{order.username}</div>
                        <div className="text-gray-400 text-xs">{order.email}</div>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="space-y-1">
                        <div className="text-white font-bold text-sm">{order.challenge_type}</div>
                        <div className="text-gray-400 text-xs">${order.account_size}</div>
                        <div className="text-gray-500 text-xs">{order.platform}</div>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-white font-bold text-sm whitespace-nowrap">{formatAmount(order.amount)}</span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="space-y-1">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap ${getPaymentMethodColor(order.payment_method)}`}>
                          {order.payment_method || '—'}
                        </span>
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
                            className="inline-flex items-center gap-1 text-xs text-orange-400 hover:text-orange-300 transition-colors bg-orange-500/10 px-2 py-1 rounded border border-orange-500/20"
                          >
                            <ArrowTopRightOnSquareIcon className="w-3 h-3" />
                            View Image
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-gray-400 font-semibold text-xs whitespace-nowrap">
                        {order.timeline && order.timeline.length > 0 
                          ? formatDateKarachi(order.timeline[order.timeline.length - 1]?.event_date)
                          : '—'
                        }
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => setSelectedOrder(order)}
                          className="p-2 text-gray-400 hover:text-blue-400 transition-colors"
                          title="View Details"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleEditOrder(order)}
                          className="p-2 text-gray-400 hover:text-yellow-400 transition-colors"
                          title="Edit Order"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleLoginAsUser(order.email)}
                          disabled={isFetchingPassword === order.email}
                          className="p-2 text-gray-400 hover:text-purple-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Login as User"
                        >
                          {isFetchingPassword === order.email ? (
                            <div className="w-4 h-4 border-2 border-gray-400/20 border-t-gray-400 rounded-full animate-spin" />
                          ) : (
                            <ArrowRightOnRectangleIcon className="w-4 h-4" />
                          )}
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
            <CheckCircleIcon className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-gray-400">No completed orders found</p>
          </div>
        )}
      </SectionCard>

      {/* Order Details Modal */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="bg-gray-900 text-white border border-gray-700 max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">
              Completed Order Details - {selectedOrder?.order_id}
            </DialogTitle>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Order Information</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Order ID:</span>
                        <span className="text-white font-mono">{selectedOrder.order_id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Internal ID:</span>
                        <span className="text-white">{selectedOrder.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Amount:</span>
                        <span className="text-white font-semibold">{formatAmount(selectedOrder.amount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Status:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
                          {selectedOrder.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">User Information</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Username:</span>
                        <span className="text-white">{selectedOrder.username}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Email:</span>
                        <span className="text-white">{selectedOrder.email}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Challenge Details */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Challenge Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CurrencyDollarIcon className="w-5 h-5 text-slate-600" />
                      <span className="text-white font-medium">Challenge Type</span>
                    </div>
                    <p className="text-gray-300">{selectedOrder.challenge_type}</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CreditCardIcon className="w-5 h-5 text-blue-400" />
                      <span className="text-white font-medium">Account Size</span>
                    </div>
                    <p className="text-gray-300">${selectedOrder.account_size}</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <ClipboardDocumentListIcon className="w-5 h-5 text-slate-500" />
                      <span className="text-white font-medium">Platform</span>
                    </div>
                    <p className="text-gray-300">{selectedOrder.platform}</p>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Payment Information</h3>
                <div className="bg-gray-800/50 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Payment Method:</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPaymentMethodColor(selectedOrder.payment_method)}`}>
                      {selectedOrder.payment_method}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Transaction ID:</span>
                    <span className="text-white font-mono text-sm">{selectedOrder.txid}</span>
                  </div>
                  {selectedOrder.payment_method === "CARD" && selectedOrder.checkout_session_url && (
                    <div className="pt-2">
                      <a 
                        href={selectedOrder.checkout_session_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
                        className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
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
                        className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
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
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-white">Live Account Credentials</h3>
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
                      className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-md hover:shadow-lg"
                      title="Copy Live Account Credentials"
                    >
                      <ClipboardIcon className="w-4 h-4" />
                      Copy Credentials
                    </button>
                  </div>
                  <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4 space-y-3">
                    {selectedOrder.live_account.server && (
                      <div className="flex justify-between items-center gap-3">
                        <span className="text-gray-400">Server:</span>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-mono text-sm">{selectedOrder.live_account.server}</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(selectedOrder.live_account!.server || '', 'Live Server')}
                            className="p-1.5 text-gray-400 hover:text-purple-400 hover:bg-purple-500/10 rounded transition-colors flex-shrink-0"
                            title="Copy Server"
                          >
                            <ClipboardIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                    {selectedOrder.live_account.platform_login && (
                      <div className="flex justify-between items-center gap-3">
                        <span className="text-gray-400">Platform Login:</span>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-mono text-sm">{selectedOrder.live_account.platform_login}</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(selectedOrder.live_account!.platform_login || '', 'Live Platform Login')}
                            className="p-1.5 text-gray-400 hover:text-purple-400 hover:bg-purple-500/10 rounded transition-colors flex-shrink-0"
                            title="Copy Platform Login"
                          >
                            <ClipboardIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                    {selectedOrder.live_account.platform_password && (
                      <div className="flex justify-between items-center gap-3">
                        <span className="text-gray-400">Platform Password:</span>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-mono text-sm">{selectedOrder.live_account.platform_password}</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(selectedOrder.live_account!.platform_password || '', 'Live Platform Password')}
                            className="p-1.5 text-gray-400 hover:text-purple-400 hover:bg-purple-500/10 rounded transition-colors flex-shrink-0"
                            title="Copy Platform Password"
                          >
                            <ClipboardIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                    {selectedOrder.live_account.profit_share !== undefined && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Profit Share:</span>
                        <span className="text-white font-semibold">{selectedOrder.live_account.profit_share}%</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Stage 2 Account Credentials */}
              {selectedOrder.stage2_account && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-white">Stage 2 Account Credentials</h3>
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
                      className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg"
                      title="Copy Stage 2 Account Credentials"
                    >
                      <ClipboardIcon className="w-4 h-4" />
                      Copy Credentials
                    </button>
                  </div>
                  <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-4 space-y-3">
                    {selectedOrder.stage2_account.server && (
                      <div className="flex justify-between items-center gap-3">
                        <span className="text-gray-400">Server:</span>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-mono text-sm">{selectedOrder.stage2_account.server}</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(selectedOrder.stage2_account!.server || '', 'Stage 2 Server')}
                            className="p-1.5 text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded transition-colors flex-shrink-0"
                            title="Copy Server"
                          >
                            <ClipboardIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                    {selectedOrder.stage2_account.platform_login && (
                      <div className="flex justify-between items-center gap-3">
                        <span className="text-gray-400">Platform Login:</span>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-mono text-sm">{selectedOrder.stage2_account.platform_login}</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(selectedOrder.stage2_account!.platform_login || '', 'Stage 2 Platform Login')}
                            className="p-1.5 text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded transition-colors flex-shrink-0"
                            title="Copy Platform Login"
                          >
                            <ClipboardIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                    {selectedOrder.stage2_account.platform_password && (
                      <div className="flex justify-between items-center gap-3">
                        <span className="text-gray-400">Platform Password:</span>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-mono text-sm">{selectedOrder.stage2_account.platform_password}</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(selectedOrder.stage2_account!.platform_password || '', 'Stage 2 Platform Password')}
                            className="p-1.5 text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded transition-colors flex-shrink-0"
                            title="Copy Platform Password"
                          >
                            <ClipboardIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                    {selectedOrder.stage2_account.profit_target !== undefined && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Profit Target:</span>
                        <span className="text-white font-semibold">${selectedOrder.stage2_account.profit_target.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Account Credentials Section (Completed/Active/Demo Account) */}
              {(selectedOrder.completed || selectedOrder.server || selectedOrder.platform_login) && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-white">Account Credentials</h3>
                    <button
                      type="button"
                      onClick={() => copyAccountCredentials(selectedOrder)}
                      className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
                      title="Copy Account Credentials"
                    >
                      <ClipboardIcon className="w-4 h-4" />
                      Copy Credentials
                    </button>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-4 space-y-3">
                    {selectedOrder.server && (
                      <div className="flex justify-between items-center gap-3">
                        <span className="text-gray-400">Server:</span>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-mono text-sm">{selectedOrder.server}</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(selectedOrder.server || '', 'Server')}
                            className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded transition-colors flex-shrink-0"
                            title="Copy Server"
                          >
                            <ClipboardIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                    {selectedOrder.platform_login && (
                      <div className="flex justify-between items-center gap-3">
                        <span className="text-gray-400">Platform Login:</span>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-mono text-sm">{selectedOrder.platform_login}</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(selectedOrder.platform_login || '', 'Platform Login')}
                            className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded transition-colors flex-shrink-0"
                            title="Copy Platform Login"
                          >
                            <ClipboardIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                    {selectedOrder.platform_password && (
                      <div className="flex justify-between items-center gap-3">
                        <span className="text-gray-400">Platform Password:</span>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-mono text-sm">{selectedOrder.platform_password}</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(selectedOrder.platform_password || '', 'Platform Password')}
                            className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded transition-colors flex-shrink-0"
                            title="Copy Platform Password"
                          >
                            <ClipboardIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                    {selectedOrder.profit_target !== null && selectedOrder.profit_target !== undefined && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Profit Target:</span>
                        <span className="text-white font-semibold">${selectedOrder.profit_target.toLocaleString()}</span>
                      </div>
                    )}
                    {selectedOrder.complete_order_id && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Complete Order ID:</span>
                        <span className="text-white font-mono text-sm">{selectedOrder.complete_order_id}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Order Status Flags */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Order Status</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  <div className={`p-3 rounded-lg ${selectedOrder.is_active ? 'bg-slate-500/20 text-slate-700' : 'bg-gray-500/20 text-gray-400'}`}>
                    <div className="text-sm font-medium">Active</div>
                    <div className="text-xs">{selectedOrder.is_active ? 'Yes' : 'No'}</div>
                  </div>
                  <div className={`p-3 rounded-lg ${selectedOrder.completed ? 'bg-slate-500/20 text-slate-700' : 'bg-gray-500/20 text-gray-400'}`}>
                    <div className="text-sm font-medium">Completed</div>
                    <div className="text-xs">{selectedOrder.completed ? 'Yes' : 'No'}</div>
                  </div>
                  <div className={`p-3 rounded-lg ${selectedOrder.passed ? 'bg-slate-500/20 text-slate-700' : 'bg-gray-500/20 text-gray-400'}`}>
                    <div className="text-sm font-medium">Passed</div>
                    <div className="text-xs">{selectedOrder.passed ? 'Yes' : 'No'}</div>
                  </div>
                  <div className={`p-3 rounded-lg ${selectedOrder.is_stage2 ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-500/20 text-gray-400'}`}>
                    <div className="text-sm font-medium">Stage 2</div>
                    <div className="text-xs">{selectedOrder.is_stage2 ? 'Yes' : 'No'}</div>
                  </div>
                  <div className={`p-3 rounded-lg ${selectedOrder.is_live ? 'bg-slate-500/20 text-slate-700' : 'bg-gray-500/20 text-gray-400'}`}>
                    <div className="text-sm font-medium">Live</div>
                    <div className="text-xs">{selectedOrder.is_live ? 'Yes' : 'No'}</div>
                  </div>
                  <div className={`p-3 rounded-lg ${selectedOrder.failed ? 'bg-red-500/20 text-red-400' : 'bg-gray-500/20 text-gray-400'}`}>
                    <div className="text-sm font-medium">Failed</div>
                    <div className="text-xs">{selectedOrder.failed ? 'Yes' : 'No'}</div>
                  </div>
                </div>
                {selectedOrder.completed_at && (
                  <div className="mt-3 pt-3 border-t border-gray-700">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Completed At:</span>
                      <span className="text-white text-sm">{formatDateKarachi(selectedOrder.completed_at)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Timeline */}
              {selectedOrder.timeline && selectedOrder.timeline.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Order Timeline</h3>
                  <div className="space-y-3">
                    {selectedOrder.timeline.map((event, index) => (
                      <div key={index} className="bg-gray-800/50 rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <CalendarIcon className="w-5 h-5 text-blue-400" />
                          <span className="text-white font-medium capitalize">{event.event_type}</span>
                          <span className="text-gray-400 text-sm">{formatDateKarachi(event.event_date)}</span>
                        </div>
                        <p className="text-gray-300 text-sm">{event.notes}</p>
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

      {/* Edit Order Modal */}
      <Dialog open={!!editingOrder} onOpenChange={() => setEditingOrder(null)}>
        <DialogContent className="bg-gray-900 text-white border border-gray-700 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">
              Edit Order - {editingOrder?.order_id}
            </DialogTitle>
          </DialogHeader>
          
          {editingOrder && (
            <div className="space-y-6">
              {isLoadingOrderDetails && (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
                  <span className="ml-3 text-gray-400">Loading order details...</span>
                </div>
              )}
              {!isLoadingOrderDetails && (
              <>
              {/* Status Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500"
                >
                  <option value="">Select Status</option>
                  {getStatusOptions().map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Conditional Fields based on Status */}
              {(editForm.status === 'deliver' || editForm.status === 'deliver_with_container' || editForm.status === 'edit_delivered_order') && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Server
                      </label>
                      <input
                        type="text"
                        value={editForm.server}
                        onChange={(e) => setEditForm({...editForm, server: e.target.value})}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500"
                        placeholder="Enter server"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Platform Login
                      </label>
                      <input
                        type="text"
                        value={editForm.login}
                        onChange={(e) => setEditForm({...editForm, login: e.target.value})}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500"
                        placeholder="Enter platform login"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Platform Password
                      </label>
                      <input
                        type="password"
                        value={editForm.password}
                        onChange={(e) => setEditForm({...editForm, password: e.target.value})}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500"
                        placeholder="Enter platform password"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Profit Target
                      </label>
                      <input
                        type="text"
                        value={editForm.profitTarget}
                        onChange={(e) => setEditForm({...editForm, profitTarget: e.target.value})}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500"
                        placeholder="Enter profit target"
                      />
                    </div>
                  </div>
                </div>
              )}

              {(editForm.status === 'stage2' || editForm.status === 'live') && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Server
                      </label>
                      <input
                        type="text"
                        value={editForm.server}
                        onChange={(e) => setEditForm({...editForm, server: e.target.value})}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500"
                        placeholder="Enter server"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Platform Login
                      </label>
                      <input
                        type="text"
                        value={editForm.login}
                        onChange={(e) => setEditForm({...editForm, login: e.target.value})}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500"
                        placeholder="Enter platform login"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Platform Password
                      </label>
                      <input
                        type="password"
                        value={editForm.password}
                        onChange={(e) => setEditForm({...editForm, password: e.target.value})}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500"
                        placeholder="Enter platform password"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Session ID
                      </label>
                      <input
                        type="text"
                        value={editForm.sessionId}
                        onChange={(e) => setEditForm({...editForm, sessionId: e.target.value})}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500"
                        placeholder="Enter session ID"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Terminal ID
                      </label>
                      <input
                        type="text"
                        value={editForm.terminalId}
                        onChange={(e) => setEditForm({...editForm, terminalId: e.target.value})}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500"
                        placeholder="Enter terminal ID"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Profit Target
                      </label>
                      <input
                        type="text"
                        value={editForm.profitTarget}
                        onChange={(e) => setEditForm({...editForm, profitTarget: e.target.value})}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500"
                        placeholder="Enter profit target"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Account Type
                    </label>
                    <select
                      value={editForm.accountType}
                      onChange={(e) => setEditForm({...editForm, accountType: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500"
                    >
                      <option value="">Select Account Type</option>
                      <option value="stage2">Stage 2</option>
                      <option value="live">Live</option>
                    </select>
                  </div>
                </div>
              )}

              {editForm.status === 'pass' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Profit Amount
                  </label>
                  <input
                    type="text"
                    value={editForm.profitAmount}
                    onChange={(e) => setEditForm({...editForm, profitAmount: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500"
                    placeholder="Enter profit amount"
                  />
                </div>
              )}

              {editForm.status === 'fail' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Reason
                    </label>
                    <select
                      value={editForm.reason}
                      onChange={(e) => setEditForm({...editForm, reason: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500"
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
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Date
                    </label>
                    <input
                      type="date"
                      value={editForm.date}
                      onChange={(e) => setEditForm({...editForm, date: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
                <button
                  onClick={() => setEditingOrder(null)}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  disabled={isLoadingOrderDetails}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={isSaving || isLoadingOrderDetails}
                  className={`px-4 py-2 bg-red-600 text-white rounded-lg transition-colors ${isSaving || isLoadingOrderDetails ? 'opacity-70 cursor-not-allowed' : 'hover:bg-red-700'}`}
                >
                  {isSaving ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="h-4 w-4 border-2 border-white/60 border-t-transparent rounded-full animate-spin"></span>
                      Saving...
                    </span>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
              </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Login as User Modal */}
      <AdminLoginAsUserModal
        isOpen={showLoginAsUserModal}
        onClose={() => {
          setShowLoginAsUserModal(false)
          setLoginAsUserEmail("")
        }}
        prefilledEmail={loginAsUserEmail}
      />
    </AdminLayout>
  )
}
