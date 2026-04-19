import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { EditProjectForm } from "@/components/projects/edit-project-form"

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .eq("user_id", user!.id)
    .single()

  if (!project) notFound()

  return <EditProjectForm project={project} />
}
