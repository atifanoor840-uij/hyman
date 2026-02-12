"use client"
import Image from "next/image"

const logos = [
  { src: "logo 1.svg", alt: "Logo 1" },
  { src: "logo 3.svg", alt: "Logo 3" },
  { src: "logo 4.svg", alt: "Logo 4" },
  { src: "logo 5.svg", alt: "Logo 5" },
  { src: "logo 6.svg", alt: "Logo 6" },
  { src: "logo 7.svg", alt: "Logo 7" },
  { src: "logo 8.svg", alt: "Logo 8" },
  { src: "logo 9.svg", alt: "Logo 9" },
  { src: "logo 10.svg", alt: "Logo 10" },
  { src: "logo 11.svg", alt: "Logo 11" },
]

export default function FeaturedInSection() {
  return (
    <section className="relative w-full py-8 sm:py-12 bg-gradient-to-br from-[#0a1f0a] via-[#0f5132] to-[#0a1f0a]">
      <div className="container mx-auto px-4 sm:px-6">
        <h2 className="text-center text-xl sm:text-2xl md:text-3xl font-bold text-white mb-6 sm:mb-8">
          We featured in
        </h2>
        <div className="relative w-full bg-transparent rounded-2xl p-4 sm:p-6 overflow-hidden">
          <div className="flex items-center justify-center relative z-20">
            <div className="relative w-full overflow-hidden">
              {/* Left gradient fade */}
              <div className="pointer-events-none absolute inset-y-0 left-0 w-12 sm:w-24 z-10 bg-gradient-to-r from-transparent via-green-900/10 to-transparent"></div>
              {/* Right gradient fade */}
              <div className="pointer-events-none absolute inset-y-0 right-0 w-12 sm:w-24 z-10 bg-gradient-to-l from-transparent via-green-900/10 to-transparent"></div>
              
              {/* Marquee container */}
              <div className="marquee-container horizontal" style={{ "--duration": "40s", "--gap": "1rem" } as React.CSSProperties}>
                {/* First marquee set */}
                <div 
                  className="marquee-item horizontal pause-on-hover" 
                  style={{ "--duration": "40s", "--gap": "1rem" } as React.CSSProperties}
                >
                  {logos.map((logo, index) => (
                    <div key={`first-${index}`} className="flex items-center justify-center mx-1 sm:mx-2 h-6 sm:h-8 w-auto">
                      <div className="relative h-full w-auto opacity-70 hover:opacity-100 transition-opacity duration-300">
                        <Image
                          src={logo.src}
                          alt={logo.alt}
                          width={120}
                          height={32}
                          className="h-full w-auto object-contain filter grayscale hover:grayscale-0 transition-all duration-300 max-h-6 sm:max-h-8"
                        />
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Second marquee set (duplicate for seamless loop) */}
                <div 
                  className="marquee-item horizontal pause-on-hover" 
                  style={{ "--duration": "40s", "--gap": "1rem" } as React.CSSProperties}
                >
                  {logos.map((logo, index) => (
                    <div key={`second-${index}`} className="flex items-center justify-center mx-1 sm:mx-2 h-6 sm:h-8 w-auto">
                      <div className="relative h-full w-auto opacity-70 hover:opacity-100 transition-opacity duration-300">
                        <Image
                          src={logo.src}
                          alt={logo.alt}
                          width={120}
                          height={32}
                          className="h-full w-auto object-contain filter grayscale hover:grayscale-0 transition-all duration-300 max-h-6 sm:max-h-8"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

