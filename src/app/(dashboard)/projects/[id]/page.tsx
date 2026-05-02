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

  const [
    { data: project },
    { data: documents },
    { data: contacts },
    { data: profile },
    { data: proView },
  ] = await Promise.all([
    supabase
      .from("projects")
      .select("*, professions(slug)")
      .eq("id", id)
      .eq("user_id", user!.id)
      .single(),
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
    supabase.from("pro_views").select("last_viewed_at").eq("project_id", id).maybeSingle(),
  ])

  const docIds = (documents ?? []).map((d) => d.id)
  const { data: validationRows } = docIds.length
    ? await supabase
        .from("validations")
        .select("document_id, status, comment, approved_at, client_name")
        .in("document_id", docIds)
        .order("created_at", { ascending: false })
        .limit(500)
    : { data: [] }

  const initialValidations: Record<
    string,
    { status: string; comment?: string | null; approved_at?: string; client_name?: string }
  > = {}
  for (const v of validationRows ?? []) {
    if (v.document_id && !initialValidations[v.document_id]) {
      initialValidations[v.document_id] = v
    }
  }

  if (!project) notFound()

  let unreadDocs = 0
  let unreadTasks = 0
  let unreadDiscussion = 0

  if (proView?.last_viewed_at) {
    const lastViewed = proView.last_viewed_at
    const docIds = (documents ?? []).map((d) => d.id)

    const [validationResult, taskIdsResult, discussionResult] = await Promise.all([
      docIds.length > 0
        ? supabase
            .from("validations")
            .select("*", { count: "exact", head: true })
            .in("document_id", docIds)
            .gt("created_at", lastViewed)
        : Promise.resolve({ count: 0 }),
      supabase.from("tasks").select("id").eq("project_id", id),
      supabase
        .from("project_messages")
        .select("*", { count: "exact", head: true })
        .eq("project_id", id)
        .eq("author_role", "prestataire")
        .gt("created_at", lastViewed),
    ])

    unreadDocs = validationResult.count ?? 0
    unreadDiscussion = discussionResult.count ?? 0

    const taskIdList = (taskIdsResult.data ?? []).map((t: { id: string }) => t.id)
    if (taskIdList.length > 0) {
      const { count } = await supabase
        .from("task_comments")
        .select("*", { count: "exact", head: true })
        .in("task_id", taskIdList)
        .eq("author_role", "prestataire")
        .gt("created_at", lastViewed)
      unreadTasks = count ?? 0
    }
  }

  const authorName = profile?.full_name ?? profile?.email ?? "Pro"
  const professionSlug = (project.professions as unknown as { slug: string } | null)?.slug ?? null

  return (
    <ProjectPageClient
      project={project}
      documents={documents ?? []}
      contacts={contacts ?? []}
      userId={user!.id}
      phase={project.phase ?? "cadrage"}
      authorName={authorName}
      professionSlug={professionSlug}
      initialHighlightId={highlight ?? null}
      initialValidations={initialValidations}
      unreadDocs={unreadDocs}
      unreadTasks={unreadTasks}
      unreadDiscussion={unreadDiscussion}
    />
  )
}
