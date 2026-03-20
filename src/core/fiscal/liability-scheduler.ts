import { MoneyCents, divideWithRemainder } from '../../models/monetary';
import { Liability, LiabilityType } from '../../models/liability';
import { FiscalBurdenResult } from './fiscal-engine';
import { Ruleset } from '../../models/ruleset';

export class LiabilityScheduler {
  /**
   * Schedules payments for a given burden.
   * For this simplified version, we'll schedule 4 quarterly payments.
   */
  static schedule(
    totalBurdenCents: MoneyCents, 
    type: LiabilityType, 
    label: string, 
    year: number,
    monthsAlreadyPaid: number = 0
  ): Liability[] {
    if (totalBurdenCents <= 0) return [];

    // French standard: 4 quarters (Feb, May, Aug, Nov)
    const quarterMonths = [1, 4, 7, 10]; // 0-indexed months
    const remainingQuarters = quarterMonths.filter(m => m >= monthsAlreadyPaid);
    
    if (remainingQuarters.length === 0) return [];

    const payments = divideWithRemainder(totalBurdenCents, remainingQuarters.length);
    
    return remainingQuarters.map((month, index) => ({
      id: `${type}_${year}_Q${index + 1}`,
      date: new Date(year, month, 15), // 15th of the month
      type,
      label: `${label} (Q${index + 1})`,
      amountCents: payments[index],
      isConfirmed: false,
    }));
  }

  static scheduleFiscalBurden(burden: FiscalBurdenResult, ruleset: Ruleset): Liability[] {
    const year = ruleset.year;
    const liabilities: Liability[] = [];

    // 1. Social & Retirement (Combined or separate?)
    liabilities.push(...this.schedule(burden.socialChargesAnnual, 'social_charges', 'URSSAF', year));
    if (burden.retirementChargesAnnual > 0) {
      liabilities.push(...this.schedule(burden.retirementChargesAnnual, 'retirement', 'Retraite', year));
    }

    // 2. Income Tax
    liabilities.push(...this.schedule(burden.incomeTaxEstimateAnnual, 'income_tax', 'Impôt sur le Revenu', year));

    // 3. CFE (Fixed December payment)
    if (ruleset.cfeEstimateCents > 0) {
      liabilities.push({
        id: `cfe_${year}`,
        date: new Date(year, 11, 15),
        type: 'cfe',
        label: 'CFE',
        amountCents: ruleset.cfeEstimateCents,
        isConfirmed: false,
      });
    }

    return liabilities;
  }
}
