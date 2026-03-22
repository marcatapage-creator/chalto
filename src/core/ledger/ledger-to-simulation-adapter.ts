import { LedgerEntry } from '../../models/context';
import { Inflow } from '../engine/simulation-engine';
import { Liability } from '../../models/liability';

export class LedgerToSimulationAdapter {
  /**
   * Filters and adapts ledger entries for the simulation engine.
   * Logic: Realized > Planned; Cancelled ignored.
   */
  static adapt(entries: LedgerEntry[]): { inflows: Inflow[], liabilities: Liability[] } {
    const inflows: Inflow[] = [];
    const liabilities: Liability[] = [];

    // 1. Identify ledger overrides (both realized and manual planned)
    const ledgerOverrideIds = new Set(
      entries
        .filter(e => (e.status === 'realized' || e.origin === 'user') && e.sourceForecastId)
        .map(e => e.sourceForecastId)
    );

    // 2. Filter entries
    const activeEntries = entries.filter(e => {
      if (e.status === 'cancelled') return false;
      if (e.status === 'planned' && e.origin === 'forecast') {
        // Exclude automatic forecasts if they have been overridden
        return !ledgerOverrideIds.has(e.id);
      }
      return true; 
    });

    // 3. Map to Simulation Engine types
    activeEntries.forEach(e => {
      if (e.type === 'revenue') {
        inflows.push({
          id: e.id,
          date: e.effectiveDate,
          amountCents: e.amountCents,
          label: e.isForecast ? `[PRÉVU] ${e.category}` : e.category
        });
      } else if (e.type === 'business_expense' || e.type === 'personal_expense' || e.type === 'personal_drawing' || e.type === 'tax_payment' || e.type === 'social_contribution' || e.type === 'vat' || e.type === 'treasury_adjustment') {
        // Map everything else to liabilities (outflows)
        liabilities.push({
          id: e.id,
          date: e.effectiveDate,
          type: e.type as any, // Map to closest LiabilityType
          label: e.isForecast ? `[PRÉVU] ${e.category}` : e.category,
          amountCents: e.amountCents,
          isConfirmed: e.status === 'realized'
        });
      }
    });

    return { inflows, liabilities };
  }
}
