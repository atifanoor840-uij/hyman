"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { ShieldCheck, Loader2, CheckCircle2, Clock, XCircle, UploadCloud } from "lucide-react"
import { getMyKyc, submitKyc } from "@/lib/api/app-client"
import { ApiClientError } from "@/lib/api/client"

export function KycContent() {
  const [status, setStatus] = useState<{ status: string; rejectReason: string | null } | null | undefined>(undefined)
  const [documentType, setDocumentType] = useState("passport")
  const [front, setFront] = useState<File | null>(null)
  const [back, setBack] = useState<File | null>(null)
  const [selfie, setSelfie] = useState<File | null>(null)
  const [address, setAddress] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = async () => {
    try {
      const res = await getMyKyc()
      setStatus(res.kyc)
    } catch {
      setStatus(null)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!front || !selfie) {
      setError("A front document image and a selfie are required.")
      return
    }
    setError(null)
    setSubmitting(true)
    try {
      const form = new FormData()
      form.set("documentType", documentType)
      form.set("front", front)
      if (back) form.set("back", back)
      form.set("selfie", selfie)
      if (address) form.set("address", address)
      await submitKyc(form)
      await refresh()
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Failed to submit documents. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  if (status === undefined) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const isApproved = status?.status === "approved"
  const isPending = status?.status === "pending"
  const isRejected = status?.status === "rejected"

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
              isApproved
                ? "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20"
                : isRejected
                  ? "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
                  : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
            }`}
          >
            {isApproved ? (
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
            ) : isRejected ? (
              <XCircle className="w-3.5 h-3.5 mr-1" />
            ) : (
              <Clock className="w-3.5 h-3.5 mr-1" />
            )}
            {status?.status ?? "Not started"}
          </Badge>
        </div>
        {isRejected && status?.rejectReason && (
          <p className="mt-3 text-sm text-red-600 dark:text-red-400">{status.rejectReason}</p>
        )}
      </Card>

      {!isApproved && !isPending && (
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-4">
            Upload a government-issued ID and a selfie to verify your identity. Our team typically reviews submissions within 1-2 business days.
          </p>
          {error && <p className="text-sm text-destructive mb-4">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="documentType">Document type</Label>
              <select
                id="documentType"
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="passport">Passport</option>
                <option value="national_id">National ID</option>
                <option value="drivers_license">Driver&apos;s license</option>
              </select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="front">Document (front) *</Label>
                <input id="front" type="file" accept="image/*,.pdf" onChange={(e) => setFront(e.target.files?.[0] ?? null)} className="text-sm" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="back">Document (back)</Label>
                <input id="back" type="file" accept="image/*,.pdf" onChange={(e) => setBack(e.target.files?.[0] ?? null)} className="text-sm" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="selfie">Selfie *</Label>
                <input id="selfie" type="file" accept="image/*" onChange={(e) => setSelfie(e.target.files?.[0] ?? null)} className="text-sm" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Proof of address</Label>
                <input id="address" type="file" accept="image/*,.pdf" onChange={(e) => setAddress(e.target.files?.[0] ?? null)} className="text-sm" />
              </div>
            </div>
            <Button type="submit" disabled={submitting} className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Submitting…
                </>
              ) : (
                <>
                  <UploadCloud className="h-4 w-4" /> Submit for review
                </>
              )}
            </Button>
          </form>
        </Card>
      )}
    </div>
  )
}
