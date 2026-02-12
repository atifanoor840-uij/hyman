"use client"
import { useState, useEffect } from "react"
import { getApiBaseUrl } from "@/lib/api"
import AdminLayout from "@/components/admin-layout"
import SectionCard from "@/components/ui/section-card"
import AdminLoader from "@/components/ui/admin-loader"
import { useAdminCache } from "@/hooks/use-admin-cache"
import { toast } from "@/hooks/use-toast"
import { 
  EnvelopeIcon,
  CheckCircleIcon,
  XCircleIcon,
  MagnifyingGlassIcon,
  UserIcon
} from "@heroicons/react/24/outline"

interface User {
  user_code: string
  email: string
  country: string
  created_at: string
}

interface EmailResult {
  total: number
  sent: number
  failed: number
  sentEmails: string[]
  errors: string[]
}

export default function AdminEmailSenderPage() {
  const [subject, setSubject] = useState("")
  const [content, setContent] = useState("")
  const [isHtml, setIsHtml] = useState(true)
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set())
  const [searchTerm, setSearchTerm] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [sendToAll, setSendToAll] = useState(false)
  const [lastResult, setLastResult] = useState<EmailResult | null>(null)
  const [manualEmails, setManualEmails] = useState("")
  const [sendMode, setSendMode] = useState<'users' | 'manual' | 'both'>('users')
  const [showPreview, setShowPreview] = useState(false)
  const [sentEmails, setSentEmails] = useState<Set<string>>(new Set())
  const [sendingProgress, setSendingProgress] = useState<{
    current: number
    total: number
    batch: number
    totalBatches: number
    currentBatchEmails: string[]
  } | null>(null)

  // Fetch users from backend (T = User so data is User[])
  const { data: usersData, isLoading } = useAdminCache<User>({
    endpoint: `${getApiBaseUrl()}/auth/members`,
    storageKey: 'admin_cache_users',
    transformData: (data) => Array.isArray(data) ? data : [],
  })

  const users = usersData || []

  // Separate users into sent and pending
  const pendingUsers = users.filter(user => user.email && !sentEmails.has(user.email))
  const sentUsersList = users.filter(user => user.email && sentEmails.has(user.email))

  // Filter users based on search (only show pending users in main list)
  const filteredUsers = pendingUsers.filter(user => {
    if (!searchTerm) return true
    const searchLower = searchTerm.toLowerCase()
    return (
      user.email?.toLowerCase().includes(searchLower) ||
      user.user_code?.toLowerCase().includes(searchLower) ||
      user.country?.toLowerCase().includes(searchLower)
    )
  })

  // Get selected users' emails
  const selectedEmails = Array.from(selectedUserIds)
    .map(id => users.find(u => u.email === id)?.email)
    .filter(Boolean) as string[]

  // Parse manually entered emails
  const parseManualEmails = (text: string): string[] => {
    const emailRegex = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi
    const matches = text.match(emailRegex) || []
    return Array.from(new Set(matches.map(e => e.trim().toLowerCase())))
  }

  const manualEmailList = parseManualEmails(manualEmails)

  const handleUserToggle = (email: string) => {
    if (sendToAll) {
      toast({
        title: "Send to all is enabled",
        description: "Disable 'Send to all users' to select specific users.",
        variant: "destructive" as any
      })
      return
    }
    setSelectedUserIds(prev => {
      const newSet = new Set(prev)
      if (newSet.has(email)) {
        newSet.delete(email)
      } else {
        // Check max limit (200 for manual selection)
        if (newSet.size >= 200) {
          toast({
            title: "Maximum limit reached",
            description: "You can select a maximum of 200 users.",
            variant: "destructive" as any
          })
          return prev
        }
        newSet.add(email)
      }
      return newSet
    })
  }

  const handleSelectAll = () => {
    if (sendToAll) return
    const maxSelect = Math.min(200, filteredUsers.length)
    const emails = filteredUsers.slice(0, maxSelect).map(u => u.email).filter(Boolean) as string[]
    setSelectedUserIds(new Set(emails))
    if (filteredUsers.length > 200) {
      toast({
        title: "Selection limited",
        description: `Only first 200 users selected (out of ${filteredUsers.length} filtered users).`,
      })
    }
  }

  const handleSelect50 = () => {
    if (sendToAll) return
    const remainingPending = filteredUsers.filter(u => !selectedUserIds.has(u.email))
    const currentSelected = selectedUserIds.size
    const availableSlots = 200 - currentSelected
    
    if (availableSlots <= 0) {
      toast({
        title: "Maximum limit reached",
        description: "You can select a maximum of 200 users.",
        variant: "destructive" as any
      })
      return
    }
    
    const selectCount = Math.min(50, availableSlots, remainingPending.length)
    const next50 = remainingPending.slice(0, selectCount).map(u => u.email).filter(Boolean) as string[]
    
    if (next50.length > 0) {
      setSelectedUserIds(prev => {
        const newSet = new Set(prev)
        next50.forEach(email => newSet.add(email))
        return newSet
      })
      toast({
        title: "Users selected",
        description: `Selected ${next50.length} users from pending list.`,
      })
    } else {
      toast({
        title: "No more users",
        description: "All pending users have been selected.",
      })
    }
  }

  const handleSelectNextBatch = () => {
    const remainingPending = filteredUsers.filter(u => !selectedUserIds.has(u.email))
    const nextBatch = remainingPending.slice(0, 200).map(u => u.email).filter(Boolean) as string[]
    if (nextBatch.length > 0) {
      setSelectedUserIds(new Set(nextBatch))
      toast({
        title: "Next batch selected",
        description: `Selected next ${nextBatch.length} users from pending list.`,
      })
    } else {
      toast({
        title: "No more users",
        description: "All pending users have been selected.",
      })
    }
  }

  const handleSendToAllToggle = (checked: boolean) => {
    setSendToAll(checked)
    if (checked) {
      setSelectedUserIds(new Set())
    }
  }

  const handleDeselectAll = () => {
    setSelectedUserIds(new Set())
  }

  const validate = () => {
    if (!subject.trim()) {
      toast({ 
        title: "Subject required", 
        description: "Please enter an email subject.", 
        variant: "destructive" as any 
      })
      return false
    }
    if (!content.trim()) {
      toast({ 
        title: "Email content required", 
        description: "Please enter the email content.", 
        variant: "destructive" as any 
      })
      return false
    }
    // Validate based on send mode
    if (sendMode === 'users' || sendMode === 'both') {
      if (!sendToAll && selectedEmails.length === 0) {
        toast({ 
          title: "No recipients selected", 
          description: "Please select at least one user, enter manual emails, or enable 'Send to all users'.", 
          variant: "destructive" as any 
        })
        return false
      }
    }
    
    if (sendMode === 'manual' || sendMode === 'both') {
      if (manualEmailList.length === 0) {
        toast({ 
          title: "No manual emails entered", 
          description: "Please enter at least one valid email address.", 
          variant: "destructive" as any 
        })
        return false
      }
    }

    return true
  }

  const handleSend = async () => {
    if (!validate()) return

    try {
      setIsSending(true)
      const token = typeof window !== "undefined" ? localStorage.getItem("admin_access_token") : null
      if (!token) {
        toast({ 
          title: "Admin login required", 
          description: "Please sign in as admin.", 
          variant: "destructive" as any 
        })
        return
      }

      // Get emails to send based on mode
      let emailsToSend: string[] = []
      
      if (sendMode === 'users' || sendMode === 'both') {
        if (sendToAll) {
          // Only send to pending users when sending to all
          emailsToSend = [...emailsToSend, ...pendingUsers.map(u => u.email).filter(Boolean) as string[]]
        } else {
          emailsToSend = [...emailsToSend, ...selectedEmails]
        }
      }
      
      if (sendMode === 'manual' || sendMode === 'both') {
        emailsToSend = [...emailsToSend, ...manualEmailList]
      }

      // Remove duplicates
      emailsToSend = Array.from(new Set(emailsToSend))

      // If more than 200 emails, process in batches
      const BATCH_SIZE = 200
      const totalEmails = emailsToSend.length
      const totalBatches = Math.ceil(totalEmails / BATCH_SIZE)

      if (totalEmails > BATCH_SIZE) {
        // Process in batches
        let allSentEmails: string[] = []
        let allErrors: string[] = []
        let totalSent = 0
        let totalFailed = 0

        for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
          const batchStart = batchIndex * BATCH_SIZE
          const batchEnd = Math.min(batchStart + BATCH_SIZE, totalEmails)
          const batchEmails = emailsToSend.slice(batchStart, batchEnd)

          // Update progress
          setSendingProgress({
            current: batchIndex + 1,
            total: totalBatches,
            batch: batchIndex + 1,
            totalBatches,
            currentBatchEmails: batchEmails,
          })

          const response = await fetch(`${getApiBaseUrl()}/admin/send-email`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: JSON.stringify({
              subject: subject.trim(),
              content: content.trim(),
              emails: batchEmails,
              isHtml,
              sendToAll: false,
            }),
          })

          const data = await response.json().catch(() => ({}))

          if (response.ok && data.success) {
            totalSent += data.results?.sent || 0
            totalFailed += data.results?.failed || 0
            allSentEmails = [...allSentEmails, ...(data.results?.sentEmails || [])]
            allErrors = [...allErrors, ...(data.results?.errors || [])]
          } else {
            totalFailed += batchEmails.length
            allErrors = [...allErrors, ...batchEmails.map(e => `${e}: ${data?.error || 'Failed to send'}`)]
          }

          // Small delay between batches
          if (batchIndex < totalBatches - 1) {
            await new Promise(resolve => setTimeout(resolve, 2000))
          }
        }

        // Update sent emails set
        setSentEmails(prev => {
          const newSet = new Set(prev)
          allSentEmails.forEach(email => newSet.add(email))
          return newSet
        })

        // Store combined results
        const result: EmailResult = {
          total: totalEmails,
          sent: totalSent,
          failed: totalFailed,
          sentEmails: allSentEmails,
          errors: allErrors,
        }
        setLastResult(result)
        setSendingProgress(null)

        // Auto-select next batch if there are more pending users
        const remainingPending = pendingUsers.filter(u => !allSentEmails.includes(u.email))
        if (remainingPending.length > 0) {
          const nextBatch = remainingPending.slice(0, BATCH_SIZE).map(u => u.email).filter(Boolean) as string[]
          setSelectedUserIds(new Set(nextBatch))
          toast({
            title: "Batch sending complete",
            description: `Sent ${totalSent}/${totalEmails} emails. Next batch of ${nextBatch.length} users selected.`,
          })
        } else {
          toast({
            title: "All emails sent",
            description: `Successfully sent ${totalSent}/${totalEmails} emails.`,
          })
        }
      } else {
        // Single batch (200 or fewer)
        const response = await fetch(`${getApiBaseUrl()}/admin/send-email`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            subject: subject.trim(),
            content: content.trim(),
            emails: emailsToSend,
            isHtml,
            sendToAll,
          }),
        })

        const data = await response.json().catch(() => ({}))

        if (!response.ok) {
          const message = data?.error || data?.message || `Failed with ${response.status}`
          toast({ 
            title: "Send failed", 
            description: String(message), 
            variant: "destructive" as any 
          })
          return
        }

        // Store results
        const result: EmailResult = {
          total: data.results?.total || emailsToSend.length,
          sent: data.results?.sent || 0,
          failed: data.results?.failed || 0,
          sentEmails: data.results?.sentEmails || [],
          errors: data.results?.errors || [],
        }
        setLastResult(result)

        // Update sent emails set
        setSentEmails(prev => {
          const newSet = new Set(prev)
          result.sentEmails.forEach(email => newSet.add(email))
          return newSet
        })

        toast({ 
          title: "Emails sent successfully", 
          description: data.message || `Sent to ${result.sent}/${result.total} recipients.` 
        })

        // Auto-select next batch if there are more pending users
        const remainingPending = pendingUsers.filter(u => !result.sentEmails.includes(u.email))
        if (remainingPending.length > 0 && result.sent > 0) {
          const nextBatch = remainingPending.slice(0, 200).map(u => u.email).filter(Boolean) as string[]
          setSelectedUserIds(new Set(nextBatch))
        } else {
          setSelectedUserIds(new Set())
        }
      }
      
      // Don't reset form when batch sending - keep subject and content
      if (totalEmails <= BATCH_SIZE) {
        setSendToAll(false)
        setManualEmails("")
      }
    } catch (err: any) {
      toast({ 
        title: "Network error", 
        description: err?.message || "Please try again.", 
        variant: "destructive" as any 
      })
    } finally {
      setIsSending(false)
    }
  }

  if (isLoading) {
    return (
      <AdminLayout title="Email Sender" subtitle="Send emails to users">
        <AdminLoader type="users" message="Loading users..." />
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Email Sender" subtitle="Send emails to selected users (max 200) or all users" >
      <div className="space-y-6">
        {/* Sending Progress */}
        {sendingProgress && (
          <SectionCard>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">
                  Sending Progress
                </h3>
                <span className="text-sm text-gray-600">
                  Batch {sendingProgress.current} of {sendingProgress.total}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="bg-blue-600 h-4 rounded-full transition-all duration-300"
                  style={{ width: `${(sendingProgress.current / sendingProgress.total) * 100}%` }}
                />
              </div>
              <div className="text-sm text-gray-600">
                Sending to {sendingProgress.currentBatchEmails.length} users in current batch...
              </div>
            </div>
          </SectionCard>
        )}
        {/* Email Composition Section */}
        <SectionCard>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Email Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                placeholder="Enter email subject"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-900">
                  Email Content
                </label>
                <div className="flex items-center gap-4">
                  <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="radio"
                      name="contentType"
                      checked={isHtml}
                      onChange={() => {
                        setIsHtml(true)
                        setShowPreview(false)
                      }}
                      className="w-4 h-4 text-gray-600"
                    />
                    HTML
                  </label>
                  <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="radio"
                      name="contentType"
                      checked={!isHtml}
                      onChange={() => {
                        setIsHtml(false)
                        setShowPreview(false)
                      }}
                      className="w-4 h-4 text-gray-600"
                    />
                    Text Only
                  </label>
                  {isHtml && (
                    <button
                      type="button"
                      onClick={() => setShowPreview(!showPreview)}
                      className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      {showPreview ? 'Hide Preview' : 'Show Preview'}
                    </button>
                  )}
                </div>
              </div>
              
              {showPreview && isHtml ? (
                <div className="space-y-3">
                  <div className="border border-gray-300 rounded-lg overflow-hidden">
                    <div className="bg-gray-100 px-3 py-2 border-b border-gray-300">
                      <span className="text-xs font-medium text-gray-700">HTML Preview</span>
                    </div>
                    <div 
                      className="p-4 bg-white min-h-[200px] max-h-96 overflow-y-auto"
                      dangerouslySetInnerHTML={{ __html: content || '<p class="text-gray-400">Enter HTML content to see preview...</p>' }}
                    />
                  </div>
                  <textarea
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    className="w-full h-64 px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent font-mono text-sm"
                    placeholder="Enter HTML email content"
                  />
                </div>
              ) : (
                <textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  className="w-full h-64 px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent font-mono text-sm"
                  placeholder={isHtml ? "Enter HTML email content" : "Enter plain text email content"}
                />
              )}
              <div className="mt-2 text-xs text-gray-600">
                {isHtml 
                  ? "You can paste full HTML. Inline styles recommended. Click 'Show Preview' to see how it will look." 
                  : "Plain text content will be sent as-is."}
              </div>
            </div>

            <div className="space-y-3">
              {/* Send Mode Selection */}
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Send Mode
                </label>
                <div className="flex flex-wrap gap-4">
                  <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="radio"
                      name="sendMode"
                      value="users"
                      checked={sendMode === 'users'}
                      onChange={() => setSendMode('users')}
                      className="w-4 h-4 text-gray-600"
                    />
                    Select Users
                  </label>
                  <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="radio"
                      name="sendMode"
                      value="manual"
                      checked={sendMode === 'manual'}
                      onChange={() => setSendMode('manual')}
                      className="w-4 h-4 text-gray-600"
                    />
                    Manual Entry
                  </label>
                  <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="radio"
                      name="sendMode"
                      value="both"
                      checked={sendMode === 'both'}
                      onChange={() => setSendMode('both')}
                      className="w-4 h-4 text-gray-600"
                    />
                    Both
                  </label>
                </div>
              </div>

              {/* Manual Email Input */}
              {(sendMode === 'manual' || sendMode === 'both') && (
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Manual Email Entry
                  </label>
                  <textarea
                    value={manualEmails}
                    onChange={e => setManualEmails(e.target.value)}
                    className="w-full h-24 px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent font-mono text-sm"
                    placeholder="Enter email addresses separated by commas, spaces, or new lines&#10;Example: user1@example.com, user2@example.com"
                  />
                  <div className="mt-1 text-xs text-gray-600">
                    {manualEmailList.length > 0 
                      ? `Found ${manualEmailList.length} valid email${manualEmailList.length === 1 ? '' : 's'}: ${manualEmailList.slice(0, 3).join(', ')}${manualEmailList.length > 3 ? '...' : ''}`
                      : 'Enter email addresses to send to'
                    }
                  </div>
                </div>
              )}

              {/* Send to All Users (only for user selection mode) */}
              {(sendMode === 'users' || sendMode === 'both') && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <input
                    type="checkbox"
                    id="sendToAll"
                    checked={sendToAll}
                    onChange={e => handleSendToAllToggle(e.target.checked)}
                    className="w-4 h-4 text-gray-600 rounded border-gray-300 focus:ring-gray-400"
                  />
                  <label htmlFor="sendToAll" className="text-sm font-medium text-gray-900 cursor-pointer">
                    Send to all pending users ({pendingUsers.length} remaining)
                  </label>
                </div>
              )}
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2">
                  <EnvelopeIcon className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-900">
                    {(() => {
                      let count = 0
                      if (sendMode === 'users' || sendMode === 'both') {
                        count += sendToAll ? pendingUsers.length : selectedEmails.length
                      }
                      if (sendMode === 'manual' || sendMode === 'both') {
                        count += manualEmailList.length
                      }
                      // Remove duplicates if both modes
                      if (sendMode === 'both') {
                        const allEmails = [
                          ...(sendToAll ? pendingUsers.map(u => u.email).filter(Boolean) : selectedEmails),
                          ...manualEmailList
                        ]
                        count = new Set(allEmails).size
                      }
                      return `Total recipients: ${count}`
                    })()}
                  </span>
                </div>
                <button
                  onClick={handleSend}
                  disabled={isSending || (() => {
                    if (sendMode === 'users' && !sendToAll && selectedEmails.length === 0) return true
                    if (sendMode === 'manual' && manualEmailList.length === 0) return true
                    if (sendMode === 'both' && !sendToAll && selectedEmails.length === 0 && manualEmailList.length === 0) return true
                    return false
                  })()}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    isSending || (() => {
                      if (sendMode === 'users' && !sendToAll && selectedEmails.length === 0) return true
                      if (sendMode === 'manual' && manualEmailList.length === 0) return true
                      if (sendMode === 'both' && !sendToAll && selectedEmails.length === 0 && manualEmailList.length === 0) return true
                      return false
                    })()
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-800 text-white hover:bg-gray-900'
                  }`}
                >
                  {isSending ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="h-4 w-4 border-2 border-white/60 border-t-transparent rounded-full animate-spin"></span>
                      Sending...
                    </span>
                  ) : (
                    'Send Email'
                  )}
                </button>
              </div>
            </div>
          </div>
        </SectionCard>

        {/* Pending Users Section (only show if users mode is selected) */}
        {(sendMode === 'users' || sendMode === 'both') && (
        <SectionCard>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">
                Pending Users ({pendingUsers.length} remaining)
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSelect50}
                  disabled={filteredUsers.length === 0 || sendToAll || selectedEmails.length >= 200}
                  className="px-3 py-1.5 text-sm bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Select 50
                </button>
                <button
                  onClick={handleSelectNextBatch}
                  disabled={filteredUsers.length === 0 || sendToAll || selectedEmails.length >= 200}
                  className="px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Select Next 200
                </button>
                <button
                  onClick={handleSelectAll}
                  disabled={filteredUsers.length === 0 || sendToAll}
                  className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Select All (Max 200)
                </button>
                <button
                  onClick={handleDeselectAll}
                  disabled={selectedEmails.length === 0 || sendToAll}
                  className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Deselect All
                </button>
              </div>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-sm text-blue-800">
                <strong>Selected:</strong> {selectedEmails.length} / 200 | 
                <strong> Pending:</strong> {pendingUsers.length} | 
                <strong> Sent:</strong> {sentUsersList.length}
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search users by email, code, or country..."
                className="w-full pl-10 pr-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
              />
            </div>

            {/* User List */}
            <div className="border border-gray-200 rounded-lg max-h-96 overflow-y-auto">
              {filteredUsers.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <UserIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No users found</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {filteredUsers.slice(0, 200).map((user) => {
                    const isSelected = selectedUserIds.has(user.email) || sendToAll
                    const isDisabled = sendToAll || (!isSelected && selectedEmails.length >= 200)
                    
                    return (
                      <div
                        key={user.email}
                        className={`p-3 hover:bg-gray-50 transition-colors ${
                          isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                        }`}
                        onClick={() => !isDisabled && handleUserToggle(user.email)}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => !isDisabled && handleUserToggle(user.email)}
                            disabled={isDisabled}
                            className="w-4 h-4 text-gray-600 rounded border-gray-300 focus:ring-gray-400"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {user.email}
                              </p>
                              {isSelected && (
                                <CheckCircleIcon className="w-4 h-4 text-slate-600 flex-shrink-0" />
                              )}
                            </div>
                            <div className="flex items-center gap-3 mt-1">
                              {user.user_code && (
                                <span className="text-xs text-gray-500">
                                  Code: {user.user_code}
                                </span>
                              )}
                              {user.country && (
                                <span className="text-xs text-gray-500">
                                  {user.country}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
              {filteredUsers.length > 200 && (
                <div className="p-3 bg-yellow-50 border-t border-yellow-200 text-sm text-yellow-800">
                  Showing first 200 pending users. Use search to filter and select specific users.
                </div>
              )}
            </div>
          </div>
        </SectionCard>
        )}

        {/* Sent Users Section */}
        {sentUsersList.length > 0 && (
          <SectionCard>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">
                  Sent Emails ({sentUsersList.length} users)
                </h3>
                <button
                  onClick={() => setSentEmails(new Set())}
                  className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Clear History
                </button>
              </div>
              <div className="border border-gray-200 rounded-lg max-h-64 overflow-y-auto">
                <div className="divide-y divide-gray-200">
                  {sentUsersList.map((user) => (
                    <div key={user.email} className="p-2 flex items-center gap-2">
                      <CheckCircleIcon className="w-4 h-4 text-slate-600 flex-shrink-0" />
                      <span className="text-sm text-gray-900">{user.email}</span>
                      {user.user_code && (
                        <span className="text-xs text-gray-500">({user.user_code})</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </SectionCard>
        )}

        {/* Email Results Section */}
        {lastResult && (
          <SectionCard>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">
                  Email Send Results
                </h3>
                <button
                  onClick={() => setLastResult(null)}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Clear
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-sm text-blue-600 font-medium">Total</div>
                  <div className="text-2xl font-bold text-blue-900">{lastResult.total}</div>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-sm text-slate-600 font-medium">Sent</div>
                  <div className="text-2xl font-bold text-slate-900">{lastResult.sent}</div>
                </div>
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="text-sm text-red-600 font-medium">Failed</div>
                  <div className="text-2xl font-bold text-red-900">{lastResult.failed}</div>
                </div>
              </div>

              {lastResult.sentEmails.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                    Successfully Sent To ({lastResult.sentEmails.length} users):
                  </h4>
                  <div className="border border-gray-200 rounded-lg max-h-64 overflow-y-auto">
                    <div className="divide-y divide-gray-200">
                      {lastResult.sentEmails.map((email, index) => {
                        const user = users.find(u => u.email === email)
                        return (
                          <div key={index} className="p-2 flex items-center gap-2">
                            <CheckCircleIcon className="w-4 h-4 text-slate-600 flex-shrink-0" />
                            <span className="text-sm text-gray-900 font-medium">{email}</span>
                            {user?.user_code && (
                              <span className="text-xs text-gray-500">({user.user_code})</span>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}

              {lastResult.errors.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                    Failed ({lastResult.errors.length}):
                  </h4>
                  <div className="border border-gray-200 rounded-lg max-h-64 overflow-y-auto">
                    <div className="divide-y divide-gray-200">
                      {lastResult.errors.map((error, index) => (
                        <div key={index} className="p-2 flex items-center gap-2">
                          <XCircleIcon className="w-4 h-4 text-red-600 flex-shrink-0" />
                          <span className="text-sm text-gray-900">{error}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </SectionCard>
        )}
      </div>
    </AdminLayout>
  )
}
