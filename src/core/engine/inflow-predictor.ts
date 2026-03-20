import { MoneyCents, divideWithRemainder } from '../../models/monetary';
import { FiscalContext } from '../../models/context';
import { Inflow } from './simulation-engine';

export class InflowPredictor {
  /**
   * Spreads the remaining annual revenue projection across the remaining months.
   */
  static predict(annualProjectionCents: MoneyCents, context: FiscalContext): Inflow[] {
    const { monthsElapsed, revenueYTD } = context.normalizedValues;
    const remainingRevenue = Math.max(0, annualProjectionCents - revenueYTD);
    const remainingMonths = 12 - monthsElapsed;

    if (remainingMonths <= 0 || remainingRevenue <= 0) return [];

    const payments = divideWithRemainder(remainingRevenue, remainingMonths);
    const year = context.ruleset.year;
    
    return payments.map((amount, index) => {
      const monthIndex = monthsElapsed + index; // 0-indexed month
      return {
        id: `projected_inflow_${monthIndex}`,
        date: new Date(year, monthIndex, 25), // Usually end of month
        amountCents: amount,
        label: 'Revenu Estimé',
      };
    });
  }
}
