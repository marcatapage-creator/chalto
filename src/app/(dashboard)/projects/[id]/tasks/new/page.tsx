import { createClient } from "@/lib/supabase/server"
import { getAuthUser } from "@/lib/supabase/queries"
import { notFound, redirect } from "next/navigation"
import { TaskNewPageClient } from "./task-new-page-client"

export default async function TaskNewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await getAuthUser()
  if (!user) redirect("/login")
  const supabase = await createClient()

  const [{ data: project }, { data: contacts }] = await Promise.all([
    supabase.from("projects").select("id, name").eq("id", id).eq("user_id", user.id).single(),
    supabase
      .from("contacts")
      .select("id, name, professions(label)")
      .eq("user_id", user.id)
      .order("name"),
  ])

  if (!project) notFound()

  const typedContacts = (contacts ?? []).map((c) => ({
    id: c.id as string,
    name: c.name as string,
    professions: Array.isArray(c.professions) ? (c.professions[0] ?? null) : null,
  }))

  return <TaskNewPageClient project={project} contacts={typedContacts} userId={user.id} />
}
