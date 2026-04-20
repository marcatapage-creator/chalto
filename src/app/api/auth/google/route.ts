import { createClient } from "@/lib/supabase/server"
import { NextResponse, type NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const { origin } = new URL(request.url)
  const source = request.nextUrl.searchParams.get("source")

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback`,
      skipBrowserRedirect: true,
    },
  })

  if (error || !data.url) {
    return NextResponse.redirect(new URL("/login?error=auth", request.url))
  }

  const response = NextResponse.redirect(data.url)
  if (source) {
    response.cookies.set("oauth_source", source, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 300,
      path: "/",
    })
  }
  return response
}
