/**
 * Single source of truth for the legal entity behind GenzProp.
 * Used by the footer and the legal pages (terms, privacy, refund).
 */
export const COMPANY = {
	/** Registered legal entity operating the GenzProp brand. */
	legalName: "Nexthorne Pvt Ltd",
	/** Company registration number. */
	registrationNumber: "0311554",
	brand: "GenzProp",
	country: "Pakistan",
	site: "genzprop.com",
	supportEmail: "helpdesk@genzprop.com",
} as const;

/** e.g. "Nexthorne Pvt Ltd — Company Registration No. 0311554" */
export const COMPANY_LINE = `${COMPANY.legalName} — Company Registration No. ${COMPANY.registrationNumber}`;

/** Shared "last updated" date for the legal pages. */
export const LEGAL_LAST_UPDATED = "September 4, 2026";
