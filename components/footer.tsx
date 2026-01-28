"use client"

import Link from "next/link"
import { ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export function Footer() {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <footer className="border-t border-border bg-muted/30 font-sans">
      <div className="w-full px-4 py-6 font-sans">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
          <div className="flex flex-col md:flex-row items-center gap-4 text-sm text-muted-foreground font-sans">
            <span className="font-sans">© 2025 Forex Pro</span>
            <div className="flex flex-wrap gap-4 font-sans">
              <Link href="/privacy" className="hover:text-foreground transition-colors font-sans">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-foreground transition-colors font-sans">
                Terms & Conditions
              </Link>
              <Link href="/about" className="hover:text-foreground transition-colors font-sans">
                About Us
              </Link>
              <Link href="/contact" className="hover:text-foreground transition-colors font-sans">
                Contact
              </Link>
              <Link href="/help" className="hover:text-foreground transition-colors font-sans">
                Help & Support
              </Link>
              <Link href="/faq" className="hover:text-foreground transition-colors font-sans">
                FAQ
              </Link>
              <Link href="/refund" className="hover:text-foreground transition-colors font-sans">
                Refund Policy
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://discord.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Discord"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.97 12.97 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
              </svg>
            </a>
            <a
              href="https://telegram.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Telegram"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
              </svg>
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Instagram"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Twitter"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-4 p-4 bg-muted/50 rounded-lg border border-border font-sans">
          <div className="text-xs text-muted-foreground leading-relaxed font-sans">
            <p>
              All information provided on this site is intended solely for the study purposes related to trading on
              financial markets and does not serve in any way as a specific investment recommendation, business
              recommendation, investment opportunity analysis or similar general recommendation regarding the trading of
              investment instruments.
            </p>
            
            {isExpanded && (
              <div className="mt-2 space-y-2">
                <p>
                  Trading in foreign exchange markets, contracts for difference (CFDs), and other financial instruments
                  carries a high level of risk and may not be suitable for all investors. The high degree of leverage can
                  work against you as well as for you. Before deciding to trade foreign exchange or any other financial
                  instrument, you should carefully consider your investment objectives, level of experience, and risk
                  appetite.
                </p>
                <p>
                  The possibility exists that you could sustain a loss of some or all of your initial investment and
                  therefore you should not invest money that you cannot afford to lose. You should be aware of all the risks
                  associated with foreign exchange trading and seek advice from an independent financial advisor if you have
                  any doubts.
                </p>
                <p>
                  Past performance is not indicative of future results. Any opinions, news, research, analyses, prices, or
                  other information contained on this website is provided as general market commentary and does not
                  constitute investment advice. Forex Pro will not accept liability for any loss or damage, including without
                  limitation to, any loss of profit, which may arise directly or indirectly from use of or reliance on such
                  information.
                </p>
                <p>
                  Please be aware that trading involves substantial risk of loss and is not suitable for every investor. You
                  should carefully consider whether such trading is suitable for you in light of your circumstances,
                  knowledge, and financial resources. You may lose all or more than your initial investment.
                </p>
              </div>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-2 h-7 px-2 text-xs text-primary hover:text-primary/80 hover:bg-primary/10"
            >
              {isExpanded ? (
                <>
                  See less <ChevronUp className="ml-1 h-3 w-3" />
                </>
              ) : (
                <>
                  See more <ChevronDown className="ml-1 h-3 w-3" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

    </footer>
  )
}
