"use client"

import Link from "next/link"
import { AdminShell } from "@/components/admin/admin-shell"
import { Button } from "@/components/ui/button"
import { EmptyBlock, Panel } from "@/components/admin/admin-ui"
import { Link as LinkIcon, Percent, Tag } from "lucide-react"

export default function AdminPaymentLinksPage() {
  return (
    <AdminShell title="Payment links" description="Shareable checkout links for a specific challenge or invoice.">
      <Panel>
        <EmptyBlock
          icon={LinkIcon}
          title="Payment links aren’t available yet"
          description="This feature still needs its backend. Until then, send customers to the Buy Challenge page, and use a coupon for custom pricing."
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Button asChild variant="outline" className="gap-2 rounded-xl border-border">
                <Link href="/admin/pricing">
                  <Tag className="h-4 w-4" /> Manage pricing
                </Link>
              </Button>
              <Button asChild className="gap-2 rounded-xl">
                <Link href="/admin/coupons">
                  <Percent className="h-4 w-4" /> Create a coupon
                </Link>
              </Button>
            </div>
          }
        />
      </Panel>
    </AdminShell>
  )
}
