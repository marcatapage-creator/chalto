import { createAdminClient } from "@/lib/supabase/admin"
import { ContributorSpace } from "@/components/invite/contributor-space"
import { Button } from "@/components/ui/button"
import Image from "next/image"

function TokenInvalid({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <Image src="/Logo.svg" alt="Chalto" width={48} height={48} />
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-bold">Lien invalide</h1>
          <p className="text-muted-foreground text-sm">{message}</p>
        </div>
        <Button variant="outline" asChild>
          <a href="https://chalto.fr">Retour à l&apos;accueil</a>
        </Button>
      </div>
    </div>
  )
}

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const admin = createAdminClient()

  const { data: contributor } = await admin
    .from("contributors")
    .select("*, projects(id, name, phase, user_id)")
    .eq("invite_token", token)
    .single()

  if (!contributor) {
    return <TokenInvalid message="Ce lien d'invitation est invalide." />
  }

  if (contributor.invite_expires_at && new Date(contributor.invite_expires_at) < new Date()) {
    return <TokenInvalid message="Ce lien d'invitation a expiré. Contactez votre professionnel." />
  }

  const taskIds = await admin
    .from("tasks")
    .select("id")
    .eq("project_id", contributor.project_id)
    .eq("assigned_to", contributor.contact_id)
    .neq("status", "rejected")
    .then(({ data }) => data?.map((t) => t.id) ?? [])

  const [{ data: tasks }, { data: proProfile }, { data: docContributors }, { data: taskComments }] =
    await Promise.all([
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
          "document_id, request_type, pro_message, documents(id, name, type, status, file_url, file_name, file_type, created_at)"
        )
        .eq("contributor_id", contributor.id)
        .order("created_at", { ascending: false }),
      taskIds.length > 0
        ? admin
            .from("task_comments")
            .select("*")
            .in("task_id", taskIds)
            .order("created_at", { ascending: true })
        : Promise.resolve({ data: [] }),
    ])

  const commentsByTaskId = (taskComments ?? []).reduce<Record<string, typeof taskComments>>(
    (acc, c) => {
      if (!c) return acc
      const key = (c as { task_id: string }).task_id
      acc[key] = [...(acc[key] ?? []), c]
      return acc
    },
    {}
  )

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
      initialTaskComments={
        commentsByTaskId as Record<
          string,
          {
            id: string
            author_name: string
            author_role: "pro" | "prestataire"
            content: string
            created_at: string
          }[]
        >
      }
    />
  )
}
