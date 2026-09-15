"use client"

import { Card } from "@/components/ui/card"
import { useEffect, useState } from "react"
import type { PerformanceResponse } from "@/lib/api/performance"

export interface ProjectProgressProps {
  stats?: PerformanceResponse | null
}

export function ProjectProgress(props: ProjectProgressProps) {
  const { stats = null } = props
  const winRateFromApi = stats?.statistics?.advanced_statistics?.win_rate ?? null
  const targetProgress = winRateFromApi != null ? Math.round(winRateFromApi) : 0
  const [progress, setProgress] = useState(winRateFromApi != null ? winRateFromApi : 0)

  useEffect(() => {
    if (winRateFromApi != null) {
      setProgress(Math.round(winRateFromApi))
      return
    }
    setProgress(0)
  }, [winRateFromApi])

  const circumference = 2 * Math.PI * 90
  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <Card
      className="rounded-2xl border-border p-4 md:p-6 transition-shadow duration-200 hover:shadow-md animate-slide-in-up overflow-hidden min-w-0"
      style={{ animationDelay: "800ms" }}
    >
      <h2 className="text-lg font-semibold text-foreground mb-4">Account Performance</h2>
      <div className="flex flex-col items-center">
        <div className="relative w-40 h-40 mb-4">
          <div
            className="absolute inset-0 rounded-full opacity-20"
            style={{
              background:
                "repeating-linear-gradient(45deg, transparent, transparent 6px, oklch(0.42 0.15 155) 6px, oklch(0.42 0.15 155) 12px)",
            }}
          />
          <svg className="w-full h-full -rotate-90 relative z-10" viewBox="0 0 160 160">
            <circle
              cx="80"
              cy="80"
              r="70"
              stroke="currentColor"
              strokeWidth="12"
              fill="none"
              className="text-muted/30"
            />
            <circle
              cx="80"
              cy="80"
              r="70"
              stroke="currentColor"
              strokeWidth="12"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="text-primary transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold text-foreground">{progress}%</span>
            <span className="text-xs text-muted-foreground mt-1">Win Rate</span>
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-primary flex-shrink-0" />
            <span className="text-muted-foreground whitespace-nowrap">Winning Trades</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-foreground flex-shrink-0" />
            <span className="text-muted-foreground whitespace-nowrap">Open Positions</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{
                background:
                  "repeating-linear-gradient(45deg, transparent, transparent 2px, oklch(0.55 0.02 120) 2px, oklch(0.55 0.02 120) 4px)",
              }}
            />
            <span className="text-muted-foreground whitespace-nowrap">Pending Orders</span>
          </div>
        </div>
      </div>
    </Card>
  )
}
