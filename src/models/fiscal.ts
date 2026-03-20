/**
 * CHALTO FISCAL MODELS
 */

export type FreelancerStatus = 'micro' | 'bnc' | 'artiste';

export interface FiscalProfile {
  status: FreelancerStatus;
  tva: boolean;
  accre?: boolean;
}
