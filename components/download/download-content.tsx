"use client"

import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

const platforms = [
  {
    name: "MetaTrader 5",
    short: "MT5",
    description: "Advanced multi-asset platform. Download for Windows, Mac, iOS, or Android.",
    image: "https://res.cloudinary.com/dqzibxdtn/image/upload/v1771391692/images__2_-removebg-preview_ih4rc5.png",
    links: [
      { label: "Windows", href: "https://www.metatrader5.com/en/download" },
      { label: "Mac", href: "https://www.metatrader5.com/en/download" },
      { label: "Android", href: "https://play.google.com/store/apps/details?id=net.metaquotes.metatrader5" },
      { label: "iOS", href: "https://apps.apple.com/app/metatrader-5/id413251709" },
    ],
  },
  {
    name: "MetaTrader 4",
    short: "MT4",
    description: "Most popular forex platform. Download for Windows, Mac, iOS, or Android.",
    image: "https://res.cloudinary.com/dqzibxdtn/image/upload/v1771391691/images__1_-removebg-preview_asoydh.png",
    links: [
      { label: "Windows", href: "https://www.metatrader4.com/en/download" },
      { label: "Mac", href: "https://www.metatrader4.com/en/download" },
      { label: "Android", href: "https://play.google.com/store/apps/details?id=net.metaquotes.metatrader4" },
      { label: "iOS", href: "https://apps.apple.com/app/metatrader-4/id496212596" },
    ],
  },
]

export function DownloadContent() {
  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="border border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold">MT5 & MT4 Downloads</CardTitle>
          <p className="text-sm text-muted-foreground">
            Download MetaTrader 5 or MetaTrader 4 for your evaluation. Choose your device below.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {platforms.map((platform) => (
            <div
              key={platform.name}
              className="flex flex-col sm:flex-row items-start gap-5 p-5 rounded-xl border border-border bg-card hover:bg-muted/30 transition-colors"
            >
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-border bg-white p-2.5">
                <Image
                  src={platform.image}
                  alt={platform.name}
                  width={64}
                  height={64}
                  className="object-contain"
                  unoptimized
                />
              </div>
              <div className="flex-1 min-w-0 overflow-visible">
                <h3 className="font-semibold text-foreground">{platform.name}</h3>
                <p className="text-sm text-muted-foreground mt-0.5 break-words leading-relaxed">{platform.description}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {platform.links.map((link) => (
                    <Button key={link.label} variant="outline" size="sm" asChild>
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5"
                      >
                        <Download className="h-3.5 w-3.5" />
                        {link.label}
                      </a>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
