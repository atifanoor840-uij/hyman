import "server-only"

import nodemailer from "nodemailer"

function getEnv(name: string): string {
  const v = process.env[name]
  return typeof v === "string" ? v.trim() : ""
}

let cachedTransporter: nodemailer.Transporter | null = null

function getTransporter(): nodemailer.Transporter {
  if (cachedTransporter) return cachedTransporter

  const host = getEnv("SMTP_HOST")
  const portRaw = getEnv("SMTP_PORT") || "587"
  const user = getEnv("SMTP_USER")
  const pass = getEnv("SMTP_PASS")

  if (!host || !user || !pass) {
    throw new Error("Email is not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASS.")
  }

  const port = Number(portRaw)
  const secure = getEnv("SMTP_SECURE") === "true" ? true : port === 465

  cachedTransporter = nodemailer.createTransport({
    host,
    port,
    secure,
    requireTLS: !secure,
    auth: { user, pass },
  })
  return cachedTransporter
}

export async function sendMail(opts: { to: string; subject: string; html: string }): Promise<void> {
  const from = getEnv("SMTP_FROM") || getEnv("SMTP_USER")
  const transporter = getTransporter()
  await transporter.sendMail({ from, to: opts.to, subject: opts.subject, html: opts.html })
}

export async function sendVerificationCodeEmail(
  to: string,
  code: string,
  purpose: "signup" | "reset"
): Promise<void> {
  const subject = purpose === "signup" ? "Verify your GenzProp email" : "Reset your GenzProp password"
  const intro =
    purpose === "signup"
      ? "Use this code to verify your email address and finish creating your account."
      : "Use this code to reset your password."
  const html = `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2>${subject}</h2>
      <p>${intro}</p>
      <p style="font-size: 32px; font-weight: bold; letter-spacing: 0.3em; text-align: center; padding: 16px 0;">${code}</p>
      <p>This code expires in 15 minutes. If you didn't request this, you can safely ignore this email.</p>
    </div>
  `
  await sendMail({ to, subject, html })
}
