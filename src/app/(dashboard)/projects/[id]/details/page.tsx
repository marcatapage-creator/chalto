import { createClient } from "@/lib/supabase/server"
import { getAuthUser } from "@/lib/supabase/queries"
import { notFound, redirect } from "next/navigation"
import { DetailsPageClient } from "./details-page-client"

export default async function ProjectDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await getAuthUser()
  if (!user) redirect("/login")

  const supabase = await createClient()

  const { data: project } = await supabase
    .from("projects")
    .select(
      "id, name, phase, client_name, client_email, address, description, work_type, budget_range, deadline, constraints"
    )
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (!project) notFound()

  return <DetailsPageClient project={project} />
}
