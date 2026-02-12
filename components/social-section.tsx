"use client"

import { motion } from "framer-motion"
import Link from "next/link"

export function SocialSection() {
  return (
    <section className="relative w-full py-16 sm:py-20 md:py-24 overflow-hidden bg-[#0a1f0a]">
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
            <pattern id="diagonalLinesSocial" width="40" height="40" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="40" y2="40" stroke="rgb(34, 197, 94)" strokeWidth="0.5" opacity="0.3" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#diagonalLinesSocial)" />
        </svg>
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-[#0a1f0a]/40 via-[#0a1f0a]/60 to-[#0a1f0a]/90 pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-12 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3 }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="font-sans text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-4 sm:mb-6">
            <span className="text-[#DEBF74]">JOIN OUR</span>
            <br />
            <span className="italic text-green-400">COMMUNITY</span>
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-white/70 max-w-2xl mx-auto leading-relaxed">
            Connect with traders, share insights, and stay updated with the latest news and updates
          </p>
        </motion.div>

        {/* Social Links with Original Icons */}
        <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 md:gap-16">
          {/* Facebook */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: 0.1 }}
            whileHover={{ scale: 1.1 }}
          >
            <Link
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <img 
                src="https://cdn.simpleicons.org/facebook/1877F2" 
                alt="Facebook" 
                className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 object-contain filter drop-shadow-lg hover:drop-shadow-xl transition-all duration-300" 
              />
            </Link>
          </motion.div>

          {/* Instagram */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: 0.1 }}
            whileHover={{ scale: 1.1 }}
          >
            <Link
              href="https://www.instagram.com/dragonfundedcom?igsh=MTJhd25hbjNxcHFxZg=="
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <img 
                src="https://cdn.simpleicons.org/instagram/E4405F" 
                alt="Instagram" 
                className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 object-contain filter drop-shadow-lg hover:drop-shadow-xl transition-all duration-300" 
              />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

