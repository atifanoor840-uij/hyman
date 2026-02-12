"use client"
import { useEffect, useState, useRef, useCallback } from "react"
import { getApiBaseUrl } from "@/lib/api"
import { useAdminCache } from "@/hooks/use-admin-cache"
// API functions removed - using direct endpoint calls
import { 
  ChatBubbleLeftRightIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  UserIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  CalendarIcon,
  ChatBubbleLeftIcon,
  PaperAirplaneIcon,
  PaperClipIcon,
  EnvelopeIcon,
  BellIcon,
  XMarkIcon
} from "@heroicons/react/24/outline"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface Message {
  id: number
  ticket_id: number
  sender_user_id: number | null
  is_admin: boolean
  body: string
  created_at: string
  sender_name: string
  sender_type: string
}

interface ChatSession {
  id: number
  user_id: number
  user_code?: string
  user_email?: string
  subject: string
  status: string
  priority: string
  created_at: string
  updated_at: string
  messages: Message[]
}

export default function AdminLiveChatPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  
  // Use cached chat sessions data
  const { data: cachedSessions, isLoading: cacheLoading, error: cacheError, updateData, refresh } = useAdminCache<ChatSession[]>({
    endpoint: `${getApiBaseUrl()}/support/admin/tickets`,
    storageKey: 'admin_cache_live_chat',
    transformData: (data) => Array.isArray(data) ? data : [],
  })

  const [chatSessions, setChatSessions] = useState<ChatSession[]>([])
  const isLoading = cacheLoading
  const error = cacheError
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null)
  const [replyMessage, setReplyMessage] = useState("")
  const [isReplying, setIsReplying] = useState(false)
  const [readTickets, setReadTickets] = useState<Record<number, string>>({}) // ticket_id -> last_read_timestamp
  const [previousMessageCounts, setPreviousMessageCounts] = useState<Record<number, number>>({}) // ticket_id -> message_count
  const [notificationCounts, setNotificationCounts] = useState<Record<number, number>>({}) // ticket_id -> notification_count (max 2)
  const [showNotifications, setShowNotifications] = useState(false)
  const [unreadMessages, setUnreadMessages] = useState<Record<number, Message[]>>({}) // ticket_id -> array of unread messages
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const currentOscillatorRef = useRef<OscillatorNode | null>(null)
  const notificationDropdownRef = useRef<HTMLDivElement>(null)

  // Stop current notification sound
  const stopNotificationSound = () => {
    try {
      if (currentOscillatorRef.current) {
        currentOscillatorRef.current.stop()
        currentOscillatorRef.current = null
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {})
        audioContextRef.current = null
      }
    } catch (error) {
      console.error("Failed to stop notification sound:", error)
    }
  }

  // Play sound notification for new messages
  const playNotificationSound = () => {
    try {
      // Stop any existing sound first
      stopNotificationSound()
      
      // Create a simple beep sound using Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      audioContextRef.current = audioContext
      
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      currentOscillatorRef.current = oscillator
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.value = 800
      oscillator.type = 'sine'
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.3)
      
      // Clean up after sound finishes
      oscillator.onended = () => {
        currentOscillatorRef.current = null
        audioContextRef.current = null
      }
    } catch (error) {
      console.error("Failed to play notification sound:", error)
    }
  }

  // Mark ticket as read
  const markTicketAsRead = (ticketId: number) => {
    const now = new Date().toISOString()
    const updated = { ...readTickets, [ticketId]: now }
    setReadTickets(updated)
    
    // Remove unread messages for this ticket when marked as read
    setUnreadMessages(prev => {
      const updated = { ...prev }
      delete updated[ticketId]
      return updated
    })
    
    // Save to localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("admin_read_tickets", JSON.stringify(updated))
    }
  }

  // Mark specific message as seen
  const markMessageAsSeen = (ticketId: number, messageId: number) => {
    setUnreadMessages(prev => {
      const updated = { ...prev }
      if (updated[ticketId]) {
        updated[ticketId] = updated[ticketId].filter(msg => msg.id !== messageId)
        if (updated[ticketId].length === 0) {
          delete updated[ticketId]
        }
      }
      return updated
    })
  }

  // Get all unread messages for notifications
  const getAllUnreadMessages = (): Array<{ ticket: ChatSession, message: Message }> => {
    const result: Array<{ ticket: ChatSession, message: Message }> = []
    chatSessions.forEach(session => {
      if (unreadMessages[session.id] && unreadMessages[session.id].length > 0) {
        unreadMessages[session.id].forEach(message => {
          result.push({ ticket: session, message })
        })
      }
    })
    // Sort by message created_at descending (newest first)
    return result.sort((a, b) => 
      new Date(b.message.created_at).getTime() - new Date(a.message.created_at).getTime()
    )
  }

  const refreshTickets = async () => {
    try {
      // Use the refresh function from cache hook to get latest data
      await refresh()
    } catch (error) {
      console.error("Failed to refresh tickets:", error)
    }
  }

  // Check for new messages when chatSessions updates
  useEffect(() => {
    chatSessions.forEach((session: ChatSession) => {
      const prevCount = previousMessageCounts[session.id] || 0
      const currentCount = session.messages?.length || 0
      
      // If message count increased and it's not the currently selected session
      if (currentCount > prevCount && session.id !== selectedSession?.id) {
        // Get new messages (messages that weren't there before)
        const newMessages = session.messages?.slice(prevCount) || []
        
        // Filter for user messages only
        const newUserMessages = newMessages.filter(msg => !msg.is_admin)
        
        // Add new user messages to unread messages
        if (newUserMessages.length > 0) {
          setUnreadMessages(prev => {
            const existing = prev[session.id] || []
            const messageIds = new Set(existing.map(m => m.id))
            const uniqueNewMessages = newUserMessages.filter(m => !messageIds.has(m.id))
            return {
              ...prev,
              [session.id]: [...existing, ...uniqueNewMessages]
            }
          })
          
          // Play sound for first notification
          const lastMessage = session.messages?.[session.messages.length - 1]
          if (lastMessage && !lastMessage.is_admin) {
            playNotificationSound()
            setNotificationCounts(prev => ({
              ...prev,
              [session.id]: 1
            }))
          }
        }
      } else if (currentCount === prevCount && session.id !== selectedSession?.id) {
        // If no new message but we haven't reached limit, play second notification
        const currentNotificationCount = notificationCounts[session.id] || 0
        if (currentNotificationCount === 1) {
          const lastMessage = session.messages?.[session.messages.length - 1]
          if (lastMessage && !lastMessage.is_admin) {
            playNotificationSound()
            setNotificationCounts(prev => ({
              ...prev,
              [session.id]: 2
            }))
          }
        }
      }
    })
    
    // Update previous message counts
    const newCounts: Record<number, number> = {}
    chatSessions.forEach((session: ChatSession) => {
      newCounts[session.id] = session.messages?.length || 0
    })
    setPreviousMessageCounts(newCounts)
    
    // Update the selected session if it exists
    if (selectedSession) {
      const updatedSession = chatSessions.find((ticket: ChatSession) => ticket.id === selectedSession.id)
      if (updatedSession) {
        setSelectedSession(updatedSession)
        // Keep ticket marked as read if currently viewing
        markTicketAsRead(updatedSession.id)
      }
    }
  }, [chatSessions, selectedSession])

  // Load read tickets from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("admin_read_tickets")
      if (saved) {
        try {
          setReadTickets(JSON.parse(saved))
        } catch (e) {
          console.error("Failed to parse read tickets:", e)
        }
      }
    }
  }, [])

  // Update chatSessions when cached data changes
  useEffect(() => {
    if (cachedSessions) {
      const newSessions = Array.isArray(cachedSessions) ? cachedSessions : []
      
      // Initialize previous message counts on first load
      setPreviousMessageCounts((prev) => {
        if (Object.keys(prev).length === 0) {
          const initialCounts: Record<number, number> = {}
          newSessions.forEach((session: ChatSession) => {
            initialCounts[session.id] = session.messages?.length || 0
          })
          return initialCounts
        }
        return prev
      })
      
      setChatSessions(newSessions)
    }
  }, [cachedSessions])

  // Periodic refresh to detect new messages (every 5 seconds)
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      refreshTickets()
    }, 5000)
    
    return () => clearInterval(refreshInterval)
  }, [])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current && selectedSession) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [selectedSession?.messages])

  // Close notification dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationDropdownRef.current &&
        !notificationDropdownRef.current.contains(event.target as Node) &&
        showNotifications
      ) {
        setShowNotifications(false)
      }
    }

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [showNotifications])

  // Auto-refresh selected session messages every 3s
  useEffect(() => {
    if (!selectedSession) return

    // Mark as read when viewing
    markTicketAsRead(selectedSession.id)

    const interval = setInterval(async () => {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("admin_access_token") : null
        if (!token) return

        const response = await fetch(`${getApiBaseUrl()}/support/admin/tickets`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          }
        })

        if (!response.ok) return
        const data: ChatSession[] = await response.json()
        const updated = Array.isArray(data) ? data.find(t => t.id === selectedSession.id) : null
        if (updated) {
          // Update only if message count or last update changed
          const prevCount = selectedSession.messages?.length || 0
          const nextCount = updated.messages?.length || 0
          if (prevCount !== nextCount || selectedSession.updated_at !== updated.updated_at) {
            setSelectedSession(updated)
            // Mark as read when new messages arrive while viewing
            markTicketAsRead(updated.id)
            
            // Play sound if new message is from user (max 2 times)
            if (nextCount > prevCount) {
              const lastMessage = updated.messages?.[updated.messages.length - 1]
              if (lastMessage && !lastMessage.is_admin) {
                // Reset notification count for new message and play first notification
                playNotificationSound()
                setNotificationCounts(prev => ({
                  ...prev,
                  [updated.id]: 1
                }))
              }
            } else {
              // If no new message but we haven't reached limit, play second notification
              const currentNotificationCount = notificationCounts[updated.id] || 0
              if (currentNotificationCount === 1) {
                const lastMessage = updated.messages?.[updated.messages.length - 1]
                if (lastMessage && !lastMessage.is_admin) {
                  playNotificationSound()
                  setNotificationCounts(prev => ({
                    ...prev,
                    [updated.id]: 2
                  }))
                }
              }
            }
          }
        }
      } catch (e) {
        // Silent fail on polling
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [selectedSession])

  const filteredSessions = chatSessions
    .filter(session => {
      const searchLower = searchTerm.toLowerCase()
      const matchesSearch = session.id.toString().toLowerCase().includes(searchLower) ||
                           session.user_id.toString().toLowerCase().includes(searchLower) ||
                           session.subject.toLowerCase().includes(searchLower) ||
                           (session.user_code && session.user_code.toLowerCase().includes(searchLower)) ||
                           (session.user_email && session.user_email.toLowerCase().includes(searchLower))
      const matchesStatus = statusFilter === "all" || session.status.toLowerCase() === statusFilter.toLowerCase()
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      // Sort by updated_at descending (newest first)
      const dateA = new Date(a.updated_at).getTime()
      const dateB = new Date(b.updated_at).getTime()
      return dateB - dateA
    })

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "new": return "bg-blue-500/20 text-blue-400"
      case "pending": return "bg-yellow-500/20 text-yellow-400"
      case "closed": return "bg-gray-500/20 text-gray-400"
      case "resolved": return "bg-slate-500/20 text-slate-700"
      default: return "bg-gray-500/20 text-gray-400"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "urgent": return "bg-red-500/20 text-red-400"
      case "high": return "bg-orange-500/20 text-orange-400"
      case "normal": return "bg-yellow-500/20 text-yellow-400"
      case "low": return "bg-slate-500/20 text-slate-700"
      default: return "bg-gray-500/20 text-gray-400"
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString()
    } catch {
      return dateString
    }
  }

  const getLastMessage = (session: ChatSession) => {
    if (session.messages && session.messages.length > 0) {
      const lastMessage = session.messages[session.messages.length - 1]
      return {
        body: lastMessage.body,
        time: lastMessage.created_at,
        sender: lastMessage.sender_name,
        isAdmin: lastMessage.is_admin
      }
    }
    return null
  }

  // Check if a ticket has unread messages
  const hasUnreadMessages = (session: ChatSession): boolean => {
    if (!session.messages || session.messages.length === 0) return false
    
    const lastMessage = session.messages[session.messages.length - 1]
    // If last message is from admin, no unread
    if (lastMessage.is_admin) return false
    
    const lastReadTime = readTickets[session.id]
    if (!lastReadTime) {
      // If never read, check if there are any user messages
      return session.messages.some(msg => !msg.is_admin)
    }
    
    // Compare last message time with last read time
    return new Date(lastMessage.created_at) > new Date(lastReadTime)
  }

  // Handle ticket selection and mark as read
  const handleSelectSession = (session: ChatSession) => {
    // Stop any playing notification sound
    stopNotificationSound()
    // Reset notification count for this ticket
    setNotificationCounts(prev => {
      const updated = { ...prev }
      delete updated[session.id]
      return updated
    })
    // Mark all messages in this ticket as seen
    setUnreadMessages(prev => {
      const updated = { ...prev }
      delete updated[session.id]
      return updated
    })
    setSelectedSession(session)
    markTicketAsRead(session.id)
    // Close notification dropdown if open
    setShowNotifications(false)
  }

  // Handle notification click - open chat and mark message as seen
  const handleNotificationClick = (ticket: ChatSession, message: Message) => {
    handleSelectSession(ticket)
    markMessageAsSeen(ticket.id, message.id)
  }

  const handleReply = async () => {
    if (!selectedSession || !replyMessage.trim()) return
    
    setIsReplying(true)
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("admin_access_token") : null
      if (!token) {
        setError("Admin access token not found. Please login again.")
        return
      }

      const response = await fetch(`${getApiBaseUrl()}/support/admin/tickets/${selectedSession.id}/reply`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          body: replyMessage
        })
      })

      if (!response.ok) {
        if (response.status === 401) {
          setError("Unauthorized. Please login again.")
        } else if (response.status === 403) {
          setError("Access forbidden. Insufficient permissions.")
        } else {
          setError(`Failed to send reply: ${response.status} ${response.statusText}`)
        }
        return
      }

      const responseData = await response.json()
      
      // Add the new message to the selected session
      const newMessage: Message = {
        id: responseData.id || Date.now(), // Use API response ID or fallback
        ticket_id: selectedSession.id,
        sender_user_id: null,
        is_admin: true,
        body: replyMessage,
        created_at: responseData.created_at || new Date().toISOString(),
        sender_name: "Admin",
        sender_type: "admin"
      }
      
      setSelectedSession({
        ...selectedSession,
        messages: [...selectedSession.messages, newMessage],
        updated_at: new Date().toISOString()
      })
      
      setReplyMessage("")
      
      // Refresh immediately so user messages appear instantly
      await refreshTickets()
    } catch (error: any) {
      console.error("Failed to send reply:", error)
      setError(`Network error: ${error.message}`)
    } finally {
      setIsReplying(false)
    }
  }

  const newCount = chatSessions.filter(s => s.status === "new").length
  const pendingCount = chatSessions.filter(s => s.status === "pending").length
  const totalCount = chatSessions.length
  const unreadCount = chatSessions.filter(s => hasUnreadMessages(s)).length

  return (
    <div className="h-screen w-screen bg-gray-900 flex flex-col overflow-hidden">
      {/* Error Display */}
      {error && (
        <div className="p-2 bg-red-500/10 border-b border-red-500/20">
          <div className="flex items-center space-x-2">
            <div className="text-red-400 text-sm">{error}</div>
          </div>
        </div>
      )}

      {/* Chat Interface */}
      <div className="flex flex-1 bg-gray-900 overflow-hidden">
        {/* Sidebar - Ticket List */}
        <div className="w-1/3 border-r border-gray-700 flex flex-col">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Support Tickets</h3>
              <div className="flex items-center gap-2">
                {/* Notification Icon */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800"
                    title="Notifications"
                  >
                    <BellIcon className="w-5 h-5" />
                    {getAllUnreadMessages().length > 0 && (
                      <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse">
                        {getAllUnreadMessages().length > 99 ? '99+' : getAllUnreadMessages().length}
                      </span>
                    )}
                  </button>
                  
                  {/* Notification Dropdown */}
                  {showNotifications && (
                    <div
                      ref={notificationDropdownRef}
                      className="absolute right-0 top-full mt-2 w-96 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 max-h-96 overflow-hidden flex flex-col"
                    >
                      <div className="p-3 border-b border-gray-700 flex items-center justify-between">
                        <h4 className="text-white font-semibold text-sm">
                          Notifications ({getAllUnreadMessages().length})
                        </h4>
                        <button
                          onClick={() => setShowNotifications(false)}
                          className="text-gray-400 hover:text-white transition-colors"
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="overflow-y-auto flex-1">
                        {getAllUnreadMessages().length > 0 ? (
                          <div className="divide-y divide-gray-700">
                            {getAllUnreadMessages().map(({ ticket, message }) => (
                              <div
                                key={`${ticket.id}-${message.id}`}
                                onClick={() => handleNotificationClick(ticket, message)}
                                className="p-3 hover:bg-gray-700/50 cursor-pointer transition-colors"
                              >
                                <div className="flex items-start gap-2 mb-2">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-white font-semibold text-sm">
                                        Ticket #{ticket.id}
                                      </span>
                                      <span className="text-xs text-gray-400">
                                        {ticket.subject}
                                      </span>
                                    </div>
                                    <div className="text-xs text-gray-400 mb-1">
                                      From: <span className="text-blue-400">{message.sender_name}</span>
                                    </div>
                                    <p className="text-sm text-gray-300 line-clamp-2 mb-2">
                                      {message.body}
                                    </p>
                                    <div className="text-xs text-gray-500">
                                      {formatDate(message.created_at)}
                                    </div>
                                  </div>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      markMessageAsSeen(ticket.id, message.id)
                                    }}
                                    className="text-gray-400 hover:text-white transition-colors p-1"
                                    title="Mark as read"
                                  >
                                    <XMarkIcon className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-8 text-center text-gray-400">
                            <BellIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No new notifications</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                <span className="text-sm text-gray-400">{totalCount} total</span>
                {unreadCount > 0 && (
                  <span className="relative">
                    <span className="text-sm text-red-400 font-semibold">{unreadCount} unread</span>
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                  </span>
                )}
                <span className="text-sm text-slate-600">{newCount} new</span>
              </div>
            </div>
            
            {/* Search and Filter */}
            <div className="space-y-3">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tickets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500 text-sm"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-red-500 text-sm"
              >
                <option value="all">All Status</option>
                <option value="new">New</option>
                <option value="pending">Pending</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>

          {/* Ticket List */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-500 mx-auto mb-2"></div>
                <p className="text-gray-400 text-sm">Loading tickets...</p>
              </div>
            ) : filteredSessions.length > 0 ? (
              <div className="p-2">
                {filteredSessions.map((session) => {
                  const lastMessage = getLastMessage(session)
                  return (
                    <div
                      key={session.id}
                      onClick={() => handleSelectSession(session)}
                      className={`p-4 rounded-xl cursor-pointer transition-all mb-3 border-2 relative ${
                        selectedSession?.id === session.id
                          ? 'bg-red-500/20 border-red-500/50 shadow-lg shadow-red-500/20'
                          : 'bg-gray-800/50 hover:bg-gray-800/70 border-gray-700/50 hover:border-gray-600'
                      } ${hasUnreadMessages(session) ? 'border-l-4 border-l-red-500' : ''}`}
                    >
                      {hasUnreadMessages(session) && (
                        <div className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-500/50"></div>
                      )}
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-white font-bold text-base">Ticket #{session.id}</span>
                            <span className={`px-2 py-1 rounded-lg text-xs font-bold uppercase ${getStatusColor(session.status)}`}>
                              {session.status}
                            </span>
                            <span className={`px-2 py-1 rounded-lg text-xs font-bold uppercase ${getPriorityColor(session.priority)}`}>
                              {session.priority}
                            </span>
                          </div>
                          <div className="text-white font-semibold text-sm mb-2 line-clamp-1">{session.subject}</div>
                          <div className="space-y-1.5 text-xs">
                            <div className="flex items-center gap-2 flex-wrap">
                              <div className="flex items-center gap-1 text-gray-400">
                                <UserIcon className="w-3 h-3" />
                                <span>ID: <span className="text-white font-medium">{session.user_id}</span></span>
                              </div>
                              {session.user_code && (
                                <>
                                  <span className="text-gray-600">•</span>
                                  <div className="flex items-center gap-1">
                                    <span className="text-gray-400">Code:</span>
                                    <span className="text-slate-600 font-semibold">{session.user_code}</span>
                                  </div>
                                </>
                              )}
                            </div>
                            {session.user_email && (
                              <div className="flex items-center gap-1 text-gray-400 truncate">
                                <EnvelopeIcon className="w-3 h-3 text-gray-500" />
                                <span className="text-blue-400 text-xs truncate">{session.user_email}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1 text-gray-400">
                              <ChatBubbleLeftIcon className="w-3 h-3" />
                              <span className="text-white font-medium">{session.messages?.length || 0} messages</span>
                            </div>
                          </div>
                        </div>
                        {lastMessage && (
                          <div className="text-right ml-3">
                            <div className="text-gray-400 text-xs mb-1">
                              {formatDate(lastMessage.time).split(',')[0]}
                            </div>
                            <div className="text-gray-500 text-xs">
                              {formatDate(lastMessage.time).split(',')[1]?.trim()}
                            </div>
                          </div>
                        )}
                      </div>
                      {lastMessage && (
                        <div className="mt-2 pt-2 border-t border-gray-700/50">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                              lastMessage.isAdmin 
                                ? 'bg-red-500/30 text-red-200' 
                                : 'bg-blue-500/30 text-blue-200'
                            }`}>
                              {lastMessage.isAdmin ? 'ADMIN' : 'USER'}
                            </span>
                            <span className="text-gray-400 text-xs">{lastMessage.sender}</span>
                          </div>
                          <div className="text-gray-300 text-xs line-clamp-2">{lastMessage.body}</div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="p-8 text-center">
                <ChatBubbleLeftRightIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">No tickets found</p>
              </div>
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedSession ? (
            <>
              {/* Chat Header */}
              <div className="p-2 border-b border-gray-700 bg-gray-800/50">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                      <h3 className="text-sm font-medium text-white">#{selectedSession.id}</h3>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium uppercase ${getStatusColor(selectedSession.status)}`}>
                        {selectedSession.status}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium uppercase ${getPriorityColor(selectedSession.priority)}`}>
                        {selectedSession.priority}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400 mb-1 truncate">{selectedSession.subject}</div>
                    <div className="flex items-center gap-2 flex-wrap text-[10px]">
                      <span className="text-gray-500">ID: <span className="text-white">{selectedSession.user_id}</span></span>
                      {selectedSession.user_code && (
                        <>
                          <span className="text-gray-600">•</span>
                          <span className="text-gray-500">Code: <span className="text-slate-600">{selectedSession.user_code}</span></span>
                        </>
                      )}
                      {selectedSession.user_email && (
                        <>
                          <span className="text-gray-600">•</span>
                          <span className="text-gray-500 truncate">Email: <span className="text-blue-400">{selectedSession.user_email}</span></span>
                        </>
                      )}
                      <span className="text-gray-600">•</span>
                      <span className="text-gray-500">{selectedSession.messages?.length || 0} msgs</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {selectedSession.status === "new" && (
                      <button className="px-2 py-1 bg-slate-900 text-white rounded text-[10px] font-medium hover:bg-slate-800 transition-colors">
                        Pending
                      </button>
                    )}
                    {selectedSession.status === "pending" && (
                      <button className="px-2 py-1 bg-yellow-600 text-white rounded text-[10px] font-medium hover:bg-yellow-700 transition-colors">
                        Resolved
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-900">
                {selectedSession.messages && selectedSession.messages.length > 0 ? (
                  <>
                    {[...selectedSession.messages]
                      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                      .map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.is_admin ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[75%] p-3 rounded-lg border ${
                            message.is_admin
                              ? 'bg-gray-800 border-gray-600'
                              : 'bg-blue-900/50 border-blue-700/50'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                              message.is_admin 
                                ? 'bg-gray-700 text-gray-300' 
                                : 'bg-blue-800 text-blue-200'
                            }`}>
                              {message.is_admin ? 'ADMIN' : 'USER'}
                            </span>
                            <span className={`text-sm font-medium ${
                              message.is_admin ? 'text-gray-300' : 'text-blue-200'
                            }`}>
                              {message.sender_name}
                            </span>
                            <span className={`text-xs ml-auto ${
                              message.is_admin ? 'text-gray-500' : 'text-blue-400'
                            }`}>
                              {formatDate(message.created_at)}
                            </span>
                          </div>
                          <p className={`text-sm leading-relaxed whitespace-pre-wrap ${
                            message.is_admin ? 'text-gray-200' : 'text-white'
                          }`}>
                            {message.body}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </>
                ) : (
                  <div className="text-center text-gray-400 py-12">
                    <ChatBubbleLeftIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-lg font-medium">No messages yet</p>
                    <p className="text-sm mt-1">Start the conversation by sending a reply below</p>
                  </div>
                )}
              </div>

              {/* Reply Area */}
              <div className="p-2 border-t border-gray-700 bg-gray-800/50">
                <div className="mb-1">
                  <span className="px-1 py-0.5 bg-red-500/30 text-red-200 rounded text-[10px] font-medium">ADMIN</span>
                </div>
                <div className="flex gap-1.5">
                  <div className="flex-1">
                    <textarea
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      placeholder="Type reply..."
                      className="w-full p-1.5 bg-gray-900/80 border border-gray-600 rounded text-white placeholder-gray-500 text-xs focus:outline-none focus:border-red-500 resize-none transition-all"
                      rows={1}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          handleReply()
                        }
                      }}
                    />
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={handleReply}
                      disabled={!replyMessage.trim() || isReplying}
                      className="px-2 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex items-center gap-1 text-xs font-medium"
                    >
                      {isReplying ? (
                        <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent"></div>
                      ) : (
                        <>
                          <PaperAirplaneIcon className="w-3 h-3" />
                          <span>Send</span>
                        </>
                      )}
                    </button>
                    <button className="px-2 py-1.5 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors flex items-center justify-center" title="Attach">
                      <PaperClipIcon className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-gray-400">
                <ChatBubbleLeftRightIcon className="w-16 h-16 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Select a ticket to start chatting</h3>
                <p>Choose a support ticket from the sidebar to view the conversation</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}





