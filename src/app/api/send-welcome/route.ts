import { createClient } from "@/lib/supabase/server"
import { sendWelcomeEmail } from "@/lib/email"
import { NextResponse } from "next/server"
import { sendWelcomeSchema } from "@/lib/api-schemas"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    const parsed = sendWelcomeSchema.safeParse(await request.json())
    if (!parsed.success)
      return NextResponse.json({ error: "Paramètres invalides" }, { status: 400 })
    const { fullName } = parsed.data

    const { error: emailError } = await sendWelcomeEmail({ email: user.email!, fullName })
    if (emailError) {
      console.error("[send-welcome] Resend error:", emailError)
      return NextResponse.json({ error: "Erreur envoi email" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erreur send-welcome:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
