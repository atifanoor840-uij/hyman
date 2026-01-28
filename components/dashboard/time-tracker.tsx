"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Pause, Square } from "lucide-react"
import { useState, useEffect } from "react"

export function TimeTracker() {
  const [seconds, setSeconds] = useState(24 * 3600 + 8)
  const [isRunning, setIsRunning] = useState(true)

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds((s) => s + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isRunning])

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  const formatTime = (num: number) => String(num).padStart(2, "0")

  return (
    <Card
      className="bg-foreground text-background p-6 transition-all duration-500 hover:shadow-2xl animate-slide-in-up overflow-hidden relative group"
      style={{ animationDelay: "1000ms" }}
    >
      <div className="absolute top-0 right-0 w-48 h-full opacity-15">
        {[...Array(6)].map((_, i) => (
          <svg
            key={i}
            className="absolute"
            style={{
              top: `${i * 50}px`,
              right: `-${i * 10}px`,
              width: "150px",
              height: "80px",
            }}
            viewBox="0 0 100 50"
            preserveAspectRatio="none"
          >
            <path
              d="M0,25 Q12.5,10 25,25 T50,25 T75,25 T100,25"
              fill="none"
              stroke="oklch(0.42 0.15 155)"
              strokeWidth="2"
            />
          </svg>
        ))}
      </div>

      <div className="relative z-10">
        <h2 className="text-lg font-semibold mb-4">Market Hours</h2>
        <div className="text-4xl sm:text-5xl font-mono font-bold mb-4 tracking-tight break-all">
          {formatTime(hours)}:{formatTime(minutes)}:{formatTime(secs)}
        </div>
        <div className="mb-4">
          <p className="text-xs opacity-80 mb-2">Trading Session: London</p>
          <div className="flex gap-2">
            <div className="flex-1 bg-background/20 rounded-lg p-2 text-center">
              <p className="text-xs opacity-80">Open</p>
              <p className="text-sm font-semibold">08:00</p>
            </div>
            <div className="flex-1 bg-background/20 rounded-lg p-2 text-center">
              <p className="text-xs opacity-80">Close</p>
              <p className="text-sm font-semibold">17:00</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
