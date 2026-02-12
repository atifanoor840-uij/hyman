"use client"
import { useEffect, useState } from "react"
import { getApiBaseUrl, API_ENDPOINTS, authenticatedApiRequest, apiRequest, formDataApiRequest, handleApiSuccess } from '@/lib/api'
import { toast } from "@/hooks/use-toast"
import AdminLayout from "@/components/admin-layout"
import SectionCard from "@/components/ui/section-card"
import { formatDateKarachi } from '@/lib/utils'
import { useCachedOrders } from '@/hooks/use-cached-orders'
import { invalidateCachesForStatusChange, broadcastCacheInvalidation } from '@/lib/order-cache-utils'
import { 
  ClipboardDocumentListIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  CheckIcon,
  XMarkIcon,
  ClockIcon,
  ArrowTopRightOnSquareIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  CreditCardIcon,
  PencilIcon,
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
}

export default function AdminOrdersPendingPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showPaymentImage, setShowPaymentImage] = useState<string | null>(null)
  const [editingOrder, setEditingOrder] = useState<Order | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [showLoginAsUserModal, setShowLoginAsUserModal] = useState(false)
  const [loginAsUserEmail, setLoginAsUserEmail] = useState("")
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

  // Use cached orders hook
  const { data: orders, isLoading, error: fetchError, refresh } = useCachedOrders<Order>({
    endpoint: `${getApiBaseUrl()}/orders/list/awaiting`,
    storageKey: 'admin_orders_pending',
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
    
    try {
      setIsSaving(true)
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
      
      const failedOrderId = editForm.status === 'fail' ? editingOrder.id : null
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

  return (
    <AdminLayout
      title="Pending Orders"
      subtitle="Orders awaiting approval or processing"
    >
      {/* Search */}
      <SectionCard>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search orders by ID, username, email, challenge type, or transaction ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
              />
            </div>
          </div>
          <button className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2">
            <FunnelIcon className="w-4 h-4" />
            Filter
          </button>
        </div>
      </SectionCard>

      {/* Error Message */}
      {error && (
        <SectionCard>
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
            <p className="text-red-400">{error}</p>
          </div>
        </SectionCard>
      )}

      {/* Orders Table */}
      <SectionCard>
        {isLoading && orders.length === 0 ? (
          <AdminLoader type="pending" message="Loading pending orders..." />
        ) : (fetchError || error) && orders.length === 0 ? (
          <div className="p-8 text-center">
            <ClockIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600">Failed to load orders</p>
            <p className="text-white/80 text-sm mt-2">{fetchError || error}</p>
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1200px]">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-3 text-xs font-bold text-gray-300 uppercase tracking-wider whitespace-nowrap">Order ID</th>
                  <th className="text-left py-3 px-3 text-xs font-bold text-gray-300 uppercase tracking-wider whitespace-nowrap">User</th>
                  <th className="text-left py-3 px-3 text-xs font-bold text-gray-300 uppercase tracking-wider whitespace-nowrap">Challenge</th>
                  <th className="text-left py-3 px-3 text-xs font-bold text-gray-300 uppercase tracking-wider whitespace-nowrap">Amount</th>
                  <th className="text-left py-3 px-3 text-xs font-bold text-gray-300 uppercase tracking-wider whitespace-nowrap">Payment</th>
                  <th className="text-left py-3 px-3 text-xs font-bold text-gray-300 uppercase tracking-wider whitespace-nowrap">Status</th>
                  <th className="text-left py-3 px-3 text-xs font-bold text-gray-300 uppercase tracking-wider whitespace-nowrap">Created</th>
                  <th className="text-left py-3 px-3 text-xs font-bold text-gray-300 uppercase tracking-wider whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="border-b-2 border-gray-700 hover:bg-gray-800/50 transition-colors">
                    <td className="py-3 px-3">
                      <div className="space-y-1">
                        <div className="font-mono text-white font-bold text-sm">{order.order_id}</div>
                        <div className="text-gray-400 text-xs">#{order.id}</div>
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
                            <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
                            View
                          </a>
                        )}
                        {order.payment_method === "CRYPTO" && order.image?.url && (
                          <button 
                            onClick={() => setShowPaymentImage(order.image!.url)}
                            className="inline-flex items-center gap-1 text-xs text-orange-400 hover:text-orange-300 transition-colors bg-orange-500/10 px-2 py-1 rounded border border-orange-500/20"
                          >
                            <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
                            View
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap ${getStatusColor(order.status)}`}>
                        {order.status || 'Pending'}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-gray-400 font-semibold text-xs whitespace-nowrap">
                        {order.timeline && order.timeline.length > 0 
                          ? formatDateKarachi(order.timeline[0].event_date)
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
                        <button 
                          onClick={() => {
                            setLoginAsUserEmail(order.email)
                            setShowLoginAsUserModal(true)
                          }}
                          className="p-2 text-gray-400 hover:text-purple-400 transition-colors"
                          title="Login as User"
                        >
                          <ArrowRightOnRectangleIcon className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-slate-600 transition-colors">
                          <CheckIcon className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-red-400 transition-colors">
                          <XMarkIcon className="w-4 h-4" />
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
            <ClockIcon className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-gray-400">No pending orders found</p>
          </div>
        )}
      </SectionCard>

      {/* Order Details Modal */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="bg-gray-900 text-white border border-gray-700 max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">
              Pending Order Details - {selectedOrder?.order_id}
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