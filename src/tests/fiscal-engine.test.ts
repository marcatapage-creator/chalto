import { describe, it, expect } from 'vitest';
import { FiscalCalculationEngine } from '../core/fiscal/fiscal-engine';
import { FiscalContextBuilder } from '../core/context/fiscal-context-builder';
import { UserProfile, USER_PROFILE_DEFAULTS } from '../models/user';
import { Ruleset } from '../models/ruleset';
import ruleset2026 from '../rulesets/ruleset_2026.json';

describe('FiscalCalculationEngine', () => {
  const mockProfile: UserProfile = {
    ...USER_PROFILE_DEFAULTS as UserProfile,
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
    const result = FiscalCalculationEngine.calculateMicroEngine(10000000, context);
    expect(result.incomeTaxEstimateAnnual).toBeGreaterThan(800000);
    expect(result.incomeTaxEstimateAnnual).toBeLessThan(850000);
  });

  describe('Artiste-Auteur & RAAP', () => {
    const artistProfile: UserProfile = {
      ...mockProfile,
      fiscalStatus: 'artiste',
      vatStatus: true,
    };
    const artistContext = FiscalContextBuilder.build(artistProfile, ruleset2026 as unknown as Ruleset);

    it('applies +15% increase to URSSAF assiette for artists', () => {
      // Revenue 100k -> Expenses (34%) -> 66k Profit
      // Assiette = 66k * 1.15 = 75.9k
      // Social Charges (16%) of 75.9k = 12,144 € -> 1,214,400 cents
      const result = FiscalCalculationEngine.calculateArtistEngine(10000000, artistContext);
      expect(result.socialChargesAnnual).toBe(1214400);
    });

    it('triggers RAAP above threshold and respects ceiling', () => {
      // Case R1: Below threshold (9120€)
      // Rev 10k -> Profit 6.6k -> Assiette 7.59k. Below 9.12k threshold.
      const lowResult = FiscalCalculationEngine.calculateArtistEngine(1000000, artistContext);
      expect(lowResult.retirementChargesAnnual).toBe(0);

      // Case R3: High income (ceiling 160k)
      // Rev 200k -> Profit 132k -> Assiette 151.8k. Below ceil but tests logic.
      const highResult = FiscalCalculationEngine.calculateArtistEngine(20000000, artistContext);
      // 151.8k * 8% = 12,144 €
      expect(highResult.retirementChargesAnnual).toBe(1214400);
    });

    it('calculates VAT correctly', () => {
      // 100k Rev -> 20k Collected
      // Expenses 34k -> 6.8k Deductible (assuming 20% deductible rate)
      // Net = 13.2k -> 1,320,000 cents
      const result = FiscalCalculationEngine.calculateVat(10000000, artistContext.ruleset);
      expect(result).toBe(1320000);
    });
  });
});
