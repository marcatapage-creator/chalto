import { createClient } from "@/lib/supabase/server"
import { sendWelcomeEmail } from "@/lib/email"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    const { fullName } = await request.json()

    await sendWelcomeEmail({ email: user.email!, fullName })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erreur send-welcome:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
