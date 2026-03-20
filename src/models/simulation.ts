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

export type ModelingStatus = 'fully' | 'partially' | 'not_modeled';

export interface ModelingMatrix {
  tva: ModelingStatus;
  urssaf: ModelingStatus;
  ircec: ModelingStatus;
  ir: ModelingStatus;
}

export interface SimulationResult {
  timeline: TimelineEntry[];
  minBalanceCents: number;
  minBalanceDate: Date;
  safeToSpendCents: number;
  risk: RiskAnalysis;
  
  /** Production Hardening: Reliability metrics */
  confidenceScore: number; // 0 to 100
  modelingMatrix: ModelingMatrix;
}
