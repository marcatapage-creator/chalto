import { describe, it, expect } from 'vitest';
import { FiscalCalculationEngine } from '../core/fiscal/fiscal-engine';
import { FiscalContextBuilder } from '../core/context/fiscal-context-builder';
import { UserProfile, USER_PROFILE_DEFAULTS } from '../models/user';
import { Ruleset } from '../models/ruleset';
import ruleset2026 from '../rulesets/ruleset_2026.json';

describe('Fiscal Edge Cases & Robustness', () => {
  const baseProfile: UserProfile = {
    ...USER_PROFILE_DEFAULTS as UserProfile,
    fiscalStatus: 'micro',
    activityType: 'services',
    revenueYTDCents: 0,
    treasuryCurrentCents: 0,
    monthsElapsed: 0,
    incomePattern: 'stable',
  };

  const context = FiscalContextBuilder.build(baseProfile, ruleset2026 as unknown as Ruleset);

  it('handles 0 income without negative charges', () => {
    const result = FiscalCalculationEngine.execute(0, context);
    expect(result.socialChargesAnnual).toBe(0);
    expect(result.incomeTaxEstimateAnnual).toBe(0);
    expect(result.socialChargesAnnual).not.toBeLessThan(0);
  });

  it('triggers Micro-BNC threshold breach and switches to BNC engine', () => {
    // Threshold is 77,700€
    const highIncome = 10000000; // 100k€
    const result = FiscalCalculationEngine.execute(highIncome, context);
    
    // Should have warning in trace
    expect(result.auditTrace?.[0]).toContain('⚠️ SEUIL MICRO DÉPASSÉ');
    // Result should match BNC calculation (34% expenses, then 22% social charges on 66k)
    // Assiette = 66k. Social = 66k * 22% = 14,520€ -> 1,452,000 cents
    expect(result.socialChargesAnnual).toBe(1452000);
  });

  it('correctly calculates progressive tax when jumping from 11% to 30% bracket', () => {
    // 1 part. 11% bracket ends at 28,797€. 30% bucket follows.
    // Let's test with 40,000€ taxable income.
    // 0 to 11,294 : 0
    // 11,294 to 28,797 : (28,797 - 11,294) * 11% = 17,503 * 11% = 1,925.33
    // 28,797 to 40,000 : (40,000 - 28,797) * 30% = 11,203 * 30% = 3,360.90
    // Total = 1,925.33 + 3,360.90 = 5,286.23 € -> 528,623 cents
    
    // We use BNC profile to control taxableIncome precisely
    const bncProfile = { ...baseProfile, fiscalStatus: 'bnc' as const };
    const bncContext = FiscalContextBuilder.build(bncProfile, ruleset2026 as unknown as Ruleset);
    
    // annualProjection=60606€ -> after 34% expenses -> ~40,000€ taxable
    const result = FiscalCalculationEngine.applyIncomeTaxBrackets(4000000, bncContext);
    expect(result).toBeCloseTo(528623, -1); // Allow small rounding diff
  });

  it('prevents incorrect accumulation of ACRE and Versement Libératoire', () => {
    // ACRE reduces social charges, VL is a flat income tax. They are independent but shouldn't break each other.
    const hybridProfile = { ...baseProfile, hasACRE: true, hasVersementLiberatoire: true };
    const ctx = FiscalContextBuilder.build(hybridProfile, ruleset2026 as unknown as Ruleset);
    
    const result = FiscalCalculationEngine.execute(5000000, ctx);
    // Social reduced by 50%
    expect(result.socialChargesAnnual).toBe(527500); 
    // Income tax is flat 1.7%
    expect(result.incomeTaxEstimateAnnual).toBe(85000);
  });

  it('is sensitive to 0.5 additional parts (joint custody)', () => {
    const singleChildHalfPart = { ...baseProfile, isMarried: false, numberOfChildren: 1, taxHouseholdParts: 1.5 };
    const ctx = FiscalContextBuilder.build(singleChildHalfPart, ruleset2026 as unknown as Ruleset);
    
    const result = FiscalCalculationEngine.applyIncomeTaxBrackets(5000000, ctx);
    // Compared to 1 part (50k€ taxable):
    const ctx1 = FiscalContextBuilder.build(baseProfile, ruleset2026 as unknown as Ruleset);
    const result1 = FiscalCalculationEngine.applyIncomeTaxBrackets(5000000, ctx1);
    
    expect(result).toBeLessThan(result1);
  });
});
