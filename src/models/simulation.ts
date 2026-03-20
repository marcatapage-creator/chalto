import { MoneyCents } from './monetary';

export interface TimelineEntry {
  date: Date;
  amountCents: MoneyCents; // positive for inflow, negative for liability
  balanceCents: number;
  label: string;
  type: 'inflow' | 'liability' | 'initial';
}

export type RiskLevelValue = 'safe' | 'warning' | 'danger';

export interface RiskAnalysis {
  level: RiskLevelValue;
  nextRiskDate: Date | null;
  deficitMagnitudeCents: MoneyCents;
  message: string;
}

export interface SimulationResult {
  timeline: TimelineEntry[];
  minBalanceCents: number;
  minBalanceDate: Date;
  safeToSpendCents: number;
  risk: RiskAnalysis;
}
