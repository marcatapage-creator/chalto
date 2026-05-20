import { createClient } from "@/lib/supabase/server"
import { getAuthUser } from "@/lib/supabase/queries"
import { notFound, redirect } from "next/navigation"
import { AdminDossierEditPageClient } from "./admin-dossier-edit-page-client"

export default async function AdminDossierEditPage({
  params,
}: {
  params: Promise<{ id: string; dossierId: string }>
}) {
  const { id, dossierId } = await params
  const user = await getAuthUser()
  if (!user) redirect("/login")
  const supabase = await createClient()

  const [{ data: project }, { data: dossier }] = await Promise.all([
    supabase.from("projects").select("id, name").eq("id", id).eq("user_id", user.id).single(),
    supabase.from("admin_dossiers").select("*").eq("id", dossierId).eq("project_id", id).single(),
  ])

  if (!project || !dossier) notFound()

  return <AdminDossierEditPageClient project={project} dossier={dossier} />
}
