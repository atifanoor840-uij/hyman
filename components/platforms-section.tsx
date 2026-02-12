"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

type PlatformLogo = {
  name: string
  short: string
  logo: string
}

export function PlatformsSection() {
  const platforms: PlatformLogo[] = [
    {
      name: "MetaTrader 5 (MT5)",
      short: "MT5",
      logo: "https://res.cloudinary.com/dufcjjaav/image/upload/v1752130069/MT5-removebg-preview_1_lqagz7.png",
    },
    {
      name: "MetaTrader 4 (MT4)",
      short: "MT4",
      logo: "https://res.cloudinary.com/dufcjjaav/image/upload/v1752130069/512x512bb-removebg-preview_qnfrll.png",
    },
    {
      name: "cTrader",
      short: "cTrader",
      logo: "https://res.cloudinary.com/dufcjjaav/image/upload/v1758294692/ctrader-logo-1_bqkgmq.webp",
    },
    {
      name: "Trader Locker",
      short: "Trader Locker",
      logo: "https://res.cloudinary.com/dufcjjaav/image/upload/v1758294802/67a56f8806c917471f5c17ce_tradelocker_logo-black-1024x311_magszj.webp",
    },
  ]

  return (
    <section className="relative py-12 sm:py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="sm:text-center mb-0 sm:mb-12">
          <h2 className="hidden sm:block text-2xl sm:text-3xl md:text-4xl font-semibold text-black mb-4">
            Practice with your favourite Trading Platforms
          </h2>
          <p className="hidden sm:block text-gray-600 text-sm sm:text-base max-w-2xl mx-auto">
            Choose from industry-leading trading platforms and start your evaluation journey today.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8 items-center">
          {platforms.slice(0, 4).map((p) => (
            <div key={p.short} className={`w-full h-20 sm:h-24 md:h-28 flex items-center justify-center p-2 sm:p-4 rounded-lg transition-colors relative ${
              p.short === "Trader Locker" 
                ? "bg-gray-100 border-2 border-dashed border-gray-300" 
                : "bg-gray-50 hover:bg-gray-100"
            }`}>
              <Image src={p.logo} alt={`${p.short} logo`} width={160} height={56} className={`object-contain max-w-full max-h-full ${
                p.short === "Trader Locker" ? "opacity-50" : ""
              }`} />
              {p.short === "Trader Locker" && (
                <div className="absolute top-1 right-1 bg-gradient-to-r from-[#DEBF74] to-[#DEBF74] text-black text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                  Coming Soon
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="mt-8 sm:mt-12 flex justify-center">
          <Link href="/signup" rel="noopener noreferrer">
            <Button className="px-6 sm:px-8 py-3 sm:py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-sm sm:text-base font-semibold shadow-sm hover:shadow-md transition-all">
              Start Challenge
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}


