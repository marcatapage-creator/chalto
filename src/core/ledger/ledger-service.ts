import { LedgerEntry, LedgerEntryType } from '../../models/context';
import { UserProfile } from '../../models/user';
import { MoneyCents } from '../../models/monetary';

export class LedgerService {
  private entries: LedgerEntry[] = [];

  constructor(initialEntries: LedgerEntry[] = []) {
    this.entries = [...initialEntries];
  }

  /**
   * Initializes the ledger with a synthetic entry if revenueYTDCents exists and ledger is empty.
   * This ensures idempotence.
   */
  static initialize(userProfile: UserProfile, currentLedger: LedgerEntry[]): LedgerEntry[] {
    if (userProfile.revenueYTDCents > 0 && currentLedger.length === 0) {
      const syntheticEntry: LedgerEntry = {
        id: 'onboarding_seed_revenue',
        effectiveDate: new Date(), // Today
        type: 'income',
        amountCents: userProfile.revenueYTDCents,
        category: 'revenue',
        source: 'onboarding_seed',
        immutable: true,
      };
      return [syntheticEntry];
    }
    return currentLedger;
  }

  getEntries(): LedgerEntry[] {
    return this.entries;
  }

  getTotalsByType(type: LedgerEntryType): MoneyCents {
    return this.entries
      .filter((e) => e.type === type)
      .reduce((sum, e) => sum + e.amountCents, 0);
  }
}
