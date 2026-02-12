"use client"

import React, { useMemo, useState, useEffect } from "react"
import Image from "next/image"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
 

type DiscountPopupProps = {
  imageSrc?: string
  headline?: string
  subHeadline?: string
  ctaText?: string
  poweredByText?: string
  autoOpen?: boolean
  autoOpenDelay?: number
}

export default function DiscountPopup(props: DiscountPopupProps) {
  const {
    imageSrc = "https://res.cloudinary.com/dufcjjaav/image/upload/v1763968878/WhatsApp_Image_2025-11-24_at_11.41.19_84f3eb16_jc3yyq.jpg",
    headline = "Save up to 60% on your account",
    subHeadline = "Use coupon codes below at checkout",
    ctaText = "Copy Code",
    poweredByText = "Powered by Dragon Funded",
    autoOpen = true,
    autoOpenDelay = 2000,
  } = props

  const storageKey = useMemo(() => "df_discount_popup_seen", [])
  const [open, setOpen] = useState(false)
  const [hasAutoOpened, setHasAutoOpened] = useState(false)

  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  
  const handleCopyCode = (code: string) => {
    navigator.clipboard?.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 1500)
  }

  // Auto-open popup after delay
  useEffect(() => {
    if (autoOpen && !hasAutoOpened) {
      // Check if popup was already shown today
      if (typeof window !== 'undefined') {
        const lastShown = localStorage.getItem(storageKey)
        const today = new Date().toDateString()
        
        if (lastShown !== today) {
          const timer = setTimeout(() => {
            setOpen(true)
            setHasAutoOpened(true)
            localStorage.setItem(storageKey, today)
          }, autoOpenDelay)

          return () => clearTimeout(timer)
        }
      }
    }
  }, [autoOpen, autoOpenDelay, hasAutoOpened, storageKey])

  

  return (
    <>
      {/* Floating actions: Desktop (right rail) */}
      <div className="hidden md:flex fixed right-0 top-1/2 -translate-y-1/2 z-[1000] flex-col items-end gap-2">
        <button
          aria-label="Open discount popup"
          onClick={() => setOpen(true)}
          className="rounded-l-xl bg-[#DEBF74] text-black px-3 py-4 text-xs font-extrabold tracking-wide shadow-[0_0_0_6px_rgba(222,191,116,0.25)] hover:shadow-[0_0_0_10px_rgba(222,191,116,0.35)] border border-[#DEBF74]/60 transition"
          style={{ writingMode: "vertical-rl" as React.CSSProperties["writingMode"], textOrientation: "mixed", transform: "rotate(180deg)" }}
        >
          DISCOUNT
        </button>
      </div>

      {/* Mobile FAB (right side center) */}
      <div className="md:hidden fixed top-1/2 right-4 -translate-y-1/2 z-[1000]">
        <button
          aria-label="Open discount popup"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-full bg-[#DEBF74] text-black px-4 py-2.5 text-sm font-bold shadow-[0_0_0_6px_rgba(222,191,116,0.25)] hover:shadow-[0_0_0_10px_rgba(222,191,116,0.35)] border border-[#DEBF74]/60 transition"
        >
          <span>Discount</span>
          <span className="hidden xs:inline">60%</span>
        </button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="p-0 max-w-[95vw] sm:max-w-lg md:max-w-2xl lg:max-w-3xl w-full overflow-hidden rounded-xl sm:rounded-2xl border border-white/10 text-white max-h-[95vh] overflow-y-auto mx-auto">
          <div className="flex flex-col md:flex-row">
            {/* Left visual: hidden on mobile, covers half on desktop */}
            <div className="relative hidden md:block md:w-1/2 min-h-[350px] max-h-[450px]">
              <Image
                fill
                src={imageSrc}
                alt="Discount illustration"
                className="object-cover"
                sizes="50vw"
                priority
              />
            </div>

            {/* Right content area with dark green background */}
            <div className="flex-1 bg-[#0f2f1f] min-h-[350px] md:min-h-0 flex flex-col">
              <DialogTitle className="sr-only">{headline}</DialogTitle>
              <div className="flex flex-col h-full">
                {/* Header with discount badge */}
                <div className="relative p-4 sm:p-5 md:p-6 border-b border-white/10">
                  <div className="text-center">
                    <div className="inline-flex items-center gap-2 rounded-full bg-[#DEBF74] text-black px-2.5 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-bold mb-2 sm:mb-3">
                      <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-black rounded-full animate-pulse"></span>
                      Limited Offer
                    </div>
                    <h2 className="text-lg sm:text-xl md:text-xl font-bold text-white mb-1.5 sm:mb-2 px-2">{headline}</h2>
                    <p className="text-white/70 text-xs sm:text-sm px-2">{subHeadline}</p>
                  </div>
                </div>

                {/* Coupon codes */}
                <div className="p-4 sm:p-5 md:p-6 space-y-3 sm:space-y-4 flex-1">
                  <div className="rounded-lg sm:rounded-xl bg-white/5 border border-white/10 p-3 sm:p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                      <div className="text-[11px] sm:text-xs md:text-sm text-white/80">60% off</div>
                      <Button type="button" variant="secondary" className="h-7 sm:h-8 px-3 sm:px-4 text-[10px] sm:text-xs rounded-lg w-full sm:w-auto" onClick={() => handleCopyCode('WING2026')}>
                        {copiedCode === 'WING2026' ? 'Copied ✓' : 'Copy Code'}
                      </Button>
                    </div>
                    <div className="font-mono font-bold text-[#DEBF74] select-all text-sm sm:text-base md:text-base break-all">WING2026</div>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-4 sm:p-5 md:p-6 pt-0">
                  <Button onClick={() => setOpen(false)} className="w-full h-10 sm:h-11 rounded-lg sm:rounded-xl bg-[#DEBF74] hover:bg-[#DEBF74]/90 text-black font-bold text-xs sm:text-sm">
                    Close
                  </Button>
                  <p className="text-center text-[10px] sm:text-xs text-white/60 mt-3 sm:mt-4">{poweredByText}</p>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}


