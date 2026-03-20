import { MoneyCents } from './monetary';

export type LiabilityType = 'income_tax' | 'social_charges' | 'retirement' | 'cfe' | 'tva' | 'other';

export interface Liability {
  id: string;
  date: Date;
  type: LiabilityType;
  label: string;
  amountCents: MoneyCents;
  isConfirmed: boolean;
}
