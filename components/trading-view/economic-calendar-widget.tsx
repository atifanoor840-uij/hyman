"use client"

import { useEffect, useRef } from "react"

const TV_SCRIPT = "https://s3.tradingview.com/external-embedding/embed-widget-events.js"

export function EconomicCalendarWidget({ className = "", height = 500 }: { className?: string; height?: number }) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return
    const prev = containerRef.current.querySelector("script")
    if (prev) prev.remove()

    const script = document.createElement("script")
    script.src = TV_SCRIPT
    script.async = true
    script.textContent = JSON.stringify({
      colorTheme: "light",
      isTransparent: true,
      width: "100%",
      height,
      locale: "en",
      importanceFilter: "0,1",
      countryFilter: "us,eu,jp,gb,ch,au,ca,nz,cn",
    })
    containerRef.current.appendChild(script)
  }, [height])

  return (
    <div ref={containerRef} className={`tradingview-widget-container ${className}`} style={{ height }}>
      <div className="tradingview-widget-container__widget" style={{ height: height - 32 }} />
    </div>
  )
}
