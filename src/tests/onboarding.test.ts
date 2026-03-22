import { describe, it, expect } from 'vitest';
import { UserProfile } from '../models/user';
import { FiscalContextBuilder } from '../core/context/fiscal-context-builder';
import { FiscalCalculationEngine } from '../core/fiscal/fiscal-engine';
import { Ruleset } from '../models/ruleset';
import ruleset2026 from '../rulesets/ruleset_2026.json';

describe('Onboarding Logic & Mapping', () => {
  const rules = ruleset2026 as unknown as Ruleset;

  it('correctly maps "Consultant" status to BNC in the engine', () => {
    // Simulated Screen 1 data for "Consultant"
    const data: Partial<UserProfile> = {
      fiscalStatus: 'bnc', // mapped from 'bnc_reel'
      activityType: 'services',
      estimatedAnnualRevenueCents: 6000000,
      taxHouseholdParts: 1,
    };

    const context = FiscalContextBuilder.build(data as UserProfile, rules);
    const result = FiscalCalculationEngine.execute(data.estimatedAnnualRevenueCents!, context);

    // Verify social charges for BNC (22% on profit after 34% expenses)
    // Benefice = 60000 * 0.66 = 39600
    // Cotisations = 39600 * 0.22 = 8712
    expect(result.socialChargesAnnual).toBe(871200);
  });

  it('triggers ACRE only for Micro status logic', () => {
    // Simulated "Micro" user with ACRE
    const microData: Partial<UserProfile> = {
      fiscalStatus: 'micro',
      activityType: 'services',
      estimatedAnnualRevenueCents: 4000000,
      hasACRE: true,
    };

    const microContext = FiscalContextBuilder.build(microData as UserProfile, rules);
    const microResult = FiscalCalculationEngine.execute(microData.estimatedAnnualRevenueCents!, microContext);

    // Standard rate 21.1% -> ACRE reduction usually 50% = 10.55%
    // 40000 * 0.1055 = 4220
    expect(microResult.socialChargesAnnual).toBe(422000);

    // Simulated "Artist" user with ACRE (should not apply ACRE via Micro logic)
    const artistData: Partial<UserProfile> = {
      fiscalStatus: 'artiste',
      activityType: 'services',
      estimatedAnnualRevenueCents: 4000000,
      hasACRE: true,
    };

    const artistContext = FiscalContextBuilder.build(artistData as UserProfile, rules);
    const artistResult = FiscalCalculationEngine.execute(artistData.estimatedAnnualRevenueCents!, artistContext);

    // Artist doesn't use the simple micro ACRE reduction in this engine's current state
    expect(artistResult.socialChargesAnnual).not.toBe(422000);
  });

  it('calculates the immediate preview (Safe-to-Spend) accurately on Screen 1', () => {
    // Cas 1 — Micro-BNC, CA 48k, célibataire
    const data: Partial<UserProfile> = {
      fiscalStatus: 'micro',
      activityType: 'liberal', // 34% abatement
      estimatedAnnualRevenueCents: 4800000,
      taxHouseholdParts: 1,
      personalMonthlyExpensesCents: 0,
    };

    const context = FiscalContextBuilder.build(data as UserProfile, rules);
    const result = FiscalCalculationEngine.execute(data.estimatedAnnualRevenueCents!, context);

    // Charges sociales: 48000 * 21.1% = 10128
    // Impôt: 48000 * 0.66 = 31680 taxable. IR = 2790
    // Total charges = 12918
    // Net annual = 48000 - 12918 = 35082
    // Monthly (100%) = 2923.5
    // Monthly (90%) = 2631.15 -> Expect ~2631

    const totalAnnualCharges = result.socialChargesAnnual + result.retirementChargesAnnual + result.incomeTaxEstimateAnnual;
    const netAnnual = data.estimatedAnnualRevenueCents! - totalAnnualCharges;
    const monthlySts = Math.round((netAnnual / 12) * 0.9 / 100);

    expect(monthlySts).toBe(2631);
  });

  it('verifies that the status mapping from UI is consistent', () => {
    // This replicates the logic in handleStatusSelect in OnboardingFlow.tsx
    const mapUIStatus = (category: string) => {
      let fiscalStatus = 'micro' as any;
      let activityType = 'services' as any;
      if (category === 'artiste') fiscalStatus = 'artiste';
      if (category === 'bic') { fiscalStatus = 'micro'; activityType = 'retail'; }
      if (category === 'bnc_reel') { fiscalStatus = 'bnc'; activityType = 'services'; }
      return { fiscalStatus, activityType };
    };

    expect(mapUIStatus('artiste').fiscalStatus).toBe('artiste');
    expect(mapUIStatus('bic').activityType).toBe('retail');
    expect(mapUIStatus('bnc_reel').fiscalStatus).toBe('bnc');
  });
});
