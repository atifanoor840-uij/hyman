"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, TrendingUp, TrendingDown, Activity } from "lucide-react"
import { useState } from "react"

const trades = [
  {
    id: 1,
    pair: "EUR/USD",
    type: "Long",
    lots: 0.5,
    entry: "1.0845",
    current: "1.0862",
    profit: "+$85.00",
    profitPercent: "+0.15%",
    status: "open",
    time: "2 hours ago",
  },
  {
    id: 2,
    pair: "GBP/USD",
    type: "Short",
    lots: 1.0,
    entry: "1.2650",
    current: "1.2635",
    profit: "+$150.00",
    profitPercent: "+0.12%",
    status: "open",
    time: "4 hours ago",
  },
  {
    id: 3,
    pair: "USD/JPY",
    type: "Long",
    lots: 0.3,
    entry: "149.25",
    current: "149.85",
    profit: "+$180.00",
    profitPercent: "+0.40%",
    status: "open",
    time: "1 day ago",
  },
  {
    id: 4,
    pair: "AUD/USD",
    type: "Long",
    lots: 0.7,
    entry: "0.6520",
    current: "0.6505",
    profit: "-$105.00",
    profitPercent: "-0.23%",
    status: "open",
    time: "3 hours ago",
  },
  {
    id: 5,
    pair: "USD/CAD",
    type: "Short",
    lots: 0.4,
    entry: "1.3480",
    current: "1.3495",
    profit: "-$60.00",
    profitPercent: "-0.11%",
    status: "open",
    time: "5 hours ago",
  },
  {
    id: 6,
    pair: "EUR/GBP",
    type: "Long",
    lots: 0.6,
    entry: "0.8570",
    current: "0.8595",
    profit: "+$150.00",
    profitPercent: "+0.29%",
    status: "open",
    time: "6 hours ago",
  },
]

export function TradingContent() {
  const [filter, setFilter] = useState("all")

  const filteredTrades =
    filter === "all"
      ? trades
      : filter === "profitable"
        ? trades.filter((t) => t.profit.startsWith("+"))
        : trades.filter((t) => t.profit.startsWith("-"))

  return (
    <Card className="border border-border shadow-sm animate-fade-in">
      <CardHeader className="pb-3 px-4 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base font-semibold">Open Positions</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-48">
              <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search pairs..." className="pl-8 h-8 text-sm" />
            </div>
            <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs">
              <Filter className="w-3.5 h-3.5" />
              Filter
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <div className="flex gap-1.5 mb-4">
          <Button variant={filter === "all" ? "default" : "outline"} onClick={() => setFilter("all")} size="sm" className="h-7 text-xs px-3">
            All ({trades.length})
          </Button>
          <Button
            variant={filter === "profitable" ? "default" : "outline"}
            onClick={() => setFilter("profitable")}
            size="sm"
            className="h-7 text-xs px-3"
          >
            Profitable ({trades.filter((t) => t.profit.startsWith("+")).length})
          </Button>
          <Button
            variant={filter === "loss" ? "default" : "outline"}
            onClick={() => setFilter("loss")}
            size="sm"
            className="h-7 text-xs px-3"
          >
            Loss ({trades.filter((t) => t.profit.startsWith("-")).length})
          </Button>
        </div>

        <div className="grid gap-2">
          {filteredTrades.map((trade, index) => (
            <div
              key={trade.id}
              className="p-3 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition-all duration-200 cursor-pointer"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-md flex items-center justify-center shrink-0 ${
                    trade.type === "Long" ? "bg-emerald-500/15" : "bg-red-500/15"
                  }`}
                >
                  {trade.type === "Long" ? (
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm">{trade.pair}</h3>
                      <Badge variant={trade.type === "Long" ? "default" : "destructive"} className="text-[10px] h-5 px-1.5">
                        {trade.type}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-semibold text-sm ${
                          trade.profit.startsWith("+") ? "text-emerald-600" : "text-red-600"
                        }`}
                      >
                        {trade.profit}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{trade.lots} lots</span>
                      <span>Entry: {trade.entry}</span>
                      <span>Current: {trade.current}</span>
                    </div>
                    <span className={`text-xs ${trade.profitPercent.startsWith("+") ? "text-emerald-600" : "text-red-600"}`}>
                      {trade.profitPercent}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
