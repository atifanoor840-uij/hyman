"use client"

import { useState, FormEvent } from "react"
import { EnvelopeIcon, PaperAirplaneIcon } from "@heroicons/react/24/outline"

export default function AdminEmailSenderPage() {
  const [to, setTo] = useState("")
  const [subject, setSubject] = useState("")
  const [body, setBody] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setMessage(null)
    if (!to.trim() || !subject.trim()) {
      setMessage({ type: "error", text: "Please enter recipient(s) and subject." })
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/admin/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: to.trim().split(/[\s,;]+/).filter(Boolean), subject: subject.trim(), body }),
      })
      if (!res.ok) throw new Error("Send failed")
      setMessage({ type: "success", text: "Email sent successfully." })
      setTo("")
      setSubject("")
      setBody("")
    } catch {
      setMessage({ type: "error", text: "Failed to send email. Configure API or use your backend endpoint." })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900 tracking-tight">Email Sender</h1>
        <p className="mt-1 text-sm text-neutral-500">Send emails to users (single or bulk).</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl">
        <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
          <div className="p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">To (email or comma-separated)</label>
              <input
                type="text"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="user@example.com or user1@a.com, user2@a.com"
                className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Email subject"
                className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Body</label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Email content"
                rows={6}
                className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-300 resize-y"
              />
            </div>
            {message && (
              <p className={`text-sm ${message.type === "success" ? "text-emerald-600" : "text-red-600"}`}>
                {message.text}
              </p>
            )}
          </div>
          <div className="px-6 py-4 bg-neutral-50/80 border-t border-neutral-100 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-60 transition-colors"
            >
              {loading ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <PaperAirplaneIcon className="h-4 w-4" />
              )}
              {loading ? "Sending…" : "Send Email"}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
