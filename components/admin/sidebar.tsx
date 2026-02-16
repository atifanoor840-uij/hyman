"use client"

import {
  LineChart,
  Users,
  ShoppingBag,
  ShieldCheck,
  Handshake,
  Ticket,
  Wallet,
  Send,
  Settings,
  LogOut,
  ChevronDown,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

const iconClass = "shrink-0"

const orderSubItems = [
  { label: "All Orders", href: "/adminportal/orders" },
  { label: "Pending Orders", href: "/adminportal/orders/pending" },
  { label: "Delivered", href: "/adminportal/orders/delivered" },
  { label: "Stage 2", href: "/adminportal/orders/stage2" },
  { label: "Instant", href: "/adminportal/orders/instant" },
  { label: "Live", href: "/adminportal/orders/live" },
  { label: "Passed", href: "/adminportal/orders/passed" },
  { label: "Crypto", href: "/adminportal/orders/crypto" },
  { label: "Card Payment", href: "/adminportal/orders/card" },
]

const mainItems = [
  { icon: LineChart, label: "Overview", href: "/adminportal" },
  { icon: Users, label: "Users", href: "/adminportal/users" },
  { icon: ShieldCheck, label: "KYC", href: "/adminportal/kyc" },
  { icon: Handshake, label: "Referral", href: "/adminportal/referral" },
  { icon: Ticket, label: "Coupon Codes", href: "/adminportal/coupons" },
  { icon: Wallet, label: "Withdrawal", href: "/adminportal/withdrawal" },
  { icon: Send, label: "Email Sender", href: "/adminportal/email" },
]

const generalItems = [
  { icon: Settings, label: "Settings", href: "/adminportal/settings" },
  { icon: LogOut, label: "Exit Admin", href: "/dashboard" },
]

function NavSection({
  title,
  items,
  hoveredItem,
  setHoveredItem,
  pathname,
}: {
  title: string
  items: { icon: typeof LineChart; label: string; href: string }[]
  hoveredItem: string | null
  setHoveredItem: (v: string | null) => void
  pathname: string
}) {
  return (
    <div className="space-y-0.5">
      <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white/60">
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
                  ? "bg-white text-black shadow-sm"
                  : "text-white/70 hover:bg-white/10 hover:text-white",
                hoveredItem === item.label && !isActive && "translate-x-0.5",
              )}
            >
              <item.icon className={cn(iconClass, "h-[18px] w-[18px]")} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

export function AdminSidebar() {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const pathname = usePathname()
  const ordersOpen = pathname.startsWith("/adminportal/orders")
  const [ordersExpanded, setOrdersExpanded] = useState(ordersOpen)
  const isOrdersOpen = ordersExpanded !== false || ordersOpen

  return (
    <aside className="scrollbar-hide fixed left-0 top-0 flex h-screen w-64 flex-col overflow-y-auto border-r border-white/10 bg-black shadow-sm lg:block rounded-tr-2xl rounded-br-2xl">
      <div className="shrink-0 border-b border-white/10 px-4 py-4">
        <Link href="/adminportal" className="flex items-center gap-2.5 group">
          <img
            src="https://res.cloudinary.com/dqzibxdtn/image/upload/v1769659705/ChatGPT_Image_Jan_28_2026_08_06_49_PM_moryyr.png"
            alt="FxGenz"
            className="h-9 w-9 shrink-0 object-contain rounded-lg transition-all duration-300 group-hover:scale-105"
          />
          <div className="flex flex-col min-w-0">
            <span className="text-base font-bold tracking-tight text-white">FxGenz</span>
            <span className="text-[10px] font-medium uppercase tracking-wider text-white/50">Admin</span>
          </div>
        </Link>
      </div>

      <div className="flex flex-1 flex-col gap-3 px-3 py-4">
        <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-white/50">
          Management
        </p>
        <nav className="space-y-0">
          <Link
            href="/adminportal"
            onMouseEnter={() => setHoveredItem("Overview")}
            onMouseLeave={() => setHoveredItem(null)}
            className={cn(
              "flex w-full items-center gap-2.5 rounded-md px-3 py-1.5 text-[13px] font-medium transition-all duration-200",
              pathname === "/adminportal"
                ? "bg-white text-black shadow-sm"
                : "text-white/70 hover:bg-white/10 hover:text-white",
              hoveredItem === "Overview" && pathname !== "/adminportal" && "translate-x-0.5",
            )}
          >
            <LineChart className={cn(iconClass, "h-[18px] w-[18px]")} />
            <span>Overview</span>
          </Link>
          <Link
            href="/adminportal/users"
            onMouseEnter={() => setHoveredItem("Users")}
            onMouseLeave={() => setHoveredItem(null)}
            className={cn(
              "flex w-full items-center gap-2.5 rounded-md px-3 py-1.5 text-[13px] font-medium transition-all duration-200",
              pathname === "/adminportal/users"
                ? "bg-white text-black shadow-sm"
                : "text-white/70 hover:bg-white/10 hover:text-white",
              hoveredItem === "Users" && pathname !== "/adminportal/users" && "translate-x-0.5",
            )}
          >
            <Users className={cn(iconClass, "h-[18px] w-[18px]")} />
            <span>Users</span>
          </Link>

          <Collapsible
            open={isOrdersOpen}
            onOpenChange={setOrdersExpanded}
            className="space-y-0"
          >
            <CollapsibleTrigger
              onMouseEnter={() => setHoveredItem("Orders")}
              onMouseLeave={() => setHoveredItem(null)}
              className={cn(
                "group/orders flex w-full items-center gap-2.5 rounded-md px-3 py-1.5 text-[13px] font-medium transition-all duration-200 text-left",
                pathname.startsWith("/adminportal/orders")
                  ? "bg-white/10 text-white"
                  : "text-white/70 hover:bg-white/10 hover:text-white",
                hoveredItem === "Orders" && !pathname.startsWith("/adminportal/orders") && "translate-x-0.5",
              )}
            >
              <ShoppingBag className={cn(iconClass, "h-[18px] w-[18px]")} />
              <span>Orders</span>
              <ChevronDown
                className={cn("ml-auto h-4 w-4 shrink-0 transition-transform", isOrdersOpen && "rotate-180")}
              />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="ml-6 mt-0.5 mb-1 space-y-0 border-l border-white/20 pl-2">
                {orderSubItems.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-[12px] font-medium transition-all duration-200",
                        isActive
                          ? "bg-white text-black shadow-sm"
                          : "text-white/60 hover:bg-white/10 hover:text-white",
                      )}
                    >
                      <span>{item.label}</span>
                    </Link>
                  )
                })}
              </div>
            </CollapsibleContent>
          </Collapsible>

          {mainItems.slice(2).map((item) => {
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
                    ? "bg-white text-black shadow-sm"
                    : "text-white/70 hover:bg-white/10 hover:text-white",
                  hoveredItem === item.label && !isActive && "translate-x-0.5",
                )}
              >
                <item.icon className={cn(iconClass, "h-[18px] w-[18px]")} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

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
