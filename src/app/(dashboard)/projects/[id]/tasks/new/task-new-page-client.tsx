"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowLeft, Plus } from "lucide-react"
import { toast } from "sonner"
import { scrollOnFocus } from "@/hooks/use-scroll-on-focus"

interface Contact {
  id: string
  name: string
  professions?: { label: string } | null
}

interface TaskNewPageClientProps {
  project: { id: string; name: string }
  contacts: Contact[]
  userId: string
}

type Step = "task" | "new-contact"

export function TaskNewPageClient({ project, contacts, userId }: TaskNewPageClientProps) {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const [step, setStep] = useState<Step>("task")
  const [loading, setLoading] = useState(false)
  const [contactLoading, setContactLoading] = useState(false)
  const [localContacts, setLocalContacts] = useState(contacts)

  const todayMin = useMemo(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
  }, [])

  const [form, setForm] = useState({ title: "", description: "", assigned_to: "", due_date: "" })
  const [contactForm, setContactForm] = useState({ name: "", email: "", phone: "" })

  const handleSubmit = async () => {
    if (!form.title) {
      toast.error("Le titre est obligatoire")
      return
    }
    setLoading(true)
    const { data: newTask, error } = await supabase
      .from("tasks")
      .insert({
        project_id: project.id,
        title: form.title,
        description: form.description || null,
        assigned_to: form.assigned_to || null,
        due_date: form.due_date || null,
        created_by: userId,
        status: "todo",
      })
      .select("id")
      .single()
    if (error) {
      toast.error("Erreur lors de la création")
    } else {
      toast.success("Tâche créée ✅")
      router.push(`/projects/${project.id}?highlight=task_${newTask.id}`)
    }
    setLoading(false)
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
      setStep("task")
      toast.success(`${data.name} ajouté à l'annuaire ✅`)
    }
    setContactLoading(false)
  }

  return (
    <motion.div
      className="flex-1 flex flex-col overflow-hidden"
      initial={{ x: 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
    >
      <div className="shrink-0 border-b px-4 py-3 flex items-center gap-3 bg-popover">
        {step === "new-contact" ? (
          <button
            type="button"
            className="h-11 w-11 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setStep("task")}
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className="h-11 w-11 shrink-0"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">
            {step === "task" ? "Nouvelle tâche" : "Nouveau prestataire"}
          </p>
          <p className="text-xs text-muted-foreground truncate">{project.name}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {step === "task" ? (
          <div className="p-4 space-y-4">
            <div className="space-y-2">
              <Label>Titre *</Label>
              <Input
                placeholder="Ex: Pose des gaines électriques"
                value={form.title}
                onFocus={scrollOnFocus}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                placeholder="Détails de la tâche..."
                value={form.description}
                onFocus={scrollOnFocus}
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
                      {c.professions?.label && ` — ${c.professions.label}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <button
                type="button"
                onClick={() => setStep("new-contact")}
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
                min={todayMin}
                onFocus={scrollOnFocus}
                onChange={(e) => setForm({ ...form, due_date: e.target.value })}
              />
            </div>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            <div className="space-y-2">
              <Label>Nom *</Label>
              <Input
                placeholder="Jean Dupont"
                value={contactForm.name}
                onFocus={scrollOnFocus}
                onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="jean@exemple.fr"
                value={contactForm.email}
                onFocus={scrollOnFocus}
                onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Téléphone</Label>
              <Input
                placeholder="06 00 00 00 00"
                value={contactForm.phone}
                onFocus={scrollOnFocus}
                onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Le prestataire sera ajouté à votre annuaire et sélectionné automatiquement.
            </p>
          </div>
        )}
      </div>

      <div className="shrink-0 border-t px-4 py-3 bg-popover flex gap-3">
        {step === "task" ? (
          <>
            <Button variant="outline" className="flex-1" onClick={() => router.back()}>
              Annuler
            </Button>
            <Button className="flex-1" onClick={handleSubmit} loading={loading}>
              {loading ? "Création..." : "Créer la tâche"}
            </Button>
          </>
        ) : (
          <>
            <Button variant="outline" className="flex-1" onClick={() => setStep("task")}>
              Retour
            </Button>
            <Button className="flex-1" onClick={handleCreateContact} loading={contactLoading}>
              {contactLoading ? "Création..." : "Créer le prestataire"}
            </Button>
          </>
        )}
      </div>
    </motion.div>
  )
}
