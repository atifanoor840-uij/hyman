"use client"

import { AdminShell } from "@/components/admin/admin-shell"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Link as LinkIcon, Plus } from "lucide-react"

export default function AdminPaymentLinksPage() {
  return (
    <AdminShell
      title="Payment links"
      description="Create and manage shareable payment URLs for challenges or invoices."
      actions={
        <Button className="h-9 rounded-full px-4 text-xs font-semibold" disabled>
          <Plus className="h-4 w-4 mr-2" />
          New link (coming)
        </Button>
      }
    >
      <Card className="rounded-2xl border border-border/80 bg-card shadow-sm overflow-hidden">
        <div className="border-b border-border/80 bg-muted/20 px-4 sm:px-6 py-3.5 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-foreground tracking-tight">Links</h3>
            <p className="text-xs text-muted-foreground mt-0.5">UI matches the user dashboard theme.</p>
          </div>
          <Badge variant="outline" className="rounded-full border-border/70 bg-background/40 px-3 py-1 text-xs">
            Placeholder
          </Badge>
        </div>

        <div className="p-4 sm:p-6 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            <Input placeholder="Label (e.g. 50k Phase 1)" className="rounded-2xl border-border/70 bg-muted/10" disabled />
            <Input placeholder="Amount" className="rounded-2xl border-border/70 bg-muted/10" disabled />
            <Button variant="outline" className="rounded-2xl border-border/70" disabled>
              <LinkIcon className="h-4 w-4 mr-2" />
              Generate (coming)
            </Button>
          </div>

          <div className="rounded-2xl border border-border/70 bg-muted/20 p-4 text-sm text-muted-foreground">
            When your backend endpoints are ready, this page can list generated links, show status (paid/expired),
            and provide one-click copy/share.
          </div>
        </div>
      </Card>
    </AdminShell>
  )
}

