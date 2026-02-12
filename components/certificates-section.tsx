"use client"

import { motion } from "framer-motion"
import Image from "next/image"

export function CertificatesSection() {
// Certificate images
  const certificates = [
    {
      id: 1,
      image: "https://res.cloudinary.com/dufcjjaav/image/upload/v1768385442/4_pg6zza.png",
      alt: "Certificate of Achievement",
    },
    {
      id: 2,
      image: "https://res.cloudinary.com/dufcjjaav/image/upload/v1768385442/1_ccsiqz.png",
      alt: "Certificate of Achievement",
    },
    {
      id: 3,
      image: "https://res.cloudinary.com/dufcjjaav/image/upload/v1768385443/2_vzu3ra.png",
      alt: "Certificate of Achievement",
    },
    {
      id: 4,
      image: "https://res.cloudinary.com/dufcjjaav/image/upload/v1768385442/1_2_mycrad.png",
      alt: "Certificate of Achievement",
    },
    {
      id: 5,
      image: "https://res.cloudinary.com/dufcjjaav/image/upload/v1768385443/1_1_udgmia.png",
      alt: "Certificate of Achievement",
    },
    {
      id: 6,
      image: "https://res.cloudinary.com/dufcjjaav/image/upload/v1768385442/2_1_yqqxmx.png",
      alt: "Certificate of Achievement",
    },
  ]

  // Duplicate certificates for seamless loop
  const duplicatedCertificates = [...certificates, ...certificates, ...certificates]

  return (
    <section className="relative w-full py-16 sm:py-20 md:py-24 overflow-hidden bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3 }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="font-sans text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-4 sm:mb-6">
            <span className="text-[#0a1f0a]">CERTIFICATIONS</span>
            <br />
            <span className="italic text-[#DEBF74]">& ACCREDITATIONS</span>
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Trusted and certified by leading financial authorities
          </p>
        </motion.div>

        {/* Certificates Grid - Infinite Scroll */}
        <div className="relative overflow-hidden">
          <div className="flex items-center animate-marquee">
            {duplicatedCertificates.map((cert, index) => (
            <div
              key={`${cert.id}-${index}`}
              className="relative group flex-shrink-0"
            >
              {/* Certificate Image - Full Image Without Card */}
              <div className="relative w-64 sm:w-80 md:w-96 lg:w-[500px] h-auto flex-shrink-0 transform-gpu transition-all duration-300 group-hover:scale-105">
                <Image
                  src={cert.image}
                  alt={cert.alt}
                  width={500}
                  height={400}
                  className="w-full h-auto object-contain"
                  unoptimized
                />
              </div>
            </div>
          ))}
          </div>
        </div>

        <style jsx>{`
          @keyframes marquee {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-33.333%);
            }
          }
          .animate-marquee {
            animation: marquee 12s linear infinite; /* Reduced from 15s to 12s for faster animation */
            will-change: transform;
          }
        `}</style>
      </div>
    </section>
  )
}

