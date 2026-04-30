"use client"

import {
  Home,
  LayoutGrid,
  ShoppingCart,
  CreditCard,
  Calendar,
  Newspaper,
  LineChart,
  Download,
  Trophy,
  ShieldCheck,
  Wallet,
  Ticket,
  ScrollText,
  LogOut,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"

const iconClass = "shrink-0"

const section1 = [
  { icon: LayoutGrid, label: "Overview", href: "/dashboard/overview" },
  { icon: ShoppingCart, label: "Buys", href: "/dashboard/buys" },
  { icon: CreditCard, label: "Billing", href: "/dashboard/billing" },
]

const section2 = [
  { icon: Calendar, label: "Economic Calendar", href: "/dashboard/calendar" },
  { icon: Newspaper, label: "News", href: "/dashboard/news" },
  { icon: LineChart, label: "Trading", href: "/dashboard/trading" },
  { icon: Download, label: "Downloads", href: "/dashboard/download" },
]

const section3 = [
  { icon: Trophy, label: "Achievements", href: "/dashboard/achievement" },
  { icon: ShieldCheck, label: "KYC", href: "/dashboard/kyc" },
  { icon: Wallet, label: "Withdrawal", href: "/dashboard/withdrawal" },
  { icon: Ticket, label: "Coupon codes", href: "/dashboard/coupons" },
  { icon: ScrollText, label: "Rules", href: "/dashboard/facts-rules" },
]

const generalItems = [
  { icon: LogOut, label: "Logout", href: "/dashboard/logout" },
]

function NavSection({
  title,
  items,
  hoveredItem,
  setHoveredItem,
  pathname,
}: {
  title: string
  items: { icon: typeof Home; label: string; href: string }[]
  hoveredItem: string | null
  setHoveredItem: (v: string | null) => void
  pathname: string
}) {
  return (
    <div className="space-y-0.5">
      <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
        {title}
      </p>
      <nav className="space-y-1">
        {items.map((item) => {
          const isActive = pathname === item.href
          return (
            <Button
              key={item.label}
              variant="ghost"
              size="sm"
              asChild
              className={cn(
                "flex w-full items-center justify-start gap-2.5 rounded-lg px-3 py-2.5 text-sm font-bold transition-all duration-200 h-auto border border-transparent",
                isActive
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/25 border-primary/20 hover:bg-primary/90 hover:text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted/90 hover:text-foreground hover:border-border/50 hover:shadow-sm",
                hoveredItem === item.label && !isActive && "translate-x-0.5",
              )}
            >
              <Link
                href={item.href}
                onMouseEnter={() => setHoveredItem(item.label)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <item.icon className={cn(iconClass, "h-[18px] w-[18px]")} />
                <span className="font-bold">{item.label}</span>
              </Link>
            </Button>
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
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <img
            src="/logo.png"
            alt="GenzProp"
            className="h-12 w-12 shrink-0 object-contain transition-transform duration-300 group-hover:scale-105"
          />
          <span className="text-lg font-bold tracking-tight text-foreground">GenzProp</span>
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
          title="Account"
          items={section3}
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
