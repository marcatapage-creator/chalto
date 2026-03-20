import { SimulationResult } from '../../models/simulation';
import { MoneyCents } from '../../models/monetary';

export class PedagogyEngine {
  static generateHeadline(safeToSpend: MoneyCents, riskLevel: string, safetyMode: string): string {
    const suffix = safetyMode === 'conservative' ? ' (Mode Prudent)' : ' (Mode Prévisionnel)';
    
    if (riskLevel === 'danger') return 'Action recommandée' + suffix;
    if (safeToSpend === 0) return 'Prudence conseillée' + suffix;
    if (safeToSpend > 1000000) return 'Disponibilité estimée' + suffix;
    return 'Dépense sécurisée estimée' + suffix;
  }

  static generateExplanation(result: SimulationResult, safetyMode: string): string {
    const { minBalanceCents, minBalanceDate, risk } = result;

    const baseMessage = safetyMode === 'conservative' 
      ? 'Basé uniquement sur vos revenus encaissés et engagements connus.'
      : 'Inclut vos projections de revenus futurs (incertain).';

    if (risk.level === 'danger') {
      return `${baseMessage} Un risque de solde négatif est anticipé vers le ${minBalanceDate.toLocaleDateString()} (déficit estimé : ${(risk.deficitMagnitudeCents / 100).toFixed(2)}€).`;
    }

    if (result.safeToSpendCents === 0) {
      return `${baseMessage} Vos engagements fiscaux projetés pourraient consommer votre trésorerie actuelle.`;
    }

    return `${baseMessage} Votre point bas de trésorerie projeté se situe vers ${(minBalanceCents / 100).toFixed(2)}€ le ${minBalanceDate.toLocaleDateString()}. Ce montant "Safe-to-spend" est une aide à la décision, pas une garantie légale.`;
  }
}
