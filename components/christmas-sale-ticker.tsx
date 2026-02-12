"use client"

export function ChristmasSaleTicker() {
  return (
    <div className="fixed top-0 left-0 right-0 z-[101] bg-gradient-to-r from-[#0a1f0a] via-[#0a1f0a] to-[#0a1f0a] h-[48px]">
      <div className="relative overflow-hidden h-full flex items-center">
        {/* Gradient fade edges for smooth effect */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#0a1f0a] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#0a1f0a] to-transparent z-10 pointer-events-none" />
        
        {/* Subtle animated background shimmer */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#DEBF74]/5 to-transparent animate-shimmer" />
        
        {/* Scrolling content container */}
        <div className="relative">
          {/* Infinite scroll wrapper */}
          <div className="flex animate-scroll-fast">
            {/* First set of items */}
            <div className="flex items-center gap-12 px-12 flex-shrink-0">
              {[1, 2, 3, 4].map((set) => (
                <div key={set} className="flex items-center gap-6 whitespace-nowrap">
                  <span className="text-xs sm:text-sm md:text-base font-semibold text-[#DEBF74] uppercase tracking-[0.1em]">
                    New Year 2026 Sale
                  </span>
                  <div className="h-3 w-px bg-[#DEBF74]/30" />
                  <span className="text-xs sm:text-sm md:text-base font-bold text-white">
                    UP TO 60% OFF
                  </span>
                </div>
              ))}
            </div>
            {/* Duplicate for seamless loop */}
            <div className="flex items-center gap-12 px-12 flex-shrink-0" aria-hidden="true">
              {[1, 2, 3, 4].map((set) => (
                <div key={set} className="flex items-center gap-6 whitespace-nowrap">
                  <span className="text-xs sm:text-sm md:text-base font-semibold text-[#DEBF74] uppercase tracking-[0.1em]">
                    New Year 2026 Sale
                  </span>
                  <div className="h-3 w-px bg-[#DEBF74]/30" />
                  <span className="text-xs sm:text-sm md:text-base font-bold text-white">
                    UP TO 60% OFF
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

