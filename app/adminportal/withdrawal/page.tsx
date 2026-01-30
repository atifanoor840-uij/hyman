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
import { MagnifyingGlass, CheckCircle, XCircle, Wallet } from "@phosphor-icons/react"

const mockWithdrawals = [
  { id: "WD-2041", user: "john@example.com", amount: "$1,250", method: "Bank Transfer", status: "Pending", requested: "2025-01-28" },
  { id: "WD-2040", user: "jane@example.com", amount: "$890", method: "PayPal", status: "Approved", requested: "2025-01-27" },
  { id: "WD-2039", user: "mike@example.com", amount: "$2,100", method: "Bank Transfer", status: "Rejected", requested: "2025-01-26" },
  { id: "WD-2038", user: "sara@example.com", amount: "$500", method: "Crypto", status: "Pending", requested: "2025-01-28" },
  { id: "WD-2037", user: "alex@example.com", amount: "$1,750", method: "Bank Transfer", status: "Approved", requested: "2025-01-25" },
]

export default function AdminWithdrawalPage() {
  return (
    <AdminPageContainer
      title="Withdrawal"
      description="Review and process withdrawal requests."
      actions={
        <>
          <Button variant="outline" size="sm" className="gap-2">
            <CheckCircle size={16} weight="duotone" />
            Approve selected
          </Button>
          <Button variant="outline" size="sm" className="gap-2 text-destructive hover:text-destructive">
            <XCircle size={16} weight="duotone" />
            Reject selected
          </Button>
        </>
      }
    >
      <Card className="rounded-xl border-2 border-border bg-card shadow-sm animate-slide-in-up">
        <CardHeader className="pb-4 border-b border-border bg-muted/20">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className="text-lg font-bold tracking-tight flex items-center gap-2">
              <Wallet size={20} weight="duotone" />
              Withdrawal Requests
            </CardTitle>
            <div className="relative w-full sm:w-64">
              <MagnifyingGlass className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" size={16} weight="duotone" />
              <Input placeholder="Search by user or ID..." className="pl-9 h-9 text-sm" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-b-2 border-border">
                <TableHead className="font-semibold text-foreground">ID</TableHead>
                <TableHead className="font-semibold text-foreground">User</TableHead>
                <TableHead className="font-semibold text-foreground">Amount</TableHead>
                <TableHead className="font-semibold text-foreground">Method</TableHead>
                <TableHead className="font-semibold text-foreground">Status</TableHead>
                <TableHead className="font-semibold text-foreground">Requested</TableHead>
                <TableHead className="text-right font-semibold text-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockWithdrawals.map((w) => (
                <TableRow key={w.id} className="hover:bg-muted/30">
                  <TableCell className="font-mono text-xs">{w.id}</TableCell>
                  <TableCell className="text-muted-foreground">{w.user}</TableCell>
                  <TableCell className="font-medium">{w.amount}</TableCell>
                  <TableCell>{w.method}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        w.status === "Approved"
                          ? "default"
                          : w.status === "Pending"
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {w.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">{w.requested}</TableCell>
                  <TableCell className="text-right flex gap-1 justify-end">
                    {w.status === "Pending" && (
                      <>
                        <Button variant="ghost" size="sm" className="h-8 text-green-600">Approve</Button>
                        <Button variant="ghost" size="sm" className="h-8 text-destructive">Reject</Button>
                      </>
                    )}
                    <Button variant="ghost" size="sm" className="h-8">View</Button>
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
