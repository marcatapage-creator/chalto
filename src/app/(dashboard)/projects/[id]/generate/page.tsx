import { createClient } from "@/lib/supabase/server"
import { getAuthUser } from "@/lib/supabase/queries"
import { notFound, redirect } from "next/navigation"
import { GeneratePageClient } from "./generate-page-client"

export default async function GenerateDocumentPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const user = await getAuthUser()
  if (!user) redirect("/login")

  const supabase = await createClient()

  const { data: project } = await supabase
    .from("projects")
    .select("id, name, work_type, client_name, professions(slug)")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (!project) notFound()

  const professionSlug = (project.professions as unknown as { slug: string } | null)?.slug ?? null

  return (
    <GeneratePageClient
      projectId={project.id}
      projectName={project.name}
      workType={project.work_type ?? ""}
      clientName={project.client_name ?? undefined}
      professionSlug={professionSlug}
    />
  )
}
