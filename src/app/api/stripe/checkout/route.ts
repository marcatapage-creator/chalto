import { NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { z } from "zod"

const schema = z.object({
  plan: z.enum(["solo", "team"]),
})

const PRICE_IDS: Record<string, string | undefined> = {
  solo: process.env.STRIPE_PRICE_SOLO,
  team: process.env.STRIPE_PRICE_TEAM,
}

export async function POST(req: Request) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "Stripe non configuré" }, { status: 503 })
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 })

  const parsed = schema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: "Plan invalide" }, { status: 400 })
  const { plan } = parsed.data

  const priceId = PRICE_IDS[plan]
  if (!priceId) {
    return NextResponse.json({ error: `Price ID manquant pour le plan "${plan}"` }, { status: 503 })
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
  const admin = createAdminClient()

  // Récupère ou crée le Stripe Customer lié à ce user
  const { data: profile } = await admin
    .from("profiles")
    .select("stripe_customer_id, email, full_name")
    .eq("id", user.id)
    .single()

  let customerId = profile?.stripe_customer_id ?? null

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: profile?.email ?? user.email,
      name: profile?.full_name ?? undefined,
      metadata: { supabase_user_id: user.id },
    })
    customerId = customer.id
    await admin.from("profiles").update({ stripe_customer_id: customerId }).eq("id", user.id)
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/settings/billing?success=true&plan=${plan}`,
    cancel_url: `${appUrl}/settings/billing?canceled=true`,
    metadata: { supabase_user_id: user.id, plan },
    subscription_data: {
      metadata: { supabase_user_id: user.id, plan },
    },
    allow_promotion_codes: true,
    locale: "fr",
  })

  return NextResponse.json({ url: session.url })
}
