import { createClient } from "@/lib/supabase/server"
import { getAuthUser } from "@/lib/supabase/queries"
import { notFound, redirect } from "next/navigation"
import { getProfessions } from "@/lib/cached-queries"
import { ContactEditPageClient } from "./contact-edit-page-client"

export default async function ContactEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await getAuthUser()
  if (!user) redirect("/login")
  const supabase = await createClient()

  const [{ data: contact }, professions] = await Promise.all([
    supabase
      .from("contacts")
      .select("id, name, email, phone, company_name, profession_id, notes")
      .eq("id", id)
      .eq("user_id", user.id)
      .single(),
    getProfessions(),
  ])

  if (!contact) notFound()

  return <ContactEditPageClient contact={contact} professions={professions} />
}
