import { createClient } from "@/lib/supabase/server"
import { getAuthUser } from "@/lib/supabase/queries"
import { SettingsForm } from "@/components/settings/settings-form"
import { FadeIn } from "@/components/ui/motion"
import { getProfessions } from "@/lib/cached-queries"

export default async function SettingsPage() {
  const user = await getAuthUser()
  const supabase = await createClient()

  const [{ data: profile }, professions, { data: userProfessionsRows }] = await Promise.all([
    supabase
      .from("profiles")
      .select("*, professions!profession_id(id, label, slug)")
      .eq("id", user!.id)
      .single(),
    getProfessions(),
    supabase
      .from("user_professions")
      .select("professions(id, label, slug)")
      .eq("user_id", user!.id),
  ])

  type ProfRow = { id: string; label: string; slug: string }
  const userProfessions = (userProfessionsRows ?? [])
    .map((r) => r.professions as unknown as ProfRow | null)
    .filter((p): p is ProfRow => p !== null)

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-6 md:p-8 max-w-2xl space-y-6">
        <FadeIn>
          <h1 className="text-2xl font-bold tracking-tight">Paramètres</h1>
          <p className="text-muted-foreground">Gérez votre profil et vos préférences</p>
        </FadeIn>
        <SettingsForm
          profile={profile}
          professions={professions}
          userProfessions={userProfessions}
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
    </div>
  )
}
