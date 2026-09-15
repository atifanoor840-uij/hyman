"use client"

import Link from "next/link"
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
import { AppSidebar, type NavGroup } from "@/components/workspace/app-sidebar"

const groups: NavGroup[] = [
  { title: "Overview", items: [{ icon: LayoutGrid, label: "Overview", href: "/admin/overview" }] },
  {
    title: "Management",
    items: [
      { icon: ShoppingCart, label: "Orders", href: "/admin/orders" },
      { icon: Users, label: "Users", href: "/admin/users" },
      { icon: Tag, label: "Pricing", href: "/admin/pricing" },
      { icon: Percent, label: "Coupons", href: "/admin/coupons" },
      { icon: Handshake, label: "Affiliates", href: "/admin/affiliates" },
    ],
  },
  {
    title: "Compliance",
    items: [
      { icon: ShieldCheck, label: "KYC", href: "/admin/kyc" },
      { icon: Wallet, label: "Withdrawals", href: "/admin/withdrawals" },
    ],
  },
  {
    title: "Tools",
    items: [
      { icon: Boxes, label: "Container", href: "/admin/container" },
      { icon: LinkIcon, label: "Payment Links", href: "/admin/payment-links" },
      { icon: Mail, label: "Email Sender", href: "/admin/email-sender" },
    ],
  },
]

export function AdminSidebar() {
  return (
    <AppSidebar
      homeHref="/admin/overview"
      subtitle="Admin console"
      groups={groups}
      footer={
        <div className="space-y-1">
          <div className="flex items-center gap-3 rounded-xl bg-white/[0.04] px-3 py-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#5235ff] text-[11px] font-bold text-white">AD</span>
            <span className="min-w-0 leading-tight">
              <span className="block truncate text-sm font-semibold text-white">Administrator</span>
              <span className="block text-[11px] text-slate-400">Full access</span>
            </span>
          </div>
          <Link
            href="/admin/logout"
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
