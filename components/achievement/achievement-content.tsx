"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Award, ExternalLink, Download, Eye } from "lucide-react"
import { useState } from "react"

type Certificate = {
  id: string
  title: string
  date: string
  pdfUrl: string
}

const certificates: Certificate[] = [
  { id: "1", title: "Phase 1 evaluation passed", date: "2025-01-15", pdfUrl: "/certificates/sample.pdf" },
  { id: "2", title: "Phase 2 evaluation passed", date: "2025-01-22", pdfUrl: "/certificates/sample.pdf" },
  { id: "3", title: "Funded trader certificate", date: "2025-01-26", pdfUrl: "/certificates/sample.pdf" },
]

export function AchievementContent() {
  const [previewCert, setPreviewCert] = useState<Certificate | null>(null)

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {certificates.map((cert) => (
          <Card
            key={cert.id}
            className="overflow-hidden flex flex-col transition-all duration-300 hover:shadow-lg"
          >
            <div className="p-4 border-b border-border">
              <div className="flex items-center gap-2 mb-1">
                <Award className="w-5 h-5 text-primary shrink-0" />
                <h3 className="font-semibold text-foreground">{cert.title}</h3>
              </div>
              <p className="text-xs text-muted-foreground">{cert.date}</p>
            </div>

            {/* PDF preview */}
            <div className="relative bg-muted/30 flex-1 min-h-[200px] group">
              <iframe
                src={`${cert.pdfUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                title={`Preview: ${cert.title}`}
                className="w-full h-[200px] border-0 pointer-events-none select-none"
              />
              <button
                type="button"
                className="absolute inset-0 flex items-center justify-center bg-background/70 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                onClick={() => setPreviewCert(cert)}
              >
                <span className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium">
                  <Eye className="w-4 h-4" />
                  Full preview
                </span>
              </button>
            </div>

            <div className="p-4 flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 min-w-[100px]"
                onClick={() => setPreviewCert(cert)}
              >
                <Eye className="w-4 h-4 mr-1.5" />
                Preview
              </Button>
              <a href={cert.pdfUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="w-full">
                  <ExternalLink className="w-4 h-4 mr-1.5" />
                  View PDF
                </Button>
              </a>
              <a href={cert.pdfUrl} download={`${cert.title.replace(/\s+/g, "-")}.pdf`}>
                <Button variant="secondary" size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <Download className="w-4 h-4 mr-1.5" />
                  Download
                </Button>
              </a>
            </div>
          </Card>
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
                <Button variant="outline" size="sm">
                  <ExternalLink className="w-4 h-4 mr-1.5" />
                  Open in new tab
                </Button>
              </a>
              <a
                href={previewCert.pdfUrl}
                download={`${previewCert.title.replace(/\s+/g, "-")}.pdf`}
              >
                <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <Download className="w-4 h-4 mr-1.5" />
                  Download PDF
                </Button>
              </a>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
