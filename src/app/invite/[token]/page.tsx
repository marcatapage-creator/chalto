import { createAdminClient } from "@/lib/supabase/admin"
import { notFound } from "next/navigation"
import { ContributorSpace } from "@/components/invite/contributor-space"

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const admin = createAdminClient()

  const { data: contributor } = await admin
    .from("contributors")
    .select("*, projects(id, name, phase)")
    .eq("invite_token", token)
    .single()

  if (!contributor) notFound()

  const { data: tasks } = await admin
    .from("tasks")
    .select("*")
    .eq("project_id", contributor.project_id)
    .eq("assigned_to", contributor.contact_id)
    .neq("status", "rejected")
    .order("created_at", { ascending: true })

  return <ContributorSpace contributor={contributor} tasks={tasks ?? []} />
}
