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
import { MagnifyingGlass, Export, UserPlus } from "@phosphor-icons/react"

const mockReferrals = [
  { referrer: "john@example.com", referred: "jane@example.com", code: "JOHN20", signups: 12, rewards: "$240", status: "Active" },
  { referrer: "mike@example.com", referred: "sara@example.com", code: "MIKE10", signups: 8, rewards: "$160", status: "Active" },
  { referrer: "alex@example.com", referred: "david@example.com", code: "ALEX15", signups: 5, rewards: "$100", status: "Active" },
  { referrer: "sara@example.com", referred: "—", code: "SARA25", signups: 0, rewards: "$0", status: "No signups" },
  { referrer: "david@example.com", referred: "john@example.com", code: "DAVID30", signups: 3, rewards: "$60", status: "Active" },
]

export default function AdminReferralPage() {
  return (
    <AdminPageContainer
      title="Referral"
      description="Manage referral codes, signups, and rewards."
      actions={
        <>
          <Button variant="outline" size="sm" className="gap-2">
            <Export size={16} weight="duotone" />
            Export
          </Button>
          <Button size="sm" className="gap-2">
            <UserPlus size={16} weight="duotone" />
            Create referral code
          </Button>
        </>
      }
    >
      <Card className="rounded-xl border-2 border-border bg-card shadow-sm animate-slide-in-up">
        <CardHeader className="pb-4 border-b border-border bg-muted/20">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className="text-lg font-bold tracking-tight">Referral Program</CardTitle>
            <div className="relative w-full sm:w-64">
              <MagnifyingGlass className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" size={16} weight="duotone" />
              <Input placeholder="Search by email or code..." className="pl-9 h-9 text-sm" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-b-2 border-border">
                <TableHead className="font-semibold text-foreground">Referrer</TableHead>
                <TableHead className="font-semibold text-foreground">Referred User</TableHead>
                <TableHead className="font-semibold text-foreground">Code</TableHead>
                <TableHead className="font-semibold text-foreground">Signups</TableHead>
                <TableHead className="font-semibold text-foreground">Rewards</TableHead>
                <TableHead className="font-semibold text-foreground">Status</TableHead>
                <TableHead className="text-right font-semibold text-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockReferrals.map((row, i) => (
                <TableRow key={i} className="hover:bg-muted/30">
                  <TableCell className="font-medium">{row.referrer}</TableCell>
                  <TableCell className="text-muted-foreground">{row.referred}</TableCell>
                  <TableCell className="font-mono text-xs">{row.code}</TableCell>
                  <TableCell>{row.signups}</TableCell>
                  <TableCell className="font-medium">{row.rewards}</TableCell>
                  <TableCell className="text-muted-foreground">{row.status}</TableCell>
                  <TableCell className="text-right">
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
