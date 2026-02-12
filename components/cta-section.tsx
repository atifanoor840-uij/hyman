"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"

export function CTASection() {
  return (
    <section className="relative w-full overflow-hidden bg-[#0a1f0a] py-16 sm:py-20 md:py-24">
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
            <pattern id="diagonalLinesCTA" width="40" height="40" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="40" y2="40" stroke="rgb(34, 197, 94)" strokeWidth="0.5" opacity="0.3" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#diagonalLinesCTA)" />
        </svg>
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-[#0a1f0a]/40 via-[#0a1f0a]/60 to-[#0a1f0a]/90 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 md:px-12">
        <div className="flex flex-col items-center text-center">
          {/* Main Heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3 }}
            className="mb-10 sm:mb-12"
          >
            <h2 className="font-sans text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight leading-[1.1]">
              <span className="text-[#DEBF74]">READY TO</span>
              <br />
              <span className="italic text-green-400">DOMINATE?</span>
            </h2>
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="flex flex-col items-center gap-4"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href="/signup"
                className="relative inline-block px-10 sm:px-14 md:px-16 py-4 sm:py-5 md:py-6 border-2 border-[#DEBF74] rounded-full font-mono text-sm sm:text-base md:text-lg tracking-widest uppercase bg-[#DEBF74] text-[#0a1f0a] font-bold hover:bg-transparent hover:text-[#DEBF74] transition-all duration-200 shadow-lg shadow-[#DEBF74]/40 flex items-center gap-3"
              >
                START EVALUATION
                <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              </Link>
            </motion.div>

            {/* Feature Badges */}
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm md:text-base font-mono text-white/60 tracking-wider">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-[#DEBF74] rounded-full animate-pulse" />
                <span className="text-[#DEBF74] font-semibold">90% PROFIT SPLIT</span>
              </span>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-[#DEBF74] rounded-full animate-pulse" />
                <span className="text-[#DEBF74] font-semibold">NO TIME LIMITS</span>
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
