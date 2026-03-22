import { DashboardState, DashboardLayoutType } from '../../models/presentation';
import { FiscalContext } from '../../models/context';
import { SimulationResult } from '../../models/simulation';
import { ProjectionResult } from '../../models/projection';
import { FiscalBurdenResult, FiscalCalculationEngine } from '../fiscal/fiscal-engine';
import { PedagogyEngine } from './pedagogy-engine';
import { MoneyCents, applyRate } from '../../models/monetary';
import { TrustEngine, TrustReport } from '../engine/trust-engine';

export class DashboardPresenter {
  static present(
    context: FiscalContext,
    projection: ProjectionResult,
    burden: FiscalBurdenResult,
    simulation: SimulationResult,
    trustReport: TrustReport
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

    // 7. Apply User Safety Margin to Safe-to-Spend
    // safetyMarginBps (e.g. 9000 for 90%)
    const userSafeToSpendCents = applyRate(simulation.safeToSpendCents, userProfile.safetyMarginBps || 10000);

    // 8. Anomaly Detection
    const anomalies = TrustEngine.detectAnomalies(
      userProfile.revenueYTDCents,
      projection.annualProjectionCents || 0,
      context.normalizedValues.monthsElapsed,
      !!userProfile.incomeEstimationMethod
    );

    const isCritical = anomalies.some((a: any) => a.severity === 'critical');

    // 9. Extract Professional Expense Note from Audit Trace
    const professionalExpenseNote = burden.auditTrace?.find(t => t.startsWith('Note:'))?.replace('Note: ', '');

    // 10. Threshold Alert Logic
    let thresholdAlert: { level: 'warning' | 'danger', message: string } | undefined;
    const microThreshold = ruleset.microThresholdServicesCents;
    if (userProfile.fiscalStatus === 'micro' && projection.annualProjectionCents) {
      if (projection.annualProjectionCents > microThreshold) {
        thresholdAlert = {
          level: 'danger',
          message: `Seuil Micro-BNC dépassé (${microThreshold/10000}k€). Bascule automatique au régime réel pour la projection.`
        };
      } else if (projection.annualProjectionCents > microThreshold * 0.9) {
        thresholdAlert = {
          level: 'warning',
          message: `Attention : Proche du seuil Micro-BNC (${microThreshold/10000}k€).`
        };
      }
    }

    return {
      safeToSpendCents: isCritical ? null as any : userSafeToSpendCents,
      remainingFiscalLiabilityCents: Math.max(0, annualFiscalBurden - (context.normalizedValues.monthsElapsed > 0 ? context.userProfile.revenueYTDCents : 0)),
      
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
      
      trustReport,
      confidenceScore: simulation.confidenceScore,
      modelingMatrix: simulation.modelingMatrix,
      
      anomalies,
      showPrecisionAlert: trustReport.showPrecisionAlert,

      headline,
      explanation,
      professionalExpenseNote,
      thresholdAlert,
    };
  }
}
