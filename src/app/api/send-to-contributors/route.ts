import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { sendToContributorsSchema } from "@/lib/api-schemas"
import { checkRateLimit } from "@/lib/rate-limit"
import { DOCUMENT_STATUS } from "@/types"
import { isChantierPhase } from "@/lib/utils"

export async function POST(request: Request) {
  try {
    if (!(await checkRateLimit(request)))
      return NextResponse.json({ error: "Trop de requêtes" }, { status: 429 })

    const parsed = sendToContributorsSchema.safeParse(await request.json())
    if (!parsed.success)
      return NextResponse.json({ error: "Paramètres invalides" }, { status: 400 })

    const { documentId, documentName, projectId, contributorIds, requestType, message } =
      parsed.data

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

    const [{ data: document }, { data: project }] = await Promise.all([
      supabase.from("documents").select("id, status").eq("id", documentId).single(),
      supabase
        .from("projects")
        .select("id, phase, user_id")
        .eq("id", projectId)
        .eq("user_id", user.id)
        .single(),
    ])

    if (!project) return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
    if (!document) return NextResponse.json({ error: "Document introuvable" }, { status: 404 })

    // L6 — un doc approved ne peut être partagé aux prestataires qu'en phase chantier
    if (document.status === DOCUMENT_STATUS.APPROVED && !isChantierPhase(project.phase)) {
      return NextResponse.json(
        { error: "Un document approuvé ne peut être partagé qu'en phase chantier" },
        { status: 409 }
      )
    }

    // Un doc approuvé par le client reste approuvé — on ne repasse pas en "sent".
    // La soumission prestataire est forcée en mode transmission (informatif uniquement).
    const effectiveRequestType =
      document.status === DOCUMENT_STATUS.APPROVED ? "transmission" : requestType

    if (document.status !== DOCUMENT_STATUS.APPROVED) {
      const { error: docUpdateError } = await supabase
        .from("documents")
        .update({ status: DOCUMENT_STATUS.SENT, audience: "contributor" })
        .eq("id", documentId)

      if (docUpdateError) {
        console.error("[send-to-contributors] doc update error:", docUpdateError)
        return NextResponse.json({ error: "Erreur mise à jour document" }, { status: 500 })
      }
    }

    const { error: upsertError } = await supabase.from("document_contributors").upsert(
      contributorIds.map((contributorId) => ({
        document_id: documentId,
        contributor_id: contributorId,
        request_type: effectiveRequestType,
        pro_message: message ?? null,
      })),
      { onConflict: "document_id,contributor_id" }
    )

    if (upsertError) {
      console.error("[send-to-contributors] upsert error:", upsertError)
    }

    // Délègue l'envoi des emails à la route existante
    const baseUrl = new URL(request.url).origin
    const emailRes = await fetch(`${baseUrl}/api/send-document-contributor`, {
      method: "POST",
      headers: { "Content-Type": "application/json", cookie: request.headers.get("cookie") ?? "" },
      body: JSON.stringify({
        contributorIds,
        documentName,
        projectId,
        message,
        requestType: effectiveRequestType,
      }),
    })

    if (!emailRes.ok) {
      const errData = await emailRes.json().catch(() => ({}))
      console.error("[send-to-contributors] email error:", errData)
      // On ne fait pas échouer la route — le doc est déjà mis à jour
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[send-to-contributors] erreur:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
