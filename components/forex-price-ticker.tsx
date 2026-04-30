"use client"

import { useEffect, useRef } from "react"
import { TrendingUp } from "lucide-react"

export function ForexPriceTicker() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = containerRef.current
    if (!root) return

    root.innerHTML = ""
    const widget = document.createElement("div")
    widget.className = "tradingview-widget-container__widget"
    root.appendChild(widget)

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
        { proName: "BINANCE:BTCUSDT", title: "BTC/USDT" },
        { proName: "BINANCE:ETHUSDT", title: "ETH/USDT" },
        { proName: "BINANCE:SOLUSDT", title: "SOL/USDT" },
        { proName: "BINANCE:XRPUSDT", title: "XRP/USDT" },
      ],
      showSymbolLogo: true,
      colorTheme: "dark",
      isTransparent: true,
      displayMode: "adaptive",
      locale: "en",
    })

    root.appendChild(script)

    return () => {
      root.innerHTML = ""
    }
  }, [])

  return (
    <section
      className="w-full border-t border-white/10 bg-[#050406]"
      aria-label="Live forex and cryptocurrency quotes"
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:gap-4 sm:px-6 sm:py-2.5">
        <div className="flex shrink-0 items-center gap-2">
          <TrendingUp className="h-4 w-4 text-emerald-400 sm:h-5 sm:w-5" aria-hidden />
          <span className="text-xs font-medium uppercase tracking-wide text-white/90 sm:text-sm">
            Live markets
          </span>
          <span className="hidden text-[11px] text-white/45 sm:inline">· TradingView</span>
        </div>
        <div className="min-h-[44px] min-w-0 flex-1">
          <div ref={containerRef} className="tradingview-widget-container w-full" />
        </div>
      </div>
    </section>
  )
}

