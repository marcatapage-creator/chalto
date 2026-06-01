import { createAdminClient } from "@/lib/supabase/admin"
import { sendApprovalEmail, sendTransmissionAckEmail } from "@/lib/email"
import { createNotification } from "@/lib/notifications"
import { NextResponse } from "next/server"
import { validateContributorSchema } from "@/lib/api-schemas"
import { checkRateLimit } from "@/lib/rate-limit"
import { DOCUMENT_STATUS } from "@/types"

export async function POST(request: Request) {
  const allowed = await checkRateLimit(request)
  if (!allowed) {
    return NextResponse.json(
      { error: "Trop de requêtes — réessayez dans une minute" },
      { status: 429 }
    )
  }

  try {
    const parsed = validateContributorSchema.safeParse(await request.json())
    if (!parsed.success)
      return NextResponse.json({ error: "Paramètres invalides" }, { status: 400 })
    const {
      documentId,
      contributorToken,
      status,
      comment,
      contributorName,
      contributorId,
      requestType,
    } = parsed.data
    const isTransmission = requestType === "transmission"

    const admin = createAdminClient()

    // Vérification du token avant toute opération d'écriture
    const { data: contributor } = await admin
      .from("contributors")
      .select("id, invite_expires_at")
      .eq("invite_token", contributorToken)
      .single()

    if (!contributor) {
      return NextResponse.json({ error: "Token invalide" }, { status: 403 })
    }
    if (contributor.invite_expires_at && new Date(contributor.invite_expires_at) < new Date()) {
      return NextResponse.json({ error: "Lien expiré" }, { status: 410 })
    }

    const { data: document } = await admin
      .from("documents")
      .select("*, version, projects(name, user_id)")
      .eq("id", documentId)
      .single()

    if (!document) {
      return NextResponse.json({ error: "Document introuvable" }, { status: 404 })
    }

    const isApprovedTransmission = isTransmission && document.status === DOCUMENT_STATUS.APPROVED

    if (!isApprovedTransmission && document.status !== DOCUMENT_STATUS.SENT) {
      return NextResponse.json(
        { error: "Ce document n'est plus en attente de validation" },
        { status: 409 }
      )
    }

    // L5 — vérifier que ce prestataire est bien associé à ce document
    const { data: docContributor } = await admin
      .from("document_contributors")
      .select("id")
      .eq("document_id", documentId)
      .eq("contributor_id", contributor.id)
      .maybeSingle()

    if (!docContributor) {
      return NextResponse.json({ error: "Accès non autorisé à ce document" }, { status: 403 })
    }

    const userId = document.projects.user_id
    const effectiveStatus = isTransmission ? "commented" : status

    const [{ error: docUpdateError }, { error: validationInsertError }, { data: proProfile }] =
      await Promise.all([
        // Ne pas écraser le statut d'un doc déjà approuvé par le client (transmission seule)
        isApprovedTransmission
          ? Promise.resolve({ error: null })
          : admin.from("documents").update({ status: effectiveStatus }).eq("id", documentId),
        admin.from("validations").insert({
          document_id: documentId,
          status: effectiveStatus,
          comment: comment || null,
          client_name: contributorName,
          contributor_id: contributorId ?? null,
          approved_at: new Date().toISOString(),
          version: document.version ?? 1,
        }),
        admin
          .from("profiles")
          .select(
            "email, full_name, notif_inapp_enabled, notif_email_approved, notif_email_rejected, notif_email_frequency"
          )
          .eq("id", userId)
          .single(),
      ])

    // profiles.email can be null if the trigger didn't run at signup — fall back to auth.users
    let resolvedEmail = proProfile?.email ?? null
    if (!resolvedEmail) {
      const { data: authUser } = await admin.auth.admin.getUserById(userId)
      resolvedEmail = authUser?.user?.email ?? null
    }

    if (isTransmission) {
      await admin
        .from("document_contributors")
        .update({ acknowledged_at: new Date().toISOString() })
        .eq("id", docContributor.id)
        .then(({ error }) => {
          if (error) console.warn("[validate-contributor] acknowledged_at update failed:", error)
        })
    }

    if (docUpdateError) {
      console.error("[validate-contributor] documents update error:", docUpdateError)
      return NextResponse.json({ error: "Erreur mise à jour statut document" }, { status: 500 })
    }
    if (validationInsertError) {
      console.error("[validate-contributor] validations insert error:", validationInsertError)
      return NextResponse.json({ error: "Erreur enregistrement validation" }, { status: 500 })
    }

    const projectUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "https://chalto.fr"}/projects/${document.project_id}`

    if (isTransmission) {
      await createNotification({
        userId,
        type: "document_approved",
        title: "Document lu par un prestataire",
        body: comment
          ? `${contributorName} a lu « ${document.name} » · "${comment.length > 80 ? comment.slice(0, 80) + "…" : comment}"`
          : `${contributorName} a lu « ${document.name} »`,
        link: `/projects/${document.project_id}?highlight=doc_${document.id}`,
        inAppEnabled: proProfile?.notif_inapp_enabled,
      }).catch((err: unknown) =>
        console.error("[validate-contributor] createNotification lu:", err)
      )

      if (resolvedEmail && proProfile?.notif_email_frequency !== "never") {
        await sendTransmissionAckEmail({
          proEmail: resolvedEmail,
          proName: proProfile?.full_name ?? "Professionnel",
          contributorName: contributorName ?? "Un prestataire",
          projectName: document.projects?.name ?? "Projet",
          documentName: document.name,
          comment,
          projectUrl,
        }).catch((err: unknown) =>
          console.error("[validate-contributor] sendTransmissionAckEmail:", err)
        )
      }
    } else {
      const shouldSendEmail =
        proProfile?.notif_email_frequency !== "never" &&
        (status === "approved"
          ? proProfile?.notif_email_approved !== false
          : proProfile?.notif_email_rejected !== false)

      await createNotification({
        userId,
        type: status === "approved" ? "document_approved" : "document_rejected",
        title:
          status === "approved"
            ? "Document approuvé par un prestataire"
            : "Document refusé par un prestataire",
        body: `${contributorName} a ${status === "approved" ? "approuvé" : "refusé"} « ${document.name} »`,
        link: `/projects/${document.project_id}?highlight=doc_${document.id}`,
        inAppEnabled: proProfile?.notif_inapp_enabled,
      }).catch((err: unknown) => console.error("[validate-contributor] createNotification:", err))

      if (resolvedEmail && shouldSendEmail) {
        await sendApprovalEmail({
          proEmail: resolvedEmail,
          proName: proProfile?.full_name ?? "Professionnel",
          clientName: contributorName ?? "Un prestataire",
          projectName: document.projects?.name ?? "Projet",
          documentName: document.name,
          status: status as "approved" | "rejected",
          comment: comment ?? undefined,
          projectUrl,
        }).catch((err: unknown) => console.error("[validate-contributor] sendApprovalEmail:", err))
      } else {
        console.warn("[validate-contributor] email non envoyé", {
          hasEmail: !!resolvedEmail,
          shouldSendEmail,
          frequency: proProfile?.notif_email_frequency,
          notifApproved: proProfile?.notif_email_approved,
          notifRejected: proProfile?.notif_email_rejected,
          status,
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erreur validation prestataire:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
