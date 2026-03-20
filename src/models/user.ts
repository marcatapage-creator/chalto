import { MoneyCents, RateBps } from './monetary';
import { FreelancerStatus } from './fiscal';

export type ActivityType = 'services' | 'sales' | 'liberal';
export type IncomePattern = 'stable' | 'variable' | 'irregular';

export interface UserProfile {
  fiscalStatus: FreelancerStatus;
  activityType: ActivityType;
  vatStatus: boolean;

  /** Current available liquidities in cents */
  treasuryCurrentCents: MoneyCents;
  /** Revenue already cashed in this fiscal year */
  revenueYTDCents: MoneyCents;
  /** Number of months elapsed in the current fiscal year (0 to 12) */
  monthsElapsed: number;

  incomePattern: IncomePattern;
  /** Optional: Revenue from the previous fiscal year */
  revenueLastYearCents?: MoneyCents;

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
}

export const USER_PROFILE_DEFAULTS: Partial<UserProfile> = {
  taxHouseholdParts: 1,
  safetyMarginBps: 9000,
  isMarried: false,
  numberOfChildren: 0,
  vatRegime: 'none',
  priorYearVatDueCents: 0,
  raapReducedRateOption: false,
  safetyMode: 'conservative',
};
