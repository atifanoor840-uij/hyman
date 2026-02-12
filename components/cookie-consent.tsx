"use client"
import { useState, useEffect } from "react"
import { ChevronRightIcon } from "@heroicons/react/24/outline"

type CookieCategory = "necessary" | "preferences" | "statistics" | "marketing"

interface CookiePreferences {
  necessary: boolean
  preferences: boolean
  statistics: boolean
  marketing: boolean
}

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true, // Always enabled
    preferences: true,
    statistics: true,
    marketing: true,
  })

  useEffect(() => {
    // Check if user has already made a choice
    if (typeof window !== "undefined") {
      const consentGiven = localStorage.getItem("df_cookie_consent")
      if (!consentGiven) {
        // Show banner after a short delay
        const timer = setTimeout(() => {
          setShowBanner(true)
        }, 500)
        return () => clearTimeout(timer)
      }
    }
  }, [])

  const handleToggle = (category: CookieCategory) => {
    if (category === "necessary") return // Cannot disable necessary cookies
    setPreferences((prev) => ({
      ...prev,
      [category]: !prev[category],
    }))
  }

  const handleAllowAll = () => {
    const allEnabled: CookiePreferences = {
      necessary: true,
      preferences: true,
      statistics: true,
      marketing: true,
    }
    setPreferences(allEnabled)
    saveConsent(allEnabled)
  }

  const handleAllowSelection = () => {
    saveConsent(preferences)
  }

  const saveConsent = (prefs: CookiePreferences) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("df_cookie_consent", JSON.stringify(prefs))
      localStorage.setItem("df_cookie_consent_date", new Date().toISOString())
      setShowBanner(false)
    }
  }

  if (!showBanner) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] w-full">
      <div className="w-full bg-gradient-to-br from-[#1a3d2e] via-[#0f5132] to-[#1a3d2e] border-t-2 border-[#DEBF74]/30 shadow-2xl">
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-white/10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 max-w-7xl mx-auto">
            {/* Left: Logo and Heading */}
            <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0 w-full sm:w-auto">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden bg-[#DEBF74] flex items-center justify-center flex-shrink-0 shadow-lg">
                <img
                  src="https://res.cloudinary.com/dufcjjaav/image/upload/v1760892554/dragon_funded_logo-01-01-01_bkaqko.png"
                  alt="Dragon Funded"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-2">This website uses cookies</h2>
                <p className="text-xs sm:text-sm text-white/85 leading-relaxed">
                  We use cookies to personalise content and ads, to provide social media features and to analyse our traffic. 
                  We also share information about your use of our site with our social media, advertising and analytics partners 
                  who may combine it with other information that you've provided to them or that they've collected from your use of their services.
                </p>
              </div>
            </div>

            {/* Right: Action Buttons */}
            <div className="flex flex-row sm:flex-col gap-2 sm:gap-2.5 w-full sm:w-auto flex-shrink-0">
              <button
                onClick={handleAllowAll}
                className="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg bg-[#DEBF74] hover:bg-[#DEBF74]/90 text-black font-bold text-xs sm:text-sm transition-all border-2 border-[#DEBF74] shadow-lg hover:shadow-xl"
              >
                Allow all
              </button>
              <button
                onClick={handleAllowSelection}
                className="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg bg-transparent hover:bg-white/10 text-white font-bold text-xs sm:text-sm transition-all border-2 border-white/40 hover:border-white/60"
              >
                Allow selection
              </button>
            </div>
          </div>
        </div>

        {/* Cookie Categories */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-white/10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 max-w-7xl mx-auto">
            {/* Cookie Category Toggles */}
            <div className="flex items-center gap-4 sm:gap-6 flex-wrap w-full sm:w-auto">
              {(["necessary", "preferences", "statistics", "marketing"] as CookieCategory[]).map((category) => (
                <div key={category} className="flex items-center gap-2 sm:gap-3">
                  <span className="text-xs sm:text-sm font-medium text-white capitalize">{category}</span>
                  <button
                    onClick={() => handleToggle(category)}
                    disabled={category === "necessary"}
                    className={`relative inline-flex h-6 w-10 sm:h-7 sm:w-12 items-center rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-[#DEBF74] focus:ring-offset-2 focus:ring-offset-[#0f5132] ${
                      preferences[category]
                        ? "bg-[#DEBF74]"
                        : "bg-gray-600"
                    } ${category === "necessary" ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:opacity-80"}`}
                    aria-label={`Toggle ${category} cookies`}
                  >
                    <span
                      className={`inline-block h-4 w-4 sm:h-5 sm:w-5 transform rounded-full bg-white shadow-md transition-transform ${
                        preferences[category] ? "translate-x-5 sm:translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>

            {/* Show Details Button */}
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center gap-1.5 text-xs sm:text-sm text-white/90 hover:text-white transition-colors font-medium w-full sm:w-auto justify-center sm:justify-start"
            >
              <span>Show details</span>
              <ChevronRightIcon
                className={`w-4 h-4 transition-transform duration-200 ${showDetails ? "rotate-90" : ""}`}
              />
            </button>
          </div>
        </div>

        {/* Details Section */}
        {showDetails && (
          <div className="px-4 sm:px-6 py-3 sm:py-4 bg-black/20 border-b border-white/10 max-w-7xl mx-auto">
            <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-white/70">
              <div>
                <p className="font-semibold text-white mb-1">Necessary</p>
                <p>These cookies are essential for the website to function properly. They cannot be disabled.</p>
              </div>
              <div>
                <p className="font-semibold text-white mb-1">Preferences</p>
                <p>These cookies remember your preferences and settings to provide a personalized experience.</p>
              </div>
              <div>
                <p className="font-semibold text-white mb-1">Statistics</p>
                <p>These cookies help us understand how visitors interact with our website by collecting anonymous information.</p>
              </div>
              <div>
                <p className="font-semibold text-white mb-1">Marketing</p>
                <p>These cookies are used to deliver relevant advertisements and track campaign performance.</p>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-4 sm:px-6 py-2 sm:py-3 bg-black/30 border-t border-white/5 max-w-7xl mx-auto">
          <p className="text-xs text-white/50 text-center">
            Cookie consent by Dragon Funded
          </p>
        </div>
      </div>
    </div>
  )
}

