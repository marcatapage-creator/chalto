import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse, type NextRequest } from "next/server"

const CALLBACK_URL = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/dropbox/callback`
const SETTINGS_INTEGRATIONS = "/settings?tab=integrations"

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const code = searchParams.get("code")
  const state = searchParams.get("state")

  // Refus explicite de l'utilisateur sur la page Dropbox
  if (searchParams.get("error")) {
    return NextResponse.redirect(
      new URL(`${SETTINGS_INTEGRATIONS}&error=dropbox_denied`, request.url)
    )
  }

  // Vérification CSRF — state doit correspondre au cookie posé par /connect
  const savedState = request.cookies.get("dropbox_oauth_state")?.value
  if (!code || !state || state !== savedState) {
    return NextResponse.redirect(
      new URL(`${SETTINGS_INTEGRATIONS}&error=dropbox_state`, request.url)
    )
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return NextResponse.redirect(new URL("/login", request.url))

  // Échange code → tokens
  const tokenRes = await fetch("https://api.dropbox.com/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      grant_type: "authorization_code",
      client_id: process.env.DROPBOX_APP_KEY!,
      client_secret: process.env.DROPBOX_APP_SECRET!,
      redirect_uri: CALLBACK_URL,
    }),
  })

  if (!tokenRes.ok) {
    return NextResponse.redirect(
      new URL(`${SETTINGS_INTEGRATIONS}&error=dropbox_token`, request.url)
    )
  }

  const tokens = await tokenRes.json()

  // Infos du compte Dropbox pour l'affichage UI
  const accountRes = await fetch("https://api.dropboxapi.com/2/users/get_current_account", {
    method: "POST",
    headers: { Authorization: `Bearer ${tokens.access_token}`, "Content-Type": "application/json" },
    body: "null",
  })
  const account = accountRes.ok ? await accountRes.json() : null

  const admin = createAdminClient()
  const { error } = await admin.from("user_integrations").upsert(
    {
      user_id: user.id,
      provider: "dropbox",
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
      provider_account_id: account?.account_id ?? null,
      provider_account_email: account?.email ?? null,
      status: "active",
      connected_at: new Date().toISOString(),
    },
    { onConflict: "user_id,provider" }
  )

  if (error) {
    return NextResponse.redirect(
      new URL(`${SETTINGS_INTEGRATIONS}&error=dropbox_save`, request.url)
    )
  }

  const response = NextResponse.redirect(new URL(SETTINGS_INTEGRATIONS, request.url))
  response.cookies.delete("dropbox_oauth_state")
  return response
}
