/**
 * Centralized Pricing Configuration
 * 
 * This file contains all pricing data for account types and funding amounts.
 * Update prices here to automatically update them across all pages.
 */

export type AccountType = "DRAGON APEX" | "DRAGON PRIME" | "SWING" | "HFT DRAGON" | "DRAGON INSTANT PRO"

export type FundingAmount = "3K" | "5K" | "10K" | "25K" | "50K" | "100K" | "200K" | "500K"
export type FundingAmountFormatted = "$3,000" | "$5,000" | "$10,000" | "$25,000" | "$50,000" | "$100,000" | "$200,000" | "$500,000"

/**
 * Pricing configuration for all account types and funding amounts
 * Format: prices[accountType][fundingAmount] = price
 */
export const prices: Record<AccountType, Record<FundingAmount, number>> = {
  "HFT DRAGON": {
    "3K": 73,
    "5K": 110,
    "10K": 170,
    "25K": 230,
    "50K": 195,
    "100K": 280,
    "200K": 418,
    "500K": 1185,
  },
  "SWING": {
    "3K": 80,
    "5K": 110,
    "10K": 190,
    "25K": 310,
    "50K": 245,
    "100K": 405,
    "200K": 465,
    "500K": 2025,
  },
  "DRAGON PRIME": {
    "3K": 40,
    "5K": 60,
    "10K": 110,
    "25K": 150,
    "50K": 115,
    "100K": 200,
    "200K": 338,
    "500K": 995,
  },
  "DRAGON APEX": {
    "3K": 50,
    "5K": 70,
    "10K": 130,
    "25K": 170,
    "50K": 125,
    "100K": 225,
    "200K": 375,
    "500K": 1125,
  },
  "DRAGON INSTANT PRO": {
    "3K": 30,
    "5K": 45,
    "10K": 75,
    "25K": 95,
    "50K": 320,
    "100K": 725,
    "200K": 876,
    "500K": 2000,
  }
}

/**
 * Original prices for accounts with special discounts
 * Used for displaying original price before discount
 * Note: For most accounts, original price is the same as base price in prices
 * This is kept for backward compatibility and special cases
 */
export const originalPrices: Partial<Record<AccountType, Partial<Record<FundingAmount, number>>>> = {
  "DRAGON INSTANT PRO": {
    "100K": 725,
    "200K": 876,
    "500K": 2000,
  }
}

/**
 * Daily drawdown limits for each account type and funding amount
 */
export const dailyDrawdowns: Record<AccountType, Record<FundingAmount, number>> = {
  "HFT DRAGON": {
    "3K": 120,
    "5K": 200,
    "10K": 400,
    "25K": 1000,
    "50K": 2000,
    "100K": 4000,
    "200K": 8000,
    "500K": 20000,
  },
  "SWING": {
    "3K": 150,
    "5K": 250,
    "10K": 500,
    "25K": 1250,
    "50K": 2500,
    "100K": 5000,
    "200K": 10000,
    "500K": 25000,
  },
  "DRAGON PRIME": {
    "3K": 120,
    "5K": 200,
    "10K": 400,
    "25K": 1000,
    "50K": 2000,
    "100K": 4000,
    "200K": 8000,
    "500K": 20000,
  },
  "DRAGON APEX": {
    "3K": 120,
    "5K": 200,
    "10K": 400,
    "25K": 1000,
    "50K": 2000,
    "100K": 4000,
    "200K": 8000,
    "500K": 20000,
  },
  "DRAGON INSTANT PRO": {
    "3K": 120,
    "5K": 200,
    "10K": 400,
    "25K": 1000,
    "50K": 2000,
    "100K": 4000,
    "200K": 8000,
    "500K": 20000,
  }
}

/**
 * Maximum drawdown limits for each account type and funding amount
 */
export const maxDrawdowns: Record<AccountType, Record<FundingAmount, number>> = {
  "HFT DRAGON": {
    "3K": 240,
    "5K": 400,
    "10K": 800,
    "25K": 2000,
    "50K": 4000,
    "100K": 8000,
    "200K": 16000,
    "500K": 40000,
  },
  "SWING": {
    "3K": 240,
    "5K": 400,
    "10K": 800,
    "25K": 2000,
    "50K": 4000,
    "100K": 8000,
    "200K": 16000,
    "500K": 40000,
  },
  "DRAGON PRIME": {
    "3K": 300,
    "5K": 500,
    "10K": 1000,
    "25K": 50000,
    "50K": 5000,
    "100K": 10000,
    "200K": 20000,
    "500K": 50000,
  },
  "DRAGON APEX": {
    "3K": 300,
    "5K": 500,
    "10K": 1000,
    "25K": 2500,
    "50K": 5000,
    "100K": 10000,
    "200K": 20000,
    "500K": 50000,
  },
  "DRAGON INSTANT PRO": {
    "3K": 300,
    "5K": 500,
    "10K": 1000,
    "25K": 2500,
    "50K": 5000,
    "100K": 10000,
    "200K": 20000,
    "500K": 50000,
  }
}

/**
 * Helper function to get price for an account type and funding amount
 */
export function getPrice(accountType: AccountType, funding: FundingAmount): number {
  return prices[accountType]?.[funding] || 450
}

/**
 * Helper function to get price for formatted funding amount (e.g., "$50,000")
 */
export function getPriceFormatted(accountType: AccountType, funding: FundingAmountFormatted): number {
  const fundingKey = funding.replace(/[$,]/g, "").replace(/(\d)(\d{3})$/, "$1K") as FundingAmount
  return getPrice(accountType, fundingKey)
}

/**
 * Helper function to get daily drawdown for an account type and funding amount
 */
export function getDailyDrawdown(accountType: AccountType, funding: FundingAmount): number {
  return dailyDrawdowns[accountType]?.[funding] || 4000
}

/**
 * Helper function to get max drawdown for an account type and funding amount
 */
export function getMaxDrawdown(accountType: AccountType, funding: FundingAmount): number {
  return maxDrawdowns[accountType]?.[funding] || 10000
}

/**
 * Helper function to get original price (before discount) if available
 */
export function getOriginalPrice(accountType: AccountType, funding: FundingAmount): number | null {
  return originalPrices[accountType]?.[funding] || null
}

/**
 * Convert formatted funding amount (e.g., "$50,000") to FundingAmount key (e.g., "50K")
 */
export function parseFundingAmount(formatted: string): FundingAmount {
  const numeric = parseInt(formatted.replace(/[^0-9]/g, ""), 10)
  if (numeric >= 500000) return "500K"
  if (numeric >= 200000) return "200K"
  if (numeric >= 100000) return "100K"
  if (numeric >= 50000) return "50K"
  if (numeric >= 25000) return "25K"
  if (numeric >= 10000) return "10K"
  if (numeric >= 5000) return "5K"
  return "3K"
}

/**
 * Convert FundingAmount key (e.g., "50K") to formatted string (e.g., "$50,000")
 */
export function formatFundingAmount(funding: FundingAmount): FundingAmountFormatted {
  const numeric = parseInt(funding.replace("K", ""), 10) * 1000
  return `$${numeric.toLocaleString()}` as FundingAmountFormatted
}





