import { createAdminClient } from "@/lib/supabase/admin"
import { checkRateLimit } from "@/lib/rate-limit"
import { NextResponse } from "next/server"
import { createSituationSchema } from "@/lib/api-schemas"
import { createNotification } from "@/lib/notifications"
import { sendSituationSubmittedEmail } from "@/lib/email"

export async function POST(request: Request) {
  if (!(await checkRateLimit(request)))
    return NextResponse.json({ error: "Trop de requêtes" }, { status: 429 })

  try {
    const formData = await request.formData()

    const parsed = createSituationSchema.safeParse({
      contributorToken: formData.get("contributorToken"),
      projectId: formData.get("projectId"),
      lotLabel: formData.get("lotLabel"),
      percentage: Number(formData.get("percentage")),
      amountHt: formData.get("amountHt") ? Number(formData.get("amountHt")) : undefined,
      comment: formData.get("comment") || undefined,
      parentSituationId: formData.get("parentSituationId") || undefined,
    })
    if (!parsed.success)
      return NextResponse.json({ error: "Paramètres invalides" }, { status: 400 })

    const data = parsed.data
    const admin = createAdminClient()

    const { data: contributor } = await admin
      .from("contributors")
      .select("id, name, contact_id, invite_expires_at")
      .eq("invite_token", data.contributorToken)
      .eq("project_id", data.projectId)
      .single()

    if (!contributor) return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
    if (contributor.invite_expires_at && new Date(contributor.invite_expires_at) < new Date()) {
      return NextResponse.json({ error: "Lien expiré" }, { status: 410 })
    }

    const { data: project } = await admin
      .from("projects")
      .select("id, name, user_id")
      .eq("id", data.projectId)
      .single()

    if (!project) return NextResponse.json({ error: "Projet introuvable" }, { status: 404 })

    const { data: situation, error: insertError } = await admin
      .from("situations")
      .insert({
        project_id: data.projectId,
        contributor_id: contributor.id,
        lot_label: data.lotLabel,
        percentage: data.percentage,
        amount_ht: data.amountHt ?? null,
        comment: data.comment ?? null,
        status: "en_attente",
        parent_situation_id: data.parentSituationId ?? null,
      })
      .select()
      .single()

    if (insertError || !situation) {
      console.error("[situations POST]", insertError)
      return NextResponse.json({ error: "Erreur lors de la création" }, { status: 500 })
    }

    const ALLOWED_EXTENSIONS = new Set(["pdf", "jpg", "jpeg", "png", "webp", "heic", "heif"])
    const validFiles = (formData.getAll("files") as File[]).filter(
      (f): f is File =>
        f instanceof File && ALLOWED_EXTENSIONS.has((f.name.split(".").pop() ?? "").toLowerCase())
    )

    const attachments = (
      await Promise.all(
        validFiles.map(async (file) => {
          const ext = (file.name.split(".").pop() ?? "").toLowerCase()
          const fileName = `${crypto.randomUUID()}.${ext}`
          const path = `${data.projectId}/${situation.id}/${fileName}`

          const buffer = await file.arrayBuffer()
          const { error: uploadError } = await admin.storage
            .from("situations")
            .upload(path, buffer, { contentType: file.type })

          if (uploadError) {
            console.error("[situations POST] upload", uploadError)
            return null
          }

          const { data: urlData } = admin.storage.from("situations").getPublicUrl(path)

          const { data: attachment } = await admin
            .from("situation_attachments")
            .insert({
              situation_id: situation.id,
              type: file.type === "application/pdf" ? "document" : "photo",
              url: urlData.publicUrl,
              file_name: file.name,
              file_size: file.size,
              file_type: file.type,
            })
            .select()
            .single()

          return attachment ?? null
        })
      )
    ).filter(Boolean)

    const { data: profile } = await admin
      .from("profiles")
      .select("full_name, email")
      .eq("id", project.user_id)
      .single()

    if (profile?.email) {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://chalto.fr"
      await sendSituationSubmittedEmail({
        architectEmail: profile.email,
        architectName: profile.full_name ?? "Architecte",
        contributorName: contributor.name,
        projectName: project.name,
        projectId: data.projectId,
        lotLabel: data.lotLabel,
        percentage: data.percentage,
        baseUrl,
      }).catch((err: unknown) =>
        console.error("[situations POST] sendSituationSubmittedEmail", err)
      )
    }

    await createNotification({
      userId: project.user_id,
      type: "situation_submitted",
      title: "Nouvelle situation de travaux",
      body: `${contributor.name} a soumis une situation pour le lot « ${data.lotLabel} » (${data.percentage}%)`,
      link: `/projects/${data.projectId}?highlight=sit_${situation.id}`,
    }).catch((err: unknown) => console.error("[situations POST] createNotification", err))

    return NextResponse.json({ situation: { ...situation, attachments } }, { status: 201 })
  } catch (error) {
    console.error("[situations POST]", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
