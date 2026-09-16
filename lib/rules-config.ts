/**
 * Canonical GenzProp trading rules — single source of truth.
 *
 * Every rule number rendered anywhere in the app (marketing pricing table, buy
 * page comparison, dashboard "Objectives & Rules", Facts & Rules, help centre)
 * must come from here so the numbers can never drift apart again.
 *
 * Source: GenzProp Help Center — "Complete Collection of Help Articles".
 */

export type AccountRuleType = "alpha" | "beta" | "sigma"

/** Rule values that never change by account type or stage. */
export const GLOBAL_RULES = {
	/** Maximum daily loss, % of INITIAL account balance — every type, every stage. */
	dailyDrawdownPct: 4,
	/** Leverage cap across every asset class, every account type and stage. */
	leverage: "1:100",
	/** Daily loss and Profitable Day counters reset here (dashboard time). */
	dailyResetUtc: "00:00 UTC",
	/** Profit needed in one day for it to count as a Profitable Day, % of initial balance. */
	profitableDayPct: 0.5,
	/** Every trade must stay open at least this long. */
	minHoldingTimeMinutes: 3,
	/** No trade for this many consecutive days closes the account. */
	inactivityDays: 30,
	/** There is no profit consistency rule at GenzProp. */
	consistencyRule: "None",
	/** Funded/Instant: one trade per this window, measured from the previous open. */
	layeringWindowMinutes: 5,
	/** Instant only: hard cap on simultaneously open layers. */
	instantMaxConcurrentLayers: 2,
	/** Tick-scalping hard breach: this many sub-10s closes inside one hour. */
	tickScalpTradesPerHour: 3,
	/** Overnight holding is free on every plan — swap/rollover charges apply as normal. */
	overnightHolding: "Allowed",
	/** Weekend holding is blocked by default and sold as a checkout add-on. */
	weekendHolding: "Paid add-on",
	/** Weekend closure window during which positions may not be held without the add-on. */
	weekendWindow: "Friday 23:00 UTC – Sunday 23:00 UTC",
	/** Hedging inside one account is fine; hedging across accounts is prohibited. */
	hedging: "Allowed (single account only)",
	/** Funded/Instant news embargo: minutes either side of a high-impact release. */
	newsWindowMinutes: 5,
	/** Days that must pass after funding before the first withdrawal request. */
	withdrawalEligibilityDays: 14,
	/** Payout cadence, in calendar days. */
	payoutCycleDays: 14,
	/** Withdrawable profit cap per payout period, % of initial balance. */
	withdrawalCapPct: 6,
	/** There is no minimum profit threshold on any account type. */
	minWithdrawalAmount: "None",
} as const

/** Profit split by withdrawal number (trader share %). */
export const PROFIT_SPLIT = [
	{ withdrawal: "1st withdrawal", trader: 80, firm: 20 },
	{ withdrawal: "2nd withdrawal", trader: 85, firm: 15 },
	{ withdrawal: "3rd withdrawal", trader: 90, firm: 10 },
	{ withdrawal: "4th and onward", trader: 90, firm: 10 },
] as const

export interface AccountRules {
	/** Human label used in headings. */
	label: string
	/** Profit target per phase, % of initial balance. `null` = no target. */
	profitTarget: { phase1: number | null; phase2: number | null; funded: number | null }
	/** Short one-line rendering of the profit target for tables. */
	profitTargetLabel: string
	/** Maximum daily loss, % of initial balance. */
	dailyDrawdown: string
	/** Overall loss limit, % of initial balance — static, never trails. */
	maxDrawdown: string
	/** Overall loss limit during the evaluation phases (Instant has none). */
	maxDrawdownEvaluation: string | null
	/** Profitable Days needed during the challenge phases. */
	minProfitableDaysChallenge: number | null
	/** Profitable Days needed on the funded / Instant stage. */
	minProfitableDaysFunded: number
	/** Extra plain Trading Days on top of the Profitable Days (funded / Instant). */
	minTradingDaysFunded: number
	/** Total qualifying days before a payout can be requested. */
	minDaysTotalFunded: number
	/** Days shown in compact comparison tables. */
	minDaysLabel: string
	leverage: string
	minHoldingTime: string
	weekendHolding: string
	overnightHolding: string
	consistencyRule: string
	hedging: string
	/** News policy during the challenge phases. */
	newsChallenge: string
	/** News policy on the funded / Instant stage. */
	newsFunded: string
	/** Trade layering restriction that applies to this type. */
	layering: string
	/** Is the evaluation fee refunded with the first payout? */
	feeRefunded: boolean
}

const RULES: Record<AccountRuleType, AccountRules> = {
	alpha: {
		label: "Step 1",
		profitTarget: { phase1: 10, phase2: null, funded: null },
		profitTargetLabel: "Phase 1: 10% · Funded: none",
		dailyDrawdown: "4%",
		maxDrawdown: "10%",
		maxDrawdownEvaluation: "10%",
		minProfitableDaysChallenge: 3,
		minProfitableDaysFunded: 3,
		minTradingDaysFunded: 2,
		minDaysTotalFunded: 5,
		minDaysLabel: "3 Profitable Days (challenge) · 5 days (funded)",
		leverage: GLOBAL_RULES.leverage,
		minHoldingTime: "3 minutes",
		weekendHolding: GLOBAL_RULES.weekendHolding,
		overnightHolding: GLOBAL_RULES.overnightHolding,
		consistencyRule: GLOBAL_RULES.consistencyRule,
		hedging: GLOBAL_RULES.hedging,
		newsChallenge: "Unrestricted",
		newsFunded: "10-minute restricted window (soft breach)",
		layering: "Funded: 1 trade per 5-minute window",
		feeRefunded: true,
	},
	beta: {
		label: "Step 2",
		profitTarget: { phase1: 10, phase2: 5, funded: null },
		profitTargetLabel: "Phase 1: 10% · Phase 2: 5% · Funded: none",
		dailyDrawdown: "4%",
		maxDrawdown: "10%",
		maxDrawdownEvaluation: "10%",
		minProfitableDaysChallenge: 3,
		minProfitableDaysFunded: 3,
		minTradingDaysFunded: 2,
		minDaysTotalFunded: 5,
		minDaysLabel: "3 Profitable Days per phase · 5 days (funded)",
		leverage: GLOBAL_RULES.leverage,
		minHoldingTime: "3 minutes",
		weekendHolding: GLOBAL_RULES.weekendHolding,
		overnightHolding: GLOBAL_RULES.overnightHolding,
		consistencyRule: GLOBAL_RULES.consistencyRule,
		hedging: GLOBAL_RULES.hedging,
		newsChallenge: "Unrestricted",
		newsFunded: "10-minute restricted window (soft breach)",
		layering: "Funded: 1 trade per 5-minute window",
		feeRefunded: true,
	},
	sigma: {
		label: "Instant",
		profitTarget: { phase1: null, phase2: null, funded: null },
		profitTargetLabel: "None — funded from day one",
		dailyDrawdown: "4%",
		maxDrawdown: "6%",
		maxDrawdownEvaluation: null,
		minProfitableDaysChallenge: null,
		minProfitableDaysFunded: 3,
		minTradingDaysFunded: 2,
		minDaysTotalFunded: 5,
		minDaysLabel: "5 days (3 Profitable + 2 Trading)",
		leverage: GLOBAL_RULES.leverage,
		minHoldingTime: "3 minutes",
		weekendHolding: GLOBAL_RULES.weekendHolding,
		overnightHolding: GLOBAL_RULES.overnightHolding,
		consistencyRule: GLOBAL_RULES.consistencyRule,
		hedging: GLOBAL_RULES.hedging,
		newsChallenge: "—",
		newsFunded: "10-minute restricted window (soft breach)",
		layering: "1 trade per 5-minute window · max 2 concurrent layers",
		feeRefunded: false,
	},
}

export function getAccountRuleType(challengeType: string | null | undefined): AccountRuleType {
	const t = (challengeType ?? "").toLowerCase().trim()
	if (t.includes("sigma") || t.includes("instant")) return "sigma"
	if (t.includes("beta")) return "beta"
	if (t.includes("alpha")) return "alpha"
	if (t.includes("step 2") || t.includes("step2") || t.includes("phase 2") || t.includes("phase2")) return "beta"
	if (t.includes("step 1") || t.includes("step1") || t.includes("phase 1") || t.includes("phase1")) return "alpha"
	return "sigma"
}

export function getAccountRules(challengeType: string | null | undefined): AccountRules {
	return RULES[getAccountRuleType(challengeType)]
}

/** Ordered list used by comparison tables on the buy and pricing pages. */
export const ACCOUNT_RULE_TYPES: AccountRuleType[] = ["alpha", "beta", "sigma"]

export const ALL_ACCOUNT_RULES = RULES

/**
 * Minimum qualifying days for a given account type and stage.
 * Step 1 / Step 2 challenge phases need 3 Profitable Days; Instant and every
 * funded stage need 5 total days (3 Profitable + 2 Trading).
 */
export function getMinDays(
	type: AccountRuleType,
	stage: "challenge" | "funded",
): { profitableDays: number; tradingDays: number; total: number } {
	const r = RULES[type]
	if (stage === "challenge" && r.minProfitableDaysChallenge != null) {
		return { profitableDays: r.minProfitableDaysChallenge, tradingDays: 0, total: r.minProfitableDaysChallenge }
	}
	return {
		profitableDays: r.minProfitableDaysFunded,
		tradingDays: r.minTradingDaysFunded,
		total: r.minDaysTotalFunded,
	}
}

/** Overall loss limit as a number, for gauges and breach checks. */
export function getMaxDrawdownPct(type: AccountRuleType, stage: "challenge" | "funded" = "funded"): number {
	const r = RULES[type]
	const raw = stage === "challenge" ? (r.maxDrawdownEvaluation ?? r.maxDrawdown) : r.maxDrawdown
	return parseFloat(raw)
}
