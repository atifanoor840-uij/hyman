"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useState, useEffect } from "react"

const MT5_LOGO =
  "https://upload.wikimedia.org/wikipedia/commons/2/27/MetaTrader_5.png"
const WHATSAPP_ICON =
  "https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"

type MT5CardVariant = "default" | "timer" | "discord"

const variantConfig = {
  timer: {
    heading: "Market Hours",
    sub: "London · 08:00 – 17:00",
    cta: "View Schedule",
    href: "/dashboard",
    fontStyle: "font-mono tracking-tight",
  },
  default: {
    heading: "MT5 Platform",
    sub: "Available Now",
    cta: "Get Funded",
    href: "/dashboard",
    fontStyle: "font-semibold tracking-tight",
  },
  discord: {
    heading: "Join on WhatsApp",
    sub: "Chat & support",
    cta: "Join WhatsApp",
    href: "https://wa.me",
    fontStyle: "font-medium italic",
  },
} as const

export function MT5PlatformCard({ variant = "default" }: { variant?: MT5CardVariant }) {
  const [seconds, setSeconds] = useState(24 * 3600 + 8)
  const cfg = variantConfig[variant]

  useEffect(() => {
    if (variant !== "timer") return
    const interval = setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => clearInterval(interval)
  }, [variant])

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  const formatTime = (n: number) => String(n).padStart(2, "0")

  const renderRightSection = () => {
    if (variant === "timer") {
      return (
        <div className="relative w-full sm:w-40 h-28 sm:h-36 flex-shrink-0 flex flex-col items-center justify-center">
          <div className="text-2xl sm:text-3xl font-mono font-semibold text-foreground tracking-tighter tabular-nums">
            {formatTime(hours)}:{formatTime(minutes)}:{formatTime(secs)}
          </div>
          <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">Session</p>
        </div>
      )
    }
    if (variant === "discord") {
      return (
        <div className="relative w-full sm:w-48 h-32 sm:h-40 flex-shrink-0 flex items-center justify-center">
          <div className="w-40 h-40 rounded-full bg-primary/25 blur-[40px] absolute" aria-hidden />
          <img
            src={WHATSAPP_ICON}
            alt="WhatsApp"
            className="relative z-10 h-20 w-20 sm:h-28 sm:w-28 object-contain drop-shadow-lg"
          />
        </div>
      )
    }
    return (
      <div className="action-card__images relative w-full sm:w-40 h-28 sm:h-36 flex-shrink-0 flex items-center justify-center">
        <div className="action-card__image action-card__image--z-2 absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden>
          <div className="w-32 h-32 rounded-full bg-primary/25 blur-[32px]" />
        </div>
        <div className="action-card__image action-card__image--z-1 relative z-10 flex items-center justify-center">
          <img src={MT5_LOGO} alt="MetaTrader 5" className="max-h-16 sm:max-h-20 w-auto object-contain drop-shadow-lg" />
        </div>
      </div>
    )
  }

  const isExternal = variant === "discord"

  return (
    <Card
      className="action-card overflow-hidden relative p-4 md:p-5 transition-shadow duration-200 hover:shadow-md animate-slide-in-up bg-card border-border min-w-0"
      style={{ animationDelay: "700ms" }}
    >
      <div className="action-card__body relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 min-h-[120px] sm:min-h-[130px]">
        <div className="action-card__content flex flex-col gap-2.5 z-10 flex-1">
          <h2 className={`action-card__heading text-sm sm:text-base font-bold text-foreground leading-tight ${cfg.fontStyle}`}>
            {cfg.heading}
          </h2>
          <p className="text-[10px] sm:text-xs text-muted-foreground -mt-0.5">{cfg.sub}</p>
          {isExternal ? (
            <a
              href={cfg.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex"
            >
              <Button size="sm" variant="secondary" className="h-7 text-xs px-3 bg-primary text-primary-foreground hover:bg-primary/90">
                {cfg.cta}
              </Button>
            </a>
          ) : (
            <Button asChild size="sm" variant="secondary" className="h-7 text-xs px-3 w-fit bg-primary text-primary-foreground hover:bg-primary/90">
              <Link href={cfg.href}>{cfg.cta}</Link>
            </Button>
          )}
        </div>
        {renderRightSection()}
      </div>
    </Card>
  )
}
