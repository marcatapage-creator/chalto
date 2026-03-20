import { FiscalContext } from '../../models/context';
import { MoneyCents, applyRate, RateBps } from '../../models/monetary';
import { ProjectionResult, ProjectionConfidence } from '../../models/projection';

export class RevenueProjectionEngine {
  static weightedAverage(A: number, B: number, wA: number, wB: number): number {
    return Math.floor((A * wA + B * wB) / (wA + wB));
  }

  static populationStandardDeviation(values: number[]): number {
    const N = values.length;
    if (N === 0) return 0;
    const mean = values.reduce((s, v) => s + v, 0) / N;
    const sqDiffs = values.map((v) => Math.pow(v - mean, 2));
    const variance = sqDiffs.reduce((s, v) => s + v, 0) / N;
    return Math.sqrt(variance);
  }

  static calculateConfidence(monthsElapsed: number, hasRevenueLastYear: boolean): ProjectionConfidence {
    if (monthsElapsed < 3) return 'NONE';
    if (monthsElapsed < 6) return 'MEDIUM';
    
    // Confidence is capped at MEDIUM if revenueLastYear is absent
    if (!hasRevenueLastYear) return 'MEDIUM';
    
    return 'HIGH';
  }

  static execute(context: FiscalContext, monthlyRevenue: MoneyCents[] = []): ProjectionResult {
    const { userProfile, ruleset, normalizedValues } = context;
    const { monthsElapsed, revenueYTD, incomePattern } = normalizedValues;
    const { revenueLastYearCents } = userProfile;
    const { projectionParams, tvaThresholdServicesCents } = ruleset;

    // Guard: monthsElapsed < 3
    if (monthsElapsed < 3) {
      return {
        annualProjectionCents: null,
        projectionLowCents: null,
        projectionHighCents: null,
        confidence: 'NONE',
        vatWarning: false,
      };
    }

    const confidence = this.calculateConfidence(monthsElapsed, !!revenueLastYearCents);
    let annualProjectionCents: MoneyCents | null = null;
    let projectionLowCents: MoneyCents | null = null;
    let projectionHighCents: MoneyCents | null = null;

    const projectionYTD = Math.floor((revenueYTD / monthsElapsed) * 12);

    if (incomePattern === 'stable') {
      if (revenueLastYearCents) {
        annualProjectionCents = this.weightedAverage(revenueLastYearCents, projectionYTD, 60, 40);
      } else {
        annualProjectionCents = projectionYTD;
      }
    } else if (incomePattern === 'variable') {
      const projectionExpected = revenueLastYearCents 
        ? this.weightedAverage(revenueLastYearCents, projectionYTD, 40, 60)
        : projectionYTD;
      
      const mean = revenueYTD / monthsElapsed;
      const sigma = this.populationStandardDeviation(monthlyRevenue);
      const volatilityRatioBps = mean === 0 ? 0 : Math.floor((sigma * 10000) / mean);
      const volatilityFactorBps = Math.min(projectionParams.volatilityCapBps, volatilityRatioBps);

      projectionLowCents = applyRate(projectionExpected, 10000 - volatilityFactorBps);
      projectionHighCents = applyRate(projectionExpected, 10000 + volatilityFactorBps);
      annualProjectionCents = projectionExpected;
    } else if (incomePattern === 'irregular') {
      // EWMA calculation
      let ewma = 0;
      if (monthlyRevenue.length > 0) {
        const alpha = projectionParams.ewmaAlphaBps / 10000;
        ewma = monthlyRevenue[0];
        for (let i = 1; i < monthlyRevenue.length; i++) {
          ewma = alpha * monthlyRevenue[i] + (1 - alpha) * ewma;
        }
      }

      if (ewma === 0) {
        annualProjectionCents = null;
      } else {
        const baseProjection = Math.floor(ewma * 12);
        const sigma = this.populationStandardDeviation(monthlyRevenue);
        const volatilityRatioBps = Math.floor((sigma * 10000) / ewma);
        const volatilityFactorBps = Math.min(projectionParams.volatilityCapBps, volatilityRatioBps);
        
        const projectionAdjusted = applyRate(baseProjection, 10000 - volatilityFactorBps);
        const floorProjection = applyRate(revenueYTD, projectionParams.floorRatioBps);
        
        const projectionExpected = Math.max(floorProjection, projectionAdjusted);
        projectionLowCents = applyRate(projectionExpected, 10000 - volatilityFactorBps);
        projectionHighCents = applyRate(projectionExpected, 10000 + volatilityFactorBps);
        annualProjectionCents = projectionExpected;
      }
    }

    const vatWarning = annualProjectionCents !== null && 
      (projectionHighCents || annualProjectionCents) > tvaThresholdServicesCents;

    return {
      annualProjectionCents,
      projectionLowCents,
      projectionHighCents,
      confidence,
      vatWarning,
    };
  }
}
