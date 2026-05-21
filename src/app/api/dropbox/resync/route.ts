import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { getValidAccessToken, downloadDropboxFile } from "@/lib/dropbox"
import { NextResponse, type NextRequest } from "next/server"
import { dropboxResyncSchema } from "@/lib/api-schemas"
import { checkRateLimit } from "@/lib/rate-limit"

export async function POST(request: NextRequest) {
  if (!(await checkRateLimit(request)))
    return NextResponse.json({ error: "Trop de requêtes" }, { status: 429 })

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 })

  const body = await request.json()
  const parsed = dropboxResyncSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Paramètres invalides" }, { status: 400 })

  const { documentId } = parsed.data

  // Vérifier ownership et récupérer le document
  const { data: doc } = await supabase
    .from("documents")
    .select(
      "id, project_id, cloud_file_id, file_url, file_name, file_type, file_size, version, status"
    )
    .eq("id", documentId)
    .single()

  if (!doc) return NextResponse.json({ error: "Document introuvable" }, { status: 404 })
  if (!doc.cloud_file_id)
    return NextResponse.json({ error: "Document non lié à Dropbox" }, { status: 400 })

  // Vérifier que le projet appartient à l'utilisateur
  const { data: project } = await supabase
    .from("projects")
    .select("id, user_id")
    .eq("id", doc.project_id)
    .eq("user_id", user.id)
    .single()
  if (!project) return NextResponse.json({ error: "Projet introuvable" }, { status: 404 })

  const accessToken = await getValidAccessToken(user.id)
  if (!accessToken) return NextResponse.json({ error: "Dropbox non connecté" }, { status: 403 })

  const admin = createAdminClient()

  const downloaded = await downloadDropboxFile(accessToken, doc.cloud_file_id)
  if (!downloaded) {
    console.error("[resync] Dropbox download failed", { cloud_file_id: doc.cloud_file_id })
    return NextResponse.json({ error: "Échec du téléchargement Dropbox" }, { status: 502 })
  }

  const { buffer, fileName: dlFileName, contentType } = downloaded
  const fileName = dlFileName ?? doc.file_name ?? "fichier"
  const currentVersion = doc.version ?? 1
  const newVersion = currentVersion + 1
  const safeName = fileName.replace(/[/\\]/g, "_")
  const storagePath = `${user.id}/${doc.id}/${newVersion}_${safeName}`

  const { error: uploadError } = await admin.storage
    .from("documents")
    .upload(storagePath, buffer, { contentType, upsert: false })

  if (uploadError) {
    return NextResponse.json({ error: "Erreur lors de l'upload" }, { status: 500 })
  }

  const { data: urlData } = admin.storage.from("documents").getPublicUrl(storagePath)
  const newFileUrl = urlData.publicUrl

  const newToken = crypto.randomUUID()

  // Archiver la version courante
  await admin.from("document_versions").insert({
    document_id: doc.id,
    version: currentVersion,
    file_url: doc.file_url ?? null,
    file_name: doc.file_name ?? null,
    file_type: doc.file_type ?? null,
    file_size: doc.file_size ?? null,
  })

  // Mettre à jour le document : draft + nouvelle version + nouveau fichier
  const { error: updateError } = await admin
    .from("documents")
    .update({
      status: "draft",
      version: newVersion,
      file_url: newFileUrl,
      file_name: fileName,
      file_type: contentType,
      file_size: buffer.byteLength,
      validation_token: newToken,
    })
    .eq("id", doc.id)

  if (updateError) {
    return NextResponse.json({ error: "Erreur lors de la mise à jour" }, { status: 500 })
  }

  return NextResponse.json({ version: newVersion, fileUrl: newFileUrl })
}
