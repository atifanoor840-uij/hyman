"use client"

import { useEffect, useState } from "react"

export function QuotesSection() {
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0)

  const quotes = [
    "Success in trading comes from discipline, not luck.",
    "The market rewards patience and punishes greed.",
    "Risk management is more important than profit maximization.",
    "Every loss is a lesson, every win is confirmation.",
    "Trading is 90% psychology and 10% strategy.",
    "Consistency beats perfection every time.",
    "The best traders are the most patient ones.",
    "Cut your losses short and let your profits run.",
    "Emotion is the enemy of profitable trading.",
    "Plan your trades and trade your plan."
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuoteIndex((prev) => (prev + 1) % quotes.length)
    }, 4000) // Change quote every 4 seconds

    return () => clearInterval(interval)
  }, [quotes.length])

  return (
    <section className="relative py-16 sm:py-20 overflow-hidden bg-[#0a1f0a]">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 grid grid-cols-6 md:grid-cols-12 gap-0">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={`v-${i}`} className="border-r border-green-500/10" />
          ))}
        </div>
        <div className="absolute inset-0 grid grid-rows-6 md:grid-rows-12 gap-0">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={`h-${i}`} className="border-b border-green-500/10" />
          ))}
        </div>
        <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="diagonalLinesQuotes" width="40" height="40" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="40" y2="40" stroke="rgb(34, 197, 94)" strokeWidth="0.5" opacity="0.3" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#diagonalLinesQuotes)" />
        </svg>
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-[#0a1f0a]/40 via-[#0a1f0a]/60 to-[#0a1f0a]/90 pointer-events-none" />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-5 relative z-10">
        <div className="text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 sm:mb-8 italic">
            WHY TRADERS
            <span className="block text-[#DEBF74] mt-1 sm:mt-2">
              LOVE DRAGON FUNDED
            </span>
          </h2>
          
          <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/30 border border-gray-700/30 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 backdrop-blur-sm">
            <p className="text-white text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-center leading-relaxed italic">
              "{quotes[currentQuoteIndex]}"
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
