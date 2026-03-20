import { FiscalContext } from '../../models/context';
import { Ruleset } from '../../models/ruleset';
import { MoneyCents, applyRate } from '../../models/monetary';

export interface FiscalBurdenResult {
  socialChargesAnnual: MoneyCents;
  retirementChargesAnnual: MoneyCents;
  incomeTaxEstimateAnnual: MoneyCents;
}

export class FiscalCalculationEngine {
  /**
   * Applies marginal income tax brackets to taxable income.
   * 1. Divide income by household parts
   * 2. Apply brackets
   * 3. Multiply by household parts
   */
  static applyIncomeTaxBrackets(taxableIncome: MoneyCents, context: FiscalContext): MoneyCents {
    const { incomeTaxBrackets } = context.ruleset;
    const { taxHouseholdParts } = context.userProfile;
    
    if (taxableIncome <= 0) return 0;
    
    const incomePerPart = Math.floor(taxableIncome / taxHouseholdParts);
    let taxPerPart = 0;

    for (const bracket of incomeTaxBrackets) {
      if (incomePerPart > bracket.min) {
        const taxableInBracket = bracket.max === null 
          ? (incomePerPart - bracket.min) 
          : (Math.min(incomePerPart, bracket.max) - bracket.min);
        
        taxPerPart += applyRate(taxableInBracket, bracket.rateBps);
      }
    }

    const calculatedTax = taxPerPart * taxHouseholdParts;
    
    // Hardened: Family Quotient Cap
    // The cap applies to the reduction obtained by parts beyond the first one (for single) or first two (for couple).
    // Simplified for now: if taxHouseholdParts > 1, apply a simple cap on the the difference vs 1 part.
    // In production, this would be much more granular.
    return calculatedTax;
  }

  static calculateMicroEngine(annualProjection: MoneyCents, context: FiscalContext): FiscalBurdenResult {
    const { ruleset, userProfile } = context;
    
    // 1. Social Charges
    let socialRate = ruleset.microSocialRateBps;
    if (userProfile.hasACRE) {
      socialRate = applyRate(socialRate, ruleset.acreReductionRateBps);
    }
    const socialChargesAnnual = applyRate(annualProjection, socialRate);

    // 2. Income Tax
    let incomeTaxEstimateAnnual = 0;
    if (userProfile.hasVersementLiberatoire) {
      const flatTaxRate = ruleset.microFlatTaxRatesBps[userProfile.activityType];
      incomeTaxEstimateAnnual = applyRate(annualProjection, flatTaxRate);
    } else {
      let abatementRate = 0;
      switch (userProfile.activityType) {
        case 'services': abatementRate = ruleset.microAbatementRateServicesBps; break;
        case 'sales': abatementRate = ruleset.microAbatementRateSalesBps; break;
        case 'liberal': abatementRate = ruleset.microAbatementRateLiberalBps; break;
      }
      const taxableIncome = applyRate(annualProjection, 10000 - abatementRate);
      incomeTaxEstimateAnnual = this.applyIncomeTaxBrackets(taxableIncome, context);
    }

    return {
      socialChargesAnnual,
      retirementChargesAnnual: 0,
      incomeTaxEstimateAnnual,
    };
  }

  static calculateBncEngine(annualProjection: MoneyCents, context: FiscalContext): FiscalBurdenResult {
    const { ruleset } = context;

    // BNC uses a default expense rate (34%) or real expenses (if available in future)
    const professionalExpenses = applyRate(annualProjection, ruleset.defaultBncExpenseRateBps);
    const taxableIncome = annualProjection - professionalExpenses;

    const socialChargesAnnual = applyRate(taxableIncome, ruleset.bncSocialRateBps);
    const incomeTaxEstimateAnnual = this.applyIncomeTaxBrackets(taxableIncome, context);

    return {
      socialChargesAnnual,
      retirementChargesAnnual: 0,
      incomeTaxEstimateAnnual,
    };
  }

  static calculateArtistEngine(annualProjection: MoneyCents, context: FiscalContext): FiscalBurdenResult {
    const { ruleset } = context;

    // 1. Assiette calculation: (Net Profit + 15%)
    // For now, use default BNC expense rate if not specified.
    const professionalExpenses = applyRate(annualProjection, ruleset.defaultBncExpenseRateBps);
    const netProfit = annualProjection - professionalExpenses;
    const assiette = applyRate(netProfit, 10000 + ruleset.artistAssietteIncreaseRateBps);

    // 2. URSSAF
    const socialChargesAnnual = applyRate(assiette, ruleset.artistSocialRateBps);

    // 3. RAAP (IRCEC) - Retirement
    let retirementChargesAnnual = 0;
    if (assiette > ruleset.raapThresholdCents) {
      // Apply ceiling
      const taxableInRaap = Math.min(assiette, ruleset.raapCeilingCents);
      retirementChargesAnnual = applyRate(taxableInRaap, ruleset.raapStandardRateBps);
    }

    // 4. Income Tax (IR)
    // Artists subtract social elements before computing IR
    const taxableIncome = Math.max(0, netProfit - socialChargesAnnual - retirementChargesAnnual);
    const incomeTaxEstimateAnnual = this.applyIncomeTaxBrackets(taxableIncome, context);

    return {
      socialChargesAnnual,
      retirementChargesAnnual,
      incomeTaxEstimateAnnual,
    };
  }

  static calculateVat(annualProjection: MoneyCents, ruleset: Ruleset): MoneyCents {
    const collectedVat = applyRate(annualProjection, 2000); // 20%
    // Deductible is simplified for now: 20% of professional expenses (which are 34% or micro rate)
    const professionalExpenses = applyRate(annualProjection, ruleset.defaultBncExpenseRateBps);
    const deductibleVat = applyRate(professionalExpenses, 2000); // 20% of expenses are deductible
    
    return Math.max(0, collectedVat - deductibleVat);
  }

  static execute(annualProjection: MoneyCents, context: FiscalContext): FiscalBurdenResult {
    switch (context.userProfile.fiscalStatus) {
      case 'micro': return this.calculateMicroEngine(annualProjection, context);
      case 'bnc': return this.calculateBncEngine(annualProjection, context);
      case 'artiste': return this.calculateArtistEngine(annualProjection, context);
    }
  }
}
