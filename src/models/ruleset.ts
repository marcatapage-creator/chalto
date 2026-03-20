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
  artistRetirementRateBps: RateBps;

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

  // Engine Parameters
  projectionParams: ProjectionParams;
}
