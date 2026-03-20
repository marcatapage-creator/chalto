import { FiscalContext } from '../../models/context';
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

    return taxPerPart * taxHouseholdParts;
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

    const socialChargesAnnual = applyRate(annualProjection, ruleset.artistSocialRateBps);
    const retirementChargesAnnual = applyRate(annualProjection, ruleset.artistRetirementRateBps);

    // Artists subtract social elements before computing IR
    const taxableIncome = Math.max(0, annualProjection - socialChargesAnnual - retirementChargesAnnual);
    const incomeTaxEstimateAnnual = this.applyIncomeTaxBrackets(taxableIncome, context);

    return {
      socialChargesAnnual,
      retirementChargesAnnual,
      incomeTaxEstimateAnnual,
    };
  }

  static execute(annualProjection: MoneyCents, context: FiscalContext): FiscalBurdenResult {
    switch (context.userProfile.fiscalStatus) {
      case 'micro': return this.calculateMicroEngine(annualProjection, context);
      case 'bnc': return this.calculateBncEngine(annualProjection, context);
      case 'artiste': return this.calculateArtistEngine(annualProjection, context);
    }
  }
}
