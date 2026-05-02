"use client"

import { useState, useEffect, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { AnimatePresence, motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, User, MapPin, Mail, ChevronDown, Pencil } from "lucide-react"
import { cn, isChantierPhase } from "@/lib/utils"
import Link from "next/link"
import { ProjectDocuments } from "@/components/projects/project-documents"
import { DocumentPanel } from "@/components/projects/document-panel"
import { ErrorBoundary } from "@/components/ui/error-boundary"
import { ProjectStepper } from "@/components/projects/project-stepper"
import { ProjectTasks } from "@/components/projects/project-tasks"
import { ProjectDiscussion } from "@/components/projects/project-discussion"
import { ProjectContributors } from "@/components/projects/project-contributors"
import {
  ProjectDetailsDialog,
  type ProjectInfo,
} from "@/components/projects/project-details-dialog"
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer"
import { useProjectDocuments } from "@/hooks/use-project-documents"
import type { ProjectDocument } from "@/hooks/use-project-documents"
import { useMediaQuery } from "@/hooks/use-media-query"

interface Contact {
  id: string
  name: string
  professions?: { label: string }[]
}

interface Project {
  id: string
  name: string
  status: string
  created_at: string
  client_name?: string
  client_email?: string
  address?: string
  description?: string
  work_type?: string
  budget_range?: string
  deadline?: string
  constraints?: string
}

const statusMap: Record<
  string,
  { label: string; variant: "default" | "secondary" | "outline"; dot: string }
> = {
  draft: { label: "Brouillon", variant: "outline", dot: "bg-muted-foreground/40" },
  active: { label: "En cours", variant: "default", dot: "bg-primary" },
  completed: { label: "Terminé", variant: "secondary", dot: "bg-muted-foreground" },
  archived: { label: "Archivé", variant: "outline", dot: "bg-muted-foreground/40" },
}

type ValidationData = {
  status: string
  comment?: string | null
  approved_at?: string
  client_name?: string
}

interface ProjectPageClientProps {
  project: Project
  documents: ProjectDocument[]
  userId: string
  phase: string
  contacts: Contact[]
  authorName: string
  professionSlug?: string | null
  initialHighlightId?: string | null
  initialValidations?: Record<string, ValidationData>
  unreadDocs?: number
  unreadTasks?: number
  unreadDiscussion?: number
}

export function ProjectPageClient({
  project,
  documents,
  userId,
  phase,
  contacts,
  authorName,
  professionSlug,
  initialHighlightId,
  initialValidations = {},
  unreadDocs = 0,
  unreadTasks = 0,
  unreadDiscussion = 0,
}: ProjectPageClientProps) {
  const {
    label: statusLabel,
    variant: statusVariant,
    dot: statusDot,
  } = statusMap[project.status] ?? statusMap.draft

  const supabase = useMemo(() => createClient(), [])
  const isDesktop = useMediaQuery("(min-width: 1280px)")

  // ─── UI panels ───────────────────────────────────────────────────────────────
  const isLatePhase = phase === "reception" || phase === "cloture"
  const startCollapsed = isLatePhase && !initialHighlightId

  const [selectedDocId, setSelectedDocId] = useState<string | null>(
    initialHighlightId?.startsWith("doc_") ? initialHighlightId.slice(4) : null
  )
  const [detailsOpen, setDetailsOpen] = useState(!startCollapsed)
  const [docsOpen, setDocsOpen] = useState(
    !isChantierPhase(phase) || (initialHighlightId?.startsWith("doc_") ?? false)
  )

  // ─── Highlight (notification deep-link) ──────────────────────────────────────
  const [highlightedId, setHighlightedId] = useState<string | null>(initialHighlightId ?? null)
  const highlightedDocId = highlightedId?.startsWith("doc_") ? highlightedId.slice(4) : null
  const highlightedTaskId = highlightedId?.startsWith("task_") ? highlightedId.slice(5) : null
  const openDiscussion = highlightedId === "discussion"

  useEffect(() => {
    if (!highlightedId) return
    const t = setTimeout(() => setHighlightedId(null), 2500)
    return () => clearTimeout(t)
  }, [highlightedId])

  // ─── Documents (Realtime + CRUD) ─────────────────────────────────────────────
  const {
    docs: localDocs,
    unreadDocs: localUnreadDocs,
    markDocsRead,
    handleDocStatusChange,
    handleDeleteDoc,
  } = useProjectDocuments({
    supabase,
    projectId: project.id,
    initialDocs: documents,
    initialUnreadDocs: unreadDocs,
    onNewDoc: (doc) => {
      setDocsOpen(true)
      setHighlightedId(`doc_${doc.id}`)
    },
  })

  const selectedDoc = useMemo(
    () => localDocs.find((d) => d.id === selectedDocId) ?? null,
    [localDocs, selectedDocId]
  )

  // ─── Unread tasks ─────────────────────────────────────────────────────────────
  const [localUnreadTasks, setLocalUnreadTasks] = useState(unreadTasks)

  // ─── Pro view upsert ─────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false
    const t = setTimeout(() => {
      if (cancelled) return
      supabase
        .from("pro_views")
        .upsert(
          { user_id: userId, project_id: project.id, last_viewed_at: new Date().toISOString() },
          { onConflict: "user_id,project_id" }
        )
        .then(({ error }) => {
          if (error) console.error("[pro_views upsert]", error)
        })
    }, 500)
    return () => {
      cancelled = true
      clearTimeout(t)
    }
  }, [project.id, userId, supabase])

  // ─── Project details (client info) ───────────────────────────────────────────
  const [projectInfo, setProjectInfo] = useState<ProjectInfo>({
    client_name: project.client_name,
    client_email: project.client_email,
    address: project.address,
    description: project.description,
    work_type: project.work_type,
    budget_range: project.budget_range,
    deadline: project.deadline,
    constraints: project.constraints,
  })

  // ─── Contributors (shared between Contributors + Tasks) ──────────────────────
  const [contributorContactIds, setContributorContactIds] = useState<Set<string>>(new Set())

  return (
    <div className="flex flex-1 min-h-0 overflow-hidden">
      {/* Contenu principal */}
      <div className="flex-1 flex flex-col min-h-0 min-w-0">
        {/* En-tête fixe */}
        <div className="shrink-0 border-b bg-background">
          {/* Header */}
          <div className="flex items-center gap-4 px-6 md:px-8 pt-6 pb-6">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/projects">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 min-w-0">
                <h1 className="text-2xl font-bold tracking-tight truncate">{project.name}</h1>
                {project.status === "active" ? (
                  <span className="relative flex h-2.5 w-2.5 shrink-0 sm:hidden">
                    <span
                      className={cn(
                        "animate-ping absolute inline-flex h-full w-full rounded-full opacity-50",
                        statusDot
                      )}
                    />
                    <span
                      className={cn("relative inline-flex h-2.5 w-2.5 rounded-full", statusDot)}
                    />
                  </span>
                ) : (
                  <span className={cn("h-2.5 w-2.5 rounded-full shrink-0 sm:hidden", statusDot)} />
                )}
                <Badge variant={statusVariant} className="shrink-0 hidden sm:inline-flex">
                  {statusLabel}
                </Badge>
              </div>
              <p className="text-muted-foreground text-sm">
                Créé le {new Date(project.created_at).toLocaleDateString("fr-FR")}
              </p>
            </div>
            {phase !== "cloture" && (
              <Button
                variant="ghost"
                size="icon"
                className="hidden md:inline-flex shrink-0 text-muted-foreground"
                asChild
              >
                <Link href={`/projects/${project.id}/edit`}>
                  <Pencil className="h-4 w-4" />
                </Link>
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="shrink-0 text-muted-foreground gap-1.5"
              onClick={() => setDetailsOpen((v) => !v)}
            >
              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 transition-transform duration-200",
                  !detailsOpen && "-rotate-90"
                )}
              />
              <span className="hidden sm:inline">{detailsOpen ? "Réduire" : "Détails"}</span>
            </Button>
          </div>

          {/* Section client + phase — collapsible */}
          <AnimatePresence initial={false}>
            {detailsOpen && (
              <motion.div
                key="details"
                initial={{ height: 0 }}
                animate={{ height: "auto" }}
                exit={{ height: 0 }}
                transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
                className="overflow-hidden"
              >
                <div className="border-t flex flex-col sm:flex-row">
                  {/* Infos client */}
                  <div className="shrink-0 min-w-64.5 px-6 md:px-8 py-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Client
                      </p>
                      {phase !== "cloture" && (
                        <ProjectDetailsDialog
                          projectId={project.id}
                          project={projectInfo}
                          onSave={(updated) => setProjectInfo(updated)}
                        />
                      )}
                    </div>
                    {projectInfo.client_name && (
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span>{projectInfo.client_name}</span>
                      </div>
                    )}
                    {projectInfo.client_email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="truncate">{projectInfo.client_email}</span>
                      </div>
                    )}
                    {projectInfo.address && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span>{projectInfo.address}</span>
                      </div>
                    )}
                    {!projectInfo.client_name &&
                      !projectInfo.client_email &&
                      !projectInfo.address && (
                        <p className="text-sm text-muted-foreground">Aucune information client</p>
                      )}
                  </div>

                  <div className="border-l" />

                  {/* Stepper phase */}
                  <div className="flex-1 min-w-0 px-6 md:px-8 py-4">
                    <ProjectStepper
                      projectId={project.id}
                      currentPhase={phase}
                      professionSlug={professionSlug}
                      onPhaseChange={(newPhase) => {
                        if (isChantierPhase(newPhase)) setDocsOpen(false)
                      }}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Corps scrollable */}
        <div className="flex-1 overflow-auto divide-y divide-border">
          {/* Documents */}
          <div className="px-6 md:px-8 py-6 md:py-8">
            <ProjectDocuments
              documents={localDocs}
              projectId={project.id}
              projectName={project.name}
              workType={project.work_type}
              clientName={project.client_name}
              professionSlug={professionSlug}
              selectedDocId={selectedDoc?.id ?? null}
              onSelectDoc={(doc) => setSelectedDocId(doc?.id ?? null)}
              onDeleteDoc={handleDeleteDoc}
              isOpen={docsOpen}
              onToggle={() => {
                if (docsOpen) {
                  setSelectedDocId(null)
                } else {
                  if (!isDesktop) setDetailsOpen(false)
                  markDocsRead()
                }
                setDocsOpen((v) => !v)
              }}
              readOnly={phase === "cloture"}
              highlightedId={highlightedDocId}
              unreadCount={localUnreadDocs}
            />
          </div>

          {/* Prestataires + Kanban tâches — phases chantier et au-delà */}
          {isChantierPhase(phase) && (
            <>
              <div className="px-6 md:px-8 py-6 md:py-8">
                <ProjectContributors
                  projectId={project.id}
                  contacts={contacts}
                  onContributorsChange={setContributorContactIds}
                  readOnly={phase === "cloture"}
                  defaultOpen={!startCollapsed}
                  onOpen={() => {
                    if (!isDesktop) setDetailsOpen(false)
                  }}
                />
              </div>
              <div className="px-6 md:px-8 py-6 md:py-8">
                <ErrorBoundary>
                  <ProjectTasks
                    projectId={project.id}
                    userId={userId}
                    contacts={contacts}
                    authorName={authorName}
                    readOnly={phase === "cloture"}
                    highlightedId={highlightedTaskId}
                    externalInvitedIds={contributorContactIds}
                    defaultOpen={!startCollapsed}
                    onOpen={() => {
                      if (!isDesktop) setDetailsOpen(false)
                      setLocalUnreadTasks(0)
                    }}
                    unreadCount={localUnreadTasks}
                    onNewPrestaComment={() => setLocalUnreadTasks((n) => n + 1)}
                  />
                </ErrorBoundary>
              </div>
              <div className="px-6 md:px-8 py-6 md:py-8">
                <ProjectDiscussion
                  projectId={project.id}
                  authorName={authorName}
                  authorRole="pro"
                  readOnly={phase === "cloture"}
                  autoOpen={openDiscussion}
                  onOpen={() => {
                    if (!isDesktop) setDetailsOpen(false)
                  }}
                  unreadCount={unreadDiscussion}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Panel desktop — pousse le contenu, pas d'overlay */}
      <AnimatePresence>
        {isDesktop && selectedDoc && (
          <motion.div
            key="doc-panel"
            initial={{ width: 0 }}
            animate={{ width: "26.25rem" }}
            exit={{ width: 0 }}
            transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
            className="shrink-0 border-l flex flex-col overflow-hidden"
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
              className="w-105 flex flex-col h-full"
            >
              <ErrorBoundary>
                <DocumentPanel
                  key={selectedDoc.id}
                  document={selectedDoc}
                  userId={userId}
                  phase={phase}
                  clientName={project.client_name}
                  onClose={() => setSelectedDocId(null)}
                  showClose
                  onStatusChange={handleDocStatusChange}
                  initialValidation={initialValidations[selectedDoc.id]}
                />
              </ErrorBoundary>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Panel mobile/tablette — Vaul Drawer (swipe-to-dismiss natif) */}
      <Drawer
        open={!isDesktop && !!selectedDoc}
        onOpenChange={(open) => {
          if (!open) setSelectedDocId(null)
        }}
      >
        <DrawerContent className="h-[85dvh] p-0">
          <DrawerTitle className="sr-only">Document</DrawerTitle>
          {selectedDoc && (
            <ErrorBoundary>
              <DocumentPanel
                key={selectedDoc.id}
                document={selectedDoc}
                userId={userId}
                phase={phase}
                clientName={project.client_name}
                onClose={() => setSelectedDocId(null)}
                onStatusChange={handleDocStatusChange}
                initialValidation={initialValidations[selectedDoc.id]}
              />
            </ErrorBoundary>
          )}
        </DrawerContent>
      </Drawer>
    </div>
  )
}
