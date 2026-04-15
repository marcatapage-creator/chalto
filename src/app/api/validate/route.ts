import { createAdminClient } from "@/lib/supabase/admin"
import { sendApprovalEmail } from "@/lib/email"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { token, status, comment } = await request.json()

    if (!token || !status) {
      return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 })
    }

    const admin = createAdminClient()

    // Vérifier le token et récupérer le document
    const { data: document } = await admin
      .from("documents")
      .select("*, projects(name, user_id, client_name, client_email)")
      .eq("validation_token", token)
      .single()

    if (!document) {
      return NextResponse.json({ error: "Token invalide" }, { status: 404 })
    }

    // INSERT validation + UPDATE statut document en parallèle
    await Promise.all([
      admin.from("validations").insert({
        document_id: document.id,
        status,
        comment: comment || null,
        approved_at: status === "approved" ? new Date().toISOString() : null,
      }),
      admin.from("documents").update({ status }).eq("id", document.id),
    ])

    // Notifier le pro par email
    const { data: proProfile } = await admin
      .from("profiles")
      .select("email, full_name")
      .eq("id", document.projects.user_id)
      .single()

    if (proProfile?.email) {
      const projectUrl = `${process.env.NEXT_PUBLIC_APP_URL}/projects/${document.project_id}`
      await sendApprovalEmail({
        proEmail: proProfile.email,
        proName: proProfile.full_name ?? "Professionnel",
        clientName: document.projects.client_name ?? "Le client",
        projectName: document.projects.name,
        documentName: document.name,
        status,
        comment,
        projectUrl,
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erreur validation:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
