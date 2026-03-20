/**
 * CHALTO CORE DOMAIN MODELS
 * Time-based financial decision engine.
 */

export type LegalStatus = 'MICRO_ENTREPRENEUR' | 'BNC' | 'ARTISTE_MDA';

export interface FiscalProfile {
  status: LegalStatus;
  isTvaApplicable: boolean;
  hasAccre: boolean;
  // Professional expenses can be real (BNC) or flat-rate deduction (Micro)
  expenseType: 'FLAT_RATE' | 'REAL_EXPENSES';
}

export interface FinancialAssumptions {
  /** Estimated total revenue for the current fiscal year */
  estimatedAnnualRevenue: number;
  /** Revenue already cashed in during the current fiscal year */
  realizedRevenue: number;
  /** Level of confidence in the estimation (0 to 1) */
  confidence: number;
}

export interface CashPosition {
  /** Current available liquidity in professional/combined account */
  currentBalance: number;
  /** Date of the last balance update */
  lastUpdated: Date;
}

export type LiabilityType = 'URSSAF' | 'INCOME_TAX' | 'TVA' | 'RETIREMENT' | 'OTHER';

export interface Liability {
  id: string;
  type: LiabilityType;
  amount: number;
  dueDate: Date;
  label: string;
  isEstimate: boolean;
  status: 'PENDING' | 'PAID' | 'LATE';
}

export interface Inflow {
  id: string;
  amount: number;
  date: Date;
  label: string;
  isEstimate: boolean;
}

export interface RiskLevel {
  level: 'SAFE' | 'WARNING' | 'CRITICAL';
  message: string;
  lowestPoint: number;
  lowestPointDate: Date;
}

export interface SimulationResult {
  timeline: {
    date: Date;
    balance: number;
    change: number; // positive for inflow, negative for liability
    label: string;
  }[];
  lowestPoint: number;
  lowestPointDate: Date;
  safeToSpend: number;
  risk: RiskLevel;
}
