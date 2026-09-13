import { NextRequest, NextResponse } from "next/server"
import { withSession } from "@/lib/http/guard"
import { createChallengePlan, listChallengePlans } from "@/lib/services/challengePlans"
import { writeAuditLog } from "@/lib/services/auditLog"

export const dynamic = "force-dynamic"

export async function GET() {
  const { error } = await withSession(["admin", "support"])
  if (error) return error

  const plans = await listChallengePlans()
  return NextResponse.json({ plans })
}

export async function POST(req: NextRequest) {
  const { session, error } = await withSession(["admin", "support"])
  if (error) return error

  let body: {
    name?: string
    size?: number
    price?: number
    profitTargetP1?: number
    profitTargetP2?: number
    maxDailyLoss?: number
    maxTotalLoss?: number
    profitSplit?: number
    platform?: string | null
  }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ message: "Invalid JSON body." }, { status: 400 })
  }

  const name = (body.name ?? "").trim()
  const size = Number(body.size)
  const price = Number(body.price)
  if (!name || !Number.isFinite(size) || size <= 0 || !Number.isFinite(price) || price < 0) {
    return NextResponse.json({ message: "name, a positive size, and a non-negative price are required." }, { status: 422 })
  }

  const plan = await createChallengePlan({
    name,
    size,
    price,
    profitTargetP1: Number(body.profitTargetP1) || 0,
    profitTargetP2: Number(body.profitTargetP2) || 0,
    maxDailyLoss: Number(body.maxDailyLoss) || 0,
    maxTotalLoss: Number(body.maxTotalLoss) || 0,
    profitSplit: Number(body.profitSplit) || 0,
    platform: body.platform ?? null,
  })

  await writeAuditLog({
    userId: session.sub,
    userName: session.email,
    targetId: plan.id,
    targetType: "challenge_plan",
    action: "create",
    description: `${session.email} created plan ${plan.name} ($${plan.size}, $${plan.price}).`,
  })

  return NextResponse.json({ plan }, { status: 201 })
}
