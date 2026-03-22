import { MoneyCents, RateBps } from './monetary';
import { FreelancerStatus } from './fiscal';

export type ActivityType = 'services' | 'sales' | 'liberal';
export type IncomePattern = 'stable' | 'variable' | 'irregular';
export type IncomeEstimationMethod = 'known' | 'estimate' | 'last_year';
export type ConfidenceLevel = 'estimated' | 'semi-precise' | 'exact';

export interface UserProfile {
  fiscalStatus: FreelancerStatus;
  activityType: ActivityType;
  vatStatus: boolean;
  firstName?: string;
  lastName?: string;

  /** Current available liquidities in cents */
  treasuryCurrentCents: MoneyCents;
  /** Revenue already cashed in this fiscal year (actuals) */
  revenueYTDCents: MoneyCents;
  /** Estimated annual revenue provided during onboarding */
  estimatedAnnualRevenueCents?: MoneyCents;
  /** Number of months elapsed in the current fiscal year (0 to 12) */
  monthsElapsed: number;

  incomePattern: IncomePattern;
  incomeEstimationMethod?: IncomeEstimationMethod;
  /** Optional: Revenue from the previous fiscal year */
  revenueLastYearCents?: MoneyCents;

  /** Monthly personal expenses (burn rate) in cents */
  personalMonthlyExpensesCents: MoneyCents;
  /** Professional expenses ratio in basis points (optional refinement) */
  professionalExpensesRatio?: RateBps;

  hasACRE: boolean;
  hasVersementLiberatoire: boolean;

  /** Household Info */
  isMarried: boolean;
  numberOfChildren: number;

  /** TVA Info */
  vatRegime: 'simplifié' | 'normal' | 'none';
  priorYearVatDueCents: MoneyCents;

  /** IRCEC/RAAP */
  raapReducedRateOption: boolean;

  /** Simulation Safety Mode */
  safetyMode: 'conservative' | 'forecast';

  /** Number of parts in the tax household (can be derived) */
  taxHouseholdParts: number;
  /** Safety margin for safe-to-spend calculation (default: 9000 Bps aka 90%) */
  safetyMarginBps: RateBps;
  /** Confidence levels for inputs */
  confidence: {
    revenue: ConfidenceLevel;
    expenses: ConfidenceLevel;
    treasury: ConfidenceLevel;
  };
}

export const USER_PROFILE_DEFAULTS: Partial<UserProfile> = {
  taxHouseholdParts: 1,
  safetyMarginBps: 9000,
  isMarried: false,
  numberOfChildren: 0,
  treasuryCurrentCents: 0,
  revenueYTDCents: 0,
  monthsElapsed: 0,
  personalMonthlyExpensesCents: 0, // No default
  vatRegime: 'none',
  priorYearVatDueCents: 0,
  raapReducedRateOption: false,
  safetyMode: 'conservative',
  confidence: {
    revenue: 'estimated',
    expenses: 'estimated',
    treasury: 'exact',
  },
};
