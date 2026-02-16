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
        {/* Sidebar overlay: page stays in place, sidebar slides on top */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={() => {
              setSidebarOpen(false)
              if (typeof window !== "undefined") {
                localStorage.setItem("admin_sidebar_open", "false")
              }
            }}
            aria-hidden="true"
          />
        )}

        {/* Sidebar: overlay only — does not shift page content */}
        <div
          className={`
            fixed inset-y-0 left-0 z-50
            transform transition-transform duration-300 ease-in-out
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
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

        {/* Main content: always full width; never moves when sidebar opens */}
        <main className="admin-light-content overflow-y-auto overflow-x-auto w-full min-w-0 ml-0 h-full">
          {/* Top bar */}
          <div className="border-b border-neutral-200 bg-white w-full sticky top-0 z-40 shadow-sm">
            <div className="w-full px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
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
                    className="p-2.5 rounded-xl text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
                    aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
                  >
                    {sidebarOpen ? (
                      <XMarkIcon className="w-5 h-5" />
                    ) : (
                      <Bars3Icon className="w-5 h-5" />
                    )}
                  </button>
                )}

                {headerActions && (
                  <div className="flex items-center flex-shrink-0">
                    {headerActions}
                  </div>
                )}
              </div>

              {/* Center: Title */}
              <div className="min-w-0 flex-1 text-center">
                <h1 className="text-base sm:text-lg font-semibold text-neutral-900 truncate">
                  {title || "FxGenz Admin"}
                </h1>
                {subtitle ? (
                  <p className="text-xs text-neutral-500 truncate hidden sm:block mt-0.5">{subtitle}</p>
                ) : null}
              </div>

              {/* Right: Notifications + profile */}
              <div className="flex items-center gap-2 sm:gap-3 relative">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-100 text-neutral-600 text-xs font-medium">
                  <BellIcon className="w-4 h-4" />
                  Admin
                </span>
                {isAuthenticated && (
                  <>
                    <button onClick={() => setShowProfileMenu((v) => !v)} aria-label="Open profile menu" className="rounded-full ring-2 ring-transparent hover:ring-neutral-200 transition-shadow">
                      <Avatar className="h-9 w-9">
                          {profile.profile_picture_url ? (
                            <AvatarImage
                              src={profile.profile_picture_url}
                              alt={profile.full_name || profile.name || profile.username || "Admin"}
                            />
                          ) : null}
                          <AvatarFallback className="bg-neutral-200 text-neutral-700 text-sm font-medium">{initials}</AvatarFallback>
                        </Avatar>
                    </button>
                    {showProfileMenu && (
                      <div className="absolute right-0 top-full mt-2 z-50 w-64 rounded-xl border border-neutral-200 bg-white p-4 shadow-lg">
                        <div className="flex items-center gap-3 pb-3 border-b border-neutral-100">
                          <Avatar className="h-10 w-10">
                            {profile.profile_picture_url ? (
                              <AvatarImage
                                src={profile.profile_picture_url}
                                alt={profile.full_name || profile.name || profile.username || "Admin"}
                              />
                            ) : null}
                            <AvatarFallback className="bg-neutral-200 text-neutral-700 text-sm font-medium">{initials}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-neutral-900 truncate">
                              {profile.full_name || profile.name || profile.username || "Admin"}
                            </div>
                            <div className="text-xs text-neutral-500 truncate">{profile.email}</div>
                          </div>
                        </div>
                        <div className="flex gap-2 pt-3">
                          <a href="/admin/profile" className="flex-1 px-3 py-2 rounded-lg border border-neutral-200 text-neutral-700 hover:bg-neutral-50 text-xs font-medium text-center transition-colors">
                            Profile
                          </a>
                          <a href="/admin" className="flex-1 px-3 py-2 rounded-lg bg-neutral-900 text-white text-xs font-medium text-center hover:bg-neutral-800 transition-colors">
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

          {/* Content */}
          <div className="w-full min-w-0 max-w-full overflow-x-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 bg-neutral-50 min-h-[calc(100vh-64px)]">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}