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
import { ProjectStepper } from "@/components/projects/project-stepper"
import { ProjectTasks } from "@/components/projects/project-tasks"
import { ProjectDiscussion } from "@/components/projects/project-discussion"
import { ProjectContributors } from "@/components/projects/project-contributors"
import {
  ProjectDetailsDialog,
  type ProjectInfo,
} from "@/components/projects/project-details-dialog"
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer"

interface Document {
  id: string
  name: string
  type: string
  status: string
  version: number
  validation_token: string
  project_id: string
  file_url?: string
  file_name?: string
  file_type?: string
  file_size?: number
  created_at: string
}

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

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  draft: { label: "Brouillon", variant: "outline" },
  active: { label: "En cours", variant: "default" },
  completed: { label: "Terminé", variant: "secondary" },
  archived: { label: "Archivé", variant: "outline" },
}

interface ProjectPageClientProps {
  project: Project
  documents: Document[]
  userId: string
  phase: string
  contacts: Contact[]
  authorName: string
  initialHighlightId?: string | null
}

export function ProjectPageClient({
  project,
  documents,
  userId,
  phase,
  contacts,
  authorName,
  initialHighlightId,
}: ProjectPageClientProps) {
  const { label: statusLabel, variant: statusVariant } =
    statusMap[project.status] ?? statusMap.draft
  const supabase = useMemo(() => createClient(), [])
  const [selectedDocId, setSelectedDocId] = useState<string | null>(
    initialHighlightId?.startsWith("doc_") ? initialHighlightId.slice(4) : null
  )
  const [localDocs, setLocalDocs] = useState(documents)
  const [highlightedId, setHighlightedId] = useState<string | null>(initialHighlightId ?? null)

  const highlightedDocId = highlightedId?.startsWith("doc_") ? highlightedId.slice(4) : null
  const highlightedTaskId = highlightedId?.startsWith("task_") ? highlightedId.slice(5) : null
  const openDiscussion = highlightedId === "discussion"

  useEffect(() => {
    if (!highlightedId) return
    const t = setTimeout(() => setHighlightedId(null), 2500)
    return () => clearTimeout(t)
  }, [highlightedId])
  const selectedDoc = useMemo(
    () => localDocs.find((d) => d.id === selectedDocId) ?? null,
    [localDocs, selectedDocId]
  )

  const handleDocStatusChange = (docId: string, status: string, version?: number) => {
    setLocalDocs((prev) =>
      prev.map((d) =>
        d.id === docId ? { ...d, status, ...(version !== undefined && { version }) } : d
      )
    )
  }

  useEffect(() => {
    setLocalDocs(documents)
  }, [documents])

  useEffect(() => {
    let cancelled = false
    let channel: ReturnType<typeof supabase.channel> | null = null

    void supabase.auth.getSession().then(({ data: { session } }) => {
      if (cancelled) return
      if (session?.access_token) supabase.realtime.setAuth(session.access_token)

      channel = supabase
        .channel(`documents:${project.id}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "documents",
            filter: `project_id=eq.${project.id}`,
          },
          (payload) => {
            const newDoc = payload.new as Document
            setLocalDocs((prev) =>
              prev.some((d) => d.id === newDoc.id) ? prev : [newDoc, ...prev]
            )
            setHighlightedId(`doc_${newDoc.id}`)
          }
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "documents",
            filter: `project_id=eq.${project.id}`,
          },
          (payload) => {
            const updated = payload.new as Document
            setLocalDocs((prev) => prev.map((d) => (d.id === updated.id ? updated : d)))
          }
        )
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "validations",
          },
          (payload) => {
            const v = payload.new as { document_id: string; status: string }
            setLocalDocs((prev) =>
              prev.map((d) => (d.id === v.document_id ? { ...d, status: v.status } : d))
            )
          }
        )
        .on("broadcast", { event: "document_status_updated" }, ({ payload }) => {
          const { documentId, status } = payload as { documentId: string; status: string }
          setLocalDocs((prev) => prev.map((d) => (d.id === documentId ? { ...d, status } : d)))
        })
        .subscribe()
    })

    return () => {
      cancelled = true
      if (channel) void supabase.removeChannel(channel)
    }
  }, [project.id, supabase])
  const [detailsOpen, setDetailsOpen] = useState(true)
  const [docsOpen, setDocsOpen] = useState(
    !isChantierPhase(phase) || (initialHighlightId?.startsWith("doc_") ?? false)
  )
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
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(min-width: 1280px)").matches
  )

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1280px)")
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
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
                <h1 className="text-2xl font-bold tracking-tight truncate">{project.name}</h1>
                <Badge variant={statusVariant} className="shrink-0">
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
                  {/* Infos client — hug content */}
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

                  {/* Stepper phase — fill */}
                  <div className="flex-1 min-w-0 px-6 md:px-8 py-4">
                    <ProjectStepper
                      projectId={project.id}
                      currentPhase={phase}
                      onPhaseChange={(newPhase) => {
                        if (isChantierPhase(newPhase)) {
                          setDocsOpen(false)
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
        <div className="flex-1 overflow-auto divide-y divide-border">
          {/* Documents */}
          <div className="px-6 md:px-8 py-6 md:py-8">
            <ProjectDocuments
              documents={localDocs}
              projectId={project.id}
              selectedDocId={selectedDoc?.id ?? null}
              onSelectDoc={(doc) => setSelectedDocId(doc?.id ?? null)}
              isOpen={docsOpen}
              onToggle={() => {
                if (docsOpen) setSelectedDocId(null)
                setDocsOpen((v) => !v)
              }}
              readOnly={phase === "cloture"}
              highlightedId={highlightedDocId}
            />
          </div>

          {/* Prestataires + Kanban tâches — phases chantier et au-delà */}
          {isChantierPhase(phase) && (
            <>
              <div className="px-6 md:px-8 py-6 md:py-8">
                <ProjectContributors projectId={project.id} contacts={contacts} />
              </div>
              <div className="px-6 md:px-8 py-6 md:py-8">
                <ProjectTasks
                  projectId={project.id}
                  userId={userId}
                  contacts={contacts}
                  authorName={authorName}
                  readOnly={phase === "cloture"}
                  highlightedId={highlightedTaskId}
                />
              </div>
              <div className="px-6 md:px-8 py-6 md:py-8">
                <ProjectDiscussion
                  projectId={project.id}
                  authorName={authorName}
                  authorRole="pro"
                  readOnly={phase === "cloture"}
                  autoOpen={openDiscussion}
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
              <DocumentPanel
                key={selectedDoc.id}
                document={selectedDoc}
                userId={userId}
                phase={phase}
                clientName={project.client_name}
                onClose={() => setSelectedDocId(null)}
                showClose
                onStatusChange={handleDocStatusChange}
              />
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
            <DocumentPanel
              key={selectedDoc.id}
              document={selectedDoc}
              userId={userId}
              phase={phase}
              clientName={project.client_name}
              onClose={() => setSelectedDocId(null)}
              onStatusChange={handleDocStatusChange}
            />
          )}
        </DrawerContent>
      </Drawer>
    </div>
  )
}
