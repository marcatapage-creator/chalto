import { createClient } from "@/lib/supabase/server"
import { sendValidationEmail } from "@/lib/email"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { documentId, message } = await request.json()
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

    const { data: document } = await supabase
      .from("documents")
      .select("*, projects(name, client_email, client_name)")
      .eq("id", documentId)
      .single()

    if (!document) {
      return NextResponse.json({ error: "Document introuvable" }, { status: 404 })
    }

    if (!document.projects?.client_email) {
      return NextResponse.json({ error: "Pas d'email client" }, { status: 400 })
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", user.id)
      .single()

    const validationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/validate/${document.validation_token}`

    await sendValidationEmail({
      clientEmail: document.projects.client_email,
      clientName: document.projects.client_name ?? "Client",
      proName: profile?.full_name ?? profile?.email ?? "Votre professionnel",
      projectName: document.projects.name,
      documentName: document.name,
      validationUrl,
      message: message ?? undefined,
    })

    await supabase
      .from("documents")
      .update({ status: "sent", pro_message: message ?? null })
      .eq("id", documentId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erreur send-validation:", error)
    return NextResponse.json({ error: "Erreur serveur", details: String(error) }, { status: 500 })
  }
}
