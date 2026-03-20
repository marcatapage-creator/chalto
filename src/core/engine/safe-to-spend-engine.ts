import { MoneyCents } from '../../models/monetary';

export class SafeToSpendEngine {
  /**
   * authoritative formula:
   * safeToSpend = max(0, minProjectedBalance - safetyFloor)
   */
  static calculate(minProjectedBalanceCents: number, safetyFloorCents: MoneyCents = 0): MoneyCents {
    return Math.max(0, minProjectedBalanceCents - safetyFloorCents);
  }
}
