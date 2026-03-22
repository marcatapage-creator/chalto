import { MoneyCents, RateBps } from '../../models/monetary';

export type ReliabilityLevel = 'low' | 'medium' | 'high';

export type AnomalyType =
  | "divergence_warning"   // moderate gap between real and projected
  | "divergence_critical"  // major gap between real and projected
  | "uncomputable"         // engine cannot produce a result
  | "bank_error";          // bank connection failed or missing data

export interface Anomaly {
  type: AnomalyType;
  message: string;
  action: string;
  severity: "warning" | "critical";
}

export interface TrustReport {
  score: number; // 0 to 100
  level: ReliabilityLevel;
  pessimistBufferBps: RateBps; // Additional margin to apply
  missingDataPoints: string[];
  showPrecisionAlert: boolean;
}

const ANOMALY_THRESHOLD_WARNING_LOW = 0.5;
const ANOMALY_THRESHOLD_WARNING_HIGH = 1.5;
const ANOMALY_THRESHOLD_CRITICAL_LOW = 0.2;
const ANOMALY_THRESHOLD_CRITICAL_HIGH = 3.0;

/**
 * TrustEngine
 * The heart of the Co-pilot's reliability model.
 * Translates data completeness and variance into actionable safety buffers.
 */
export class TrustEngine {
  static calculateReliability(
    realizedAnnualRevenueCents: MoneyCents,
    anticipatedAnnualRevenueCents: MoneyCents,
    monthsElapsed: number = 0,
    daysSinceOnboarding: number = 0,
    sessionsCount: number = 0
  ): TrustReport {
    if (anticipatedAnnualRevenueCents <= 0) {
      return { 
        score: 0, 
        level: 'low', 
        pessimistBufferBps: 1500,
        missingDataPoints: ['Anticipation annuelle non configurée'],
        showPrecisionAlert: false
      };
    }

    // Use expected YTD as baseline for score calculation
    // Minimum 1 month to avoid division by zero or infinite reliability at start
    const baselineMonths = Math.max(1, monthsElapsed);
    const expectedYTDCents = (anticipatedAnnualRevenueCents / 12) * baselineMonths;
    
    // Score reflects how well real earnings match the "ideal" path so far
    const ratio = realizedAnnualRevenueCents / expectedYTDCents;
    
    // For a brand new user (monthsElapsed == 0), we start with a baseline score
    // if they have anticipated revenue, representing onboarding trust.
    let score = monthsElapsed === 0 ? 50 : Math.min(100, Math.round(ratio * 100));
    
    let level: ReliabilityLevel = 'low';
    let pessimistBufferBps = 1500; 
    
    if (score > 80) {
      level = 'high';
      pessimistBufferBps = 0;
    } else if (score > 40) {
      level = 'medium';
      pessimistBufferBps = 500;
    }

    const missingDataPoints: string[] = [];
    if (score < 40) missingDataPoints.push('Revenus encaissés très inférieurs à la moyenne attendue');
    if (monthsElapsed === 0) missingDataPoints.push('En attente du premier mois de données réelles');

    // showPrecisionAlert logic
    const showPrecisionAlert = score < 60 && daysSinceOnboarding > 30 && sessionsCount > 3;

    return { score, level, pessimistBufferBps, missingDataPoints, showPrecisionAlert };
  }

  /**
   * detectAnomalies
   * Returns a list of technical or data inconsistencies that require user action.
   */
  static detectAnomalies(
    realizedRevenueCents: MoneyCents,
    projectedRevenueCents: MoneyCents,
    monthsElapsed: number = 0,
    hasEstimationMethod: boolean = false,
    bankConnectionLastSyncDays: number = 0
  ): Anomaly[] {
    const anomalies: Anomaly[] = [];

    // 1. Uncomputable (Critical)
    // We allow 0 months if we have an estimation method (onboarding fallback)
    if (monthsElapsed === 0 && !hasEstimationMethod) {
      anomalies.push({
        type: "uncomputable",
        message: "Données insuffisantes pour calculer. Saisis au moins un mois de revenus.",
        action: "Aller dans Ma Réalité",
        severity: "critical"
      });
      return anomalies;
    }

    // 2. Divergence (Real vs Projected)
    if (projectedRevenueCents > 0 && monthsElapsed > 0) {
      const expectedYTDCents = (projectedRevenueCents / 12) * monthsElapsed;
      const ratio = realizedRevenueCents / expectedYTDCents;
      
      if (ratio < ANOMALY_THRESHOLD_CRITICAL_LOW || ratio > ANOMALY_THRESHOLD_CRITICAL_HIGH) {
        anomalies.push({
          type: "divergence_critical",
          message: "Écart majeur détecté entre tes revenus réels et tes prévisions.",
          action: "Ajuster mon profil",
          severity: "critical"
        });
      } else if (ratio < ANOMALY_THRESHOLD_WARNING_LOW || ratio > ANOMALY_THRESHOLD_WARNING_HIGH) {
        anomalies.push({
          type: "divergence_warning",
          message: "Tes revenus réels s'éloignent de tes prévisions annuelles.",
          action: "Vérifier mes prévisions",
          severity: "warning"
        });
      }
    }

    // 3. Bank Error (Warning)
    if (bankConnectionLastSyncDays > 7) {
      anomalies.push({
        type: "bank_error",
        message: `Connexion bancaire interrompue. Les données affichées datent de ${bankConnectionLastSyncDays} jours.`,
        action: "Reconnecter ma banque",
        severity: "warning"
      });
    }

    return anomalies;
  }
}
