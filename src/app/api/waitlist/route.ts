import { createClient } from "@/lib/supabase/server"
import { sendWaitlistConfirmationEmail } from "@/lib/email"
import { NextResponse } from "next/server"
import { waitlistSchema } from "@/lib/api-schemas"

export async function POST(request: Request) {
  try {
    const parsed = waitlistSchema.safeParse(await request.json())
    if (!parsed.success)
      return NextResponse.json({ error: "Paramètres invalides" }, { status: 400 })
    const { email, name, profession } = parsed.data
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

    void sendWaitlistConfirmationEmail({ email, name }).catch((err) =>
      console.error("[waitlist] email error:", err)
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erreur waitlist:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
