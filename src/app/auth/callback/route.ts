import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { sendWelcomeEmail } from "@/lib/email"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/dashboard"
  const source = searchParams.get("source")

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

        console.log(
          "[auth/callback] user:",
          user.id,
          "source:",
          source,
          "profession_id:",
          profile?.profession_id
        )

        if (!profile?.profession_id) {
          if (source === "login") {
            await supabase.auth.signOut()
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
