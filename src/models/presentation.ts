import { MoneyCents, RateBps } from './monetary';
import { ProjectionConfidence } from './projection';
import { RiskLevelValue } from './simulation';

export type DashboardLayoutType = 'projection' | 'cashflow' | 'education';

export interface DashboardState {
  safeToSpendCents: MoneyCents;
  remainingFiscalLiabilityCents: MoneyCents;

  nextPaymentDate: Date | null;
  nextPaymentAmount: MoneyCents;

  next90DaysLiabilityCents: MoneyCents;

  annualProjectionCents: MoneyCents | null;
  annualFiscalBurdenCents: MoneyCents;
  projectionLowCents: MoneyCents | null;
  projectionHighCents: MoneyCents | null;

  estimatedNetIncomeCents: MoneyCents;

  projectionConfidence: ProjectionConfidence;
  dashboardLayoutType: DashboardLayoutType;

  vatWarning: boolean;
  riskLevel: RiskLevelValue;
  
  confidenceScore: number;
  modelingMatrix: {
    tva: string;
    urssaf: string;
    ircec: string;
    ir: string;
  };

  /** Natural language insights from Pedagogy Engine */
  headline: string;
  explanation: string;
}
