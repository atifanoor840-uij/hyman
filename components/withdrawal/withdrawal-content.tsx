"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Wallet, ArrowDownToLine, Banknote, Loader2 } from "lucide-react"
import { listMyAccounts, listMyPayouts, requestPayout, type Payout, type TradingAccount } from "@/lib/api/app-client"
import { ApiClientError } from "@/lib/api/client"

function statusBadgeClass(status: string) {
  switch (status) {
    case "approved":
    case "paid":
      return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
    case "rejected":
      return "bg-red-500/10 text-red-600 border-red-500/20"
    default:
      return "bg-amber-500/10 text-amber-600 border-amber-500/20"
  }
}

export function WithdrawalContent() {
  const [accounts, setAccounts] = useState<TradingAccount[]>([])
  const [payouts, setPayouts] = useState<Payout[]>([])
  const [loading, setLoading] = useState(true)
  const [accountId, setAccountId] = useState("")
  const [amount, setAmount] = useState("")
  const [method, setMethod] = useState("Bank transfer")
  const [details, setDetails] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const fundedAccounts = accounts.filter((a) => a.phase === "funded")
  const totalPaid = payouts.filter((p) => p.status === "paid").reduce((s, p) => s + p.amount, 0)
  const totalPending = payouts.filter((p) => p.status === "requested" || p.status === "approved").reduce((s, p) => s + p.amount, 0)
  const availableBalance = fundedAccounts.reduce((s, a) => s + a.totalPl, 0)

  const refresh = async () => {
    setLoading(true)
    try {
      const [accRes, payoutRes] = await Promise.all([listMyAccounts(), listMyPayouts()])
      setAccounts(accRes.accounts ?? [])
      setPayouts(payoutRes.payouts ?? [])
      if (!accountId && accRes.accounts?.some((a) => a.phase === "funded")) {
        setAccountId(accRes.accounts.find((a) => a.phase === "funded")!.id)
      }
    } catch {
      // handled by blur/eligibility gate in the parent page
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    const numAmount = Number(amount)
    if (!accountId || !Number.isFinite(numAmount) || numAmount <= 0 || !details.trim()) {
      setError("Choose an account, enter a valid amount, and provide payment details.")
      return
    }
    setSubmitting(true)
    try {
      await requestPayout({ accountId, amount: numAmount, paymentMethod: method, paymentDetails: details.trim() })
      setSuccess("Withdrawal request submitted.")
      setAmount("")
      setDetails("")
      await refresh()
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Failed to submit withdrawal request.")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Available profit</p>
              <p className="text-xl font-bold text-foreground">${availableBalance.toFixed(2)}</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <ArrowDownToLine className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending withdrawals</p>
              <p className="text-xl font-bold text-foreground">${totalPending.toFixed(2)}</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-black/10 flex items-center justify-center">
              <Banknote className="w-5 h-5 text-black dark:text-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total withdrawn</p>
              <p className="text-xl font-bold text-foreground">${totalPaid.toFixed(2)}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <ArrowDownToLine className="w-5 h-5 text-primary" />
            Request withdrawal
          </h3>
          {error && <p className="text-sm text-destructive mb-3">{error}</p>}
          {success && <p className="text-sm text-emerald-600 mb-3">{success}</p>}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="wd-account">Funded account</Label>
              <select
                id="wd-account"
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Select an account</option>
                {fundedAccounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.login} — profit ${a.totalPl.toFixed(2)}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="wd-amount">Amount (USD)</Label>
              <Input
                id="wd-amount"
                type="number"
                placeholder="0.00"
                min={0}
                step={0.01}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="wd-method">Withdrawal method</Label>
              <select
                id="wd-method"
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option>Bank transfer</option>
                <option>PayPal</option>
                <option>Crypto (USDT)</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="wd-details">Payment details</Label>
              <Input
                id="wd-details"
                placeholder="IBAN / wallet address / PayPal email"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={submitting} className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90">
              {submitting ? "Submitting…" : "Request withdrawal"}
            </Button>
          </form>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-foreground mb-4">Recent withdrawals</h3>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead className="font-semibold">Amount</TableHead>
                  <TableHead className="font-semibold">Method</TableHead>
                  <TableHead className="font-semibold">Date</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payouts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-sm text-muted-foreground py-6">
                      No withdrawals yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  payouts.map((p) => (
                    <TableRow key={p.id} className="border-border">
                      <TableCell className="font-semibold">${p.amount.toFixed(2)}</TableCell>
                      <TableCell className="text-muted-foreground text-sm capitalize">{p.paymentMethod}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "—"}
                      </TableCell>
                      <TableCell>
                        <Badge className={`${statusBadgeClass(p.status)} capitalize`}>{p.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  )
}
