import { redirect } from "next/navigation"

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; canceled?: string; plan?: string }>
}) {
  const { success, canceled, plan } = await searchParams

  if (success === "true" && plan) {
    redirect(`/settings?tab=compte&success=true&plan=${plan}`)
  }
  if (canceled === "true") {
    redirect(`/settings?tab=compte&canceled=true`)
  }

  redirect("/settings?tab=compte")
}
