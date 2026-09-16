import { NextRequest, NextResponse } from "next/server"
import { withSession, errorResponse } from "@/lib/http/guard"
import {
	deleteOffer,
	findOfferById,
	updateOffer,
	validateOfferPayload,
	type OfferPayload,
	type OfferType,
	type UpdateOfferPatch,
} from "@/lib/services/offers"
import { writeAuditLog } from "@/lib/services/auditLog"

export const dynamic = "force-dynamic"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	const { session, error } = await withSession(["admin", "support"])
	if (error) return error
	const { id } = await params

	let body: OfferPayload
	try {
		body = await req.json()
	} catch {
		return NextResponse.json({ message: "Invalid JSON body." }, { status: 400 })
	}

	const existing = await findOfferById(id)
	if (!existing) return NextResponse.json({ message: "Offer not found." }, { status: 404 })

	// Value rules depend on the type, so validate against the type this offer
	// will end up with — the one being set, or the one it already has.
	const invalid = validateOfferPayload({ ...body, type: body.type ?? existing.type }, true)
	if (invalid) return NextResponse.json({ message: invalid }, { status: 422 })

	const patch: UpdateOfferPatch = {}
	if (body.code !== undefined) patch.code = body.code
	if (body.name !== undefined) patch.name = body.name
	if (body.type !== undefined) patch.type = body.type as OfferType
	if (body.planIds !== undefined) patch.planIds = Array.isArray(body.planIds) ? body.planIds : []
	if (body.status !== undefined) patch.status = body.status
	if (body.startsAt !== undefined) patch.startsAt = body.startsAt
	if (body.expiresAt !== undefined) patch.expiresAt = body.expiresAt
	if (body.maxRedemptions !== undefined) {
		patch.maxRedemptions = body.maxRedemptions == null ? null : Number(body.maxRedemptions)
	}
	if (body.perUserLimit !== undefined) {
		patch.perUserLimit = body.perUserLimit == null ? null : Number(body.perUserLimit)
	}
	if (body.description !== undefined) patch.description = body.description

	let offer
	try {
		offer = await updateOffer(id, patch)
	} catch (err) {
		const duplicate = err instanceof Error && /duplicate|unique/i.test(err.message)
		if (duplicate) return NextResponse.json({ message: "That promo code is already in use." }, { status: 409 })
		return errorResponse(err, "Failed to update offer.")
	}

	await writeAuditLog({
		userId: session.sub,
		userName: session.email,
		targetId: offer.id,
		targetType: "offer",
		action: "update",
		description: `${session.email} updated offer ${offer.name}.`,
	})

	return NextResponse.json({ offer })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	const { session, error } = await withSession(["admin", "support"])
	if (error) return error
	const { id } = await params

	const existing = await findOfferById(id)
	if (!existing) return NextResponse.json({ message: "Offer not found." }, { status: 404 })

	try {
		await deleteOffer(id)
	} catch (err) {
		return errorResponse(err, "Failed to delete offer.")
	}

	await writeAuditLog({
		userId: session.sub,
		userName: session.email,
		targetId: id,
		targetType: "offer",
		action: "delete",
		description: `${session.email} deleted offer ${existing.name}.`,
	})

	return NextResponse.json({ ok: true })
}
