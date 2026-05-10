"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { useMediaQuery } from "@/hooks/use-media-query"

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
  const isDesktop = useMediaQuery("(min-width: 1280px)")

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

  const trigger = (
    <Button variant="ghost" size="sm" className="text-muted-foreground h-7 px-2 text-xs">
      Détails
    </Button>
  )

  const footerActions = (
    <>
      <Button variant="outline" onClick={() => setOpen(false)}>
        Annuler
      </Button>
      <Button onClick={handleSave} disabled={saving}>
        {saving ? "Sauvegarde..." : "Enregistrer"}
      </Button>
    </>
  )

  const renderFormBody = (withFooter = false) => (
    <div className="flex-1 overflow-y-auto px-6 pb-2 space-y-5">
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
          <Textarea
            placeholder="Description ou notes sur le projet..."
            value={form.description ?? ""}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="min-h-24 resize-none"
          />
        </div>
      </div>

      <Separator />

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
                onClick={() => setForm({ ...form, work_type: form.work_type === type ? "" : type })}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs border transition-all duration-150 max-sm:h-11 max-sm:py-0",
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
                  setForm({ ...form, budget_range: form.budget_range === range ? "" : range })
                }
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs border transition-all duration-150 max-sm:h-11 max-sm:py-0",
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
          <Textarea
            placeholder="Ex: Bâtiment classé..."
            value={form.constraints ?? ""}
            onChange={(e) => setForm({ ...form, constraints: e.target.value })}
            className="min-h-20 resize-none"
          />
        </div>
      </div>
      {withFooter && (
        <div className="-mx-6 mt-4 border-t bg-muted/50 px-6 py-4 flex flex-col-reverse gap-2">
          {footerActions}
        </div>
      )}
    </div>
  )

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        <DialogContent className="max-w-lg flex flex-col max-h-[90dvh] overflow-hidden p-0 gap-0">
          <DialogHeader className="px-6 pt-6 pb-4 shrink-0">
            <DialogTitle>Détails du projet</DialogTitle>
          </DialogHeader>
          {renderFormBody()}
          <DialogFooter className="mx-0! mb-0! shrink-0">{footerActions}</DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerTrigger asChild>{trigger}</DrawerTrigger>
      <DrawerContent onOverlayClick={() => setOpen(false)}>
        <DrawerHeader>
          <DrawerTitle>Détails du projet</DrawerTitle>
        </DrawerHeader>
        {renderFormBody(true)}
      </DrawerContent>
    </Drawer>
  )
}
