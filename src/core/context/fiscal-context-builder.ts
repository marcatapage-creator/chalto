import { UserProfile } from '../../models/user';
import { Ruleset } from '../../models/ruleset';
import { FiscalContext, NormalizedValues } from '../../models/context';

export class FiscalContextBuilder {
  static build(userProfile: UserProfile, ruleset: Ruleset): FiscalContext {
    // 1. Derive Tax Household Parts
    let parts = userProfile.isMarried ? 2 : 1;
    if (userProfile.numberOfChildren > 0) {
      if (userProfile.numberOfChildren <= 2) {
        parts += userProfile.numberOfChildren * 0.5;
      } else {
        parts += 1 + (userProfile.numberOfChildren - 2); // 0.5 + 0.5 + 1 per extra
      }
    }

    const normalizedValues = {
      revenueYTD: userProfile.revenueYTDCents,
      monthsElapsed: userProfile.monthsElapsed,
      incomePattern: userProfile.incomePattern,
      taxHouseholdParts: parts,
    };

    return {
      userProfile,
      ruleset,
      normalizedValues,
    };
  }
}
