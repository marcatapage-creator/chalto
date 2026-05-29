import { redirect } from "next/navigation"
import { getAuthUser } from "@/lib/supabase/queries"
import { createAdminClient } from "@/lib/supabase/admin"
import { BillingClient } from "./billing-client"

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; canceled?: string; plan?: string }>
}) {
  const user = await getAuthUser()
  if (!user) redirect("/login")

  const { success, canceled, plan } = await searchParams

  const admin = createAdminClient()

  const { data: profile } = await admin
    .from("profiles")
    .select("plan, stripe_customer_id, email, full_name")
    .eq("id", user.id)
    .single()

  // Récupère les détails de l'abonnement Stripe si l'user est payant
  let renewalDate: string | null = null
  let subscriptionStatus: string | null = null

  if (profile?.stripe_customer_id && profile?.plan !== "free") {
    try {
      const Stripe = (await import("stripe")).default
      if (process.env.STRIPE_SECRET_KEY) {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
        const subscriptions = await stripe.subscriptions.list({
          customer: profile.stripe_customer_id,
          status: "active",
          limit: 1,
        })
        const sub = subscriptions.data[0]
        if (sub) {
          const periodEnd = sub.items?.data[0]?.current_period_end
          if (periodEnd) {
            renewalDate = new Date(periodEnd * 1000).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })
          }
          subscriptionStatus = sub.status
        }
      }
    } catch {
      // Ne pas bloquer le rendu si Stripe est indisponible
    }
  }

  return (
    <BillingClient
      plan={(profile?.plan ?? "free") as string}
      renewalDate={renewalDate}
      subscriptionStatus={subscriptionStatus}
      hasStripeCustomer={!!profile?.stripe_customer_id}
      successPlan={success === "true" ? (plan ?? null) : null}
      canceled={canceled === "true"}
    />
  )
}
