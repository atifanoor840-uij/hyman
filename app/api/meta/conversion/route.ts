import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

type ConversionRequestBody = {
  event_name: string
  event_time?: number
  event_id?: string
  action_source?: "website"
  event_source_url?: string
  custom_data?: Record<string, unknown>
  user_data?: {
    fbp?: string
    fbc?: string
  }
}

function getClientIp(request: NextRequest) {
  const xff = request.headers.get("x-forwarded-for")
  if (xff) return xff.split(",")[0]?.trim()
  const xrip = request.headers.get("x-real-ip")
  return xrip?.trim() || undefined
}

export async function POST(request: NextRequest) {
  const pixelId = (process.env.NEXT_PUBLIC_META_PIXEL_ID || "944876151762415").trim()
  const accessToken = process.env.META_CONVERSIONS_ACCESS_TOKEN?.trim()

  if (!accessToken) {
    return NextResponse.json(
      { ok: false, error: "Missing META_CONVERSIONS_ACCESS_TOKEN" },
      { status: 500 }
    )
  }

  let body: ConversionRequestBody
  try {
    body = (await request.json()) as ConversionRequestBody
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 })
  }

  if (!body?.event_name || typeof body.event_name !== "string") {
    return NextResponse.json({ ok: false, error: "Missing event_name" }, { status: 400 })
  }

  const now = Math.floor(Date.now() / 1000)
  const event_time = typeof body.event_time === "number" ? body.event_time : now

  const userAgent = request.headers.get("user-agent") || undefined
  const clientIp = getClientIp(request)
  const referer = request.headers.get("referer") || undefined

  const cookieFbp = request.cookies.get("_fbp")?.value
  const cookieFbc = request.cookies.get("_fbc")?.value

  const payload = {
    data: [
      {
        event_name: body.event_name,
        event_time,
        action_source: body.action_source || "website",
        event_id: body.event_id,
        event_source_url: body.event_source_url || body.event_source_url === "" ? body.event_source_url : referer,
        user_data: {
          client_ip_address: clientIp,
          client_user_agent: userAgent,
          fbp: body.user_data?.fbp || cookieFbp,
          fbc: body.user_data?.fbc || cookieFbc,
        },
        custom_data: body.custom_data || undefined,
      },
    ],
  }

  try {
    const res = await fetch(`https://graph.facebook.com/v21.0/${encodeURIComponent(pixelId)}/events?access_token=${encodeURIComponent(accessToken)}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    })

    const data = await res.json().catch(() => null)
    if (!res.ok) {
      return NextResponse.json(
        { ok: false, status: res.status, error: data || "Meta API error" },
        { status: 502 }
      )
    }

    return NextResponse.json({ ok: true, meta: data })
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Request failed" },
      { status: 502 }
    )
  }
}

