"use client"
import { ReactNode } from "react"
import PartnerSidebar from "./partner-sidebar"

interface PartnerDashboardLayoutProps {
  children: ReactNode
  title?: string
  subtitle?: string
  showHero?: boolean
}

export default function PartnerDashboardLayout({
  children,
  title,
  subtitle,
  showHero = false
}: PartnerDashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-indigo-950/20 to-background relative">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-indigo-950/5 to-background" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl" />

      <div className="relative flex h-screen">
        <PartnerSidebar />
        <main className="flex-1 overflow-y-auto">
          {showHero && title && (
            <div className="border-b border-gray-800/50 bg-gray-900/40 backdrop-blur-sm">
              <div className="max-w-7xl mx-auto px-8 py-10">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-white">{title}</h1>
                  {subtitle && (
                    <p className="text-gray-400 mt-3 text-lg">{subtitle}</p>
                  )}
                </div>
              </div>
            </div>
          )}
          <div className="max-w-7xl mx-auto px-8 py-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}



