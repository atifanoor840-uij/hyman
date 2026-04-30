"use client"
import { ReactNode, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { getApiBaseUrl } from "@/lib/api"
import { UserIcon, CurrencyDollarIcon, BellIcon, Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline"
import DashboardSidebar from "./dashboard-sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import DashboardHeader from "@/components/ui/dashboard-header"

interface DashboardLayoutProps {
  children: ReactNode
  title?: string
  subtitle?: string
  showHero?: boolean
  headerActions?: ReactNode
}

export default function DashboardLayout({ 
  children, 
  title, 
  subtitle, 
  showHero = false,
  headerActions
}: DashboardLayoutProps) {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    username: "",
    profile_picture_url: "",
    coins: 0,
  })
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isContentReady, setIsContentReady] = useState(false)

  const initials = useMemo(() => {
    const source = profile.name || profile.email || profile.username || "U"
    const parts = source.trim().split(/\s+/)
    const first = parts[0]?.[0] || "U"
    const second = parts.length > 1 ? parts[1]?.[0] : ""
    return (first + (second || "")).toUpperCase()
  }, [profile.name, profile.email, profile.username])

  useEffect(() => {
    // Wait for content to be ready before showing navbar/header
    const timer = setTimeout(() => {
      setIsContentReady(true);
    }, 150);

    const loadProfile = async () => {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null
        const baseUrl = getApiBaseUrl()
        if (!token) {
          setIsContentReady(true);
          clearTimeout(timer);
          return
        }
        const res = await fetch(`${baseUrl}/auth/user/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) {
          setIsContentReady(true);
          clearTimeout(timer);
          return
        }
        setProfile({
          name: data?.name || "",
          email: data?.email || "",
          username: data?.username || "",
          profile_picture_url: data?.profile_picture_url || "",
          coins: Number(
            (data && (
              data.points_balance ?? data.coins ?? data.coin_balance ?? data.balance ?? data.points
            )) ?? 0
          ) || 0,
        })
        setIsContentReady(true);
        clearTimeout(timer);
      } catch (_) {
        // ignore header fetch errors
        setIsContentReady(true);
        clearTimeout(timer);
      }
    }
    loadProfile()

    // Also check if page is already loaded
    if (document.readyState === 'complete') {
      setIsContentReady(true);
      clearTimeout(timer);
    } else {
      const handleLoad = () => {
        setIsContentReady(true);
        clearTimeout(timer);
      };
      window.addEventListener('load', handleLoad);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('load', handleLoad);
      };
    }

    return () => clearTimeout(timer);
  }, [])
  if (!isContentReady) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-emerald-950/20 to-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-emerald-950/20 to-background relative">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-emerald-950/5 to-background" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-green-500/5 rounded-full blur-3xl" />
      
      <div className="relative w-full h-screen overflow-hidden">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        {/* Sidebar */}
        <div className={`
          fixed inset-y-0 left-0 z-50
          transform transition-transform duration-300 ease-in-out
          md:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <DashboardSidebar onClose={() => setSidebarOpen(false)} />
        </div>
        
        <main className="overflow-y-auto w-full md:ml-64 md:w-[calc(100%-16rem)] h-full">
          {/* Dashboard header visible on all dashboard pages */}
          <div className="border-b border-gray-800/50 bg-transparent w-full">
            <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 py-1 sm:py-2 flex items-center justify-between gap-2 sm:gap-3">
              {/* Left: Mobile Menu Button + Header Actions */}
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Mobile Menu Toggle */}
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="md:hidden p-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800/50 transition-colors"
                  aria-label="Toggle sidebar"
                >
                  {sidebarOpen ? (
                    <XMarkIcon className="w-6 h-6" />
                  ) : (
                    <Bars3Icon className="w-6 h-6" />
                  )}
                </button>
                
                {headerActions && (
                  <div className="flex items-center flex-shrink-0">
                    {headerActions}
                  </div>
                )}
              </div>
              
              {/* Center: Title/Sub */}
              <div className="min-w-0 flex-1 text-center">
                <h1 className="text-sm sm:text-lg md:text-xl font-bold text-white truncate">{title || "Dashboard"}</h1>
              </div>

              {/* Right: Coins + Profile */}
              <div className="flex items-center gap-3 sm:gap-4 relative">
                <button className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-[#DEBF74] hover:text-[#DEBF74] hover:bg-emerald-900/20 text-xs sm:text-sm">
                  <CurrencyDollarIcon className="w-4 h-4" />
                  <span className="font-semibold">{Number.isFinite(profile.coins) ? profile.coins : 0}</span>
                </button>
                <div className="flex items-center gap-2">
                  <button onClick={() => setShowProfileMenu(v => !v)} aria-label="Open profile menu">
                  <Avatar className="h-9 w-9 ring-2 ring-purple-400/40 shadow-[0_8px_20px_rgba(88,28,135,0.20)] transition hover:ring-purple-300/60">
                    {profile.profile_picture_url ? (
                      <AvatarImage src={profile.profile_picture_url} alt={profile.name || profile.username || "User"} />
                    ) : null}
                    <AvatarFallback className="bg-gradient-to-br from-purple-900/70 via-purple-950/60 to-zinc-950 text-white">
                      <UserIcon className="h-4 w-4 opacity-90" aria-hidden />
                    </AvatarFallback>
                  </Avatar>
                  </button>
                </div>
                {showProfileMenu && (
                  <div className="absolute right-0 top-12 z-50 w-64 rounded-xl border border-gray-800/60 bg-gray-900/90 backdrop-blur p-4 shadow-xl">
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar className="h-9 w-9 ring-2 ring-purple-400/40 shadow-[0_8px_20px_rgba(88,28,135,0.20)]">
                        {profile.profile_picture_url ? (
                          <AvatarImage src={profile.profile_picture_url} alt={profile.name || profile.username || "User"} />
                        ) : null}
                        <AvatarFallback className="bg-gradient-to-br from-purple-900/70 via-purple-950/60 to-zinc-950 text-white">
                          <UserIcon className="h-4 w-4 opacity-90" aria-hidden />
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-white truncate">{profile.name || profile.username || "User"}</div>
                        <div className="text-xs text-gray-400 truncate">{profile.email}</div>
                      </div>
                    </div>
                    {/* Token display removed */}
                    <div className="flex justify-between gap-2">
                      <a href="/dashboard/profile" className="flex-1 px-3 py-2 rounded-lg border border-gray-700 text-gray-300 hover:bg-gray-800/70 text-xs text-center">Profile</a>
                      <a href="/dashboard" className="flex-1 px-3 py-2 rounded-lg bg-[#DEBF74] text-black text-xs font-semibold text-center hover:bg-[#DEBF74]/90">Dashboard</a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
