"use client"

import { Search, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { AdminMobileNav } from "./mobile-nav"
import type { ReactNode } from "react"

interface AdminHeaderProps {
  title?: string
  description?: string
  actions?: ReactNode
}

export function AdminHeader({ title, description, actions }: AdminHeaderProps) {
  return (
    <header className="space-y-3 md:space-y-4 animate-slide-in-up">
      <div className="relative -mx-3 -mt-3 overflow-hidden border-b border-border bg-primary py-2 md:-mx-4 md:-mt-4 lg:-mx-5 lg:-mt-5">
        <div className="flex w-max animate-ticker whitespace-nowrap text-xs font-semibold text-primary-foreground">
          <span>Admin Portal — GenzProp • Manage users, orders, KYC, referrals • </span>
          <span aria-hidden="true">Admin Portal — GenzProp • Manage users, orders, KYC, referrals • </span>
        </div>
      </div>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1">
          <AdminMobileNav />
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search users, orders..."
              className="pl-9 pr-3 h-9 text-sm bg-card border-border"
            />
          </div>
        </div>
        <div className="flex items-center gap-1.5 md:gap-2">
          <Button variant="ghost" size="icon" className="relative h-8 w-8">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-destructive rounded-full animate-pulse" />
          </Button>
          <div className="flex items-center gap-2 pl-2 border-l border-border">
            <Avatar className="w-8 h-8 ring-2 ring-primary/20">
              <AvatarFallback className="text-xs bg-primary text-primary-foreground">AD</AvatarFallback>
            </Avatar>
            <div className="text-xs hidden sm:block">
              <p className="font-bold text-foreground">Admin</p>
              <p className="text-muted-foreground text-[10px] font-medium">admin@GenzProp.com</p>
            </div>
          </div>
        </div>
      </div>
      {title != null && (
        <div className="rounded-lg border border-border bg-muted/20 px-4 py-3 md:px-5 md:py-4">
          <h1 className="text-xl md:text-2xl font-extrabold text-foreground tracking-tight mb-1.5">{title}</h1>
          {description != null && (
            <p className="text-sm md:text-base text-muted-foreground font-medium">{description}</p>
          )}
        </div>
      )}
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  )
}
