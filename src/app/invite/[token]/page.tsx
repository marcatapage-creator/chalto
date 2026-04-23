import { createAdminClient } from "@/lib/supabase/admin"
import { notFound } from "next/navigation"
import { ContributorSpace } from "@/components/invite/contributor-space"

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const admin = createAdminClient()

  const { data: contributor } = await admin
    .from("contributors")
    .select("*, projects(id, name, phase, user_id)")
    .eq("invite_token", token)
    .single()

  if (!contributor) notFound()

  const [{ data: tasks }, { data: proProfile }, { data: docContributors }] = await Promise.all([
    admin
      .from("tasks")
      .select("*")
      .eq("project_id", contributor.project_id)
      .eq("assigned_to", contributor.contact_id)
      .neq("status", "rejected")
      .order("created_at", { ascending: true }),
    admin
      .from("profiles")
      .select("full_name, company_name, logo_url, branding_enabled")
      .eq("id", contributor.projects?.user_id)
      .single(),
    admin
      .from("document_contributors")
      .select(
        "document_id, request_type, documents(id, name, type, status, file_url, file_name, file_type, created_at)"
      )
      .eq("contributor_id", contributor.id)
      .order("created_at", { ascending: false, referencedTable: "documents" }),
  ])

  const proName = proProfile?.full_name ?? proProfile?.company_name ?? "Votre professionnel"

  return (
    <ContributorSpace
      contributor={contributor}
      proName={proName}
      tasks={tasks ?? []}
      initialDocs={
        (docContributors ?? []) as unknown as Parameters<typeof ContributorSpace>[0]["initialDocs"]
      }
      logoUrl={proProfile?.branding_enabled ? (proProfile.logo_url ?? null) : null}
      companyName={proProfile?.company_name ?? null}
    />
  )
}
