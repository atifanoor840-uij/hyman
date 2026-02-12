"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  HomeIcon,
  UserIcon,
  CurrencyDollarIcon,
  UsersIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  ChartBarIcon,
  PresentationChartLineIcon
} from "@heroicons/react/24/outline"

const navigationGroups = [
  {
    title: "Overview",
    items: [
      { name: "Partner Dashboard", href: "/partners/dashboard", icon: HomeIcon },
    ]
  },
  {
    title: "Performance",
    items: [
      { name: "Analytics", href: "/partners/dashboard/analytics", icon: ChartBarIcon },
      { name: "Reports", href: "/partners/dashboard/reports", icon: PresentationChartLineIcon },
    ]
  },
  {
    title: "Account",
    items: [
      { name: "Profile", href: "/partners/dashboard/profile", icon: UserIcon },
      { name: "Payouts", href: "/partners/dashboard/payouts", icon: CurrencyDollarIcon },
      { name: "Referrals", href: "/partners/dashboard/referrals", icon: UsersIcon },
    ]
  }
]

export default function PartnerSidebar() {
  const pathname = usePathname()

  return (
    <div className="h-full flex">
      <div className="w-64 bg-gray-900/80 backdrop-blur-sm border-r border-gray-800/50">
        <div className="flex flex-col h-full">
          <nav className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-6">
              {navigationGroups.map((group, groupIndex) => (
                <div key={groupIndex}>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">
                    {group.title}
                  </h3>
                  <ul className="space-y-1">
                    {group.items.map((item) => {
                      const isActive = pathname === item.href
                      return (
                        <li key={item.name}>
                          <Link
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                              isActive
                                ? 'bg-indigo-400 text-black font-medium'
                                : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                            }`}
                          >
                            <item.icon className={`w-5 h-5 ${isActive ? '' : 'group-hover:scale-105 transition-transform'}`} />
                            <span className="text-sm">{item.name}</span>
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </nav>

          <div className="p-4 border-t border-gray-800/50">
            <div className="space-y-1">
              <Link
                href="/partners/dashboard/settings"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800/50 transition-colors"
              >
                <Cog6ToothIcon className="w-5 h-5" />
                <span className="text-sm font-medium">Settings</span>
              </Link>
              <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-900/20 transition-colors w-full">
                <ArrowRightOnRectangleIcon className="w-5 h-5" />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}



