import { LedgerEntry, LedgerEntryType } from '../../models/context';
import { UserProfile } from '../../models/user';
import { MoneyCents } from '../../models/monetary';

export class LedgerService {
  private entries: LedgerEntry[] = [];

  constructor(initialEntries: LedgerEntry[] = []) {
    this.entries = [...initialEntries];
  }

  /**
   * Initializes the ledger with a full year of forecast budget lines.
   */
  static initialize(userProfile: UserProfile, currentLedger: LedgerEntry[]): LedgerEntry[] {
    if (currentLedger.length > 0) return currentLedger;

    const newEntries: LedgerEntry[] = [];
    const now = new Date();
    const currentYear = now.getFullYear();
    const annualRevenueCents = userProfile.estimatedAnnualRevenueCents || userProfile.revenueLastYearCents || 0;

    // Generate 12 months of forecasts
    for (let month = 0; month < 12; month++) {
      const date = new Date(currentYear, month, 15); // Mid-month for entries
      const monthKey = `${currentYear}-${(month + 1).toString().padStart(2, '0')}`;

      // 1. Revenue Forecast
      if (annualRevenueCents > 0) {
        const monthlyRevenue = Math.round(annualRevenueCents / 12);
        newEntries.push({
          id: `forecast_rev_${monthKey}`,
          effectiveDate: date,
          type: 'revenue',
          amountCents: monthlyRevenue,
          category: 'revenue',
          source: 'onboarding_forecast',
          immutable: false,
          origin: 'forecast',
          status: 'planned',
          monthKey,
          isForecast: true
        });
      }

      // 2. Business Expenses Forecast
      // If micro, use the flat rate or estimated ratio.
      const monthlyBusinessExpenses = userProfile.professionalExpensesRatio 
        ? Math.round(annualRevenueCents * userProfile.professionalExpensesRatio / 120000)
        : 0;

      if (monthlyBusinessExpenses > 0) {
        newEntries.push({
          id: `forecast_bus_exp_${monthKey}`,
          effectiveDate: date,
          type: 'business_expense',
          amountCents: monthlyBusinessExpenses,
          category: 'professional',
          source: 'onboarding_forecast',
          immutable: false,
          origin: 'forecast',
          status: 'planned',
          monthKey,
          isForecast: true
        });
      }

      // 3. Personal Drawings Forecast ("Salary")
      if (userProfile.personalMonthlyExpensesCents > 0) {
        newEntries.push({
          id: `forecast_perso_draw_${monthKey}`,
          effectiveDate: date,
          type: 'personal_drawing',
          amountCents: userProfile.personalMonthlyExpensesCents,
          category: 'personal',
          source: 'onboarding_forecast',
          immutable: false,
          origin: 'forecast',
          status: 'planned',
          monthKey,
          isForecast: true
        });
      }
    }

    return newEntries;
  }

  static reSeedForecasts(userProfile: UserProfile, currentLedger: LedgerEntry[]): LedgerEntry[] {
    const annualRevenueCents = userProfile.estimatedAnnualRevenueCents || userProfile.revenueLastYearCents || 0;
    const monthlyRevenue = Math.round(annualRevenueCents / 12);
    const monthlyBusinessExpenses = userProfile.professionalExpensesRatio 
      ? Math.round(annualRevenueCents * userProfile.professionalExpensesRatio / 120000)
      : 0;
    const monthlyPersonal = userProfile.personalMonthlyExpensesCents;

    return currentLedger.map(entry => {
      if (entry.status !== 'planned' || entry.origin !== 'forecast') return entry;

      if (entry.type === 'revenue') {
        return { ...entry, amountCents: monthlyRevenue };
      }
      if (entry.type === 'business_expense') {
        return { ...entry, amountCents: monthlyBusinessExpenses };
      }
      if (entry.type === 'personal_drawing') {
        return { ...entry, amountCents: monthlyPersonal };
      }
      return entry;
    });
  }

  getEntries(): LedgerEntry[] {
    return this.entries;
  }

  /**
   * Actions for "Ma Réalité"
   */

  confirmAsReal(id: string): void {
    const entry = this.entries.find(e => e.id === id);
    if (entry && entry.status === 'planned') {
      entry.status = 'realized';
      entry.origin = 'user'; // Now owned by user
      entry.isForecast = false;
    }
  }

  editAndConfirm(id: string, newAmount: MoneyCents, newDate?: Date): void {
    const entry = this.entries.find(e => e.id === id);
    if (entry && entry.status === 'planned') {
      entry.amountCents = newAmount;
      if (newDate) entry.effectiveDate = newDate;
      entry.status = 'realized';
      entry.origin = 'user';
      entry.isForecast = false;
    }
  }

  splitForecast(id: string, realEntries: Omit<LedgerEntry, 'id' | 'sourceForecastId' | 'status' | 'origin' | 'isForecast'>[]): void {
    const forecast = this.entries.find(e => e.id === id);
    if (forecast && forecast.status === 'planned') {
      forecast.status = 'cancelled'; // Original is no longer planned
      
      realEntries.forEach((re, index) => {
        this.entries.push({
          ...re,
          id: `${id}_split_${index}`,
          sourceForecastId: id,
          status: 'realized',
          origin: 'user',
          isForecast: false,
          monthKey: forecast.monthKey, // Keep the same month for grouping
          immutable: false
        });
      });
    }
  }

  cancelForecast(id: string): void {
    const entry = this.entries.find(e => e.id === id);
    if (entry && entry.status === 'planned') {
      entry.status = 'cancelled';
    }
  }

  getTotalsByType(type: LedgerEntryType): MoneyCents {
    return this.entries
      .filter((e) => e.type === type && e.status !== 'cancelled')
      .reduce((sum, e) => sum + e.amountCents, 0);
  }
}
