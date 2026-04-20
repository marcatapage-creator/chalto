import { createClient } from "@/lib/supabase/server"
import { sendValidationEmail } from "@/lib/email"
import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"

export async function POST(request: Request) {
  try {
    const { documentId, message } = await request.json()
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

    const [{ data: document }, { data: profile }] = await Promise.all([
      supabase
        .from("documents")
        .select("*, projects(name, client_email, client_name)")
        .eq("id", documentId)
        .single(),
      supabase
        .from("profiles")
        .select("full_name, email, logo_url, company_name, branding_enabled")
        .eq("id", user.id)
        .single(),
    ])

    if (!document) {
      return NextResponse.json({ error: "Document introuvable" }, { status: 404 })
    }

    if (!document.projects?.client_email) {
      return NextResponse.json({ error: "Pas d'email client" }, { status: 400 })
    }

    const validationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/validate/${document.validation_token}`

    const { error: emailError } = await sendValidationEmail({
      clientEmail: document.projects.client_email,
      clientName: document.projects.client_name ?? "Client",
      proName: profile?.full_name ?? profile?.email ?? "Votre professionnel",
      projectName: document.projects.name,
      documentName: document.name,
      validationUrl,
      message: message ?? undefined,
      logoUrl: profile?.branding_enabled ? (profile.logo_url ?? null) : null,
      companyName: profile?.branding_enabled ? (profile.company_name ?? null) : null,
    })

    if (emailError) {
      console.error("Resend error:", emailError)
      return NextResponse.json(
        { error: "Erreur envoi email", details: String(emailError) },
        { status: 500 }
      )
    }

    const { error: updateError } = await supabase
      .from("documents")
      .update({ status: "sent", pro_message: message ?? null })
      .eq("id", documentId)

    if (updateError) {
      console.error("Update document error:", updateError)
      return NextResponse.json({ error: "Erreur mise à jour document" }, { status: 500 })
    }

    revalidatePath("/dashboard")
    revalidatePath(`/projects/${document.project_id}`)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erreur send-validation:", error)
    return NextResponse.json({ error: "Erreur serveur", details: String(error) }, { status: 500 })
  }
}
