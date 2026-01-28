"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ShieldCheck, Upload, CheckCircle2, Clock, FileText } from "lucide-react"

const steps = [
  { id: "id", label: "Identity document", desc: "Passport, national ID, or driver's licence", status: "verified" as const },
  { id: "address", label: "Proof of address", desc: "Utility bill or bank statement (within 3 months)", status: "verified" as const },
  { id: "selfie", label: "Selfie with document", desc: "Photo holding your ID next to your face", status: "pending" as const },
]

export function KycContent() {
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
          <Badge className="w-fit bg-amber-500/10 text-amber-600 border-amber-500/20 text-sm font-medium">
            <Clock className="w-3.5 h-3.5 mr-1" />
            In progress
          </Badge>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Verification steps
          </h3>
          <ul className="space-y-4">
            {steps.map((s) => (
              <li key={s.id} className="flex items-start gap-4">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                    s.status === "verified" ? "bg-black/10 dark:bg-white/10" : "bg-muted"
                  }`}
                >
                  {s.status === "verified" ? (
                    <CheckCircle2 className="w-5 h-5 text-black dark:text-foreground" />
                  ) : (
                    <Clock className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground">{s.label}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{s.desc}</p>
                  {s.status === "pending" && (
                    <Button size="sm" variant="outline" className="mt-2">
                      <Upload className="w-4 h-4 mr-1.5" />
                      Upload
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-foreground mb-4">Submit document</h3>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="kyc-type">Document type</Label>
              <select
                id="kyc-type"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option>Passport</option>
                <option>National ID</option>
                <option>Driver&apos;s licence</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="kyc-file">Upload file</Label>
              <Input id="kyc-file" type="file" accept="image/*,.pdf" className="cursor-pointer" />
            </div>
            <Button type="submit" className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90">
              <Upload className="w-4 h-4 mr-2" />
              Submit for verification
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}
