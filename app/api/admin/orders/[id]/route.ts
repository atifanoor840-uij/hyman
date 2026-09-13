import { NextRequest, NextResponse } from "next/server"
import { withSession, errorResponse } from "@/lib/http/guard"
import { findOrderById, updateOrderStatus } from "@/lib/services/orders"
import { findChallengePlanById } from "@/lib/services/challengePlans"
import { assignInventory, listInventory, releaseInventory } from "@/lib/services/challengeInventory"
import {
  createAccountFromInventory,
  createManualAccount,
  listAccountsForOrder,
  updateAccountStatusForOrder,
} from "@/lib/services/tradingAccounts"
import { findOrderDetailed } from "@/lib/services/adminOrders"
import { issueCertificate } from "@/lib/services/certificates"
import { createNotification } from "@/lib/services/notifications"
import { findUserById } from "@/lib/services/users"
import { writeAuditLog } from "@/lib/services/auditLog"

export const dynamic = "force-dynamic"

const PHASES = ["phase1", "phase2", "funded"] as const

type Body =
  | { action: "pass" }
  | { action: "fail"; reason?: string }
  | { action: "complete-inventory"; inventoryId: string; phase: string }
  | {
      action: "complete-manual"
      phase: string
      platform: string
      login: string
      passwordMaster: string
      server: string
      profitTarget: number
      balance: number
      graphLink?: string
    }

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "")

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await withSession(["admin", "support"])
  if (error) return error
  const { id } = await params

  try {
    const order = await findOrderDetailed(id)
    if (!order) return NextResponse.json({ message: "Order not found." }, { status: 404 })
    const accounts = await listAccountsForOrder(id)
    return NextResponse.json({ order: { ...order, accounts } })
  } catch (err) {
    return errorResponse(err, "Failed to load order.")
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { session, error } = await withSession(["admin", "support"])
  if (error) return error
  const { id } = await params

  let body: Body
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ message: "Invalid JSON body." }, { status: 400 })
  }

  try {
    const order = await findOrderById(id)
    if (!order || !order.userId) return NextResponse.json({ message: "Order not found." }, { status: 404 })

    const user = await findUserById(order.userId)
    const plan = order.planId ? await findChallengePlanById(order.planId) : null
    const audit = (action: string, description: string) =>
      writeAuditLog({ userId: session.sub, userName: session.email, targetId: id, targetType: "order", action, description })

    if (body.action === "pass") {
      if (order.status === "passed") {
        return NextResponse.json({ message: "This order is already marked as passed." }, { status: 409 })
      }
      await updateOrderStatus(id, "passed")
      await updateAccountStatusForOrder(id, "passed")
      if (user) {
        await createNotification({
          userId: user.id,
          title: "Challenge passed",
          message: `Congratulations — you passed ${plan?.name ?? "your challenge"}!`,
          type: "order",
        })
        if (plan) {
          // certificates.accountId references trading_accounts, not orders.
          const [latestAccount] = await listAccountsForOrder(id)
          await issueCertificate({
            userId: user.id,
            accountId: latestAccount?.id ?? null,
            traderName: user.name,
            accountSize: plan.size,
            planName: plan.name,
          })
        }
      }
      await audit("pass", `${session.email} marked order ${id} as passed.`)
      return NextResponse.json({ ok: true })
    }

    if (body.action === "fail") {
      if (order.status === "failed") {
        return NextResponse.json({ message: "This order is already marked as failed." }, { status: 409 })
      }
      const reason = str(body.reason)
      await updateOrderStatus(id, "failed")
      await updateAccountStatusForOrder(id, "failed")
      if (user) {
        await createNotification({
          userId: user.id,
          title: "Challenge failed",
          message: reason ? `Your challenge has ended. ${reason}` : "Your challenge has ended.",
          type: "order",
        })
      }
      await audit("fail", `${session.email} marked order ${id} as failed. ${reason}`.trim())
      return NextResponse.json({ ok: true })
    }

    if (body.action === "complete-inventory" || body.action === "complete-manual") {
      const phase = str(body.phase)
      if (!PHASES.includes(phase as (typeof PHASES)[number])) {
        return NextResponse.json({ message: "Phase must be phase1, phase2, or funded." }, { status: 422 })
      }
      const planTarget = phase === "phase1" ? plan?.profitTargetP1 ?? 0 : phase === "phase2" ? plan?.profitTargetP2 ?? 0 : 0

      let account
      if (body.action === "complete-inventory") {
        const inventoryId = str(body.inventoryId)
        if (!inventoryId) return NextResponse.json({ message: "Select an inventory account." }, { status: 422 })
        const inventory = (await listInventory()).find((i) => i.id === inventoryId)
        if (!inventory || !(await assignInventory(inventory.id, id))) {
          return NextResponse.json({ message: "That inventory account is not available." }, { status: 409 })
        }
        try {
          account = await createAccountFromInventory({ userId: order.userId, orderId: id, inventory, profitTarget: planTarget, phase })
        } catch (err) {
          await releaseInventory(inventory.id)
          throw err
        }
      } else {
        const platform = str(body.platform).toLowerCase()
        const login = str(body.login)
        const passwordMaster = str(body.passwordMaster)
        const server = str(body.server)
        const balance = Number(body.balance)
        const profitTarget = Number(body.profitTarget)
        const missing = [!platform && "platform", !login && "login", !passwordMaster && "password", !server && "server"].filter(Boolean)
        if (missing.length) {
          return NextResponse.json({ message: `Missing required fields: ${missing.join(", ")}.` }, { status: 422 })
        }
        if (!Number.isFinite(balance) || balance < 0) {
          return NextResponse.json({ message: "Balance must be a positive number." }, { status: 422 })
        }
        account = await createManualAccount({
          userId: order.userId,
          orderId: id,
          platform,
          login,
          passwordMaster,
          server,
          profitTarget: Number.isFinite(profitTarget) && profitTarget > 0 ? profitTarget : planTarget,
          balance: balance || plan?.size || 0,
          phase,
          graphLink: str(body.graphLink) || null,
        })
      }

      await updateOrderStatus(id, "active")
      if (user) {
        await createNotification({
          userId: user.id,
          title: "Account credentials delivered",
          message: "Your trading account credentials are ready — check your dashboard.",
          type: "order",
        })
      }
      await audit(
        body.action,
        `${session.email} ${body.action === "complete-inventory" ? "delivered from inventory" : "manually delivered"} ${phase} credentials for order ${id}.`
      )
      return NextResponse.json({ ok: true, account })
    }

    return NextResponse.json({ message: "Unknown action." }, { status: 422 })
  } catch (err) {
    return errorResponse(err, "Order action failed.")
  }
}
