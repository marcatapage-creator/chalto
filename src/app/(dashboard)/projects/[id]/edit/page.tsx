import { createClient } from "@/lib/supabase/server"
import { getAuthUser } from "@/lib/supabase/queries"
import { notFound } from "next/navigation"
import { EditProjectForm } from "@/components/projects/edit-project-form"

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const user = await getAuthUser()

  const [{ data: project }, { data: profile }] = await Promise.all([
    supabase.from("projects").select("*").eq("id", id).eq("user_id", user!.id).single(),
    supabase.from("profiles").select("professions!profession_id(slug)").eq("id", user!.id).single(),
  ])

  if (!project) notFound()

  const professionSlug = (profile?.professions as unknown as { slug: string } | null)?.slug ?? null

  return <EditProjectForm project={project} professionSlug={professionSlug} />
}
