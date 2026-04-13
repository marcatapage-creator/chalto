"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

const workTypes = [
  "Construction neuve",
  "Rénovation complète",
  "Rénovation partielle",
  "Extension",
  "Aménagement intérieur",
  "Ravalement / façade",
  "Plomberie",
  "Électricité",
  "Menuiserie",
  "Autre",
]

const budgetRanges = [
  "< 10 000€",
  "10 000€ — 50 000€",
  "50 000€ — 150 000€",
  "150 000€ — 500 000€",
  "> 500 000€",
  "Non défini",
]

export interface ProjectInfo {
  client_name?: string
  client_email?: string
  address?: string
  description?: string
  work_type?: string
  budget_range?: string
  deadline?: string
  constraints?: string
}

interface ProjectDetailsDialogProps {
  projectId: string
  project: ProjectInfo
  onSave: (updated: ProjectInfo) => void
}

export function ProjectDetailsDialog({ projectId, project, onSave }: ProjectDetailsDialogProps) {
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<ProjectInfo>({ ...project })

  const supabase = createClient()

  const handleOpenChange = (val: boolean) => {
    if (val) setForm({ ...project })
    setOpen(val)
  }

  const handleSave = async () => {
    setSaving(true)

    const { error } = await supabase
      .from("projects")
      .update({
        client_name: form.client_name || null,
        client_email: form.client_email || null,
        address: form.address || null,
        description: form.description || null,
        work_type: form.work_type || null,
        budget_range: form.budget_range || null,
        deadline: form.deadline || null,
        constraints: form.constraints || null,
      })
      .eq("id", projectId)

    if (error) {
      toast.error("Erreur lors de la sauvegarde")
    } else {
      onSave(form)
      toast.success("Projet mis à jour")
      setOpen(false)
    }

    setSaving(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-muted-foreground h-7 px-2 text-xs">
          Détails
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Détails du projet</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Section Client */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Client
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Nom</Label>
                <Input
                  placeholder="Jean Dupont"
                  value={form.client_name ?? ""}
                  onChange={(e) => setForm({ ...form, client_name: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Email</Label>
                <Input
                  type="email"
                  placeholder="jean@exemple.fr"
                  value={form.client_email ?? ""}
                  onChange={(e) => setForm({ ...form, client_email: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Adresse du chantier</Label>
              <Input
                placeholder="12 rue de la Paix, 75001 Paris"
                value={form.address ?? ""}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Notes</Label>
              <Input
                placeholder="Description ou notes sur le projet..."
                value={form.description ?? ""}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
          </div>

          <Separator />

          {/* Section Cadrage */}
          <div className="space-y-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Cadrage
            </p>

            <div className="space-y-2">
              <Label className="text-xs">Type de travaux</Label>
              <div className="flex flex-wrap gap-2">
                {workTypes.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() =>
                      setForm({ ...form, work_type: form.work_type === type ? "" : type })
                    }
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs border transition-all duration-150",
                      form.work_type === type
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border hover:border-primary/50 hover:bg-muted"
                    )}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Budget estimé</Label>
              <div className="flex flex-wrap gap-2">
                {budgetRanges.map((range) => (
                  <button
                    key={range}
                    type="button"
                    onClick={() =>
                      setForm({
                        ...form,
                        budget_range: form.budget_range === range ? "" : range,
                      })
                    }
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs border transition-all duration-150",
                      form.budget_range === range
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border hover:border-primary/50 hover:bg-muted"
                    )}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Délai souhaité</Label>
                <Input
                  placeholder="Ex: Fin du T2 2026..."
                  value={form.deadline ?? ""}
                  onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Contraintes</Label>
                <Input
                  placeholder="Ex: Bâtiment classé..."
                  value={form.constraints ?? ""}
                  onChange={(e) => setForm({ ...form, constraints: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Annuler
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Sauvegarde..." : "Enregistrer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
