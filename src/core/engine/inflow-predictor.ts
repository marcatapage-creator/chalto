import { MoneyCents, divideWithRemainder } from '../../models/monetary';
import { FiscalContext } from '../../models/context';
import { Inflow } from './simulation-engine';

export class InflowPredictor {
  /**
   * Spreads the remaining annual revenue projection across the remaining months.
   * Hardened: respects safetyMode.
   */
  static predict(
    annualProjectionCents: MoneyCents, 
    context: FiscalContext, 
    confidence: 'NONE' | 'MEDIUM' | 'HIGH'
  ): Inflow[] {
    const { userProfile, normalizedValues, ruleset } = context;
    const { monthsElapsed, revenueYTD } = normalizedValues;
    const year = ruleset.year;

    // Safety Policy: in conservative mode, only high-confidence inflows are cabled.
    if (userProfile.safetyMode === 'conservative' && confidence !== 'HIGH') {
      return [];
    }

    const remainingRevenue = Math.max(0, annualProjectionCents - revenueYTD);
    const remainingMonths = 12 - monthsElapsed;

    if (remainingMonths <= 0 || remainingRevenue <= 0) return [];

    const payments = divideWithRemainder(remainingRevenue, remainingMonths);
    
    return payments.map((amount, index) => {
      const monthIndex = monthsElapsed + index; // 0-indexed month
      return {
        id: `projected_inflow_${monthIndex}`,
        date: new Date(year, monthIndex, 25),
        amountCents: amount,
        label: userProfile.safetyMode === 'conservative' ? 'Revenu Prévu (Prudents)' : 'Revenu Estimé (Forecast)',
      };
    });
  }
}
