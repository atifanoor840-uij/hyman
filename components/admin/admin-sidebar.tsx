"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  LayoutGrid,
  ShoppingCart,
  Users,
  ShieldCheck,
  Wallet,
  Boxes,
  Link as LinkIcon,
  Mail,
  LogOut,
  Tag,
  Percent,
  Handshake,
} from "lucide-react"

const iconClass = "shrink-0"

const sectionOverview = [{ icon: LayoutGrid, label: "Overview", href: "/admin/overview" }]

const sectionManagement = [
  { icon: ShoppingCart, label: "Orders", href: "/admin/orders" },
  { icon: Users, label: "Users", href: "/admin/users" },
  { icon: Tag, label: "Pricing", href: "/admin/pricing" },
  { icon: Percent, label: "Coupons", href: "/admin/coupons" },
  { icon: Handshake, label: "Affiliates", href: "/admin/affiliates" },
]

const sectionCompliance = [
  { icon: ShieldCheck, label: "KYC", href: "/admin/kyc" },
  { icon: Wallet, label: "Withdrawals", href: "/admin/withdrawals" },
]

const sectionTools = [
  { icon: Boxes, label: "Container", href: "/admin/container" },
  { icon: LinkIcon, label: "Payment Links", href: "/admin/payment-links" },
  { icon: Mail, label: "Email Sender", href: "/admin/email-sender" },
]

const generalItems = [{ icon: LogOut, label: "Logout", href: "/admin/logout" }]

function NavSection({
  title,
  items,
  hoveredItem,
  setHoveredItem,
  pathname,
}: {
  title: string
  items: { icon: typeof LayoutGrid; label: string; href: string }[]
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

export function AdminSidebar() {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const pathname = usePathname()

  return (
    <aside className="scrollbar-hide fixed left-0 top-0 flex h-screen w-64 flex-col overflow-y-auto border-r border-border bg-card/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/80 dark:bg-card/90 lg:block rounded-tr-2xl rounded-br-2xl">
      <div className="shrink-0 border-b border-border/60 px-4 py-4">
        <Link href="/admin/overview" className="flex items-center gap-3 group">
          <img
            src="/logo.png"
            alt="GenzProp"
            className="h-12 w-12 shrink-0 object-contain transition-transform duration-300 group-hover:scale-105"
          />
          <div className="min-w-0">
            <div className="text-lg font-bold tracking-tight text-foreground leading-tight truncate">GenzProp</div>
            <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70">
              Admin
            </div>
          </div>
        </Link>
      </div>

      <div className="flex flex-1 flex-col gap-3 px-3 py-4">
        <NavSection
          title="Overview"
          items={sectionOverview}
          hoveredItem={hoveredItem}
          setHoveredItem={setHoveredItem}
          pathname={pathname}
        />
        <NavSection
          title="Management"
          items={sectionManagement}
          hoveredItem={hoveredItem}
          setHoveredItem={setHoveredItem}
          pathname={pathname}
        />
        <NavSection
          title="Compliance"
          items={sectionCompliance}
          hoveredItem={hoveredItem}
          setHoveredItem={setHoveredItem}
          pathname={pathname}
        />
        <NavSection
          title="Tools"
          items={sectionTools}
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

