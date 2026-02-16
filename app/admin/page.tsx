"use client"

import Link from "next/link"
import {
  UsersIcon,
  ClipboardDocumentListIcon,
  ArchiveBoxIcon,
  EnvelopeIcon,
  BanknotesIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline"

const cards = [
  { title: "Users", href: "/admin/users", icon: UsersIcon, description: "Manage user accounts and profiles", color: "blue" },
  { title: "Orders", href: "/admin/orders", icon: ClipboardDocumentListIcon, description: "View and manage all orders", color: "emerald" },
  { title: "Container", href: "/admin/container", icon: ArchiveBoxIcon, description: "Account credentials & containers", color: "violet" },
  { title: "Email Sender", href: "/admin/email-sender", icon: EnvelopeIcon, description: "Send bulk or single emails", color: "amber" },
  { title: "Withdrawal Requests", href: "/admin/withdrawal", icon: BanknotesIcon, description: "Review and process withdrawals", color: "rose" },
  { title: "KYC", href: "/admin/kyc", icon: ShieldCheckIcon, description: "KYC submissions and verification", color: "cyan" },
]

const colorClasses: Record<string, string> = {
  blue: "bg-blue-500/10 text-blue-600 border-blue-200 group-hover:bg-blue-500/15 group-hover:border-blue-300",
  emerald: "bg-emerald-500/10 text-emerald-600 border-emerald-200 group-hover:bg-emerald-500/15 group-hover:border-emerald-300",
  violet: "bg-violet-500/10 text-violet-600 border-violet-200 group-hover:bg-violet-500/15 group-hover:border-violet-300",
  amber: "bg-amber-500/10 text-amber-600 border-amber-200 group-hover:bg-amber-500/15 group-hover:border-amber-300",
  rose: "bg-rose-500/10 text-rose-600 border-rose-200 group-hover:bg-rose-500/15 group-hover:border-rose-300",
  cyan: "bg-cyan-500/10 text-cyan-600 border-cyan-200 group-hover:bg-cyan-500/15 group-hover:border-cyan-300",
}

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900 tracking-tight">Overview</h1>
        <p className="mt-1 text-sm text-neutral-500">Manage users, orders, withdrawals, and KYC from one place.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {cards.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group flex items-start gap-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md hover:border-neutral-300"
          >
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${colorClasses[item.color]}`}>
              <item.icon className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="font-semibold text-neutral-900 group-hover:text-neutral-700 transition-colors">{item.title}</h2>
              <p className="mt-0.5 text-sm text-neutral-500">{item.description}</p>
              <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-neutral-500 group-hover:text-neutral-700">
                Open <ArrowRightIcon className="h-3.5 w-3.5" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
