"use client"

import { useState, useEffect, useLayoutEffect, useMemo, useCallback, useRef } from "react"
import dynamic from "next/dynamic"
import { createClient } from "@/lib/supabase/client"
import { AnimatePresence, motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  ArrowLeft,
  User,
  MapPin,
  Mail,
  ChevronDown,
  Pencil,
  ArrowUp,
  Minus,
  Plus,
} from "lucide-react"
import { cn, isChantierPhase } from "@/lib/utils"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ProjectDocuments } from "@/components/projects/project-documents"
import { ErrorBoundary } from "@/components/ui/error-boundary"
import { ProjectStepper } from "@/components/projects/project-stepper"
import {
  ProjectDetailsDialog,
  type ProjectInfo,
} from "@/components/projects/project-details-dialog"
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer"
import { useProjectDocuments } from "@/hooks/use-project-documents"
import { useMediaQuery } from "@/hooks/use-media-query"

const DocumentPanel = dynamic(
  () => import("@/components/projects/document-panel").then((m) => ({ default: m.DocumentPanel })),
  { ssr: false }
)

const ProjectAdminDossiers = dynamic(
  () =>
    import("@/components/projects/project-admin-dossiers").then((m) => ({
      default: m.ProjectAdminDossiers,
    })),
  {
    ssr: false,
    loading: () => <div className="h-11 rounded-lg bg-muted animate-pulse" />,
  }
)

const ProjectContributors = dynamic(
  () =>
    import("@/components/projects/project-contributors").then((m) => ({
      default: m.ProjectContributors,
    })),
  { ssr: false }
)

const ProjectTasks = dynamic(
  () => import("@/components/projects/project-tasks").then((m) => ({ default: m.ProjectTasks })),
  { ssr: false }
)

const ProjectDiscussion = dynamic(
  () =>
    import("@/components/projects/project-discussion").then((m) => ({
      default: m.ProjectDiscussion,
    })),
  { ssr: false }
)

const ProjectSituations = dynamic(
  () =>
    import("@/components/projects/project-situations").then((m) => ({
      default: m.ProjectSituations,
    })),
  { ssr: false }
)
import type {
  ProjectDocument,
  Contact,
  Project,
  ValidationData,
  Situation,
  AdminDossier,
  CloudLink,
} from "@/types/domain"

const statusMap: Record<
  string,
  { label: string; variant: "default" | "secondary" | "outline"; dot: string }
> = {
  draft: { label: "Brouillon", variant: "outline", dot: "bg-muted-foreground/40" },
  active: { label: "En cours", variant: "default", dot: "bg-primary" },
  completed: { label: "Terminé", variant: "secondary", dot: "bg-muted-foreground" },
  archived: { label: "Archivé", variant: "outline", dot: "bg-muted-foreground/40" },
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
  initialSituations?: Situation[]
  initialDossiers?: AdminDossier[]
  unreadDocs?: number
  unreadTasks?: number
  unreadDiscussion?: number
  unreadSituations?: number
  cloudLinks?: CloudLink[]
  hasDropboxConnected?: boolean
}

function GradientDivider({ index }: { index: number }) {
  const isEven = index % 2 === 0
  return (
    <div
      className={
        isEven
          ? "h-px bg-linear-to-l from-border to-transparent"
          : "h-px bg-linear-to-r from-border to-transparent"
      }
    />
  )
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
  initialSituations = [],
  initialDossiers = [],
  unreadDocs = 0,
  unreadTasks = 0,
  unreadDiscussion = 0,
  unreadSituations = 0,
  cloudLinks = [],
  hasDropboxConnected = false,
}: ProjectPageClientProps) {
  const {
    label: statusLabel,
    variant: statusVariant,
    dot: statusDot,
  } = statusMap[project.status] ?? statusMap.draft

  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const isDesktop = useMediaQuery("(min-width: 1280px)")

  // ─── UI panels ───────────────────────────────────────────────────────────────
  const startCollapsed = !initialHighlightId

  const [selectedDocId, setSelectedDocId] = useState<string | null>(
    initialHighlightId?.startsWith("doc_") ? initialHighlightId.slice(4) : null
  )
  const [detailsOpen, setDetailsOpen] = useState(true)
  const [docsOpen, setDocsOpen] = useState(initialHighlightId?.startsWith("doc_") ?? false)

  // ─── Highlight (notification deep-link) ──────────────────────────────────────
  // "tab_situations" is a legacy sentinel from old ?tab=situations notifications — not a real highlight
  const isLegacySituationsTab = initialHighlightId === "tab_situations"
  const [highlightedId, setHighlightedId] = useState<string | null>(
    isLegacySituationsTab ? null : (initialHighlightId ?? null)
  )

  // Efface le highlight initial (deep-link depuis notif) après 2,5 s
  useEffect(() => {
    if (!highlightedId) return
    const t = setTimeout(() => setHighlightedId(null), 2500)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const highlightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const applyHighlight = useCallback((id: string | null) => {
    if (!id) return
    if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current)
    setHighlightedId(id)
    if (id.startsWith("doc_")) setDocsOpen(true)
    highlightTimerRef.current = setTimeout(() => setHighlightedId(null), 2500)
  }, [])

  // Écoute les events dispatched par NotificationBell lors des clics sur notifications
  useEffect(() => {
    const handler = (e: Event) => applyHighlight((e as CustomEvent<string>).detail)
    window.addEventListener("chalto:highlight", handler)
    return () => window.removeEventListener("chalto:highlight", handler)
  }, [applyHighlight])

  // Nettoie le param ?highlight de l'URL après l'avoir consommé
  // Évite qu'un refresh ou retour arrière re-sélectionne le doc "par défaut"
  useEffect(() => {
    if (!initialHighlightId || isLegacySituationsTab) return
    const url = new URL(window.location.href)
    if (url.searchParams.has("highlight")) {
      url.searchParams.delete("highlight")
      router.replace(url.pathname + (url.search || ""), { scroll: false })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Réagit aux changements de initialHighlightId (navigation same-page via searchParams)
  // useState ne se réinitialise pas quand la prop change après le premier mount
  const prevHighlightRef = useRef<string | null>(initialHighlightId ?? null)
  useEffect(() => {
    if (!initialHighlightId || isLegacySituationsTab) return
    if (initialHighlightId === prevHighlightRef.current) return
    prevHighlightRef.current = initialHighlightId
    applyHighlight(initialHighlightId)
  }, [initialHighlightId, isLegacySituationsTab, applyHighlight])

  const highlightedDocId = highlightedId?.startsWith("doc_") ? highlightedId.slice(4) : null
  const highlightedTaskId = highlightedId?.startsWith("task_") ? highlightedId.slice(5) : null
  const highlightedSituationId = highlightedId?.startsWith("sit_") ? highlightedId.slice(4) : null
  const highlightedDossierId = highlightedId?.startsWith("dossier_") ? highlightedId.slice(8) : null
  const openDiscussion = highlightedId === "discussion"

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
    onNewDoc: (doc) => applyHighlight(`doc_${doc.id}`),
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
      // pro_views n'est pas dans les types générés Supabase — bypass ciblé
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      void (supabase as any)
        .from("pro_views")
        .upsert(
          { user_id: userId, project_id: project.id, last_viewed_at: new Date().toISOString() },
          { onConflict: "user_id,project_id" }
        )
        .then(({ error }: { error: Error | null }) => {
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

  // ─── Chantier reveal ─────────────────────────────────────────────────────────
  const [chantierRevealing, setChantierRevealing] = useState(false)

  // ─── Scroll refs ─────────────────────────────────────────────────────────────
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const adminDossiersRef = useRef<HTMLDivElement>(null)

  const [showScrollTop, setShowScrollTop] = useState(false)
  useEffect(() => {
    const el = scrollContainerRef.current
    if (!el) return
    const onScroll = () => setShowScrollTop(el.scrollTop > 150)
    el.addEventListener("scroll", onScroll, { passive: true })
    return () => el.removeEventListener("scroll", onScroll)
  }, [])

  const [openSectionIds, setOpenSectionIds] = useState<Set<string>>(new Set())
  const [collapseSignal, setCollapseSignal] = useState(0)
  const [expandSignal, setExpandSignal] = useState(0)
  const registerOpen = useCallback(
    (id: string) => setOpenSectionIds((prev) => new Set([...prev, id])),
    []
  )
  const registerClose = useCallback((id: string) => {
    setOpenSectionIds((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }, [])
  const openCount = (detailsOpen ? 1 : 0) + (docsOpen ? 1 : 0) + openSectionIds.size
  const collapseAll = useCallback(() => {
    setDetailsOpen(false)
    setDocsOpen(false)
    setCollapseSignal((s) => s + 1)
    setOpenSectionIds(new Set())
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" })
  }, [])
  const expandAll = useCallback(() => {
    setDetailsOpen(true)
    setDocsOpen(true)
    setExpandSignal((s) => s + 1)
  }, [])

  const detailsEditButton =
    phase !== "cloture" &&
    (isDesktop ? (
      <ProjectDetailsDialog
        projectId={project.id}
        project={projectInfo}
        onSave={(updated) => setProjectInfo(updated)}
      />
    ) : (
      <Button variant="ghost" size="sm" className="text-muted-foreground h-7 px-2 text-xs" asChild>
        <Link href={`/projects/${project.id}/details`}>Détails</Link>
      </Button>
    ))

  // Cleanup synchrone à l'unmount : restaure les styles body que Radix/Vaul ont pu
  // laisser en place si la navigation interrompt la fermeture d'un Dialog/Drawer
  // (React 18 concurrent mode peut différer les cleanup passifs)
  useLayoutEffect(() => {
    return () => {
      document.body.style.removeProperty("pointer-events")
      if (document.body.style.position === "fixed") {
        document.body.style.removeProperty("position")
        document.body.style.removeProperty("top")
        document.body.style.removeProperty("left")
        document.body.style.removeProperty("right")
        document.body.style.removeProperty("height")
      }
    }
  }, [])

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
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight truncate">
                  {project.name}
                </h1>
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
                <div className="border-t flex sm:flex-row">
                  {/* Client info — desktop uniquement (mobile : dans la zone scrollable) */}
                  <div className="hidden sm:block shrink-0 min-w-64.5 px-6 md:px-8 py-4 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Client
                      </p>
                      {detailsEditButton}
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

                  <div className="hidden sm:block border-l" />

                  {/* Stepper phase — toujours dans le header (fixe = sticky sur mobile) */}
                  <div className="flex-1 min-w-0 px-6 md:px-8 py-4">
                    <ProjectStepper
                      projectId={project.id}
                      currentPhase={phase}
                      professionSlug={professionSlug}
                      onPhaseChange={(newPhase) => {
                        if (isChantierPhase(newPhase)) {
                          setDocsOpen(false)
                          setChantierRevealing(true)
                        }
                      }}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Corps scrollable */}
        <div ref={scrollContainerRef} className="relative flex-1 overflow-auto overscroll-contain">
          <div
            aria-hidden
            className="pointer-events-none sticky top-0 z-10 h-20.5 -mb-20.5 bg-linear-to-b from-neutral-50/40 dark:from-background/40 to-transparent"
          />
          {/* Mobile : infos client en tête de scroll — se scroll naturellement, stepper reste fixe */}
          <AnimatePresence initial={false}>
            {!isDesktop && detailsOpen && (
              <motion.div
                key="mobile-client-info"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
                className="overflow-hidden sm:hidden"
              >
                <div className="border-b px-6 py-4 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Client
                    </p>
                    {phase !== "cloture" &&
                      (isDesktop ? (
                        <ProjectDetailsDialog
                          projectId={project.id}
                          project={projectInfo}
                          onSave={(updated) => setProjectInfo(updated)}
                        />
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground h-7 px-2 text-xs"
                          asChild
                        >
                          <Link href={`/projects/${project.id}/details`}>Détails</Link>
                        </Button>
                      ))}
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
              </motion.div>
            )}
          </AnimatePresence>
          <div>
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
                cloudLinks={cloudLinks}
                hasDropboxConnected={hasDropboxConnected}
              />
            </div>

            {professionSlug !== "architecte_interieur" && (
              <>
                <GradientDivider index={1} />
                {/* Dossiers administratifs — toutes phases */}
                <div ref={adminDossiersRef} className="px-6 md:px-8 py-6 md:py-8">
                  <ProjectAdminDossiers
                    projectId={project.id}
                    initialDossiers={initialDossiers}
                    readOnly={phase === "cloture"}
                    highlightedDossierId={highlightedDossierId}
                    collapseSignal={collapseSignal}
                    expandSignal={expandSignal}
                    onOpen={() => {
                      if (!isDesktop) setDetailsOpen(false)
                      registerOpen("admin-dossiers")
                      setTimeout(() => {
                        const container = scrollContainerRef.current
                        const el = adminDossiersRef.current
                        if (container && el) {
                          container.scrollTo({ top: el.offsetTop - 24, behavior: "smooth" })
                        }
                      }, 50)
                    }}
                    onClose={() => registerClose("admin-dossiers")}
                    onOpenAdd={
                      !isDesktop
                        ? () => router.push(`/projects/${project.id}/admin-dossier/new`)
                        : undefined
                    }
                    onOpenEdit={
                      !isDesktop
                        ? (d) => router.push(`/projects/${project.id}/admin-dossier/${d.id}/edit`)
                        : undefined
                    }
                  />
                </div>
              </>
            )}

            {/* Skeleton pendant le router.refresh() post-confirmation chantier */}
            {(chantierRevealing || isChantierPhase(phase)) && <GradientDivider index={2} />}
            {chantierRevealing && !isChantierPhase(phase) && (
              <div className="divide-y divide-border">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="px-6 md:px-8 py-6 md:py-8 space-y-3 animate-pulse">
                    <div className="h-4 w-40 rounded-md bg-muted" />
                    <div className="h-20 rounded-lg bg-muted" />
                  </div>
                ))}
              </div>
            )}

            {/* Prestataires + Kanban tâches — phases chantier et au-delà */}
            {isChantierPhase(phase) && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                onAnimationComplete={() => setChantierRevealing(false)}
              >
                <div>
                  <div className="px-6 md:px-8 py-6 md:py-8">
                    <ProjectContributors
                      projectId={project.id}
                      contacts={contacts}
                      onContributorsChange={setContributorContactIds}
                      readOnly={phase === "cloture"}
                      defaultOpen={!startCollapsed}
                      collapseSignal={collapseSignal}
                      expandSignal={expandSignal}
                      onOpen={() => {
                        if (!isDesktop) setDetailsOpen(false)
                        registerOpen("contributors")
                      }}
                      onClose={() => registerClose("contributors")}
                    />
                  </div>
                  <GradientDivider index={3} />
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
                        collapseSignal={collapseSignal}
                        expandSignal={expandSignal}
                        onOpen={() => {
                          if (!isDesktop) setDetailsOpen(false)
                          setLocalUnreadTasks(0)
                          registerOpen("tasks")
                        }}
                        onClose={() => registerClose("tasks")}
                        unreadCount={localUnreadTasks}
                        onNewPrestaComment={() => setLocalUnreadTasks((n) => n + 1)}
                        onOpenCreate={
                          !isDesktop
                            ? () => router.push(`/projects/${project.id}/tasks/new`)
                            : undefined
                        }
                      />
                    </ErrorBoundary>
                  </div>
                  <GradientDivider index={4} />
                  <div className="px-6 md:px-8 py-6 md:py-8">
                    <ProjectDiscussion
                      projectId={project.id}
                      authorName={authorName}
                      authorRole="pro"
                      readOnly={phase === "cloture"}
                      autoOpen={openDiscussion}
                      highlighted={openDiscussion}
                      collapseSignal={collapseSignal}
                      expandSignal={expandSignal}
                      onOpen={() => {
                        if (!isDesktop) setDetailsOpen(false)
                        registerOpen("discussion")
                      }}
                      onClose={() => registerClose("discussion")}
                      unreadCount={unreadDiscussion}
                    />
                  </div>
                  <GradientDivider index={5} />
                  <div className="px-6 md:px-8 py-6 md:py-8">
                    <ProjectSituations
                      projectId={project.id}
                      initialSituations={initialSituations}
                      readOnly={phase === "cloture"}
                      defaultOpen={
                        !!highlightedSituationId ||
                        isLegacySituationsTab ||
                        initialSituations.some(
                          (s) => s.status === "en_attente" || s.status === "corrigee"
                        )
                      }
                      highlightedSituationId={highlightedSituationId}
                      collapseSignal={collapseSignal}
                      expandSignal={expandSignal}
                      unreadCount={unreadSituations}
                      onOpen={() => {
                        if (!isDesktop) setDetailsOpen(false)
                        registerOpen("situations")
                      }}
                      onClose={() => registerClose("situations")}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Fade directionnel bas */}
          <div className="pointer-events-none sticky bottom-0 h-62.5 bg-linear-to-t from-neutral-50/80 dark:from-background/80 to-transparent" />
        </div>

        {/* FABs — collapse tout + remonter en haut */}
        <motion.div
          className={cn(
            "fixed bottom-6 z-40 flex items-center gap-2",
            !isDesktop && selectedDoc && "invisible"
          )}
          animate={{ right: isDesktop && selectedDoc ? "calc(26.25rem + 1rem)" : "1rem" }}
          transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
        >
          <AnimatePresence>
            {!docsOpen && openSectionIds.size === 0 && (
              <motion.button
                key="expand-all"
                initial={{ opacity: 0, scale: 0.75 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.75 }}
                transition={{ duration: 0.18 }}
                onClick={expandAll}
                className="h-10 w-10 max-xl:h-11 max-xl:w-11 rounded-full bg-background border shadow-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:shadow-lg transition-shadow"
                aria-label="Tout ouvrir"
              >
                <Plus className="h-4 w-4" />
              </motion.button>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {openCount >= 2 && (
              <motion.button
                key="collapse-all"
                initial={{ opacity: 0, scale: 0.75 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.75 }}
                transition={{ duration: 0.18 }}
                onClick={collapseAll}
                className="h-10 w-10 max-xl:h-11 max-xl:w-11 rounded-full bg-background border shadow-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:shadow-lg transition-shadow"
                aria-label="Tout refermer"
              >
                <Minus className="h-4 w-4" />
              </motion.button>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {showScrollTop && (
              <motion.button
                key="scroll-top"
                initial={{ opacity: 0, scale: 0.75 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.75 }}
                transition={{ duration: 0.18 }}
                onClick={() => scrollContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" })}
                className="h-10 w-10 max-xl:h-11 max-xl:w-11 rounded-full bg-background border shadow-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:shadow-lg transition-shadow"
                aria-label="Remonter en haut"
              >
                <ArrowUp className="h-4 w-4" />
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>
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
            className="shrink-0 border-l flex flex-col overflow-hidden bg-white dark:bg-background"
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
        <DrawerContent className="h-[calc(var(--vvh)*0.85)] p-0">
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
