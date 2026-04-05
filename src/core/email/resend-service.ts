import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_123456789');

interface EmailData {
  to: string;
  projectName: string;
  documentName: string;
  actionUrl: string;
}

export class EmailService {
  /**
   * Sends a validation request to the client.
   */
  static async sendValidationRequest({ to, projectName, documentName, actionUrl }: EmailData) {
    return resend.emails.send({
      from: 'Chalto Pro <notifications@chalto.pro>',
      to: [to],
      subject: `Validation requise : ${documentName} - ${projectName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #0f172a;">
          <h1 style="color: #2563eb; font-size: 24px; margin-bottom: 8px;">Action Requise</h1>
          <p style="font-size: 16px; color: #475569;">
            Une nouvelle version du document <strong>${documentName}</strong> a été déposée pour votre projet <strong>${projectName}</strong>.
          </p>
          <div style="margin: 32px 0;">
            <a href="${actionUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
              Consulter et Valider
            </a>
          </div>
          <p style="font-size: 14px; color: #94a3b8; border-top: 1px solid #e2e8f0; pt-16;">
            Accès sécurisé à votre espace projet Chalto Pro.
          </p>
        </div>
      `,
    });
  }

  /**
   * Notifies the architect of a client's response.
   */
  static async notifyArchitect({ to, projectName, documentName, actionUrl }: EmailData & { status: 'APPROVED' | 'REJECTED'; feedback?: string }) {
    const statusLabel = arguments[0].status === 'APPROVED' ? 'Validé' : 'Refusé';
    const statusColor = arguments[0].status === 'APPROVED' ? '#10b981' : '#ef4444';

    return resend.emails.send({
      from: 'Chalto Pro <notifications@chalto.pro>',
      to: [to],
      subject: `Réponse Client : ${documentName} - ${projectName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #0f172a;">
          <h1 style="color: ${statusColor}; font-size: 24px; margin-bottom: 8px;">Document ${statusLabel}</h1>
          <p style="font-size: 16px;">
            Le client a répondu pour le document <strong>${documentName}</strong> du projet <strong>${projectName}</strong>.
          </p>
          ${arguments[0].feedback ? `
            <div style="background-color: #f8fafc; border-left: 4px solid ${statusColor}; padding: 16px; margin: 24px 0;">
              <p style="font-style: italic; margin: 0;">"${arguments[0].feedback}"</p>
            </div>
          ` : ''}
          <div style="margin: 32px 0;">
            <a href="${actionUrl}" style="background-color: #0f172a; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
              Voir le projet
            </a>
          </div>
        </div>
      `,
    });
  }

  /**
   * Sends a confirmation to the client after they validate a document.
   */
  static async sendValidationConfirmation({ to, projectName, documentName }: Omit<EmailData, 'actionUrl'>) {
    return resend.emails.send({
      from: 'Chalto Pro <notifications@chalto.pro>',
      to: [to],
      subject: `Confirmation de validation : ${documentName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #0f172a;">
          <h1 style="color: #10b981; font-size: 24px; margin-bottom: 8px;">Validation Prise en Compte</h1>
          <p style="font-size: 16px; color: #475569;">
            Votre validation pour le document <strong>${documentName}</strong> du projet <strong>${projectName}</strong> a bien été enregistrée.
          </p>
          <p style="margin-top: 24px; font-size: 16px; font-weight: bold;">
            Prochaine étape : L'architecte va préparer la suite du projet.
          </p>
          <p style="font-size: 14px; color: #94a3b8; border-top: 1px solid #e2e8f0; margin-top: 32px; padding-top: 16px;">
            Merci pour votre réactivité. L'équipe Chalto Pro.
          </p>
        </div>
      `,
    });
  }
}
