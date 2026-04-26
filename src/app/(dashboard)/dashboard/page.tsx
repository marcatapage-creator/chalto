import { createClient } from "@/lib/supabase/server"
import { DOCUMENT_STATUS } from "@/types"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FolderOpen, Plus } from "lucide-react"
import { FadeIn, StaggerList, StaggerItem } from "@/components/ui/motion"
import Link from "next/link"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { OnboardingChecklist } from "@/components/dashboard/onboarding-checklist"

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const [{ data: projects }, { data: profile }] = await Promise.all([
    supabase
      .from("projects")
      .select("id, status, name, client_name, created_at")
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
        <FadeIn>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Vue d&apos;ensemble de votre activité</p>
        </FadeIn>

        <DashboardStats userId={user!.id} initialCounts={initialCounts} />

        {!profile?.onboarding_completed && (
          <OnboardingChecklist
            userId={user!.id}
            demoProjectId={profile?.demo_project_id}
            documentSentCount={documentSentCount ?? 0}
            onboardingCompleted={profile?.onboarding_completed ?? false}
          />
        )}

        {/* Projets récents */}
        <FadeIn delay={0.2}>
          <h2 className="text-lg font-semibold mb-4">Projets récents</h2>
          {projects && projects.length > 0 ? (
            <StaggerList className="space-y-3">
              {projects.slice(0, 5).map((project) => (
                <StaggerItem key={project.id}>
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
                        <Badge
                          variant={
                            project.status === "active"
                              ? "default"
                              : project.status === "completed"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {project.status === "active"
                            ? "En cours"
                            : project.status === "completed"
                              ? "Terminé"
                              : project.status === "draft"
                                ? "Brouillon"
                                : project.status === "archived"
                                  ? "Archivé"
                                  : project.status}
                        </Badge>
                      </CardContent>
                    </Card>
                  </Link>
                </StaggerItem>
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
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <FolderOpen className="h-8 w-8 text-muted-foreground mb-3" />
                <p className="font-medium">Aucun projet pour l&apos;instant</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Créez votre premier projet pour commencer
                </p>
              </CardContent>
            </Card>
          )}
        </FadeIn>
      </div>
    </div>
  )
}
