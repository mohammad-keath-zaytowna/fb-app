/**
 * Currency utilities for the mobile app
 */

export type CurrencyCode = "USD" | "JOD" | "SP";

export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  USD: "$",
  JOD: "JOD",
  SP: "SP",
};

/**
 * Get currency symbol from currency code
 */
export function getCurrencySymbol(currency: CurrencyCode = "USD"): string  {
  return CURRENCY_SYMBOLS[currency] || "$";
}

/**
 * Format price value (number only, no currency symbol)
 * SP currency shows no decimals, others show 2 decimals
 */
export function formatPriceValue(
  price: number,
  currency: CurrencyCode = "USD"
): string {
  return currency === "SP" ? price.toString() : price.toFixed(2);
}

/**
 * Format price with currency
 */
export function formatPrice(
  price: number,
  currency: CurrencyCode = "JOD"
): string {
  const symbol = getCurrencySymbol(currency);
  const formattedPrice = formatPriceValue(price, currency);
  
  // For USD, put symbol before price; for others, put after
  if (currency === "JOD") {
    return `${symbol}${formattedPrice}`;
  }
  return `${symbol} ${formattedPrice}`;
}

/**
 * Get effective currency from user (uses user's currency or defaults to USD)
 */
export function getUserCurrency(user: any): CurrencyCode {
  return user?.currency || "JOD";
}
