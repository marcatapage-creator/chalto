import { createClient } from "@/lib/supabase/server"
import { getAuthUser } from "@/lib/supabase/queries"
import { notFound, redirect } from "next/navigation"
import { SendPageClient } from "./send-page-client"
import { isChantierPhase } from "@/lib/utils"

export default async function SendDocumentPage({
  params,
}: {
  params: Promise<{ id: string; docId: string }>
}) {
  const { id, docId } = await params
  const user = await getAuthUser()
  if (!user) redirect("/login")

  const supabase = await createClient()

  const [{ data: document }, { data: project }] = await Promise.all([
    supabase
      .from("documents")
      .select("id, name, status, file_url, project_id, cloud_file_id, audience")
      .eq("id", docId)
      .eq("project_id", id)
      .single(),
    supabase
      .from("projects")
      .select("id, client_name, phase")
      .eq("id", id)
      .eq("user_id", user.id)
      .single(),
  ])

  if (!document || !project) notFound()

  return (
    <SendPageClient
      document={document}
      projectId={id}
      clientName={project.client_name ?? undefined}
      isChantier={isChantierPhase(project.phase ?? "cadrage")}
    />
  )
}
