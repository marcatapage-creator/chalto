import { createAdminClient } from "@/lib/supabase/admin"
import { sendApprovalEmail } from "@/lib/email"
import { createNotification } from "@/lib/notifications"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { token, status, comment } = await request.json()

    if (!token || !status) {
      return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 })
    }

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

    const [, , { data: proProfile }] = await Promise.all([
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

    const shouldSendEmail =
      proProfile?.notif_email_frequency !== "never" &&
      (status === "approved"
        ? proProfile?.notif_email_approved !== false
        : proProfile?.notif_email_rejected !== false)

    await Promise.all([
      createNotification({
        userId,
        type: status === "approved" ? "document_approved" : "document_rejected",
        title: status === "approved" ? "✅ Document approuvé" : "❌ Document refusé",
        body: `${document.projects.client_name ?? "Votre client"} a ${status === "approved" ? "approuvé" : "refusé"} "${document.name}"`,
        link: `/projects/${document.project_id}`,
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
