"use client"

import { useEffect, useMemo, useState } from "react"
import { AdminShell } from "@/components/admin/admin-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
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
import { Loader2, RefreshCcw, Send, X } from "lucide-react"
import { Field, LoadingBlock, Notice, Panel, SearchBox, StatRow, StatusPill, inputClass, useConfirm } from "@/components/admin/admin-ui"

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
  const { confirm, dialog } = useConfirm()

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

  const confirmAndSend = async () => {
    if (sending) return
    const count = selectedEmails.length
    if (count > 0 && subject.trim() && html.trim() && invalidSelected.length === 0) {
      const { ok } = await confirm({
        title: `Send this email to ${count} ${count === 1 ? "person" : "people"}?`,
        description: `From ${FROM_ACCOUNTS.find((a) => a.id === fromAccount)?.label}, subject “${subject.trim()}”. Emails can’t be recalled once sent.`,
        confirmLabel: `Send to ${count}`,
      })
      if (!ok) return
    }
    await send()
  }

  const allVisibleSelected = userRows.length > 0 && userRows.every((u) => selected[u.email])

  return (
    <AdminShell
      title="Email sender"
      description="Write an HTML email, pick recipients, and send it one-by-one."
    >
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
        {/* Step 1 + 2: message */}
        <div className="space-y-4 xl:col-span-3">
          <Panel title={<StepTitle n={1} title="Sender & subject" />}>
            <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
              <Field label="From" hint="Credentials come from server settings." htmlFor="from">
                <Select
                  value={fromAccount}
                  onValueChange={(v) => {
                    const next = FROM_ACCOUNTS.find((a) => a.id === v)?.id
                    if (next) setFromAccount(next)
                  }}
                >
                  <SelectTrigger id="from" className="h-10 rounded-xl border-input bg-card shadow-none">
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
              </Field>
              <Field label="Subject" htmlFor="subject">
                <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. Your payout is on its way" className={inputClass} />
              </Field>
            </div>
          </Panel>

          <Panel title={<StepTitle n={2} title="Email content" />} description="Paste HTML, then check the preview.">
            <Tabs defaultValue="editor" className="p-5">
              <TabsList className="rounded-xl">
                <TabsTrigger value="editor" className="rounded-lg">
                  HTML
                </TabsTrigger>
                <TabsTrigger value="preview" className="rounded-lg">
                  Preview
                </TabsTrigger>
              </TabsList>
              <TabsContent value="editor" className="mt-3">
                <Textarea
                  value={html}
                  onChange={(e) => setHtml(e.target.value)}
                  className="min-h-[380px] rounded-xl border-input bg-card font-mono text-xs shadow-none"
                  placeholder="<h1>...</h1>"
                  aria-label="Email HTML"
                />
              </TabsContent>
              <TabsContent value="preview" className="mt-3">
                <iframe title="Email preview" className="min-h-[380px] w-full rounded-xl border border-border bg-white" sandbox="" srcDoc={html} />
              </TabsContent>
            </Tabs>
          </Panel>
        </div>

        {/* Step 3: recipients */}
        <div className="xl:col-span-2">
          <Panel
            title={<StepTitle n={3} title="Recipients" />}
            description={`${selectedEmails.length} selected`}
            actions={
              selectedEmails.length > 0 && (
                <Button type="button" variant="ghost" size="sm" className="h-8 rounded-lg text-muted-foreground" onClick={clearRecipients}>
                  Clear all
                </Button>
              )
            }
            className="xl:sticky xl:top-6"
          >
            <div className="space-y-4 p-5">
              <Field label="Add email addresses" hint="Separate with commas, spaces or new lines." htmlFor="manual">
                <div className="flex gap-2">
                  <Input
                    id="manual"
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        addManualEmails()
                      }
                    }}
                    placeholder="name@email.com"
                    className={inputClass}
                  />
                  <Button type="button" variant="outline" className="h-10 rounded-xl border-border" onClick={addManualEmails} disabled={!manualInput.trim()}>
                    Add
                  </Button>
                </div>
              </Field>

              {selectedEmails.length > 0 && (
                <div className="flex max-h-32 flex-wrap gap-1.5 overflow-y-auto rounded-xl border border-border bg-muted/40 p-2.5">
                  {selectedEmails.map((e) => (
                    <span key={e} className="inline-flex items-center gap-1 rounded-full bg-card py-0.5 pl-2.5 pr-1 text-xs font-medium text-foreground ring-1 ring-border">
                      {e}
                      <button
                        type="button"
                        className="flex h-5 w-5 items-center justify-center rounded-full hover:bg-muted"
                        onClick={() => setSelected((p) => ({ ...p, [e]: false }))}
                        aria-label={`Remove ${e}`}
                      >
                        <X className="h-3 w-3 text-muted-foreground" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-foreground">Pick from users</p>
                  <button
                    type="button"
                    onClick={() => void loadUsers()}
                    disabled={usersLoading}
                    className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
                  >
                    <RefreshCcw className={`h-3 w-3 ${usersLoading ? "animate-spin" : ""}`} /> Reload
                  </button>
                </div>
                <SearchBox value={search} onChange={setSearch} placeholder="Search name or email" className="sm:w-full" />
              </div>

              {usersError && <Notice tone="error">{usersError}</Notice>}

              <div className="overflow-hidden rounded-xl border border-border">
                <label className="flex cursor-pointer items-center gap-3 border-b border-border bg-muted/50 px-4 py-2.5 text-xs font-medium text-muted-foreground">
                  <Checkbox
                    checked={allVisibleSelected}
                    disabled={userRows.length === 0}
                    onCheckedChange={(v) => {
                      if (v === true) selectAllVisible()
                      else setSelected((p) => {
                        const next = { ...p }
                        for (const u of userRows) next[u.email] = false
                        return next
                      })
                    }}
                  />
                  Select all {search ? "matching" : ""} ({userRows.length})
                </label>
                <div className="max-h-[360px] overflow-y-auto">
                  {usersLoading ? (
                    <LoadingBlock label="Loading users…" />
                  ) : userRows.length === 0 ? (
                    <p className="p-6 text-center text-sm text-muted-foreground">No users found.</p>
                  ) : (
                    <div className="divide-y divide-border">
                      {userRows.map((u) => (
                        <label key={u.email} className="flex cursor-pointer items-center gap-3 px-4 py-2.5 transition-colors hover:bg-muted/40">
                          <Checkbox
                            checked={Boolean(selected[u.email])}
                            onCheckedChange={(v) => setSelected((p) => ({ ...p, [u.email]: v === true }))}
                          />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-foreground">{u.name}</p>
                            <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                          </div>
                          {!u.verified && <span className="shrink-0 text-[11px] text-muted-foreground">Unverified</span>}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t border-border bg-muted/40 p-4">
              <Button className="h-11 w-full gap-2 rounded-xl" onClick={() => void confirmAndSend()} disabled={sending}>
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {sending ? "Sending…" : selectedEmails.length ? `Send to ${selectedEmails.length} ${selectedEmails.length === 1 ? "person" : "people"}` : "Send email"}
              </Button>
            </div>
          </Panel>
        </div>
      </div>

      <Dialog open={resultOpen} onOpenChange={setResultOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Send report</DialogTitle>
          </DialogHeader>
          {!sendResult ? (
            <p className="text-sm text-muted-foreground">No result.</p>
          ) : !sendResult.ok ? (
            <Notice tone="error">{sendResult.error || "Send failed."}</Notice>
          ) : (
            <div className="space-y-4">
              <StatRow
                items={[
                  { label: "Total", value: sendResult.summary?.total ?? 0 },
                  { label: "Sent", value: sendResult.summary?.sent ?? 0, tone: "success" },
                  { label: "Failed", value: sendResult.summary?.failed ?? 0, tone: "danger" },
                ]}
              />
              <div className="divide-y divide-border overflow-hidden rounded-xl border border-border">
                {(sendResult.results || []).map((r) => (
                  <div key={r.to} className="flex items-start justify-between gap-3 px-4 py-3">
                    <div className="min-w-0">
                      <p className="break-all text-sm font-medium text-foreground">{r.to}</p>
                      {!r.ok && <p className="mt-0.5 break-all text-xs text-muted-foreground">{r.error || "Failed"}</p>}
                    </div>
                    <StatusPill label={r.ok ? "Sent" : "Failed"} tone={r.ok ? "success" : "danger"} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {dialog}
    </AdminShell>
  )
}

function StepTitle({ n, title }: { n: number; title: string }) {
  return (
    <span className="flex items-center gap-2.5">
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">{n}</span>
      {title}
    </span>
  )
}
