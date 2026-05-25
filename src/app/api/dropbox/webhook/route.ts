import { createAdminClient } from "@/lib/supabase/admin"
import { getValidAccessToken, callDropbox, downloadDropboxFile } from "@/lib/dropbox"
import { NextResponse, type NextRequest } from "next/server"

async function verifySignature(secret: string, body: string, signature: string): Promise<boolean> {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  )
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(body))
  const hexSig = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
  return hexSig === signature
}

interface DropboxDeltaEntry {
  ".tag": string
  id?: string
  name?: string
  path_display?: string
  size?: number
}

async function resyncDocument(
  admin: ReturnType<typeof createAdminClient>,
  accessToken: string,
  userId: string,
  doc: {
    id: string
    file_url: string | null
    file_name: string | null
    file_type: string | null
    file_size: number | null
    version: number | null
    cloud_file_id: string
  }
) {
  const downloaded = await downloadDropboxFile(accessToken, doc.cloud_file_id)
  if (!downloaded) return

  const { buffer, contentType } = downloaded
  const fileName = downloaded.fileName ?? doc.file_name ?? "fichier"
  const currentVersion = doc.version ?? 1
  const newVersion = currentVersion + 1
  const safeName = fileName.replace(/[/\\]/g, "_")
  const storagePath = `${userId}/${doc.id}/${newVersion}_${safeName}`

  const { error: uploadError } = await admin.storage
    .from("documents")
    .upload(storagePath, buffer, { contentType, upsert: false })

  if (uploadError) return

  const { data: urlData } = admin.storage.from("documents").getPublicUrl(storagePath)

  await admin.from("document_versions").insert({
    document_id: doc.id,
    version: currentVersion,
    file_url: doc.file_url ?? null,
    file_name: doc.file_name ?? null,
    file_type: doc.file_type ?? null,
    file_size: doc.file_size ?? null,
  })

  await admin
    .from("documents")
    .update({
      status: "draft",
      version: newVersion,
      file_url: urlData.publicUrl,
      file_name: fileName,
      file_type: contentType,
      file_size: buffer.byteLength,
      validation_token: crypto.randomUUID(),
    })
    .eq("id", doc.id)
}

// ── GET — vérification du challenge Dropbox ───────────────────────────────────
export async function GET(request: NextRequest) {
  const challenge = request.nextUrl.searchParams.get("challenge")
  if (!challenge) return new Response("Bad Request", { status: 400 })
  return new Response(challenge, {
    headers: { "Content-Type": "text/plain", "X-Content-Type-Options": "nosniff" },
  })
}

// ── POST — notifications de changements ──────────────────────────────────────
export async function POST(request: NextRequest) {
  const appSecret = process.env.DROPBOX_APP_SECRET
  if (!appSecret) return new Response("Configuration manquante", { status: 500 })

  const rawBody = await request.text()
  const signature = request.headers.get("X-Dropbox-Signature") ?? ""

  const valid = await verifySignature(appSecret, rawBody, signature)
  if (!valid) return new Response("Forbidden", { status: 403 })

  const body = JSON.parse(rawBody) as { list_folder?: { accounts: string[] } }
  const accountIds = body.list_folder?.accounts ?? []
  if (accountIds.length === 0) return NextResponse.json({ ok: true })

  const admin = createAdminClient()

  for (const accountId of accountIds) {
    const { data: integration } = await admin
      .from("user_integrations")
      .select("user_id")
      .eq("provider", "dropbox")
      .eq("provider_account_id", accountId)
      .eq("status", "active")
      .single()

    if (!integration) continue

    const userId = integration.user_id
    const accessToken = await getValidAccessToken(userId)
    if (!accessToken) continue

    const { data: links } = await admin
      .from("project_cloud_links")
      .select("id, cursor, project_id")
      .eq("user_id", userId)
      .eq("provider", "dropbox")
      .not("cursor", "is", null)

    for (const link of links ?? []) {
      if (!link.cursor) continue

      const changedFileIds: string[] = []
      let cursor = link.cursor

      try {
        let hasMore = true
        while (hasMore) {
          const result = await callDropbox<{
            entries: DropboxDeltaEntry[]
            cursor: string
            has_more: boolean
          }>(accessToken, "/files/list_folder/continue", { cursor })

          for (const entry of result.entries) {
            if (entry[".tag"] === "file" && entry.id) changedFileIds.push(entry.id)
          }

          cursor = result.cursor
          hasMore = result.has_more
        }
      } catch (err) {
        console.error("[dropbox webhook] cursor continue error", { linkId: link.id, err })
        continue
      }

      await admin
        .from("project_cloud_links")
        .update({ cursor, last_synced_at: new Date().toISOString() })
        .eq("id", link.id)

      // Mise à jour du cursor seulement — le resync est déclenché manuellement
      // par l'archi via "Resynchroniser depuis Dropbox" pour éviter d'écraser
      // un statut rejected/approved avec un changement Dropbox antérieur au refus.
    }
  }

  return NextResponse.json({ ok: true })
}
