import { createClient } from "@/lib/supabase/server"
import { DOCUMENT_STATUS } from "@/types"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FolderOpen, Plus } from "lucide-react"
import { FadeIn, StaggerList, StaggerItem } from "@/components/ui/motion"
import Link from "next/link"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { DashboardUrgences } from "@/components/dashboard/dashboard-urgences"
import { OnboardingChecklist } from "@/components/dashboard/onboarding-checklist"
import { ProjectCard, type ProjectWithCounts } from "@/components/projects/projects-list-client"

function RecentProjects({ projects }: { projects: ProjectWithCounts[] }) {
  // Grouper par profession, 5 projets max par groupe
  const seen = new Map<string, { label: string; items: ProjectWithCounts[] }>()
  for (const p of projects) {
    const key = p.professionSlug ?? ""
    if (!seen.has(key)) seen.set(key, { label: p.professionLabel ?? "Autres", items: [] })
    const group = seen.get(key)!
    if (group.items.length < 2) group.items.push(p)
  }
  const groups = [...seen.values()]

  return (
    <FadeIn delay={0.2}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Projets récents</h2>
        <Link
          href="/projects"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Voir tout
        </Link>
      </div>

      {groups.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <FolderOpen className="h-8 w-8 text-muted-foreground mb-3" />
            <p className="font-medium">Aucun projet pour l&apos;instant</p>
            <p className="text-sm text-muted-foreground mt-1">
              Créez votre premier projet pour commencer
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {groups.map((group) => (
            <div key={group.label}>
              {groups.length > 1 && (
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                  {group.label}
                </h3>
              )}
              <StaggerList className="space-y-3">
                {group.items.map((p) => (
                  <StaggerItem key={p.id}>
                    <ProjectCard project={p} compact />
                  </StaggerItem>
                ))}
                {groups.length === 1 && projects.length < 2 && (
                  <StaggerItem>
                    <Link href="/projects/new">
                      <Card className="cursor-pointer border-dashed hover:border-primary/50 hover:bg-muted/30 transition-colors duration-150">
                        <CardContent className="flex items-center gap-3 p-4 text-muted-foreground">
                          <Plus className="h-4 w-4 shrink-0" />
                          <p className="text-sm">Nouveau projet</p>
                        </CardContent>
                      </Card>
                    </Link>
                  </StaggerItem>
                )}
              </StaggerList>
            </div>
          ))}
        </div>
      )}
    </FadeIn>
  )
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const [{ data: projects }, { data: profile }] = await Promise.all([
    supabase
      .from("projects")
      .select("id, status, name, client_name, phase, created_at, professions(slug, label)")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false })
      .limit(100),
    supabase
      .from("profiles")
      .select("demo_project_id, onboarding_completed")
      .eq("id", user!.id)
      .single(),
  ])

  projects?.sort((a, b) => {
    const aIsArchi =
      (a.professions as unknown as { slug: string } | null)?.slug === "architecte" ? 0 : 1
    const bIsArchi =
      (b.professions as unknown as { slug: string } | null)?.slug === "architecte" ? 0 : 1
    return aIsArchi - bIsArchi
  })

  const projectIds = projects?.map((p) => p.id) ?? []
  const [{ data: documents }, { count: documentSentCount }, { data: unreadRows }] =
    await Promise.all([
      projectIds.length > 0
        ? supabase.from("documents").select("project_id, status").in("project_id", projectIds)
        : Promise.resolve({ data: [] as { project_id: string; status: string }[] }),
      projectIds.length > 0
        ? supabase
            .from("documents")
            .select("*", { count: "exact", head: true })
            .in("project_id", projectIds)
            .in("status", ["sent", "approved", "rejected"])
        : Promise.resolve({ count: 0 }),
      supabase.rpc("get_projects_unread_counts"),
    ])

  const unreadMap = new Map<string, number>(
    (unreadRows ?? []).map((r: { project_id: string; unread_count: number }) => [
      r.project_id,
      r.unread_count,
    ])
  )

  const projectsWithCounts: ProjectWithCounts[] = (projects ?? []).map((p) => {
    const prof = p.professions as unknown as { slug: string; label: string } | null
    const docs = documents?.filter((d) => d.project_id === p.id) ?? []
    return {
      id: p.id,
      name: p.name,
      client_name: p.client_name,
      status: p.status,
      phase: p.phase ?? null,
      created_at: p.created_at,
      professionSlug: prof?.slug ?? null,
      professionLabel: prof?.label ?? null,
      unreadCount: unreadMap.get(p.id) ?? 0,
      counts: {
        docs: docs.length,
        pending: docs.filter((d) => d.status === DOCUMENT_STATUS.SENT).length,
        approved: docs.filter((d) => d.status === DOCUMENT_STATUS.APPROVED).length,
        tasks: 0,
        messages: 0,
        contributors: 0,
      },
    }
  })

  const initialCounts = {
    activeProjects: projects?.filter((p) => p.status === "active").length ?? 0,
    totalDocs: documents?.length ?? 0,
    approved: documents?.filter((d) => d.status === DOCUMENT_STATUS.APPROVED).length ?? 0,
    pending: documents?.filter((d) => d.status === DOCUMENT_STATUS.SENT).length ?? 0,
  }

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-6 md:p-8 space-y-8">
        <FadeIn className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Tableau de bord</h1>
            <p className="text-muted-foreground">Vue d&apos;ensemble de votre activité</p>
          </div>
          <Button asChild>
            <Link href="/projects/new">
              <Plus className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Nouveau projet</span>
            </Link>
          </Button>
        </FadeIn>

        <DashboardStats userId={user!.id} initialCounts={initialCounts} />

        <DashboardUrgences projectIds={projectIds} />

        {!profile?.onboarding_completed && (
          <OnboardingChecklist
            userId={user!.id}
            demoProjectId={profile?.demo_project_id}
            documentSentCount={documentSentCount ?? 0}
            onboardingCompleted={profile?.onboarding_completed ?? false}
          />
        )}

        <RecentProjects projects={projectsWithCounts} />
      </div>
    </div>
  )
}
