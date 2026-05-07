import { createClient } from "@/lib/supabase/server"
import { getAuthUser } from "@/lib/supabase/queries"
import { getCachedProfile } from "@/lib/cached-queries"
import { notFound, redirect } from "next/navigation"
import type { Situation, AdminDossier } from "@/types/domain"
import { ProjectPageClient } from "@/components/projects/project-page-client"

export default async function ProjectPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ highlight?: string; tab?: string }>
}) {
  const [{ id }, { highlight, tab }] = await Promise.all([params, searchParams])
  const user = await getAuthUser()
  if (!user) redirect("/login")
  const supabase = await createClient()

  const [
    { data: project },
    { data: documents },
    { data: contacts },
    profile,
    { data: proView },
    { data: situations },
    { data: dossiers },
    { data: cloudLinks },
    { data: dropboxIntegration },
    { data: taskRows },
  ] = await Promise.all([
    supabase
      .from("projects")
      .select("*, professions(slug)")
      .eq("id", id)
      .eq("user_id", user.id)
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
      .eq("user_id", user.id)
      .order("name", { ascending: true }),
    getCachedProfile(user.id),
    supabase.from("pro_views").select("last_viewed_at").eq("project_id", id).maybeSingle(),
    supabase
      .from("situations")
      .select("*, contributor:contributors(name, contact_id), attachments:situation_attachments(*)")
      .eq("project_id", id)
      .order("submitted_at", { ascending: false })
      .limit(200),
    supabase
      .from("admin_dossiers")
      .select("*")
      .eq("project_id", id)
      .order("created_at", { ascending: true }),
    supabase
      .from("project_cloud_links")
      .select("id, provider, remote_path, last_synced_at, sync_enabled")
      .eq("project_id", id)
      .eq("user_id", user.id),
    supabase
      .from("user_integrations")
      .select("id")
      .eq("user_id", user.id)
      .eq("provider", "dropbox")
      .eq("status", "active")
      .maybeSingle(),
    supabase.from("tasks").select("id").eq("project_id", id),
  ])

  // Phase 2 : toutes les queries secondaires en parallèle (validations + unread counts)
  const docIds = (documents ?? []).map((d) => d.id)
  const taskIdList = (taskRows ?? []).map((t: { id: string }) => t.id)
  const lastViewed = proView?.last_viewed_at ?? null

  const [
    validationsResult,
    unreadDocsResult,
    unreadTasksResult,
    unreadDiscResult,
    unreadSituationsResult,
  ] = await Promise.all([
    docIds.length > 0
      ? supabase
          .from("validations")
          .select("document_id, status, comment, approved_at, client_name")
          .in("document_id", docIds)
          .order("created_at", { ascending: false })
          .limit(500)
      : Promise.resolve({
          data: [] as {
            document_id: string
            status: string
            comment: string | null
            approved_at: string | null
            client_name: string | null
          }[],
        }),
    lastViewed && docIds.length > 0
      ? supabase
          .from("validations")
          .select("*", { count: "exact", head: true })
          .in("document_id", docIds)
          .gt("created_at", lastViewed)
      : Promise.resolve({ count: 0 as number | null }),
    lastViewed && taskIdList.length > 0
      ? supabase
          .from("task_comments")
          .select("*", { count: "exact", head: true })
          .in("task_id", taskIdList)
          .eq("author_role", "prestataire")
          .gt("created_at", lastViewed)
      : Promise.resolve({ count: 0 as number | null }),
    lastViewed
      ? supabase
          .from("project_messages")
          .select("*", { count: "exact", head: true })
          .eq("project_id", id)
          .eq("author_role", "prestataire")
          .gt("created_at", lastViewed)
      : Promise.resolve({ count: 0 as number | null }),
    lastViewed
      ? supabase
          .from("situations")
          .select("*", { count: "exact", head: true })
          .eq("project_id", id)
          .gt("submitted_at", lastViewed)
      : Promise.resolve({ count: 0 as number | null }),
  ])

  const validationRows = validationsResult.data ?? []
  const unreadDocs = unreadDocsResult.count ?? 0
  const unreadTasks = unreadTasksResult.count ?? 0
  const unreadDiscussion = unreadDiscResult.count ?? 0
  const unreadSituations = unreadSituationsResult.count ?? 0

  const initialValidations: Record<
    string,
    { status: string; comment?: string | null; approved_at?: string; client_name?: string }
  > = {}
  for (const v of validationRows) {
    if (v.document_id && !initialValidations[v.document_id]) {
      initialValidations[v.document_id] = v
    }
  }

  if (!project) notFound()

  const authorName = profile?.full_name ?? profile?.email ?? "Pro"
  const professionSlug = (project.professions as unknown as { slug: string } | null)?.slug ?? null

  return (
    <ProjectPageClient
      project={project}
      documents={documents ?? []}
      contacts={contacts ?? []}
      userId={user.id}
      phase={project.phase ?? "cadrage"}
      authorName={authorName}
      professionSlug={professionSlug}
      initialHighlightId={highlight ?? (tab === "situations" ? "tab_situations" : null)}
      initialValidations={initialValidations}
      initialSituations={(situations ?? []) as unknown as Situation[]}
      initialDossiers={(dossiers ?? []) as unknown as AdminDossier[]}
      unreadDocs={unreadDocs}
      unreadTasks={unreadTasks}
      unreadDiscussion={unreadDiscussion}
      unreadSituations={unreadSituations}
      cloudLinks={cloudLinks ?? []}
      hasDropboxConnected={!!dropboxIntegration}
    />
  )
}
