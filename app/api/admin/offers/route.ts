import { NextRequest, NextResponse } from "next/server"
import { withSession, errorResponse } from "@/lib/http/guard"
import {
	createOffer,
	listOffers,
	validateOfferPayload,
	type OfferPayload,
	type OfferType,
} from "@/lib/services/offers"
import { writeAuditLog } from "@/lib/services/auditLog"

export const dynamic = "force-dynamic"

export async function GET() {
	const { error } = await withSession(["admin", "support"])
	if (error) return error

	try {
		const offers = await listOffers()
		return NextResponse.json({ offers })
	} catch (err) {
		return errorResponse(err, "Failed to load offers.")
	}
}

export async function POST(req: NextRequest) {
	const { session, error } = await withSession(["admin", "support"])
	if (error) return error

	let body: OfferPayload
	try {
		body = await req.json()
	} catch {
		return NextResponse.json({ message: "Invalid JSON body." }, { status: 400 })
	}

	const invalid = validateOfferPayload(body)
	if (invalid) return NextResponse.json({ message: invalid }, { status: 422 })

	let offer
	try {
		offer = await createOffer({
			code: (body.code ?? "").trim() || null,
			name: (body.name ?? "").trim(),
			type: body.type as OfferType,
			planIds: Array.isArray(body.planIds) ? body.planIds : [],
			status: body.status,
			startsAt: body.startsAt ?? null,
			expiresAt: body.expiresAt ?? null,
			maxRedemptions: body.maxRedemptions == null ? null : Number(body.maxRedemptions),
			perUserLimit: body.perUserLimit == null ? null : Number(body.perUserLimit),
			description: body.description ?? null,
		})
	} catch (err) {
		const duplicate = err instanceof Error && /duplicate|unique/i.test(err.message)
		return NextResponse.json(
			{ message: duplicate ? "That promo code is already in use." : "Failed to create offer." },
			{ status: duplicate ? 409 : 500 },
		)
	}

	await writeAuditLog({
		userId: session.sub,
		userName: session.email,
		targetId: offer.id,
		targetType: "offer",
		action: "create",
		description: `${session.email} created offer ${offer.name} (${offer.type}).`,
	})

	return NextResponse.json({ offer }, { status: 201 })
}
