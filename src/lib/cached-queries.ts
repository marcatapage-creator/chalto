import { unstable_cache } from "next/cache"
import { createClient } from "@/lib/supabase/server"

export const getProfessions = unstable_cache(
  async () => {
    const supabase = await createClient()
    const { data } = await supabase.from("professions").select("id, label, slug")
    return data ?? []
  },
  ["professions"],
  { revalidate: 3600 }
)
