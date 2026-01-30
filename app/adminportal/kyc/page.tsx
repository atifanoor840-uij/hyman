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
import { MagnifyingGlass, CheckCircle, XCircle } from "@phosphor-icons/react"

const mockKyc = [
  { id: "KYC-102", user: "jane@example.com", name: "Jane Smith", status: "Pending", submitted: "2025-01-28", type: "ID + Selfie" },
  { id: "KYC-101", user: "john@example.com", name: "John Doe", status: "Verified", submitted: "2025-01-27", type: "ID + Selfie" },
  { id: "KYC-100", user: "sara@example.com", name: "Sara Williams", status: "Rejected", submitted: "2025-01-26", type: "ID + Selfie" },
  { id: "KYC-099", user: "alex@example.com", name: "Alex Brown", status: "Verified", submitted: "2025-01-25", type: "ID + Selfie" },
  { id: "KYC-098", user: "david@example.com", name: "David Lee", status: "Pending", submitted: "2025-01-24", type: "ID + Selfie" },
]

export default function AdminKycPage() {
  return (
    <AdminPageContainer
      title="KYC"
      description="Review and approve Know Your Customer submissions."
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
            <CardTitle className="text-lg font-bold tracking-tight">KYC Submissions</CardTitle>
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
                <TableHead className="font-semibold text-foreground">KYC ID</TableHead>
                <TableHead className="font-semibold text-foreground">User</TableHead>
                <TableHead className="font-semibold text-foreground">Name</TableHead>
                <TableHead className="font-semibold text-foreground">Type</TableHead>
                <TableHead className="font-semibold text-foreground">Status</TableHead>
                <TableHead className="font-semibold text-foreground">Submitted</TableHead>
                <TableHead className="text-right font-semibold text-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockKyc.map((kyc) => (
                <TableRow key={kyc.id} className="hover:bg-muted/30">
                  <TableCell className="font-mono text-xs">{kyc.id}</TableCell>
                  <TableCell className="text-muted-foreground">{kyc.user}</TableCell>
                  <TableCell className="font-medium">{kyc.name}</TableCell>
                  <TableCell className="text-muted-foreground">{kyc.type}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        kyc.status === "Verified"
                          ? "default"
                          : kyc.status === "Pending"
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {kyc.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">{kyc.submitted}</TableCell>
                  <TableCell className="text-right flex gap-1 justify-end">
                    {kyc.status === "Pending" && (
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
