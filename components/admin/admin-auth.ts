export const ADMIN_2FA_KEY = "admin_2fa_verified_at"

export function getAdmin2faVerifiedAt(): number | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(ADMIN_2FA_KEY)
    if (!raw) return null
    const n = Number(raw)
    return Number.isFinite(n) ? n : null
  } catch {
    return null
  }
}

export function setAdmin2faVerifiedNow() {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(ADMIN_2FA_KEY, String(Date.now()))
  } catch {
    // ignore
  }
}

export function clearAdmin2fa() {
  if (typeof window === "undefined") return
  try {
    localStorage.removeItem(ADMIN_2FA_KEY)
  } catch {
    // ignore
  }
}

