"use client"

import { useEffect, useMemo, useState } from "react"
import { AdminShell } from "@/components/admin/admin-shell"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { adminListUsers, type AdminUserRow } from "@/lib/api/app-client"
import { ApiClientError } from "@/lib/api/client"
import { isValidEmail } from "@/lib/auth-utils"
import { Loader2, Mail, RefreshCcw, Send, X } from "lucide-react"

type SendResult = {
  ok: boolean
  account?: string
  summary?: {
    total: number
    sent: number
    failed: number
  }
  results?: Array<{
    to: string
    ok: boolean
    error?: string
  }>
  error?: string
}

function uniqueEmails(emails: string[]) {
  const map = new Map<string, string>()
  for (const raw of emails) {
    const e = String(raw || "").trim().toLowerCase()
    if (!e) continue
    if (!map.has(e)) map.set(e, e)
  }
  return Array.from(map.values())
}

function parseEmailList(input: string): string[] {
  const parts = String(input || "")
    .split(/[\s,;]+/g)
    .map((p) => p.trim())
    .filter(Boolean)
  return uniqueEmails(parts)
}

const FROM_ACCOUNTS = [
  { id: "fxonyx", label: "support@fxonyx.com" },
  { id: "genzprop", label: "helpdesk@genzprop.com" },
] as const

export default function AdminEmailSenderPage() {
  const { toast } = useToast()

  const [users, setUsers] = useState<AdminUserRow[]>([])
  const [usersLoading, setUsersLoading] = useState(true)
  const [usersError, setUsersError] = useState<string | null>(null)
  const [search, setSearch] = useState("")

  const [fromAccount, setFromAccount] = useState<(typeof FROM_ACCOUNTS)[number]["id"]>("fxonyx")
  const [subject, setSubject] = useState("")
  const [html, setHtml] = useState<string>("<h1>Hello from GenzProp</h1>\n<p>Paste your HTML here.</p>")

  const [manualInput, setManualInput] = useState("")
  const [selected, setSelected] = useState<Record<string, boolean>>({})

  const [sending, setSending] = useState(false)
  const [resultOpen, setResultOpen] = useState(false)
  const [sendResult, setSendResult] = useState<SendResult | null>(null)

  const loadUsers = async () => {
    setUsersLoading(true)
    setUsersError(null)
    try {
      const data = await adminListUsers()
      setUsers(data.users ?? [])
    } catch (e) {
      if (e instanceof ApiClientError) setUsersError(e.message || "Failed to load users.")
      else setUsersError("Failed to load users.")
      setUsers([])
    } finally {
      setUsersLoading(false)
    }
  }

  useEffect(() => {
    void loadUsers()
  }, [])

  const userRows = useMemo(() => {
    const q = search.trim().toLowerCase()
    const base = users
      .filter((u) => Boolean(String(u.email || "").trim()))
      .map((u) => ({
        id: u.id,
        name: u.name || "—",
        email: u.email.trim().toLowerCase(),
        verified: u.emailVerified,
      }))
    const filtered = q
      ? base.filter((u) => u.email.includes(q) || u.name.toLowerCase().includes(q))
      : base
    filtered.sort((a, b) => (a.email < b.email ? -1 : 1))
    return filtered
  }, [users, search])

  const selectedEmails = useMemo(() => {
    const picked = Object.keys(selected).filter((e) => selected[e])
    return uniqueEmails(picked)
  }, [selected])

  const invalidSelected = useMemo(() => {
    return selectedEmails.filter((e) => !isValidEmail(e))
  }, [selectedEmails])

  const addManualEmails = () => {
    const emails = parseEmailList(manualInput)
    if (emails.length === 0) return

    const invalid = emails.filter((e) => !isValidEmail(e))
    if (invalid.length) {
      toast({
        title: "Invalid emails",
        description: `Fix these: ${invalid.slice(0, 4).join(", ")}${invalid.length > 4 ? "…" : ""}`,
        variant: "destructive",
      })
      return
    }

    setSelected((prev) => {
      const next = { ...prev }
      for (const e of emails) next[e] = true
      return next
    })
    setManualInput("")
  }

  const clearRecipients = () => setSelected({})

  const selectAllVisible = () => {
    setSelected((prev) => {
      const next = { ...prev }
      for (const u of userRows) {
        if (u.email) next[u.email] = true
      }
      return next
    })
  }

  const send = async () => {
    if (sending) return

    const to = selectedEmails
    const subjectTrim = subject.trim()
    const htmlTrim = html.trim()

    if (!subjectTrim) {
      toast({ title: "Missing subject", description: "Please enter email subject.", variant: "destructive" })
      return
    }
    if (!htmlTrim) {
      toast({ title: "Missing HTML", description: "Please paste email HTML.", variant: "destructive" })
      return
    }
    if (to.length === 0) {
      toast({ title: "No recipients", description: "Select users or add manual emails.", variant: "destructive" })
      return
    }
    if (invalidSelected.length) {
      toast({
        title: "Invalid recipient emails",
        description: invalidSelected.slice(0, 4).join(", ") + (invalidSelected.length > 4 ? "…" : ""),
        variant: "destructive",
      })
      return
    }

    setSending(true)
    setSendResult(null)
    try {
      const res = await fetch("/api/admin/email/send", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          account: fromAccount,
          subject: subjectTrim,
          html: htmlTrim,
          to,
        }),
      })

      const data = (await res.json().catch(() => null)) as SendResult | null
      if (!res.ok || !data?.ok) {
        const msg = data?.error || `Request failed (${res.status})`
        toast({ title: "Send failed", description: msg, variant: "destructive" })
        setSendResult(data || { ok: false, error: msg })
        setResultOpen(true)
        return
      }

      setSendResult(data)
      setResultOpen(true)
      toast({
        title: "Email queued",
        description: `Account: ${data.account || fromAccount}, sent: ${data.summary?.sent ?? 0}, failed: ${data.summary?.failed ?? 0}`,
      })
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Request failed"
      toast({ title: "Send failed", description: msg, variant: "destructive" })
      setSendResult({ ok: false, error: msg })
      setResultOpen(true)
    } finally {
      setSending(false)
    }
  }

  return (
    <AdminShell
      title="Email Sender"
      description="Send HTML emails to selected users (one-by-one)."
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="h-9 rounded-full border border-purple-400/30 bg-gradient-to-r from-purple-800 via-purple-950 to-purple-800 px-4 text-xs font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] hover:from-purple-700 hover:via-purple-900 hover:to-purple-700"
            onClick={() => void loadUsers()}
            disabled={usersLoading}
          >
            {usersLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCcw className="h-4 w-4 mr-2" />}
            Refresh users
          </Button>
          <Button
            className="h-9 rounded-full border border-emerald-400/30 bg-gradient-to-r from-emerald-700 via-emerald-950 to-emerald-700 px-4 text-xs font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] hover:from-emerald-600 hover:via-emerald-900 hover:to-emerald-600"
            onClick={() => void send()}
            disabled={sending}
          >
            {sending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
            Send
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-4">
        <Card className="lg:col-span-2 overflow-hidden rounded-3xl border border-border/80 bg-card shadow-sm">
          <div className="border-b border-border/80 bg-muted/20 px-5 sm:px-6 py-4 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-border/70 bg-background/50">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-sm font-semibold tracking-tight text-foreground">Composer</h2>
                  <p className="text-xs text-muted-foreground">Paste HTML and preview before sending.</p>
                </div>
              </div>
            </div>
            <Badge variant="outline" className="rounded-full border-border/70 bg-background/40 px-3 py-1 text-xs">
              {selectedEmails.length} recipients
            </Badge>
          </div>

          <div className="p-5 sm:p-6 space-y-5">
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                From email
              </Label>
              <Select
                value={fromAccount}
                onValueChange={(v) => {
                  const next = FROM_ACCOUNTS.find((a) => a.id === v)?.id
                  if (next) setFromAccount(next)
                }}
              >
                <SelectTrigger className="h-11 rounded-2xl border-border/70 bg-background/40">
                  <SelectValue placeholder="Select sender" />
                </SelectTrigger>
                <SelectContent>
                  {FROM_ACCOUNTS.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Sender credentials are read from server environment variables (not stored in the browser).
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject" className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Subject
              </Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Email subject"
                className="h-11 rounded-2xl border-border/70 bg-background/40"
              />
            </div>

            <Tabs defaultValue="editor">
              <TabsList className="rounded-2xl">
                <TabsTrigger value="editor" className="rounded-xl">Editor</TabsTrigger>
                <TabsTrigger value="preview" className="rounded-xl">Preview</TabsTrigger>
              </TabsList>
              <TabsContent value="editor" className="mt-3">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    HTML
                  </Label>
                  <Textarea
                    value={html}
                    onChange={(e) => setHtml(e.target.value)}
                    className="min-h-[360px] rounded-2xl border-border/70 bg-background/40 font-mono text-xs"
                    placeholder="<h1>...</h1>"
                  />
                </div>
              </TabsContent>
              <TabsContent value="preview" className="mt-3">
                <div className="rounded-2xl border border-border/70 bg-background/40 overflow-hidden">
                  <div className="border-b border-border/70 bg-muted/20 px-4 py-3 text-xs text-muted-foreground font-semibold uppercase tracking-widest">
                    Preview (sanity-check layout)
                  </div>
                  <div className="p-4">
                    <iframe
                      title="Email preview"
                      className="w-full min-h-[380px] rounded-xl border border-border/60 bg-background"
                      sandbox=""
                      srcDoc={html}
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </Card>

        <Card className="overflow-hidden rounded-3xl border border-border/80 bg-card shadow-sm">
          <div className="border-b border-border/80 bg-muted/20 px-5 py-4 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <h2 className="text-sm font-semibold tracking-tight text-foreground">Recipients</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Manual emails + pick users.</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                className="h-9 rounded-2xl border-border/70"
                onClick={clearRecipients}
                disabled={selectedEmails.length === 0}
              >
                Clear
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-9 rounded-2xl border-border/70"
                onClick={selectAllVisible}
                disabled={userRows.length === 0}
              >
                Select visible
              </Button>
            </div>
          </div>

          <div className="p-5 space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Add emails (comma / space / newline)
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  placeholder="user1@email.com, user2@email.com"
                  className="h-11 rounded-2xl border-border/70 bg-background/40"
                />
                <Button
                  type="button"
                  className="h-11 rounded-2xl"
                  onClick={addManualEmails}
                  disabled={!manualInput.trim()}
                >
                  Add
                </Button>
              </div>
            </div>

            {selectedEmails.length ? (
              <div className="rounded-2xl border border-border/70 bg-muted/20 p-3">
                <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/80">
                  Selected ({selectedEmails.length})
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedEmails.slice(0, 18).map((e) => (
                    <span
                      key={e}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background/60 px-2.5 py-1 text-xs font-semibold text-foreground"
                    >
                      {e}
                      <button
                        type="button"
                        className="inline-flex h-5 w-5 items-center justify-center rounded-full hover:bg-muted/70"
                        onClick={() => setSelected((p) => ({ ...p, [e]: false }))}
                        aria-label={`Remove ${e}`}
                      >
                        <X className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                    </span>
                  ))}
                  {selectedEmails.length > 18 ? (
                    <span className="text-xs text-muted-foreground font-semibold px-1.5 py-1">
                      +{selectedEmails.length - 18} more
                    </span>
                  ) : null}
                </div>
              </div>
            ) : null}

            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Users
              </Label>
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or email"
                className="h-11 rounded-2xl border-border/70 bg-background/40"
              />
            </div>

            {usersError ? (
              <div className="rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-foreground">
                {usersError}
              </div>
            ) : null}

            <div className="rounded-2xl border border-border/70 overflow-hidden">
              <div className="max-h-[420px] overflow-y-auto">
                {usersLoading ? (
                  <div className="p-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading users…
                  </div>
                ) : userRows.length === 0 ? (
                  <div className="p-6 text-sm text-muted-foreground">No users.</div>
                ) : (
                  <div className="divide-y divide-border/70">
                    {userRows.map((u) => {
                      const checked = Boolean(selected[u.email])
                      return (
                        <label
                          key={u.email}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors cursor-pointer"
                        >
                          <Checkbox
                            checked={checked}
                            onCheckedChange={(v) => {
                              const isChecked = v === true
                              setSelected((p) => ({ ...p, [u.email]: isChecked }))
                            }}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <div className="truncate text-sm font-semibold text-foreground">{u.name}</div>
                              {u.verified ? (
                                <Badge variant="outline" className="rounded-full text-[10px] px-2 py-0.5 border-emerald-500/30 bg-emerald-500/10 text-emerald-600">
                                  Verified
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="rounded-full text-[10px] px-2 py-0.5 border-border/70 bg-background/40 text-muted-foreground">
                                  Unverified
                                </Badge>
                              )}
                            </div>
                            <div className="truncate text-xs text-muted-foreground mt-0.5">{u.email}</div>
                          </div>
                        </label>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="text-xs text-muted-foreground">
              Tip: add manual emails above, or tick users here—then hit <span className="font-semibold text-foreground">Send</span>.
            </div>
          </div>
        </Card>
      </div>

      <Dialog open={resultOpen} onOpenChange={setResultOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Send report</DialogTitle>
          </DialogHeader>
          {!sendResult ? (
            <div className="text-sm text-muted-foreground">No result.</div>
          ) : !sendResult.ok ? (
            <div className="rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-foreground">
              {sendResult.error || "Send failed."}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                {sendResult.account ? (
                  <Badge variant="outline" className="rounded-full">
                    From: {sendResult.account}
                  </Badge>
                ) : null}
                <Badge variant="outline" className="rounded-full">{sendResult.summary?.total ?? 0} total</Badge>
                <Badge variant="outline" className="rounded-full border-emerald-500/30 bg-emerald-500/10 text-emerald-700">
                  {sendResult.summary?.sent ?? 0} sent
                </Badge>
                <Badge variant="outline" className="rounded-full border-destructive/30 bg-destructive/10 text-destructive">
                  {sendResult.summary?.failed ?? 0} failed
                </Badge>
              </div>

              <div className="rounded-2xl border border-border/70 overflow-hidden">
                <div className="divide-y divide-border/70">
                  {(sendResult.results || []).map((r) => (
                    <div key={r.to} className="px-4 py-3 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-foreground break-all">{r.to}</div>
                        {r.ok ? null : (
                          <div className="text-xs text-muted-foreground mt-1 break-all">{r.error || "Failed"}</div>
                        )}
                      </div>
                      {r.ok ? (
                        <Badge variant="outline" className="rounded-full border-emerald-500/30 bg-emerald-500/10 text-emerald-700">
                          Sent
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="rounded-full border-destructive/30 bg-destructive/10 text-destructive">
                          Failed
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminShell>
  )
}

