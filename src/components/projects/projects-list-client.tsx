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
} from "lucide-react"
import React from "react"
import { cn } from "@/lib/utils"

const FILTERS = [
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

const phaseMap: Record<string, string> = {
  cadrage: "Cadrage",
  conception: "Conception",
  validation: "Validation",
  chantier: "Chantier",
  reception: "Réception",
  cloture: "Clôturé",
}

export interface ProjectWithCounts {
  id: string
  name: string
  client_name?: string | null
  address?: string | null
  status: string
  phase?: string | null
  created_at: string
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

export function ProjectsListClient({ projects }: { projects: ProjectWithCounts[] }) {
  const [filter, setFilter] = useState("")

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const p of projects) {
      counts[p.status] = (counts[p.status] ?? 0) + 1
    }
    return counts
  }, [projects])

  const filtered = useMemo(() => {
    if (filter === "") return projects.filter((p) => p.status !== "archived")
    return projects.filter((p) => p.status === filter)
  }, [projects, filter])

  return (
    <div className="space-y-6">
      {/* Filtres */}
      <div className="flex items-center gap-2 flex-wrap">
        {FILTERS.map(({ label, value }) => {
          const count = value ? (statusCounts[value] ?? 0) : projects.length
          const isActive = filter === value
          return (
            <button
              key={value}
              onClick={() => setFilter(value)}
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
      </div>

      {/* Liste */}
      {filtered.length > 0 ? (
        <StaggerList className="space-y-3">
          {filtered.map((project) => {
            const status = statusMap[project.status] ?? statusMap.draft
            const phase = phaseMap[project.phase ?? "cadrage"] ?? "Cadrage"
            const c = project.counts

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
                      <Badge
                        variant={status.variant}
                        className="hidden xl:inline-flex shrink-0 ml-3"
                      >
                        {status.label}
                      </Badge>
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
  )
}
