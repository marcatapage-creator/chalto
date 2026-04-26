import { createClient } from "@/lib/supabase/server"
import { DOCUMENT_STATUS } from "@/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  FolderOpen,
  Plus,
  FileText,
  CheckCircle,
  Clock,
  MessageSquare,
  Users,
  ListTodo,
} from "lucide-react"
import React from "react"
import Link from "next/link"
import { FadeIn, StaggerList, StaggerItem } from "@/components/ui/motion"
import { DeleteProjectButton } from "@/components/projects/delete-project-button"
import { ProjectsFilter } from "@/components/projects/projects-filter"

function Indicator({
  icon: Icon,
  value,
  title,
  className,
}: {
  icon: React.ElementType
  value: number
  title: string
  className?: string
}) {
  return (
    <span
      className={`flex items-center gap-1 text-xs text-muted-foreground ${className ?? ""}`}
      title={title}
    >
      <Icon className="h-3 w-3 shrink-0" />
      {value}
    </span>
  )
}

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  draft: { label: "Brouillon", variant: "outline" },
  active: { label: "En cours", variant: "default" },
  completed: { label: "Terminé", variant: "secondary" },
  archived: { label: "Archivé", variant: "outline" },
}

const phaseMap: Record<string, string> = {
  cadrage: "Cadrage",
  conception: "Conception",
  validation: "Validation",
  chantier: "Chantier",
  reception: "Réception",
  cloture: "Clôturé",
}

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status: statusFilter } = await searchParams
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })
  const allProjects = data ?? []

  const statusCounts: Record<string, number> = {}
  for (const p of allProjects) {
    statusCounts[p.status] = (statusCounts[p.status] ?? 0) + 1
  }

  const projects = statusFilter
    ? allProjects.filter((p) => p.status === statusFilter)
    : allProjects.filter((p) => p.status !== "archived")

  const projectIds = projects.map((p) => p.id)

  const [{ data: docRows }, { data: taskRows }, { data: contributorRows }, { data: msgRows }] =
    projectIds.length > 0
      ? await Promise.all([
          supabase.from("documents").select("project_id, status").in("project_id", projectIds),
          supabase.from("tasks").select("project_id, status").in("project_id", projectIds),
          supabase.from("contributors").select("project_id").in("project_id", projectIds),
          supabase.from("project_messages").select("project_id").in("project_id", projectIds),
        ])
      : [{ data: [] }, { data: [] }, { data: [] }, { data: [] }]

  const counts = Object.fromEntries(
    projectIds.map((id) => [
      id,
      {
        docs: docRows?.filter((d) => d.project_id === id).length ?? 0,
        pending:
          docRows?.filter((d) => d.project_id === id && d.status === DOCUMENT_STATUS.SENT).length ??
          0,
        approved:
          docRows?.filter((d) => d.project_id === id && d.status === DOCUMENT_STATUS.APPROVED)
            .length ?? 0,
        tasks:
          taskRows?.filter((t) => t.project_id === id && ["todo", "in_progress"].includes(t.status))
            .length ?? 0,
        messages: msgRows?.filter((m) => m.project_id === id).length ?? 0,
        contributors: contributorRows?.filter((c) => c.project_id === id).length ?? 0,
      },
    ])
  )

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-6 md:p-8 space-y-6">
        <FadeIn className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Projets</h1>
            <p className="text-muted-foreground">Gérez vos projets et vos clients</p>
          </div>
          <Button asChild>
            <Link href="/projects/new">
              <Plus className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Nouveau projet</span>
            </Link>
          </Button>
        </FadeIn>

        <ProjectsFilter counts={statusCounts} total={allProjects.length} />

        {projects.length > 0 ? (
          <StaggerList className="space-y-3">
            {projects.map((project) => {
              const status = statusMap[project.status] ?? statusMap.draft
              const phase = phaseMap[project.phase ?? "cadrage"] ?? "Cadrage"
              const c = counts[project.id] ?? {
                docs: 0,
                pending: 0,
                approved: 0,
                tasks: 0,
                messages: 0,
                contributors: 0,
              }
              return (
                <StaggerItem key={project.id}>
                  <Link href={`/projects/${project.id}`}>
                    <Card className="cursor-pointer transition-all duration-150 hover:shadow-sm hover:bg-muted/50">
                      <CardContent className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="hidden sm:block bg-muted p-2 rounded-lg shrink-0">
                            <FolderOpen className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div className="min-w-0">
                            {/* Badges mobile/tablette — au-dessus du nom */}
                            <div className="xl:hidden mb-2 flex items-center gap-2">
                              <Badge variant={status.variant}>{status.label}</Badge>
                              <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                                {phase}
                              </span>
                            </div>
                            <p className="font-medium text-sm">{project.name}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {project.client_name || "Pas de client"}
                              {project.address && ` · ${project.address}`}
                            </p>
                            {/* Indicateurs mobile + tablette */}
                            <div className="flex xl:hidden items-center gap-3 mt-1.5 flex-wrap">
                              <Indicator icon={FileText} value={c.docs} title="Documents" />
                              {c.pending > 0 && (
                                <Indicator
                                  icon={Clock}
                                  value={c.pending}
                                  title="En attente"
                                  className="text-amber-500"
                                />
                              )}
                              <Indicator icon={CheckCircle} value={c.approved} title="Validés" />
                              <Indicator icon={ListTodo} value={c.tasks} title="Tâches actives" />
                              <Indicator
                                icon={MessageSquare}
                                value={c.messages}
                                title="Messages chantier"
                              />
                              <Indicator icon={Users} value={c.contributors} title="Prestataires" />
                            </div>
                          </div>
                        </div>
                        {/* Badge statut desktop — 24px après le bloc texte */}
                        <Badge
                          variant={status.variant}
                          className="hidden xl:inline-flex shrink-0 ml-3"
                        >
                          {status.label}
                        </Badge>
                        {/* Phase + indicateurs desktop — colonne centrale */}
                        <div className="hidden xl:flex items-center gap-4 px-6 shrink-0">
                          <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                            {phase}
                          </span>
                          <Indicator icon={FileText} value={c.docs} title="Documents" />
                          {c.pending > 0 && (
                            <Indicator
                              icon={Clock}
                              value={c.pending}
                              title="En attente"
                              className="text-amber-500"
                            />
                          )}
                          <Indicator icon={CheckCircle} value={c.approved} title="Validés" />
                          <Indicator icon={ListTodo} value={c.tasks} title="Tâches actives" />
                          <Indicator
                            icon={MessageSquare}
                            value={c.messages}
                            title="Messages chantier"
                          />
                          <Indicator icon={Users} value={c.contributors} title="Prestataires" />
                        </div>
                        <div className="flex items-center gap-6 shrink-0 pl-6">
                          <p className="text-xs text-muted-foreground hidden xl:block">
                            {new Date(project.created_at).toLocaleDateString("fr-FR")}
                          </p>
                          <DeleteProjectButton
                            projectId={project.id}
                            projectName={project.name}
                            projectStatus={project.status}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </StaggerItem>
              )
            })}
          </StaggerList>
        ) : (
          <FadeIn delay={0.1}>
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <FolderOpen className="h-10 w-10 text-muted-foreground mb-4" />
                <p className="font-medium">Aucun projet pour l&apos;instant</p>
                <p className="text-sm text-muted-foreground mt-1 mb-4">
                  Créez votre premier projet pour commencer
                </p>
                <Button asChild>
                  <Link href="/projects/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Créer un projet
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </FadeIn>
        )}
      </div>
    </div>
  )
}
