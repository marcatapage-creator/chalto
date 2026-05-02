import { cache } from "react"
import { createClient } from "@/lib/supabase/server"

/**
 * Retourne l'utilisateur authentifié courant.
 * React cache() déduplique les appels dans le même render tree (layout + page = 1 seul appel Supabase).
 */
export const getAuthUser = cache(async () => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
})

/**
 * Retourne le profil complet. Dédupliqué par React cache() dans le même request.
 * On sélectionne un sur-ensemble des champs utilisés dans le layout, la page projet et la page dashboard.
 */
export const getProfile = cache(async (userId: string) => {
  const supabase = await createClient()
  const { data } = await supabase
    .from("profiles")
    .select(
      "full_name, email, logo_url, company_name, branding_enabled, professions!profession_id(slug)"
    )
    .eq("id", userId)
    .single()
  return data
})
