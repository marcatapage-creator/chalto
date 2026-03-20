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

  /** Number of parts in the tax household (default: 1) */
  taxHouseholdParts: number;
  /** Safety margin for safe-to-spend calculation (default: 9000 Bps aka 90%) */
  safetyMarginBps: RateBps;
}

export const USER_PROFILE_DEFAULTS: Partial<UserProfile> = {
  taxHouseholdParts: 1,
  safetyMarginBps: 9000,
};
