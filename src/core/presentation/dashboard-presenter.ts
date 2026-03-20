import { DashboardState, DashboardLayoutType } from '../../models/presentation';
import { FiscalContext } from '../../models/context';
import { SimulationResult } from '../../models/simulation';
import { ProjectionResult } from '../../models/projection';
import { FiscalBurdenResult } from '../fiscal/fiscal-engine';
import { FiscalCalculationEngine } from '../fiscal/fiscal-engine';
import { PedagogyEngine } from './pedagogy-engine';
import { MoneyCents } from '../../models/monetary';

export class DashboardPresenter {
  static present(
    context: FiscalContext,
    projection: ProjectionResult,
    burden: FiscalBurdenResult,
    simulation: SimulationResult
  ): DashboardState {
    const { userProfile, ruleset } = context;

    // 1. VAT Calculation
    const vatBurdenCents = context.userProfile.vatStatus 
      ? FiscalCalculationEngine.calculateVat(projection.annualProjectionCents || 0, ruleset)
      : 0;

    // 2. Determine Layout
    let dashboardLayoutType: DashboardLayoutType = 'cashflow';
    if (context.normalizedValues.monthsElapsed === 0) {
      dashboardLayoutType = 'education';
    } else if (userProfile.incomePattern === 'stable') {
      dashboardLayoutType = 'projection';
    }

    // 3. Aggregate Results
    const annualFiscalBurden = burden.socialChargesAnnual + 
                              burden.retirementChargesAnnual + 
                              burden.incomeTaxEstimateAnnual + 
                              ruleset.cfeEstimateCents +
                              vatBurdenCents;

    // Estimated Net Income
    const annualProjection = projection.annualProjectionCents || 0;
    const estimatedNetIncomeCents = annualProjection - annualFiscalBurden;


    // 4. Next Payment Early Detection
    const nextPayment = simulation.timeline
      .filter(e => e.label !== 'Solde Projeté' && e.amountCents > 0)
      .sort((a, b) => a.date.getTime() - b.date.getTime())[0];

    // 5. 90 Days Fiscal Impact
    const horizon = new Date();
    horizon.setDate(horizon.getDate() + 90);
    const next90DaysLiabilityCents = simulation.timeline
      .filter(e => e.label !== 'Solde Projeté' && e.amountCents > 0 && e.date <= horizon)
      .reduce((sum, e) => sum + e.amountCents, 0);

    // 6. Natural Language Insights
    const headline = PedagogyEngine.generateHeadline(simulation.safeToSpendCents, simulation.risk.level, userProfile.safetyMode);
    const explanation = PedagogyEngine.generateExplanation(simulation, userProfile.safetyMode);

    return {
      safeToSpendCents: simulation.safeToSpendCents,
      remainingFiscalLiabilityCents: annualFiscalBurden - context.userProfile.revenueYTDCents,
      
      nextPaymentDate: nextPayment ? nextPayment.date : null,
      nextPaymentAmount: nextPayment ? nextPayment.amountCents : 0,
      
      next90DaysLiabilityCents,
      
      annualProjectionCents: projection.annualProjectionCents,
      annualFiscalBurdenCents: annualFiscalBurden,
      projectionLowCents: projection.projectionLowCents,
      projectionHighCents: projection.projectionHighCents,
      
      estimatedNetIncomeCents: (projection.annualProjectionCents || 0) - annualFiscalBurden,
      
      projectionConfidence: projection.confidence,
      dashboardLayoutType,
      
      vatWarning: projection.vatWarning,
      riskLevel: simulation.risk.level,
      
      confidenceScore: simulation.confidenceScore,
      modelingMatrix: simulation.modelingMatrix,
      
      headline,
      explanation,
    };
  }
}
