"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Receipt } from "lucide-react"

const orders = [
  {
    id: "d9fc7f44-4739-4d02-ba8",
    accountSize: "$100,000.00",
    orderCreation: "25.01.2026 23:32 PM",
    orderPayment: "-",
    price: "€495.00",
    status: "Pending",
  },
  {
    id: "cd49fa79-0fa4-491d-b7fd",
    accountSize: "$5,000.00",
    orderCreation: "24.01.2026 14:20 PM",
    orderPayment: "-",
    price: "€63.25",
    status: "Pending",
  },
  {
    id: "a1b2c3d4-5e6f-7g8h-9i0j",
    accountSize: "$25,000.00",
    orderCreation: "23.01.2026 10:15 AM",
    orderPayment: "€250.00",
    price: "€250.00",
    status: "Completed",
  },
  {
    id: "e5f6g7h8-9i0j-1k2l-3m4n",
    accountSize: "$50,000.00",
    orderCreation: "22.01.2026 16:45 PM",
    orderPayment: "€500.00",
    price: "€500.00",
    status: "Completed",
  },
  {
    id: "o9p0q1r2-3s4t-5u6v-7w8x",
    accountSize: "$10,000.00",
    orderCreation: "21.01.2026 09:30 AM",
    orderPayment: "-",
    price: "€100.00",
    status: "Pending",
  },
]

const getStatusBadge = (status: string) => {
  switch (status) {
    case "Completed":
      return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs">Completed</Badge>
    case "Pending":
      return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-xs">Pending</Badge>
    case "Processing":
      return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-xs">Processing</Badge>
    default:
      return <Badge variant="secondary" className="text-xs">{status}</Badge>
  }
}

export function BillingContent() {
  return (
    <div className="space-y-4 animate-fade-in font-sans">
      {/* Orders Table */}
      <Card className="border border-border shadow-sm">
        <CardHeader className="pb-3 px-4 pt-4">
          <div className="flex items-center gap-2">
            <Receipt className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base font-semibold">Order History</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border bg-muted/30 hover:bg-muted/30">
                  <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide h-9 px-4">Account Size</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide h-9">Order ID</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide h-9">Created</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide h-9">Payment</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide h-9">Price</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide h-9">Status</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide h-9 px-4">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order, index) => (
                  <TableRow
                    key={order.id}
                    className="border-border hover:bg-muted/40 transition-colors"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <TableCell className="text-sm font-medium px-4 py-3">{order.accountSize}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground py-3">{order.id}</TableCell>
                    <TableCell className="text-sm text-muted-foreground py-3">{order.orderCreation}</TableCell>
                    <TableCell className="text-sm text-muted-foreground py-3">
                      {order.orderPayment === "-" ? <span className="text-muted-foreground/50">—</span> : order.orderPayment}
                    </TableCell>
                    <TableCell className="text-sm font-semibold py-3">{order.price}</TableCell>
                    <TableCell className="py-3">{getStatusBadge(order.status)}</TableCell>
                    <TableCell className="px-4 py-3">
                      {order.status === "Pending" ? (
                        <Button
                          variant="default"
                          size="sm"
                          className="h-7 text-xs px-3"
                        >
                          Complete
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs px-3"
                        >
                          Download
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
