import { getAuthUser } from "@/lib/supabase/queries"
import { redirect } from "next/navigation"
import { getProfessions } from "@/lib/cached-queries"
import { ContactNewPageClient } from "./contact-new-page-client"

export default async function ContactNewPage() {
  const user = await getAuthUser()
  if (!user) redirect("/login")
  const professions = await getProfessions()

  return <ContactNewPageClient professions={professions} userId={user.id} />
}
