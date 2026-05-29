import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getAuthUser } from "@/lib/supabase/queries"
import { SettingsForm } from "@/components/settings/settings-form"
import { getProfessions } from "@/lib/cached-queries"

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{
    tab?: string
    error?: string
    success?: string
    canceled?: string
    plan?: string
  }>
}) {
  const user = await getAuthUser()
  if (!user) redirect("/login")
  const supabase = await createClient()

  const { tab, error, success, canceled, plan: successPlan } = await searchParams

  const [{ data: profile }, professions, { data: userProfessionsRows }, { data: integration }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("*, plan, professions!profession_id(id, label, slug)")
        .eq("id", user.id)
        .single(),
      getProfessions(),
      supabase
        .from("user_professions")
        .select("professions(id, label, slug)")
        .eq("user_id", user.id),
      supabase
        .from("user_integrations")
        .select("provider_account_email, connected_at, status")
        .eq("user_id", user.id)
        .eq("provider", "dropbox")
        .eq("status", "active")
        .maybeSingle(),
    ])

  type ProfRow = { id: string; label: string; slug: string }
  const userProfessions = (userProfessionsRows ?? [])
    .map((r) => r.professions as unknown as ProfRow | null)
    .filter((p): p is ProfRow => p !== null)

  return (
    <div className="flex-1 overflow-auto">
      <div
        aria-hidden
        className="pointer-events-none sticky top-0 z-10 h-20.5 -mb-20.5 bg-linear-to-b from-neutral-50/40 dark:from-background/40 to-transparent"
      />
      <div className="p-6 md:p-8 max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Paramètres</h1>
          <p className="text-muted-foreground">Gérez votre profil et vos préférences</p>
        </div>
        <SettingsForm
          profile={profile}
          professions={professions}
          userProfessions={userProfessions}
          defaultTab={tab}
          dropboxIntegration={integration}
          integrationError={error}
          plan={profile?.plan ?? "free"}
          successPlan={success === "true" ? (successPlan ?? null) : null}
          canceled={canceled === "true"}
          notifProfile={{
            id: profile?.id ?? "",
            notif_email_approved: profile?.notif_email_approved !== false,
            notif_email_rejected: profile?.notif_email_rejected !== false,
            notif_email_message: profile?.notif_email_message !== false,
            notif_email_task: profile?.notif_email_task !== false,
            notif_email_frequency: profile?.notif_email_frequency ?? "immediate",
            notif_inapp_enabled: profile?.notif_inapp_enabled !== false,
          }}
          brandingProfile={{
            id: profile?.id ?? "",
            logo_url: profile?.logo_url ?? null,
            company_name: profile?.company_name ?? null,
            branding_enabled: profile?.branding_enabled ?? false,
          }}
        />
      </div>
      <div className="pointer-events-none sticky bottom-0 h-62.5 bg-linear-to-t from-neutral-50/80 dark:from-background/80 to-transparent" />
    </div>
  )
}
