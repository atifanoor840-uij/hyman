"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Wallet, ArrowDownToLine, Banknote } from "lucide-react"

const withdrawals = [
  { id: "WD-001", amount: "$2,500.00", method: "Bank transfer", date: "2025-01-24", status: "Completed" },
  { id: "WD-002", amount: "$1,200.00", method: "Crypto", date: "2025-01-20", status: "Completed" },
  { id: "WD-003", amount: "$3,000.00", method: "Bank transfer", date: "2025-01-18", status: "Processing" },
]

export function WithdrawalContent() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Available balance</p>
              <p className="text-xl font-bold text-foreground">$12,450.00</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <ArrowDownToLine className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending withdrawals</p>
              <p className="text-xl font-bold text-foreground">$3,000.00</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-black/10 flex items-center justify-center">
              <Banknote className="w-5 h-5 text-black dark:text-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total withdrawn</p>
              <p className="text-xl font-bold text-foreground">$8,700.00</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <ArrowDownToLine className="w-5 h-5 text-primary" />
            Request withdrawal
          </h3>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="wd-amount">Amount (USD)</Label>
              <Input
                id="wd-amount"
                type="number"
                placeholder="0.00"
                min={0}
                step={0.01}
                className="font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="wd-method">Withdrawal method</Label>
              <select
                id="wd-method"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option>Bank transfer</option>
                <option>PayPal</option>
                <option>Crypto (USDT)</option>
              </select>
            </div>
            <Button type="submit" className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90">
              Request withdrawal
            </Button>
          </form>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-foreground mb-4">Recent withdrawals</h3>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead className="font-semibold">ID</TableHead>
                  <TableHead className="font-semibold">Amount</TableHead>
                  <TableHead className="font-semibold">Method</TableHead>
                  <TableHead className="font-semibold">Date</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {withdrawals.map((w) => (
                  <TableRow key={w.id} className="border-border">
                    <TableCell className="font-mono text-sm">{w.id}</TableCell>
                    <TableCell className="font-semibold">{w.amount}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{w.method}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{w.date}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          w.status === "Completed"
                            ? "bg-black/10 text-black dark:text-foreground border-black/20 dark:border-foreground/20"
                            : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                        }
                      >
                        {w.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  )
}
