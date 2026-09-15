"use client"

import Link from "next/link"
import {
  LayoutGrid,
  BarChart3,
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
  ArrowRight,
} from "lucide-react"
import { AppSidebar, type NavGroup } from "@/components/workspace/app-sidebar"

const groups: NavGroup[] = [
  {
    title: "Workspace",
    items: [
      { icon: LayoutGrid, label: "Overview", href: "/dashboard/overview" },
      { icon: BarChart3, label: "Trading dashboard", href: "/dashboard" },
      { icon: ShoppingCart, label: "Buy Challenge", href: "/buy-challenge" },
      { icon: CreditCard, label: "Billing", href: "/dashboard/billing" },
    ],
  },
  {
    title: "Account",
    items: [
      { icon: Trophy, label: "Achievements", href: "/dashboard/achievement" },
      { icon: ShieldCheck, label: "KYC", href: "/dashboard/kyc" },
      { icon: Wallet, label: "Withdrawal", href: "/dashboard/withdrawal" },
      { icon: Ticket, label: "Coupon codes", href: "/dashboard/coupons" },
      { icon: ScrollText, label: "Rules", href: "/dashboard/facts-rules" },
    ],
  },
  {
    title: "Market & Trading",
    items: [
      { icon: Calendar, label: "Economic Calendar", href: "/dashboard/calendar" },
      { icon: Newspaper, label: "News", href: "/dashboard/news" },
      { icon: LineChart, label: "Trading", href: "/dashboard/trading" },
      { icon: Download, label: "Downloads", href: "/dashboard/download" },
    ],
  },
]

export function Sidebar() {
  return (
    <AppSidebar
      homeHref="/dashboard"
      subtitle="Trader"
      groups={groups}
      footer={
        <div className="space-y-2">
          <div className="rounded-xl bg-gradient-to-br from-[#5235ff] to-[#7c3aed] p-4 text-white">
            <p className="text-sm font-semibold">Scale your capital</p>
            <p className="mt-1 text-xs text-white/75">Start a new evaluation in minutes.</p>
            <Link
              href="/buy-challenge"
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-[#3b24d9] transition hover:bg-white/90"
            >
              New challenge <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <Link
            href="/dashboard/logout"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-[13.5px] font-medium text-slate-400 transition-colors hover:bg-white/[0.04] hover:text-white"
          >
            <LogOut className="h-[18px] w-[18px]" strokeWidth={1.9} />
            Log out
          </Link>
        </div>
      }
    />
  )
}
