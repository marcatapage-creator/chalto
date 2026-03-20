import { MoneyCents } from './monetary';

export type ProjectionConfidence = 'NONE' | 'MEDIUM' | 'HIGH';

export interface ProjectionResult {
  annualProjectionCents: MoneyCents | null;
  projectionLowCents: MoneyCents | null;
  projectionHighCents: MoneyCents | null;
  confidence: ProjectionConfidence;
  vatWarning: boolean;
}
