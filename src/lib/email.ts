import { Resend } from "resend"

const FROM = "Chalto <noreply@chalto.fr>"

function getResend() {
  return new Resend(process.env.RESEND_API_KEY)
}

export async function sendValidationEmail({
  clientEmail,
  clientName,
  proName,
  projectName,
  documentName,
  validationUrl,
  message,
}: {
  clientEmail: string
  clientName: string
  proName: string
  projectName: string
  documentName: string
  validationUrl: string
  message?: string
}) {
  return getResend().emails.send({
    from: FROM,
    to: clientEmail,
    subject: `${proName} vous soumet un document à valider`,
    html: `
      <!DOCTYPE html>
      <html>
        <body style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #111; background: #fff;">

          <div style="margin-bottom: 32px;">
            <div style="display: inline-flex; align-items: center; gap: 8px;">
              <div style="background: #3b5fdb; border-radius: 8px; padding: 6px 10px;">
                <span style="color: white; font-weight: 700; font-size: 14px;">Chalto</span>
              </div>
            </div>
          </div>

          <h1 style="font-size: 22px; font-weight: 700; margin: 0 0 8px;">
            Document à valider
          </h1>

          <p style="color: #555; margin: 0 0 32px; font-size: 15px;">
            Bonjour ${clientName},
          </p>

          <p style="color: #333; line-height: 1.7; font-size: 15px; margin: 0 0 24px;">
            <strong>${proName}</strong> vous soumet un document pour validation
            dans le cadre du projet <strong>${projectName}</strong>.
          </p>

          <a href="${validationUrl}"
             style="display: inline-block; background: #3b5fdb; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px; margin: 0 0 32px;">
            Consulter et valider →
          </a>

          <div style="background: #f9f9f9; border: 1px solid #eee; border-radius: 10px; padding: 20px; margin: 0 0 24px;">
            <p style="margin: 0 0 4px; font-size: 12px; color: #999; text-transform: uppercase; letter-spacing: 0.5px;">Document</p>
            <p style="margin: 0; font-weight: 600; font-size: 16px;">${documentName}</p>
            <p style="margin: 4px 0 0; font-size: 13px; color: #666;">Projet : ${projectName}</p>
          </div>

          ${
            message
              ? `
          <div style="background: #f0f4ff; border-left: 3px solid #3b5fdb; border-radius: 0 8px 8px 0; padding: 16px 20px; margin: 0 0 24px;">
            <p style="margin: 0 0 6px; font-size: 12px; color: #999; text-transform: uppercase; letter-spacing: 0.5px;">Message de ${proName}</p>
            <p style="margin: 0; color: #333; line-height: 1.7; font-style: italic;">"${message}"</p>
          </div>
          `
              : ""
          }

          <p style="color: #999; font-size: 12px; line-height: 1.6; margin: 0; border-top: 1px solid #eee; padding-top: 24px;">
            Ce lien est personnel et sécurisé. Il vous a été envoyé par votre professionnel via Chalto.<br/>
            Si vous n'attendiez pas ce message, ignorez cet email.
          </p>

        </body>
      </html>
    `,
  })
}

export async function sendWelcomeEmail({ email, fullName }: { email: string; fullName?: string }) {
  return getResend().emails.send({
    from: FROM,
    to: email,
    subject: "Bienvenue sur Chalto 🏗️",
    html: `
      <!DOCTYPE html>
      <html>
        <body style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #111; background: #fff;">

          <div style="margin-bottom: 32px;">
            <div style="background: #2260E8; border-radius: 8px; padding: 6px 12px; display: inline-block;">
              <span style="color: white; font-weight: 700; font-size: 14px;">Chalto</span>
            </div>
          </div>

          <h1 style="font-size: 22px; font-weight: 700; margin: 0 0 8px;">
            Bienvenue ${fullName ?? ""} 👋
          </h1>

          <p style="color: #555; font-size: 15px; margin: 0 0 24px;">
            Votre compte Chalto est prêt. Voici ce que vous pouvez faire dès maintenant.
          </p>

          <div style="background: #f9f9f9; border-radius: 10px; padding: 24px; margin: 0 0 32px;">
            <div style="margin-bottom: 16px;">
              <p style="margin: 0 0 4px; font-weight: 600; font-size: 14px;">
                📁 Créez votre premier projet
              </p>
              <p style="margin: 0; color: #666; font-size: 13px; line-height: 1.6;">
                Renseignez les informations de base et invitez votre client.
              </p>
            </div>
            <div style="margin-bottom: 16px;">
              <p style="margin: 0 0 4px; font-weight: 600; font-size: 14px;">
                📄 Ajoutez vos documents
              </p>
              <p style="margin: 0; color: #666; font-size: 13px; line-height: 1.6;">
                Uploadez vos plans, devis ou notices directement dans Chalto.
              </p>
            </div>
            <div>
              <p style="margin: 0 0 4px; font-weight: 600; font-size: 14px;">
                ✅ Faites valider en 1 clic
              </p>
              <p style="margin: 0; color: #666; font-size: 13px; line-height: 1.6;">
                Envoyez un lien à votre client — il valide sans avoir de compte.
              </p>
            </div>
          </div>

          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard"
             style="display: inline-block; background: #2260E8; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px; margin: 0 0 32px;">
            Accéder à mon espace →
          </a>

          <p style="color: #999; font-size: 12px; line-height: 1.6; margin: 0; border-top: 1px solid #eee; padding-top: 24px;">
            Vous recevez cet email car vous venez de créer un compte sur Chalto.<br/>
            Une question ? Répondez directement à cet email.
          </p>

        </body>
      </html>
    `,
  })
}

export async function sendApprovalEmail({
  proEmail,
  proName,
  clientName,
  projectName,
  documentName,
  status,
  comment,
  projectUrl,
}: {
  proEmail: string
  proName: string
  clientName: string
  projectName: string
  documentName: string
  status: "approved" | "rejected"
  comment?: string
  projectUrl: string
}) {
  const isApproved = status === "approved"

  return getResend().emails.send({
    from: FROM,
    to: proEmail,
    subject: `${isApproved ? "✅ Approuvé" : "❌ Refusé"} — ${documentName}`,
    html: `
      <!DOCTYPE html>
      <html>
        <body style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #111; background: #fff;">

          <div style="margin-bottom: 32px;">
            <div style="display: inline-flex; align-items: center; gap: 8px;">
              <div style="background: #3b5fdb; border-radius: 8px; padding: 6px 10px;">
                <span style="color: white; font-weight: 700; font-size: 14px;">Chalto</span>
              </div>
            </div>
          </div>

          <h1 style="font-size: 22px; font-weight: 700; margin: 0 0 8px;">
            ${isApproved ? "✅ Document approuvé" : "❌ Document refusé"}
          </h1>

          <p style="color: #555; margin: 0 0 32px; font-size: 15px;">
            Bonjour ${proName},
          </p>

          <p style="color: #333; line-height: 1.7; font-size: 15px; margin: 0 0 24px;">
            <strong>${clientName}</strong> a ${isApproved ? "approuvé" : "refusé"} le document
            <strong>${documentName}</strong> sur le projet <strong>${projectName}</strong>.
          </p>

          ${
            comment
              ? `
          <div style="background: #f9f9f9; border-left: 3px solid ${isApproved ? "#3b5fdb" : "#ef4444"}; border-radius: 0 8px 8px 0; padding: 16px 20px; margin: 0 0 32px;">
            <p style="margin: 0 0 6px; font-size: 12px; color: #999; text-transform: uppercase; letter-spacing: 0.5px;">Commentaire du client</p>
            <p style="margin: 0; color: #333; line-height: 1.7; font-style: italic;">"${comment}"</p>
          </div>
          `
              : ""
          }

          <a href="${projectUrl}"
             style="display: inline-block; background: #111; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px; margin: 0 0 32px;">
            Voir le projet →
          </a>

          <p style="color: #999; font-size: 12px; line-height: 1.6; margin: 0; border-top: 1px solid #eee; padding-top: 24px;">
            Notification automatique Chalto
          </p>

        </body>
      </html>
    `,
  })
}
