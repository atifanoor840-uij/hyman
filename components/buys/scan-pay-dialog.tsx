"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { QRCodeSVG } from "qrcode.react"
import { SiBitcoin, SiTether } from "react-icons/si"
import { AlertTriangle, Check, ChevronLeft, Copy, ImageUp, Loader2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { listManualWallets, submitPaymentProof, type ManualWallet } from "@/lib/api/app-client"
import { ApiClientError } from "@/lib/api/client"

function AssetIcon({ asset, className = "h-7 w-7" }: { asset: string; className?: string }) {
  if (asset === "USDT") return <SiTether className={`${className} text-[#26a17b]`} />
  return <SiBitcoin className={`${className} text-[#f7931a]`} />
}

/** Short chip for the chain, e.g. "BEP20" out of "BEP20 (BNB Smart Chain)". */
const chainChip = (network: string) => network.split(" ")[0]

function formatCrypto(n: number) {
  return n.toLocaleString("en-US", { maximumFractionDigits: n < 1 ? 6 : 4 })
}

export function ScanPayDialog({
  orderId,
  amountUsd,
  onClose,
  onSubmitted,
}: {
  orderId: string
  amountUsd: number
  onClose: () => void
  onSubmitted: () => void
}) {
  const [wallets, setWallets] = useState<ManualWallet[] | null>(null)
  const [rates, setRates] = useState<Record<string, number>>({})
  const [loadError, setLoadError] = useState<string | null>(null)
  const [selected, setSelected] = useState<ManualWallet | null>(null)
  const [copied, setCopied] = useState<"address" | "amount" | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [txid, setTxid] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)

  useEffect(() => {
    listManualWallets()
      .then((r) => {
        setWallets(r.wallets)
        setRates(r.rates)
      })
      .catch((err) => setLoadError(err instanceof ApiClientError ? err.message : "Could not load wallets."))
  }, [])

  const preview = useMemo(() => (file ? URL.createObjectURL(file) : null), [file])
  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview)
  }, [preview])

  const rate = selected ? rates[selected.asset] : undefined
  const cryptoAmount = selected && rate ? amountUsd / rate : null
  const isStable = selected?.asset === "USDT"
  const amountText = selected
    ? isStable
      ? `${amountUsd.toFixed(2)} ${selected.asset}`
      : cryptoAmount
        ? `≈ ${formatCrypto(cryptoAmount)} ${selected.asset}`
        : `$${amountUsd.toFixed(2)} in ${selected.asset}`
    : ""

  const copy = async (kind: "address" | "amount", value: string) => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(kind)
      setTimeout(() => setCopied(null), 1500)
    } catch {
      /* clipboard blocked — the value is still visible to copy by hand */
    }
  }

  const pickFile = (f: File | undefined) => {
    setSubmitError(null)
    if (!f) return
    if (!["image/png", "image/jpeg", "image/webp"].includes(f.type)) return setSubmitError("Upload a PNG, JPG or WebP screenshot.")
    if (f.size > 5 * 1024 * 1024) return setSubmitError("Screenshot must be 5 MB or smaller.")
    setFile(f)
  }

  // Same rule as the server: a 64-hex hash, optionally 0x-prefixed or inside an explorer link.
  const txidMatch = txid.trim().match(/(0x)?[a-fA-F0-9]{64}/)?.[0] ?? null
  const txidInvalid = txid.trim() !== "" && !txidMatch

  const submit = async () => {
    if (!selected || !file || !txidMatch) return
    setSubmitting(true)
    setSubmitError(null)
    try {
      await submitPaymentProof(orderId, selected.id, txidMatch, file)
      onSubmitted()
    } catch (err) {
      setSubmitError(err instanceof ApiClientError ? err.message : "Upload failed. Please try again.")
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label="Scan and pay">
      <div className="max-h-[92vh] w-full overflow-y-auto rounded-t-2xl border border-border bg-background shadow-2xl sm:max-w-lg sm:rounded-2xl">
        <div className="sticky top-0 z-10 flex items-center gap-2 border-b border-border bg-background px-5 py-4">
          {selected && (
            <button type="button" onClick={() => setSelected(null)} className="rounded-lg p-1.5 hover:bg-muted" aria-label="Back to networks">
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-semibold">{selected ? `Pay with ${selected.label}` : "Scan & pay"}</h2>
            <p className="text-xs text-muted-foreground">
              Order total <span className="font-semibold text-foreground">${amountUsd.toFixed(2)}</span>
            </p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 hover:bg-muted" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 p-5">
          {!selected && (
            <>
              <p className="text-sm text-muted-foreground">Choose the coin and network you want to pay with.</p>
              {loadError && <p className="text-sm text-destructive">{loadError}</p>}
              {!wallets && !loadError && (
                <div className="flex justify-center py-10">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              )}
              {wallets?.length === 0 && (
                <p className="rounded-xl bg-muted/50 p-4 text-sm text-muted-foreground">
                  Scan & pay isn&apos;t available right now. Please choose another payment method.
                </p>
              )}
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                {wallets?.map((w) => (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => setSelected(w)}
                    className="flex flex-col items-center gap-2 rounded-xl border border-border/60 bg-muted/20 p-4 transition hover:border-primary/50 hover:bg-muted/40"
                  >
                    <AssetIcon asset={w.asset} className="h-9 w-9" />
                    <span className="text-sm font-semibold">{w.label}</span>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">{chainChip(w.network)}</span>
                  </button>
                ))}
              </div>
            </>
          )}

          {selected && (
            <>
              {wallets && wallets.length > 1 && (
                <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none]" role="tablist" aria-label="Wallet">
                  {wallets.map((w) => (
                    <button
                      key={w.id}
                      type="button"
                      role="tab"
                      aria-selected={w.id === selected.id}
                      onClick={() => setSelected(w)}
                      className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                        w.id === selected.id
                          ? "border-primary bg-primary/10 text-foreground"
                          : "border-border/60 text-muted-foreground hover:border-primary/40"
                      }`}
                    >
                      <AssetIcon asset={w.asset} className="h-4 w-4" />
                      {w.asset} · {chainChip(w.network)}
                    </button>
                  ))}
                </div>
              )}

              <div className="flex flex-col items-center gap-3">
                <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
                  {selected.qrImage ? (
                    // eslint-disable-next-line @next/next/no-img-element -- static branded QR from public/
                    <img src={selected.qrImage} alt={`${selected.asset} ${selected.network} wallet QR code`} width={184} height={184} className="h-[184px] w-[184px]" />
                  ) : (
                    <QRCodeSVG value={selected.address} size={184} level="M" marginSize={0} />
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <AssetIcon asset={selected.asset} className="h-5 w-5" />
                  <span className="font-medium">{selected.asset}</span>
                  <span className="text-muted-foreground">on {selected.network}</span>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Amount to send</p>
                  <div className="flex items-center justify-between gap-2 rounded-xl bg-muted/50 px-3 py-2.5">
                    <span className="font-mono text-sm font-semibold">{amountText}</span>
                    {isStable && (
                      <button type="button" onClick={() => copy("amount", amountUsd.toFixed(2))} className="rounded-md p-1 hover:bg-muted" aria-label="Copy amount">
                        {copied === "amount" ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                      </button>
                    )}
                  </div>
                  {!isStable && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Send ${amountUsd.toFixed(2)} worth of {selected.asset} at the current rate.
                    </p>
                  )}
                </div>
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Wallet address</p>
                  <div className="flex items-center justify-between gap-2 rounded-xl bg-muted/50 px-3 py-2.5">
                    <span className="break-all font-mono text-sm">{selected.address}</span>
                    <button type="button" onClick={() => copy("address", selected.address)} className="shrink-0 rounded-md p-1 hover:bg-muted" aria-label="Copy address">
                      {copied === "address" ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="flex gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-400">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>
                    Only send {selected.asset} on the <strong>{selected.network}</strong> network. Funds sent on another network can&apos;t be recovered.
                  </span>
                </div>
              </div>

              <div>
                <label htmlFor="scan-pay-txid" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Transaction ID (TXID)
                </label>
                <input
                  id="scan-pay-txid"
                  value={txid}
                  onChange={(e) => {
                    setTxid(e.target.value)
                    setSubmitError(null)
                  }}
                  placeholder="Paste the transaction hash from your wallet"
                  autoComplete="off"
                  spellCheck={false}
                  aria-invalid={txidInvalid}
                  className={`h-11 w-full rounded-xl border bg-background px-3 font-mono text-sm outline-none transition focus:ring-2 focus:ring-primary/30 ${
                    txidInvalid ? "border-destructive" : "border-border"
                  }`}
                />
                <p className={`mt-1 text-xs ${txidInvalid ? "text-destructive" : "text-muted-foreground"}`}>
                  {txidInvalid
                    ? "That doesn't look like a transaction hash — it's usually 64 characters (0-9, a-f)."
                    : "Find it in your wallet's transaction details. Pasting the explorer link works too."}
                </p>
              </div>

              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Payment screenshot</p>
                <input
                  ref={fileInput}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={(e) => pickFile(e.target.files?.[0])}
                />
                <button
                  type="button"
                  onClick={() => fileInput.current?.click()}
                  className="flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-border p-4 text-sm text-muted-foreground transition hover:border-primary/50 hover:bg-muted/30"
                >
                  {preview ? (
                    // eslint-disable-next-line @next/next/no-img-element -- local blob preview
                    <img src={preview} alt="Payment screenshot preview" className="max-h-48 rounded-lg object-contain" />
                  ) : (
                    <ImageUp className="h-6 w-6" />
                  )}
                  <span>{file ? `${file.name} — tap to change` : "After paying, upload a screenshot of the transfer"}</span>
                </button>
              </div>

              {submitError && <p className="text-sm font-medium text-destructive">{submitError}</p>}

              <Button className="h-11 w-full rounded-xl" disabled={!file || !txidMatch || submitting} onClick={submit}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                I&apos;ve paid — submit for review
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Our team verifies the transfer and activates your account, usually within a few hours.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
