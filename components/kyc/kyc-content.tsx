"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShieldCheck, ExternalLink, Loader2, CheckCircle2, Clock } from "lucide-react"
import { createKycSession } from "@/lib/api/kyc"
import { ApiClientError } from "@/lib/api/client"

export interface KycContentProps {
  /** From eligibility: already submitted or current status */
  hasKycSubmission?: boolean
  kycStatus?: string | null
}

export function KycContent({ hasKycSubmission, kycStatus }: KycContentProps) {
  const [starting, setStarting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleStartVerification = async () => {
    setError(null)
    setStarting(true)
    try {
      const res = await createKycSession()
      if (res?.url) {
        window.location.href = res.url
        return
      }
      setError("No verification URL received.")
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Failed to start verification. Please try again.")
    } finally {
      setStarting(false)
    }
  }

  const statusLabel = kycStatus || (hasKycSubmission ? "In progress" : "Not started")
  const isComplete = kycStatus?.toLowerCase() === "approved" || kycStatus?.toLowerCase() === "verified"

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="p-6 border-primary/20 bg-primary/5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">KYC status</h2>
              <p className="text-sm text-muted-foreground">Identity verification</p>
            </div>
          </div>
          <Badge
            className={`w-fit text-sm font-medium ${
              isComplete
                ? "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20"
                : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
            }`}
          >
            {isComplete ? (
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
            ) : (
              <Clock className="w-3.5 h-3.5 mr-1" />
            )}
            {statusLabel}
          </Badge>
        </div>
      </Card>

      {!isComplete && (
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-4">
            Complete identity verification at our secure partner. You will be redirected to the verification flow; we will update your status via webhook when done.
          </p>
          {error && (
            <p className="text-sm text-destructive mb-4">{error}</p>
          )}
          <Button
            type="button"
            onClick={handleStartVerification}
            disabled={starting}
            className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 min-h-[44px] touch-manipulation"
          >
            {starting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Starting…
              </>
            ) : (
              <>
                <ExternalLink className="h-4 w-4" />
                Start verification
              </>
            )}
          </Button>
        </Card>
      )}
    </div>
  )
}
