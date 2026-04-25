"use client"

import Image from "next/image"
import { useState, useMemo, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import {
  CheckSquare,
  ArrowRight,
  Plus,
  Check,
  Clock,
  Zap,
  FileText,
  Users,
  CheckCircle,
  XCircle,
  MessageSquare,
  ChevronDown,
} from "lucide-react"
import { TaskComments } from "@/components/projects/task-comments"
import { ProjectDiscussion } from "@/components/projects/project-discussion"
import { FileViewer } from "@/components/projects/file-viewer"
import { haptics } from "@/lib/haptics"
import { cn } from "@/lib/utils"
import { fetchWithTimeout } from "@/lib/fetch-timeout"
import Link from "next/link"

interface Task {
  id: string
  title: string
  description?: string
  status: string
  due_date?: string
  assigned_to?: string
}

interface ContributorSpaceProps {
  contributor: {
    id: string
    name: string
    project_id: string
    contact_id: string
    invite_token: string
    projects?: {
      id: string
      name: string
      phase: string
    }
  }
  proName: string
  tasks: Task[]
  initialDocs?: DocRow[]
  logoUrl?: string | null
  companyName?: string | null
  initialTaskComments?: Record<
    string,
    {
      id: string
      author_name: string
      author_role: "pro" | "prestataire"
      content: string
      created_at: string
    }[]
  >
}

const statusConfig: Record<
  string,
  { label: string; color: string; next?: string; nextLabel?: string }
> = {
  todo: {
    label: "À faire",
    color: "bg-muted text-muted-foreground",
    next: "in_progress",
    nextLabel: "Démarrer",
  },
  in_progress: {
    label: "En cours",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    next: "done",
    nextLabel: "Terminer",
  },
  done: {
    label: "Terminé",
    color: "bg-primary/10 text-primary",
  },
}

const ctaFeatures = [
  { icon: FileText, label: "Documents" },
  { icon: Users, label: "Clients" },
  { icon: Zap, label: "Validations" },
]

type DocRow = {
  document_id: string
  request_type?: "validation" | "transmission" | null
  pro_message?: string | null
  documents: {
    id: string
    name: string
    type: string
    status: string
    version?: number | null
    file_url?: string | null
    file_name?: string | null
    file_type?: string | null
  } | null
}

export function ContributorSpace({
  contributor,
  proName,
  tasks: initialTasks,
  initialDocs = [],
  logoUrl,
  companyName,
  initialTaskComments = {},
}: ContributorSpaceProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks.filter((t) => t.status !== "suggestion"))
  const [suggestion, setSuggestion] = useState("")
  const [suggestionDesc, setSuggestionDesc] = useState("")
  const [suggesting, setSuggesting] = useState(false)
  const [showSuggestForm, setShowSuggestForm] = useState(false)
  const supabase = useMemo(() => createClient(), [])

  const docs = initialDocs
  const [docDecision, setDocDecision] = useState<Record<string, "approved" | "rejected" | null>>({})
  const [docComment, setDocComment] = useState<Record<string, string>>({})
  const [docLoading, setDocLoading] = useState<Record<string, boolean>>({})
  const [docVersions, setDocVersions] = useState<
    Record<string, { version: number; file_url: string; file_name: string | null }[]>
  >({})
  const [activeVersionTab, setActiveVersionTab] = useState<Record<string, number | null>>({})

  useEffect(() => {
    const docIds = initialDocs.map((dc) => dc.document_id).filter(Boolean)
    if (docIds.length === 0) return
    supabase
      .from("document_versions")
      .select("document_id, version, file_url, file_name")
      .in("document_id", docIds)
      .order("version", { ascending: false })
      .then(({ data }) => {
        if (!data) return
        const byDoc: Record<
          string,
          { version: number; file_url: string; file_name: string | null }[]
        > = {}
        for (const row of data) {
          const r = row as {
            document_id: string
            version: number
            file_url: string
            file_name: string | null
          }
          if (!byDoc[r.document_id]) byDoc[r.document_id] = []
          byDoc[r.document_id].push({
            version: r.version,
            file_url: r.file_url,
            file_name: r.file_name,
          })
        }
        setDocVersions(byDoc)
      })
  }, [initialDocs, supabase])

  const [pendingSuggestions, setPendingSuggestions] = useState<Task[]>(
    initialTasks.filter((t) => t.status === "suggestion")
  )
  const [docsOpen, setDocsOpen] = useState(true)
  const [tasksOpen, setTasksOpen] = useState(true)
  const [discussionOpen, setDiscussionOpen] = useState(false)
  const [discussionCount, setDiscussionCount] = useState(0)

  const docsRef = useRef<HTMLDivElement>(null)
  const tasksRef = useRef<HTMLDivElement>(null)
  const discussionRef = useRef<HTMLDivElement>(null)

  const scrollToSection = (
    ref: React.RefObject<HTMLDivElement | null>,
    openFn: (v: boolean) => void
  ) => {
    openFn(true)
    setTimeout(() => {
      ref.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    }, 100)
  }

  // Initialise l'état "lu" depuis les docs server-side pour les transmissions déjà consultées
  const [transmissionCommentSent, setTransmissionCommentSent] = useState<Record<string, boolean>>(
    () => {
      const alreadyRead: Record<string, boolean> = {}
      for (const dc of initialDocs) {
        const doc = dc.documents as { id?: string; status?: string } | null
        if (dc.request_type === "transmission" && doc?.status === "commented" && doc.id) {
          alreadyRead[doc.id] = true
        }
      }
      return alreadyRead
    }
  )

  useEffect(() => {
    const channel = supabase
      .channel(`tasks:${contributor.project_id}`)
      .on("broadcast", { event: "task_updated" }, ({ payload }) => {
        const { taskId, status } = payload as { taskId: string; status: string }
        setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status } : t)))
        setPendingSuggestions((prev) => prev.filter((t) => t.id !== taskId))
      })
      .on("broadcast", { event: "task_created" }, ({ payload }) => {
        const task = payload as Task
        if (
          task.assigned_to === contributor.contact_id &&
          task.status !== "suggestion" &&
          task.status !== "rejected"
        ) {
          setTasks((prev) => (prev.some((t) => t.id === task.id) ? prev : [...prev, task]))
        }
      })
      .on("broadcast", { event: "task_deleted" }, ({ payload }) => {
        const { taskId } = payload as { taskId: string }
        setTasks((prev) => prev.filter((t) => t.id !== taskId))
      })
      .subscribe((_status, err) => {
        if (err) console.error("[tasks] Realtime error:", err)
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, contributor.project_id, contributor.contact_id])

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    const prevStatus = tasks.find((t) => t.id === taskId)?.status
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)))

    const res = await fetchWithTimeout("/api/task-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        taskId,
        status: newStatus,
        contributorToken: contributor.invite_token,
      }),
    })

    if (!res.ok) {
      if (prevStatus !== undefined)
        setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: prevStatus } : t)))
      toast.error("Erreur lors de la mise à jour")
      return
    }
    toast.success(newStatus === "done" ? "Tâche terminée ✅" : "Statut mis à jour")
  }

  const handleSuggest = async () => {
    if (!suggestion.trim()) return
    setSuggesting(true)

    try {
      const res = await fetchWithTimeout("/api/task-suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: contributor.project_id,
          title: suggestion,
          description: suggestionDesc || undefined,
          contributorToken: contributor.invite_token,
          contributorName: contributor.name,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        toast.error((data as { error?: string }).error ?? "Erreur lors de l'envoi")
      } else {
        const data = await res.json().catch(() => ({}))
        if (data.task) setPendingSuggestions((prev) => [...prev, data.task as Task])
        toast.success("Suggestion envoyée au professionnel ✅")
        setSuggestion("")
        setSuggestionDesc("")
        setShowSuggestForm(false)
      }
    } catch {
      toast.error("Erreur réseau — réessayez")
    } finally {
      setSuggesting(false)
    }
  }

  const handleDiscussionSend = async (content: string) => {
    const res = await fetchWithTimeout("/api/project-message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId: contributor.project_id,
        authorName: contributor.name,
        content,
        contributorToken: contributor.invite_token,
      }),
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.message ?? null
  }

  const { doneTasks, progress } = useMemo(() => {
    const done = tasks.filter((t) => t.status === "done").length
    return {
      doneTasks: done,
      progress: tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0,
    }
  }, [tasks])

  return (
    <div className="min-h-screen bg-background">
      {/* Header + Nav — un seul bloc sticky pour éviter tout écart */}
      <div className="sticky top-0 z-20">
        <header className="border-b bg-card">
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt={companyName ?? "Logo"}
                width={120}
                height={32}
                className="object-contain max-h-8"
              />
            ) : (
              <div className="flex items-center gap-2">
                <Image src="/Logo.svg" alt="Chalto" width={24} height={24} />
                <span className="font-bold">Chalto</span>
              </div>
            )}
            <Badge variant="outline" className="text-xs">
              Espace prestataire
            </Badge>
          </div>
        </header>

        {/* Navigation */}
        <nav className="bg-background/95 backdrop-blur border-b">
          <div className="max-w-2xl mx-auto px-4 flex">
            <button
              onClick={() => scrollToSection(docsRef, setDocsOpen)}
              className="flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors min-w-0 flex-1 justify-center"
            >
              <span className="truncate">Documents</span>
              {docs.length > 0 && (
                <span className="text-xs bg-muted px-1.5 py-0.5 rounded-full shrink-0">
                  {docs.length}
                </span>
              )}
            </button>
            <button
              onClick={() => scrollToSection(tasksRef, setTasksOpen)}
              className="flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors min-w-0 flex-1 justify-center"
            >
              <span className="truncate">Tâches</span>
              {tasks.length > 0 && (
                <span className="text-xs bg-muted px-1.5 py-0.5 rounded-full shrink-0">
                  {tasks.length}
                </span>
              )}
            </button>
            <button
              onClick={() => scrollToSection(discussionRef, setDiscussionOpen)}
              className="flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors min-w-0 flex-1 justify-center"
            >
              <span className="truncate">Discussion</span>
              {discussionCount > 0 && (
                <span className="text-xs bg-muted px-1.5 py-0.5 rounded-full shrink-0">
                  {discussionCount}
                </span>
              )}
            </button>
          </div>
        </nav>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-8">
        {/* Contexte projet */}
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">
            Invité par <strong>{proName}</strong>
          </p>
          <h1 className="text-2xl font-bold tracking-tight">{contributor.projects?.name}</h1>
          <p className="text-sm text-muted-foreground">Bonjour {contributor.name}</p>
        </div>

        {/* Progression */}
        {tasks.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Progression</span>
              <span className="text-muted-foreground">
                {doneTasks}/{tasks.length} tâches
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            {progress === 100 && (
              <p className="text-xs text-muted-foreground">🎉 Toutes les tâches sont terminées !</p>
            )}
          </div>
        )}

        {/* Section Documents */}
        <section ref={docsRef} className="space-y-3 scroll-mt-28">
          <button
            onClick={() => setDocsOpen(!docsOpen)}
            className="flex items-center gap-1.5 group px-2 py-1 -mx-2 rounded-md hover:bg-muted transition-colors"
          >
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 text-muted-foreground transition-transform duration-200",
                !docsOpen && "-rotate-90"
              )}
            />
            <span className="font-semibold group-hover:text-foreground transition-colors">
              Documents
            </span>
            {docs.length > 0 && (
              <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
                {docs.length}
              </span>
            )}
          </button>

          {docsOpen &&
            (docs.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Aucun document partagé
              </p>
            ) : (
              <div className="space-y-3">
                {docs.map((dc) => {
                  const doc = dc.documents
                  if (!doc) return null
                  const reqType = dc.request_type ?? "validation"
                  const decision = docDecision[doc.id]
                  return (
                    <Card key={doc.id}>
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-medium text-sm">
                              {doc.name}
                              {doc.version != null && doc.version > 1 && (
                                <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                                  v{doc.version}
                                </span>
                              )}
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <p className="text-xs text-muted-foreground">{doc.type}</p>
                              <Badge variant="outline" className="text-xs px-1.5 py-0 h-4">
                                {reqType === "transmission" ? "Pour information" : "À valider"}
                              </Badge>
                            </div>
                          </div>
                          {decision && (
                            <Badge variant={decision === "approved" ? "default" : "destructive"}>
                              {decision === "approved" ? "Approuvé" : "Refusé"}
                            </Badge>
                          )}
                        </div>

                        {dc.pro_message && (
                          <div className="bg-muted/50 border rounded-lg px-3 py-2.5 text-sm">
                            <p className="text-xs font-medium text-foreground mb-0.5">
                              Message de votre professionnel
                            </p>
                            <p className="text-muted-foreground leading-relaxed">
                              {dc.pro_message}
                            </p>
                          </div>
                        )}

                        {(() => {
                          const prevVersions = docVersions[doc.id] ?? []
                          const activeTab = activeVersionTab[doc.id] ?? null
                          const activePrev =
                            activeTab !== null
                              ? (prevVersions.find((pv) => pv.version === activeTab) ?? null)
                              : null
                          const displayUrl = activePrev ? activePrev.file_url : doc.file_url
                          const displayName = activePrev
                            ? (activePrev.file_name ?? doc.name)
                            : (doc.file_name ?? doc.name)
                          return (
                            <>
                              {prevVersions.length > 0 && (
                                <div className="flex text-xs border rounded-lg overflow-hidden">
                                  <button
                                    onClick={() =>
                                      setActiveVersionTab((prev) => ({ ...prev, [doc.id]: null }))
                                    }
                                    className={cn(
                                      "flex-1 px-3 py-1.5 transition-colors",
                                      activeTab === null
                                        ? "bg-background font-medium"
                                        : "bg-muted/50 text-muted-foreground hover:text-foreground"
                                    )}
                                  >
                                    V{doc.version ?? 1} · En cours
                                  </button>
                                  {prevVersions.map((pv) => (
                                    <button
                                      key={pv.version}
                                      onClick={() =>
                                        setActiveVersionTab((prev) => ({
                                          ...prev,
                                          [doc.id]: pv.version,
                                        }))
                                      }
                                      className={cn(
                                        "flex-1 px-3 py-1.5 transition-colors border-l",
                                        activeTab === pv.version
                                          ? "bg-background font-medium"
                                          : "bg-muted/50 text-muted-foreground hover:text-foreground"
                                      )}
                                    >
                                      V{pv.version}
                                    </button>
                                  ))}
                                </div>
                              )}
                              {displayUrl && (
                                <FileViewer
                                  fileUrl={displayUrl}
                                  fileName={displayName}
                                  fileType={doc.file_type ?? ""}
                                />
                              )}
                            </>
                          )
                        })()}

                        {reqType === "transmission" ? (
                          transmissionCommentSent[doc.id] ? (
                            <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-lg px-3 py-2">
                              <MessageSquare className="h-4 w-4 shrink-0" />
                              <span>
                                Lu
                                {docComment[doc.id]?.trim() ? ` · commentaire envoyé` : ""}
                              </span>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <Textarea
                                placeholder="Ajouter un commentaire (optionnel)..."
                                value={docComment[doc.id] ?? ""}
                                onChange={(e) =>
                                  setDocComment((prev) => ({ ...prev, [doc.id]: e.target.value }))
                                }
                                rows={2}
                                className="text-sm resize-none"
                              />
                              <Button
                                size="sm"
                                variant="outline"
                                className="w-full"
                                disabled={docLoading[doc.id]}
                                onClick={async () => {
                                  setDocLoading((prev) => ({ ...prev, [doc.id]: true }))
                                  const res = await fetchWithTimeout("/api/validate-contributor", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({
                                      documentId: doc.id,
                                      status: "commented",
                                      comment: docComment[doc.id]?.trim() || null,
                                      contributorName: contributor.name,
                                      requestType: "transmission",
                                    }),
                                  })
                                  if (res.ok) {
                                    const ch = supabase.channel(
                                      `documents:${contributor.project_id}`
                                    )
                                    await ch.send({
                                      type: "broadcast",
                                      event: "document_status_updated",
                                      payload: {
                                        documentId: doc.id,
                                        status: "commented",
                                        comment: docComment[doc.id]?.trim() ?? null,
                                        contributorName: contributor.name,
                                      },
                                    })
                                    supabase.removeChannel(ch)
                                    setTransmissionCommentSent((prev) => ({
                                      ...prev,
                                      [doc.id]: true,
                                    }))
                                    haptics.success()
                                    toast.success("Document marqué comme lu ✅")
                                  } else {
                                    const errData = await res.json().catch(() => ({}))
                                    toast.error(
                                      res.status === 429
                                        ? "Trop de requêtes — réessayez dans une minute"
                                        : ((errData as { error?: string }).error ??
                                            "Erreur lors de l'envoi")
                                    )
                                  }
                                  setDocLoading((prev) => ({ ...prev, [doc.id]: false }))
                                }}
                              >
                                Valider la lecture
                              </Button>
                            </div>
                          )
                        ) : !decision ? (
                          <div className="space-y-2">
                            <Textarea
                              placeholder="Commentaire (optionnel)"
                              value={docComment[doc.id] ?? ""}
                              onChange={(e) =>
                                setDocComment((prev) => ({ ...prev, [doc.id]: e.target.value }))
                              }
                              rows={2}
                              className="text-sm resize-none"
                            />
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="destructive"
                                className="flex-1"
                                disabled={docLoading[doc.id]}
                                onClick={async () => {
                                  setDocLoading((prev) => ({ ...prev, [doc.id]: true }))
                                  await fetchWithTimeout("/api/validate-contributor", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({
                                      documentId: doc.id,
                                      status: "rejected",
                                      comment: docComment[doc.id] ?? null,
                                      contributorName: contributor.name,
                                    }),
                                  })
                                  haptics.error()
                                  setDocDecision((prev) => ({ ...prev, [doc.id]: "rejected" }))
                                  setDocLoading((prev) => ({ ...prev, [doc.id]: false }))
                                }}
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Refuser
                              </Button>
                              <Button
                                size="sm"
                                className="flex-1"
                                disabled={docLoading[doc.id]}
                                onClick={async () => {
                                  setDocLoading((prev) => ({ ...prev, [doc.id]: true }))
                                  await fetchWithTimeout("/api/validate-contributor", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({
                                      documentId: doc.id,
                                      status: "approved",
                                      comment: docComment[doc.id] ?? null,
                                      contributorName: contributor.name,
                                    }),
                                  })
                                  haptics.success()
                                  setDocDecision((prev) => ({ ...prev, [doc.id]: "approved" }))
                                  setDocLoading((prev) => ({ ...prev, [doc.id]: false }))
                                }}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approuver
                              </Button>
                            </div>
                          </div>
                        ) : null}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            ))}
        </section>

        {/* Section Tâches */}
        <section ref={tasksRef} className="space-y-3 scroll-mt-28">
          <button
            onClick={() => setTasksOpen(!tasksOpen)}
            className="flex items-center gap-1.5 group px-2 py-1 -mx-2 rounded-md hover:bg-muted transition-colors"
          >
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 text-muted-foreground transition-transform duration-200",
                !tasksOpen && "-rotate-90"
              )}
            />
            <span className="font-semibold group-hover:text-foreground transition-colors">
              Mes tâches
            </span>
            {tasks.length > 0 && (
              <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
                {tasks.length}
              </span>
            )}
          </button>

          {tasksOpen && (
            <>
              {tasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <CheckSquare className="h-8 w-8 text-muted-foreground mb-3" />
                  <p className="font-medium text-sm">Aucune tâche assignée</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {proName} n&apos;a pas encore assigné de tâches
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {tasks.map((task) => {
                    const config = statusConfig[task.status] ?? statusConfig.todo
                    return (
                      <Card
                        key={task.id}
                        className={cn(
                          "transition-all duration-200",
                          task.status === "done" && "opacity-70"
                        )}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3 flex-1">
                              <div
                                className={cn(
                                  "h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 cursor-pointer transition-all",
                                  task.status === "done"
                                    ? "border-primary bg-primary"
                                    : "border-muted-foreground hover:border-primary"
                                )}
                                onClick={() =>
                                  task.status !== "done" && handleStatusChange(task.id, "done")
                                }
                              >
                                {task.status === "done" && (
                                  <Check className="h-3 w-3 text-primary-foreground" />
                                )}
                              </div>

                              <div className="flex-1">
                                <p
                                  className={cn(
                                    "text-sm font-medium",
                                    task.status === "done" && "line-through text-muted-foreground"
                                  )}
                                >
                                  {task.title}
                                </p>
                                {task.description && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {task.description}
                                  </p>
                                )}
                                {task.due_date && (
                                  <div className="flex items-center gap-1 mt-1.5">
                                    <Clock className="h-3 w-3 text-muted-foreground" />
                                    <span className="text-xs text-muted-foreground">
                                      {new Date(task.due_date).toLocaleDateString("fr-FR", {
                                        day: "numeric",
                                        month: "long",
                                      })}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                            <Badge className={cn("text-xs shrink-0", config.color)}>
                              {config.label}
                            </Badge>
                          </div>

                          {config.next && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full h-7 text-xs text-muted-foreground hover:text-foreground mt-2"
                              onClick={() => handleStatusChange(task.id, config.next!)}
                            >
                              {config.nextLabel}
                              <ArrowRight className="ml-1 h-3 w-3" />
                            </Button>
                          )}
                        </CardContent>
                        <TaskComments
                          taskId={task.id}
                          authorName={contributor.name}
                          authorRole="prestataire"
                          contributorToken={contributor.invite_token}
                          initialComments={initialTaskComments[task.id]}
                        />
                      </Card>
                    )
                  })}
                </div>
              )}

              {/* Suggestions en attente de validation pro */}
              {pendingSuggestions.length > 0 && (
                <div className="space-y-2">
                  {pendingSuggestions.map((task) => (
                    <Card key={task.id} className="border-dashed opacity-80">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 flex-1">
                            <Clock className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-muted-foreground">
                                {task.title}
                              </p>
                              {task.description && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  {task.description}
                                </p>
                              )}
                            </div>
                          </div>
                          <Badge className="text-xs shrink-0 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                            En attente
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Suggérer une tâche */}
              <div className="pt-1">
                {!showSuggestForm ? (
                  <button
                    onClick={() => setShowSuggestForm(true)}
                    className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors py-1"
                  >
                    <Plus className="h-4 w-4" />
                    Proposer une tâche à {proName}
                  </button>
                ) : (
                  <div className="space-y-3 border rounded-lg p-3">
                    <Input
                      placeholder="Titre de la tâche suggérée..."
                      value={suggestion}
                      onChange={(e) => setSuggestion(e.target.value)}
                    />
                    <Input
                      placeholder="Détails (optionnel)..."
                      value={suggestionDesc}
                      onChange={(e) => setSuggestionDesc(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => setShowSuggestForm(false)}
                      >
                        Annuler
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={handleSuggest}
                        disabled={suggesting || !suggestion.trim()}
                      >
                        {suggesting ? "Envoi..." : "Envoyer"}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </section>

        {/* Section Discussion */}
        <section ref={discussionRef} className="scroll-mt-28">
          <ProjectDiscussion
            projectId={contributor.project_id}
            authorName={contributor.name}
            authorRole="prestataire"
            onSend={handleDiscussionSend}
            controlledOpen={discussionOpen}
            onControlledOpenChange={setDiscussionOpen}
            onCountChange={setDiscussionCount}
          />
        </section>

        <Separator />

        {/* CTA Chalto */}
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Image src="/Logo.svg" alt="Chalto" width={24} height={24} />
              <span className="font-bold">Chalto</span>
            </div>
            <div>
              <h3 className="font-semibold text-base">
                Et si vous utilisiez Chalto pour vos propres projets ?
              </h3>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                Gérez vos chantiers, partagez vos documents et faites valider vos livrables par vos
                clients — simplement, depuis votre téléphone.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 py-2">
              {ctaFeatures.map((item) => (
                <div key={item.label} className="flex flex-col items-center gap-1.5 text-center">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <item.icon className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-xs text-muted-foreground">{item.label}</span>
                </div>
              ))}
            </div>
            <Button className="w-full" asChild>
              <Link href="/#waitlist">
                Créer mon compte gratuitement
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Gratuit · Sans carte bancaire · Prêt en 2 minutes
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
