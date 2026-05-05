// Dropbox Webhook — Edge Function (Deno)
// Sprint 4 · Chalto
//
// Flux :
//   GET  ?challenge=xxx  → echo challenge (vérification Dropbox)
//   POST <payload>       → traite les changements pour chaque compte affecté
//
// Déploiement :
//   supabase functions deploy dropbox-webhook --no-verify-jwt
//
// Webhook URL à enregistrer dans Dropbox Developer Console :
//   https://<project-ref>.supabase.co/functions/v1/dropbox-webhook

import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const DROPBOX_API = "https://api.dropboxapi.com/2"
const DROPBOX_CONTENT_API = "https://content.dropboxapi.com/2"
const DROPBOX_TOKEN_URL = "https://api.dropbox.com/oauth2/token"
const MAX_FILES_PER_LINK = 20
const MAX_FILE_SIZE = 50 * 1024 * 1024

// ── Helpers ───────────────────────────────────────────────────────────────────

async function verifySignature(body: string, signature: string): Promise<boolean> {
  const secret = Deno.env.get("DROPBOX_APP_SECRET") ?? ""
  if (!secret) return false
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  )
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body))
  const computed = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
  // Constant-time comparison to prevent timing attacks
  const a = new TextEncoder().encode(computed)
  const b = new TextEncoder().encode(signature)
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i]
  return diff === 0
}

function isExpired(expiresAt: string | null): boolean {
  if (!expiresAt) return true
  return new Date(expiresAt) <= new Date(Date.now() + 5 * 60 * 1000)
}

async function refreshToken(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  refreshToken: string
): Promise<string | null> {
  const params = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: Deno.env.get("DROPBOX_APP_KEY") ?? "",
    client_secret: Deno.env.get("DROPBOX_APP_SECRET") ?? "",
  })

  const res = await fetch(DROPBOX_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params,
  })

  if (!res.ok) return null

  const data = await res.json()
  const expiresAt = new Date(Date.now() + data.expires_in * 1000).toISOString()

  await supabase
    .from("user_integrations")
    .update({ access_token: data.access_token, expires_at: expiresAt })
    .eq("user_id", userId)
    .eq("provider", "dropbox")

  return data.access_token as string
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
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
  }
  return map[ext] ?? "application/octet-stream"
}

// ── Sync d'un fichier dans un projet ─────────────────────────────────────────

async function syncFile(
  supabase: ReturnType<typeof createClient>,
  accessToken: string,
  // deno-lint-ignore no-explicit-any
  file: any,
  projectId: string,
  userId: string
): Promise<boolean> {
  // Éviter les doublons — cloud_file_id est stable entre versions Dropbox
  const { data: existing } = await supabase
    .from("documents")
    .select("id")
    .eq("project_id", projectId)
    .eq("cloud_file_id", file.id)
    .maybeSingle()

  if (existing) return false

  const { data: doc } = await supabase
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

  if (!doc) return false

  // Télécharger depuis Dropbox
  const dlRes = await fetch(`${DROPBOX_CONTENT_API}/files/download`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Dropbox-API-Arg": JSON.stringify({ path: file.path_display }),
    },
  })

  if (!dlRes.ok) return false

  const buffer = await dlRes.arrayBuffer()
  const safeName = (file.name as string).replace(/[/\\]/g, "_")
  const storagePath = `${userId}/${doc.id}/${safeName}`

  const { error } = await supabase.storage
    .from("documents")
    .upload(storagePath, buffer, { contentType: mimeFromFilename(file.name), upsert: false })

  if (!error) {
    const { data: urlData } = supabase.storage.from("documents").getPublicUrl(storagePath)
    await supabase.from("documents").update({ file_url: urlData.publicUrl }).eq("id", doc.id)
  }

  return true
}

// ── Traitement d'un compte Dropbox affecté ────────────────────────────────────

async function processAccount(
  supabase: ReturnType<typeof createClient>,
  accountId: string
): Promise<void> {
  const { data: integration } = await supabase
    .from("user_integrations")
    .select("user_id, access_token, refresh_token, expires_at")
    .eq("provider_account_id", accountId)
    .eq("provider", "dropbox")
    .eq("status", "active")
    .single()

  if (!integration) return

  // Refresh token si nécessaire
  let accessToken = integration.access_token
  if (isExpired(integration.expires_at)) {
    const refreshed = await refreshToken(supabase, integration.user_id, integration.refresh_token)
    if (!refreshed) {
      // Token irrécupérable — marquer expired et notifier
      await supabase
        .from("user_integrations")
        .update({ status: "expired" })
        .eq("user_id", integration.user_id)
        .eq("provider", "dropbox")
      await supabase.from("notifications").insert({
        user_id: integration.user_id,
        type: "cloud_token_expired",
        title: "Connexion Dropbox expirée",
        body: "Reconnectez votre compte Dropbox dans Paramètres → Intégrations.",
        link: "/settings?tab=integrations",
      })
      return
    }
    accessToken = refreshed
  }

  const { data: links } = await supabase
    .from("project_cloud_links")
    .select("id, project_id, remote_path, cursor")
    .eq("user_id", integration.user_id)
    .eq("provider", "dropbox")
    .eq("sync_enabled", true)

  if (!links?.length) return

  let totalSynced = 0

  for (const link of links) {
    try {
      // Sync incrémentale via curseur, ou listing complet si pas de curseur
      // deno-lint-ignore no-explicit-any
      let entries: any[] = []
      let newCursor = link.cursor

      if (link.cursor) {
        let result = await callDropbox<{ entries: unknown[]; cursor: string; has_more: boolean }>(
          accessToken,
          "/files/list_folder/continue",
          { cursor: link.cursor }
        )
        entries = result.entries as typeof entries
        newCursor = result.cursor

        while (result.has_more) {
          result = await callDropbox(accessToken, "/files/list_folder/continue", {
            cursor: result.cursor,
          })
          entries.push(...(result.entries as unknown[]))
          newCursor = result.cursor
        }
      } else {
        const result = await callDropbox<{ entries: unknown[]; cursor: string }>(
          accessToken,
          "/files/list_folder",
          { path: link.remote_path, recursive: false, include_non_downloadable_files: false }
        )
        entries = result.entries as typeof entries
        newCursor = result.cursor
      }

      // Traiter uniquement les fichiers (pas les dossiers ni les suppressions)
      const files = entries
        // deno-lint-ignore no-explicit-any
        .filter((e: any) => e[".tag"] === "file" && (e.size ?? 0) <= MAX_FILE_SIZE)
        .slice(0, MAX_FILES_PER_LINK)

      for (const file of files) {
        const synced = await syncFile(
          supabase,
          accessToken,
          file,
          link.project_id,
          integration.user_id
        )
        if (synced) totalSynced++
      }

      // Mettre à jour le curseur et la date de sync
      await supabase
        .from("project_cloud_links")
        .update({ cursor: newCursor, last_synced_at: new Date().toISOString() })
        .eq("id", link.id)
    } catch (err) {
      console.error(`Erreur sync lien ${link.id}:`, err)
    }
  }

  // Notification in-app si de nouveaux fichiers ont été synchronisés
  if (totalSynced > 0) {
    await supabase.from("notifications").insert({
      user_id: integration.user_id,
      type: "cloud_file_synced",
      title: `${totalSynced} fichier${totalSynced > 1 ? "s" : ""} synchronisé${totalSynced > 1 ? "s" : ""} depuis Dropbox`,
      body: "De nouveaux fichiers sont disponibles dans vos projets.",
      link: "/projects",
    })
  }
}

// ── Wrapper API Dropbox ───────────────────────────────────────────────────────

async function callDropbox<T>(accessToken: string, endpoint: string, body: object): Promise<T> {
  const res = await fetch(`${DROPBOX_API}${endpoint}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`Dropbox ${endpoint} → ${res.status}`)
  return res.json() as Promise<T>
}

// ── Entrée principale ─────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  // GET → vérification du webhook par Dropbox
  if (req.method === "GET") {
    const challenge = new URL(req.url).searchParams.get("challenge")
    if (!challenge) return new Response("Bad Request", { status: 400 })
    return new Response(challenge, {
      headers: { "Content-Type": "text/plain", "X-Content-Type-Options": "nosniff" },
    })
  }

  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 })

  const bodyText = await req.text()
  const signature = req.headers.get("X-Dropbox-Signature") ?? ""

  if (!(await verifySignature(bodyText, signature))) {
    return new Response("Forbidden", { status: 403 })
  }

  const payload = JSON.parse(bodyText)
  const accounts: string[] = payload?.list_folder?.accounts ?? []

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  )

  // Traiter chaque compte en parallèle — erreurs isolées
  await Promise.allSettled(accounts.map((id) => processAccount(supabase, id)))

  return new Response(null, { status: 200 })
})
