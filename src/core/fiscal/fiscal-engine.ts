import { FiscalContext } from '../../models/context';
import { UserProfile } from '../../models/user';
import { Ruleset } from '../../models/ruleset';
import { MoneyCents, applyRate } from '../../models/monetary';

export interface FiscalBurdenResult {
  socialChargesAnnual: MoneyCents;
  retirementChargesAnnual: MoneyCents;
  incomeTaxEstimateAnnual: MoneyCents;
  auditTrace?: string[];
}

export class FiscalCalculationEngine {
  /**
   * Applies marginal income tax brackets to taxable income.
   * Includes Family Quotient Cap and CEHR (High Income Surcharge).
   */
  static applyIncomeTaxBrackets(
    taxableIncome: MoneyCents, 
    context: FiscalContext, 
    trace?: string[]
  ): MoneyCents {
    const { ruleset, userProfile } = context;
    const { taxHouseholdParts } = userProfile;
    
    if (taxableIncome <= 0) return 0;

    const calculateRawTax = (income: MoneyCents, parts: number): MoneyCents => {
      const incomePerPart = Math.floor(income / parts);
      let taxPerPart = 0;
      for (const bracket of ruleset.incomeTaxBrackets) {
        if (incomePerPart > bracket.min) {
          const taxableInBracket = bracket.max === null 
            ? (incomePerPart - bracket.min) 
            : (Math.min(incomePerPart, bracket.max) - bracket.min);
          taxPerPart += applyRate(taxableInBracket, bracket.rateBps);
        }
      }
      return taxPerPart * parts;
    };

    // 1. Calculate Tax with all parts
    const taxFull = calculateRawTax(taxableIncome, taxHouseholdParts);
    
    // 2. Handle Family Quotient Cap (Plafonnement)
    let finalIr = taxFull;
    if (taxHouseholdParts > 1) {
      // Base parts: 1 for single, 2 for couple/widow
      // Simplified: we assume parts >= 2 means couple logic
      const baseParts = taxHouseholdParts >= 2 ? 2 : 1;
      const taxBase = calculateRawTax(taxableIncome, baseParts);
      
      const realGainCents = taxBase - taxFull;
      const additionalParts = taxHouseholdParts - baseParts;
      // 1,759€ per half-part -> 3,518€ per full part
      const maxGainCents = additionalParts * 2 * ruleset.familyQuotientCapCents;

      if (realGainCents > maxGainCents) {
        finalIr = taxBase - maxGainCents;
        trace?.push(`Plafonnement du quotient familial appliqué : Gain limité à ${maxGainCents/100}€ (au lieu de ${realGainCents/100}€)`);
      } else {
        trace?.push(`Gain du quotient familial : ${realGainCents/100}€ (sous le plafond de ${maxGainCents/100}€)`);
      }
    } else {
      trace?.push(`Calcul IR (1 part) : ${finalIr/100}€`);
    }

    // 3. Handle CEHR (Contribution Exceptionnelle sur les Hauts Revenus)
    const cehr = this.calculateCehr(taxableIncome, context, trace);
    
    return finalIr + cehr;
  }

  static calculateCehr(taxableIncome: MoneyCents, context: FiscalContext, trace?: string[]): MoneyCents {
    const { ruleset, userProfile } = context;
    // Thresholds are for single person, doubled for couples (usually 2 parts)
    const multiplier = userProfile.taxHouseholdParts >= 2 ? 2 : 1;
    
    let totalCehr = 0;

    // Implementation of CEHR Brackets:
    const t1 = ruleset.cehrBrackets[0].thresholdCents * multiplier;
    const t2 = ruleset.cehrBrackets[1].thresholdCents * multiplier;
    
    if (taxableIncome > t1) {
      const slice1 = Math.min(taxableIncome, t2) - t1;
      const cehr1 = applyRate(slice1, ruleset.cehrBrackets[0].rateBps);
      totalCehr += cehr1;
      
      if (taxableIncome > t2) {
        const slice2 = taxableIncome - t2;
        const cehr2 = applyRate(slice2, ruleset.cehrBrackets[1].rateBps);
        totalCehr += cehr2;
      }
      
      trace?.push(`CEHR (Hauts Revenus) calculée : ${totalCehr/100}€`);
    }

    return totalCehr;
  }

  static calculateMicroEngine(annualProjection: MoneyCents, context: FiscalContext): FiscalBurdenResult {
    const { ruleset, userProfile } = context;
    const trace: string[] = [];
    
    // 1. Social Charges
    let socialRate = ruleset.microSocialRateBps;
    if (userProfile.hasACRE) {
      socialRate = applyRate(socialRate, ruleset.acreReductionRateBps);
      trace.push(`ACRE appliqué : Taux social réduit à ${socialRate/100}%`);
    }
    const socialChargesAnnual = applyRate(annualProjection, socialRate);
    trace.push(`Charges sociales (Micro) : ${socialChargesAnnual/100}€ (${socialRate/100}% sur ${annualProjection/100}€ de CA)`);

    // 2. Income Tax
    let incomeTaxEstimateAnnual = 0;
    if (userProfile.hasVersementLiberatoire) {
      const flatTaxRate = ruleset.microFlatTaxRatesBps[userProfile.activityType];
      incomeTaxEstimateAnnual = applyRate(annualProjection, flatTaxRate);
      trace.push(`Versement Libératoire (${userProfile.activityType}) : ${incomeTaxEstimateAnnual/100}€ (${flatTaxRate/100}% du CA)`);
    } else {
      let abatementRate = 0;
      switch (userProfile.activityType) {
        case 'services': abatementRate = ruleset.microAbatementRateServicesBps; break;
        case 'sales': abatementRate = ruleset.microAbatementRateSalesBps; break;
        case 'liberal': abatementRate = ruleset.microAbatementRateLiberalBps; break;
      }
      const taxableIncome = applyRate(annualProjection, 10000 - abatementRate);
      trace.push(`Abattement forfaitaire (${abatementRate/100}%) : Revenu imposable = ${taxableIncome/100}€`);
      trace.push(`Note: Cette projection suppose ${abatementRate/100}% de frais. Si vos frais réels dépassent ce seuil, votre impôt réel sera inférieur.`);
      incomeTaxEstimateAnnual = this.applyIncomeTaxBrackets(taxableIncome, context, trace);
    }

    return {
      socialChargesAnnual,
      retirementChargesAnnual: 0,
      incomeTaxEstimateAnnual,
      auditTrace: trace,
    };
  }

  static calculateBncEngine(annualProjection: MoneyCents, context: FiscalContext): FiscalBurdenResult {
    const { ruleset, userProfile } = context;
    const trace: string[] = [];

    // Use ratio from profile if available, else fallback to 34%
    const expenseRate = userProfile.professionalExpensesRatio ?? ruleset.defaultBncExpenseRateBps;
    const professionalExpenses = applyRate(annualProjection, expenseRate);
    const taxableIncome = annualProjection - professionalExpenses;
    
    if (userProfile.professionalExpensesRatio !== undefined) {
      trace.push(`Frais professionnels réels (Ratio ${expenseRate/100}%) : ${professionalExpenses/100}€`);
    } else {
      trace.push(`Frais professionnels (BNC forfaitaire 34%) : ${professionalExpenses/100}€`);
      trace.push(`Note: Cette projection suppose 34% de frais. Si vos frais réels dépassent ce seuil, votre impôt réel sera inférieur.`);
    }

    const socialChargesAnnual = applyRate(taxableIncome, ruleset.bncSocialRateBps);
    trace.push(`Charges sociales (BNC) : ${socialChargesAnnual/100}€ (${ruleset.bncSocialRateBps/100}% sur bénéfice de ${taxableIncome/100}€)`);
    
    // IR is calculated on profit minus social charges
    const netTaxableIncome = Math.max(0, taxableIncome - socialChargesAnnual);
    trace.push(`Revenu imposable après cotisations : ${netTaxableIncome/100}€`);
    const incomeTaxEstimateAnnual = this.applyIncomeTaxBrackets(netTaxableIncome, context, trace);

    return {
      socialChargesAnnual,
      retirementChargesAnnual: 0,
      incomeTaxEstimateAnnual,
      auditTrace: trace,
    };
  }

  static calculateArtistEngine(annualProjection: MoneyCents, context: FiscalContext): FiscalBurdenResult {
    const { ruleset, userProfile } = context;
    const trace: string[] = [];

    // 1. Assiette calculation: (Net Profit + 15%)
    const expenseRate = userProfile.professionalExpensesRatio ?? ruleset.defaultBncExpenseRateBps;
    const professionalExpenses = applyRate(annualProjection, expenseRate);
    const netProfit = annualProjection - professionalExpenses;
    const assiette = applyRate(netProfit, 10000 + ruleset.artistAssietteIncreaseRateBps);

    if (userProfile.professionalExpensesRatio !== undefined) {
      trace.push(`Base sociale Artiste : ${assiette/100}€ (Bénéfice Réel ${netProfit/100}€ + ${ruleset.artistAssietteIncreaseRateBps/100}%)`);
    } else {
      trace.push(`Base sociale Artiste : ${assiette/100}€ (Bénéfice Forfaitaire ${netProfit/100}€ + ${ruleset.artistAssietteIncreaseRateBps/100}%)`);
    }

    // 2. URSSAF
    const socialChargesAnnual = applyRate(assiette, ruleset.artistSocialRateBps);
    trace.push(`Charges sociales URSSAF : ${socialChargesAnnual/100}€ (${ruleset.artistSocialRateBps/100}%)`);

    // 3. RAAP (IRCEC) - Retirement
    let retirementChargesAnnual = 0;
    if (ruleset.raapBrackets && ruleset.raapBrackets.length > 0) {
      const bracket = ruleset.raapBrackets.find(b => 
        assiette >= b.min && (b.max === null || assiette < b.max)
      );
      if (bracket) {
        retirementChargesAnnual = bracket.amountCents;
        trace.push(`Retraite RAAP : ${retirementChargesAnnual/100}€ (Classe de cotisation par palier fixe)`);
      }
    } else if (assiette > ruleset.raapThresholdCents) {
      const taxableInRaap = Math.min(assiette, ruleset.raapCeilingCents);
      const raapRate = context.userProfile.raapReducedRateOption ? ruleset.raapReducedRateBps : ruleset.raapStandardRateBps;
      retirementChargesAnnual = applyRate(taxableInRaap, raapRate);
      trace.push(`Retraite RAAP : ${retirementChargesAnnual/100}€ (${raapRate/100}% sur ${taxableInRaap/100}€)`);
    } else {
      trace.push(`RAAP : Non applicable (Revenu < ${ruleset.raapThresholdCents/100}€)`);
    }

    // 4. Income Tax (IR)
    const taxableIncome = Math.max(0, netProfit - socialChargesAnnual - retirementChargesAnnual);
    trace.push(`Revenu imposable après cotisations : ${taxableIncome/100}€`);
    const incomeTaxEstimateAnnual = this.applyIncomeTaxBrackets(taxableIncome, context, trace);

    return {
      socialChargesAnnual,
      retirementChargesAnnual,
      incomeTaxEstimateAnnual,
      auditTrace: trace,
    };
  }

  static calculateVat(annualProjection: MoneyCents, ruleset: Ruleset, userProfile?: UserProfile): MoneyCents {
    const collectedVat = applyRate(annualProjection, 2000); // 20%
    // Deductible is simplified for now: 20% of professional expenses
    const expenseRate = userProfile?.professionalExpensesRatio ?? ruleset.defaultBncExpenseRateBps;
    const professionalExpenses = applyRate(annualProjection, expenseRate);
    const deductibleVat = applyRate(professionalExpenses, 2000); // 20% of expenses are deductible
    
    return Math.max(0, collectedVat - deductibleVat);
  }

  static execute(annualProjection: MoneyCents, context: FiscalContext): FiscalBurdenResult {
    const { userProfile, ruleset } = context;
    
    // 1. Threshold Detection for Micro-BNC
    if (userProfile.fiscalStatus === 'micro' && annualProjection > ruleset.microThresholdServicesCents) {
      // Automatic Switch or Severe Warning logic
      // For alpha, we switch to BNC logic but keep the trace indicating the breach
      const result = this.calculateBncEngine(annualProjection, context);
      result.auditTrace?.unshift(`⚠️ SEUIL MICRO DÉPASSÉ (${annualProjection/100}€ > ${ruleset.microThresholdServicesCents/100}€). Bascule automatique en régime Réel (BNC).`);
      return result;
    }

    switch (userProfile.fiscalStatus) {
      case 'micro': return this.calculateMicroEngine(annualProjection, context);
      case 'bnc': return this.calculateBncEngine(annualProjection, context);
      case 'artiste': return this.calculateArtistEngine(annualProjection, context);
    }
  }
}
