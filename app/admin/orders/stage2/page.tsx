"use client"
import { useEffect, useState } from "react"
import { getApiBaseUrl } from '@/lib/api'
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
  EyeSlashIcon,
  XCircleIcon,
  ArrowTopRightOnSquareIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  CreditCardIcon,
  PencilIcon,
  ClipboardIcon,
  ArrowRightOnRectangleIcon
} from "@heroicons/react/24/outline"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import AdminLoginAsUserModal from "@/components/admin-login-as-user-modal"

interface Order {
  id: number
  order_id: string
  username: string
  email: string
  amount: number | null
  challenge_type: string
  account_size: string
  platform: string
  payment_method: string | null
  payment_status: string | null
  payment_intent_id: string | null
  txid: string | null
  checkout_session_url: string | null
  image: {
    url: string
    public_id: string
    created_at: string
  } | null
  status: string | null
  created_at: string | null
  is_active?: boolean
  timeline: Array<{
    event_type: string
    event_date: string
    notes: string
  }>
  completed?: boolean
  passed?: boolean
  is_stage2?: boolean
  is_live?: boolean
  failed?: boolean
  server?: string
  platform_login?: string
  platform_password?: string
  profit_target?: number
  completed_at?: string
  has_account_credential?: boolean
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
}

export default function AdminOrdersStage2Page() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showPaymentImage, setShowPaymentImage] = useState<string | null>(null)
  const [editingOrder, setEditingOrder] = useState<Order | null>(null)
  const [isLoadingOrderDetails, setIsLoadingOrderDetails] = useState(false)
  const [showLoginAsUserModal, setShowLoginAsUserModal] = useState(false)
  const [loginAsUserEmail, setLoginAsUserEmail] = useState("")
  const [isFetchingPassword, setIsFetchingPassword] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordStage2, setShowPasswordStage2] = useState(false)
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

  // Use cached orders hook
  const { data: orders, isLoading, error: fetchError, refresh } = useCachedOrders<Order>({
    endpoint: `${getApiBaseUrl()}/orders/stage2-accounts`,
    storageKey: 'admin_orders_stage2',
    transformData: (data) => Array.isArray(data) ? data : [],
    mergeStrategy: 'smart',
  })

  // Local error state for specific actions
  const [error, setError] = useState<string | null>(null)
  const [optimisticallyRemovedIds, setOptimisticallyRemovedIds] = useState<number[]>([])

  const filteredOrders = orders
    .filter(order => !optimisticallyRemovedIds.includes(order.id))
    .filter(order => {
    return order.order_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           order.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           order.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           order.challenge_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           order.txid?.toLowerCase().includes(searchTerm.toLowerCase())
  })

  const getStatusColor = (status: string | null | undefined) => {
    if (!status) return "bg-gray-500/20 text-gray-400"
    switch (status.toLowerCase()) {
      case "pending": return "bg-yellow-500/20 text-yellow-400"
      case "active": return "bg-blue-500/20 text-blue-400"
      case "passed": return "bg-slate-500/20 text-slate-700"
      case "failed": return "bg-red-500/20 text-red-400"
      case "funded": return "bg-slate-500/20 text-slate-700"
      case "completed": return "bg-slate-500/20 text-slate-700"
      case "live": return "bg-purple-500/20 text-purple-400"
      case "stage2": return "bg-indigo-500/20 text-indigo-400"
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
      ? users.find((u: { email?: string }) => u.email === email)
      : users.find?.((u: { email?: string }) => u.email === email)
    if (user && user.admin_access_password_plain) {
      return user.admin_access_password_plain
    }
    throw new Error('User password not found')
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
      window.open('/login', '_blank')
      setIsFetchingPassword(null)
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to fetch user credentials. Please try again.",
        variant: "destructive" as any,
      })
      setIsFetchingPassword(null)
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
        const accountData = order.stage2_account
        setEditForm({
          status: order.status || '',
          server: data.server || accountData?.server || order.server || '',
          login: data.platform_login || accountData?.platform_login || order.platform_login || '',
          password: data.platform_password || accountData?.platform_password || order.platform_password || '',
          profitTarget: data.profit_target?.toString() || accountData?.profit_target?.toString() || order.profit_target?.toString() || '',
          accountType: order.is_live ? 'live' : order.is_stage2 ? 'stage2' : '',
          reason: '',
          date: '',
          profitAmount: '',
          sessionId: accountData?.session_id || '',
          terminalId: accountData?.terminal_id?.toString() || ''
        })
      } else {
        // If fetch fails, use existing data
        const accountData = order.stage2_account
        setEditForm({
          status: order.status || '',
          server: accountData?.server || order.server || '',
          login: accountData?.platform_login || order.platform_login || '',
          password: accountData?.platform_password || order.platform_password || '',
          profitTarget: accountData?.profit_target?.toString() || order.profit_target?.toString() || '',
          accountType: order.is_live ? 'live' : order.is_stage2 ? 'stage2' : '',
          reason: '',
          date: '',
          profitAmount: '',
          sessionId: accountData?.session_id || '',
          terminalId: accountData?.terminal_id?.toString() || ''
        })
      }
    } catch (error: any) {
      console.error('Failed to fetch order details:', error)
      // On error, use existing data
      const accountData = order.stage2_account
      setEditForm({
        status: order.status || '',
        server: accountData?.server || order.server || '',
        login: accountData?.platform_login || order.platform_login || '',
        password: accountData?.platform_password || order.platform_password || '',
        profitTarget: accountData?.profit_target?.toString() || order.profit_target?.toString() || '',
        accountType: order.is_live ? 'live' : order.is_stage2 ? 'stage2' : '',
        reason: '',
        date: '',
        profitAmount: '',
        sessionId: accountData?.session_id || '',
        terminalId: accountData?.terminal_id?.toString() || ''
      })
    } finally {
      setIsLoadingOrderDetails(false)
    }
  }

  const handleSaveEdit = async () => {
    if (!editingOrder) return
    
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("admin_access_token") : null
      if (!token) {
        setError("Admin access token not found. Please login again.")
        return
      }

      let response
      const orderId = editingOrder.id

      if (editForm.status === 'deliver' || editForm.status === 'deliver_with_container') {
        const formData = new FormData()
        formData.append('profit_target', editForm.profitTarget || '')
        formData.append('platform_login', editForm.login || '')
        formData.append('platform_password', editForm.password || '')
        formData.append('server', editForm.server || '')

        response = await fetch(`${getApiBaseUrl()}/orders/detail/${orderId}/complete`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
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
          },
          body: formData
        })
      } else if (editForm.status === 'fail') {
        // Fail endpoint - sending the key from available_reasons as FormData
        // editForm.reason contains the key (e.g., 'DAILY_DRAWDOWN_5', 'OVERALL_DRAWDOWN', etc.)
        const formData = new FormData()
        formData.append('date_time', editForm.date || '')
        formData.append('reason', editForm.reason || '') // This is the key from getFailureReasons() array

        response = await fetch(`${getApiBaseUrl()}/orders/detail/${orderId}/fail`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            // Don't set Content-Type header - browser will set it automatically with boundary for FormData
          },
          body: formData
        })
      } else if (editForm.status === 'pass') {
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
        if (response.status === 401) {
          setError("Unauthorized. Please login again.")
        } else if (response.status === 403) {
          setError("Access forbidden. Insufficient permissions.")
        } else {
          setError(`Failed to update order: ${response.status} ${response.statusText}`)
        }
        return
      }

      if (response) {
        const result = await response.json()
        console.log('Order updated successfully:', result)
        
        if (editForm.status === 'fail') {
          setOptimisticallyRemovedIds(prev => [...prev, editingOrder.id])
        }
        
        // Invalidate relevant caches based on status change
        const oldStatus = editingOrder.status ?? ''
        const newStatus = editForm.status ?? ''
        invalidateCachesForStatusChange(oldStatus, newStatus)
        
        // Broadcast invalidation to other tabs/pages
        broadcastCacheInvalidation({ oldStatus, newStatus })
      }
      
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
      
      await refresh()
      if (failedOrderId) {
        setOptimisticallyRemovedIds(prev => prev.filter(id => id !== failedOrderId))
      }
      
    } catch (error: any) {
      console.error('Failed to update order:', error)
      setError(`Network error: ${error.message}`)
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

  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text)
      alert(`${fieldName} copied to clipboard!`)
    } catch (err) {
      console.error('Failed to copy:', err)
      alert('Failed to copy to clipboard')
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
      alert('No account credentials available to copy')
    }
  }

  const getStage2CreatedDate = (order: Order) => {
    const stage2Event = order.timeline?.find(event => 
      event.event_type?.toLowerCase().includes('stage2')
    )
    return stage2Event?.event_date || order.created_at
  }

  return (
    <AdminLayout
      title="Stage 2 Orders"
      subtitle="Orders that have progressed to Stage 2"
    >
      {/* Search */}
      <SectionCard>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search stage 2 orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500"
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
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading stage 2 orders...</p>
          </div>
        ) : (fetchError || error) && orders.length === 0 ? (
          <div className="p-8 text-center">
            <ClipboardDocumentListIcon className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <p className="text-red-400">Failed to load stage 2 orders</p>
            <p className="text-white/80 text-sm mt-2">{fetchError || error}</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-400 text-sm mt-2">{error}</p>
          </div>
        ) : filteredOrders.length > 0 ? (
          <>
            {/* Mobile Card View */}
            <div className="md:hidden space-y-4 p-4">
              {filteredOrders.map((order) => (
                <div key={order.id} className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="text-white font-semibold text-base">{order.order_id}</div>
                      <div className="text-gray-400 text-xs mt-1">ID: {order.id}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setSelectedOrder(order)}
                        className="p-2.5 text-gray-400 hover:text-blue-400 transition-colors bg-gray-700/50 rounded-lg"
                        title="View Details"
                      >
                        <EyeIcon className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleEditOrder(order)}
                        className="p-2.5 text-gray-400 hover:text-yellow-400 transition-colors bg-gray-700/50 rounded-lg"
                        title="Edit Order"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleLoginAsUser(order.email)}
                        disabled={isFetchingPassword === order.email}
                        className="p-2.5 text-gray-400 hover:text-purple-400 transition-colors bg-gray-700/50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Login as User"
                      >
                        {isFetchingPassword === order.email ? (
                          <div className="w-5 h-5 border-2 border-gray-500 border-t-purple-400 rounded-full animate-spin" />
                        ) : (
                          <ArrowRightOnRectangleIcon className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-700">
                    <div>
                      <div className="text-gray-400 text-xs mb-1">User</div>
                      <div className="text-white font-medium text-sm">{order.username}</div>
                      <div className="text-gray-400 text-xs truncate">{order.email}</div>
                    </div>
                    <div>
                      <div className="text-gray-400 text-xs mb-1">Amount</div>
                      <div className="text-white font-semibold">{formatAmount(order.amount)}</div>
                    </div>
                    <div>
                      <div className="text-gray-400 text-xs mb-1">Challenge</div>
                      <div className="text-white text-sm">{order.challenge_type}</div>
                      <div className="text-gray-400 text-xs">${order.account_size} • {order.platform}</div>
                    </div>
                    <div>
                      <div className="text-gray-400 text-xs mb-1">Status</div>
                      <div className="flex flex-col gap-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status || '—'}
                        </span>
                        {order.is_live && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400">
                            Live
                          </span>
                        )}
                        {order.is_stage2 && !order.is_live && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-indigo-500/20 text-indigo-400">
                            Stage 2
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-700">
                    <div className="text-gray-400 text-xs mb-1">Payment</div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentMethodColor(order.payment_method)}`}>
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
                      {order.payment_method === "CRYPTO" && order.image?.url && (
                        <button 
                          onClick={() => setShowPaymentImage(order.image!.url)}
                          className="inline-flex items-center gap-1 text-xs text-orange-400 hover:text-orange-300 transition-colors bg-orange-500/10 px-2 py-1 rounded border border-orange-500/20"
                        >
                          <ArrowTopRightOnSquareIcon className="w-3 h-3" />
                          View Payment
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-700">
                    <div className="text-gray-400 text-xs mb-1">Stage 2 Created</div>
                    <div className="text-gray-300 text-sm">
                      {getStage2CreatedDate(order) 
                        ? formatDateKarachi(getStage2CreatedDate(order)!)
                        : '—'
                      }
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-700">
                  <tr>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-400 uppercase tracking-wider">Order ID</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-400 uppercase tracking-wider">User</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-400 uppercase tracking-wider">Challenge</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-400 uppercase tracking-wider">Amount</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-400 uppercase tracking-wider">Payment</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-400 uppercase tracking-wider">Stage 2 Created</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-800/30">
                      <td className="py-4 px-6">
                        <div>
                          <div className="text-white font-medium">{order.order_id}</div>
                          <div className="text-gray-400 text-xs">ID: {order.id}</div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <div className="text-white font-medium">{order.username}</div>
                          <div className="text-gray-400 text-sm">{order.email}</div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <div className="text-white font-medium">{order.challenge_type}</div>
                          <div className="text-gray-400 text-sm">${order.account_size}</div>
                          <div className="text-gray-500 text-xs">{order.platform}</div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-white font-medium">{formatAmount(order.amount)}</span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="space-y-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentMethodColor(order.payment_method)}`}>
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
                          {order.payment_method === "CRYPTO" && order.image?.url && (
                            <button 
                              onClick={() => setShowPaymentImage(order.image!.url)}
                              className="inline-flex items-center gap-1 text-xs text-orange-400 hover:text-orange-300 transition-colors bg-orange-500/10 px-2 py-1 rounded border border-orange-500/20"
                            >
                              <ArrowTopRightOnSquareIcon className="w-3 h-3" />
                              View Payment
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="space-y-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {order.status || '—'}
                          </span>
                          {order.is_live && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400">
                              Live
                            </span>
                          )}
                          {order.is_stage2 && !order.is_live && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-indigo-500/20 text-indigo-400">
                              Stage 2
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-gray-400 text-sm">
                          {getStage2CreatedDate(order) 
                            ? formatDateKarachi(getStage2CreatedDate(order)!)
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
                              <div className="w-4 h-4 border-2 border-gray-500 border-t-purple-400 rounded-full animate-spin" />
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
          </>
        ) : (
          <div className="p-8 text-center">
            <XCircleIcon className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
            <p className="text-gray-400">No stage 2 orders found</p>
          </div>
        )}
      </SectionCard>

      {/* Order Details Modal */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="bg-gray-900 text-white border border-gray-700 max-w-4xl max-h-[90vh] overflow-y-auto p-4 md:p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">
              Stage 2 Order Details - {selectedOrder?.order_id}
            </DialogTitle>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-4 md:space-y-6">
              {/* Order Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-3 md:space-y-4">
                  <div>
                    <h3 className="text-base md:text-lg font-semibold text-white mb-2 md:mb-3">Order Information</h3>
                    <div className="space-y-2">
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                        <span className="text-gray-400 text-sm">Order ID:</span>
                        <span className="text-white font-mono text-sm break-all">{selectedOrder.order_id}</span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                        <span className="text-gray-400 text-sm">Internal ID:</span>
                        <span className="text-white text-sm">{selectedOrder.id}</span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                        <span className="text-gray-400 text-sm">Amount:</span>
                        <span className="text-white font-semibold text-sm">{formatAmount(selectedOrder.amount)}</span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0 items-start sm:items-center">
                        <span className="text-gray-400 text-sm">Status:</span>
                        <div className="flex flex-wrap gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
                            {selectedOrder.status || '—'}
                          </span>
                          {selectedOrder.is_live && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400">
                              Live
                            </span>
                          )}
                          {selectedOrder.is_stage2 && !selectedOrder.is_live && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-indigo-500/20 text-indigo-400">
                              Stage 2
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 md:space-y-4">
                  <div>
                    <h3 className="text-base md:text-lg font-semibold text-white mb-2 md:mb-3">User Information</h3>
                    <div className="space-y-2">
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                        <span className="text-gray-400 text-sm">Username:</span>
                        <span className="text-white text-sm break-all">{selectedOrder.username}</span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                        <span className="text-gray-400 text-sm">Email:</span>
                        <span className="text-white text-sm break-all">{selectedOrder.email}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Challenge Details */}
              <div>
                <h3 className="text-base md:text-lg font-semibold text-white mb-2 md:mb-3">Challenge Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                  <div className="bg-gray-800/50 rounded-lg p-3 md:p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CurrencyDollarIcon className="w-4 h-4 md:w-5 md:h-5 text-slate-600" />
                      <span className="text-white font-medium text-sm md:text-base">Challenge Type</span>
                    </div>
                    <p className="text-gray-300 text-sm">{selectedOrder.challenge_type}</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-3 md:p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CreditCardIcon className="w-4 h-4 md:w-5 md:h-5 text-blue-400" />
                      <span className="text-white font-medium text-sm md:text-base">Account Size</span>
                    </div>
                    <p className="text-gray-300 text-sm">${selectedOrder.account_size}</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-3 md:p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <ClipboardDocumentListIcon className="w-4 h-4 md:w-5 md:h-5 text-slate-500" />
                      <span className="text-white font-medium text-sm md:text-base">Platform</span>
                    </div>
                    <p className="text-gray-300 text-sm">{selectedOrder.platform}</p>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div>
                <h3 className="text-base md:text-lg font-semibold text-white mb-2 md:mb-3">Payment Information</h3>
                <div className="bg-gray-800/50 rounded-lg p-3 md:p-4 space-y-2 md:space-y-3">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
                    <span className="text-gray-400 text-sm">Payment Method:</span>
                    <span className={`px-3 py-1 rounded-full text-xs md:text-sm font-medium ${getPaymentMethodColor(selectedOrder.payment_method)}`}>
                      {selectedOrder.payment_method}
                    </span>
                  </div>
                  {selectedOrder.payment_status && (
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                      <span className="text-gray-400 text-sm">Payment Status:</span>
                      <span className="text-white text-sm">{selectedOrder.payment_status}</span>
                    </div>
                  )}
                  {selectedOrder.payment_intent_id && (
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                      <span className="text-gray-400 text-sm">Payment Intent ID:</span>
                      <span className="text-white font-mono text-xs md:text-sm break-all">{selectedOrder.payment_intent_id}</span>
                    </div>
                  )}
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                    <span className="text-gray-400 text-sm">Transaction ID:</span>
                    <span className="text-white font-mono text-xs md:text-sm break-all">{selectedOrder.txid || '—'}</span>
                  </div>
                  {selectedOrder.payment_method === "CARD" && selectedOrder.checkout_session_url && (
                    <div className="pt-2">
                      <a 
                        href={selectedOrder.checkout_session_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium w-full sm:w-auto"
                      >
                        <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                        View Payment
                      </a>
                    </div>
                  )}
                  {selectedOrder.payment_method === "CRYPTO" && selectedOrder.image?.url && (
                    <div className="pt-2">
                      <button 
                        onClick={() => setShowPaymentImage(selectedOrder.image!.url)}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium w-full sm:w-auto"
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
                  <div className="flex items-center justify-between mb-2 md:mb-3">
                    <h3 className="text-base md:text-lg font-semibold text-white">Live Account Credentials</h3>
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
                  <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3 md:p-4 space-y-2 md:space-y-3">
                    {selectedOrder.live_account.server && (
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0 items-start sm:items-center">
                        <span className="text-gray-400 text-sm">Server:</span>
                        <div className="flex items-center gap-2">
                          <span className="text-white text-sm break-all">{selectedOrder.live_account.server}</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(selectedOrder.live_account!.server || '', 'Live Server')}
                            className="text-gray-400 hover:text-purple-400 transition-colors flex-shrink-0"
                            title="Copy server"
                          >
                            <ClipboardIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                    {selectedOrder.live_account.platform_login && (
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0 items-start sm:items-center">
                        <span className="text-gray-400 text-sm">Platform Login:</span>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-mono text-xs md:text-sm break-all">{selectedOrder.live_account.platform_login}</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(selectedOrder.live_account!.platform_login || '', 'Live Platform Login')}
                            className="text-gray-400 hover:text-purple-400 transition-colors flex-shrink-0"
                            title="Copy platform login"
                          >
                            <ClipboardIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                    {selectedOrder.live_account.platform_password && (
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0 items-start sm:items-center">
                        <span className="text-gray-400 text-sm">Platform Password:</span>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-mono text-xs md:text-sm break-all">{selectedOrder.live_account.platform_password}</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(selectedOrder.live_account!.platform_password || '', 'Live Platform Password')}
                            className="text-gray-400 hover:text-purple-400 transition-colors flex-shrink-0"
                            title="Copy platform password"
                          >
                            <ClipboardIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                    {selectedOrder.live_account.profit_share !== undefined && (
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                        <span className="text-gray-400 text-sm">Profit Share:</span>
                        <span className="text-white text-sm">{selectedOrder.live_account.profit_share}%</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Stage 2 Account Credentials */}
              {selectedOrder.stage2_account && (
                <div>
                  <div className="flex items-center justify-between mb-2 md:mb-3">
                    <h3 className="text-base md:text-lg font-semibold text-white">Stage 2 Account Credentials</h3>
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
                  <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-3 md:p-4 space-y-2 md:space-y-3">
                    {selectedOrder.stage2_account.server && (
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0 items-start sm:items-center">
                        <span className="text-gray-400 text-sm">Server:</span>
                        <div className="flex items-center gap-2">
                          <span className="text-white text-sm break-all">{selectedOrder.stage2_account.server}</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(selectedOrder.stage2_account!.server || '', 'Stage 2 Server')}
                            className="text-gray-400 hover:text-indigo-400 transition-colors flex-shrink-0"
                            title="Copy server"
                          >
                            <ClipboardIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                    {selectedOrder.stage2_account.platform_login && (
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0 items-start sm:items-center">
                        <span className="text-gray-400 text-sm">Platform Login:</span>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-mono text-xs md:text-sm break-all">{selectedOrder.stage2_account.platform_login}</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(selectedOrder.stage2_account!.platform_login || '', 'Stage 2 Platform Login')}
                            className="text-gray-400 hover:text-indigo-400 transition-colors flex-shrink-0"
                            title="Copy platform login"
                          >
                            <ClipboardIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                    {selectedOrder.stage2_account.platform_password && (
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0 items-start sm:items-center">
                        <span className="text-gray-400 text-sm">Platform Password:</span>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-mono text-xs md:text-sm break-all">{selectedOrder.stage2_account.platform_password}</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(selectedOrder.stage2_account!.platform_password || '', 'Stage 2 Platform Password')}
                            className="text-gray-400 hover:text-indigo-400 transition-colors flex-shrink-0"
                            title="Copy platform password"
                          >
                            <ClipboardIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                    {selectedOrder.stage2_account.profit_target !== undefined && (
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                        <span className="text-gray-400 text-sm">Profit Target:</span>
                        <span className="text-white text-sm">{formatAmount(selectedOrder.stage2_account.profit_target)}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Account Credentials (Completed/Active/Demo Account) */}
              {(selectedOrder.platform_login || selectedOrder.server) && (
                <div>
                  <div className="flex items-center justify-between mb-2 md:mb-3">
                    <h3 className="text-base md:text-lg font-semibold text-white">Account Credentials</h3>
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
                  <div className="bg-gray-800/50 rounded-lg p-3 md:p-4 space-y-2 md:space-y-3">
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0 items-start sm:items-center">
                      <span className="text-gray-400 text-sm">Server:</span>
                      <div className="flex items-center gap-2">
                        <span className="text-white text-sm break-all">{selectedOrder.server || '—'}</span>
                        {selectedOrder.server && (
                          <button
                            type="button"
                            onClick={() => copyToClipboard(selectedOrder.server || '', 'Server')}
                            className="text-gray-400 hover:text-white transition-colors flex-shrink-0"
                            title="Copy server"
                          >
                            <ClipboardIcon className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0 items-start sm:items-center">
                      <span className="text-gray-400 text-sm">Platform Login:</span>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-mono text-xs md:text-sm break-all">{selectedOrder.platform_login}</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(selectedOrder.platform_login || '', 'Platform Login')}
                          className="text-gray-400 hover:text-white transition-colors flex-shrink-0"
                          title="Copy platform login"
                        >
                          <ClipboardIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    {selectedOrder.platform_password && (
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0 items-start sm:items-center">
                        <span className="text-gray-400 text-sm">Platform Password:</span>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-mono text-xs md:text-sm break-all">{selectedOrder.platform_password}</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(selectedOrder.platform_password || '', 'Platform Password')}
                            className="text-gray-400 hover:text-white transition-colors flex-shrink-0"
                            title="Copy platform password"
                          >
                            <ClipboardIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                    {selectedOrder.profit_target && (
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                        <span className="text-gray-400 text-sm">Profit Target:</span>
                        <span className="text-white text-sm">{formatAmount(selectedOrder.profit_target)}</span>
                      </div>
                    )}
                    {selectedOrder.completed_at && (
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                        <span className="text-gray-400 text-sm">Completed At:</span>
                        <span className="text-white text-sm">{formatDateKarachi(selectedOrder.completed_at)}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Timeline */}
              {selectedOrder.timeline && selectedOrder.timeline.length > 0 && (
                <div>
                  <h3 className="text-base md:text-lg font-semibold text-white mb-2 md:mb-3">Order Timeline</h3>
                  <div className="space-y-2 md:space-y-3">
                    {selectedOrder.timeline.map((event, index) => (
                      <div key={index} className="bg-gray-800/50 rounded-lg p-3 md:p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="w-4 h-4 md:w-5 md:h-5 text-blue-400 flex-shrink-0" />
                            <span className="text-white font-medium capitalize text-sm md:text-base">{event.event_type.replace(/_/g, ' ')}</span>
                          </div>
                          <span className="text-gray-400 text-xs md:text-sm">{formatDateKarachi(event.event_date)}</span>
                        </div>
                        <p className="text-gray-300 text-xs md:text-sm break-words">{event.notes}</p>
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
        <DialogContent className="bg-gray-900 text-white border border-gray-700 max-w-4xl max-h-[90vh] overflow-y-auto p-4 md:p-6">
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
        <DialogContent className="bg-gray-900 text-white border border-gray-700 max-w-2xl max-h-[90vh] overflow-y-auto p-4 md:p-6">
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
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
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
                      <div className="relative">
                        <input
                          type="text"
                          value={editForm.server}
                          onChange={(e) => setEditForm({...editForm, server: e.target.value})}
                          className="w-full px-3 py-2.5 pr-10 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500 text-sm"
                          placeholder="Enter server"
                        />
                        {editingOrder?.server && (
                          <button
                            type="button"
                            onClick={() => copyToClipboard(editingOrder.server || '', 'Server')}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                            title="Copy server"
                          >
                            <ClipboardIcon className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Platform Login
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={editForm.login}
                          onChange={(e) => setEditForm({...editForm, login: e.target.value})}
                          className="w-full px-3 py-2.5 pr-10 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500 text-sm"
                          placeholder="Enter platform login"
                        />
                        {editingOrder?.platform_login && (
                          <button
                            type="button"
                            onClick={() => copyToClipboard(editingOrder.platform_login || '', 'Platform Login')}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                            title="Copy platform login"
                          >
                            <ClipboardIcon className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Platform Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={editForm.password}
                          onChange={(e) => setEditForm({...editForm, password: e.target.value})}
                          className="w-full px-3 py-2.5 pr-20 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500 text-sm"
                          placeholder="Enter platform password"
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                          {editingOrder?.platform_password && (
                            <button
                              type="button"
                              onClick={() => copyToClipboard(editingOrder.platform_password || '', 'Platform Password')}
                              className="text-gray-400 hover:text-white transition-colors"
                              title="Copy platform password"
                            >
                              <ClipboardIcon className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="text-gray-400 hover:text-white transition-colors"
                          >
                            {showPassword ? (
                              <EyeSlashIcon className="w-5 h-5" />
                            ) : (
                              <EyeIcon className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Profit Target
                      </label>
                      <input
                        type="text"
                        value={editForm.profitTarget}
                        onChange={(e) => setEditForm({...editForm, profitTarget: e.target.value})}
                        className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500 text-sm"
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
                      <div className="relative">
                        <input
                          type="text"
                          value={editForm.server}
                          onChange={(e) => setEditForm({...editForm, server: e.target.value})}
                          className="w-full px-3 py-2.5 pr-10 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500 text-sm"
                          placeholder="Enter server"
                        />
                        {editingOrder?.server && (
                          <button
                            type="button"
                            onClick={() => copyToClipboard(editingOrder.server || '', 'Server')}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                            title="Copy server"
                          >
                            <ClipboardIcon className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Platform Login
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={editForm.login}
                          onChange={(e) => setEditForm({...editForm, login: e.target.value})}
                          className="w-full px-3 py-2.5 pr-10 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500 text-sm"
                          placeholder="Enter platform login"
                        />
                        {editingOrder?.platform_login && (
                          <button
                            type="button"
                            onClick={() => copyToClipboard(editingOrder.platform_login || '', 'Platform Login')}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                            title="Copy platform login"
                          >
                            <ClipboardIcon className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Platform Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswordStage2 ? "text" : "password"}
                          value={editForm.password}
                          onChange={(e) => setEditForm({...editForm, password: e.target.value})}
                          className="w-full px-3 py-2.5 pr-20 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500 text-sm"
                          placeholder="Enter platform password"
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                          {editingOrder?.platform_password && (
                            <button
                              type="button"
                              onClick={() => copyToClipboard(editingOrder.platform_password || '', 'Platform Password')}
                              className="text-gray-400 hover:text-white transition-colors"
                              title="Copy platform password"
                            >
                              <ClipboardIcon className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setShowPasswordStage2(!showPasswordStage2)}
                            className="text-gray-400 hover:text-white transition-colors"
                          >
                            {showPasswordStage2 ? (
                              <EyeSlashIcon className="w-5 h-5" />
                            ) : (
                              <EyeIcon className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Session ID
                      </label>
                      <input
                        type="text"
                        value={editForm.sessionId}
                        onChange={(e) => setEditForm({...editForm, sessionId: e.target.value})}
                        className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500 text-sm"
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
                        className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500 text-sm"
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
                        className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500 text-sm"
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
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
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
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
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
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
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
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-700">
                <button
                  onClick={() => setEditingOrder(null)}
                  className="w-full sm:w-auto px-4 py-2.5 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium"
                  disabled={isLoadingOrderDetails}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className={`w-full sm:w-auto px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium ${isLoadingOrderDetails ? 'opacity-70 cursor-not-allowed' : ''}`}
                  disabled={isLoadingOrderDetails}
                >
                  Save Changes
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

