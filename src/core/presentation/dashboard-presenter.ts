import { DashboardState, DashboardLayoutType } from '../../models/presentation';
import { FiscalContext } from '../../models/context';
import { SimulationResult } from '../../models/simulation';
import { ProjectionResult } from '../../models/projection';
import { FiscalBurdenResult } from '../fiscal/fiscal-engine';
import { PedagogyEngine } from './pedagogy-engine';
import { MoneyCents } from '../../models/monetary';

export class DashboardPresenter {
  static present(
    context: FiscalContext,
    projection: ProjectionResult,
    burden: FiscalBurdenResult,
    simulation: SimulationResult
  ): DashboardState {
    const { userProfile } = context;

    // 1. Determine Layout
    let dashboardLayoutType: DashboardLayoutType = 'cashflow';
    if (userProfile.monthsElapsed === 0) {
      dashboardLayoutType = 'education';
    } else if (userProfile.incomePattern === 'stable') {
      dashboardLayoutType = 'projection';
    }

    // 2. Aggregate Results
    const annualFiscalBurden = burden.socialChargesAnnual + 
                              burden.retirementChargesAnnual + 
                              burden.incomeTaxEstimateAnnual + 
                              context.ruleset.cfeEstimateCents;

    // Estimated Net Income
    const annualProjection = projection.annualProjectionCents || 0;
    const estimatedNetIncomeCents = annualProjection - annualFiscalBurden;

    // Next Payment
    const futureLiabilities = simulation.timeline.filter(e => e.type === 'liability' && e.date > new Date());
    const nextPayment = futureLiabilities[0] || null;

    // Next 90 Days
    const horizon = new Date();
    horizon.setDate(horizon.getDate() + 90);
    const next90DaysLiabilityCents = Math.abs(futureLiabilities
      .filter(l => l.date <= horizon)
      .reduce((s, l) => s + l.amountCents, 0));

    return {
      safeToSpendCents: simulation.safeToSpendCents,
      remainingFiscalLiabilityCents: annualFiscalBurden, // Simplified: should subtract already paid

      nextPaymentDate: nextPayment ? nextPayment.date : null,
      nextPaymentAmount: nextPayment ? Math.abs(nextPayment.amountCents) : 0,

      next90DaysLiabilityCents,

      annualProjectionCents: projection.annualProjectionCents,
      projectionLowCents: projection.projectionLowCents,
      projectionHighCents: projection.projectionHighCents,

      estimatedNetIncomeCents,

      projectionConfidence: projection.confidence,
      dashboardLayoutType,

      vatWarning: projection.vatWarning,
      riskLevel: simulation.risk.level,

      headline: PedagogyEngine.generateHeadline(simulation.safeToSpendCents, simulation.risk.level),
      explanation: PedagogyEngine.generateExplanation(simulation)
    };
  }
}
