/**
 * Centralized currency helper for BDT to USD conversion
 * Conversion Rate: 1 USD = 120 BDT
 */

export const CONVERSION_RATE = 120;

/**
 * Converts BDT amount to USD
 * @param bdtAmount Amount in BDT
 * @returns Amount in USD
 */
export const convertBDTtoUSD = (bdtAmount: number): number => {
  return Math.round((bdtAmount / CONVERSION_RATE) * 100) / 100;
};

/**
 * Formats BDT amount with currency symbol
 * @param amount Amount in BDT
 * @returns Formatted string (e.g., ৳ 1,200)
 */
export const formatBDT = (amount: number): string => {
  return `৳${amount.toLocaleString()}`;
};

/**
 * Formats USD amount with currency symbol
 * @param amount Amount in USD
 * @returns Formatted string (e.g., $ 10.00)
 */
export const formatUSD = (amount: number): string => {
  return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};
