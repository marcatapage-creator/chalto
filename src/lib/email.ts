import { Resend } from "resend"

export function escapeHtml(str: string | null | undefined): string {
  if (!str) return ""
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

const FROM = "Chalto <noreply@chalto.fr>"

function getResend() {
  if (process.env.SKIP_EMAILS === "true") {
    return { emails: { send: async () => ({ data: null, error: null }) } } as unknown as Resend
  }
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
  requestType = "validation",
  logoUrl,
  companyName,
}: {
  clientEmail: string
  clientName: string
  proName: string
  projectName: string
  documentName: string
  validationUrl: string
  message?: string
  requestType?: "validation" | "transmission"
  logoUrl?: string | null
  companyName?: string | null
}) {
  const isTransmission = requestType === "transmission"
  const brandHeader = logoUrl
    ? `<img src="${logoUrl}" alt="${escapeHtml(companyName) || "Logo"}" style="max-height: 48px; max-width: 160px; object-fit: contain;" />`
    : `<div style="display: inline-flex; align-items: center; gap: 8px;">
        <img src="https://chalto.fr/Logo.svg" alt="Chalto" width="28" height="28" style="display: block;" />
        <span style="font-weight: 700; font-size: 16px; color: #111;">Chalto</span>
       </div>`

  const senderName = companyName ?? proName

  return getResend().emails.send({
    from: FROM,
    to: clientEmail,
    subject: isTransmission
      ? `${senderName} vous transmet un document pour information`
      : `${senderName} vous soumet un document à valider`,
    html: `
      <!DOCTYPE html>
      <html>
        <body style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #111; background: #fff;">

          <div style="margin-bottom: 32px;">
            ${brandHeader}
          </div>

          <h1 style="font-size: 22px; font-weight: 700; margin: 0 0 8px;">
            ${isTransmission ? "Document transmis pour information" : "Document à valider"}
          </h1>

          <p style="color: #555; margin: 0 0 32px; font-size: 15px;">
            Bonjour ${escapeHtml(clientName)},
          </p>

          <p style="color: #333; line-height: 1.7; font-size: 15px; margin: 0 0 24px;">
            <strong>${escapeHtml(proName)}</strong> ${isTransmission ? "vous transmet un document pour information" : "vous soumet un document pour validation"}
            dans le cadre du projet <strong>${escapeHtml(projectName)}</strong>.
          </p>

          <a href="${validationUrl}"
             style="display: inline-block; background: #3b5fdb; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px; margin: 0 0 32px;">
            ${isTransmission ? "Consulter le document →" : "Consulter et valider →"}
          </a>

          <div style="background: #f9f9f9; border: 1px solid #eee; border-radius: 10px; padding: 20px; margin: 0 0 24px;">
            <p style="margin: 0 0 4px; font-size: 12px; color: #999; text-transform: uppercase; letter-spacing: 0.5px;">Document</p>
            <p style="margin: 0; font-weight: 600; font-size: 16px;">${escapeHtml(documentName)}</p>
            <p style="margin: 4px 0 0; font-size: 13px; color: #666;">Projet : ${escapeHtml(projectName)}</p>
          </div>

          ${
            message
              ? `
          <div style="background: #f0f4ff; border-left: 3px solid #3b5fdb; border-radius: 0 8px 8px 0; padding: 16px 20px; margin: 0 0 24px;">
            <p style="margin: 0 0 6px; font-size: 12px; color: #999; text-transform: uppercase; letter-spacing: 0.5px;">Message de ${escapeHtml(proName)}</p>
            <p style="margin: 0; color: #333; line-height: 1.7; font-style: italic;">"${escapeHtml(message)}"</p>
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

          <div style="display: inline-flex; align-items: center; gap: 8px; margin-bottom: 32px;">
            <img src="https://chalto.fr/Logo.svg" alt="Chalto" width="28" height="28" style="display: block;" />
            <span style="font-weight: 700; font-size: 16px; color: #111;">Chalto</span>
          </div>

          <h1 style="font-size: 22px; font-weight: 700; margin: 0 0 8px;">
            Bienvenue ${escapeHtml(fullName)} 👋
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

export async function sendWaitlistConfirmationEmail({
  email,
  name,
}: {
  email: string
  name?: string
}) {
  return getResend().emails.send({
    from: FROM,
    to: email,
    subject: "Vous êtes sur la liste — Chalto Bêta",
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
            Vous êtes sur la liste ! 🎉
          </h1>

          <p style="color: #555; font-size: 15px; margin: 0 0 24px;">
            Bonjour${name ? ` ${escapeHtml(name)}` : ""} !
          </p>

          <p style="color: #333; line-height: 1.7; font-size: 15px; margin: 0 0 24px;">
            Merci pour votre intérêt pour Chalto. Vous faites partie
            des premiers inscrits à notre bêta fermée.
          </p>

          <div style="background: #f9f9f9; border-radius: 10px; padding: 24px; margin: 0 0 32px;">
            <p style="margin: 0 0 12px; font-weight: 600;">
              Ce qui vous attend :
            </p>
            <p style="margin: 0 0 8px; font-size: 14px; color: #555;">
              ✅ Accès prioritaire à la plateforme
            </p>
            <p style="margin: 0 0 8px; font-size: 14px; color: #555;">
              ✅ Plan Pro offert pendant la bêta
            </p>
            <p style="margin: 0; font-size: 14px; color: #555;">
              ✅ Votre feedback façonnera le produit
            </p>
          </div>

          <p style="color: #999; font-size: 12px; line-height: 1.6; margin: 0; border-top: 1px solid #eee; padding-top: 24px;">
            La plateforme des professionnels du bâtiment ·
            <a href="https://chalto.fr" style="color: #2260E8;">chalto.fr</a>
          </p>

        </body>
      </html>
    `,
  })
}

export async function sendTransmissionAckEmail({
  proEmail,
  proName,
  contributorName,
  projectName,
  documentName,
  comment,
  projectUrl,
}: {
  proEmail: string
  proName: string
  contributorName: string
  projectName: string
  documentName: string
  comment?: string | null
  projectUrl: string
}) {
  return getResend().emails.send({
    from: FROM,
    to: proEmail,
    subject: `📖 Lu par ${contributorName} — ${documentName}`,
    html: `
      <!DOCTYPE html>
      <html>
        <body style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #111; background: #fff;">

          <div style="display: inline-flex; align-items: center; gap: 8px; margin-bottom: 32px;">
            <img src="https://chalto.fr/Logo.svg" alt="Chalto" width="28" height="28" style="display: block;" />
            <span style="font-weight: 700; font-size: 16px; color: #111;">Chalto</span>
          </div>

          <h1 style="font-size: 22px; font-weight: 700; margin: 0 0 8px;">
            📖 Document consulté
          </h1>

          <p style="color: #555; margin: 0 0 32px; font-size: 15px;">
            Bonjour ${escapeHtml(proName)},
          </p>

          <p style="color: #333; line-height: 1.7; font-size: 15px; margin: 0 0 24px;">
            <strong>${escapeHtml(contributorName)}</strong> a lu le document
            <strong>${escapeHtml(documentName)}</strong> sur le projet <strong>${escapeHtml(projectName)}</strong>.
          </p>

          ${
            comment
              ? `
          <div style="background: #f9f9f9; border-left: 3px solid #3b5fdb; border-radius: 0 8px 8px 0; padding: 16px 20px; margin: 0 0 32px;">
            <p style="margin: 0 0 6px; font-size: 12px; color: #999; text-transform: uppercase; letter-spacing: 0.5px;">Commentaire</p>
            <p style="margin: 0; color: #333; line-height: 1.7; font-style: italic;">"${escapeHtml(comment)}"</p>
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

          <div style="display: inline-flex; align-items: center; gap: 8px; margin-bottom: 32px;">
            <img src="https://chalto.fr/Logo.svg" alt="Chalto" width="28" height="28" style="display: block;" />
            <span style="font-weight: 700; font-size: 16px; color: #111;">Chalto</span>
          </div>

          <h1 style="font-size: 22px; font-weight: 700; margin: 0 0 8px;">
            ${isApproved ? "✅ Document approuvé" : "❌ Document refusé"}
          </h1>

          <p style="color: #555; margin: 0 0 32px; font-size: 15px;">
            Bonjour ${escapeHtml(proName)},
          </p>

          <p style="color: #333; line-height: 1.7; font-size: 15px; margin: 0 0 24px;">
            <strong>${escapeHtml(clientName)}</strong> a ${isApproved ? "approuvé" : "refusé"} le document
            <strong>${escapeHtml(documentName)}</strong> sur le projet <strong>${escapeHtml(projectName)}</strong>.
          </p>

          ${
            comment
              ? `
          <div style="background: #f9f9f9; border-left: 3px solid ${isApproved ? "#3b5fdb" : "#ef4444"}; border-radius: 0 8px 8px 0; padding: 16px 20px; margin: 0 0 32px;">
            <p style="margin: 0 0 6px; font-size: 12px; color: #999; text-transform: uppercase; letter-spacing: 0.5px;">Commentaire du client</p>
            <p style="margin: 0; color: #333; line-height: 1.7; font-style: italic;">"${escapeHtml(comment)}"</p>
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

export async function sendSituationSubmittedEmail({
  architectEmail,
  architectName,
  contributorName,
  projectName,
  projectId,
  lotLabel,
  percentage,
  baseUrl,
}: {
  architectEmail: string
  architectName: string
  contributorName: string
  projectName: string
  projectId: string
  lotLabel: string
  percentage: number
  baseUrl: string
}) {
  return getResend().emails.send({
    from: FROM,
    to: architectEmail,
    subject: `Nouvelle situation de travaux — ${escapeHtml(projectName)}`,
    html: `
      <!DOCTYPE html>
      <html>
        <body style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #111; background: #fff;">

          <div style="display: inline-flex; align-items: center; gap: 8px; margin-bottom: 32px;">
            <img src="https://chalto.fr/Logo.svg" alt="Chalto" width="28" height="28" style="display: block;" />
            <span style="font-weight: 700; font-size: 16px; color: #111;">Chalto</span>
          </div>

          <h1 style="font-size: 22px; font-weight: 700; margin: 0 0 8px;">Nouvelle situation de travaux</h1>

          <p style="color: #555; margin: 0 0 32px; font-size: 15px;">Bonjour ${escapeHtml(architectName)},</p>

          <p style="color: #333; line-height: 1.7; font-size: 15px; margin: 0 0 24px;">
            <strong>${escapeHtml(contributorName)}</strong> a soumis une situation de travaux
            sur le projet <strong>${escapeHtml(projectName)}</strong>.
          </p>

          <div style="background: #f9f9f9; border: 1px solid #eee; border-radius: 10px; padding: 20px; margin: 0 0 24px;">
            <p style="margin: 0 0 4px; font-size: 12px; color: #999; text-transform: uppercase; letter-spacing: 0.5px;">Lot</p>
            <p style="margin: 0 0 12px; font-weight: 600; font-size: 16px;">${escapeHtml(lotLabel)}</p>
            <p style="margin: 0 0 4px; font-size: 12px; color: #999; text-transform: uppercase; letter-spacing: 0.5px;">Avancement</p>
            <p style="margin: 0; font-weight: 600; font-size: 16px;">${percentage}%</p>
          </div>

          <a href="${baseUrl}/projects/${projectId}?tab=situations"
             style="display: inline-block; background: #3b5fdb; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px; margin: 0 0 32px;">
            Valider ou refuser →
          </a>

          <p style="color: #999; font-size: 12px; line-height: 1.6; margin: 0; border-top: 1px solid #eee; padding-top: 24px;">
            Notification automatique Chalto
          </p>

        </body>
      </html>
    `,
  })
}

export async function sendSituationReviewedEmail({
  contributorEmail,
  contributorName,
  projectName,
  lotLabel,
  percentage,
  action,
  reviewerComment,
  refusalReason,
  inviteUrl,
}: {
  contributorEmail: string
  contributorName: string
  projectName: string
  lotLabel: string
  percentage: number
  action: "validate" | "refuse"
  reviewerComment?: string
  refusalReason?: string
  inviteUrl: string
}) {
  const isValidated = action === "validate"

  return getResend().emails.send({
    from: FROM,
    to: contributorEmail,
    subject: `${isValidated ? "✅ Situation validée" : "❌ Situation refusée"} — ${escapeHtml(projectName)}`,
    html: `
      <!DOCTYPE html>
      <html>
        <body style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #111; background: #fff;">

          <div style="display: inline-flex; align-items: center; gap: 8px; margin-bottom: 32px;">
            <img src="https://chalto.fr/Logo.svg" alt="Chalto" width="28" height="28" style="display: block;" />
            <span style="font-weight: 700; font-size: 16px; color: #111;">Chalto</span>
          </div>

          <h1 style="font-size: 22px; font-weight: 700; margin: 0 0 8px;">
            ${isValidated ? "✅ Situation validée" : "❌ Situation refusée"}
          </h1>

          <p style="color: #555; margin: 0 0 32px; font-size: 15px;">Bonjour ${escapeHtml(contributorName)},</p>

          <p style="color: #333; line-height: 1.7; font-size: 15px; margin: 0 0 24px;">
            Votre situation de travaux sur le projet <strong>${escapeHtml(projectName)}</strong>
            a été <strong>${isValidated ? "validée" : "refusée"}</strong>.
          </p>

          <div style="background: #f9f9f9; border: 1px solid #eee; border-radius: 10px; padding: 20px; margin: 0 0 24px;">
            <p style="margin: 0 0 4px; font-size: 12px; color: #999; text-transform: uppercase; letter-spacing: 0.5px;">Lot</p>
            <p style="margin: 0 0 12px; font-weight: 600; font-size: 16px;">${escapeHtml(lotLabel)}</p>
            <p style="margin: 0 0 4px; font-size: 12px; color: #999; text-transform: uppercase; letter-spacing: 0.5px;">Avancement</p>
            <p style="margin: 0; font-weight: 600; font-size: 16px;">${percentage}%</p>
          </div>

          ${
            refusalReason
              ? `
          <div style="background: #fff5f5; border-left: 3px solid #ef4444; border-radius: 0 8px 8px 0; padding: 16px 20px; margin: 0 0 24px;">
            <p style="margin: 0 0 6px; font-size: 12px; color: #999; text-transform: uppercase; letter-spacing: 0.5px;">Motif de refus</p>
            <p style="margin: 0; color: #333; line-height: 1.7;">${escapeHtml(refusalReason)}</p>
          </div>
          `
              : ""
          }

          ${
            reviewerComment
              ? `
          <div style="background: #f9f9f9; border-left: 3px solid #3b5fdb; border-radius: 0 8px 8px 0; padding: 16px 20px; margin: 0 0 24px;">
            <p style="margin: 0 0 6px; font-size: 12px; color: #999; text-transform: uppercase; letter-spacing: 0.5px;">Commentaire</p>
            <p style="margin: 0; color: #333; line-height: 1.7; font-style: italic;">"${escapeHtml(reviewerComment)}"</p>
          </div>
          `
              : ""
          }

          <a href="${inviteUrl}"
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

export async function sendDeadlineAlertEmail({
  userEmail,
  userName,
  projectName,
  projectId,
  dossierType,
  deadline,
  daysRemaining,
  threshold,
  baseUrl,
}: {
  userEmail: string
  userName: string
  projectName: string
  projectId: string
  dossierType: string
  deadline: string
  daysRemaining: number
  threshold: number
  baseUrl: string
}) {
  const formattedDeadline = new Date(deadline + "T00:00:00").toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  const isExpired = daysRemaining < 0
  const urgencyColor = daysRemaining <= 7 ? "#ef4444" : daysRemaining <= 30 ? "#f59e0b" : "#22c55e"
  const urgencyLabel = isExpired
    ? "Échéance dépassée"
    : daysRemaining === 0
      ? "Échéance aujourd'hui"
      : `J-${daysRemaining}`

  const subject = isExpired
    ? `⚫ Échéance dépassée — ${escapeHtml(dossierType)} · ${escapeHtml(projectName)}`
    : daysRemaining <= 7
      ? `🔴 ${urgencyLabel} — ${escapeHtml(dossierType)} · ${escapeHtml(projectName)}`
      : `🟠 ${urgencyLabel} — ${escapeHtml(dossierType)} · ${escapeHtml(projectName)}`

  return getResend().emails.send({
    from: FROM,
    to: userEmail,
    subject,
    html: `
      <!DOCTYPE html>
      <html>
        <body style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #111; background: #fff;">

          <div style="display: inline-flex; align-items: center; gap: 8px; margin-bottom: 32px;">
            <img src="https://chalto.fr/Logo.svg" alt="Chalto" width="28" height="28" style="display: block;" />
            <span style="font-weight: 700; font-size: 16px; color: #111;">Chalto</span>
          </div>

          <div style="display: inline-block; background: ${urgencyColor}; color: #fff; font-weight: 700; font-size: 13px; padding: 4px 12px; border-radius: 20px; margin-bottom: 20px;">
            ${escapeHtml(urgencyLabel)}
          </div>

          <h1 style="font-size: 22px; font-weight: 700; margin: 0 0 8px;">
            ${isExpired ? "Échéance dépassée" : "Rappel d'échéance"}
          </h1>

          <p style="color: #555; margin: 0 0 32px; font-size: 15px;">Bonjour ${escapeHtml(userName)},</p>

          <div style="background: #f9f9f9; border: 1px solid #eee; border-radius: 10px; padding: 20px; margin: 0 0 24px;">
            <p style="margin: 0 0 4px; font-size: 12px; color: #999; text-transform: uppercase; letter-spacing: 0.5px;">Projet</p>
            <p style="margin: 0 0 16px; font-weight: 600; font-size: 16px;">${escapeHtml(projectName)}</p>

            <p style="margin: 0 0 4px; font-size: 12px; color: #999; text-transform: uppercase; letter-spacing: 0.5px;">Dossier</p>
            <p style="margin: 0 0 16px; font-weight: 600; font-size: 16px;">${escapeHtml(dossierType)}</p>

            <p style="margin: 0 0 4px; font-size: 12px; color: #999; text-transform: uppercase; letter-spacing: 0.5px;">Échéance</p>
            <p style="margin: 0; font-weight: 600; font-size: 16px; color: ${urgencyColor};">${escapeHtml(formattedDeadline)}</p>
          </div>

          <a href="${baseUrl}/projects/${projectId}"
             style="display: inline-block; background: #111; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 15px; margin-bottom: 32px;">
            Voir le projet →
          </a>

          <p style="color: #999; font-size: 12px; line-height: 1.6; margin: 0; border-top: 1px solid #eee; padding-top: 24px;">
            Notification automatique Chalto · Alerte J-${threshold}
          </p>

        </body>
      </html>
    `,
  })
}
