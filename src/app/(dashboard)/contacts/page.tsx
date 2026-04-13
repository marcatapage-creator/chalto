import { createClient } from "@/lib/supabase/server"
import { FadeIn } from "@/components/ui/motion"
import { ContactsList } from "@/components/contacts/contacts-list"

export default async function ContactsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: contacts } = await supabase
    .from("contacts")
    .select("*, professions(label, slug)")
    .eq("user_id", user!.id)
    .order("name", { ascending: true })

  const { data: professions } = await supabase.from("professions").select("id, label, slug")

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-6 md:p-8 space-y-6">
        <FadeIn>
          <h1 className="text-2xl font-bold tracking-tight">Annuaire</h1>
          <p className="text-muted-foreground">Vos prestataires et partenaires</p>
        </FadeIn>
        <ContactsList contacts={contacts ?? []} professions={professions ?? []} userId={user!.id} />
      </div>
    </div>
  )
}
