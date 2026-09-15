"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

export type NavItem = { icon: LucideIcon; label: string; href: string }
export type NavGroup = { title: string; items: NavItem[] }

/**
 * Navy workspace sidebar shared by the trader dashboard and the admin console.
 * Colors are literal (not theme tokens) so it renders the same inside the mobile Sheet portal.
 */
export function AppSidebar({
  homeHref,
  subtitle,
  groups,
  footer,
}: {
  homeHref: string
  subtitle: string
  groups: NavGroup[]
  footer?: ReactNode
}) {
  const pathname = usePathname()

  return (
    <aside className="scrollbar-hide fixed left-0 top-0 z-30 flex h-screen w-64 flex-col overflow-y-auto border-r border-white/[0.06] bg-[#0b1020] text-slate-300">
      {/* soft brand glow */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-[radial-gradient(60%_100%_at_20%_0%,rgba(82,53,255,0.28),transparent_70%)]" />

      <div className="relative shrink-0 px-5 pb-5 pt-6">
        <Link href={homeHref} className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.06] ring-1 ring-white/10">
            <img src="/logo.png" alt="" className="h-7 w-7 object-contain" />
          </span>
          <span className="min-w-0 leading-tight">
            <span className="block text-base font-semibold tracking-tight text-white">GenzProp</span>
            <span className="block text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">{subtitle}</span>
          </span>
        </Link>
      </div>

      <nav className="relative flex flex-1 flex-col gap-6 px-3 pb-4">
        {groups.map((group) => (
          <div key={group.title}>
            <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">{group.title}</p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = pathname === item.href || (item.href !== homeHref && pathname.startsWith(item.href + "/"))
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-[13.5px] font-medium transition-colors",
                        active ? "bg-white/[0.08] text-white" : "text-slate-400 hover:bg-white/[0.04] hover:text-white",
                      )}
                    >
                      {active && <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-[#7c6bff]" />}
                      <item.icon
                        className={cn("h-[18px] w-[18px] shrink-0", active ? "text-[#a89bff]" : "text-slate-500 group-hover:text-slate-300")}
                        strokeWidth={1.9}
                      />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      {footer && <div className="relative shrink-0 border-t border-white/[0.06] p-3">{footer}</div>}
    </aside>
  )
}
