// Server-side only — ne jamais importer dans un composant "use client"
import { createAdminClient } from "@/lib/supabase/admin"

const DROPBOX_API = "https://api.dropboxapi.com/2"
const DROPBOX_TOKEN_URL = "https://api.dropbox.com/oauth2/token"

// ── Token management ──────────────────────────────────────────────────────────

async function refreshAccessToken(userId: string, refreshToken: string): Promise<string> {
  const params = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: process.env.DROPBOX_APP_KEY!,
    client_secret: process.env.DROPBOX_APP_SECRET!,
  })

  const res = await fetch(DROPBOX_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params,
  })

  if (!res.ok) throw new Error(`Dropbox token refresh failed: ${res.status}`)

  const data = await res.json()
  const expiresAt = new Date(Date.now() + data.expires_in * 1000)

  await createAdminClient()
    .from("user_integrations")
    .update({ access_token: data.access_token, expires_at: expiresAt.toISOString() })
    .eq("user_id", userId)
    .eq("provider", "dropbox")

  return data.access_token as string
}

/** Retourne un access_token valide pour userId, en le rafraîchissant si besoin. */
export async function getValidAccessToken(userId: string): Promise<string | null> {
  const admin = createAdminClient()
  const { data } = await admin
    .from("user_integrations")
    .select("access_token, refresh_token, expires_at")
    .eq("user_id", userId)
    .eq("provider", "dropbox")
    .eq("status", "active")
    .single()

  if (!data) return null

  // Refresh si le token expire dans moins de 5 minutes
  const expiresAt = data.expires_at ? new Date(data.expires_at) : new Date(0)
  if (expiresAt <= new Date(Date.now() + 5 * 60 * 1000)) {
    return refreshAccessToken(userId, data.refresh_token)
  }

  return data.access_token
}

// ── API wrapper ───────────────────────────────────────────────────────────────

/** Appel générique à l'API Dropbox. Passe `null` comme body pour les endpoints sans payload. */
export async function callDropbox<T>(
  accessToken: string,
  endpoint: string,
  body: object | null = null
): Promise<T> {
  const res = await fetch(`${DROPBOX_API}${endpoint}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    ...(body !== null && { body: JSON.stringify(body) }),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(`Dropbox ${endpoint} → ${res.status}: ${text}`)
  }

  return res.json() as Promise<T>
}
