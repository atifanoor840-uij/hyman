"use client"
import { ReactNode, useEffect, useMemo, useState } from "react"
import { BellIcon, Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline"
import AdminSidebar from "./admin-sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getAdminAuthState } from "@/lib/admin-auth"

interface AdminLayoutProps {
  children: ReactNode
  title?: string
  subtitle?: string
  showHero?: boolean
  headerActions?: ReactNode
  hideSidebar?: boolean
}

export default function AdminLayout({ 
  children, 
  title, 
  subtitle, 
  showHero = false,
  headerActions,
  hideSidebar = false
}: AdminLayoutProps) {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    username: "",
    full_name: "",
    admin_code: "",
    profile_picture_url: "",
  })
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false) // hidden by default when admin
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  const initials = useMemo(() => {
    const source = profile.full_name || profile.name || profile.username || profile.email || "A"
    const parts = source.trim().split(/\s+/)
    const first = parts[0]?.[0] || "A"
    const second = parts.length > 1 ? parts[1]?.[0] : ""
    return (first + (second || "")).toUpperCase()
  }, [profile.full_name, profile.name, profile.username, profile.email])

  useEffect(() => {
    document.title = title ? `${title} | fxgenzy Admin` : "fxgenzy Admin"
  }, [title])

  useEffect(() => {
    // Load sidebar open/collapsed state from localStorage (default: closed when admin)
    if (typeof window !== "undefined") {
      const open = localStorage.getItem("admin_sidebar_open")
      setSidebarOpen(open === "true")
      const saved = localStorage.getItem("admin_sidebar_collapsed")
      if (saved === "true") {
        setIsSidebarCollapsed(true)
      }
    }
  }, [])

  useEffect(() => {
    const loadProfile = async () => {
      try {
        // Check if admin is actually authenticated (not just localStorage data)
        const authState = getAdminAuthState()
        setIsAuthenticated(authState.isAuthenticated)
        
        if (authState.isAuthenticated && authState.user) {
          setProfile({
            name: authState.user?.name || "",
            email: authState.user?.email || "",
            username: authState.user?.username || "",
            full_name: authState.user?.full_name || "",
            admin_code: (authState.user as Record<string, unknown>)?.admin_code as string || "",
            profile_picture_url: (authState.user as Record<string, unknown>)?.profile_picture_url as string || "",
          })
        } else {
          // Clear profile if not authenticated
          setProfile({
            name: "",
            email: "",
            username: "",
            full_name: "",
            admin_code: "",
            profile_picture_url: "",
          })
        }
      } catch (_) {
        // ignore profile fetch errors
        setIsAuthenticated(false)
      }
    }
    loadProfile()
  }, [])

  const handleToggleSidebarCollapse = () => {
    setIsSidebarCollapsed(prev => {
      const newState = !prev
      if (typeof window !== "undefined") {
        localStorage.setItem("admin_sidebar_collapsed", newState ? "true" : "false")
      }
      return newState
    })
  }
  
  return (
    <div className="min-h-screen bg-white relative">
      
      <div className="relative w-full h-screen overflow-hidden">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar: hidden by default; only shown when toggle is clicked */}
        <div
          className={`
            fixed inset-y-0 left-0 z-50
            transform transition-transform duration-300 ease-in-out
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          `}
        >
          <AdminSidebar 
            onClose={() => {
              setSidebarOpen(false)
              if (typeof window !== "undefined") {
                localStorage.setItem("admin_sidebar_open", "false")
              }
            }} 
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={handleToggleSidebarCollapse}
          />
        </div>

        <main className={`admin-light-content overflow-y-auto overflow-x-auto w-full min-w-0 ${sidebarOpen ? (isSidebarCollapsed ? 'ml-10 w-[calc(100%-2.5rem)]' : 'ml-32 w-[calc(100%-8rem)]') : 'ml-0 w-full'} h-full transition-all duration-300`}>
          {/* Top bar (exact copy of user dashboard header bar styles) */}
          <div className="border-b border-gray-200 bg-white w-full sticky top-0 z-40">
            <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 py-1 sm:py-2 flex items-center justify-between gap-2 sm:gap-3">
              {/* Left: Sidebar toggle (all screen sizes when admin) + Header Actions */}
              <div className="flex items-center gap-2 sm:gap-3">
                {!hideSidebar && (
                  <button
                    onClick={() => {
                      const next = !sidebarOpen
                      setSidebarOpen(next)
                      if (typeof window !== "undefined") {
                        localStorage.setItem("admin_sidebar_open", next ? "true" : "false")
                      }
                    }}
                    className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                    aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
                  >
                    {sidebarOpen ? (
                      <XMarkIcon className="w-6 h-6" />
                    ) : (
                      <Bars3Icon className="w-6 h-6" />
                    )}
                  </button>
                )}

                {headerActions && (
                  <div className="flex items-center flex-shrink-0">
                    {headerActions}
                  </div>
                )}
              </div>

              {/* Center: Title/Sub (same typography as dashboard) */}
              <div className="min-w-0 flex-1 text-center">
                <h1 className="text-sm sm:text-lg md:text-xl font-bold text-gray-900 truncate">
                  {title || "fxgenzy Admin"}
                </h1>
                {subtitle ? (
                  <p className="text-xs text-gray-600 truncate hidden sm:block">{subtitle}</p>
                ) : null}
              </div>

              {/* Right: Admin badge + profile menu (styled like dashboard) */}
              <div className="flex items-center gap-3 sm:gap-4 relative">
                <button className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 hover:text-gray-900 hover:bg-gray-100 text-xs sm:text-sm">
                  <BellIcon className="w-4 h-4" />
                  <span className="font-semibold">Admin</span>
                </button>

                {isAuthenticated && (
                  <>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setShowProfileMenu(v => !v)} aria-label="Open profile menu">
                        <Avatar className="h-8 w-8">
                          {profile.profile_picture_url ? (
                            <AvatarImage
                              src={profile.profile_picture_url}
                              alt={profile.full_name || profile.name || profile.username || "Admin"}
                            />
                          ) : null}
                          <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>
                      </button>
                    </div>

                    {showProfileMenu && (
                      <div className="absolute right-0 top-12 z-50 w-64 rounded-xl border border-gray-200 bg-white p-4 shadow-xl">
                        <div className="flex items-center gap-3 mb-3">
                          <Avatar className="h-8 w-8">
                            {profile.profile_picture_url ? (
                              <AvatarImage
                                src={profile.profile_picture_url}
                                alt={profile.full_name || profile.name || profile.username || "Admin"}
                              />
                            ) : null}
                            <AvatarFallback>{initials}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-gray-900 truncate">
                              {profile.full_name || profile.name || profile.username || "Admin"}
                            </div>
                            <div className="text-xs text-gray-600 truncate">{profile.email}</div>
                          </div>
                        </div>
                        <div className="flex justify-between gap-2">
                          <a
                            href="/admin/profile"
                            className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-100 text-xs text-center"
                          >
                            Profile
                          </a>
                          <a
                            href="/admin"
                            className="flex-1 px-3 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold text-center hover:bg-slate-800"
                          >
                            Dashboard
                          </a>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Content padding - overflow-x-auto allows horizontal scroll when sidebar narrows the area */}
          <div className="w-full min-w-0 max-w-full overflow-x-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-10 bg-white min-h-[calc(100vh-56px)]">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}