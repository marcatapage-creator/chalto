import { createClient } from "@/lib/supabase/server"
import { getAuthUser } from "@/lib/supabase/queries"
import { ContactsList } from "@/components/contacts/contacts-list"
import { getProfessions } from "@/lib/cached-queries"

export default async function ContactsPage() {
  const user = await getAuthUser()
  const supabase = await createClient()

  const [{ data: contacts }, professions] = await Promise.all([
    supabase
      .from("contacts")
      .select("*, professions(label, slug)")
      .eq("user_id", user!.id)
      .order("name", { ascending: true }),
    getProfessions(),
  ])

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-6 md:p-8">
        <ContactsList contacts={contacts ?? []} professions={professions} userId={user!.id} />
      </div>
    </div>
  )
}
