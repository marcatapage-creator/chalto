import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { getValidAccessToken, callDropbox } from "@/lib/dropbox"
import { NextResponse, type NextRequest } from "next/server"
import { linkCloudFolderSchema, unlinkCloudFolderSchema } from "@/lib/api-schemas"
import { checkRateLimit } from "@/lib/rate-limit"

const MAX_FILES_PER_SYNC = 50
const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50 MB

interface DropboxEntry {
  ".tag": "file" | "folder"
  name: string
  path_display: string
  id: string
  size?: number
}

function docTypeFromFilename(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase() ?? ""
  if (["dwg", "dxf", "rvt", "ifc", "skp"].includes(ext)) return "Plan"
  if (ext === "pdf") return "PDF"
  if (["xlsx", "xls", "csv", "ods"].includes(ext)) return "Tableur"
  if (["doc", "docx", "odt", "txt"].includes(ext)) return "Document"
  if (["jpg", "jpeg", "png", "gif", "webp", "heic"].includes(ext)) return "Image"
  return "Document"
}

function mimeFromFilename(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase() ?? ""
  const map: Record<string, string> = {
    pdf: "application/pdf",
    dwg: "application/acad",
    dxf: "application/dxf",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    xls: "application/vnd.ms-excel",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    doc: "application/msword",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
  }
  return map[ext] ?? "application/octet-stream"
}

// ── POST — lier un dossier et déclencher la sync initiale ─────────────────────
export async function POST(request: NextRequest) {
  if (!(await checkRateLimit(request)))
    return NextResponse.json({ error: "Trop de requêtes" }, { status: 429 })

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 })

  const body = await request.json()
  const parsed = linkCloudFolderSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Paramètres invalides" }, { status: 400 })

  const { projectId, remotePath, remoteId } = parsed.data

  // Vérifier que le projet appartient à l'utilisateur
  const { data: project } = await supabase
    .from("projects")
    .select("id")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .single()
  if (!project) return NextResponse.json({ error: "Projet introuvable" }, { status: 404 })

  const accessToken = await getValidAccessToken(user.id)
  if (!accessToken) return NextResponse.json({ error: "Dropbox non connecté" }, { status: 403 })

  const admin = createAdminClient()

  // Sauvegarder le lien
  const { data: link, error: linkError } = await admin
    .from("project_cloud_links")
    .upsert(
      {
        project_id: projectId,
        user_id: user.id,
        provider: "dropbox",
        remote_path: remotePath,
        remote_id: remoteId ?? null,
      },
      { onConflict: "project_id,provider,remote_path" }
    )
    .select("id")
    .single()

  if (linkError || !link) {
    return NextResponse.json({ error: "Erreur lors de la liaison" }, { status: 500 })
  }

  // Sync initiale — lister les fichiers du dossier
  let syncedCount = 0
  try {
    // Paginer jusqu'à la fin pour obtenir le curseur final correct
    let currentResult = await callDropbox<{
      entries: DropboxEntry[]
      cursor: string
      has_more: boolean
    }>(accessToken, "/files/list_folder", {
      path: remotePath,
      recursive: false,
      include_non_downloadable_files: false,
    })

    const allEntries: DropboxEntry[] = [...currentResult.entries]
    let finalCursor = currentResult.cursor

    while (currentResult.has_more) {
      currentResult = await callDropbox<{
        entries: DropboxEntry[]
        cursor: string
        has_more: boolean
      }>(accessToken, "/files/list_folder/continue", { cursor: finalCursor })
      allEntries.push(...currentResult.entries)
      finalCursor = currentResult.cursor
    }

    const files = allEntries
      .filter((e) => e[".tag"] === "file" && (e.size ?? 0) <= MAX_FILE_SIZE)
      .slice(0, MAX_FILES_PER_SYNC)

    for (const file of files) {
      // Éviter les doublons si le fichier a déjà été synchro
      const { data: existing } = await admin
        .from("documents")
        .select("id")
        .eq("project_id", projectId)
        .eq("cloud_file_id", file.id)
        .maybeSingle()
      if (existing) continue

      // Créer l'entrée document
      const { data: doc, error: docError } = await admin
        .from("documents")
        .insert({
          project_id: projectId,
          name: file.name,
          type: docTypeFromFilename(file.name),
          status: "draft",
          audience: "client",
          source: "dropbox",
          cloud_file_id: file.id,
          file_name: file.name,
          file_size: file.size ?? null,
          file_type: mimeFromFilename(file.name),
        })
        .select("id")
        .single()

      if (docError || !doc) continue

      // Télécharger depuis Dropbox et uploader dans Supabase Storage
      try {
        const dlRes = await fetch("https://content.dropboxapi.com/2/files/download", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Dropbox-API-Arg": JSON.stringify({ path: file.path_display }),
          },
        })

        if (!dlRes.ok) continue

        const buffer = await dlRes.arrayBuffer()
        const safeName = file.name.replace(/[/\\]/g, "_")
        const storagePath = `${user.id}/${doc.id}/${safeName}`

        const { error: uploadError } = await admin.storage
          .from("documents")
          .upload(storagePath, buffer, {
            contentType: mimeFromFilename(file.name),
            upsert: false,
          })

        if (!uploadError) {
          const { data: urlData } = admin.storage.from("documents").getPublicUrl(storagePath)
          await admin.from("documents").update({ file_url: urlData.publicUrl }).eq("id", doc.id)
        }

        syncedCount++
      } catch {
        // Fichier non critique — on continue
      }
    }

    // Stocker le curseur final pour la sync incrémentale (webhook)
    await admin
      .from("project_cloud_links")
      .update({ last_synced_at: new Date().toISOString(), cursor: finalCursor })
      .eq("id", link.id)
  } catch {
    // La sync initiale peut échouer sans bloquer la liaison
  }

  return NextResponse.json({ linkId: link.id, syncedCount })
}

// ── DELETE — délier un dossier ────────────────────────────────────────────────
export async function DELETE(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 })

  const body = await request.json()
  const parsed = unlinkCloudFolderSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Paramètres invalides" }, { status: 400 })

  const { linkId, projectId } = parsed.data

  // Vérifier que le lien appartient bien à ce projet et cet utilisateur
  const { data: link } = await supabase
    .from("project_cloud_links")
    .select("id")
    .eq("id", linkId)
    .eq("project_id", projectId)
    .eq("user_id", user.id)
    .single()

  if (!link) return NextResponse.json({ error: "Lien introuvable" }, { status: 404 })

  const admin = createAdminClient()
  await admin.from("project_cloud_links").delete().eq("id", linkId)

  return NextResponse.json({ success: true })
}
