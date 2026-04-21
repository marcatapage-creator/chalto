"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import {
  Plus,
  CheckSquare,
  ChevronDown,
  MoreHorizontal,
  Trash2,
  User,
  Calendar,
  ArrowRight,
  ArrowLeft,
  Lightbulb,
  Check,
  X,
} from "lucide-react"
import { haptics } from "@/lib/haptics"
import { StaggerList, StaggerItem, FadeIn } from "@/components/ui/motion"
import { InviteButton } from "@/components/projects/invite-button"
import { TaskComments } from "@/components/projects/task-comments"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface Contact {
  id: string
  name: string
  professions?: { label: string }[]
}

interface Task {
  id: string
  title: string
  description?: string
  status: string
  assigned_to?: string
  suggested_by?: string
  due_date?: string
  contacts?: Contact
}

interface ProjectTasksProps {
  projectId: string
  userId: string
  contacts: Contact[]
  authorName: string
  readOnly?: boolean
}

const columns = [
  { id: "todo", label: "À faire", color: "text-muted-foreground" },
  { id: "in_progress", label: "En cours", color: "text-blue-500" },
  { id: "done", label: "Terminé", color: "text-primary" },
]

export function ProjectTasks({
  projectId,
  userId,
  contacts,
  authorName,
  readOnly = false,
}: ProjectTasksProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [suggestions, setSuggestions] = useState<Task[]>([])
  const [loaded, setLoaded] = useState(false)
  const [localContacts, setLocalContacts] = useState(contacts)
  const [tasksOpen, setTasksOpen] = useState(true)
  const [open, setOpen] = useState(false)
  const [dialogView, setDialogView] = useState<"task" | "new-contact">("task")
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title: "",
    description: "",
    assigned_to: "",
    due_date: "",
  })
  const [contactForm, setContactForm] = useState({ name: "", email: "", phone: "" })
  const [contactLoading, setContactLoading] = useState(false)
  const supabase = useMemo(() => createClient(), [])

  const fetchTasks = useCallback(async () => {
    const { data } = await supabase
      .from("tasks")
      .select("*, contacts(id, name, professions(label))")
      .eq("project_id", projectId)
      .order("created_at", { ascending: true })

    if (data) {
      setTasks(data.filter((t) => t.status !== "suggestion" && t.status !== "rejected"))
      setSuggestions(data.filter((t) => t.status === "suggestion"))
      setLoaded(true)
    }
  }, [supabase, projectId])

  useEffect(() => {
    const channel = supabase
      .channel(`tasks:${projectId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tasks",
          filter: `project_id=eq.${projectId}`,
        },
        () => void fetchTasks()
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") void fetchTasks()
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchTasks, projectId, supabase])

  const handleSubmit = async () => {
    if (!form.title) {
      toast.error("Le titre est obligatoire")
      return
    }
    setLoading(true)

    const { data: newTask, error } = await supabase
      .from("tasks")
      .insert({
        project_id: projectId,
        title: form.title,
        description: form.description || null,
        assigned_to: form.assigned_to || null,
        due_date: form.due_date || null,
        created_by: userId,
        status: "todo",
      })
      .select("*, contacts(id, name, professions(label))")
      .single()

    if (error) {
      toast.error("Erreur lors de la création")
    } else {
      setTasks((prev) => [...prev, newTask])
      toast.success("Tâche créée ✅")
      setOpen(false)
      setForm({ title: "", description: "", assigned_to: "", due_date: "" })
    }
    setLoading(false)
  }

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    haptics.medium()
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)))
    await supabase.from("tasks").update({ status: newStatus }).eq("id", taskId)
  }

  const handleDelete = async (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId))
    await supabase.from("tasks").delete().eq("id", taskId)
    toast.success("Tâche supprimée")
  }

  const handleApproveSuggestion = async (task: Task) => {
    setSuggestions((prev) => prev.filter((s) => s.id !== task.id))
    setTasks((prev) => [...prev, { ...task, status: "todo" }])
    const { error } = await supabase.from("tasks").update({ status: "todo" }).eq("id", task.id)
    if (error) {
      setSuggestions((prev) => [...prev, task])
      setTasks((prev) => prev.filter((t) => t.id !== task.id))
      toast.error("Erreur lors de l'acceptation")
    } else {
      toast.success("Suggestion acceptée ✅")
    }
  }

  const handleRejectSuggestion = async (task: Task) => {
    setSuggestions((prev) => prev.filter((s) => s.id !== task.id))
    const { error } = await supabase.from("tasks").update({ status: "rejected" }).eq("id", task.id)
    if (error) {
      setSuggestions((prev) => [...prev, task])
      toast.error("Erreur lors du refus")
    } else {
      toast.success("Suggestion refusée")
    }
  }

  const handleCreateContact = async () => {
    if (!contactForm.name) {
      toast.error("Le nom est obligatoire")
      return
    }
    setContactLoading(true)
    const { data, error } = await supabase
      .from("contacts")
      .insert({
        user_id: userId,
        name: contactForm.name,
        email: contactForm.email || null,
        phone: contactForm.phone || null,
      })
      .select("id, name")
      .single()

    if (error) {
      toast.error("Erreur lors de la création")
    } else {
      setLocalContacts((prev) => [...prev, data])
      setForm((prev) => ({ ...prev, assigned_to: data.id }))
      setContactForm({ name: "", email: "", phone: "" })
      setDialogView("task")
      toast.success(`${data.name} ajouté à l'annuaire ✅`)
    }
    setContactLoading(false)
  }

  const getTasksByStatus = (status: string) => tasks.filter((t) => t.status === status)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={() => setTasksOpen((v) => !v)} className="flex items-center gap-1.5 group">
          <ChevronDown
            className={cn(
              "h-3.5 w-3.5 text-muted-foreground transition-transform duration-200",
              !tasksOpen && "-rotate-90"
            )}
          />
          <h3 className="font-semibold group-hover:text-foreground transition-colors">Tâches</h3>
          <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
            {tasks.length}
          </span>
        </button>

        <Dialog
          open={open}
          onOpenChange={(v) => {
            setOpen(v)
            if (!v) {
              setDialogView("task")
              setContactForm({ name: "", email: "", phone: "" })
            }
          }}
        >
          {!readOnly && (
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Nouvelle tâche</span>
              </Button>
            </DialogTrigger>
          )}
          <DialogContent>
            {dialogView === "task" ? (
              <>
                <DialogHeader>
                  <DialogTitle>Nouvelle tâche</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  <div className="space-y-2">
                    <Label>Titre *</Label>
                    <Input
                      placeholder="Ex: Pose des gaines électriques"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Input
                      placeholder="Détails de la tâche..."
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Assigner à</Label>
                    <Select
                      value={form.assigned_to}
                      onValueChange={(v) => setForm({ ...form, assigned_to: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner depuis l'annuaire" />
                      </SelectTrigger>
                      <SelectContent>
                        {localContacts.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                            {c.professions?.[0] && ` — ${c.professions[0].label}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <button
                      type="button"
                      onClick={() => setDialogView("new-contact")}
                      className="flex items-center gap-1.5 text-xs text-primary hover:underline mt-1"
                    >
                      <Plus className="h-3 w-3" />
                      Créer un nouveau prestataire
                    </button>
                  </div>
                  <div className="space-y-2">
                    <Label>Date limite</Label>
                    <Input
                      type="date"
                      value={form.due_date}
                      onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                      className="scheme-light dark:scheme-dark"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setOpen(false)}>
                    Annuler
                  </Button>
                  <Button onClick={handleSubmit} loading={loading}>
                    {loading ? "Création..." : "Créer la tâche"}
                  </Button>
                </DialogFooter>
              </>
            ) : (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setDialogView("task")}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </button>
                    <DialogTitle>Nouveau prestataire</DialogTitle>
                  </div>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  <div className="space-y-2">
                    <Label>Nom *</Label>
                    <Input
                      placeholder="Jean Dupont"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      placeholder="jean@exemple.fr"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Téléphone</Label>
                    <Input
                      placeholder="06 00 00 00 00"
                      value={contactForm.phone}
                      onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Le prestataire sera ajouté à votre annuaire et sélectionné automatiquement.
                  </p>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogView("task")}>
                    Retour
                  </Button>
                  <Button onClick={handleCreateContact} loading={contactLoading}>
                    {contactLoading ? "Création..." : "Créer le prestataire"}
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Contenu collapsible */}
      <AnimatePresence initial={false}>
        {tasksOpen && (
          <motion.div
            key="tasks-content"
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="space-y-6 p-0.5">
              {/* Suggestions en attente */}
              {suggestions.length > 0 && (
                <FadeIn>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-yellow-500" />
                      <p className="text-sm font-semibold">
                        Suggestions de prestataires
                        <span className="ml-2 text-xs font-normal text-muted-foreground">
                          ({suggestions.length})
                        </span>
                      </p>
                    </div>
                    <div className="space-y-2">
                      {suggestions.map((task) => (
                        <Card
                          key={task.id}
                          className="border-yellow-200 bg-yellow-50/50 dark:bg-yellow-900/10 dark:border-yellow-800"
                        >
                          <CardContent className="flex items-center justify-between p-4">
                            <div>
                              <p className="text-sm font-medium">{task.title}</p>
                              {task.suggested_by && (
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  Suggéré par {task.suggested_by}
                                </p>
                              )}
                              {task.description && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  {task.description}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                                onClick={() => handleApproveSuggestion(task)}
                              >
                                <Check className="h-3.5 w-3.5 mr-1" />
                                Accepter
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 text-muted-foreground hover:text-destructive"
                                onClick={() => handleRejectSuggestion(task)}
                              >
                                <X className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </FadeIn>
              )}

              {/* Kanban */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {columns.map((col) => {
                  const colTasks = getTasksByStatus(col.id)
                  return (
                    <div key={col.id} className="space-y-3">
                      <div className="flex items-center gap-2">
                        <p className={cn("text-sm font-semibold", col.color)}>{col.label}</p>
                        <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
                          {colTasks.length}
                        </span>
                      </div>

                      <div className="space-y-2 min-h-25">
                        {!loaded ? (
                          <div className="space-y-2">
                            {Array.from({ length: col.id === "todo" ? 2 : 1 }).map((_, i) => (
                              <Skeleton key={i} className="h-20 w-full rounded-xl" />
                            ))}
                          </div>
                        ) : colTasks.length === 0 ? (
                          <div className="border-2 border-dashed border-muted rounded-lg p-4 text-center">
                            <p className="text-xs text-muted-foreground">Aucune tâche</p>
                          </div>
                        ) : (
                          <StaggerList className="space-y-2">
                            {colTasks.map((task) => (
                              <StaggerItem key={task.id}>
                                <Card className="transition-all duration-150 hover:shadow-sm">
                                  <CardContent className="p-3 space-y-2">
                                    <div className="flex items-start justify-between gap-2">
                                      <p className="text-sm font-medium leading-tight">
                                        {task.title}
                                      </p>
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 shrink-0"
                                          >
                                            <MoreHorizontal className="h-3.5 w-3.5" />
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                          {col.id !== "todo" && (
                                            <DropdownMenuItem
                                              onClick={() => handleStatusChange(task.id, "todo")}
                                            >
                                              À faire
                                            </DropdownMenuItem>
                                          )}
                                          {col.id !== "in_progress" && (
                                            <DropdownMenuItem
                                              onClick={() =>
                                                handleStatusChange(task.id, "in_progress")
                                              }
                                            >
                                              En cours
                                            </DropdownMenuItem>
                                          )}
                                          {col.id !== "done" && (
                                            <DropdownMenuItem
                                              onClick={() => handleStatusChange(task.id, "done")}
                                            >
                                              Terminé
                                            </DropdownMenuItem>
                                          )}
                                          <DropdownMenuItem
                                            onClick={() => handleDelete(task.id)}
                                            className="text-destructive focus:text-destructive"
                                          >
                                            <Trash2 className="mr-2 h-3.5 w-3.5" />
                                            Supprimer
                                          </DropdownMenuItem>
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    </div>

                                    {task.description && (
                                      <p className="text-xs text-muted-foreground leading-relaxed">
                                        {task.description}
                                      </p>
                                    )}

                                    <div className="flex items-center gap-3 flex-wrap">
                                      {task.contacts && (
                                        <div className="flex items-center gap-1">
                                          <div className="h-4 w-4 rounded-full bg-primary/10 flex items-center justify-center">
                                            <User className="h-2.5 w-2.5 text-primary" />
                                          </div>
                                          <span className="text-xs text-muted-foreground">
                                            {task.contacts.name}
                                          </span>
                                        </div>
                                      )}
                                      {task.due_date && (
                                        <div className="flex items-center gap-1">
                                          <Calendar className="h-3 w-3 text-muted-foreground" />
                                          <span className="text-xs text-muted-foreground">
                                            {new Date(task.due_date).toLocaleDateString("fr-FR", {
                                              day: "numeric",
                                              month: "short",
                                            })}
                                          </span>
                                        </div>
                                      )}
                                    </div>

                                    {task.contacts && task.assigned_to && (
                                      <div className="pt-1">
                                        <InviteButton
                                          contactId={task.assigned_to}
                                          projectId={projectId}
                                          contactName={task.contacts.name}
                                        />
                                      </div>
                                    )}

                                    {col.id !== "done" && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="w-full h-7 text-xs text-muted-foreground hover:text-foreground"
                                        onClick={() =>
                                          handleStatusChange(
                                            task.id,
                                            col.id === "todo" ? "in_progress" : "done"
                                          )
                                        }
                                      >
                                        {col.id === "todo" ? "Démarrer" : "Terminer"}
                                        <ArrowRight className="ml-1 h-3 w-3" />
                                      </Button>
                                    )}
                                  </CardContent>
                                  <TaskComments
                                    taskId={task.id}
                                    authorName={authorName}
                                    authorRole="pro"
                                  />
                                </Card>
                              </StaggerItem>
                            ))}
                          </StaggerList>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* État vide global */}
              {tasks.length === 0 && suggestions.length === 0 && (
                <FadeIn>
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                      <CheckSquare className="h-8 w-8 text-muted-foreground mb-3" />
                      <p className="font-medium text-sm">Aucune tâche</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Créez des tâches et assignez-les à vos prestataires
                      </p>
                    </CardContent>
                  </Card>
                </FadeIn>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
