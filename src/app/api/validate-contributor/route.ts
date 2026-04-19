import { createAdminClient } from "@/lib/supabase/admin"
import { sendApprovalEmail } from "@/lib/email"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { documentId, status, comment, contributorName } = await request.json()

    const admin = createAdminClient()

    const { data: document } = await admin
      .from("documents")
      .select("*, projects(name, user_id, profiles(email, full_name))")
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

    const proEmail = document.projects?.profiles?.email
    const proName = document.projects?.profiles?.full_name

    if (proEmail) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://chalto.fr"
      await sendApprovalEmail({
        proEmail,
        proName: proName ?? "Professionnel",
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
