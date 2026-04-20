import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse, type NextRequest } from "next/server"
import { sendWelcomeEmail } from "@/lib/email"

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/dashboard"
  const source = searchParams.get("source") ?? request.cookies.get("oauth_source")?.value ?? null

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("profession_id")
          .eq("id", user.id)
          .single()

        if (!profile?.profession_id) {
          if (source === "login") {
            await createAdminClient()
              .auth.admin.deleteUser(user.id)
              .catch(() => null)
            return NextResponse.redirect(`${origin}/login?error=no_account`)
          }
          const fullName = user.user_metadata?.full_name ?? user.user_metadata?.name ?? ""
          await sendWelcomeEmail({ email: user.email!, fullName }).catch(() => null)
          return NextResponse.redirect(`${origin}/onboarding`)
        }
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`)
}
