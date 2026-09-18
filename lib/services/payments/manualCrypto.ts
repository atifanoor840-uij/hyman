import "server-only"

import { createServiceRoleClient } from "@/lib/supabase/service"

/**
 * "Scan & pay" — the customer sends crypto to one of our own wallets, then
 * submits the TXID and a screenshot. An admin checks the transfer and approves the order.
 * A network only appears at checkout once its address env var is set.
 */
export const MANUAL_NETWORKS = [
  { id: "usdt_bep20", label: "USDT", network: "BEP20 (BNB Smart Chain)", asset: "USDT", env: "MANUAL_WALLET_USDT_BEP20" },
  { id: "usdt_polygon", label: "USDT", network: "Polygon", asset: "USDT", env: "MANUAL_WALLET_USDT_POLYGON" },
  { id: "usdt_trc20", label: "USDT", network: "TRC20 (Tron)", asset: "USDT", env: "MANUAL_WALLET_USDT_TRC20" },
  { id: "btc", label: "Bitcoin", network: "Bitcoin", asset: "BTC", env: "MANUAL_WALLET_BTC" },
] as const

/**
 * Branded QR images exported from our wallet app (public/wallet-qr), keyed by
 * network, with the address each one encodes. An image is only used while it
 * matches the configured address — change the env var and checkout falls back
 * to a generated QR instead of showing a stale one.
 */
const WALLET_QR_IMAGES: Partial<Record<string, { src: string; address: string }>> = {
  usdt_bep20: { src: "/wallet-qr/usdt-bep20.jpg", address: "0xD78748853b2C46fBaA7456365F6C302576F94A80" },
  usdt_polygon: { src: "/wallet-qr/usdt-polygon.jpg", address: "0xD78748853b2C46fBaA7456365F6C302576F94A80" },
  usdt_trc20: { src: "/wallet-qr/usdt-trc20.jpg", address: "TLp5tpMuRn2v4FERNPN4SpEU5nZp97yTnk" },
  btc: { src: "/wallet-qr/btc.jpg", address: "bc1qjaaqfxckj4j93n4pmp2f6qstk0wwccgdl38fzy" },
}

export type ManualNetworkId = (typeof MANUAL_NETWORKS)[number]["id"]

export interface ManualWallet {
  id: ManualNetworkId
  label: string
  network: string
  asset: string
  address: string
  /** Branded QR image, or null to generate one from `address`. */
  qrImage: string | null
}

export function listManualWallets(): ManualWallet[] {
  return MANUAL_NETWORKS.flatMap(({ env, ...n }) => {
    const address = process.env[env]?.trim()
    if (!address) return []
    const qr = WALLET_QR_IMAGES[n.id]
    return [{ ...n, address, qrImage: qr?.address === address ? qr.src : null }]
  })
}

export function findManualWallet(id: string): ManualWallet | null {
  return listManualWallets().find((w) => w.id === id) ?? null
}

/** USD price of BTC, so checkout can show roughly how much to send. */
export async function getUsdRates(): Promise<Record<string, number>> {
  try {
    const res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd", {
      next: { revalidate: 120 },
    })
    const data = await res.json()
    const rates: Record<string, number> = { USDT: 1 }
    if (data?.bitcoin?.usd) rates.BTC = data.bitcoin.usd
    return rates
  } catch {
    return { USDT: 1 }
  }
}

const BUCKET = "payment-proofs"
const MAX_PROOF_BYTES = 5 * 1024 * 1024
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp"]

export function validateProof(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) return "Upload a PNG, JPG or WebP screenshot."
  if (file.size > MAX_PROOF_BYTES) return "Screenshot must be 5 MB or smaller."
  return null
}

/**
 * Stores the screenshot in a private bucket (created on first use) and returns
 * its path, `<network>/<orderId>-<ts>.<ext>` (see encodeProofRef).
 */
export async function uploadPaymentProof(orderId: string, networkId: string, file: File): Promise<string> {
  const supabase = createServiceRoleClient()
  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg"
  const path = `${networkId}/${orderId}-${Date.now()}.${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())

  const upload = () => supabase.storage.from(BUCKET).upload(path, buffer, { contentType: file.type, upsert: false })
  let { error } = await upload()
  if (error && /not found/i.test(error.message)) {
    await supabase.storage.createBucket(BUCKET, { public: false })
    ;({ error } = await upload())
  }
  if (error) throw error
  return path
}

/**
 * Pulls the transaction hash out of whatever the customer pasted — a bare
 * hash, a 0x-prefixed one, or a block-explorer link. Null if none is found.
 */
export function normalizeTxid(input: string): string | null {
  const match = input.trim().match(/(0x)?[a-fA-F0-9]{64}/)
  return match ? match[0] : null
}

/**
 * A "Scan & pay" order's gatewayRef holds both the screenshot path and the
 * TXID: `<network>/<orderId>-<ts>.<ext>#<txid>`.
 */
export function encodeProofRef(path: string, txid: string): string {
  return `${path}#${txid}`
}

export function decodeProofRef(ref: string | null | undefined): { path: string; txid: string | null } | null {
  if (!ref || !MANUAL_NETWORKS.some((n) => ref.startsWith(`${n.id}/`))) return null
  const [path, txid] = ref.split("#")
  return { path, txid: txid || null }
}

/** Block-explorer link for a TXID on the network the proof was filed under. */
export function explorerUrl(path: string, txid: string): string | null {
  const n = MANUAL_NETWORKS.find((x) => path.startsWith(`${x.id}/`))
  if (!n) return null
  const net = n.network.toLowerCase()
  if (n.id === "btc") return `https://mempool.space/tx/${txid}`
  if (net.includes("tron") || net.includes("trc")) return `https://tronscan.org/#/transaction/${txid.replace(/^0x/, "")}`
  if (net.includes("polygon")) return `https://polygonscan.com/tx/${txid}`
  if (net.includes("bep") || net.includes("bnb")) return `https://bscscan.com/tx/${txid}`
  return null
}

/** Signed URL valid for 10 minutes, for admin review only (bucket is private). */
export async function getSignedProofUrl(path: string): Promise<string | null> {
  const supabase = createServiceRoleClient()
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, 600)
  if (error) return null
  return data.signedUrl
}

/** Human label for a stored proof path, e.g. "USDT · TRC20 (Tron)". */
export function networkLabelForProof(path: string): string | null {
  const n = MANUAL_NETWORKS.find((x) => path.startsWith(`${x.id}/`))
  return n ? `${n.asset} · ${n.network}` : null
}
