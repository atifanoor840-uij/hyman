"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

const newsItems = [
  {
    id: "1",
    title: "Fed holds rates steady, signals one cut by end of 2025",
    date: "2025-01-28",
    readMoreHref: "#",
  },
  {
    id: "2",
    title: "EUR/USD hits two-week high on ECB hawkish stance",
    date: "2025-01-27",
    readMoreHref: "#",
  },
  {
    id: "3",
    title: "UK inflation falls to 3.4%, BoE decision in focus",
    date: "2025-01-26",
    readMoreHref: "#",
  },
  {
    id: "4",
    title: "USD/JPY retreats from 149 as Japan intervenes",
    date: "2025-01-25",
    readMoreHref: "#",
  },
  {
    id: "5",
    title: "Gold holds above $2,030 on safe-haven demand",
    date: "2025-01-24",
    readMoreHref: "#",
  },
]

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export function NewsContent() {
  return (
    <Card className="p-6">
      <h3 className="font-semibold text-lg mb-6">Latest News</h3>
      <div className="space-y-4">
        {newsItems.map((item, index) => (
          <div
            key={item.id}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-lg border border-border hover:bg-muted/50 transition-all duration-200"
          >
            <div className="min-w-0 flex-1">
              <h4 className="font-medium text-foreground mb-1">{item.title}</h4>
              <p className="text-sm text-muted-foreground">{formatDate(item.date)}</p>
            </div>
            <Link href={item.readMoreHref} className="shrink-0">
              <Button variant="ghost" size="sm" className="gap-1.5 text-primary hover:text-primary">
                Read more
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        ))}
      </div>
    </Card>
  )
}
