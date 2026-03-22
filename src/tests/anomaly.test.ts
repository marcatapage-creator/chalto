import { describe, it, expect } from 'vitest';
import { TrustEngine } from '../core/engine/trust-engine';

describe('TrustEngine Anomaly Detection', () => {
  it('detects divergence_critical when actuals are 20x the projection', () => {
    // Ledger 200k, Profil 10k
    const anomalies = TrustEngine.detectAnomalies(20000000, 1000000);
    const critical = anomalies.find(a => a.type === 'divergence_critical');
    expect(critical).toBeDefined();
    expect(critical?.severity).toBe('critical');
  });

  it('detects uncomputable when hasMinimumData is false', () => {
    // Empty ledger, no data
    const anomalies = TrustEngine.detectAnomalies(0, 0, false);
    const uncomputable = anomalies.find(a => a.type === 'uncomputable');
    expect(uncomputable).toBeDefined();
    expect(uncomputable?.severity).toBe('critical');
    expect(uncomputable?.action).toBe('Aller dans Ma Réalité');
  });

  it('suppresses precision alert during the first 30 days', () => {
    // Score < 60 but only 10 days since onboarding
    const report = TrustEngine.calculateReliability(100000, 500000, 10, 5);
    expect(report.score).toBeLessThan(60);
    expect(report.showPrecisionAlert).toBe(false);
  });

  it('triggers precision alert after 30 days and 3 sessions if score is low', () => {
    // Score < 60, 31 days, 4 sessions
    const report = TrustEngine.calculateReliability(100000, 500000, 31, 4);
    expect(report.score).toBeLessThan(60);
    expect(report.showPrecisionAlert).toBe(true);
  });

  it('suppresses precision alert even after 30 days if score is high', () => {
    // Score 100, 40 days, 10 sessions
    const report = TrustEngine.calculateReliability(500000, 500000, 40, 10);
    expect(report.score).toBe(100);
    expect(report.showPrecisionAlert).toBe(false);
  });

  it('returns empty array when no anomalies exist', () => {
    // Perfectly matched data
    const anomalies = TrustEngine.detectAnomalies(100000, 100000, true, 0);
    expect(anomalies).toEqual([]);
  });
});
