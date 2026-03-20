import { MoneyCents, RateBps } from './monetary';

export interface TaxBracket {
  min: MoneyCents;
  max: MoneyCents | null;
  rateBps: RateBps;
}

export interface ProjectionParams {
  ewmaAlphaBps: RateBps;
  volatilityCapBps: RateBps;
  floorRatioBps: RateBps;
}

export interface Ruleset {
  year: number;

  // Social Rates
  microSocialRateBps: RateBps;
  bncSocialRateBps: RateBps;
  artistSocialRateBps: RateBps;
  artistAssietteIncreaseRateBps: RateBps;
  artistRetirementRateBps: RateBps; // Deprecated in favor of RAAP specific below
  
  // RAAP (IRCEC)
  raapThresholdCents: MoneyCents;
  raapReducedRateBps: RateBps;
  raapStandardRateBps: RateBps;
  raapCeilingCents: MoneyCents;

  // Benefits
  acreReductionRateBps: RateBps;

  // Micro-entrepreneur Abatements
  microAbatementRateServicesBps: RateBps;
  microAbatementRateSalesBps: RateBps;
  microAbatementRateLiberalBps: RateBps;

  // Micro-entrepreneur Flat Tax (Versement Libératoire)
  microFlatTaxRatesBps: {
    services: RateBps;
    sales: RateBps;
    liberal: RateBps;
  };

  // BNC
  defaultBncExpenseRateBps: RateBps;

  // Global
  incomeTaxBrackets: TaxBracket[];
  cfeEstimateCents: MoneyCents;
  tvaThresholdServicesCents: MoneyCents;

  // VAT Simplified Regime
  vatSimplifiedAdvanceJulyRateBps: RateBps;
  vatSimplifiedAdvanceDecRateBps: RateBps;

  familyQuotientCapCents: MoneyCents; // e.g. 1759€ per half-part

  // Engine Parameters
  projectionParams: ProjectionParams;
}
