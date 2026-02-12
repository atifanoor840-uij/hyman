"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Award, ExternalLink, Download, Eye, Heart } from "lucide-react"
import { useState } from "react"

type Achievement = {
  id: string
  title: string
  date: string
  pdfUrl: string
  design: "red" | "blue" | "gold" | "green" | "navy" | "wave"
}

const achievements: Achievement[] = [
  { id: "1", title: "Phase 1 evaluation passed", date: "2025-01-15", pdfUrl: "/certificates/sample.pdf", design: "red" },
  { id: "2", title: "Phase 2 evaluation passed", date: "2025-01-22", pdfUrl: "/certificates/sample.pdf", design: "blue" },
  { id: "3", title: "Funded trader certificate", date: "2025-01-26", pdfUrl: "/certificates/sample.pdf", design: "gold" },
  { id: "4", title: "Phase 1 Passed #1987", date: "2025-02-01", pdfUrl: "/certificates/sample.pdf", design: "green" },
  { id: "5", title: "Completion certificate", date: "2025-02-05", pdfUrl: "/certificates/sample.pdf", design: "navy" },
  { id: "6", title: "Achievement Gold #2042", date: "2025-02-10", pdfUrl: "/certificates/sample.pdf", design: "wave" },
]

const designStyles: Record<Achievement["design"], string> = {
  red: "bg-gradient-to-br from-red-600 to-red-800",
  blue: "bg-gradient-to-br from-blue-600 to-blue-900",
  gold: "bg-gradient-to-br from-amber-500 via-yellow-600 to-amber-800",
  green: "bg-gradient-to-br from-emerald-600 to-teal-800",
  navy: "bg-gradient-to-br from-slate-800 to-slate-900",
  wave: "bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-700",
}

export function AchievementContent() {
  const [previewCert, setPreviewCert] = useState<Achievement | null>(null)
  const [liked, setLiked] = useState<Set<string>>(new Set())

  const toggleLike = (id: string) => {
    setLiked((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="animate-fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {achievements.map((item) => (
          <div
            key={item.id}
            className="group bg-card rounded-xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col"
          >
            {/* Thumbnail - certificate design preview */}
            <div
              className={`relative aspect-[4/3] ${designStyles[item.design]} flex items-center justify-center overflow-hidden cursor-pointer`}
              onClick={() => setPreviewCert(item)}
            >
              <div className="text-white/90 text-center px-4">
                <p className="text-[10px] uppercase tracking-[0.2em] font-medium opacity-90">
                  Certificate
                </p>
                <p className="text-lg font-bold mt-1 truncate max-w-full">
                  {item.title.split(" ").slice(0, 2).join(" ")}
                </p>
                <p className="text-xs mt-0.5 opacity-80">Achievement</p>
              </div>
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
            {previewCert && (
              <p className="text-sm text-muted-foreground">{previewCert.date}</p>
            )}
          </DialogHeader>
          <div className="flex-1 min-h-0 overflow-hidden p-6">
            {previewCert && (
              <iframe
                src={`${previewCert.pdfUrl}#toolbar=1`}
                title={`Full preview: ${previewCert.title}`}
                className="w-full h-[60vh] min-h-[400px] rounded-lg border border-border"
              />
            )}
          </div>
          {previewCert && (
            <div className="flex flex-wrap gap-2 px-6 pb-6 border-t border-border pt-4">
              <a href={previewCert.pdfUrl} target="_blank" rel="noopener noreferrer">
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md border border-input bg-background hover:bg-accent"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open in new tab
                </button>
              </a>
              <a
                href={previewCert.pdfUrl}
                download={`${previewCert.title.replace(/\s+/g, "-")}.pdf`}
              >
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Download className="h-4 w-4" />
                  Download PDF
                </button>
              </a>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
