"use client"
import { useEffect, useState } from "react"
import { getApiBaseUrl, formDataApiRequest } from '@/lib/api'
import { toast } from "@/hooks/use-toast"
import AdminLayout from "@/components/admin-layout"
import SectionCard from "@/components/ui/section-card"
import AdminLoader from "@/components/ui/admin-loader"
import { formatDateKarachi } from '@/lib/utils'
import { useCachedOrders } from '@/hooks/use-cached-orders'
import { getAdminToken } from "@/lib/admin-auth"
import { 
  ClipboardDocumentListIcon,
  MagnifyingGlassIcon,
  DocumentArrowUpIcon,
  DocumentIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon
} from "@heroicons/react/24/outline"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface Order {
  id: number
  order_id: string
  username: string
  email: string
  amount: number | null
  challenge_type: string
  account_size: string
  platform: string
  passed: boolean
  passed_at?: string
  certificate?: {
    url: string
    public_id: string
    created_at: string
  } | null
  timeline: Array<{
    event_type: string
    event_date: string
    notes: string
  }>
}

export default function AdminCertificatesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [uploadingOrderId, setUploadingOrderId] = useState<number | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [showCertificate, setShowCertificate] = useState<string | null>(null)

  // Fetch passed orders
  const { data: orders, isLoading, error: fetchError, refresh } = useCachedOrders<Order>({
    endpoint: `${getApiBaseUrl()}/orders/list/passed`,
    storageKey: 'admin_orders_passed',
    transformData: (data) => Array.isArray(data) ? data : [],
    mergeStrategy: 'smart',
  })

  // Filter orders - show only those without certificates or allow all
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.order_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.challenge_type?.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesSearch
  })

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Check if file is PDF
      if (file.type !== 'application/pdf') {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF file only.",
          variant: "destructive" as any
        })
        return
      }
      
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload a PDF file smaller than 10MB.",
          variant: "destructive" as any
        })
        return
      }
      
      setSelectedFile(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile || !uploadingOrderId) {
      toast({
        title: "Missing information",
        description: "Please select a file and order.",
        variant: "destructive" as any
      })
      return
    }

    try {
      setIsUploading(true)
      const token = getAdminToken()
      
      if (!token) {
        toast({
          title: "Authentication required",
          description: "Please log in again.",
          variant: "destructive" as any
        })
        return
      }

      const formData = new FormData()
      formData.append('certificate', selectedFile)
      formData.append('order_id', uploadingOrderId.toString())

      const response = await fetch(`${getApiBaseUrl()}/orders/upload-certificate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to upload certificate')
      }

      toast({
        title: "Certificate uploaded",
        description: `Certificate has been uploaded successfully for order ${orders.find(o => o.id === uploadingOrderId)?.order_id}.`,
      })

      // Reset state
      setSelectedFile(null)
      setShowUploadDialog(false)
      setUploadingOrderId(null)
      
      // Refresh orders to show updated certificate
      refresh()
    } catch (error: any) {
      console.error('Upload error:', error)
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload certificate. Please try again.",
        variant: "destructive" as any
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleOpenUpload = (order: Order) => {
    setSelectedOrder(order)
    setUploadingOrderId(order.id)
    setSelectedFile(null)
    setShowUploadDialog(true)
  }

  const getPassedDate = (order: Order) => {
    const passedEvent = order.timeline?.find(e => e.event_type === 'passed' || e.notes?.toLowerCase().includes('passed'))
    return passedEvent?.event_date || order.passed_at || order.timeline?.[0]?.event_date
  }

  return (
    <AdminLayout
        title="Certificates"
        subtitle="Manage certificates for passed orders"
      >
        <div className="space-y-6">
          {/* Search Section */}
          <SectionCard>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">
                    Passed Orders - Certificates
                  </h2>
                  <p className="text-sm text-gray-600">
                    Upload certificates (PDF) for orders that have been passed
                  </p>
                </div>
              </div>
              
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Search by Order ID, username, email, or challenge type..."
                  className="w-full pl-10 pr-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                />
              </div>
            </div>
          </SectionCard>

          {/* Orders List */}
          <SectionCard padded={false}>
            {isLoading && orders.length === 0 ? (
              <div className="p-8 text-center">
                <AdminLoader type="orders" message="Loading passed orders..." />
              </div>
            ) : fetchError && orders.length === 0 ? (
              <div className="p-8 text-center">
                <XCircleIcon className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <p className="text-red-400">Failed to load passed orders</p>
                <p className="text-gray-400 text-sm mt-2">{String(fetchError)}</p>
              </div>
            ) : filteredOrders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-gray-200 bg-gray-50">
                    <tr>
                      <th className="text-left py-4 px-6 text-sm font-medium text-gray-900 uppercase tracking-wider">Order ID</th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-gray-900 uppercase tracking-wider">User</th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-gray-900 uppercase tracking-wider">Challenge</th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-gray-900 uppercase tracking-wider">Amount</th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-gray-900 uppercase tracking-wider">Passed Date</th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-gray-900 uppercase tracking-wider">Certificate</th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-gray-900 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredOrders.map((order) => {
                      const passedDate = getPassedDate(order)
                      const hasCertificate = !!order.certificate?.url
                      
                      return (
                        <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                          <td className="py-4 px-6">
                            <span className="text-sm font-medium text-gray-900">{order.order_id}</span>
                          </td>
                          <td className="py-4 px-6">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{order.username}</p>
                              <p className="text-xs text-gray-500">{order.email}</p>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div>
                              <p className="text-sm text-gray-900">{order.challenge_type}</p>
                              <p className="text-xs text-gray-500">{order.account_size} - {order.platform}</p>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span className="text-sm text-gray-900">
                              {order.amount ? `$${order.amount.toFixed(2)}` : 'N/A'}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <span className="text-sm text-gray-600">
                              {passedDate ? formatDateKarachi(passedDate) : 'N/A'}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            {hasCertificate ? (
                              <div className="flex items-center gap-2">
                                <CheckCircleIcon className="w-5 h-5 text-green-600" />
                                <span className="text-sm text-green-600 font-medium">Uploaded</span>
                                <button
                                  onClick={() => setShowCertificate(order.certificate!.url)}
                                  className="ml-2 p-1 text-blue-600 hover:text-blue-800"
                                  title="View certificate"
                                >
                                  <EyeIcon className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <XCircleIcon className="w-5 h-5 text-gray-400" />
                                <span className="text-sm text-gray-500">Not uploaded</span>
                              </div>
                            )}
                          </td>
                          <td className="py-4 px-6">
                            <button
                              onClick={() => handleOpenUpload(order)}
                              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              <DocumentArrowUpIcon className="w-4 h-4" />
                              {hasCertificate ? 'Replace' : 'Upload'}
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center">
                <ClipboardDocumentListIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">No passed orders found</p>
              </div>
            )}
          </SectionCard>
        </div>

        {/* Upload Certificate Dialog */}
        <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                Upload Certificate - {selectedOrder?.order_id}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Select PDF Certificate
                </label>
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleFileSelect}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {selectedFile && (
                  <p className="mt-2 text-sm text-gray-600">
                    Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Maximum file size: 10MB. Only PDF files are accepted.
                </p>
              </div>
              
              <div className="flex items-center gap-3 pt-4">
                <button
                  onClick={handleUpload}
                  disabled={!selectedFile || isUploading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? 'Uploading...' : 'Upload Certificate'}
                </button>
                <button
                  onClick={() => {
                    setShowUploadDialog(false)
                    setSelectedFile(null)
                    setUploadingOrderId(null)
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* View Certificate Dialog */}
        <Dialog open={!!showCertificate} onOpenChange={() => setShowCertificate(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Certificate Preview</DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              {showCertificate && (
                <iframe
                  src={showCertificate}
                  className="w-full h-[70vh] border border-gray-300 rounded-lg"
                  title="Certificate"
                />
              )}
            </div>
          </DialogContent>
        </Dialog>
      </AdminLayout>
  )
}
