import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { sendWelcomeEmail } from "@/lib/email"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/dashboard"

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
          const fullName = user.user_metadata?.full_name ?? user.user_metadata?.name ?? ""
          void sendWelcomeEmail({ email: user.email!, fullName })
          return NextResponse.redirect(`${origin}/onboarding`)
        }
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`)
}
