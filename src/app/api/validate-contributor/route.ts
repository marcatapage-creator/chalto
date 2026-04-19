import { createAdminClient } from "@/lib/supabase/admin"
import { sendApprovalEmail } from "@/lib/email"
import { createNotification } from "@/lib/notifications"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { documentId, status, comment, contributorName } = await request.json()

    const admin = createAdminClient()

    const { data: document } = await admin
      .from("documents")
      .select("*, projects(name, user_id)")
      .eq("id", documentId)
      .single()

    if (!document) {
      return NextResponse.json({ error: "Document introuvable" }, { status: 404 })
    }

    await Promise.all([
      admin.from("documents").update({ status }).eq("id", documentId),
      admin.from("validations").insert({
        document_id: documentId,
        status,
        comment: comment || null,
        client_name: contributorName,
        approved_at: status === "approved" ? new Date().toISOString() : null,
      }),
    ])

    await createNotification({
      userId: document.projects.user_id,
      type: status === "approved" ? "document_approved" : "document_rejected",
      title:
        status === "approved"
          ? "✅ Document approuvé par un prestataire"
          : "❌ Document refusé par un prestataire",
      body: `${contributorName} a ${status === "approved" ? "approuvé" : "refusé"} "${document.name}"`,
      link: `/projects/${document.project_id}`,
    })

    const { data: proProfile } = await admin
      .from("profiles")
      .select("email, full_name, notif_email_approved, notif_email_rejected, notif_email_frequency")
      .eq("id", document.projects.user_id)
      .single()

    const shouldSendEmail =
      proProfile?.notif_email_frequency !== "never" &&
      (status === "approved"
        ? proProfile?.notif_email_approved !== false
        : proProfile?.notif_email_rejected !== false)

    if (proProfile?.email && shouldSendEmail) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://chalto.fr"
      await sendApprovalEmail({
        proEmail: proProfile.email,
        proName: proProfile.full_name ?? "Professionnel",
        clientName: contributorName ?? "Un prestataire",
        projectName: document.projects?.name ?? "Projet",
        documentName: document.name,
        status,
        comment,
        projectUrl: `${appUrl}/projects/${document.project_id}`,
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erreur validation prestataire:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
