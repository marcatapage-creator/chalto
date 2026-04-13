import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { ContributorSpace } from "@/components/invite/contributor-space"

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const supabase = await createClient()

  const { data: contributor } = await supabase
    .from("contributors")
    .select("*, projects(id, name, phase, profiles(full_name, company_name))")
    .eq("invite_token", token)
    .single()

  if (!contributor) notFound()

  const { data: tasks } = await supabase
    .from("tasks")
    .select("*")
    .eq("project_id", contributor.project_id)
    .eq("assigned_to", contributor.contact_id)
    .neq("status", "rejected")
    .order("created_at", { ascending: true })

  return <ContributorSpace contributor={contributor} tasks={tasks ?? []} />
}
