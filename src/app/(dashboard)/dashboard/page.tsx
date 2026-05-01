import { createClient } from "@/lib/supabase/server"
import { DOCUMENT_STATUS } from "@/types"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FolderOpen, Plus } from "lucide-react"
import { FadeIn, StaggerList, StaggerItem } from "@/components/ui/motion"
import Link from "next/link"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { DashboardUrgences } from "@/components/dashboard/dashboard-urgences"
import { OnboardingChecklist } from "@/components/dashboard/onboarding-checklist"

type RecentProject = {
  id: string
  name: string
  client_name: string | null
  status: string
  professions: unknown
}

const statusConfig: Record<
  string,
  { label: string; variant: "default" | "secondary" | "outline" }
> = {
  active: { label: "En cours", variant: "default" },
  completed: { label: "Terminé", variant: "secondary" },
  draft: { label: "Brouillon", variant: "outline" },
  archived: { label: "Archivé", variant: "outline" },
}

function ProjectRow({ project }: { project: RecentProject }) {
  const s = statusConfig[project.status] ?? statusConfig.draft
  return (
    <StaggerItem>
      <Link href={`/projects/${project.id}`}>
        <Card className="cursor-pointer transition-all duration-150 hover:shadow-sm hover:bg-muted/50">
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium text-sm">{project.name}</p>
                <p className="text-xs text-muted-foreground">
                  {project.client_name || "Pas de client"}
                </p>
              </div>
            </div>
            <Badge variant={s.variant}>{s.label}</Badge>
          </CardContent>
        </Card>
      </Link>
    </StaggerItem>
  )
}

function RecentProjects({ projects }: { projects: RecentProject[] }) {
  const recent = projects.slice(0, 5)

  // Détermine si plusieurs professions sont présentes
  const professionSlugs = new Set(
    recent.map((p) => (p.professions as { slug: string } | null)?.slug ?? "")
  )
  const isMulti = professionSlugs.size > 1

  // Groupes ordonnés par ordre d'apparition
  const groups: { label: string; items: RecentProject[] }[] = []
  if (isMulti) {
    const seen = new Map<string, { label: string; items: RecentProject[] }>()
    for (const p of recent) {
      const prof = p.professions as { slug: string; label: string } | null
      const key = prof?.slug ?? ""
      if (!seen.has(key)) seen.set(key, { label: prof?.label ?? "Autres", items: [] })
      seen.get(key)!.items.push(p)
    }
    groups.push(...seen.values())
  }

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

      {recent.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <FolderOpen className="h-8 w-8 text-muted-foreground mb-3" />
            <p className="font-medium">Aucun projet pour l&apos;instant</p>
            <p className="text-sm text-muted-foreground mt-1">
              Créez votre premier projet pour commencer
            </p>
          </CardContent>
        </Card>
      ) : isMulti ? (
        <div className="space-y-6">
          {groups.map((group) => (
            <div key={group.label}>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                {group.label}
              </h3>
              <StaggerList className="space-y-3">
                {group.items.map((p) => (
                  <ProjectRow key={p.id} project={p} />
                ))}
              </StaggerList>
            </div>
          ))}
        </div>
      ) : (
        <StaggerList className="space-y-3">
          {recent.map((p) => (
            <ProjectRow key={p.id} project={p} />
          ))}
          {projects.length < 5 && (
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
      .select("id, status, name, client_name, created_at, professions(slug, label)")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false })
      .limit(100),
    supabase
      .from("profiles")
      .select("demo_project_id, onboarding_completed")
      .eq("id", user!.id)
      .single(),
  ])

  const projectIds = projects?.map((p) => p.id) ?? []
  const [{ data: documents }, { count: documentSentCount }] = await Promise.all([
    projectIds.length > 0
      ? supabase.from("documents").select("status").in("project_id", projectIds)
      : Promise.resolve({ data: [] as { status: string }[] }),
    projectIds.length > 0
      ? supabase
          .from("documents")
          .select("*", { count: "exact", head: true })
          .in("project_id", projectIds)
          .in("status", ["sent", "approved", "rejected"])
      : Promise.resolve({ count: 0 }),
  ])

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

        <RecentProjects projects={projects ?? []} />
      </div>
    </div>
  )
}
