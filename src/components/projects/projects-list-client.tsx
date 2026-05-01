"use client"

import { useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { StaggerList, StaggerItem, FadeIn } from "@/components/ui/motion"
import { DeleteProjectButton } from "@/components/projects/delete-project-button"
import {
  FolderOpen,
  Plus,
  FileText,
  CheckCircle,
  Clock,
  MessageSquare,
  Users,
  ListTodo,
  ChevronDown,
} from "lucide-react"
import React from "react"
import { cn } from "@/lib/utils"
import { getProfessionConfig } from "@/lib/profession-config"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const STATUS_FILTERS = [
  { label: "Tous", value: "" },
  { label: "En cours", value: "active" },
  { label: "Terminé", value: "completed" },
  { label: "Archivé", value: "archived" },
] as const

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  draft: { label: "Brouillon", variant: "outline" },
  active: { label: "En cours", variant: "default" },
  completed: { label: "Terminé", variant: "secondary" },
  archived: { label: "Archivé", variant: "outline" },
}

export interface ProjectWithCounts {
  id: string
  name: string
  client_name?: string | null
  address?: string | null
  status: string
  phase?: string | null
  created_at: string
  professionSlug?: string | null
  professionLabel?: string | null
  counts: {
    docs: number
    pending: number
    approved: number
    tasks: number
    messages: number
    contributors: number
  }
}

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

export function ProjectCard({ project }: { project: ProjectWithCounts }) {
  const status = statusMap[project.status] ?? statusMap.draft
  const phaseLabel =
    getProfessionConfig(project.professionSlug).phases.find(
      (p) => p.id === (project.phase ?? "cadrage")
    )?.label ?? "Cadrage"
  const c = project.counts

  return (
    <Link href={`/projects/${project.id}`}>
      <Card className="cursor-pointer transition-all duration-150 hover:shadow-sm hover:bg-muted/50">
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="hidden sm:block bg-muted p-2 rounded-lg shrink-0">
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <div className="xl:hidden mb-2 flex items-center gap-2">
                <Badge variant={status.variant}>{status.label}</Badge>
                <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                  {phaseLabel}
                </span>
              </div>
              <p className="font-medium text-sm">{project.name}</p>
              <p className="text-xs text-muted-foreground truncate">
                {project.client_name || "Pas de client"}
                {project.address && ` · ${project.address}`}
              </p>
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
                <Indicator icon={MessageSquare} value={c.messages} title="Messages chantier" />
                <Indicator icon={Users} value={c.contributors} title="Prestataires" />
              </div>
            </div>
          </div>
          <Badge variant={status.variant} className="hidden xl:inline-flex shrink-0 ml-3">
            {status.label}
          </Badge>
          <div className="hidden xl:flex items-center gap-4 px-6 shrink-0">
            <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              {phaseLabel}
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
            <Indicator icon={MessageSquare} value={c.messages} title="Messages chantier" />
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
  )
}

export function ProjectsListClient({ projects }: { projects: ProjectWithCounts[] }) {
  const [statusFilter, setStatusFilter] = useState("")
  const [professionFilter, setProfessionFilter] = useState("")

  const isMultiProfession = useMemo(() => {
    const slugs = new Set(projects.map((p) => p.professionSlug ?? ""))
    return slugs.size > 1
  }, [projects])

  const availableProfessions = useMemo(() => {
    const seen = new Map<string, string>()
    for (const p of projects) {
      if (p.professionSlug && p.professionLabel && !seen.has(p.professionSlug))
        seen.set(p.professionSlug, p.professionLabel)
    }
    return [...seen.entries()].map(([slug, label]) => ({ slug, label }))
  }, [projects])

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const p of projects) counts[p.status] = (counts[p.status] ?? 0) + 1
    return counts
  }, [projects])

  const filtered = useMemo(() => {
    const list = professionFilter
      ? projects.filter((p) => p.professionSlug === professionFilter)
      : projects
    if (statusFilter === "") return list
    return list.filter((p) => p.status === statusFilter)
  }, [projects, statusFilter, professionFilter])

  // Groupes — uniquement en mode "Tous" (pas de filtre profession actif)
  const groups = useMemo(() => {
    if (!isMultiProfession || professionFilter) return null
    const seen = new Map<string, { label: string; items: ProjectWithCounts[] }>()
    for (const p of filtered) {
      const key = p.professionSlug ?? ""
      if (!seen.has(key)) seen.set(key, { label: p.professionLabel ?? "Autres", items: [] })
      seen.get(key)!.items.push(p)
    }
    return [...seen.values()]
  }, [filtered, isMultiProfession, professionFilter])

  const activeProfessionLabel =
    availableProfessions.find((p) => p.slug === professionFilter)?.label ?? "Tous"

  const empty = filtered.length === 0

  return (
    <div className="space-y-6">
      {/* Filtres */}
      <div className="flex items-center gap-2 flex-wrap">
        {STATUS_FILTERS.map(({ label, value }) => {
          const count = value ? (statusCounts[value] ?? 0) : projects.length
          const isActive = statusFilter === value
          return (
            <button
              key={value}
              onClick={() => setStatusFilter(value)}
              className={cn(
                "inline-flex cursor-pointer items-center gap-1.5 pl-3 pr-1.75 py-1.5 rounded-full text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              )}
            >
              {label}
              <span
                className={cn(
                  "text-xs h-5 min-w-5 px-1 rounded-full flex items-center justify-center",
                  isActive ? "bg-primary-foreground/20 text-primary-foreground" : "bg-background"
                )}
              >
                {count}
              </span>
            </button>
          )
        })}

        {/* Filtre profession — desktop uniquement, multi-profession uniquement */}
        {isMultiProfession && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  "hidden xl:inline-flex cursor-pointer items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ml-auto",
                  professionFilter
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                )}
              >
                {activeProfessionLabel}
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-48">
              <DropdownMenuItem onClick={() => setProfessionFilter("")}>
                Tous les métiers
              </DropdownMenuItem>
              {availableProfessions.map(({ slug, label }) => (
                <DropdownMenuItem key={slug} onClick={() => setProfessionFilter(slug)}>
                  {label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {empty ? (
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
      ) : groups ? (
        // Vue groupée par profession
        <div className="space-y-8">
          {groups.map((group) => (
            <div key={group.label}>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                {group.label}
              </h2>
              <StaggerList className="space-y-3">
                {group.items.map((project) => (
                  <StaggerItem key={project.id}>
                    <ProjectCard project={project} />
                  </StaggerItem>
                ))}
              </StaggerList>
            </div>
          ))}
        </div>
      ) : (
        // Vue plate (mono-profession)
        <StaggerList className="space-y-3">
          {filtered.map((project) => (
            <StaggerItem key={project.id}>
              <ProjectCard project={project} />
            </StaggerItem>
          ))}
        </StaggerList>
      )}
    </div>
  )
}
