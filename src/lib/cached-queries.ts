import { unstable_cache } from "next/cache"
import { createAdminClient } from "@/lib/supabase/admin"

export const getProfessions = unstable_cache(
  async () => {
    const supabase = createAdminClient()
    const { data } = await supabase.from("professions").select("id, label, slug")
    return data ?? []
  },
  ["professions"],
  { revalidate: 3600 }
)
