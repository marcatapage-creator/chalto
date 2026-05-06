import { cache } from "react"
import { createClient } from "@/lib/supabase/server"
import { getCachedProfile } from "@/lib/cached-queries"

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
 * Retourne le profil complet.
 * React cache() déduplique dans le même render tree ; unstable_cache persiste 60s entre les requêtes.
 */
export const getProfile = cache(async (userId: string) => {
  return getCachedProfile(userId)
})
