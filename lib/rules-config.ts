/**
 * Account rules matching /rules page.
 * Used in Objectives & Rules card on performance page.
 */

export type AccountRuleType = "sigma" | "beta" | "alpha"

export interface AccountRules {
  label: string
  dailyDrawdown: string
  maxDrawdown: string
  weekendHolding: "Allowed" | "Not Allowed"
  overnightHolding: "Allowed" | "Not Allowed"
  consistencyRule: string
  minTradingDays: number
  hedging: "Allowed" | "Not Allowed"
}

const RULES: Record<AccountRuleType, AccountRules> = {
  sigma: {
    label: "Instant",
    dailyDrawdown: "5%",
    maxDrawdown: "8%",
    weekendHolding: "Not Allowed",
    overnightHolding: "Not Allowed",
    consistencyRule: "25%",
    minTradingDays: 0,
    hedging: "Not Allowed",
  },
  beta: {
    label: "Step 2",
    dailyDrawdown: "5%",
    maxDrawdown: "8%",
    weekendHolding: "Allowed",
    overnightHolding: "Allowed",
    consistencyRule: "Not Applied",
    minTradingDays: 5,
    hedging: "Allowed",
  },
  alpha: {
    label: "Step 1",
    dailyDrawdown: "5%",
    maxDrawdown: "8%",
    weekendHolding: "Not Allowed",
    overnightHolding: "Not Allowed",
    consistencyRule: "25%",
    minTradingDays: 5,
    hedging: "Allowed",
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
  const type = getAccountRuleType(challengeType)
  return RULES[type]
}
