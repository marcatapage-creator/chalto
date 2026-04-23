import { createAdminClient } from "@/lib/supabase/admin"
import { sendApprovalEmail } from "@/lib/email"
import { createNotification } from "@/lib/notifications"
import { NextResponse } from "next/server"
import { validateSchema } from "@/lib/api-schemas"

export async function POST(request: Request) {
  try {
    const parsed = validateSchema.safeParse(await request.json())
    if (!parsed.success)
      return NextResponse.json({ error: "Paramètres invalides" }, { status: 400 })
    const { token, status, comment } = parsed.data

    const admin = createAdminClient()

    const { data: document } = await admin
      .from("documents")
      .select("*, projects(name, user_id, client_name, client_email)")
      .eq("validation_token", token)
      .single()

    if (!document) {
      return NextResponse.json({ error: "Token invalide" }, { status: 404 })
    }

    const userId = document.projects.user_id

    const [{ error: validationError }, { error: docUpdateError }, { data: proProfile }] =
      await Promise.all([
        admin.from("validations").insert({
          document_id: document.id,
          status,
          comment: comment || null,
          approved_at: status === "approved" ? new Date().toISOString() : null,
        }),
        admin.from("documents").update({ status }).eq("id", document.id),
        admin
          .from("profiles")
          .select(
            "email, full_name, notif_inapp_enabled, notif_email_approved, notif_email_rejected, notif_email_frequency"
          )
          .eq("id", userId)
          .single(),
      ])

    if (validationError) {
      console.error("[validate] validations insert error:", validationError)
      return NextResponse.json({ error: "Erreur enregistrement validation" }, { status: 500 })
    }
    if (docUpdateError) {
      console.error("[validate] documents update error:", docUpdateError)
      return NextResponse.json({ error: "Erreur mise à jour statut document" }, { status: 500 })
    }

    const shouldSendEmail =
      proProfile?.notif_email_frequency !== "never" &&
      (status === "approved"
        ? proProfile?.notif_email_approved !== false
        : proProfile?.notif_email_rejected !== false)

    await Promise.all([
      createNotification({
        userId,
        type: status === "approved" ? "document_approved" : "document_rejected",
        title: status === "approved" ? "Document approuvé" : "Document refusé",
        body: `${document.projects.client_name ?? "Votre client"} a ${status === "approved" ? "approuvé" : "refusé"} "${document.name}"`,
        link: `/projects/${document.project_id}?highlight=doc_${document.id}`,
        inAppEnabled: proProfile?.notif_inapp_enabled,
      }),
      proProfile?.email && shouldSendEmail
        ? sendApprovalEmail({
            proEmail: proProfile.email,
            proName: proProfile.full_name ?? "Professionnel",
            clientName: document.projects.client_name ?? "Le client",
            projectName: document.projects.name,
            documentName: document.name,
            status,
            comment,
            projectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/projects/${document.project_id}`,
          })
        : Promise.resolve(),
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erreur validation:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
