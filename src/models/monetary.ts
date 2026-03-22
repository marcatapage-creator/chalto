/**
 * CHALTO MONETARY MODELS
 * Strict integer-based arithmetic for auditability.
 */

/** Money represented as an integer of cents (e.g., 100.50€ -> 10050) */
export type MoneyCents = number;

/** Rate represented as basis points (e.g., 22% -> 2200) */
export type RateBps = number;

/**
 * Applies a rate to a monetary amount using integer arithmetic.
 * Formula: Amount × Rate / 10000
 */
export function applyRate(amount: MoneyCents, rateBps: RateBps): MoneyCents {
  return Math.floor((amount * rateBps) / 10000);
}

/**
 * Divides a monetary amount into segments, handling remainders.
 * The remainder is added to the last segment.
 */
export function divideWithRemainder(amount: MoneyCents, segments: number): MoneyCents[] {
  if (segments <= 0 || !Number.isInteger(segments) || isNaN(segments)) return [];
  
  const baseAmount = Math.floor(amount / segments);
  const result = Array(segments).fill(baseAmount);
  
  const totalDistributed = baseAmount * segments;
  const remainder = amount - totalDistributed;
  
  if (segments > 0) {
    result[segments - 1] += remainder;
  }
  
  return result;
}

/**
 * Rounds a cent amount to the nearest Euro.
 * Used for fiscal reporting and presentation.
 */
export function roundToEuro(cents: MoneyCents): number {
  return Math.round(cents / 100);
}
