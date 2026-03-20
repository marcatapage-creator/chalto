import { describe, it, expect } from 'vitest';
import { RevenueProjectionEngine } from '../core/projection/projection-engine';
import { FiscalContextBuilder } from '../core/context/fiscal-context-builder';
import { UserProfile } from '../models/user';
import { Ruleset } from '../models/ruleset';
import ruleset2026 from '../rulesets/ruleset_2026.json';

describe('RevenueProjectionEngine', () => {
  const baseProfile: UserProfile = {
    fiscalStatus: 'micro',
    activityType: 'services',
    vatStatus: false,
    treasuryCurrentCents: 1000000,
    revenueYTDCents: 3000000, // 30k€ YTD
    monthsElapsed: 6,         // 6 months
    incomePattern: 'stable',
    hasACRE: false,
    hasVersementLiberatoire: false,
    taxHouseholdParts: 1,
    safetyMarginBps: 9000,
  };

  const context = FiscalContextBuilder.build(baseProfile, ruleset2026 as unknown as Ruleset);

  it('performs linear projection for stable income pattern', () => {
    const result = RevenueProjectionEngine.execute(context);
    // (3000000 / 6) * 12 = 6,000,000 (60k€)
    expect(result.annualProjectionCents).toBe(6000000);
    expect(result.confidence).toBe('MEDIUM'); // Cap at MEDIUM because no revenueLastYear
  });

  it('calculates volatility bands for variable income pattern', () => {
    const variableContext = FiscalContextBuilder.build({
      ...baseProfile,
      incomePattern: 'variable'
    }, ruleset2026 as unknown as Ruleset);
    
    // Monthly revenue: 4k, 6k, 5k, 5k, 4k, 6k -> Sum 30k, Mean 5k
    const monthlyRevenue = [400000, 600000, 500000, 500000, 400000, 600000];
    const result = RevenueProjectionEngine.execute(variableContext, monthlyRevenue);
    
    expect(result.projectionLowCents).toBeLessThan(result.annualProjectionCents!);
    expect(result.projectionHighCents).toBeGreaterThan(result.annualProjectionCents!);
    expect(result.vatWarning).toBe(true); // 60k > 39k threshold
  });

  it('performs EWMA projection for irregular income pattern', () => {
    const irregularContext = FiscalContextBuilder.build({
      ...baseProfile,
      incomePattern: 'irregular'
    }, ruleset2026 as unknown as Ruleset);

    // Recent drop in revenue: 10k, 10k, 2k, 2k, 2k
    const monthlyRevenue = [1000000, 1000000, 200000, 200000, 200000];
    const result = RevenueProjectionEngine.execute(irregularContext, monthlyRevenue);
    
    // EWMA with high alpha should weight recent 2k months much more
    // (2000 * 12) = 24k. The projection should be closer to 24k than to the YTD linear 60k.
    expect(result.annualProjectionCents).toBeLessThan(4000000); 
  });
});
