"use client"

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
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  MessageSquare,
  ChevronDown,
} from "lucide-react"
import { ProjectDiscussion } from "@/components/projects/project-discussion"
import { FileViewer } from "@/components/projects/file-viewer"
import { haptics } from "@/lib/haptics"
import { cn } from "@/lib/utils"
import { fetchWithTimeout } from "@/lib/fetch-timeout"
import { ContributorHeader } from "./contributor-header"
import { ContributorCTA } from "./contributor-cta"
import { ContributorTaskCard } from "./contributor-task-card"

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

  const [pendingSuggestions, setPendingSuggestions] = useState<Task[]>(
    initialTasks.filter((t) => t.status === "suggestion")
  )
  const [docsOpen, setDocsOpen] = useState(true)
  const [tasksOpen, setTasksOpen] = useState(true)
  const [discussionOpen, setDiscussionOpen] = useState(false)
  const [discussionCount, setDiscussionCount] = useState(0)

  const [docsRead, setDocsRead] = useState(true)
  const [tasksRead, setTasksRead] = useState(true)
  const [discussionRead, setDiscussionRead] = useState(true)

  useEffect(() => {
    const docsKey = `chalto_seen_docs_${contributor.invite_token}`
    const tasksKey = `chalto_seen_tasks_${contributor.invite_token}`
    try {
      const seenDocs: string[] = JSON.parse(localStorage.getItem(docsKey) ?? "[]")
      if (!initialDocs.every((dc) => seenDocs.includes(dc.document_id))) setDocsRead(false)
    } catch (e) {
      if (process.env.NODE_ENV === "development")
        console.warn("[contributor-space] localStorage read error", e)
    }
    try {
      const seenTasks: string[] = JSON.parse(localStorage.getItem(tasksKey) ?? "[]")
      const ids = initialTasks.filter((t) => t.status !== "suggestion").map((t) => t.id)
      if (ids.length > 0 && !ids.every((id) => seenTasks.includes(id))) setTasksRead(false)
    } catch (e) {
      if (process.env.NODE_ENV === "development")
        console.warn("[contributor-space] localStorage read error", e)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const markDocsRead = () => {
    try {
      const docsKey = `chalto_seen_docs_${contributor.invite_token}`
      localStorage.setItem(docsKey, JSON.stringify(initialDocs.map((dc) => dc.document_id)))
    } catch (e) {
      if (process.env.NODE_ENV === "development")
        console.warn("[contributor-space] localStorage write error", e)
    }
    setDocsRead(true)
  }

  const markTasksRead = () => {
    try {
      const tasksKey = `chalto_seen_tasks_${contributor.invite_token}`
      localStorage.setItem(tasksKey, JSON.stringify(tasks.map((t) => t.id)))
    } catch (e) {
      if (process.env.NODE_ENV === "development")
        console.warn("[contributor-space] localStorage write error", e)
    }
    setTasksRead(true)
  }

  useEffect(() => {
    if (discussionCount === 0) return
    try {
      const discussionKey = `chalto_seen_discussion_${contributor.invite_token}`
      const stored = parseInt(localStorage.getItem(discussionKey) ?? "0", 10)
      if (discussionCount > stored) setDiscussionRead(false)
    } catch (e) {
      if (process.env.NODE_ENV === "development")
        console.warn("[contributor-space] localStorage read error", e)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [discussionCount])

  const markDiscussionRead = () => {
    try {
      const discussionKey = `chalto_seen_discussion_${contributor.invite_token}`
      localStorage.setItem(discussionKey, String(discussionCount))
    } catch (e) {
      if (process.env.NODE_ENV === "development")
        console.warn("[contributor-space] localStorage write error", e)
    }
    setDiscussionRead(true)
  }

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
          setTasksRead(false)
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
      <ContributorHeader
        logoUrl={logoUrl}
        companyName={companyName}
        docsCount={docs.length}
        tasksCount={tasks.length}
        discussionCount={discussionCount}
        docsRead={docsRead}
        tasksRead={tasksRead}
        discussionRead={discussionRead}
        onDocsClick={() => {
          markDocsRead()
          scrollToSection(docsRef, setDocsOpen)
        }}
        onTasksClick={() => {
          markTasksRead()
          scrollToSection(tasksRef, setTasksOpen)
        }}
        onDiscussionClick={() => {
          markDiscussionRead()
          scrollToSection(discussionRef, setDiscussionOpen)
        }}
      />

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
              <span className="inline-flex items-center justify-center text-xs text-muted-foreground bg-muted h-5 min-w-5 rounded-full">
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

                        {doc.file_url && (
                          <FileViewer
                            fileUrl={doc.file_url}
                            fileName={doc.file_name ?? doc.name}
                            fileType={doc.file_type ?? ""}
                          />
                        )}

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
                                      contributorId: contributor.id,
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
                                      contributorId: contributor.id,
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
                                      contributorId: contributor.id,
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
              <span className="inline-flex items-center justify-center text-xs text-muted-foreground bg-muted h-5 min-w-5 rounded-full">
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
                  {tasks.map((task) => (
                    <ContributorTaskCard
                      key={task.id}
                      task={task}
                      onStatusChange={handleStatusChange}
                      authorName={contributor.name}
                      authorRole="prestataire"
                      contributorToken={contributor.invite_token}
                      initialComments={initialTaskComments[task.id]}
                    />
                  ))}
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

        <ContributorCTA />
      </div>
    </div>
  )
}
