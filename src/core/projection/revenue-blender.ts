import { MoneyCents } from '../../models/monetary';
import { UserProfile } from '../../models/user';
import { ProjectionConfidence } from '../../models/projection';

export interface BlendingResult {
  blendedAnnualRevenueCents: MoneyCents;
  actualsYTDCents: MoneyCents;
  forecastRemainingCents: MoneyCents;
  confidenceScore: number; // 0 to 100
  confidenceLevel: ProjectionConfidence;
  dataSource: 'actuals' | 'blended' | 'forecast';
  deltaCents: MoneyCents; // Actuals YTD - Forecast YTD
}

export class RevenueBlender {
  /**
   * Blends actuals from ledger with user profile forecasts.
   * 
   * @param entries All ledger entries
   * @param userProfile User profile containing forecasts
   * @param currentDate Current date for YTD context
   * @returns BlendingResult
   */
  static blend(
    entries: any[],
    userProfile: UserProfile,
    currentDate: Date = new Date()
  ): BlendingResult {
    const currentMonth = currentDate.getMonth(); // 0-11
    const currentYear = currentDate.getFullYear();
    
    // 1. Calculate Actuals YTD (Realized)
    const actualsYTDCents = entries
      .filter(e => e.status === 'realized' && e.type === 'revenue')
      .reduce((sum, e) => sum + e.amountCents, 0);

    // 2. Calculate remaining projection
    // We iterate over the remaining months of the year
    const annualForecast = userProfile.estimatedAnnualRevenueCents || 0;
    const monthlyAverageForecast = Math.floor(annualForecast / 12);
    
    let forecastRemainingCents = 0;
    const monthsWithActuals = new Set(entries.filter(e => e.status === 'realized').map(e => e.monthKey)).size;
    
    // We look at each month from Jan to Dec
    for (let m = 0; m < 12; m++) {
      const monthKey = `${currentYear}-${(m + 1).toString().padStart(2, '0')}`;
      
      // If month is in the past/present and has actuals, we skip (already in actualsYTDCents)
      // If month is in the future OR has no actuals, we need a forecast
      const hasActualsInMonth = entries.some(e => e.monthKey === monthKey && e.status === 'realized' && e.type === 'revenue');
      
      if (!hasActualsInMonth) {
        // Find if user has a custom planned entry for this month
        const customPlanned = entries.find(e => e.monthKey === monthKey && e.status === 'planned' && e.type === 'revenue');
        
        if (customPlanned) {
          forecastRemainingCents += customPlanned.amountCents;
        } else if (m >= currentMonth) {
           // Fallback to average for future months without specific entry
           forecastRemainingCents += monthlyAverageForecast;
        }
      }
    }

    const blendedAnnualRevenueCents = actualsYTDCents + forecastRemainingCents;
    
    // Calculate Delta for confidence
    const expectedYTDCents = monthlyAverageForecast * Math.max(1, monthsWithActuals);
    const deltaCents = actualsYTDCents - expectedYTDCents;
    
    // Confidence calculation
    // More months of actuals = higher confidence
    const timeConfidence = Math.min(100, (monthsWithActuals / 12) * 100);
    // If delta is huge, maybe lower confidence in the future forecast?
    // For now, let's keep it simple.
    const baseConfidence = 70; // Onboarding confidence baseline
    const confidenceScore = Math.floor(baseConfidence + (timeConfidence * (100 - baseConfidence) / 100));

    let confidenceLevel: ProjectionConfidence = 'MEDIUM';
    if (confidenceScore < 30) confidenceLevel = 'NONE';
    else if (confidenceScore > 80) confidenceLevel = 'HIGH';

    let dataSource: 'actuals' | 'blended' | 'forecast' = 'blended';
    if (monthsWithActuals >= 12) dataSource = 'actuals';
    if (monthsWithActuals === 0) dataSource = 'forecast';

    return {
      blendedAnnualRevenueCents,
      actualsYTDCents,
      forecastRemainingCents,
      confidenceScore,
      confidenceLevel,
      dataSource,
      deltaCents,
    };
  }
}
