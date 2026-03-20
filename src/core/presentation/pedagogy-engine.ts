import { SimulationResult } from '../../models/simulation';
import { MoneyCents } from '../../models/monetary';

export class PedagogyEngine {
  static generateHeadline(safeToSpend: MoneyCents, riskLevel: string): string {
    if (riskLevel === 'danger') return 'Action immédiate requise';
    if (safeToSpend === 0) return 'Prudence nécessaire';
    if (safeToSpend > 1000000) return 'Situation confortable'; // > 10k€
    return 'Vous pouvez dépenser en sécurité';
  }

  static generateExplanation(result: SimulationResult): string {
    const { minBalanceCents, minBalanceDate, risk } = result;

    if (risk.level === 'danger') {
      return `Un déficit de ${(risk.deficitMagnitudeCents / 100).toFixed(2)}€ est prévu autour du ${minBalanceDate.toLocaleDateString()}.`;
    }

    if (result.safeToSpendCents === 0) {
      return 'Vos prochaines obligations fiscales consomment la totalité de votre trésorerie actuelle.';
    }

    return `Votre point bas de trésorerie est estimé à ${(minBalanceCents / 100).toFixed(2)}€ le ${minBalanceDate.toLocaleDateString()}. C'est ce qui limite votre montant "Safe-to-spend".`;
  }
}
