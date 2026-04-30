"use client"

import { Card } from "@/components/ui/card"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

const tradingPairs = [
  { name: "EUR/USD", price: "1.0845", change: "+0.12%", color: "bg-purple-600", image: "https://flagcdn.com/w80/eu.png" },
  { name: "GBP/USD", price: "1.2650", change: "-0.08%", color: "bg-purple-500", image: "https://flagcdn.com/w80/gb.png" },
  { name: "USD/JPY", price: "149.25", change: "+0.25%", color: "bg-black", image: "https://flagcdn.com/w80/jp.png" },
  { name: "AUD/USD", price: "0.6520", change: "+0.15%", color: "bg-amber-500", image: "https://flagcdn.com/w80/au.png" },
  { name: "USD/CAD", price: "1.3480", change: "-0.05%", color: "bg-purple-500", image: "https://flagcdn.com/w80/ca.png" },
]

export function ProjectList() {
  return (
    <Card
      className="p-8 transition-all duration-500 hover:shadow-xl animate-slide-in-up"
      style={{ animationDelay: "700ms" }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-foreground">Top Trading Pairs</h2>
        <Button variant="outline" size="sm" className="transition-all duration-300 hover:scale-105 bg-transparent">
          <Plus className="w-4 h-4 mr-1" />
          Watchlist
        </Button>
      </div>
      <div className="space-y-3">
        {tradingPairs.map((pair, index) => (
          <div
            key={pair.name}
            className="flex items-center gap-4 p-5 min-h-[88px] rounded-xl hover:bg-secondary transition-all duration-300 cursor-pointer group border border-transparent hover:border-border"
            style={{ animationDelay: `${800 + index * 100}ms` }}
          >
            <div
              className={`${pair.color} w-16 h-16 rounded-xl flex items-center justify-center overflow-hidden shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6 ring-2 ring-white/10`}
            >
              <img
                src={pair.image}
                alt={pair.name}
                className="w-10 h-10 object-cover rounded-md"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground text-base">{pair.name}</p>
              <p className="text-sm text-muted-foreground mt-0.5">
                {pair.price} <span className={pair.change.startsWith("+") ? "text-black dark:text-foreground font-medium" : "text-red-600 font-medium"}>{pair.change}</span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
