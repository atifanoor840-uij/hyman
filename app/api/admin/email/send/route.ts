import { NextRequest, NextResponse } from "next/server"
import nodemailer from "nodemailer"

export const dynamic = "force-dynamic"

type Body = {
  account?: unknown
  subject?: unknown
  html?: unknown
  to?: unknown
}

function getEnv(name: string) {
  const v = process.env[name]
  return typeof v === "string" ? v.trim() : ""
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function uniqueLower(emails: string[]) {
  const set = new Set<string>()
  const out: string[] = []
  for (const raw of emails) {
    const e = String(raw || "").trim().toLowerCase()
    if (!e) continue
    if (set.has(e)) continue
    set.add(e)
    out.push(e)
  }
  return out
}

type AccountId = "fxonyx" | "genzprop" | "default"

function resolveAccount(raw: unknown): AccountId {
  const v = typeof raw === "string" ? raw.trim().toLowerCase() : ""
  if (v === "fxonyx") return "fxonyx"
  if (v === "genzprop") return "genzprop"
  return "default"
}

const transporterCache = new Map<AccountId, nodemailer.Transporter>()
const transporterByHostCache = new Map<string, nodemailer.Transporter>()

function getAccountConfig(account: AccountId) {
  // Prefer environment variables; if missing, fallback to hardcoded defaults (requested).
  // NOTE: Hardcoding credentials is not recommended for production.
  const envHost = getEnv("SMTP_HOST")
  const envPortRaw = getEnv("SMTP_PORT")
  const secureRaw = getEnv("SMTP_SECURE")

  // Domains use Hostinger MX (mx1.hostinger.com / mx2.hostinger.com). SMTP is typically smtp.hostinger.com
  // or smtp.titan.email (Hostinger email powered by Titan). We'll retry between them if needed.
  const hosts = envHost
    ? [envHost]
    : ["smtp.hostinger.com", "smtp.titan.email"]

  const host = hosts[0] || ""
  const portRaw = envPortRaw || "587"

  if (!host || !portRaw) {
    throw new Error("Missing SMTP host/port configuration.")
  }

  const port = Number(portRaw)
  if (!Number.isFinite(port) || port <= 0) {
    throw new Error("Invalid SMTP port.")
  }

  const secure =
    secureRaw === "true"
      ? true
      : secureRaw === "false"
        ? false
        : port === 465

  const prefix =
    account === "fxonyx"
      ? "SMTP_FXONYX"
      : account === "genzprop"
        ? "SMTP_GENZPROP"
        : "SMTP"

  const hardcoded =
    account === "fxonyx"
      ? { user: "support@fxonyx.com", pass: "Fxonyx@123", from: "support@fxonyx.com" }
      : account === "genzprop"
        ? { user: "helpdesk@genzprop.com", pass: "Propgenz@321", from: "helpdesk@genzprop.com" }
        : null

  const user = getEnv(`${prefix}_USER`) || getEnv("SMTP_USER") || hardcoded?.user || ""
  const pass = getEnv(`${prefix}_PASS`) || getEnv("SMTP_PASS") || hardcoded?.pass || ""
  const from = getEnv(`${prefix}_FROM`) || getEnv("SMTP_FROM") || hardcoded?.from || user

  if (!user || !pass) {
    if (account === "default") {
      throw new Error("Missing SMTP env. Required: SMTP_USER, SMTP_PASS.")
    }
    throw new Error(`Missing SMTP env for account "${account}". Required: ${prefix}_USER, ${prefix}_PASS.`)
  }
  if (!from) {
    throw new Error(`Missing FROM for account "${account}". Provide ${prefix}_FROM (or SMTP_FROM).`)
  }

  return { hosts, port, secure, user, pass, from }
}

function getTransporter(account: AccountId) {
  // Legacy: keep a cached transporter for the first host
  const cached = transporterCache.get(account)
  if (cached) return cached

  const cfg = getAccountConfig(account)
  const transporter = nodemailer.createTransport({
    host: cfg.hosts[0],
    port: cfg.port,
    secure: cfg.secure,
    requireTLS: !cfg.secure,
    auth: { user: cfg.user, pass: cfg.pass },
  })
  transporterCache.set(account, transporter)
  return transporter
}

function getTransporterForHost(account: AccountId, host: string) {
  const key = `${account}:${host}`
  const cached = transporterByHostCache.get(key)
  if (cached) return cached
  const cfg = getAccountConfig(account)
  const transporter = nodemailer.createTransport({
    host,
    port: cfg.port,
    secure: cfg.secure,
    requireTLS: !cfg.secure,
    auth: { user: cfg.user, pass: cfg.pass },
  })
  transporterByHostCache.set(key, transporter)
  return transporter
}

async function sendWithRetry(account: AccountId, opts: { from: string; to: string; subject: string; html: string }) {
  const cfg = getAccountConfig(account)
  let lastErr: unknown = null
  for (const host of cfg.hosts) {
    try {
      const transporter = getTransporterForHost(account, host)
      await transporter.sendMail({
        from: opts.from,
        to: opts.to,
        subject: opts.subject,
        html: opts.html,
      })
      return { ok: true as const, host }
    } catch (e) {
      lastErr = e
      // If a host fails (ENOTFOUND/timeout/auth), try the next host.
      continue
    }
  }
  return { ok: false as const, error: lastErr }
}

export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization") || ""
  if (!auth.toLowerCase().startsWith("bearer ")) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 })
  }

  let body: Body
  try {
    body = (await req.json()) as Body
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 })
  }

  const subject = typeof body.subject === "string" ? body.subject.trim() : ""
  const html = typeof body.html === "string" ? body.html.trim() : ""
  const toRaw = Array.isArray(body.to) ? body.to : []
  const account = resolveAccount(body.account)

  if (!subject) return NextResponse.json({ ok: false, error: "Missing subject" }, { status: 400 })
  if (!html) return NextResponse.json({ ok: false, error: "Missing html" }, { status: 400 })
  if (!toRaw.length) return NextResponse.json({ ok: false, error: "Missing recipients" }, { status: 400 })

  const to = uniqueLower(toRaw.map((x) => String(x || "")))
  const invalid = to.filter((e) => !isValidEmail(e))
  if (invalid.length) {
    return NextResponse.json(
      { ok: false, error: `Invalid emails: ${invalid.slice(0, 8).join(", ")}${invalid.length > 8 ? "…" : ""}` },
      { status: 400 }
    )
  }

  if (to.length > 500) {
    return NextResponse.json({ ok: false, error: "Too many recipients (max 500)." }, { status: 400 })
  }

  let transporter: nodemailer.Transporter
  let from: string
  try {
    const cfg = getAccountConfig(account)
    from = cfg.from
    transporter = getTransporter(account)
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Email not configured." },
      { status: 500 }
    )
  }

  const results: Array<{ to: string; ok: boolean; error?: string }> = []

  for (const email of to) {
    try {
      // Prefer retry logic over single-host transporter.
      const r = await sendWithRetry(account, { from, to: email, subject, html })
      if (!r.ok) throw r.error
      results.push({ to: email, ok: true })
    } catch (e) {
      results.push({ to: email, ok: false, error: e instanceof Error ? e.message : "Send failed" })
    }
  }

  const sent = results.filter((r) => r.ok).length
  const failed = results.length - sent

  return NextResponse.json({
    ok: true,
    account,
    summary: { total: results.length, sent, failed },
    results,
  })
}

