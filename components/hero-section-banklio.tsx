"use client"

import Link from "next/link"
import { useEffect, useRef } from "react"

// USP Card Component
function USPCard({ icon, text, className = "" }: { icon: string; text: string; className?: string }) {
  return (
    <div 
      className={`flex items-center gap-2 sm:gap-3 px-2 sm:px-4 py-2 sm:py-3 rounded-2xl sm:rounded-3xl ${className}`}
      style={{
        background: 'linear-gradient(179.071deg, rgb(30, 60, 40) 0%, rgb(10, 30, 20) 100%)',
        boxShadow: 'rgba(34, 197, 94, 0.2) 0px 1px 0px 0px inset'
      }}
    >
      <div 
        className="flex-shrink-0 rounded-xl sm:rounded-3xl p-1 sm:p-2"
        style={{ backgroundColor: 'rgb(10, 30, 20)' }}
      >
        <div className="w-6 h-6 sm:w-9 sm:h-9 relative">
          <img 
            src={icon} 
            alt="" 
            className="w-full h-full object-cover"
            style={{ 
              filter: 'brightness(0) saturate(100%) invert(58%) sepia(62%) saturate(504%) hue-rotate(85deg) brightness(94%) contrast(94%)'
            }}
          />
        </div>
      </div>
      <p 
        className="text-white text-[10px] sm:text-sm font-normal leading-tight"
        style={{ fontFamily: '"Poppins", sans-serif', letterSpacing: '-0.01em' }}
      >
        {text}
      </p>
    </div>
  )
}

// TradingView Ticker Tape Component
function TradingViewTicker() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Clear any existing content
    containerRef.current.innerHTML = ''

    // Create widget container
    const widgetContainer = document.createElement('div')
    widgetContainer.className = 'tradingview-widget-container__widget'
    containerRef.current.appendChild(widgetContainer)

    // Create and append script
    const script = document.createElement('script')
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js'
    script.async = true
    script.innerHTML = JSON.stringify({
      symbols: [
        { proName: "FX:EURUSD", title: "EUR/USD" },
        { proName: "FX:GBPUSD", title: "GBP/USD" },
        { proName: "FX:USDJPY", title: "USD/JPY" },
        { proName: "FX:AUDUSD", title: "AUD/USD" },
        { proName: "FX:USDCAD", title: "USD/CAD" },
        { proName: "FX:USDCHF", title: "USD/CHF" },
        { proName: "FX:NZDUSD", title: "NZD/USD" },
        { proName: "FX:EURGBP", title: "EUR/GBP" },
        { proName: "FX:EURJPY", title: "EUR/JPY" },
        { proName: "FX:GBPJPY", title: "GBP/JPY" },
        { proName: "OANDA:XAUUSD", title: "Gold" },
        { proName: "OANDA:XAGUSD", title: "Silver" },
        { proName: "CURRENCYCOM:US100", title: "NASDAQ 100" },
        { proName: "CURRENCYCOM:US30", title: "Dow Jones" }
      ],
      showSymbolLogo: true,
      colorTheme: "dark",
      isTransparent: true,
      displayMode: "adaptive",
      locale: "en"
    })
    containerRef.current.appendChild(script)

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = ''
      }
    }
  }, [])

  return (
    <div className="tradingview-widget-container" ref={containerRef}>
      <div className="tradingview-widget-container__widget"></div>
    </div>
  )
}

export default function HeroSectionBanklio() {

  return (
    <section 
      id="hero" 
      data-hero-section
      className="relative w-full overflow-hidden min-h-fit"
      style={{ backgroundColor: 'rgb(5, 15, 10)' }}
    >
      {/* Circle Bg pattern - Visible on all screens */}
      <div 
        className="absolute pointer-events-none" 
        style={{ 
          opacity: 0.6, 
          width: '100vw', 
          height: '100vw', 
          maxWidth: '1438px', 
          maxHeight: '1438px',
          left: '50%', 
          transform: 'translateX(-50%)',
          top: '-30%'
        }}
      >
        <img 
          src="https://framerusercontent.com/images/GeNX3iB8jApSL0WK5AmaujSWo.png" 
          alt="Background circle pattern" 
          className="w-full h-full object-cover"
          style={{ 
            filter: 'brightness(0) saturate(100%) invert(45%) sepia(96%) saturate(382%) hue-rotate(93deg) brightness(92%) contrast(88%)'
          }}
        />
      </div>

      {/* Line Pattern BG - Visible on all screens */}
      <div 
        className="absolute pointer-events-none" 
        style={{ 
          left: '50%', 
          transform: 'translateX(-50%)', 
          top: '0', 
          width: '100%', 
          maxWidth: '1523px', 
          height: '100%',
          maxHeight: '1117px'
        }}
      >
        <img 
          src="https://framerusercontent.com/images/mObDLUFjY88q1Ba0dobkTvdD4U.webp" 
          alt="Line Pattern" 
          className="w-full h-full object-cover"
          style={{ 
            filter: 'brightness(0) saturate(100%) invert(45%) sepia(96%) saturate(382%) hue-rotate(93deg) brightness(92%) contrast(88%)'
          }}
        />
      </div>

      

      {/* Main Content Container */}
      <div className="relative z-10 flex flex-col items-center pt-28 sm:pt-28 md:pt-36 lg:pt-40 pb-10 sm:pb-4">
        {/* Hero Container */}
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center">
            
            {/* Above Heading - MT5 Available Badge */}
            <div 
              className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full mb-4 sm:mb-6"
              style={{
                background: 'linear-gradient(179.071deg, rgb(30, 60, 40) 0%, rgb(10, 30, 20) 100%)',
                boxShadow: 'rgba(34, 197, 94, 0.3) 0px 1px 0px 0px inset'
              }}
            >
              <div className="w-5 h-5 sm:w-6 sm:h-6 relative">
                <img 
                  src="https://framerusercontent.com/images/1lkGBcJI4YV4qAC0aVvOWuxhtA.png" 
                  alt="MT5 Icon" 
                  className="w-full h-full object-cover"
                />
              </div>
              <p 
                className="text-white text-xs sm:text-sm font-medium"
                style={{ fontFamily: '"Poppins", sans-serif' }}
              >
                MetaTrader 5 Available
              </p>
            </div>

            {/* Main Heading */}
            <h1 
              className="text-[1.35rem] sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-3 sm:mb-4 uppercase"
              style={{ fontFamily: '"Poppins", sans-serif', letterSpacing: '-0.03em', lineHeight: '1.15' }}
            >
              Fuel Your Trades, Command Up to $400K.
            </h1>

            {/* Subheading */}
            <p 
              className="text-sm sm:text-base md:text-lg lg:text-xl text-white/90 max-w-3xl mx-auto mb-6 sm:mb-8 px-2"
              style={{ fontFamily: '"Poppins", sans-serif', letterSpacing: '-0.02em', lineHeight: '1.5em' }}
            >
              Turn Market Moves Into Real Cash — Keep Every Dollar You Earn with <span className="font-semibold" style={{ color: 'rgb(34, 197, 94)' }}>Dragon Funding</span>
            </p>

            {/* USP Cards - Mobile: 2+1 layout, Desktop: all 3 in one row */}
            {/* Desktop layout - all 3 cards in one row */}
            <div className="hidden sm:flex flex-row justify-center gap-3 mb-8 w-full">
              <USPCard 
                icon="https://framerusercontent.com/images/OodBVDZJaQGqpkDqxBWHbu5P8A.png" 
                text="80% Profit Reward" 
              />
              <USPCard 
                icon="https://framerusercontent.com/images/Sr21vqu7AINalQ4Zax2pCklqPE.png" 
                text="24-Hour Payouts" 
              />
              <USPCard 
                icon="https://framerusercontent.com/images/tV5sSNhfTfkjqr4GPoVjK228Y.png" 
                text="Instant Live Chat Reply" 
              />
            </div>
            
            {/* Mobile layout - 2 cards in first row, 1 centered below */}
            <div className="flex sm:hidden flex-col items-center gap-2 mb-5 w-full px-2">
              <div className="flex flex-row justify-center gap-2 w-full">
                <USPCard 
                  icon="https://framerusercontent.com/images/OodBVDZJaQGqpkDqxBWHbu5P8A.png" 
                  text="80% Profit Reward" 
                  className="flex-1 max-w-[180px]"
                />
                <USPCard 
                  icon="https://framerusercontent.com/images/Sr21vqu7AINalQ4Zax2pCklqPE.png" 
                  text="24-Hour Payouts" 
                  className="flex-1 max-w-[180px]"
                />
              </div>
              <div className="flex justify-center w-full">
                <USPCard 
                  icon="https://framerusercontent.com/images/tV5sSNhfTfkjqr4GPoVjK228Y.png" 
                  text="Instant Live Chat Reply" 
                />
              </div>
            </div>

            {/* Get Funded Button */}
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-white text-base sm:text-lg md:text-xl font-medium capitalize transition-all duration-300 hover:scale-105 shadow-lg shadow-green-500/30 hover:shadow-green-500/50"
              style={{
                fontFamily: '"Poppins", sans-serif',
                letterSpacing: '-0.03em',
                background: 'linear-gradient(268deg, rgb(34, 197, 94) 0%, rgb(16, 185, 129) 100%)'
              }}
            >
              Get Funded
              <svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3.5 8H13.5M13.5 8L9.5 4M13.5 8L9.5 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          </div>
        </div>

        {/* TradingView Forex Ticker */}
        <div className="w-full mt-4 sm:mt-8 overflow-hidden pb-2">
          <TradingViewTicker />
        </div>
      </div>
    </section>
  )
}
