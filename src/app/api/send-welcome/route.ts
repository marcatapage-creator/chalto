import { sendWelcomeEmail } from "@/lib/email"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { email, fullName } = await request.json()

    await sendWelcomeEmail({ email, fullName })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erreur send-welcome:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
