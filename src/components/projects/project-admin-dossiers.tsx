"use client"

import { useState, useEffect, useRef } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ChevronDown, Plus, Pencil, Trash2, FolderOpen, CalendarDays, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { ResponsiveDialog } from "@/components/ui/responsive-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { fetchWithTimeout } from "@/lib/fetch-timeout"
import { differenceInDays, parseISO } from "date-fns"
import type { AdminDossier, AdminDossierType, AdminDossierStatus } from "@/types/domain"

const TYPE_LABEL: Record<AdminDossierType, string> = {
  permis_construire: "Permis de construire",
  declaration_prealable: "Déclaration préalable",
  doc: "DOC",
  daact: "DAACT",
  erp: "ERP",
  autre: "Autre",
}

const STATUS_LABEL: Record<AdminDossierStatus, string> = {
  en_preparation: "En préparation",
  depose: "Déposé",
  en_instruction: "En instruction",
  obtenu: "Obtenu",
  refuse: "Refusé",
}

const STATUS_CLASS: Record<AdminDossierStatus, string> = {
  en_preparation:
    "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800/40 dark:text-gray-300",
  depose: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400",
  en_instruction:
    "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400",
  obtenu: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400",
  refuse: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400",
}

const NEXT_STATUS: Partial<
  Record<AdminDossierStatus, { label: string; status: AdminDossierStatus }>
> = {
  en_preparation: { label: "Marquer déposé", status: "depose" },
  depose: { label: "Passer en instruction", status: "en_instruction" },
  en_instruction: { label: "Marquer obtenu", status: "obtenu" },
}

function getDeadlineBadge(deadline: string | null | undefined) {
  if (!deadline) return null
  const days = differenceInDays(parseISO(deadline), new Date())
  if (days < 0) return { label: "Expiré", className: "bg-gray-700 text-white" }
  if (days <= 7) return { label: `J-${days}`, className: "bg-red-500 text-white" }
  if (days <= 30) return { label: `J-${days}`, className: "bg-amber-400 text-gray-900" }
  return {
    label: `J-${days}`,
    className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  }
}

interface ProjectAdminDossiersProps {
  projectId: string
  initialDossiers: AdminDossier[]
  readOnly?: boolean
  defaultOpen?: boolean
  highlightedDossierId?: string | null
  onOpen?: () => void
  onClose?: () => void
  collapseSignal?: number
  expandSignal?: number
  onOpenAdd?: () => void
}

interface FormState {
  type: AdminDossierType
  label: string
  status: AdminDossierStatus
  deadline: string
  notes: string
}

const defaultForm = (): FormState => ({
  type: "permis_construire",
  label: "",
  status: "en_preparation",
  deadline: "",
  notes: "",
})

export function ProjectAdminDossiers({
  projectId,
  initialDossiers,
  readOnly = false,
  defaultOpen = false,
  highlightedDossierId,
  onOpen,
  onClose,
  collapseSignal,
  expandSignal,
  onOpenAdd,
}: ProjectAdminDossiersProps) {
  const [dossiers, setDossiers] = useState<AdminDossier[]>(initialDossiers)
  const [isOpen, setIsOpen] = useState(defaultOpen || !!highlightedDossierId)
  const prevCollapseSignal = useRef(collapseSignal ?? 0)
  useEffect(() => {
    if (collapseSignal === undefined || collapseSignal === prevCollapseSignal.current) return
    prevCollapseSignal.current = collapseSignal
    setIsOpen(false)
  }, [collapseSignal])
  const prevExpandSignal = useRef(expandSignal ?? 0)
  useEffect(() => {
    if (expandSignal === undefined || expandSignal === prevExpandSignal.current) return
    prevExpandSignal.current = expandSignal
    setIsOpen(true)
  }, [expandSignal])

  useEffect(() => {
    if (!highlightedDossierId) return
    setIsOpen(true)
    const t = setTimeout(() => {
      const el = document.querySelector(`[data-dossier-id="${highlightedDossierId}"]`)
      el?.scrollIntoView({ behavior: "smooth", block: "center" })
    }, 350)
    return () => clearTimeout(t)
  }, [highlightedDossierId])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<AdminDossier | null>(null)
  const [form, setForm] = useState<FormState>(defaultForm())
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const openAdd = () => {
    setEditing(null)
    setForm(defaultForm())
    setDialogOpen(true)
  }

  const openEdit = (d: AdminDossier) => {
    setEditing(d)
    setForm({
      type: d.type,
      label: d.label ?? "",
      status: d.status,
      deadline: d.deadline ?? "",
      notes: d.notes ?? "",
    })
    setDialogOpen(true)
  }

  const closeDialog = () => {
    setDialogOpen(false)
    setEditing(null)
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const body = {
        projectId,
        type: form.type,
        label: form.type === "autre" ? form.label || null : null,
        status: form.status,
        deadline: form.deadline || null,
        notes: form.notes || null,
      }

      if (editing) {
        const res = await fetchWithTimeout(`/api/admin-dossiers/${editing.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          toast.error((data as { error?: string }).error ?? "Erreur lors de la mise à jour")
          return
        }
        const { dossier } = await res.json()
        setDossiers((prev) => prev.map((d) => (d.id === dossier.id ? dossier : d)))
        new BroadcastChannel("chalto:deadlines").postMessage({ type: "refresh" })
        toast.success("Dossier mis à jour")
      } else {
        const res = await fetchWithTimeout("/api/admin-dossiers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          toast.error((data as { error?: string }).error ?? "Erreur lors de la création")
          return
        }
        const { dossier } = await res.json()
        setDossiers((prev) => [dossier, ...prev])
        new BroadcastChannel("chalto:deadlines").postMessage({ type: "refresh" })
        toast.success("Dossier ajouté")
      }

      closeDialog()
    } catch {
      toast.error("Erreur réseau — réessayez")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      const res = await fetchWithTimeout(`/api/admin-dossiers/${id}`, { method: "DELETE" })
      if (!res.ok) {
        toast.error("Erreur lors de la suppression")
        return
      }
      setDossiers((prev) => prev.filter((d) => d.id !== id))
      new BroadcastChannel("chalto:deadlines").postMessage({ type: "refresh" })
      toast.success("Dossier supprimé")
    } catch {
      toast.error("Erreur réseau — réessayez")
    } finally {
      setDeletingId(null)
    }
  }

  const handleNextStatus = async (d: AdminDossier) => {
    const next = NEXT_STATUS[d.status]
    if (!next) return
    try {
      const res = await fetchWithTimeout(`/api/admin-dossiers/${d.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next.status }),
      })
      if (!res.ok) {
        toast.error("Erreur lors de la mise à jour")
        return
      }
      const { dossier } = await res.json()
      setDossiers((prev) => prev.map((x) => (x.id === dossier.id ? dossier : x)))
      new BroadcastChannel("chalto:deadlines").postMessage({ type: "refresh" })
    } catch {
      toast.error("Erreur réseau — réessayez")
    }
  }

  const active = dossiers.filter((d) => d.status !== "obtenu" && d.status !== "refuse")
  const archived = dossiers.filter((d) => d.status === "obtenu" || d.status === "refuse")
  const urgentCount = active.filter((d) => {
    if (!d.deadline) return false
    const days = differenceInDays(parseISO(d.deadline), new Date())
    return days <= 7
  }).length

  return (
    <div className="space-y-3">
      <div
        className="flex items-center justify-between group cursor-pointer active:opacity-75"
        onClick={() => {
          if (!isOpen) onOpen?.()
          else onClose?.()
          setIsOpen((v) => !v)
        }}
      >
        <div className="flex items-center gap-1.5 px-2 py-1 -mx-2 rounded-md group-hover:bg-muted transition-colors">
          <ChevronDown
            className={cn(
              "h-3.5 w-3.5 text-muted-foreground transition-transform duration-200",
              !isOpen && "-rotate-90"
            )}
          />
          <span className="font-semibold group-hover:text-foreground transition-colors">
            Dossiers administratifs
          </span>
          <span
            className={cn(
              "inline-flex items-center justify-center text-xs h-5 min-w-5 rounded-full px-1 shrink-0",
              urgentCount > 0 ? "bg-red-500 text-white" : "bg-muted text-muted-foreground"
            )}
          >
            {dossiers.length}
          </span>
        </div>
        {!readOnly && (
          <Button
            size="sm"
            className="gap-1.5 shrink-0"
            onClick={(e) => {
              e.stopPropagation()
              if (onOpenAdd) {
                onOpenAdd()
                return
              }
              if (!isOpen) {
                setIsOpen(true)
                onOpen?.()
              }
              openAdd()
            }}
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Ajouter</span>
          </Button>
        )}
      </div>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="dossiers-list"
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pt-1 pb-1 px-1 max-w-2xl">
              {dossiers.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <FolderOpen className="h-8 w-8 text-muted-foreground mb-3" />
                    <p className="font-medium text-sm">Aucun dossier administratif</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {readOnly
                        ? "Aucun dossier n'a été ajouté sur ce projet"
                        : "Utilisez le bouton + Ajouter pour créer votre premier dossier"}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {active.length > 0 && (
                    <div className="flex flex-wrap gap-3">
                      {active.map((d) => (
                        <div key={d.id} className="flex-1 min-w-72">
                          <DossierCard
                            dossier={d}
                            highlighted={highlightedDossierId === d.id}
                            onEdit={!readOnly ? openEdit : undefined}
                            onDelete={!readOnly ? handleDelete : undefined}
                            onNextStatus={!readOnly ? handleNextStatus : undefined}
                            deletingId={deletingId}
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {archived.length > 0 && (
                    <div className="space-y-2">
                      {active.length > 0 && (
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-0.5">
                          Terminés — {archived.length}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-3">
                        {archived.map((d) => (
                          <div key={d.id} className="flex-1 min-w-72">
                            <DossierCard
                              dossier={d}
                              highlighted={highlightedDossierId === d.id}
                              onEdit={!readOnly ? openEdit : undefined}
                              onDelete={!readOnly ? handleDelete : undefined}
                              deletingId={deletingId}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ResponsiveDialog
        open={dialogOpen}
        onOpenChange={(o) => !o && closeDialog()}
        title={editing ? "Modifier le dossier" : "Nouveau dossier administratif"}
        contentClassName="sm:max-w-md"
        footer={
          <>
            <Button variant="outline" onClick={closeDialog} disabled={submitting}>
              Annuler
            </Button>
            <Button onClick={handleSubmit} disabled={submitting} loading={submitting}>
              {editing ? "Enregistrer" : "Ajouter"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Type de dossier</Label>
            <Select
              value={form.type}
              onValueChange={(v) => setForm((f) => ({ ...f, type: v as AdminDossierType }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(TYPE_LABEL) as AdminDossierType[]).map((t) => (
                  <SelectItem key={t} value={t}>
                    {TYPE_LABEL[t]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {form.type === "autre" && (
            <div className="space-y-1.5">
              <Label>Préciser</Label>
              <Input
                maxLength={100}
                value={form.label}
                onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
                placeholder="Ex: Autorisation d'enseigne"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Statut</Label>
              <Select
                value={form.status}
                onValueChange={(v) => setForm((f) => ({ ...f, status: v as AdminDossierStatus }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(STATUS_LABEL) as AdminDossierStatus[]).map((s) => (
                    <SelectItem key={s} value={s}>
                      {STATUS_LABEL[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>
                Échéance <span className="font-normal text-muted-foreground">(optionnel)</span>
              </Label>
              <Input
                type="date"
                value={form.deadline}
                onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>
              Notes <span className="font-normal text-muted-foreground">(optionnel)</span>
            </Label>
            <Textarea
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              placeholder="Références, contacts instructeur…"
              rows={2}
              maxLength={1000}
              className="resize-none text-sm"
            />
          </div>
        </div>
      </ResponsiveDialog>
    </div>
  )
}

function DossierCard({
  dossier: d,
  highlighted,
  onEdit,
  onDelete,
  onNextStatus,
  deletingId,
}: {
  dossier: AdminDossier
  highlighted?: boolean
  onEdit?: (d: AdminDossier) => void
  onDelete?: (id: string) => void
  onNextStatus?: (d: AdminDossier) => void
  deletingId: string | null
}) {
  const deadlineBadge = getDeadlineBadge(d.deadline)
  const nextStep = NEXT_STATUS[d.status]
  const isDeleting = deletingId === d.id
  const typeLabel = d.type === "autre" && d.label ? d.label : TYPE_LABEL[d.type]

  return (
    <Card
      data-dossier-id={d.id}
      className={cn(
        "transition-all duration-200",
        isDeleting && "opacity-50",
        highlighted && "border-ring ring-3 ring-ring/50"
      )}
    >
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{typeLabel}</p>
            {d.deadline && (
              <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground">
                <CalendarDays className="h-3 w-3 shrink-0" />
                <span>
                  {new Date(d.deadline + "T00:00:00").toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {deadlineBadge && (
              <span
                className={cn(
                  "inline-flex items-center text-xs px-2 py-0.5 rounded-full font-medium",
                  deadlineBadge.className
                )}
              >
                {deadlineBadge.label}
              </span>
            )}
            <span
              className={cn(
                "inline-flex items-center text-xs px-2 py-0.5 rounded-full border font-medium",
                STATUS_CLASS[d.status]
              )}
            >
              {STATUS_LABEL[d.status]}
            </span>
          </div>
        </div>

        {d.notes && (
          <p className="text-xs text-muted-foreground italic border-l-2 pl-2 line-clamp-2">
            {d.notes}
          </p>
        )}

        {(nextStep || onEdit || onDelete) && (
          <div className="flex items-center gap-2 pt-1">
            {nextStep && onNextStatus && (
              <Button
                size="sm"
                variant="outline"
                className="flex-1 text-xs xl:h-7"
                onClick={() => onNextStatus(d)}
              >
                {nextStep.label}
              </Button>
            )}
            <div className="flex items-center gap-1 ml-auto">
              {onEdit && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="xl:h-7 xl:w-7"
                  onClick={() => onEdit(d)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              )}
              {onDelete && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="xl:h-7 xl:w-7 text-destructive hover:text-destructive"
                  onClick={() => onDelete(d.id)}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
