"use client"

import { AdminSidebar } from "@/components/admin/sidebar"
import { AdminHeader } from "@/components/admin/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Users,
  ShoppingBag,
  IdentificationCard,
  Handshake,
  Ticket,
  Wallet,
  PaperPlaneTilt,
  ArrowUpRight,
} from "@phosphor-icons/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const stats = [
  {
    title: "Total Users",
    value: "12,847",
    change: "+12%",
    href: "/adminportal/users",
    icon: Users,
    delay: "0ms",
  },
  {
    title: "Orders",
    value: "3,421",
    change: "+8%",
    href: "/adminportal/orders",
    icon: ShoppingBag,
    delay: "100ms",
  },
  {
    title: "KYC Pending",
    value: "89",
    change: "Review",
    href: "/adminportal/kyc",
    icon: IdentificationCard,
    delay: "200ms",
  },
  {
    title: "Referrals",
    value: "2,156",
    change: "+24%",
    href: "/adminportal/referral",
    icon: Handshake,
    delay: "300ms",
  },
  {
    title: "Coupon Codes",
    value: "156",
    change: "Active",
    href: "/adminportal/coupons",
    icon: Ticket,
    delay: "400ms",
  },
  {
    title: "Withdrawals",
    value: "47",
    change: "Pending",
    href: "/adminportal/withdrawal",
    icon: Wallet,
    delay: "500ms",
  },
]

export default function AdminPortalPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden lg:block">
        <AdminSidebar />
      </div>

      <main className="min-w-0 flex-1 flex flex-col overflow-x-hidden p-3 md:p-4 lg:p-5 lg:ml-64">
        <div className="mx-auto w-full max-w-[1400px] flex flex-col flex-1">
          <AdminHeader
            title="Admin Overview"
            description="Monitor platform metrics, users, orders, KYC, referrals, coupons, and withdrawals."
            actions={
              <Button asChild variant="outline" size="sm" className="gap-2">
                <Link href="/adminportal/email">
                  <PaperPlaneTilt size={16} weight="duotone" />
                  Send Email
                </Link>
              </Button>
            }
          />

          <div className="mt-4 md:mt-5 space-y-4 flex-1 min-w-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {stats.map((stat, index) => (
                <Card
                  key={stat.title}
                  style={{ animationDelay: stat.delay }}
                  className="rounded-xl border-2 border-border bg-card shadow-sm animate-slide-in-up hover:shadow-lg hover:border-primary/20 transition-all"
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
                        {stat.title}
                      </CardTitle>
                      <stat.icon size={20} weight="duotone" className="text-primary/70" />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-end justify-between">
                      <p className="text-2xl font-extrabold text-foreground tracking-tight">{stat.value}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-muted-foreground bg-muted/60 px-2 py-0.5 rounded">{stat.change}</span>
                        <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                          <Link href={stat.href}>
                            <ArrowUpRight size={16} className="text-primary" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="rounded-xl border-2 border-border bg-card shadow-sm animate-slide-in-up" style={{ animationDelay: "600ms" }}>
              <CardHeader className="border-b border-border bg-muted/20">
                <CardTitle className="text-lg font-bold tracking-tight">Recent Activity</CardTitle>
                <p className="text-sm font-medium text-muted-foreground">
                  Latest signups, orders, and KYC submissions
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-0">
                  {[
                    { action: "New user registered", detail: "user@example.com", time: "2 min ago" },
                    { action: "Order completed", detail: "ORD-8842 • $299", time: "5 min ago" },
                    { action: "KYC submitted", detail: "Pending review", time: "12 min ago" },
                    { action: "Withdrawal requested", detail: "$1,250", time: "18 min ago" },
                    { action: "Coupon redeemed", detail: "WELCOME20", time: "25 min ago" },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between py-3 px-1 border-b border-border last:border-0 hover:bg-muted/30 rounded-md transition-colors"
                    >
                      <div>
                        <p className="text-sm font-semibold text-foreground">{item.action}</p>
                        <p className="text-xs font-medium text-muted-foreground mt-0.5">{item.detail}</p>
                      </div>
                      <span className="text-xs font-semibold text-muted-foreground">{item.time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
