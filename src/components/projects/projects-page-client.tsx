"use client"

import { useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { StaggerList, StaggerItem, FadeIn } from "@/components/ui/motion"
import { FolderOpen, Plus, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ProjectCard, type ProjectWithCounts } from "@/components/projects/projects-list-client"

const STATUS_FILTERS = [
  { label: "Tous", value: "" },
  { label: "En cours", value: "active" },
  { label: "Terminé", value: "completed" },
  { label: "Archivé", value: "archived" },
] as const

export function ProjectsPageClient({ projects }: { projects: ProjectWithCounts[] }) {
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
    <div className="relative flex-1 overflow-auto">
      {/* Zone sticky : header + filtres en un seul bloc */}
      <div className="sticky top-0 z-20 bg-neutral-50 dark:bg-background px-6 md:px-8 pt-6 pb-4 space-y-4">
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
      </div>

      {/* Liste */}
      <div className="px-6 md:px-8 pt-4 pb-8">
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
          <div className="space-y-8">
            {groups.map((group) => (
              <div key={group.label}>
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                  {group.label}
                </h2>
                <StaggerList className="space-y-3">
                  {group.items.map((project) => (
                    <StaggerItem key={project.id} pressable>
                      <ProjectCard project={project} />
                    </StaggerItem>
                  ))}
                </StaggerList>
              </div>
            ))}
          </div>
        ) : (
          <StaggerList className="space-y-3">
            {filtered.map((project) => (
              <StaggerItem key={project.id} pressable>
                <ProjectCard project={project} />
              </StaggerItem>
            ))}
          </StaggerList>
        )}
      </div>

      {/* Fade directionnel bas */}
      <div className="pointer-events-none sticky bottom-0 h-87.5 bg-linear-to-t from-neutral-50 dark:from-background to-transparent" />
    </div>
  )
}
