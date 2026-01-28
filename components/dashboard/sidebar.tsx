"use client"

import {
  House,
  ShoppingCart,
  CreditCard,
  CalendarBlank,
  Newspaper,
  ChartLineUp,
  Trophy,
  UsersThree,
  IdentificationCard,
  Wallet,
  Ticket,
  Scroll,
  Gear,
  Question,
  SignOut,
} from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const iconClass = "shrink-0"

const section1 = [
  { icon: House, label: "Dashboard", href: "/dashboard" },
  { icon: ShoppingCart, label: "Buys", href: "/dashboard/buys" },
  { icon: CreditCard, label: "Billing", href: "/dashboard/billing" },
]

const section2 = [
  { icon: CalendarBlank, label: "Economic Calendar", href: "/dashboard/calendar" },
  { icon: Newspaper, label: "News", href: "/dashboard/news" },
  { icon: ChartLineUp, label: "Trading", href: "/dashboard/trading" },
]

const section3 = [
  { icon: Trophy, label: "Achievements", href: "/dashboard/achievement" },
  { icon: UsersThree, label: "Traders", href: "/dashboard/team" },
  { icon: IdentificationCard, label: "KYC", href: "/dashboard/kyc" },
  { icon: Wallet, label: "Withdrawal", href: "/dashboard/withdrawal" },
  { icon: Ticket, label: "Coupon codes", href: "/dashboard/coupons" },
  { icon: Scroll, label: "Facts & rules", href: "/dashboard/facts-rules" },
]

const generalItems = [
  { icon: Gear, label: "Settings", href: "/dashboard/settings" },
  { icon: Question, label: "Help", href: "/dashboard/help" },
  { icon: SignOut, label: "Logout", href: "/dashboard/logout" },
]

function NavSection({
  title,
  items,
  hoveredItem,
  setHoveredItem,
  pathname,
}: {
  title: string
  items: { icon: typeof House; label: string; href: string }[]
  hoveredItem: string | null
  setHoveredItem: (v: string | null) => void
  pathname: string
}) {
  return (
    <div className="space-y-0.5">
      <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
        {title}
      </p>
      <nav className="space-y-0">
        {items.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.label}
              href={item.href}
              onMouseEnter={() => setHoveredItem(item.label)}
              onMouseLeave={() => setHoveredItem(null)}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-md px-3 py-1.5 text-[13px] font-medium transition-all duration-200",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                  : "text-muted-foreground hover:bg-muted/80 hover:text-foreground",
                hoveredItem === item.label && !isActive && "translate-x-0.5",
              )}
            >
              <item.icon className={cn(iconClass, "size-[18px]")} size={18} weight="duotone" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

export function Sidebar() {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const pathname = usePathname()

  return (
    <aside className="scrollbar-hide fixed left-0 top-0 flex h-screen w-64 flex-col overflow-y-auto border-r border-border bg-card/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/80 dark:bg-card/90 lg:block rounded-tr-2xl rounded-br-2xl">
      <div className="shrink-0 border-b border-border/60 px-4 py-4">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary shadow-md shadow-primary/20 transition-all duration-300 group-hover:scale-105 group-hover:shadow-primary/30">
            <ChartLineUp size={18} weight="duotone" className="text-primary-foreground" />
          </div>
          <span className="text-base font-bold tracking-tight text-foreground">Forex Pro</span>
        </Link>
      </div>

      <div className="flex flex-1 flex-col gap-3 px-3 py-4">
        <NavSection
          title="Overview"
          items={section1}
          hoveredItem={hoveredItem}
          setHoveredItem={setHoveredItem}
          pathname={pathname}
        />
        <NavSection
          title="Market & Trading"
          items={section2}
          hoveredItem={hoveredItem}
          setHoveredItem={setHoveredItem}
          pathname={pathname}
        />
        <NavSection
          title="Account"
          items={section3}
          hoveredItem={hoveredItem}
          setHoveredItem={setHoveredItem}
          pathname={pathname}
        />
        <NavSection
          title="General"
          items={generalItems}
          hoveredItem={hoveredItem}
          setHoveredItem={setHoveredItem}
          pathname={pathname}
        />
      </div>
    </aside>
  )
}
