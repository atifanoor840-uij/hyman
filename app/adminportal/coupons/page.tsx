"use client"

import { AdminPageContainer } from "@/components/admin/page-container"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { MagnifyingGlass, Plus, Ticket } from "@phosphor-icons/react"

const mockCoupons = [
  { code: "WELCOME20", discount: "20%", uses: 156, maxUses: 500, validUntil: "2025-03-01", status: "Active" },
  { code: "SAVE50", discount: "$50", uses: 89, maxUses: 200, validUntil: "2025-02-15", status: "Active" },
  { code: "NEWYEAR25", discount: "25%", uses: 200, maxUses: 200, validUntil: "2025-01-31", status: "Expired" },
  { code: "PHASE2OFF", discount: "15%", uses: 42, maxUses: 100, validUntil: "2025-04-01", status: "Active" },
  { code: "VIP30", discount: "30%", uses: 12, maxUses: 50, validUntil: "2025-06-01", status: "Active" },
]

export default function AdminCouponsPage() {
  return (
    <AdminPageContainer
      title="Coupon Codes"
      description="Create and manage discount and promo codes."
      actions={
        <Button size="sm" className="gap-2">
          <Plus size={16} weight="duotone" />
          Create coupon
        </Button>
      }
    >
      <Card className="rounded-xl border-2 border-border bg-card shadow-sm animate-slide-in-up">
        <CardHeader className="pb-4 border-b border-border bg-muted/20">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className="text-lg font-bold tracking-tight flex items-center gap-2">
              <Ticket size={20} weight="duotone" />
              All Coupons
            </CardTitle>
            <div className="relative w-full sm:w-64">
              <MagnifyingGlass className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" size={16} weight="duotone" />
              <Input placeholder="Search by code..." className="pl-9 h-9 text-sm" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-b-2 border-border">
                <TableHead className="font-semibold text-foreground">Code</TableHead>
                <TableHead className="font-semibold text-foreground">Discount</TableHead>
                <TableHead className="font-semibold text-foreground">Uses</TableHead>
                <TableHead className="font-semibold text-foreground">Max Uses</TableHead>
                <TableHead className="font-semibold text-foreground">Valid Until</TableHead>
                <TableHead className="font-semibold text-foreground">Status</TableHead>
                <TableHead className="text-right font-semibold text-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockCoupons.map((coupon) => (
                <TableRow key={coupon.code} className="hover:bg-muted/30">
                  <TableCell className="font-mono font-medium">{coupon.code}</TableCell>
                  <TableCell>{coupon.discount}</TableCell>
                  <TableCell>{coupon.uses}</TableCell>
                  <TableCell className="text-muted-foreground">{coupon.maxUses}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">{coupon.validUntil}</TableCell>
                  <TableCell>
                    <Badge variant={coupon.status === "Active" ? "default" : "secondary"}>
                      {coupon.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="h-8">Edit</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AdminPageContainer>
  )
}
