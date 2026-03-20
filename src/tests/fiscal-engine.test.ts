import { describe, it, expect } from 'vitest';
import { FiscalCalculationEngine } from '../core/fiscal/fiscal-engine';
import { FiscalContextBuilder } from '../core/context/fiscal-context-builder';
import { UserProfile } from '../models/user';
import { Ruleset } from '../models/ruleset';
import ruleset2026 from '../rulesets/ruleset_2026.json';

describe('FiscalCalculationEngine', () => {
  const mockProfile: UserProfile = {
    fiscalStatus: 'micro',
    activityType: 'services',
    vatStatus: false,
    treasuryCurrentCents: 1000000,
    revenueYTDCents: 2000000,
    monthsElapsed: 6,
    incomePattern: 'stable',
    hasACRE: false,
    hasVersementLiberatoire: false,
    taxHouseholdParts: 1,
    safetyMarginBps: 9000,
  };

  const context = FiscalContextBuilder.build(mockProfile, ruleset2026 as unknown as Ruleset);

  it('calculates micro social charges correctly', () => {
    const projection = 5000000; // 50k €
    const result = FiscalCalculationEngine.calculateMicroEngine(projection, context);
    // 5000000 * 2110 / 10000 = 1055000
    expect(result.socialChargesAnnual).toBe(1055000);
  });

  it('applies ACRE reduction correctly', () => {
    const result = FiscalCalculationEngine.calculateMicroEngine(5000000, {
      ...context,
      userProfile: { ...mockProfile, hasACRE: true }
    });
    // Rate 2110 -> ACRE (50%) -> 1055 Bps
    // 5000000 * 1055 / 10000 = 527500
    expect(result.socialChargesAnnual).toBe(527500);
  });

  it('applies Versement Liberatoire correctly', () => {
    const result = FiscalCalculationEngine.calculateMicroEngine(5000000, {
      ...context,
      userProfile: { ...mockProfile, hasVersementLiberatoire: true }
    });
    // Rate for services: 170 Bps
    // 5000000 * 170 / 10000 = 85000
    expect(result.incomeTaxEstimateAnnual).toBe(85000);
  });

  it('calculates progressive income tax correctly', () => {
    // 100k€ revenue -> 50k€ taxable after 50% abatement
    // Brackets: 0% up to 11294, 11% up to 28797, 30% above
    // (28797 - 11294) * 0.11 = 17503 * 0.11 = 1925.33 -> 192533
    // (50000 - 28797) * 0.30 = 21203 * 0.30 = 6360.90 -> 636090
    // Total: 192533 + 636090 = 828623
    const result = FiscalCalculationEngine.calculateMicroEngine(10000000, context);
    expect(result.incomeTaxEstimateAnnual).toBeGreaterThan(800000);
    expect(result.incomeTaxEstimateAnnual).toBeLessThan(850000);
  });
});
