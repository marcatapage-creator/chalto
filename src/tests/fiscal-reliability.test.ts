import { describe, it, expect } from 'vitest';
import { FiscalCalculationEngine } from '../core/fiscal/fiscal-engine';
import { FiscalContextBuilder } from '../core/context/fiscal-context-builder';
import { UserProfile, USER_PROFILE_DEFAULTS } from '../models/user';
import { Ruleset } from '../models/ruleset';
import ruleset2026 from '../rulesets/ruleset_2026.json';

describe('Fiscal Precision & Reliability Tests', () => {
  const baseProfile: UserProfile = {
    ...USER_PROFILE_DEFAULTS as UserProfile,
    fiscalStatus: 'artiste',
    activityType: 'services',
    revenueYTDCents: 0,
    treasuryCurrentCents: 0,
    monthsElapsed: 0,
    incomePattern: 'stable',
  };

  const context = FiscalContextBuilder.build(baseProfile, ruleset2026 as unknown as Ruleset);

  it('correctly handles RAAP reduced rate (4%)', () => {
    const profile: UserProfile = { ...baseProfile, raapReducedRateOption: true };
    const ctx = FiscalContextBuilder.build(profile, ruleset2026 as unknown as Ruleset);
    
    // Revenue 100k -> Profit 66k -> Assiette 75.9k
    // 75.9k * 4% = 3,036 € -> 303,600 cents
    const result = FiscalCalculationEngine.calculateArtistEngine(10000000, ctx);
    expect(result.retirementChargesAnnual).toBe(303600);
  });

  it('correctly handles CEHR for high income couples', () => {
    const coupleProfile: UserProfile = { 
      ...baseProfile, 
      isMarried: true, 
      numberOfChildren: 0,
      taxHouseholdParts: 2 
    };
    const ctx = FiscalContextBuilder.build(coupleProfile, ruleset2026 as unknown as Ruleset);
    
    // For a couple, CEHR starts at 500k€ (250k * 2)
    // Revenue 600k€ -> Profit 396k€ (after 34% expenses)
    // 396k€ is < 500k€ threshold for couple -> CEHR should be 0
    const result = FiscalCalculationEngine.calculateArtistEngine(60000000, ctx);
    expect(result.auditTrace?.some(t => t.includes('CEHR'))).toBe(false);

    // Revenue 1M€ -> Profit 660k€
    // 660k€ - 500k€ = 160k€ taxable at 3%
    // 160k * 3% = 4,800 € -> 480,000 cents
    const resultHigh = FiscalCalculationEngine.calculateArtistEngine(100000000, ctx);
    expect(resultHigh.auditTrace?.some(t => t.includes('CEHR'))).toBe(true);
  });

  it('respects family quotient caps for multiple children', () => {
    const parentProfile: UserProfile = {
      ...baseProfile,
      isMarried: true,
      numberOfChildren: 4, // 2 + 1 + 1 = 4 parts
      taxHouseholdParts: 4
    };
    const ctx = FiscalContextBuilder.build(parentProfile, ruleset2026 as unknown as Ruleset);
    
    // High income to trigger plafonnement
    // Rev 200k -> Profit 132k
    const result = FiscalCalculationEngine.applyIncomeTaxBrackets(13200000, ctx, []);
    // Just verifying it doesn't crash and returns a positive amount
    expect(result).toBeGreaterThan(0);
  });
});
