"use client"

import Image from "next/image"
import { useState, useMemo, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
}

interface ContributorSpaceProps {
  contributor: {
    id: string
    name: string
    project_id: string
    contact_id: string
    projects?: {
      id: string
      name: string
      phase: string
    }
  }
  proName: string
  tasks: Task[]
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

export function ContributorSpace({
  contributor,
  proName,
  tasks: initialTasks,
}: ContributorSpaceProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [suggestion, setSuggestion] = useState("")
  const [suggestionDesc, setSuggestionDesc] = useState("")
  const [suggesting, setSuggesting] = useState(false)
  const [showSuggestForm, setShowSuggestForm] = useState(false)
  const supabase = useMemo(() => createClient(), [])

  type DocRow = {
    document_id: string
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
  const [docs, setDocs] = useState<DocRow[]>([])
  const [docDecision, setDocDecision] = useState<Record<string, "approved" | "rejected" | null>>({})
  const [docComment, setDocComment] = useState<Record<string, string>>({})
  const [docLoading, setDocLoading] = useState<Record<string, boolean>>({})

  useEffect(() => {
    supabase
      .from("document_contributors")
      .select("document_id, documents(id, name, type, status, file_url, file_name, file_type)")
      .eq("contributor_id", contributor.id)
      .then(({ data }) => {
        if (data) setDocs(data as unknown as DocRow[])
      })
  }, [contributor.id, supabase])

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    await supabase.from("tasks").update({ status: newStatus }).eq("id", taskId)
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)))
    toast.success(newStatus === "done" ? "Tâche terminée ✅" : "Statut mis à jour")
  }

  const handleSuggest = async () => {
    if (!suggestion.trim()) return
    setSuggesting(true)

    const { error } = await supabase.from("tasks").insert({
      project_id: contributor.project_id,
      title: suggestion,
      description: suggestionDesc || null,
      status: "suggestion",
      suggested_by: contributor.name,
      assigned_to: contributor.contact_id,
    })

    if (error) {
      toast.error("Erreur lors de l'envoi")
    } else {
      toast.success("Suggestion envoyée au professionnel ✅")
      setSuggestion("")
      setSuggestionDesc("")
      setShowSuggestForm(false)
    }
    setSuggesting(false)
  }

  const doneTasks = tasks.filter((t) => t.status === "done").length
  const progress = tasks.length > 0 ? Math.round((doneTasks / tasks.length) * 100) : 0

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/Logo.svg" alt="Chalto" width={24} height={24} />
            <span className="font-bold">Chalto</span>
          </div>
          <Badge variant="outline" className="text-xs">
            Espace prestataire
          </Badge>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Contexte projet */}
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">
            Invité par <strong>{proName}</strong>
          </p>
          <h1 className="text-2xl font-bold tracking-tight">{contributor.projects?.name}</h1>
          <p className="text-sm text-muted-foreground">
            Bonjour {contributor.name} — voici vos tâches sur ce projet
          </p>
        </div>

        {/* Progression */}
        {tasks.length > 0 && (
          <Card>
            <CardContent className="p-4 space-y-3">
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
              <p className="text-xs text-muted-foreground">
                {progress === 100
                  ? "🎉 Toutes les tâches sont terminées !"
                  : `${progress}% complété`}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Tâches */}
        <div className="space-y-3">
          <h2 className="font-semibold">Mes tâches</h2>

          {tasks.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <CheckSquare className="h-8 w-8 text-muted-foreground mb-3" />
                <p className="font-medium text-sm">Aucune tâche assignée</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {proName} n&apos;a pas encore assigné de tâches
                </p>
              </CardContent>
            </Card>
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
                          {/* Checkbox visuel */}
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
                    />
                  </Card>
                )
              })}
            </div>
          )}
        </div>

        {/* Discussion projet */}
        <ProjectDiscussion
          projectId={contributor.project_id}
          authorName={contributor.name}
          authorRole="prestataire"
        />

        {/* Documents à valider */}
        {docs.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Documents à valider
            </h3>
            {docs.map((dc) => {
              const doc = dc.documents
              if (!doc) return null
              const decision = docDecision[doc.id]
              return (
                <Card key={doc.id}>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{doc.name}</p>
                        <p className="text-xs text-muted-foreground">{doc.type}</p>
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

                    {!decision && (
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
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Suggérer une tâche */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Suggérer une tâche
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {!showSuggestForm ? (
              <Button variant="outline" className="w-full" onClick={() => setShowSuggestForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Proposer une tâche à {proName}
              </Button>
            ) : (
              <div className="space-y-3">
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
                    className="flex-1"
                    onClick={() => setShowSuggestForm(false)}
                  >
                    Annuler
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleSuggest}
                    disabled={suggesting || !suggestion.trim()}
                  >
                    {suggesting ? "Envoi..." : "Envoyer la suggestion"}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

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
              <Link href="/register">
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
