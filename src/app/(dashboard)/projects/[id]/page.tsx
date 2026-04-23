import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { ProjectPageClient } from "@/components/projects/project-page-client"

export default async function ProjectPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ highlight?: string }>
}) {
  const [{ id }, { highlight }] = await Promise.all([params, searchParams])
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const [{ data: project }, { data: documents }, { data: contacts }, { data: profile }] =
    await Promise.all([
      supabase.from("projects").select("*").eq("id", id).eq("user_id", user!.id).single(),
      supabase
        .from("documents")
        .select("*")
        .eq("project_id", id)
        .order("created_at", { ascending: false })
        .limit(200),
      supabase
        .from("contacts")
        .select("id, name, professions(label)")
        .eq("user_id", user!.id)
        .order("name", { ascending: true }),
      supabase.from("profiles").select("full_name, email").eq("id", user!.id).single(),
    ])

  if (!project) notFound()

  const authorName = profile?.full_name ?? profile?.email ?? "Pro"

  return (
    <ProjectPageClient
      project={project}
      documents={documents ?? []}
      contacts={contacts ?? []}
      userId={user!.id}
      phase={project.phase ?? "cadrage"}
      authorName={authorName}
      initialHighlightId={highlight ?? null}
    />
  )
}
