"use client"

import { useEffect, useRef } from "react"
import { TrendingUp } from "lucide-react"

export function ForexPriceTicker() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return
    
    // Clear any existing content
    containerRef.current.innerHTML = ""
    
    const script = document.createElement("script")
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js"
    script.async = true
    script.innerHTML = JSON.stringify({
      symbols: [
        { proName: "FOREXCOM:EURUSD", title: "EUR/USD" },
        { proName: "FOREXCOM:GBPUSD", title: "GBP/USD" },
        { proName: "FOREXCOM:USDJPY", title: "USD/JPY" },
        { proName: "OANDA:XAUUSD", title: "XAU/USD" },
        { proName: "FOREXCOM:USDCAD", title: "USD/CAD" },
        { proName: "FOREXCOM:AUDUSD", title: "AUD/USD" },
        { proName: "FOREXCOM:USDCHF", title: "USD/CHF" },
        { proName: "FOREXCOM:EURGBP", title: "EUR/GBP" },
        { proName: "FOREXCOM:EURJPY", title: "EUR/JPY" },
        { proName: "FOREXCOM:GBPJPY", title: "GBP/JPY" },
        { proName: "FOREXCOM:NZDUSD", title: "NZD/USD" },
        { proName: "OANDA:XAGUSD", title: "XAG/USD" },
      ],
      showSymbolLogo: true,
      colorTheme: "dark",
      isTransparent: true,
      displayMode: "adaptive",
      locale: "en",
    })
    
    containerRef.current.appendChild(script)

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = ""
      }
    }
  }, [])

  return (
    <div className="w-full bg-[#0a1f0a] border-t border-[#DEBF74]/10">
      <div className="flex items-center gap-3 px-4 sm:px-6 py-2.5 bg-[#0a1f0a]/50">
        <div className="flex items-center gap-2 flex-shrink-0">
          <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-[#DEBF74]" />
          <span className="text-xs sm:text-sm font-medium text-white/90 uppercase tracking-wide">
            Live Prices
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div ref={containerRef} className="tradingview-widget-container" />
        </div>
      </div>
    </div>
  )
}

