"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { Shield, Bell, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export function AdminTopbar({
  title,
  description,
  actions,
}: {
  title: string
  description?: string
  actions?: ReactNode
}) {
  return (
    <header className="space-y-3 md:space-y-4 animate-slide-in-up w-full min-w-0">
      <div className="relative -mx-3 -mt-3 overflow-hidden border-b border-border bg-muted/50 py-2.5 md:-mx-4 md:-mt-4 lg:-mx-5 lg:-mt-5">
        <div className="flex w-max animate-ticker whitespace-nowrap text-xs sm:text-sm font-semibold text-muted-foreground">
          <span>{"Admin console • Monitor orders • Review compliance • Ship faster • ".repeat(6)}</span>
          <span aria-hidden="true">{"Admin console • Monitor orders • Review compliance • Ship faster • ".repeat(6)}</span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 min-w-0">
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-border/70 bg-muted/40">
              <Shield className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground tracking-tight truncate">
                {title}
              </h1>
              {description ? (
                <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">{description}</p>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
          {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}

          <div className="flex items-center gap-2">
            <div className="relative hidden md:block">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search…"
                className="h-9 w-56 rounded-2xl bg-card border-border/70 pl-9"
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="relative hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-all duration-300 h-11 w-11 sm:h-9 sm:w-9 rounded-xl"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-destructive rounded-full animate-pulse" />
            </Button>
            <Link href="/dashboard/profile" className="flex items-center gap-2 rounded-2xl border border-border/70 bg-card/70 px-2.5 py-2 hover:bg-card transition-colors">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="text-[10px] font-bold">AD</AvatarFallback>
              </Avatar>
              <span className="hidden sm:inline text-xs font-semibold text-foreground">Admin</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}

