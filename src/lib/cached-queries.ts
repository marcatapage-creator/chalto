import { unstable_cache } from "next/cache"
import { createAdminClient } from "@/lib/supabase/admin"

/**
 * Profil utilisateur mis en cache 60s par user_id.
 * Utilise le client admin (service role) car unstable_cache s'exécute hors contexte de requête.
 * Champs : superset de ce qu'utilisent layout, project page et project edit page.
 */
export const getCachedProfile = (userId: string) =>
  unstable_cache(
    async () => {
      const supabase = createAdminClient()
      const { data } = await supabase
        .from("profiles")
        .select(
          "full_name, email, logo_url, company_name, branding_enabled, plan, professions!profession_id(slug)"
        )
        .eq("id", userId)
        .single()
      return data
    },
    [`profile-${userId}`],
    { revalidate: 60, tags: [`profile:${userId}`] }
  )()

export const getProfessions = unstable_cache(
  async () => {
    const supabase = createAdminClient()
    const { data } = await supabase.from("professions").select("id, label, slug")
    return data ?? []
  },
  ["professions"],
  { revalidate: 300 }
)
