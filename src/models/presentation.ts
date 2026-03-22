import { MoneyCents, RateBps } from './monetary';
import { ProjectionConfidence } from './projection';
import { RiskLevelValue } from './simulation';
import { TrustReport } from '../core/engine/trust-engine';

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
  
  trustReport: TrustReport;
  confidenceScore: number;
  modelingMatrix: {
    tva: string;
    urssaf: string;
    ircec: string;
    ir: string;
  };

  /** Anomaly detection and precision alerts */
  anomalies: import('../core/engine/trust-engine').Anomaly[];
  showPrecisionAlert: boolean;

  /** Natural language insights from Pedagogy Engine */
  headline: string;
  explanation: string;
  professionalExpenseNote?: string;
  thresholdAlert?: {
    level: 'warning' | 'danger';
    message: string;
  };
}
