"use client"

import { useState } from "react"
import { AdminPageContainer } from "@/components/admin/page-container"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PaperPlaneTilt, EnvelopeSimple, List, Code, Eye } from "@phosphor-icons/react"

const defaultHtmlTemplate = `<h2>Hello!</h2>
<p>This is a sample <strong>HTML</strong> email.</p>
<ul>
  <li>List item 1</li>
  <li>List item 2</li>
</ul>
<p><a href="#">Click here</a></p>`

export default function AdminEmailPage() {
  const [body, setBody] = useState("")
  const [sendAsHtml, setSendAsHtml] = useState(false)

  const previewHtml = sendAsHtml
    ? body.trim()
      ? body
      : defaultHtmlTemplate
    : `<pre style="font-family: inherit; white-space: pre-wrap;">${escapeHtml(body.trim() || "Enter message to preview...")}</pre>`

  return (
    <AdminPageContainer
      title="Email Sender"
      description="Send transactional emails or bulk emails to users."
      actions={
        <Button size="sm" className="gap-2">
          <PaperPlaneTilt size={16} weight="duotone" />
          Send test email
        </Button>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <Card className="rounded-xl border-2 border-border bg-card shadow-sm animate-slide-in-up">
            <CardHeader className="border-b border-border bg-muted/20">
              <CardTitle className="text-lg font-bold tracking-tight flex items-center gap-2">
                <EnvelopeSimple size={20} weight="duotone" />
                Compose Email
              </CardTitle>
              <p className="text-sm font-medium text-muted-foreground">
                Send a single email or broadcast to a segment.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="recipient">Recipient(s)</Label>
                <Input
                  id="recipient"
                  placeholder="user@example.com or leave empty for broadcast"
                  className="h-9"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="segment">Send to segment</Label>
                <Select>
                  <SelectTrigger id="segment" className="h-9">
                    <SelectValue placeholder="All users / Custom segment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All users</SelectItem>
                    <SelectItem value="verified">KYC Verified</SelectItem>
                    <SelectItem value="pending_kyc">KYC Pending</SelectItem>
                    <SelectItem value="active_orders">Active orders</SelectItem>
                    <SelectItem value="inactive">Inactive (30+ days)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" placeholder="Email subject" className="h-9" />
              </div>
              <div className="flex items-center justify-between rounded-lg border-2 border-border bg-muted/40 px-4 py-3">
                <div>
                  <Label htmlFor="send-html" className="text-sm font-bold cursor-pointer">
                    Send as HTML email
                  </Label>
                  <p className="text-xs font-medium text-muted-foreground mt-0.5">
                    Recipients will see formatted HTML instead of plain text.
                  </p>
                </div>
                <Switch
                  id="send-html"
                  checked={sendAsHtml}
                  onCheckedChange={setSendAsHtml}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="body">
                  Message {sendAsHtml && <span className="text-muted-foreground font-normal">(HTML supported)</span>}
                </Label>
                <Textarea
                  id="body"
                  placeholder={sendAsHtml ? "Write HTML content, e.g. <h2>Title</h2><p>Paragraph</p>" : "Write your email content here."}
                  className="min-h-[200px] resize-y font-mono text-sm"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button className="gap-2">
                  <PaperPlaneTilt size={16} weight="duotone" />
                  Send email
                </Button>
                <Button variant="outline">Save as draft</Button>
              </div>
            </CardContent>
          </Card>

<Card className="rounded-xl border-2 border-border bg-card shadow-sm animate-slide-in-up" style={{ animationDelay: "100ms" }}>
          <CardHeader className="border-b border-border bg-muted/20">
            <CardTitle className="text-lg font-bold tracking-tight flex items-center gap-2">
              <Eye size={20} weight="duotone" />
              Preview
            </CardTitle>
            <p className="text-sm font-medium text-muted-foreground">
                {sendAsHtml ? "Live HTML preview as recipients will see it." : "Plain text preview."}
              </p>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="preview" className="w-full">
                <TabsList className="w-full">
                  <TabsTrigger value="preview" className="gap-2">
                    <Eye size={16} weight="duotone" />
                    Rendered
                  </TabsTrigger>
                  <TabsTrigger value="source" className="gap-2">
                    <Code size={16} weight="duotone" />
                    Source
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="preview" className="mt-3">
                  <div className="rounded-lg border border-border bg-muted/20 overflow-hidden">
                    <iframe
                      title="HTML email preview"
                      srcDoc={wrapHtmlForPreview(previewHtml)}
                      className="w-full min-h-[280px] border-0 bg-white dark:bg-zinc-900"
                      sandbox="allow-same-origin"
                    />
                  </div>
                </TabsContent>
                <TabsContent value="source" className="mt-3">
                  <pre className="rounded-lg border border-border bg-muted/30 p-4 text-xs font-mono overflow-auto max-h-[280px] whitespace-pre-wrap break-words">
                    {sendAsHtml ? (body.trim() || defaultHtmlTemplate) : (body.trim() || "(empty)")}
                  </pre>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <Card className="rounded-xl border-2 border-border bg-card shadow-sm animate-slide-in-up h-fit" style={{ animationDelay: "100ms" }}>
          <CardHeader className="border-b border-border bg-muted/20">
            <CardTitle className="text-lg font-bold tracking-tight flex items-center gap-2">
              <List size={20} weight="duotone" />
              Templates
            </CardTitle>
            <p className="text-sm font-medium text-muted-foreground">
              Quick insert common templates.
            </p>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              "Welcome email",
              "KYC approved",
              "KYC rejected",
              "Withdrawal processed",
              "Password reset",
              "Promo announcement",
            ].map((name, i) => (
              <Button key={i} variant="outline" className="w-full justify-start h-9 text-sm" size="sm">
                {name}
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>
    </AdminPageContainer>
  )
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

function wrapHtmlForPreview(html: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head><body style="margin:1rem; font-family: system-ui, sans-serif;">${html}</body></html>`
}
