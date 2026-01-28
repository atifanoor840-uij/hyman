"use client"

import { useEffect, useRef } from "react"

const TV_SCRIPT = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js"

export function AdvancedChartWidget({
  symbol = "FX:EURUSD",
  className = "",
  height = 500,
}: {
  symbol?: string
  className?: string
  height?: number
}) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return
    const prev = containerRef.current.querySelector("script")
    if (prev) prev.remove()

    const script = document.createElement("script")
    script.src = TV_SCRIPT
    script.async = true
    script.textContent = JSON.stringify({
      autosize: true,
      symbol,
      interval: "D",
      timezone: "Etc/UTC",
      theme: "light",
      style: "1",
      locale: "en",
      allow_symbol_change: true,
      calendar: false,
      support_host: "https://www.tradingview.com",
    })
    containerRef.current.appendChild(script)
  }, [symbol])

  return (
    <div
      ref={containerRef}
      className={`tradingview-widget-container ${className}`}
      style={{ height, width: "100%" }}
    >
      <div className="tradingview-widget-container__widget" style={{ height: height - 32, width: "100%" }} />
    </div>
  )
}
