import { describe, it, expect } from 'vitest';
import { SimulationEngine } from '../core/engine/simulation-engine';
import { MoneyCents } from '../models/monetary';
import { Liability } from '../models/liability';

describe('SimulationEngine', () => {
  it('computes safe-to-spend correctly for a healthy situation', () => {
    const cash = 1000000; // 10k€
    const inflows = [
      { id: 'i1', date: new Date(2026, 5, 1), amountCents: 500000, label: 'Income' }
    ];
    const liabilities: Liability[] = [
      { id: 'l1', date: new Date(2026, 4, 1), amountCents: 300000, type: 'social_charges', label: 'URSSAF', isConfirmed: true }
    ];

    const result = SimulationEngine.execute(cash, inflows, liabilities, 100000);
    
    // Timeline: 10k (start) -> 7k (after URSSAF) -> 12k (after Income)
    // Min Balance = 7k (700000 cents)
    // Safe to spend = 7k - 1k (floor) = 6k (600000 cents)
    expect(result.minBalanceCents).toBe(700000);
    expect(result.safeToSpendCents).toBe(600000);
    expect(result.risk.level).toBe('safe');
  });

  it('detects danger when balance goes negative', () => {
    const cash = 200000; // 2k€
    const liabilities: Liability[] = [
      { id: 'l1', date: new Date(2026, 4, 1), amountCents: 500000, type: 'social_charges', label: 'URSSAF', isConfirmed: true }
    ];

    const result = SimulationEngine.execute(cash, [], liabilities);
    
    expect(result.minBalanceCents).toBe(-300000);
    expect(result.safeToSpendCents).toBe(0);
    expect(result.risk.level).toBe('danger');
    expect(result.risk.deficitMagnitudeCents).toBe(300000);
  });
});
