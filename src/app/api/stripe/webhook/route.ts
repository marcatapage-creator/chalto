import { NextResponse } from "next/server"
import Stripe from "stripe"
import { createAdminClient } from "@/lib/supabase/admin"
import { revalidateTag } from "next/cache"
import type { Plan } from "@/types/index"

// Désactive le body parsing Next.js — Stripe a besoin du raw body pour vérifier la signature
export const config = { api: { bodyParser: false } }

function planFromMetadata(metadata: Stripe.Metadata): Plan {
  const plan = metadata?.plan
  if (plan === "solo" || plan === "team") return plan
  return "free"
}

export async function POST(req: Request) {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Stripe non configuré" }, { status: 503 })
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
  const signature = req.headers.get("stripe-signature")
  if (!signature) return NextResponse.json({ error: "Signature manquante" }, { status: 400 })

  let event: Stripe.Event
  try {
    const rawBody = await req.text()
    event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET)
  } catch {
    return NextResponse.json({ error: "Signature invalide" }, { status: 400 })
  }

  const admin = createAdminClient()

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.metadata?.supabase_user_id
      const plan = planFromMetadata(session.metadata ?? {})
      if (!userId) break

      await admin.from("profiles").update({ plan }).eq("id", userId)
      revalidateTag(`profile:${userId}`, "default")
      break
    }

    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription
      const userId = sub.metadata?.supabase_user_id
      if (!userId) break

      const plan = planFromMetadata(sub.metadata)
      const isActive = sub.status === "active" || sub.status === "trialing"
      await admin
        .from("profiles")
        .update({ plan: isActive ? plan : ("free" as Plan) })
        .eq("id", userId)
      revalidateTag(`profile:${userId}`, "default")
      break
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription
      const userId = sub.metadata?.supabase_user_id
      if (!userId) break

      await admin
        .from("profiles")
        .update({ plan: "free" as Plan })
        .eq("id", userId)
      revalidateTag(`profile:${userId}`, "default")
      break
    }
  }

  return NextResponse.json({ received: true })
}
