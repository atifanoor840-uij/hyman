"use client"
import { useEffect, useState } from "react"
import { getApiBaseUrl } from '@/lib/api'
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
  fail_order?: {
    reason: string
    failed_at: string
  }
  has_account_credential?: boolean
  credential_id?: number
}

export default function AdminOrdersFailedPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showPaymentImage, setShowPaymentImage] = useState<string | null>(null)
  const [editingOrder, setEditingOrder] = useState<Order | null>(null)
  const [isLoadingOrderDetails, setIsLoadingOrderDetails] = useState(false)
  const [showLoginAsUserModal, setShowLoginAsUserModal] = useState(false)
  const [loginAsUserEmail, setLoginAsUserEmail] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordStage2, setShowPasswordStage2] = useState(false)
  const [editingCredentials, setEditingCredentials] = useState(false)
  const [editingCredentialsOrderId, setEditingCredentialsOrderId] = useState<number | null>(null)
  const [credentialForm, setCredentialForm] = useState({
    platform: '',
    server: '',
    login: '',
    password: '',
    accountSize: '',
    profitTarget: ''
  })
  const [showPasswordCredentials, setShowPasswordCredentials] = useState(false)
  const [isSavingCredentials, setIsSavingCredentials] = useState(false)
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
    endpoint: `${getApiBaseUrl()}/orders/list/failed`,
    storageKey: 'admin_orders_failed',
    transformData: (data) => Array.isArray(data) ? data : [],
    mergeStrategy: 'smart',
  })

  // Local error state for specific actions
  const [error, setError] = useState<string | null>(null)

  const filteredOrders = orders.filter(order => {
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
      case "passed": return "bg-green-500/20 text-green-400"
      case "failed": return "bg-red-500/20 text-red-400"
      case "funded": return "bg-[#DEBF74]/20 text-[#DEBF74]"
      case "completed": return "bg-green-500/20 text-green-400"
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
      case "BANK": return "bg-green-500/20 text-green-400"
      default: return "bg-gray-500/20 text-gray-400"
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
          reason: order.fail_order?.reason || '',
          date: order.fail_order?.failed_at ? order.fail_order.failed_at.split('T')[0] : '',
          profitAmount: '',
          sessionId: '',
          terminalId: ''
        })
      } else {
        // If fetch fails, use order data if available
        setEditForm({
          status: order.status || '',
          server: order.server || '',
          login: order.platform_login || '',
          password: order.platform_password || '',
          profitTarget: order.profit_target?.toString() || '',
          accountType: order.challenge_type || '',
          reason: order.fail_order?.reason || '',
          date: order.fail_order?.failed_at ? order.fail_order.failed_at.split('T')[0] : '',
          profitAmount: '',
          sessionId: '',
          terminalId: ''
        })
      }
    } catch (error: any) {
      console.error('Failed to fetch order details:', error)
      // On error, use order data if available
      setEditForm({
        status: order.status || '',
        server: order.server || '',
        login: order.platform_login || '',
        password: order.platform_password || '',
        profitTarget: order.profit_target?.toString() || '',
        accountType: order.challenge_type || '',
        reason: order.fail_order?.reason || '',
        date: order.fail_order?.failed_at ? order.fail_order.failed_at.split('T')[0] : '',
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
    
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("admin_access_token") : null
      if (!token) {
        setError("Admin access token not found. Please login again.")
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

        response = await fetch(`${getApiBaseUrl()}/orders/edit-passed/${orderId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            // Don't set Content-Type header - browser will set it automatically with boundary for FormData
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
        
        // Invalidate relevant caches based on status change
        const oldStatus = editingOrder.status
        const newStatus = editForm.status
        invalidateCachesForStatusChange(oldStatus, newStatus)
        
        // Broadcast invalidation to other tabs/pages
        broadcastCacheInvalidation({ oldStatus, newStatus })
      }
      
      // Close modal and reset form
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
      // You could add a toast notification here if you have toast available
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

  const handleEditCredentials = (order: Order) => {
    setEditingCredentialsOrderId(order.id)
    setEditingCredentials(true)
    setCredentialForm({
      platform: order.platform || '',
      server: order.server || '',
      login: order.platform_login || '',
      password: order.platform_password || '',
      accountSize: order.account_size || '',
      profitTarget: order.profit_target?.toString() || ''
    })
  }

  const handleCancelEditCredentials = () => {
    setEditingCredentials(false)
    setEditingCredentialsOrderId(null)
    setCredentialForm({
      platform: '',
      server: '',
      login: '',
      password: '',
      accountSize: '',
      profitTarget: ''
    })
  }

  const handleSaveCredentials = async () => {
    if (!editingCredentialsOrderId) return
    
    // Find the order to get credential_id
    const order = orders.find(o => o.id === editingCredentialsOrderId)
    if (!order || !order.credential_id) {
      setError("Credential ID not found for this order.")
      return
    }
    
    try {
      setIsSavingCredentials(true)
      const token = typeof window !== "undefined" ? localStorage.getItem("admin_access_token") : null
      if (!token) {
        setError("Admin access token not found. Please login again.")
        return
      }

      const requestBody = {
        platform: credentialForm.platform || '',
        server: credentialForm.server || '',
        platform_login: credentialForm.login || '',
        platform_password: credentialForm.password || '',
        account_size: credentialForm.accountSize || '',
        profit_target: credentialForm.profitTarget ? parseFloat(credentialForm.profitTarget) : 0
      }

      const response = await fetch(`${getApiBaseUrl()}/accounts/credentials/${order.credential_id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        if (response.status === 401) {
          setError("Unauthorized. Please login again.")
        } else if (response.status === 403) {
          setError("Access forbidden. Insufficient permissions.")
        } else {
          const errorText = await response.text()
          setError(`Failed to update credentials: ${response.status} ${response.statusText}`)
        }
        return
      }

      // Close edit mode and refresh orders
      handleCancelEditCredentials()
      await refresh()
    } catch (error: any) {
      console.error('Failed to update credentials:', error)
      setError(`Network error: ${error.message}`)
    } finally {
      setIsSavingCredentials(false)
    }
  }

  return (
    <AdminLayout
      title="Failed Orders"
      subtitle="Orders that failed to complete or were rejected"
    >
      {/* Search */}
      <SectionCard>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search failed orders..."
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
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading failed orders...</p>
          </div>
        ) : (fetchError || error) && orders.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-12 h-12 text-red-500 mx-auto mb-4">⚠️</div>
            <p className="text-red-600">Failed to load orders</p>
            <p className="text-white/80 text-sm mt-2">{fetchError || error}</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-8 text-center">
            <ClipboardDocumentListIcon className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <p className="text-red-400">Failed to load failed orders</p>
            <p className="text-gray-400 text-sm mt-2">{error}</p>
          </div>
        ) : filteredOrders.length > 0 ? (
          <>
            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
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
                        onClick={() => {
                          setLoginAsUserEmail(order.email)
                          setShowLoginAsUserModal(true)
                        }}
                        className="p-2.5 text-gray-400 hover:text-purple-400 transition-colors bg-gray-700/50 rounded-lg"
                        title="Login as User"
                      >
                        <ArrowRightOnRectangleIcon className="w-5 h-5" />
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
                      <div className="text-gray-400 text-xs mb-1">Payment</div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentMethodColor(order.payment_method)}`}>
                        {order.payment_method || '—'}
                      </span>
                    </div>
                  </div>

                  {order.payment_method === "CARD" && order.checkout_session_url && (
                    <a 
                      href={order.checkout_session_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 transition-colors bg-blue-500/10 px-3 py-2 rounded border border-blue-500/20 w-full justify-center"
                    >
                      <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                      View Payment
                    </a>
                  )}
                  {order.payment_method === "CRYPTO" && order.image?.url && (
                    <button 
                      onClick={() => setShowPaymentImage(order.image!.url)}
                      className="inline-flex items-center gap-2 text-xs text-orange-400 hover:text-orange-300 transition-colors bg-orange-500/10 px-3 py-2 rounded border border-orange-500/20 w-full justify-center"
                    >
                      <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                      View Payment
                    </button>
                  )}

                  <div className="pt-2 border-t border-gray-700">
                    <div className="text-gray-400 text-xs mb-1">Failed Date</div>
                    <div className="text-gray-300 text-sm">
                      {order.fail_order?.failed_at
                        ? formatDateKarachi(order.fail_order.failed_at)
                        : order.timeline && order.timeline.length > 0 
                          ? formatDateKarachi(order.timeline.find(event => event.event_type.toLowerCase().includes('fail'))?.event_date || order.timeline[order.timeline.length - 1]?.event_date)
                          : order.created_at 
                            ? formatDateKarachi(order.created_at)
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
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-400 uppercase tracking-wider">Failed Date</th>
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
                      <span className="text-gray-400 text-sm">
                          {order.fail_order?.failed_at
                            ? formatDateKarachi(order.fail_order.failed_at)
                            : order.timeline && order.timeline.length > 0 
                          ? formatDateKarachi(order.timeline.find(event => event.event_type.toLowerCase().includes('fail'))?.event_date || order.timeline[order.timeline.length - 1]?.event_date)
                          : order.created_at 
                            ? formatDateKarachi(order.created_at)
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
            <XCircleIcon className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <p className="text-gray-400">No failed orders found</p>
          </div>
        )}
      </SectionCard>

      {/* Order Details Modal */}
      <Dialog open={!!selectedOrder} onOpenChange={() => {
        setSelectedOrder(null)
        handleCancelEditCredentials()
      }}>
        <DialogContent className="bg-gray-900 text-white border border-gray-700 max-w-4xl max-h-[90vh] overflow-y-auto p-4 md:p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">
              Failed Order Details - {selectedOrder?.order_id}
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
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
                          {selectedOrder.status || 'Failed'}
                        </span>
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
                      <CurrencyDollarIcon className="w-4 h-4 md:w-5 md:h-5 text-[#DEBF74]" />
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
                      <ClipboardDocumentListIcon className="w-4 h-4 md:w-5 md:h-5 text-green-400" />
                      <span className="text-white font-medium text-sm md:text-base">Platform</span>
                    </div>
                    <p className="text-gray-300 text-sm">{selectedOrder.platform}</p>
                  </div>
                </div>
              </div>

              {/* Failure Information */}
              {selectedOrder.fail_order && (
                <div>
                  <h3 className="text-base md:text-lg font-semibold text-white mb-2 md:mb-3">Failure Information</h3>
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 md:p-4 space-y-2 md:space-y-3">
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                      <span className="text-gray-400 text-sm">Failure Reason:</span>
                      <span className="text-red-400 font-medium text-sm sm:text-right sm:max-w-md break-words">{selectedOrder.fail_order.reason}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                      <span className="text-gray-400 text-sm">Failed At:</span>
                      <span className="text-white text-sm">{formatDateKarachi(selectedOrder.fail_order.failed_at)}</span>
                    </div>
                  </div>
                </div>
              )}

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

              {/* Account Credentials */}
              {(selectedOrder.platform_login || selectedOrder.has_account_credential) && (
                <div>
                  <div className="flex items-center justify-between mb-2 md:mb-3">
                    <h3 className="text-base md:text-lg font-semibold text-white">Account Credentials</h3>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => copyAccountCredentials(selectedOrder)}
                        className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
                        title="Copy Account Credentials"
                      >
                        <ClipboardIcon className="w-4 h-4" />
                        Copy Credentials
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEditCredentials(selectedOrder)}
                        className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors shadow-md hover:shadow-lg"
                        title="Edit Credentials"
                      >
                        <PencilIcon className="w-4 h-4" />
                        Edit Credentials
                      </button>
                    </div>
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
                            <span className="text-white font-medium capitalize text-sm md:text-base">{event.event_type}</span>
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
                  className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500 text-sm"
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
                          className="w-full px-3 py-2.5 pr-10 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500 text-sm"
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
                          className="w-full px-3 py-2.5 pr-10 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500 text-sm"
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
                          className="w-full px-3 py-2.5 pr-20 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500 text-sm"
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
                        className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500 text-sm"
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
                          className="w-full px-3 py-2.5 pr-10 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500 text-sm"
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
                          className="w-full px-3 py-2.5 pr-10 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500 text-sm"
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
                          className="w-full px-3 py-2.5 pr-20 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500 text-sm"
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
                        className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500 text-sm"
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
                        className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500 text-sm"
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
                        className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500 text-sm"
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
                      className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500 text-sm"
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
                    className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500 text-sm"
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
                      className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500 text-sm"
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
                      className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500 text-sm"
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
                  className={`w-full sm:w-auto px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium ${isLoadingOrderDetails ? 'opacity-70 cursor-not-allowed' : ''}`}
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

      {/* Edit Credentials Modal */}
      <Dialog open={editingCredentials && editingCredentialsOrderId !== null} onOpenChange={(open) => {
        if (!open) {
          handleCancelEditCredentials()
        }
      }}>
        <DialogContent className="bg-gray-900 text-white border border-gray-700 max-w-2xl max-h-[90vh] overflow-y-auto p-4 md:p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">
              Edit Account Credentials
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Platform
                </label>
                <input
                  type="text"
                  value={credentialForm.platform}
                  onChange={(e) => setCredentialForm({...credentialForm, platform: e.target.value})}
                  className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500 text-sm"
                  placeholder="Enter platform"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Account Size
                </label>
                <input
                  type="text"
                  value={credentialForm.accountSize}
                  onChange={(e) => setCredentialForm({...credentialForm, accountSize: e.target.value})}
                  className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500 text-sm"
                  placeholder="Enter account size"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Server
              </label>
              <input
                type="text"
                value={credentialForm.server}
                onChange={(e) => setCredentialForm({...credentialForm, server: e.target.value})}
                className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500 text-sm"
                placeholder="Enter server"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Platform Login
              </label>
              <input
                type="text"
                value={credentialForm.login}
                onChange={(e) => setCredentialForm({...credentialForm, login: e.target.value})}
                className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500 text-sm"
                placeholder="Enter platform login"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Platform Password
              </label>
              <div className="relative">
                <input
                  type={showPasswordCredentials ? "text" : "password"}
                  value={credentialForm.password}
                  onChange={(e) => setCredentialForm({...credentialForm, password: e.target.value})}
                  className="w-full px-3 py-2.5 pr-10 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500 text-sm"
                  placeholder="Enter platform password"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordCredentials(!showPasswordCredentials)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPasswordCredentials ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Profit Target
              </label>
              <input
                type="text"
                value={credentialForm.profitTarget}
                onChange={(e) => setCredentialForm({...credentialForm, profitTarget: e.target.value})}
                className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500 text-sm"
                placeholder="Enter profit target"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-700">
              <button
                onClick={handleCancelEditCredentials}
                disabled={isSavingCredentials}
                className="w-full sm:w-auto px-4 py-2.5 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCredentials}
                disabled={isSavingCredentials}
                className="w-full sm:w-auto px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSavingCredentials ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
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
