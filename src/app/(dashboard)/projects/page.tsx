import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getAuthUser } from "@/lib/supabase/queries"
import { DOCUMENT_STATUS } from "@/types"
import { ProjectsPageClient } from "@/components/projects/projects-page-client"
import type { ProjectWithCounts } from "@/components/projects/projects-list-client"

export default async function ProjectsPage() {
  const user = await getAuthUser()
  if (!user) redirect("/login")
  const supabase = await createClient()

  const { data } = await supabase
    .from("projects")
    .select("*, professions(slug, label)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  const allProjects = data ?? []
  const projectIds = allProjects.map((p) => p.id)

  const [
    { data: docRows },
    { data: taskRows },
    { data: contributorRows },
    { data: msgRows },
    { data: unreadRows },
  ] =
    projectIds.length > 0
      ? await Promise.all([
          supabase.from("documents").select("project_id, status").in("project_id", projectIds),
          supabase
            .from("tasks")
            .select("project_id, status")
            .in("project_id", projectIds)
            .limit(2000),
          supabase
            .from("contributors")
            .select("project_id")
            .in("project_id", projectIds)
            .limit(500),
          supabase
            .from("project_messages")
            .select("project_id")
            .in("project_id", projectIds)
            .limit(2000),
          supabase.rpc("get_projects_unread_counts"),
        ])
      : [{ data: [] }, { data: [] }, { data: [] }, { data: [] }, { data: [] }]

  const unreadMap = new Map<string, number>(
    (unreadRows ?? []).map((r: { project_id: string; unread_count: number }) => [
      r.project_id,
      r.unread_count,
    ])
  )

  const projects: ProjectWithCounts[] = allProjects.map((p) => {
    const profession = p.professions as unknown as { slug: string; label: string } | null
    return {
      id: p.id,
      name: p.name,
      client_name: p.client_name,
      address: p.address,
      status: p.status,
      phase: p.phase,
      created_at: p.created_at,
      professionSlug: profession?.slug ?? null,
      professionLabel: profession?.label ?? null,
      unreadCount: unreadMap.get(p.id) ?? 0,
      counts: {
        docs: docRows?.filter((d) => d.project_id === p.id).length ?? 0,
        pending:
          docRows?.filter((d) => d.project_id === p.id && d.status === DOCUMENT_STATUS.SENT)
            .length ?? 0,
        approved:
          docRows?.filter((d) => d.project_id === p.id && d.status === DOCUMENT_STATUS.APPROVED)
            .length ?? 0,
        tasks:
          taskRows?.filter(
            (t) => t.project_id === p.id && ["todo", "in_progress"].includes(t.status)
          ).length ?? 0,
        messages: msgRows?.filter((m) => m.project_id === p.id).length ?? 0,
        contributors: contributorRows?.filter((c) => c.project_id === p.id).length ?? 0,
      },
    }
  })

  projects.sort((a, b) => {
    const aIsArchi = a.professionSlug === "architecte" ? 0 : 1
    const bIsArchi = b.professionSlug === "architecte" ? 0 : 1
    return aIsArchi - bIsArchi
  })

  return <ProjectsPageClient projects={projects} />
}
