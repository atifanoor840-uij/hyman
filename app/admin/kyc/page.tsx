"use client"
import { useEffect, useState } from "react"
import { getApiBaseUrl } from "@/lib/api"
import AdminLayout from "@/components/admin-layout"
import SectionCard from "@/components/ui/section-card"
import { 
  ShieldCheckIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  CheckIcon,
  XMarkIcon,
  DocumentTextIcon
} from "@heroicons/react/24/outline"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { formatDateKarachi } from '@/lib/utils'

interface KycDocument {
  id: number
  document_type: string
  document_url: string
  status: string
  submitted_at: string
}

interface KycSubmission {
  submission_id: number
  user_id: number
  username: string
  email: string
  first_name: string
  last_name: string
  address: string
  country: string
  status: "pending" | "approved" | "rejected"
  submitted_at: string
  reviewed_at: string | null
  rejection_reason: string | null
  notes: string | null
  documents: KycDocument[]
}

interface KycResponse {
  total_count: number
  submissions: KycSubmission[]
}

export default function AdminKycPage() {
  const [kycSubmissions, setKycSubmissions] = useState<KycSubmission[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedSubmission, setSelectedSubmission] = useState<KycSubmission | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [approvingSubmission, setApprovingSubmission] = useState<KycSubmission | null>(null)
  const [rejectingSubmission, setRejectingSubmission] = useState<KycSubmission | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const loadKycApplications = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const token = typeof window !== "undefined" ? localStorage.getItem("admin_access_token") : null
        if (!token) {
          setError("Admin access token not found. Please login again.")
          return
        }
        
        const response = await fetch(`${getApiBaseUrl()}/kyc/admin/all`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          }
        })

        if (!response.ok) {
          if (response.status === 401) {
            setError("Unauthorized. Please login again.")
          } else if (response.status === 403) {
            setError("Access forbidden. Insufficient permissions.")
          } else {
            setError(`Failed to load KYC submissions: ${response.status} ${response.statusText}`)
          }
          return
        }

        const data: KycResponse = await response.json()
        setKycSubmissions(data.submissions || [])
      } catch (error: any) {
        console.error("Failed to load KYC applications:", error)
        setError(`Network error: ${error.message}`)
      } finally {
        setIsLoading(false)
      }
    }
    loadKycApplications()
  }, [])

  const filteredApplications = kycSubmissions.filter(submission => {
    const fullName = `${submission.first_name} ${submission.last_name}`.toLowerCase()
    const matchesSearch = 
      submission.submission_id.toString().includes(searchTerm.toLowerCase()) ||
      submission.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fullName.includes(searchTerm.toLowerCase()) ||
      submission.country.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || submission.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-500/20 text-yellow-400"
      case "approved": return "bg-slate-500/20 text-slate-700"
      case "rejected": return "bg-red-500/20 text-red-400"
      default: return "bg-gray-500/20 text-gray-400"
    }
  }

  const pendingCount = kycSubmissions.filter(app => app.status === "pending").length
  const approvedCount = kycSubmissions.filter(app => app.status === "approved").length
  const rejectedCount = kycSubmissions.filter(app => app.status === "rejected").length

  const handleApprove = async (submissionId: number) => {
    try {
      setIsProcessing(true)
      setError(null)
      const token = typeof window !== "undefined" ? localStorage.getItem("admin_access_token") : null
      if (!token) {
        setError("Admin access token not found. Please login again.")
        toast({
          title: "Authorization required",
          description: "Please log in to continue.",
          variant: "destructive"
        })
        return
      }

      const response = await fetch(`${getApiBaseUrl()}/kyc/admin/approve/${submissionId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      })

      if (!response.ok) {
        if (response.status === 401) {
          setError("Unauthorized. Please login again.")
          toast({
            title: "Unauthorized",
            description: "Please login again.",
            variant: "destructive"
          })
        } else if (response.status === 403) {
          setError("Access forbidden. Insufficient permissions.")
          toast({
            title: "Access forbidden",
            description: "You don't have permission to perform this action.",
            variant: "destructive"
          })
        } else {
          const errorData = await response.json().catch(() => ({}))
          setError(`Failed to approve KYC: ${errorData.message || response.statusText}`)
          toast({
            title: "Approval failed",
            description: errorData.message || "Could not approve KYC submission.",
            variant: "destructive"
          })
        }
        return
      }

      // Update the submission status in the local state
      setKycSubmissions(prev => prev.map(sub => 
        sub.submission_id === submissionId 
          ? { ...sub, status: "approved" as const, reviewed_at: new Date().toISOString() }
          : sub
      ))

      toast({
        title: "KYC Approved",
        description: "KYC submission has been approved successfully.",
      })

      // Close modals
      setApprovingSubmission(null)
      if (selectedSubmission?.submission_id === submissionId) {
        setSelectedSubmission(null)
      }
    } catch (error: any) {
      console.error("Failed to approve KYC:", error)
      setError(`Network error: ${error.message}`)
      toast({
        title: "Network error",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReject = async (submissionId: number) => {
    if (!rejectionReason || !rejectionReason.trim()) {
      toast({
        title: "Rejection reason required",
        description: "Please provide a reason for rejection.",
        variant: "destructive"
      })
      return
    }

    try {
      setIsProcessing(true)
      setError(null)
      const token = typeof window !== "undefined" ? localStorage.getItem("admin_access_token") : null
      if (!token) {
        setError("Admin access token not found. Please login again.")
        toast({
          title: "Authorization required",
          description: "Please log in to continue.",
          variant: "destructive"
        })
        return
      }

      const formData = new FormData()
      formData.append("submission_id", submissionId.toString())
      formData.append("rejection_reason", rejectionReason.trim())

      const response = await fetch(`${getApiBaseUrl()}/kyc/admin/reject/${submissionId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: formData
      })

      if (!response.ok) {
        if (response.status === 401) {
          setError("Unauthorized. Please login again.")
          toast({
            title: "Unauthorized",
            description: "Please login again.",
            variant: "destructive"
          })
        } else if (response.status === 403) {
          setError("Access forbidden. Insufficient permissions.")
          toast({
            title: "Access forbidden",
            description: "You don't have permission to perform this action.",
            variant: "destructive"
          })
        } else {
          const errorData = await response.json().catch(() => ({}))
          setError(`Failed to reject KYC: ${errorData.message || response.statusText}`)
          toast({
            title: "Rejection failed",
            description: errorData.message || "Could not reject KYC submission.",
            variant: "destructive"
          })
        }
        return
      }

      // Update the submission status in the local state
      setKycSubmissions(prev => prev.map(sub => 
        sub.submission_id === submissionId 
          ? { ...sub, status: "rejected" as const, reviewed_at: new Date().toISOString(), rejection_reason: rejectionReason.trim() }
          : sub
      ))

      toast({
        title: "KYC Rejected",
        description: "KYC submission has been rejected successfully.",
      })

      // Close modals and reset form
      setRejectingSubmission(null)
      setRejectionReason("")
      if (selectedSubmission?.submission_id === submissionId) {
        setSelectedSubmission(null)
      }
    } catch (error: any) {
      console.error("Failed to reject KYC:", error)
      setError(`Network error: ${error.message}`)
      toast({
        title: "Network error",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleOpenApproveModal = (submission: KycSubmission) => {
    setApprovingSubmission(submission)
  }

  const handleOpenRejectModal = (submission: KycSubmission) => {
    setRejectingSubmission(submission)
    setRejectionReason("")
  }

  return (
    <AdminLayout
        title="KYC Management"
        subtitle="Review and manage user identity verification applications"
    >
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <SectionCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Pending Review</p>
              <p className="text-2xl font-bold text-white">{pendingCount}</p>
            </div>
            <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
              <ShieldCheckIcon className="w-6 h-6 text-yellow-400" />
            </div>
          </div>
        </SectionCard>
        <SectionCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Approved</p>
              <p className="text-2xl font-bold text-white">{approvedCount}</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-500/10 border border-slate-300">
              <CheckIcon className="w-6 h-6 text-slate-600" />
            </div>
          </div>
        </SectionCard>
        <SectionCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Rejected</p>
              <p className="text-2xl font-bold text-white">{rejectedCount}</p>
            </div>
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
              <XMarkIcon className="w-6 h-6 text-red-400" />
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
                placeholder="Search KYC applications..."
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
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <button className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white hover:bg-gray-600 transition-colors flex items-center gap-2">
              <FunnelIcon className="w-4 h-4" />
              Filter
            </button>
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

      {/* KYC Applications Table */}
      <SectionCard padded={false}>
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading KYC applications...</p>
          </div>
        ) : filteredApplications.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-700">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-400 uppercase tracking-wider">Submission ID</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-400 uppercase tracking-wider">User</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-400 uppercase tracking-wider">Name</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-400 uppercase tracking-wider">Country</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-400 uppercase tracking-wider">Documents</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-400 uppercase tracking-wider">Submitted</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredApplications.map((submission) => (
                  <tr key={submission.submission_id} className="hover:bg-gray-800/30">
                    <td className="py-4 px-6">
                      <div className="text-white font-medium">#{submission.submission_id}</div>
                      <div className="text-gray-400 text-xs">User ID: {submission.user_id}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <div className="text-white font-medium">{submission.username}</div>
                        <div className="text-gray-400 text-sm">{submission.email}</div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <div className="text-white">{submission.first_name} {submission.last_name}</div>
                        <div className="text-gray-400 text-xs truncate max-w-[200px]" title={submission.address}>
                          {submission.address}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-white">{submission.country}</span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-1">
                        <span className="text-white text-sm">{submission.documents.length} document(s)</span>
                        <div className="flex flex-wrap gap-1">
                          {submission.documents.map((doc) => (
                            <span key={doc.id} className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded text-xs">
                              {doc.document_type}
                            </span>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(submission.status)}`}>
                        {submission.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <div className="text-gray-400 text-sm">{formatDateKarachi(submission.submitted_at)}</div>
                        {submission.reviewed_at && (
                          <div className="text-gray-500 text-xs mt-1">
                            Reviewed: {formatDateKarachi(submission.reviewed_at)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => setSelectedSubmission(submission)}
                          className="p-2 text-gray-400 hover:text-blue-400 transition-colors"
                          title="View Details"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        {submission.status === "pending" && (
                          <>
                            <button 
                              onClick={() => handleOpenApproveModal(submission)}
                              className="p-2 text-gray-400 hover:text-slate-600 hover:bg-white/10 rounded transition-colors" 
                              title="Approve"
                            >
                              <CheckIcon className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleOpenRejectModal(submission)}
                              className="p-2 text-gray-400 hover:text-red-400 hover:bg-white/10 rounded transition-colors" 
                              title="Reject"
                            >
                              <XMarkIcon className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center">
            <ShieldCheckIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400">No KYC applications found</p>
          </div>
        )}
      </SectionCard>

      {/* Submission Details Modal */}
      <Dialog open={!!selectedSubmission} onOpenChange={() => setSelectedSubmission(null)}>
        <DialogContent className="bg-gray-900 text-white border border-gray-700 max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">
              KYC Submission Details - #{selectedSubmission?.submission_id}
            </DialogTitle>
          </DialogHeader>
          
          {selectedSubmission && (
            <div className="space-y-6">
              {/* User Information */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">User Information</h3>
                <div className="bg-gray-800/50 rounded-lg p-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-gray-400 text-sm">Username:</span>
                      <div className="text-white font-medium">{selectedSubmission.username}</div>
                    </div>
                    <div>
                      <span className="text-gray-400 text-sm">Email:</span>
                      <div className="text-white font-medium">{selectedSubmission.email}</div>
                    </div>
                    <div>
                      <span className="text-gray-400 text-sm">First Name:</span>
                      <div className="text-white">{selectedSubmission.first_name}</div>
                    </div>
                    <div>
                      <span className="text-gray-400 text-sm">Last Name:</span>
                      <div className="text-white">{selectedSubmission.last_name}</div>
                    </div>
                    <div>
                      <span className="text-gray-400 text-sm">Country:</span>
                      <div className="text-white">{selectedSubmission.country}</div>
                    </div>
                    <div>
                      <span className="text-gray-400 text-sm">Status:</span>
                      <div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedSubmission.status)}`}>
                          {selectedSubmission.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-400 text-sm">Address:</span>
                    <div className="text-white">{selectedSubmission.address}</div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-gray-400 text-sm">Submitted At:</span>
                      <div className="text-white text-sm">{formatDateKarachi(selectedSubmission.submitted_at)}</div>
                    </div>
                    {selectedSubmission.reviewed_at && (
                      <div>
                        <span className="text-gray-400 text-sm">Reviewed At:</span>
                        <div className="text-white text-sm">{formatDateKarachi(selectedSubmission.reviewed_at)}</div>
                      </div>
                    )}
                  </div>
                  {selectedSubmission.rejection_reason && (
                    <div>
                      <span className="text-gray-400 text-sm">Rejection Reason:</span>
                      <div className="text-red-400">{selectedSubmission.rejection_reason}</div>
                    </div>
                  )}
                  {selectedSubmission.notes && (
                    <div>
                      <span className="text-gray-400 text-sm">Notes:</span>
                      <div className="text-white">{selectedSubmission.notes}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              {selectedSubmission.status === "pending" && (
                <div className="flex gap-3 pt-4 border-t border-gray-700">
                  <button
                    onClick={() => handleOpenApproveModal(selectedSubmission)}
                    className="flex-1 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <CheckIcon className="w-5 h-5" />
                    Approve KYC
                  </button>
                  <button
                    onClick={() => handleOpenRejectModal(selectedSubmission)}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <XMarkIcon className="w-5 h-5" />
                    Reject KYC
                  </button>
                </div>
              )}

              {/* Documents */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Documents ({selectedSubmission.documents.length})</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedSubmission.documents.map((doc) => (
                    <div key={doc.id} className="bg-gray-800/50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <div className="text-white font-medium capitalize">{doc.document_type.replace(/_/g, ' ')}</div>
                          <div className="text-gray-400 text-xs mt-1">
                            <span className={`px-2 py-0.5 rounded text-xs ${getStatusColor(doc.status)}`}>
                              {doc.status}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="mb-3">
                        <img 
                          src={doc.document_url} 
                          alt={doc.document_type}
                          className="w-full h-48 object-cover rounded-lg border border-gray-700"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none'
                            const parent = (e.target as HTMLImageElement).parentElement
                            if (parent) {
                              parent.innerHTML = `<div class="w-full h-48 bg-gray-700 rounded-lg flex items-center justify-center text-gray-400">Image not available</div>`
                            }
                          }}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <a
                          href={doc.document_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm text-center"
                        >
                          View Full Size
                        </a>
                        <div className="text-gray-400 text-xs">
                          {formatDateKarachi(doc.submitted_at)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Approve KYC Modal */}
      <Dialog open={!!approvingSubmission} onOpenChange={() => setApprovingSubmission(null)}>
        <DialogContent className="bg-gray-900 text-white border border-gray-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">
              Approve KYC Submission
            </DialogTitle>
          </DialogHeader>
          
          {approvingSubmission && (
            <div className="space-y-4">
              <div className="bg-gray-800/50 rounded-lg p-4">
                <p className="text-gray-300 mb-2">
                  Are you sure you want to approve this KYC submission?
                </p>
                <div className="text-sm text-gray-400 space-y-1">
                  <div><span className="text-gray-500">Submission ID:</span> #{approvingSubmission.submission_id}</div>
                  <div><span className="text-gray-500">User:</span> {approvingSubmission.username}</div>
                  <div><span className="text-gray-500">Name:</span> {approvingSubmission.first_name} {approvingSubmission.last_name}</div>
                </div>
              </div>
              
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setApprovingSubmission(null)}
                  className="flex-1"
                  disabled={isProcessing}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleApprove(approvingSubmission.submission_id)}
                  className="flex-1 bg-slate-900 hover:bg-slate-800 text-white"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Approving...
                    </>
                  ) : (
                    <>
                      <CheckIcon className="w-4 h-4 mr-2" />
                      Approve
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject KYC Modal */}
      <Dialog open={!!rejectingSubmission} onOpenChange={() => {
        setRejectingSubmission(null)
        setRejectionReason("")
      }}>
        <DialogContent className="bg-gray-900 text-white border border-gray-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">
              Reject KYC Submission
            </DialogTitle>
          </DialogHeader>
          
          {rejectingSubmission && (
            <div className="space-y-4">
              <div className="bg-gray-800/50 rounded-lg p-4">
                <p className="text-gray-300 mb-2">
                  Please provide a reason for rejecting this KYC submission.
                </p>
                <div className="text-sm text-gray-400 space-y-1 mb-3">
                  <div><span className="text-gray-500">Submission ID:</span> #{rejectingSubmission.submission_id}</div>
                  <div><span className="text-gray-500">User:</span> {rejectingSubmission.username}</div>
                  <div><span className="text-gray-500">Name:</span> {rejectingSubmission.first_name} {rejectingSubmission.last_name}</div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Rejection Reason <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Enter the reason for rejection..."
                  rows={4}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500 resize-none"
                />
              </div>
              
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setRejectingSubmission(null)
                    setRejectionReason("")
                  }}
                  className="flex-1"
                  disabled={isProcessing}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleReject(rejectingSubmission.submission_id)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  disabled={isProcessing || !rejectionReason.trim()}
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Rejecting...
                    </>
                  ) : (
                    <>
                      <XMarkIcon className="w-4 h-4 mr-2" />
                      Reject
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}



