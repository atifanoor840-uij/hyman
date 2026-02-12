"use client"
import { useEffect, useRef } from "react"
import { BarChart3, Coins, DollarSign, Activity } from "lucide-react"

function ForexCrossRates() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    if (container.querySelector('script[src*="embed-widget-forex-cross-rates.js"]')) return

    const script = document.createElement("script")
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-forex-cross-rates.js"
    script.type = "text/javascript"
    script.async = true
    script.innerHTML = JSON.stringify({
      width: "100%",
      height: 400,
      currencies: [
        "EUR", "USD", "JPY", "GBP", "CHF", "AUD", "CAD", "NZD", "CNY"
      ],
      isTransparent: true,
      colorTheme: "dark",
      locale: "en"
    })
    container.appendChild(script)

    return () => {
      while (container.firstChild) container.removeChild(container.firstChild)
    }
  }, [])

  return (
    <div className="w-full rounded-xl border border-[#DEBF74]/20 bg-gradient-to-br from-[#0f5132] to-[#0a1f0a] backdrop-blur-sm overflow-hidden">
      <div className="p-4 border-b border-[#DEBF74]/10">
        <div className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-[#DEBF74]" />
          <h3 className="text-lg font-bold text-white">Forex Cross Rates</h3>
        </div>
      </div>
      <div className="tradingview-widget-container" ref={containerRef} style={{ minHeight: 400 }}>
        <div className="tradingview-widget-container__widget" />
      </div>
    </div>
  )
}

function CryptoMarket() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    
    // Clear any existing scripts
    const existingScript = container.querySelector('script[src*="embed-widget-market-overview.js"]')
    if (existingScript) {
      existingScript.remove()
    }
    
    // Clear container
    container.innerHTML = '<div class="tradingview-widget-container__widget"></div>'

    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      const script = document.createElement("script")
      script.src = "https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js"
      script.type = "text/javascript"
      script.async = true
      script.innerHTML = JSON.stringify({
      colorTheme: "dark",
      dateRange: "12M",
      showChart: true,
      locale: "en",
      largeChartUrl: "",
      isTransparent: true,
      showSymbolLogo: true,
      showFloatingTooltip: true,
      width: "100%",
      height: 500,
      plotLineColorGrowing: "#22c55e",
      plotLineColorFalling: "#ef4444",
      gridLineColor: "rgba(16, 185, 129, 0.1)",
      scaleFontColor: "rgba(74, 222, 128, 0.9)",
      belowLineFillColorGrowing: "rgba(34, 197, 94, 0.05)",
      belowLineFillColorFalling: "rgba(239, 68, 68, 0.05)",
      symbolActiveColor: "rgba(51, 65, 85, 0.25)",
      tabs: [
        {
          title: "Top Cryptocurrencies",
          symbols: [
            { proName: "BINANCE:BTCUSDT", title: "Bitcoin" },
            { proName: "BINANCE:ETHUSDT", title: "Ethereum" },
            { proName: "BINANCE:BNBUSDT", title: "BNB" },
            { proName: "BINANCE:ADAUSDT", title: "Cardano" },
            { proName: "BINANCE:SOLUSDT", title: "Solana" },
            { proName: "BINANCE:XRPUSDT", title: "Ripple" },
            { proName: "BINANCE:DOTUSDT", title: "Polkadot" },
            { proName: "BINANCE:DOGEUSDT", title: "Dogecoin" },
            { proName: "BINANCE:MATICUSDT", title: "Polygon" },
            { proName: "BINANCE:LINKUSDT", title: "Chainlink" },
            { proName: "BINANCE:LTCUSDT", title: "Litecoin" },
            { proName: "BINANCE:AVAXUSDT", title: "Avalanche" },
            { proName: "BINANCE:UNIUSDT", title: "Uniswap" },
            { proName: "BINANCE:ATOMUSDT", title: "Cosmos" },
            { proName: "BINANCE:ETCUSDT", title: "Ethereum Classic" },
            { proName: "BINANCE:XLMUSDT", title: "Stellar" },
            { proName: "BINANCE:ALGOUSDT", title: "Algorand" },
            { proName: "BINANCE:VETUSDT", title: "VeChain" },
            { proName: "BINANCE:ICPUSDT", title: "Internet Computer" },
            { proName: "BINANCE:THETAUSDT", title: "Theta" },
            { proName: "BINANCE:FTMUSDT", title: "Fantom" },
            { proName: "BINANCE:AAVEUSDT", title: "Aave" }
          ]
        },
        {
          title: "DeFi Tokens",
          symbols: [
            { proName: "BINANCE:UNIUSDT", title: "Uniswap" },
            { proName: "BINANCE:AAVEUSDT", title: "Aave" },
            { proName: "BINANCE:COMPUSDT", title: "Compound" },
            { proName: "BINANCE:MKRUSDT", title: "Maker" },
            { proName: "BINANCE:SUSHIUSDT", title: "SushiSwap" },
            { proName: "BINANCE:CRVUSDT", title: "Curve" },
            { proName: "BINANCE:YFIUSDT", title: "Yearn Finance" }
          ]
        }
      ]
      })
      container.appendChild(script)
    }, 100)

    return () => {
      clearTimeout(timer)
      if (container) {
        container.innerHTML = ""
      }
    }
  }, [])

  return (
    <div className="w-full rounded-xl border border-[#DEBF74]/20 bg-gradient-to-br from-[#0f5132] to-[#0a1f0a] backdrop-blur-sm overflow-hidden">
      <div className="p-4 border-b border-[#DEBF74]/10">
        <div className="flex items-center gap-2">
          <Coins className="w-5 h-5 text-[#DEBF74]" />
          <h3 className="text-lg font-bold text-white">Cryptocurrency Market</h3>
        </div>
      </div>
      <div className="tradingview-widget-container" ref={containerRef} style={{ minHeight: 500 }}>
        <div className="tradingview-widget-container__widget" />
      </div>
    </div>
  )
}

function MarketOverview() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    
    // Clear any existing scripts
    const existingScript = container.querySelector('script[src*="embed-widget-market-overview.js"]')
    if (existingScript) {
      existingScript.remove()
    }
    
    // Clear container
    container.innerHTML = '<div class="tradingview-widget-container__widget"></div>'

    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      const script = document.createElement("script")
      script.src = "https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js"
      script.type = "text/javascript"
      script.async = true
      script.innerHTML = JSON.stringify({
        colorTheme: "dark",
        dateRange: "12M",
        showChart: true,
        locale: "en",
        largeChartUrl: "",
        isTransparent: true,
        showSymbolLogo: true,
        showFloatingTooltip: true,
        width: "100%",
        height: 600,
        plotLineColorGrowing: "#22c55e",
        plotLineColorFalling: "#ef4444",
        gridLineColor: "rgba(42, 46, 57, 0.1)",
        scaleFontColor: "rgba(134, 144, 160, 0.9)",
        belowLineFillColorGrowing: "rgba(34, 197, 94, 0.05)",
        belowLineFillColorFalling: "rgba(239, 68, 68, 0.05)",
        symbolActiveColor: "rgba(16, 185, 129, 0.25)",
        tabs: [
          {
            title: "Stocks",
            symbols: [
              { proName: "NASDAQ:AAPL", title: "Apple" },
              { proName: "NASDAQ:MSFT", title: "Microsoft" },
              { proName: "NASDAQ:GOOGL", title: "Alphabet" },
              { proName: "NASDAQ:AMZN", title: "Amazon" },
              { proName: "NASDAQ:META", title: "Meta" },
              { proName: "NASDAQ:TSLA", title: "Tesla" },
              { proName: "NASDAQ:NVDA", title: "NVIDIA" },
              { proName: "NYSE:JPM", title: "JPMorgan" },
              { proName: "NYSE:V", title: "Visa" },
              { proName: "NYSE:JNJ", title: "Johnson & Johnson" },
              { proName: "NYSE:WMT", title: "Walmart" },
              { proName: "NYSE:PG", title: "Procter & Gamble" },
              { proName: "NYSE:MA", title: "Mastercard" },
              { proName: "NYSE:HD", title: "Home Depot" },
              { proName: "NYSE:DIS", title: "Disney" },
              { proName: "NYSE:BAC", title: "Bank of America" },
              { proName: "NYSE:VZ", title: "Verizon" },
              { proName: "NYSE:ADBE", title: "Adobe" },
              { proName: "NASDAQ:NFLX", title: "Netflix" },
              { proName: "NASDAQ:INTC", title: "Intel" }
            ]
          },
          {
            title: "Forex Majors",
            symbols: [
              { proName: "FOREXCOM:EURUSD", title: "EUR/USD" },
              { proName: "FOREXCOM:GBPUSD", title: "GBP/USD" },
              { proName: "FOREXCOM:USDJPY", title: "USD/JPY" },
              { proName: "FOREXCOM:USDCHF", title: "USD/CHF" },
              { proName: "FOREXCOM:AUDUSD", title: "AUD/USD" },
              { proName: "FOREXCOM:USDCAD", title: "USD/CAD" },
              { proName: "FOREXCOM:NZDUSD", title: "NZD/USD" },
              { proName: "FOREXCOM:EURGBP", title: "EUR/GBP" },
              { proName: "FOREXCOM:EURJPY", title: "EUR/JPY" },
              { proName: "FOREXCOM:GBPJPY", title: "GBP/JPY" }
            ]
          },
          {
            title: "Indices",
            symbols: [
              { proName: "FOREXCOM:SPXUSD", title: "S&P 500" },
              { proName: "FOREXCOM:NSXUSD", title: "NASDAQ" },
              { proName: "FOREXCOM:DJI", title: "Dow Jones" },
              { proName: "FOREXCOM:UKXGBP", title: "FTSE 100" },
              { proName: "FOREXCOM:DE30EUR", title: "DAX" },
              { proName: "FOREXCOM:FR40EUR", title: "CAC 40" },
              { proName: "FOREXCOM:JP225USD", title: "Nikkei 225" },
              { proName: "FOREXCOM:AU200AUD", title: "ASX 200" }
            ]
          },
          {
            title: "Commodities",
            symbols: [
              { proName: "OANDA:XAUUSD", title: "Gold" },
              { proName: "OANDA:XAGUSD", title: "Silver" },
              { proName: "OANDA:XPDUSD", title: "Palladium" },
              { proName: "OANDA:XPTUSD", title: "Platinum" },
              { proName: "OANDA:WTIUSD", title: "Crude Oil" },
              { proName: "OANDA:BRENTUSD", title: "Brent Oil" },
              { proName: "OANDA:NGASUSD", title: "Natural Gas" },
              { proName: "OANDA:CORNUSD", title: "Corn" }
            ]
          }
        ]
      })
      container.appendChild(script)
    }, 100)

    return () => {
      clearTimeout(timer)
      if (container) {
        container.innerHTML = ""
      }
    }
  }, [])

  return (
    <div className="w-full rounded-xl border border-[#DEBF74]/20 bg-gradient-to-br from-[#0f5132] to-[#0a1f0a] backdrop-blur-sm overflow-hidden">
      <div className="p-4 border-b border-[#DEBF74]/10">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-[#DEBF74]" />
          <h3 className="text-lg font-bold text-white">Market Overview</h3>
        </div>
      </div>
      <div className="tradingview-widget-container" ref={containerRef} style={{ minHeight: 600 }}>
        <div className="tradingview-widget-container__widget" />
      </div>
    </div>
  )
}

export default function MarketInsightsSection() {

  return (
    <section className="relative w-full py-12 sm:py-16 bg-gradient-to-br from-[#0a1f0a] via-[#0f5132] to-[#0a1f0a]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0f5132]/80 border border-[#DEBF74]/30 mb-4">
            <Activity className="w-4 h-4 text-[#DEBF74]" />
            <span className="text-sm font-semibold text-[#DEBF74]">Real-Time Data</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
            Market <span className="text-[#DEBF74]">Insights</span>
          </h2>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Track live forex cross rates with professional TradingView widgets
          </p>
        </div>

        {/* Forex Cross Rates Widget */}
        <div className="relative">
          <ForexCrossRates />
        </div>
      </div>
    </section>
  )
}

