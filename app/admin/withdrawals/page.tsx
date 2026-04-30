"use client"

import { AdminShell } from "@/components/admin/admin-shell"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import EmptyState from "@/components/ui/empty-state"
import { Wallet } from "lucide-react"

export default function AdminWithdrawalsPage() {
  return (
    <AdminShell title="Withdrawals" description="Approve, reject, and track payout requests.">
      <Card className="rounded-2xl border border-border/80 bg-card shadow-sm overflow-hidden">
        <div className="border-b border-border/80 bg-muted/20 px-4 sm:px-6 py-3.5 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-foreground tracking-tight">Withdrawal requests</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Built to match the dashboard theme.</p>
          </div>
          <Badge variant="outline" className="rounded-full border-border/70 bg-background/40 px-3 py-1 text-xs">
            Placeholder
          </Badge>
        </div>
        <div className="p-4 sm:p-6">
          <EmptyState
            title="No withdrawals loaded"
            description="Wire this page to admin withdrawals endpoints to review payout requests."
            icon={
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border/70 bg-muted/40">
                <Wallet className="h-6 w-6 text-muted-foreground" />
              </div>
            }
          />
        </div>
      </Card>
    </AdminShell>
  )
}

