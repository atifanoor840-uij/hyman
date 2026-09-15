"use client"

import { useEffect, useState, type ReactNode } from "react"
import { Bell, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MobileNav } from "@/components/dashboard/mobile-nav"
import { AdminSidebar } from "./admin-sidebar"

export function AdminTopbar({
  title,
  description,
  actions,
}: {
  title: string
  description?: string
  actions?: ReactNode
}) {
  // Rendered after mount so server and client timezones can’t cause a hydration mismatch
  const [today, setToday] = useState("")
  useEffect(() => {
    setToday(new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }))
  }, [])

  return (
    <header className="w-full min-w-0 space-y-5">
      {/* Utility bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <MobileNav sidebar={<AdminSidebar />} />
          <div className="relative hidden md:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search users, orders…" className="h-10 w-72 rounded-xl border-border bg-card pl-9 text-sm shadow-none" />
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="hidden items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-xs font-medium text-muted-foreground sm:inline-flex">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">AD</span>
            Administrator
          </span>
          <Button variant="outline" size="icon" className="relative h-10 w-10 rounded-xl border-border bg-card text-muted-foreground hover:text-foreground" aria-label="Notifications">
            <Bell className="h-4 w-4" />
            <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-primary ring-2 ring-card" />
          </Button>
        </div>
      </div>

      {/* Page title */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <p className="mb-1.5 h-4 text-xs font-semibold uppercase tracking-[0.16em] text-primary">{today}</p>
          <h1 className="truncate text-2xl font-semibold tracking-tight text-foreground md:text-[28px]">{title}</h1>
          {description ? <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2 md:justify-end">{actions}</div> : null}
      </div>
    </header>
  )
}
