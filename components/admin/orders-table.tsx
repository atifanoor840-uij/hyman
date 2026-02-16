"use client"

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
import { Search, Download } from "lucide-react"

export type OrderRow = {
  id: string
  user: string
  product: string
  amount: string
  status: string
  date: string
  payment?: string
}

interface OrdersTableProps {
  title: string
  orders: OrderRow[]
  placeholder?: string
}

export function OrdersTable({ title, orders, placeholder = "Search orders..." }: OrdersTableProps) {
  return (
    <Card className="rounded-xl border-2 border-border bg-card shadow-sm animate-slide-in-up">
      <CardHeader className="pb-4 border-b border-border bg-muted/20">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <CardTitle className="text-lg font-bold tracking-tight">{title}</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <div className="relative w-full sm:w-48">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder={placeholder} className="pl-9 h-9 text-sm" />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="border-b-2 border-border">
              <TableHead className="font-semibold text-foreground">Order ID</TableHead>
              <TableHead className="font-semibold text-foreground">User</TableHead>
              <TableHead className="font-semibold text-foreground">Product</TableHead>
              <TableHead className="font-semibold text-foreground">Amount</TableHead>
              {orders.some((o) => o.payment) && <TableHead className="font-semibold text-foreground">Payment</TableHead>}
              <TableHead className="font-semibold text-foreground">Status</TableHead>
              <TableHead className="font-semibold text-foreground">Date</TableHead>
              <TableHead className="text-right font-semibold text-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id} className="hover:bg-muted/30">
                <TableCell className="font-mono text-xs font-semibold text-foreground">{order.id}</TableCell>
                <TableCell className="text-muted-foreground font-medium">{order.user}</TableCell>
                <TableCell className="font-medium">{order.product}</TableCell>
                <TableCell className="font-bold text-foreground">{order.amount}</TableCell>
                {orders.some((o) => o.payment) && (
                  <TableCell className="text-muted-foreground">{order.payment ?? "—"}</TableCell>
                )}
                <TableCell>
                  <Badge
                    variant={
                      order.status === "Completed" || order.status === "Delivered" || order.status === "Passed" || order.status === "Live" || order.status === "Stage 2"
                        ? "default"
                        : order.status === "Pending"
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-xs">{order.date}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" className="h-8">
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
