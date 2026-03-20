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

export type LedgerEntryType = 'income' | 'expense' | 'tax_payment' | 'social_payment';

export interface LedgerEntry {
  id: string;
  effectiveDate: Date;
  type: LedgerEntryType;
  amountCents: MoneyCents;
  category: string;
  source: string;
  immutable: boolean;
}
