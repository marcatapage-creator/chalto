import { createClient } from "@/lib/supabase/server"
import { sendApprovalEmail } from "@/lib/email"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { documentId, status, comment } = await request.json()
    const supabase = await createClient()

    const { data: document } = await supabase
      .from("documents")
      .select("*, projects(name, user_id, client_name)")
      .eq("id", documentId)
      .single()

    if (!document) {
      return NextResponse.json({ error: "Document introuvable" }, { status: 404 })
    }

    const { data: proProfile } = await supabase
      .from("profiles")
      .select("email, full_name")
      .eq("id", document.projects.user_id)
      .single()

    if (!proProfile?.email) {
      return NextResponse.json({ error: "Pro introuvable" }, { status: 404 })
    }

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

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
