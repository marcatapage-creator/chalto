import { createClient } from "@/lib/supabase/server"
import { NextResponse, type NextRequest } from "next/server"
import { randomBytes } from "crypto"

const CALLBACK_URL = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/dropbox/callback`

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return NextResponse.redirect(new URL("/login", request.url))

  if (!process.env.DROPBOX_APP_KEY) {
    return NextResponse.redirect(
      new URL("/settings?tab=integrations&error=dropbox_config", request.url)
    )
  }

  const state = randomBytes(16).toString("hex")

  const url = new URL("https://www.dropbox.com/oauth2/authorize")
  url.searchParams.set("client_id", process.env.DROPBOX_APP_KEY)
  url.searchParams.set("redirect_uri", CALLBACK_URL)
  url.searchParams.set("response_type", "code")
  url.searchParams.set("token_access_type", "offline")
  url.searchParams.set("state", state)

  const response = NextResponse.redirect(url)
  response.cookies.set("dropbox_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  })

  return response
}
