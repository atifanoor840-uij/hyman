"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import { clearAdminAuthState } from "@/lib/admin-auth"
import {
  UsersIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  ArchiveBoxIcon,
  StarIcon,
  ArrowRightOnRectangleIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  XMarkIcon,
  ChevronLeftIcon,
  EnvelopeIcon,
  DocumentIcon,
  BanknotesIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline"

const navigationGroups = [
  {
    title: "User Management",
    items: [
      { name: "Users", href: "/admin/users", icon: UsersIcon },
      { name: "Orders", href: "/admin/orders", icon: ClipboardDocumentListIcon },
      { name: "Referrals", href: "/admin/referrals", icon: UserGroupIcon },
      { name: "KYC", href: "/admin/kyc", icon: ShieldCheckIcon },
      { name: "Certificates", href: "/admin/certificates", icon: DocumentIcon },
    ],
  },
  {
    title: "System",
    items: [
      { name: "Container", href: "/admin/container", icon: ArchiveBoxIcon },
      { name: "FxGenz Club", href: "/admin/dragon-club", icon: StarIcon },
      { name: "Withdrawal", href: "/admin/withdrawal", icon: BanknotesIcon },
      { name: "Email Sender", href: "/admin/email-sender", icon: EnvelopeIcon },
    ],
  },
]

interface AdminSidebarProps {
  onClose?: () => void
  isCollapsed?: boolean
  onToggleCollapse?: () => void
}

export default function AdminSidebar({ onClose, isCollapsed = false, onToggleCollapse }: AdminSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  const handleNavClick = () => {
    if (typeof window !== "undefined" && window.innerWidth < 768) onClose?.()
  }

  const handleLogout = () => {
    clearAdminAuthState()
    router.push("/admin/login")
  }

  const toggleExpanded = (itemName: string) => {
    setExpandedItems((prev) => (prev.includes(itemName) ? prev.filter((n) => n !== itemName) : [...prev, itemName]))
  }

  const isItemActive = (item: (typeof navigationGroups)[0]["items"][0]) => {
    if (item.subItems) return item.subItems.some((s) => pathname === s.href) || pathname === item.href
    return pathname === item.href
  }

  const isSubItemActive = (href: string) => pathname === href

  return (
    <div
      className={`h-full flex flex-col bg-neutral-900 text-white transition-all duration-300 ease-out ${
        isCollapsed ? "w-[72px]" : "w-[280px]"
      }`}
    >
      {/* Mobile close */}
      <div className="md:hidden flex justify-end p-3 border-b border-white/10 flex-shrink-0">
        <button
          onClick={onClose}
          className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Close menu"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Logo */}
      <div
        className={`flex-shrink-0 border-b border-white/10 ${
          isCollapsed ? "px-3 py-4 justify-center" : "px-5 py-4 items-center gap-3"
        } flex`}
      >
        <Link href="/admin" className={`flex items-center gap-3 hover:opacity-90 transition-opacity ${isCollapsed ? "justify-center" : "min-w-0"}`}>
          <div className="h-10 w-10 shrink-0 rounded-xl bg-neutral-800 border border-white/10 flex items-center justify-center">
            <span className="text-white font-bold text-sm tracking-tight">FX</span>
          </div>
          {!isCollapsed && (
            <div className="min-w-0 flex flex-col">
              <span className="font-semibold text-white text-sm tracking-tight truncate">FxGenz</span>
              <span className="text-[11px] text-neutral-500 font-medium tracking-wide uppercase">Admin</span>
            </div>
          )}
        </Link>
        {!isCollapsed && (
          <button
            onClick={onClose}
            className="ml-auto p-2 rounded-lg text-neutral-500 hover:text-white hover:bg-white/10 transition-colors shrink-0"
            aria-label="Collapse sidebar"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="admin-sidebar-nav flex-1 overflow-y-auto overflow-x-hidden py-4 min-h-0">
        <div className="space-y-8">
          {navigationGroups.map((group) => (
            <div key={group.title}>
              {!isCollapsed && (
                <p className="px-5 mb-2 text-[11px] font-semibold text-neutral-500 uppercase tracking-widest">
                  {group.title}
                </p>
              )}
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = isItemActive(item)
                  const isExpanded = expandedItems.includes(item.name)
                  const hasSub = item.subItems && item.subItems.length > 0

                  return (
                    <li key={item.name}>
                      {hasSub ? (
                        <>
                          <button
                            type="button"
                            onClick={() => !isCollapsed && toggleExpanded(item.name)}
                            className={`flex items-center w-full min-w-0 rounded-lg mx-2 transition-all duration-200 ${
                              isCollapsed ? "justify-center px-0 py-2.5" : "justify-between gap-2 px-3 py-2.5"
                            } ${
                              isActive
                                ? "bg-white/10 text-white font-medium"
                                : "text-neutral-400 hover:text-white hover:bg-white/5"
                            }`}
                            title={isCollapsed ? item.name : undefined}
                          >
                            <div className={`flex items-center min-w-0 ${isCollapsed ? "justify-center" : "gap-3"}`}>
                              <item.icon className="w-5 h-5 shrink-0 opacity-90" />
                              {!isCollapsed && <span className="text-sm truncate">{item.name}</span>}
                            </div>
                            {!isCollapsed && (isExpanded ? <ChevronDownIcon className="w-4 h-4 shrink-0" /> : <ChevronRightIcon className="w-4 h-4 shrink-0" />)}
                          </button>
                          {isExpanded && !isCollapsed && item.subItems && (
                            <ul className="mt-0.5 ml-2 pl-4 border-l border-white/10 space-y-0.5">
                              {item.subItems.map((sub) => {
                                const subActive = isSubItemActive(sub.href)
                                return (
                                  <li key={sub.name}>
                                    <Link
                                      href={sub.href}
                                      onClick={handleNavClick}
                                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                                        subActive ? "bg-white/10 text-white font-medium" : "text-neutral-500 hover:text-white hover:bg-white/5"
                                      }`}
                                    >
                                      <sub.icon className="w-4 h-4 shrink-0 opacity-80" />
                                      <span className="truncate">{sub.name}</span>
                                    </Link>
                                  </li>
                                )
                              })}
                            </ul>
                          )}
                        </>
                      ) : (
                        <Link
                          href={item.href}
                          onClick={handleNavClick}
                          className={`flex items-center w-full min-w-0 rounded-lg mx-2 transition-all duration-200 ${
                            isCollapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3 py-2.5"
                          } ${
                            isActive
                              ? "bg-white/10 text-white font-medium border-l-0"
                              : "text-neutral-400 hover:text-white hover:bg-white/5"
                          }`}
                          title={isCollapsed ? item.name : undefined}
                        >
                          <item.icon className="w-5 h-5 shrink-0 opacity-90" />
                          {!isCollapsed && <span className="text-sm truncate">{item.name}</span>}
                        </Link>
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className={`flex-shrink-0 border-t border-white/10 ${isCollapsed ? "p-2" : "p-3"}`}>
        <Link
          href="/admin"
          className={`flex items-center rounded-lg transition-all duration-200 ${
            isCollapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2.5"
          } text-neutral-400 hover:text-white hover:bg-white/5 mb-1`}
          title={isCollapsed ? "Dashboard" : undefined}
        >
          <Squares2X2Icon className="w-5 h-5 shrink-0" />
          {!isCollapsed && <span className="text-sm">Dashboard</span>}
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className={`flex items-center w-full rounded-lg transition-all duration-200 ${
            isCollapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2.5"
          } text-neutral-400 hover:text-red-400 hover:bg-red-500/10`}
          title={isCollapsed ? "Logout" : undefined}
        >
          <ArrowRightOnRectangleIcon className="w-5 h-5 shrink-0" />
          {!isCollapsed && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>
    </div>
  )
}
