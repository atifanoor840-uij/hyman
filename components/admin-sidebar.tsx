"use client"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { clearAdminAuthState } from "@/lib/admin-auth"
import { 
  HomeIcon,
  UsersIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  ArchiveBoxIcon,
  ChatBubbleLeftRightIcon,
  StarIcon,
  ArrowRightOnRectangleIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ClockIcon,
  CheckCircleIcon,
  PlayIcon,
  XCircleIcon,
  CreditCardIcon,
  CurrencyDollarIcon,
  XMarkIcon,
  ChevronLeftIcon,
  EnvelopeIcon,
  DocumentIcon
} from "@heroicons/react/24/outline"

const navigationGroups = [
  {
    title: "User Management",
    items: [
      { name: "Users", href: "/admin/users", icon: UsersIcon },
      { 
        name: "Orders", 
        href: "/admin/orders", 
        icon: ClipboardDocumentListIcon,
        subItems: [
          { name: "All Orders", href: "/admin/orders", icon: ClipboardDocumentListIcon },
          { name: "Pending", href: "/admin/orders/pending", icon: ClockIcon },
          { name: "Completed", href: "/admin/orders/completed", icon: CheckCircleIcon },
          { name: "Live", href: "/admin/orders/live", icon: PlayIcon },
          { name: "Failed", href: "/admin/orders/failed", icon: XCircleIcon },
          { name: "Passed", href: "/admin/orders/passed", icon: CheckCircleIcon },
          { name: "Stage 2", href: "/admin/orders/stage2", icon: CheckCircleIcon },
          { name: "Crypto", href: "/admin/orders/crypto", icon: CurrencyDollarIcon },
          { name: "Card", href: "/admin/orders/card", icon: CreditCardIcon },
        ]
      },
      { name: "Referrals", href: "/admin/referrals", icon: UserGroupIcon },
      { name: "KYC", href: "/admin/kyc", icon: ShieldCheckIcon },
      { name: "Certificates", href: "/admin/certificates", icon: DocumentIcon },
      { name: "Withdraw", href: "/admin/withdraw", icon: CurrencyDollarIcon },
    ]
  },
  {
    title: "System",
    items: [
      { name: "Container", href: "/admin/container", icon: ArchiveBoxIcon },
      { name: "Live Chat", href: "/admin/live-chat", icon: ChatBubbleLeftRightIcon },
      { name: "Dragon Club", href: "/admin/dragon-club", icon: StarIcon },
      { name: "Email Sender", href: "/admin/email-sender", icon: EnvelopeIcon },
    ]
  }
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
  
  // Load collapsed state from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('admin_sidebar_collapsed')
      if (saved === 'true' && onToggleCollapse) {
        // If saved as collapsed, trigger the toggle to sync with parent
        // This will be handled by the parent component
      }
    }
  }, [])
  
  const handleNavClick = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      onClose?.()
    }
  }
  
  const handleToggleCollapse = () => {
    if (onToggleCollapse) {
      onToggleCollapse()
    }
  }

  const handleLogout = () => {
    clearAdminAuthState()
    router.push('/admin/login')
  }

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev => 
      prev.includes(itemName) 
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    )
  }

  const isItemActive = (item: any) => {
    if (item.subItems) {
      return item.subItems.some((subItem: any) => pathname === subItem.href) || pathname === item.href
    }
    return pathname === item.href
  }

  const isSubItemActive = (subItem: any) => {
    return pathname === subItem.href
  }

  return (
    <div className="h-full flex">
      <div className={`${isCollapsed ? 'w-16' : 'w-64'} bg-gradient-to-b from-[#06140f] via-[#0b241a] to-[#06140f] border-r border-emerald-950/60 h-full flex flex-col overflow-hidden transition-all duration-300`}>
        {/* Mobile Close Button */}
        <div className="md:hidden flex justify-end p-4 border-b border-gray-800/50 flex-shrink-0">
          <button
            onClick={onClose}
            className="p-2 text-gray-300 hover:text-white transition-colors rounded-lg hover:bg-gray-800/50"
            aria-label="Close sidebar"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Logo - Fixed */}
        <div className={`${isCollapsed ? 'px-2' : 'px-4'} py-4 border-b border-gray-800/50 flex-shrink-0 flex items-center justify-between`}>
          <Link href="/admin" className={`flex items-center gap-2 hover:opacity-80 transition-opacity ${isCollapsed ? 'justify-center w-full' : ''}`}>
            <img
              src="https://res.cloudinary.com/dufcjjaav/image/upload/v1760892554/dragon_funded_logo-01-01-01_bkaqko.png"
              alt="Dragon Funded"
              className="h-8 w-8 rounded-lg object-cover"
            />
            {!isCollapsed && (
              <div className="flex items-baseline gap-1">
                <span className="text-sm font-bold text-white">DRAGON</span>
                <span className="text-sm font-bold text-[#DEBF74]">FUNDED</span>
              </div>
            )}
          </Link>
          {/* Close sidebar completely - leaves only top bar button */}
          <button
            onClick={onClose}
            className="hidden md:flex p-1.5 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors"
            aria-label="Close sidebar"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation - Scrollable (same scrollbar + spacing as dashboard) */}
        <nav
          className="flex-1 overflow-y-auto overflow-x-hidden p-4"
          style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(156, 163, 175, 0.3) transparent' }}
        >
          <style jsx>{`
            nav::-webkit-scrollbar {
              width: 6px;
            }
            nav::-webkit-scrollbar-track {
              background: transparent;
            }
            nav::-webkit-scrollbar-thumb {
              background-color: rgba(156, 163, 175, 0.3);
              border-radius: 3px;
            }
            nav::-webkit-scrollbar-thumb:hover {
              background-color: rgba(156, 163, 175, 0.5);
            }
          `}</style>

          <div className="space-y-6">
            {navigationGroups.map((group, groupIndex) => {
              // Show all items - no filtering based on selected section
              const filteredItems = group.items
              
              return (
                <div key={groupIndex}>
                  {!isCollapsed && (
                    <h3 className="text-xs font-semibold text-emerald-200/70 uppercase tracking-wider mb-3 px-3">
                      {group.title}
                    </h3>
                  )}
                  <ul className="space-y-1">
                    {filteredItems.map((item) => {
                    const isActive = isItemActive(item)
                    const isExpandedItem = expandedItems.includes(item.name)
                    const hasSubItems = item.subItems && item.subItems.length > 0

                    return (
                      <li key={item.name}>
                        {hasSubItems ? (
                          <div className="space-y-1">
                            <button
                              onClick={() => {
                                if (!isCollapsed) {
                                  toggleExpanded(item.name)
                                }
                              }}
                              className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} w-full ${isCollapsed ? 'px-2' : 'px-3'} py-2.5 rounded-lg transition-all duration-200 group ${
                                isActive
                                  ? 'bg-gradient-to-br from-slate-400 to-slate-500 text-gray-900 font-medium border border-slate-400/50 shadow-[0_6px_20px_rgba(148,163,184,0.25)]'
                                  : 'text-emerald-100/80 hover:text-white hover:bg-emerald-900/30'
                              }`}
                              title={isCollapsed ? item.name : undefined}
                            >
                              <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
                                <item.icon className={`w-5 h-5 ${isActive ? '' : 'group-hover:scale-105 transition-transform'}`} />
                                {!isCollapsed && <span className="text-sm">{item.name}</span>}
                              </div>
                              {!isCollapsed && (
                                isExpandedItem ? (
                                  <ChevronDownIcon className="w-4 h-4" />
                                ) : (
                                  <ChevronRightIcon className="w-4 h-4" />
                                )
                              )}
                            </button>

                            {isExpandedItem && !isCollapsed && (
                              <ul className="ml-3 pl-3 border-l border-emerald-950/60 space-y-1">
                                {item.subItems.map((subItem: any) => {
                                  const isSubActive = isSubItemActive(subItem)
                                  return (
                                    <li key={subItem.name}>
                                      <Link
                                        href={subItem.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={handleNavClick}
                                        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group ${
                                          isSubActive
                                            ? 'bg-gradient-to-br from-white/90 to-[#cfcfcf] text-gray-900 font-medium border border-white/30'
                                            : 'text-emerald-100/70 hover:text-white hover:bg-emerald-900/30'
                                        }`}
                                      >
                                        <subItem.icon className={`w-4 h-4 ${isSubActive ? '' : 'group-hover:scale-105 transition-transform'}`} />
                                        <span className="text-sm">{subItem.name}</span>
                                      </Link>
                                    </li>
                                  )
                                })}
                              </ul>
                            )}
                          </div>
                        ) : (
                          <Link
                            href={item.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={handleNavClick}
                            className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} ${isCollapsed ? 'px-2' : 'px-3'} py-2.5 rounded-lg transition-all duration-200 group ${
                              isActive
                                ? 'bg-gradient-to-br from-slate-400 to-slate-500 text-gray-900 font-medium border border-slate-400/50 shadow-[0_6px_20px_rgba(148,163,184,0.25)]'
                                : 'text-emerald-100/80 hover:text-white hover:bg-emerald-900/30'
                            }`}
                            title={isCollapsed ? item.name : undefined}
                          >
                            <item.icon className={`w-5 h-5 ${isActive ? '' : 'group-hover:scale-105 transition-transform'}`} />
                            {!isCollapsed && <span className="text-sm">{item.name}</span>}
                          </Link>
                        )}
                      </li>
                    )
                  })}
                </ul>
              </div>
            )
            })}
          </div>
        </nav>

        {/* Footer - Fixed (exact copy style) */}
        <div className={`${isCollapsed ? 'p-2' : 'p-4'} border-t border-gray-800/50 flex-shrink-0`}>
          <div className="space-y-1">
            <button
              onClick={handleLogout}
              className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} ${isCollapsed ? 'px-2' : 'px-3'} py-2.5 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-900/20 transition-colors w-full`}
              title={isCollapsed ? "Logout" : undefined}
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
              {!isCollapsed && <span className="text-sm font-medium">Logout</span>}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}