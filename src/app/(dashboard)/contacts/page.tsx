import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getAuthUser } from "@/lib/supabase/queries"
import { ContactsList } from "@/components/contacts/contacts-list"
import { getProfessions } from "@/lib/cached-queries"

export default async function ContactsPage() {
  const user = await getAuthUser()
  if (!user) redirect("/login")
  const supabase = await createClient()

  const [{ data: contacts }, professions] = await Promise.all([
    supabase
      .from("contacts")
      .select("*, professions(label, slug)")
      .eq("user_id", user.id)
      .order("name", { ascending: true }),
    getProfessions(),
  ])

  return (
    <div className="flex-1 overflow-auto">
      <div
        aria-hidden
        className="pointer-events-none sticky top-0 z-10 h-20.5 -mb-20.5 bg-linear-to-b from-neutral-50/50 dark:from-background/50 to-transparent"
      />
      <div className="p-6 md:p-8">
        <ContactsList contacts={contacts ?? []} professions={professions} userId={user.id} />
      </div>
    </div>
  )
}
