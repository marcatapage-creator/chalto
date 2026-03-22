import { MoneyCents, applyRate, divideWithRemainder } from '../../models/monetary';
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
    const realCurrentMonth = new Date().getMonth();
    const effectiveMonthsPaid = Math.max(monthsAlreadyPaid, realCurrentMonth);
    const remainingQuarters = quarterMonths.filter(m => m >= effectiveMonthsPaid);
    
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

  static scheduleSimplifiedVat(totalVatCents: MoneyCents, ruleset: Ruleset): Liability[] {
    if (totalVatCents <= 0) return [];

    const julyAmount = applyRate(totalVatCents, ruleset.vatSimplifiedAdvanceJulyRateBps);
    const decAmount = applyRate(totalVatCents, ruleset.vatSimplifiedAdvanceDecRateBps);

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    return [
      {
        id: `tva_advance_july_${ruleset.year}`,
        date: new Date(ruleset.year, 6, 15), // July
        type: 'tva' as LiabilityType,
        label: 'Acompte TVA (Juillet)',
        amountCents: julyAmount,
        isConfirmed: false,
      },
      {
        id: `tva_advance_dec_${ruleset.year}`,
        date: new Date(ruleset.year, 11, 15), // December
        type: 'tva' as LiabilityType,
        label: 'Acompte TVA (Décembre)',
        amountCents: decAmount,
        isConfirmed: false,
      }
    ].filter(l => l.date.getTime() >= todayStart);
  }

  static scheduleFiscalBurden(burden: FiscalBurdenResult, ruleset: Ruleset, vatBurdenCents: MoneyCents = 0): Liability[] {
    const year = ruleset.year;
    const liabilities: Liability[] = [];

    // 1. Social & Retirement
    liabilities.push(...this.schedule(burden.socialChargesAnnual, 'social_charges', 'URSSAF', year));
    if (burden.retirementChargesAnnual > 0) {
      liabilities.push(...this.schedule(burden.retirementChargesAnnual, 'retirement', 'Retraite (RAAP)', year));
    }

    // 2. Income Tax
    liabilities.push(...this.schedule(burden.incomeTaxEstimateAnnual, 'income_tax', 'Impôt sur le Revenu', year));

    // 3. VAT (Simplified)
    if (vatBurdenCents > 0) {
      liabilities.push(...this.scheduleSimplifiedVat(vatBurdenCents, ruleset));
    }

    // 4. CFE (Fixed December payment)
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
