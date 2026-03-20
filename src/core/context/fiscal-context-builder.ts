import { UserProfile } from '../../models/user';
import { Ruleset } from '../../models/ruleset';
import { FiscalContext, NormalizedValues } from '../../models/context';

export class FiscalContextBuilder {
  static build(userProfile: UserProfile, ruleset: Ruleset): FiscalContext {
    const normalizedValues: NormalizedValues = {
      revenueYTD: userProfile.revenueYTDCents,
      monthsElapsed: userProfile.monthsElapsed,
      incomePattern: userProfile.incomePattern,
    };

    return {
      userProfile,
      ruleset,
      normalizedValues,
    };
  }
}
