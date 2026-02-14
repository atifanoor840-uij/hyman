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
    image: "https://res.cloudinary.com/dejjuhzug/image/upload/v1764395181/f0bdc4ec-31ba-43db-af2d-990985a4827d_ezvlm9.png",
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
    image: "https://res.cloudinary.com/dejjuhzug/image/upload/v1764395131/d1b7332b-1650-4a91-a1a0-8d09b53936ec_ougmpe.png",
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
              className="flex flex-col sm:flex-row items-start gap-4 p-4 rounded-xl border border-border bg-card hover:bg-muted/30 transition-colors"
            >
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-border bg-muted/50 p-2">
                <Image
                  src={platform.image}
                  alt={platform.name}
                  width={48}
                  height={48}
                  className="object-contain"
                  unoptimized
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground">{platform.name}</h3>
                <p className="text-sm text-muted-foreground mt-0.5">{platform.description}</p>
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
