import { createClient } from "@/lib/supabase/server"
import { sendWaitlistConfirmationEmail } from "@/lib/email"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { email, name, profession } = await request.json()
    const supabase = await createClient()

    const { error } = await supabase.from("waitlist").insert({
      email,
      name: name || null,
      profession: profession || null,
    })

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: "already_registered" }, { status: 409 })
      }
      return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
    }

    await sendWaitlistConfirmationEmail({ email, name })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erreur waitlist:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
