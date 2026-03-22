import { MoneyCents, RateBps, applyRate } from '../../models/monetary';
import { Liability } from '../../models/liability';
import { TimelineEntry, SimulationResult, RiskAnalysis } from '../../models/simulation';

export interface Inflow {
  id: string;
  date: Date;
  amountCents: MoneyCents;
  label: string;
}

export class SimulationEngine {
  static execute(
    currentCashCents: MoneyCents,
    inflows: Inflow[],
    liabilities: Liability[],
    safetyFloorCents: MoneyCents = 0,
    baseConfidenceScore?: number,
    pessimistBufferBps: RateBps = 0
  ): SimulationResult {
    const timeline: TimelineEntry[] = [];
    
    // 1. Initial Position
    let currentBalance = currentCashCents;
    timeline.push({
      date: new Date(), // Now
      amountCents: 0,
      balanceCents: currentBalance,
      label: 'Trésorerie Actuelle',
      type: 'initial',
    });

    // 2. Merge and Sort Movements
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    const movements = [
      ...inflows.map(i => ({ id: i.id, date: i.date, amount: i.amountCents, label: i.label, type: 'inflow' as const })),
      ...liabilities.map(l => ({ id: l.id, date: l.date, amount: -l.amountCents, label: l.label, type: 'liability' as const })),
    ]
    .filter(m => m.date.getTime() >= todayStart) // Only process future or today's movements
    .sort((a, b) => a.date.getTime() - b.date.getTime());

    // 3. Simulate
    let minBalance = currentBalance;
    let minBalanceDate = now;

    for (const move of movements) {
      currentBalance += move.amount;
      
      timeline.push({
        id: move.id,
        date: move.date,
        amountCents: move.amount,
        balanceCents: currentBalance,
        label: move.label,
        type: move.type,
      });

      if (currentBalance < minBalance) {
        minBalance = currentBalance;
        minBalanceDate = move.date;
      }
    }

    // 4. Derive Safe-to-Spend
    // Formula: safeToSpend = max(0, minProjectedBalance - safetyFloor)
    // We apply an additional pessimist buffer if reliability is low
    const adjustedSafetyFloor = safetyFloorCents + applyRate(minBalance > 0 ? minBalance : 0, pessimistBufferBps);
    const safeToSpendCents = Math.max(0, minBalance - adjustedSafetyFloor);

    // 5. Risk Analysis
    const risk = this.analyzeRisk(minBalance, minBalanceDate);

    // 6. Production Hardening
    const confidenceScore = this.calculateConfidenceScore(inflows.length > 0, liabilities.length > 0, baseConfidenceScore);
    const modelingMatrix = {
      tva: 'partially' as const, // advances modeled, regularization not yet
      urssaf: 'fully' as const,
      ircec: 'partially' as const, // standard/reduced rate modeled, call timing is approx
      ir: 'partially' as const, // parts modeled, global caps/nuances partially
    };

    return {
      timeline,
      minBalanceCents: minBalance,
      minBalanceDate,
      safeToSpendCents,
      risk,
      confidenceScore,
      modelingMatrix,
    };
  }

  private static calculateConfidenceScore(hasInflows: boolean, hasLiabilities: boolean, baseConfidenceScore?: number): number {
    let score = baseConfidenceScore ?? 100;
    if (!hasInflows) score = Math.max(0, score - 20); // Uncertainty about revenue
    if (!hasLiabilities) score = Math.max(0, score - 10);
    return Math.floor(score);
  }

  private static analyzeRisk(minBalance: number, minBalanceDate: Date): RiskAnalysis {
    if (minBalance < 0) {
      return {
        level: 'danger',
        nextRiskDate: minBalanceDate,
        deficitMagnitudeCents: Math.abs(minBalance),
        message: 'Risque de découvert détecté.',
      };
    }

    if (minBalance < 100000) { // < 1000€ buffer
      return {
        level: 'warning',
        nextRiskDate: minBalanceDate,
        deficitMagnitudeCents: 0,
        message: 'Trésorerie tendue prochainement.',
      };
    }

    return {
      level: 'safe',
      nextRiskDate: null,
      deficitMagnitudeCents: 0,
      message: 'Situation saine.',
    };
  }
}
