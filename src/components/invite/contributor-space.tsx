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
  logoUrl?: string | null
  companyName?: string | null
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
  documents: {
    id: string
    name: string
    type: string
    status: string
    file_url?: string | null
    file_name?: string | null
    file_type?: string | null
  } | null
}

export function ContributorSpace({
  contributor,
  proName,
  tasks: initialTasks,
  logoUrl,
  companyName,
}: ContributorSpaceProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [suggestion, setSuggestion] = useState("")
  const [suggestionDesc, setSuggestionDesc] = useState("")
  const [suggesting, setSuggesting] = useState(false)
  const [showSuggestForm, setShowSuggestForm] = useState(false)
  const supabase = useMemo(() => createClient(), [])

  const [docs, setDocs] = useState<DocRow[]>([])
  const [docDecision, setDocDecision] = useState<Record<string, "approved" | "rejected" | null>>({})
  const [docComment, setDocComment] = useState<Record<string, string>>({})
  const [docLoading, setDocLoading] = useState<Record<string, boolean>>({})
  const [transmissionCommentSent, setTransmissionCommentSent] = useState<Record<string, boolean>>(
    {}
  )

  const [docsOpen, setDocsOpen] = useState(true)
  const [tasksOpen, setTasksOpen] = useState(true)
  const [discussionOpen, setDiscussionOpen] = useState(false)

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

  useEffect(() => {
    supabase
      .from("document_contributors")
      .select(
        "document_id, request_type, documents(id, name, type, status, file_url, file_name, file_type, created_at)"
      )
      .eq("contributor_id", contributor.id)
      .then(({ data }) => {
        if (data) {
          const sorted = [...data].sort((a, b) => {
            const da = (a.documents as { created_at?: string } | null)?.created_at ?? ""
            const db = (b.documents as { created_at?: string } | null)?.created_at ?? ""
            return db.localeCompare(da)
          })
          setDocs(sorted as unknown as DocRow[])
        }
      })
  }, [contributor.id, supabase])

  useEffect(() => {
    const channel = supabase
      .channel(`tasks:${contributor.project_id}`)
      .on("broadcast", { event: "task_updated" }, ({ payload }) => {
        const { taskId, status } = payload as { taskId: string; status: string }
        setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status } : t)))
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
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, contributor.project_id, contributor.contact_id])

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    const prevStatus = tasks.find((t) => t.id === taskId)?.status
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)))

    const res = await fetch("/api/task-status", {
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

    const res = await fetch("/api/task-suggest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId: contributor.project_id,
        title: suggestion,
        description: suggestionDesc || null,
        contributorToken: contributor.invite_token,
        contributorName: contributor.name,
      }),
    })

    if (!res.ok) {
      toast.error("Erreur lors de l'envoi")
    } else {
      toast.success("Suggestion envoyée au professionnel ✅")
      setSuggestion("")
      setSuggestionDesc("")
      setShowSuggestForm(false)
    }
    setSuggesting(false)
  }

  const handleDiscussionSend = async (content: string) => {
    const res = await fetch("/api/project-message", {
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

  const doneTasks = tasks.filter((t) => t.status === "done").length
  const progress = tasks.length > 0 ? Math.round((doneTasks / tasks.length) * 100) : 0

  return (
    <div className="min-h-screen bg-background">
      {/* Header — sticky */}
      <header className="sticky top-0 z-20 border-b bg-card">
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

      {/* Navigation sticky */}
      <nav className="sticky top-14.25 z-10 bg-background/95 backdrop-blur border-b">
        <div className="max-w-2xl mx-auto px-4 flex">
          <button
            onClick={() => scrollToSection(docsRef, setDocsOpen)}
            className="flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <FileText className="h-4 w-4" />
            Documents
            {docs.length > 0 && (
              <span className="text-xs bg-muted px-1.5 py-0.5 rounded-full">{docs.length}</span>
            )}
          </button>
          <button
            onClick={() => scrollToSection(tasksRef, setTasksOpen)}
            className="flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <CheckSquare className="h-4 w-4" />
            Tâches
            {tasks.length > 0 && (
              <span className="text-xs bg-muted px-1.5 py-0.5 rounded-full">{tasks.length}</span>
            )}
          </button>
          <button
            onClick={() => scrollToSection(discussionRef, setDiscussionOpen)}
            className="flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <MessageSquare className="h-4 w-4" />
            Discussion
          </button>
        </div>
      </nav>

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
                            <p className="font-medium text-sm">{doc.name}</p>
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
                                  const res = await fetch("/api/validate-contributor", {
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
                                      payload: { documentId: doc.id, status: "commented" },
                                    })
                                    supabase.removeChannel(ch)
                                  }
                                  setTransmissionCommentSent((prev) => ({
                                    ...prev,
                                    [doc.id]: true,
                                  }))
                                  setDocLoading((prev) => ({ ...prev, [doc.id]: false }))
                                  haptics.success()
                                  toast.success("Document marqué comme lu ✅")
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
                                className="flex-1"
                                disabled={docLoading[doc.id]}
                                onClick={async () => {
                                  setDocLoading((prev) => ({ ...prev, [doc.id]: true }))
                                  await fetch("/api/validate-contributor", {
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
                              <Button
                                size="sm"
                                variant="destructive"
                                className="flex-1"
                                disabled={docLoading[doc.id]}
                                onClick={async () => {
                                  setDocLoading((prev) => ({ ...prev, [doc.id]: true }))
                                  await fetch("/api/validate-contributor", {
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
                        />
                      </Card>
                    )
                  })}
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
