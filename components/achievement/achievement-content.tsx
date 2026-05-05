"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Award, ExternalLink, Download, Eye, Heart, Trophy, ShoppingCart } from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { apiRequest } from "@/lib/api/client"

type Achievement = {
  id: string
  title: string
  date: string
  pdfUrl: string
  imageUrl?: string
  design: "red" | "blue" | "gold" | "green" | "navy" | "wave"
}

type ApiCertificate = {
  id?: string | number
  title?: string
  name?: string
  date?: string
  created_at?: string
  pdf_url?: string
  pdfUrl?: string
  image_url?: string
  imageUrl?: string
  [key: string]: unknown
}

type MyCertificatesResponse = {
  message?: string
  certificates: ApiCertificate[]
}

const DESIGN_KEYS: Achievement["design"][] = ["red", "blue", "gold", "green", "navy", "wave"]

const designStyles: Record<Achievement["design"], string> = {
  red: "bg-gradient-to-br from-red-600 to-red-800",
  blue: "bg-gradient-to-br from-purple-600 to-purple-900",
  gold: "bg-gradient-to-br from-amber-500 via-yellow-600 to-amber-800",
  green: "bg-gradient-to-br from-emerald-600 to-teal-800",
  navy: "bg-gradient-to-br from-slate-800 to-slate-900",
  wave: "bg-gradient-to-br from-purple-500 via-purple-600 to-fuchsia-700",
}

function mapApiToAchievement(cert: ApiCertificate, index: number): Achievement {
  const id = String(cert.id ?? index + 1)
  const title = cert.title ?? cert.name ?? `Certificate ${id}`
  const date = cert.date ?? cert.created_at ?? ""
  const pdfUrl = cert.pdf_url ?? cert.pdfUrl ?? ""
  const imageUrl = cert.image_url ?? cert.imageUrl
  const design = DESIGN_KEYS[index % DESIGN_KEYS.length]
  return { id, title, date, pdfUrl, imageUrl, design }
}

export function AchievementContent() {
  const [previewCert, setPreviewCert] = useState<Achievement | null>(null)
  const [liked, setLiked] = useState<Set<string>>(new Set())
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchCertificates() {
      setLoading(true)
      setError(null)
      try {
        const res = await apiRequest<MyCertificatesResponse>("/orders/my-certificates")
        const certs = res?.certificates ?? []
        if (Array.isArray(certs) && certs.length > 0) {
          setAchievements(certs.map((c, i) => mapApiToAchievement(c, i)))
        } else {
          setAchievements([])
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load certificates")
        setAchievements([])
      } finally {
        setLoading(false)
      }
    }
    fetchCertificates()
  }, [])

  const toggleLike = (id: string) => {
    setLiked((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // Empty state: no certificates
  if (!loading && achievements.length === 0) {
    return (
      <div className="animate-fade-in">
        <div className="rounded-xl border border-dashed border-border bg-muted/30 p-12 sm:p-16 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-6">
            <Trophy className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No certificates yet
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            You have not achieved any milestone. Buy a challenge and prove your skill to get an achievement certificate.
          </p>
          <Link
            href="/buy-challenge"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <ShoppingCart className="w-4 h-4" />
            Buy a challenge
          </Link>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="animate-fade-in">
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center">
          <p className="text-destructive font-medium">{error}</p>
          <p className="text-sm text-muted-foreground mt-1">
            Please try again later.
          </p>
        </div>
      </div>
    )
  }

  // Loading state
  if (loading) {
    return (
      <div className="animate-fade-in">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-64 rounded-xl border border-border bg-muted/30 animate-pulse"
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {achievements.map((item) => (
          <div
            key={item.id}
            className="group bg-card rounded-xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col"
          >
            {/* Thumbnail - certificate design preview or image */}
            <div
              className={`relative aspect-[4/3] ${item.imageUrl ? "bg-muted" : designStyles[item.design]} flex items-center justify-center overflow-hidden cursor-pointer`}
              onClick={() => setPreviewCert(item)}
            >
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-white/90 text-center px-4">
                  <p className="text-[10px] uppercase tracking-[0.2em] font-medium opacity-90">
                    Certificate
                  </p>
                  <p className="text-lg font-bold mt-1 truncate max-w-full">
                    {item.title.split(" ").slice(0, 2).join(" ")}
                  </p>
                  <p className="text-xs mt-0.5 opacity-80">Achievement</p>
                </div>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <span className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/90 text-slate-800 text-xs font-medium">
                  <Eye className="w-3.5 h-3.5" />
                  Preview
                </span>
              </div>
            </div>

            {/* Title + badge + heart */}
            <div className="p-4 flex-1 flex flex-col">
              <h3 className="font-semibold text-foreground text-sm mb-2 line-clamp-2">
                {item.title}
              </h3>
              <div className="mt-auto flex items-center justify-between gap-2">
                <span className="inline-flex items-center rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 px-2.5 py-0.5 text-[11px] font-medium">
                  1 certificate
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    toggleLike(item.id)
                  }}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                  aria-label={liked.has(item.id) ? "Unlike" : "Like"}
                >
                  <Heart
                    className={`w-4 h-4 ${liked.has(item.id) ? "fill-red-500 text-red-500" : ""}`}
                  />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Full preview modal */}
      <Dialog open={!!previewCert} onOpenChange={(open) => !open && setPreviewCert(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 gap-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
            <DialogTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              {previewCert?.title}
            </DialogTitle>
            {previewCert?.date && (
              <p className="text-sm text-muted-foreground">{previewCert.date}</p>
            )}
          </DialogHeader>
          <div className="flex-1 min-h-0 overflow-hidden p-6">
            {previewCert && (
              <>
                {previewCert.imageUrl ? (
                  <img
                    src={previewCert.imageUrl}
                    alt={previewCert.title}
                    className="w-full max-h-[60vh] object-contain rounded-lg border border-border"
                  />
                ) : previewCert.pdfUrl ? (
                  <iframe
                    src={`${previewCert.pdfUrl}#toolbar=1`}
                    title={`Full preview: ${previewCert.title}`}
                    className="w-full h-[60vh] min-h-[400px] rounded-lg border border-border"
                  />
                ) : (
                  <div className="flex items-center justify-center h-[60vh] text-muted-foreground">
                    No preview available
                  </div>
                )}
              </>
            )}
          </div>
          {previewCert && (previewCert.pdfUrl || previewCert.imageUrl) && (
            <div className="flex flex-wrap gap-2 px-6 pb-6 border-t border-border pt-4">
              {(previewCert.pdfUrl || previewCert.imageUrl) && (
                <a
                  href={previewCert.pdfUrl || previewCert.imageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md border border-input bg-background hover:bg-accent"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Open in new tab
                  </button>
                </a>
              )}
              {(previewCert.pdfUrl || previewCert.imageUrl) && (
                <a
                  href={previewCert.pdfUrl || previewCert.imageUrl}
                  download={`${previewCert.title.replace(/\s+/g, "-")}.${previewCert.pdfUrl ? "pdf" : "png"}`}
                >
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </button>
                </a>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
