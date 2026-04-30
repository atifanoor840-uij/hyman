"use client"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { getAuthHeaders } from "@/lib/api"
import { 
  HomeIcon,
  ChartBarIcon,
  UserIcon,
  CurrencyDollarIcon,
  GiftIcon,
  StarIcon,
  UsersIcon,
  ArrowRightOnRectangleIcon,
  CreditCardIcon,
  CalendarDaysIcon,
  ChartBarSquareIcon,
  ShieldCheckIcon,
  ChatBubbleLeftRightIcon,
  PresentationChartLineIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline"

const WITHDRAWAL_ELIGIBLE_URL = "https://genz-34f298f57a04.herokuapp.com/withdrawal/my-eligible"

const navigationGroups = [
  {
    title: "Overview",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: HomeIcon },
    ]
  },
  {
    title: "Account",
    items: [
      { name: "Profile", href: "/dashboard/profile", icon: UserIcon },
      { name: "KYC Verification", href: "/dashboard/kyc", icon: ShieldCheckIcon },
      { name: "Billing History", href: "/dashboard/billing-history", icon: CreditCardIcon },
      { name: "Reset Account", href: "/dashboard/reset-account", icon: ArrowPathIcon },
      { name: "Withdraw", href: "/withdraw", icon: CurrencyDollarIcon },
    ]
  },
  {
    title: "Market & Trading",
    items: [
      { name: "Place Order", href: "/dashboard/place-order", icon: ChartBarIcon },
      { name: "Stats", href: "/dashboard/stats", icon: PresentationChartLineIcon },
      { name: "Economic Calendar", href: "/dashboard/economic-calendar", icon: CalendarDaysIcon },
      { name: "Heat Map", href: "/dashboard/heatmap", icon: ChartBarSquareIcon },
    ]
  },
  {
    title: "Dragon Club",
    items: [
      { name: "Lucky Draw", href: "/dashboard/lucky-draw", icon: GiftIcon },
      { name: "Loyalty Program", href: "/dashboard/loyalty-program", icon: StarIcon },
      { name: "Referral", href: "/dashboard/referral", icon: UsersIcon },
    ]
  },
  {
    title: "Support",
    items: [
      { name: "Live Chat", href: "/dashboard/live-chat", icon: ChatBubbleLeftRightIcon },
    ]
  }
]

interface DashboardSidebarProps {
  onClose?: () => void
}

export default function DashboardSidebar({ onClose }: DashboardSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [withdrawEligible, setWithdrawEligible] = useState<boolean>(false)
  const [isCheckingEligibility, setIsCheckingEligibility] = useState(true)
  const [eligibilityData, setEligibilityData] = useState<any>(null)

  const checkEligibility = async () => {
    console.log('🔍 Starting withdrawal eligibility check...')
    setIsCheckingEligibility(true)
    
    try {
      const response = await fetch(WITHDRAWAL_ELIGIBLE_URL, { method: "GET", headers: getAuthHeaders() })
      
      console.log('📡 Eligibility API Response Status:', response.status)
      
      if (!response.ok) {
        console.warn('⚠️ Eligibility check failed with status:', response.status)
        setWithdrawEligible(false)
        setIsCheckingEligibility(false)
        return
      }
      
      const data = await response.json()
      console.log('💰 Withdrawal Eligibility Check - Full Response:', JSON.stringify(data, null, 2))
      
      const isEligible = data?.is_eligible === true
      
      console.log('💰 Raw is_eligible value:', data?.is_eligible)
      console.log('💰 Computed isEligible:', isEligible)
      
      // Force state update
      setEligibilityData(data)
      setWithdrawEligible(isEligible)
      setIsCheckingEligibility(false)
      
      // Verify state update after a tick
      setTimeout(() => {
        console.log('💰 State after update - withdrawEligible:', isEligible)
        console.log('💰 Withdraw Button Status:', isEligible ? '✅ UNLOCKED - User CAN withdraw' : '🔒 LOCKED - User CANNOT withdraw')
      }, 100)
      
      if (!isEligible && data?.reason) {
        console.log('📋 Lock Reason:', data.reason)
      }
    } catch (error) {
      console.error('❌ Error checking withdrawal eligibility:', error)
      setWithdrawEligible(false)
      setIsCheckingEligibility(false)
    }
  }
  
  useEffect(() => {
    // Initial check
    checkEligibility()
    
    // Listen for KYC status changes and re-check eligibility
    const handleKycStatusChange = () => {
      console.log('🔄 KYC Status changed, rechecking withdrawal eligibility...')
      checkEligibility()
    }
    
    if (typeof window !== 'undefined') {
      window.addEventListener('kycStatusChanged', handleKycStatusChange)
      // Expose function for manual refresh in console
      ;(window as any).refreshWithdrawEligibility = checkEligibility
      console.log('ℹ️ You can manually refresh withdrawal eligibility by running: window.refreshWithdrawEligibility()')
    }
    
    return () => { 
      if (typeof window !== 'undefined') {
        window.removeEventListener('kycStatusChanged', handleKycStatusChange)
        delete (window as any).refreshWithdrawEligibility
      }
    }
  }, [])

  const handleNavClick = () => {
    // Close sidebar on mobile when navigating
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      onClose?.()
    }
  }

  const handleLogout = () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token')
        localStorage.removeItem('post_login_redirect')
        router.push('/login')
      }
    } catch (error) {
      console.error('Error during logout:', error)
      router.push('/login')
    }
  }

  return (
    <div className="h-full flex">
      {/* Sidebar */}
      <div className="w-64 bg-gradient-to-b from-[#06140f] via-[#0b241a] to-[#06140f] border-r border-emerald-950/60 h-full flex flex-col overflow-hidden">
        {/* Mobile Close Button */}
        <div className="md:hidden flex justify-end p-4 border-b border-gray-800/50 flex-shrink-0">
          <button
            onClick={onClose}
            className="p-2 text-gray-300 hover:text-white transition-colors rounded-lg hover:bg-gray-800/50"
            aria-label="Close sidebar"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Logo - Fixed */}
        <div className="px-4 py-4 border-b border-gray-800/50 flex-shrink-0">
          <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <img 
              src="https://res.cloudinary.com/dufcjjaav/image/upload/v1760892554/dragon_funded_logo-01-01-01_bkaqko.png" 
              alt="Dragon Funded" 
              className="h-8 w-8 rounded-lg object-cover" 
            />
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-bold text-white">DRAGON</span>
              <span className="text-sm font-bold text-[#DEBF74]">FUNDED</span>
            </div>
          </Link>
        </div>
        
        {/* Navigation - Scrollable */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden p-4" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(156, 163, 175, 0.3) transparent' }}>
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
            {navigationGroups.map((group, groupIndex) => (
              <div key={groupIndex}>
                <h3 className="text-xs font-semibold text-emerald-200/70 uppercase tracking-wider mb-3 px-3">
                  {group.title}
                </h3>
                <ul className="space-y-1">
                  {group.items.map((item) => {
                    const isActive = pathname === item.href
                    const isWithdrawItem = item.name === "Withdraw"
                    
                    // Debug logging for withdraw item
                    if (isWithdrawItem) {
                      console.log('🎯 Rendering Withdraw Button:', {
                        withdrawEligible,
                        isCheckingEligibility,
                        eligibilityData,
                        shouldShowChecking: isCheckingEligibility,
                        shouldShowLocked: !isCheckingEligibility && !withdrawEligible,
                        shouldShowUnlocked: !isCheckingEligibility && withdrawEligible
                      })
                    }
                    
                    return (
                      <li key={item.name}>
                        {isWithdrawItem && isCheckingEligibility ? (
                          <div
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 cursor-wait ${
                              isActive
                                ? 'bg-gradient-to-br from-white/90 to-[#cfcfcf] text-gray-900 font-medium opacity-60 border border-white/30'
                                : 'text-emerald-200/60 bg-emerald-950/30 opacity-60'
                            }`}
                          >
                            <item.icon className="w-5 h-5" />
                            <span className="text-sm">{item.name}</span>
                            <span className="ml-auto inline-flex items-center rounded-md bg-purple-400 px-2 py-0.5 text-xs font-medium text-gray-900">
                              Checking...
                            </span>
                          </div>
                        ) : isWithdrawItem && !isCheckingEligibility && withdrawEligible === true ? (
                          <Link
                            href={item.href}
                            onClick={(e) => {
                              console.log('🖱️ Withdraw button clicked! Navigating to:', item.href)
                              console.log('🖱️ Current withdrawEligible state:', withdrawEligible)
                              handleNavClick()
                            }}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group cursor-pointer ${
                              isActive
                                ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white font-medium border border-emerald-400/50 shadow-[0_6px_20px_rgba(16,185,129,0.25)]'
                                : 'text-emerald-100/80 hover:text-white hover:bg-emerald-900/50'
                            }`}
                          >
                            <item.icon className={`w-5 h-5 ${isActive ? '' : 'group-hover:scale-105 transition-transform'}`} />
                            <span className="text-sm font-medium">{item.name}</span>
                            <span className="ml-auto inline-flex items-center rounded-md bg-emerald-400 px-2 py-0.5 text-xs font-bold text-gray-900 shadow-sm">
                              ✓ Unlocked
                            </span>
                          </Link>
                        ) : isWithdrawItem && !isCheckingEligibility && withdrawEligible === false ? (
                          <div
                            aria-disabled
                            title="Withdrawals are locked. You must complete KYC verification and meet eligibility requirements."
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 cursor-not-allowed ${
                              isActive
                                ? 'bg-gradient-to-br from-white/90 to-[#cfcfcf] text-gray-900 font-medium opacity-60 border border-white/30'
                                : 'text-emerald-200/60 bg-emerald-950/30 opacity-60'
                            }`}
                          >
                            <item.icon className="w-5 h-5" />
                            <span className="text-sm">{item.name}</span>
                            <span className="ml-auto inline-flex items-center rounded-md bg-amber-400 px-2 py-0.5 text-xs font-medium text-gray-900">
                              Locked
                            </span>
                          </div>
                        ) : (
                          <Link
                            href={item.href}
                            onClick={handleNavClick}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                              isActive
                                ? 'bg-gradient-to-br from-slate-400 to-slate-500 text-gray-900 font-medium border border-slate-400/50 shadow-[0_6px_20px_rgba(148,163,184,0.25)]'
                                : 'text-emerald-100/80 hover:text-white hover:bg-emerald-900/30'
                            }`}
                          >
                            <item.icon className={`w-5 h-5 ${isActive ? '' : 'group-hover:scale-105 transition-transform'}`} />
                            <span className="text-sm">{item.name}</span>
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

        {/* Footer - Fixed */}
        <div className="p-4 border-t border-gray-800/50 flex-shrink-0">
          <div className="space-y-1">
            <button 
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-900/20 transition-colors w-full"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

