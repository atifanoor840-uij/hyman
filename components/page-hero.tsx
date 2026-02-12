interface PageHeroProps {
  title: string
  subtitle?: string
  current: string
}

export default function PageHero({ title, subtitle, current }: PageHeroProps) {
  return (
    <section className="relative overflow-hidden pt-20 pb-16 md:pt-24 md:pb-20 bg-[#0a1f0a] border-b border-green-500/10">
      {/* Background Pattern - Matching Hero Section */}
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
            <pattern id="pageHeroDiagonalLines" width="40" height="40" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="40" y2="40" stroke="rgb(34, 197, 94)" strokeWidth="0.5" opacity="0.3" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#pageHeroDiagonalLines)" />
        </svg>
      </div>

      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-[#0a1f0a]/40 via-[#0a1f0a]/60 to-[#0a1f0a]/90 pointer-events-none" />

      <div className="relative z-10 max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation - Enhanced Professional Style */}
        <nav className="flex items-center justify-center text-xs md:text-sm text-white/60 mb-8 md:mb-10">
          <a href="/" className="hover:text-[#DEBF74] transition-colors duration-200 font-medium">Home</a>
          <span className="mx-3 text-white/40">/</span>
          <span className="text-[#DEBF74] font-semibold">{current}</span>
        </nav>

        {/* Main Heading - Enhanced Professional Style */}
        <div className="text-center space-y-6">
          <h1 className="font-sans text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.1]">
            <span className="block">{title}</span>
          </h1>
          
          {/* Subtitle - Enhanced Styling */}
          {subtitle ? (
            <div className="mt-6 md:mt-8">
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white/70 max-w-3xl mx-auto leading-relaxed font-light">
                {subtitle}
              </p>
            </div>
          ) : null}

          {/* Enhanced Decorative Line */}
          <div className="mt-10 md:mt-12 flex items-center justify-center">
            <div className="h-[2px] w-24 md:w-32 rounded-full bg-gradient-to-r from-transparent via-[#DEBF74] to-transparent shadow-lg" style={{ boxShadow: '0 0 24px rgba(222,191,116,0.6)' }} />
          </div>
        </div>
      </div>
    </section>
  )
}




