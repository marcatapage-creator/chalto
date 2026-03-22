import { UserProfile, IncomePattern } from './user';
import { Ruleset } from './ruleset';
import { MoneyCents } from './monetary';

export interface NormalizedValues {
  revenueYTD: MoneyCents;
  monthsElapsed: number;
  incomePattern: IncomePattern;
  taxHouseholdParts: number;
}

export interface FiscalContext {
  userProfile: UserProfile;
  ruleset: Ruleset;
  normalizedValues: NormalizedValues;
}

export type LedgerEntryType = 
  | 'revenue' 
  | 'business_expense' 
  | 'personal_expense' 
  | 'personal_drawing' 
  | 'tax_payment' 
  | 'social_contribution' 
  | 'vat' 
  | 'treasury_adjustment';

export type LedgerEntryOrigin = 'forecast' | 'user' | 'system';
export type LedgerEntryStatus = 'planned' | 'realized' | 'cancelled';

export interface LedgerEntry {
  id: string;
  effectiveDate: Date;
  type: LedgerEntryType;
  amountCents: MoneyCents;
  category: string;
  source: string;
  immutable: boolean;
  
  /** Metadata for "Ma Réalité" */
  origin: LedgerEntryOrigin;
  status: LedgerEntryStatus;
  /** YYYY-MM for grouping */
  monthKey: string;
  /** Link to original budget line if realized/split */
  sourceForecastId?: string;
  /** Derived helper: strictly origin === 'forecast' && status === 'planned' */
  isForecast: boolean;

  vatCents?: MoneyCents;
  isTtc?: boolean;
}
