import { createClient } from "@/lib/supabase/server"
import { getAuthUser } from "@/lib/supabase/queries"
import { notFound, redirect } from "next/navigation"
import { AdminDossierNewPageClient } from "./admin-dossier-new-page-client"

export default async function AdminDossierNewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await getAuthUser()
  if (!user) redirect("/login")
  const supabase = await createClient()

  const { data: project } = await supabase
    .from("projects")
    .select("id, name")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (!project) notFound()

  return <AdminDossierNewPageClient project={project} />
}
