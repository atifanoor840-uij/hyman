"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { KycContent } from "@/components/kyc/kyc-content"
import { Footer } from "@/components/footer"
import { getKycEligibility, type KycEligibilityResponse } from "@/lib/api/kyc"
import { ApiClientError } from "@/lib/api/client"
import { Loader2, ShieldAlert } from "lucide-react"

export default function KycPage() {
  const [eligible, setEligible] = useState<boolean | null>(null)
  const [message, setMessage] = useState<string>("")
  const [eligibilityData, setEligibilityData] = useState<KycEligibilityResponse | null>(null)

  useEffect(() => {
    let cancelled = false
    getKycEligibility()
      .then((res) => {
        if (cancelled) return
        setEligible(res.is_eligible)
        setEligibilityData(res)
        setMessage(res.message || "You must have a live order or instant account with credentials delivered to submit KYC documents.")
      })
      .catch((err) => {
        if (cancelled) return
        setEligible(false)
        setMessage(
          err instanceof ApiClientError
            ? err.message
            : "Unable to check KYC eligibility. Please try again."
        )
      })
    return () => {
      cancelled = true
    }
  }, [])

  const loading = eligible === null
  const showBlur = !loading && !eligible

  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <main className="min-w-0 flex-1 flex flex-col overflow-x-hidden p-3 sm:p-4 md:p-5 lg:ml-64 relative pb-8">
        <div
          className={`mx-auto w-full max-w-[1200px] flex flex-col flex-1 min-w-0 transition-all duration-300 ${
            showBlur ? "pointer-events-none select-none blur-sm" : ""
          }`}
        >
          <Header
            title="KYC"
            description="Complete identity verification to enable withdrawals and full account access."
          />

          <div className="mt-5 flex-1">
            {loading ? (
              <div className="flex flex-col items-center justify-center min-h-[280px] gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Checking eligibility…</p>
              </div>
            ) : (
              <KycContent
                hasKycSubmission={eligibilityData?.has_kyc_submission}
                kycStatus={eligibilityData?.kyc_status ?? undefined}
              />
            )}
          </div>

          <div className="mt-8">
            <Footer />
          </div>
        </div>

        {/* Overlay when not eligible: show message on top of blurred content */}
        {showBlur && (
          <div className="absolute inset-0 flex items-center justify-center p-4 pointer-events-auto">
            <div className="mx-auto w-full max-w-[480px] rounded-xl border border-amber-500/30 bg-card shadow-lg p-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="w-14 h-14 rounded-full bg-amber-500/10 flex items-center justify-center">
                  <ShieldAlert className="w-7 h-7 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
              <h2 className="text-lg font-semibold text-foreground mb-2">
                KYC not available
              </h2>
              <p className="text-sm text-muted-foreground">
                {message}
              </p>
              <p className="text-xs text-muted-foreground mt-3">
                You need a live order or an instant account with credentials delivered before you can submit KYC documents.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
