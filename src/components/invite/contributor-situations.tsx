"use client"

import { useState, useRef } from "react"
import {
  ChevronDown,
  Plus,
  HardHat,
  Loader2,
  X,
  Paperclip,
  AlertCircle,
  CheckCircle2,
  Clock,
  RotateCcw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { fetchWithTimeout } from "@/lib/fetch-timeout"
import type { Situation, SituationStatus } from "@/types/domain"

const STATUS_LABEL: Record<SituationStatus, string> = {
  en_attente: "En attente",
  validee: "Validée",
  refusee: "Refusée",
  corrigee: "Corrigée",
}

const STATUS_CLASS: Record<SituationStatus, string> = {
  en_attente:
    "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400",
  validee: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400",
  refusee: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400",
  corrigee: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400",
}

const STATUS_ICON: Record<SituationStatus, React.ReactNode> = {
  en_attente: <Clock className="h-3.5 w-3.5" />,
  validee: <CheckCircle2 className="h-3.5 w-3.5" />,
  refusee: <AlertCircle className="h-3.5 w-3.5" />,
  corrigee: <RotateCcw className="h-3.5 w-3.5" />,
}

interface ContributorSituationsProps {
  contributorToken: string
  projectId: string
  contributorName: string
  initialSituations: Situation[]
}

interface FormState {
  lotLabel: string
  percentage: string
  amountHt: string
  comment: string
  files: File[]
  parentSituationId?: string
  correctionOf?: string
}

const EMPTY_FORM: FormState = {
  lotLabel: "",
  percentage: "",
  amountHt: "",
  comment: "",
  files: [],
}

export function ContributorSituations({
  contributorToken,
  projectId,
  contributorName,
  initialSituations,
}: ContributorSituationsProps) {
  const [situations, setSituations] = useState<Situation[]>(initialSituations)
  const [open, setOpen] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const pendingCount = situations.filter((s) => s.status === "en_attente").length

  const openNewForm = () => {
    setForm(EMPTY_FORM)
    setShowForm(true)
  }

  const openCorrectionForm = (situation: Situation) => {
    setForm({
      ...EMPTY_FORM,
      lotLabel: situation.lot_label,
      percentage: String(situation.percentage),
      amountHt: situation.amount_ht ? String(situation.amount_ht) : "",
      parentSituationId: situation.id,
      correctionOf: situation.lot_label,
    })
    setShowForm(true)
    setTimeout(() => {
      document
        .getElementById("situation-form")
        ?.scrollIntoView({ behavior: "smooth", block: "start" })
    }, 50)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? [])
    setForm((prev) => ({ ...prev, files: [...prev.files, ...selected] }))
    e.target.value = ""
  }

  const removeFile = (idx: number) => {
    setForm((prev) => ({ ...prev, files: prev.files.filter((_, i) => i !== idx) }))
  }

  const handleSubmit = async () => {
    if (!form.lotLabel.trim()) {
      toast.error("Le lot est obligatoire")
      return
    }
    const pct = parseInt(form.percentage, 10)
    if (isNaN(pct) || pct < 0 || pct > 100) {
      toast.error("Le pourcentage doit être entre 0 et 100")
      return
    }

    setSubmitting(true)
    try {
      const fd = new FormData()
      fd.append("contributorToken", contributorToken)
      fd.append("projectId", projectId)
      fd.append("lotLabel", form.lotLabel.trim())
      fd.append("percentage", String(pct))
      if (form.amountHt) fd.append("amountHt", form.amountHt)
      if (form.comment.trim()) fd.append("comment", form.comment.trim())
      if (form.parentSituationId) fd.append("parentSituationId", form.parentSituationId)
      for (const file of form.files) fd.append("files", file)

      const res = await fetchWithTimeout("/api/situations", { method: "POST", body: fd }, 60_000)

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        toast.error((data as { error?: string }).error ?? "Erreur lors de l'envoi")
        return
      }

      const data = await res.json()
      const newSituation = data.situation as Situation
      setSituations((prev) => [newSituation, ...prev])
      setForm(EMPTY_FORM)
      setShowForm(false)
      toast.success("Situation soumise ✅")

      if (contributorName) {
        // no-op — kept for future realtime broadcast
      }
    } catch {
      toast.error("Erreur réseau — réessayez")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section id="situations-section" className="space-y-3 scroll-mt-28">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-1.5 group px-2 py-1 -mx-2 rounded-md hover:bg-muted transition-colors"
        >
          <ChevronDown
            className={cn(
              "h-3.5 w-3.5 text-muted-foreground transition-transform duration-200",
              !open && "-rotate-90"
            )}
          />
          <span className="font-semibold group-hover:text-foreground transition-colors">
            Situations de travaux
          </span>
          {situations.length > 0 && (
            <span
              className={cn(
                "inline-flex items-center justify-center text-xs h-5 min-w-5 rounded-full px-1 shrink-0",
                pendingCount > 0 ? "bg-amber-400 text-gray-900" : "bg-muted text-muted-foreground"
              )}
            >
              {situations.length}
            </span>
          )}
        </button>

        {open && !showForm && (
          <Button
            size="sm"
            variant="outline"
            onClick={openNewForm}
            className="h-7 px-2 text-xs gap-1"
          >
            <Plus className="h-3.5 w-3.5" />
            Nouvelle situation
          </Button>
        )}
      </div>

      {open && (
        <>
          {/* Formulaire de soumission */}
          {showForm && (
            <div id="situation-form" className="border rounded-lg p-4 space-y-4 bg-muted/30">
              {form.correctionOf && (
                <div className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-md px-3 py-2">
                  <RotateCcw className="h-4 w-4 shrink-0" />
                  <span>
                    Correction de la situation refusée : <strong>{form.correctionOf}</strong>
                  </span>
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                    Lot *
                  </label>
                  <Input
                    placeholder="ex. Gros œuvre, Plomberie, Électricité…"
                    value={form.lotLabel}
                    onChange={(e) => setForm((p) => ({ ...p, lotLabel: e.target.value }))}
                    maxLength={100}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                      Avancement (%) *
                    </label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      placeholder="0 – 100"
                      value={form.percentage}
                      onChange={(e) => setForm((p) => ({ ...p, percentage: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                      Montant HT (€)
                    </label>
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      placeholder="Optionnel"
                      value={form.amountHt}
                      onChange={(e) => setForm((p) => ({ ...p, amountHt: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                    Commentaire
                  </label>
                  <Textarea
                    placeholder="Précisions sur l'avancement, remarques…"
                    value={form.comment}
                    onChange={(e) => setForm((p) => ({ ...p, comment: e.target.value }))}
                    rows={2}
                    className="text-sm resize-none"
                    maxLength={1000}
                  />
                </div>

                {/* Pièces jointes */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                    Photos / documents
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,application/pdf"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground border border-dashed rounded-md px-3 py-2 w-full transition-colors hover:border-foreground/30"
                  >
                    <Paperclip className="h-4 w-4 shrink-0" />
                    Ajouter des fichiers
                  </button>
                  {form.files.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {form.files.map((f, idx) => (
                        <li
                          key={idx}
                          className="flex items-center justify-between text-xs text-muted-foreground bg-muted rounded px-2 py-1"
                        >
                          <span className="truncate max-w-[80%]">{f.name}</span>
                          <button
                            onClick={() => removeFile(idx)}
                            className="ml-2 shrink-0 hover:text-foreground"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    setShowForm(false)
                    setForm(EMPTY_FORM)
                  }}
                  disabled={submitting}
                >
                  Annuler
                </Button>
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={handleSubmit}
                  disabled={submitting || !form.lotLabel.trim() || !form.percentage}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Envoi…
                    </>
                  ) : (
                    "Soumettre"
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Liste des situations */}
          {situations.length === 0 && !showForm ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <HardHat className="h-8 w-8 text-muted-foreground mb-3" />
              <p className="font-medium text-sm">Aucune situation soumise</p>
              <p className="text-xs text-muted-foreground mt-1 mb-4">
                Déclarez l&apos;avancement de vos travaux par lot
              </p>
              <Button size="sm" variant="outline" onClick={openNewForm}>
                <Plus className="h-4 w-4 mr-1.5" />
                Soumettre une situation
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {situations.map((s) => (
                <SituationCard key={s.id} situation={s} onCorrect={openCorrectionForm} />
              ))}
            </div>
          )}
        </>
      )}
    </section>
  )
}

function SituationCard({
  situation: s,
  onCorrect,
}: {
  situation: Situation
  onCorrect: (s: Situation) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const hasDetail = s.refusal_reason || s.reviewer_comment || (s.attachments?.length ?? 0) > 0

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{s.lot_label}</p>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="text-xs text-muted-foreground">{s.percentage}%</span>
              {s.amount_ht && (
                <span className="text-xs text-muted-foreground">
                  {s.amount_ht.toLocaleString("fr-FR", { minimumFractionDigits: 0 })} €&nbsp;HT
                </span>
              )}
              <span className="text-xs text-muted-foreground">
                {new Date(s.submitted_at).toLocaleDateString("fr-FR")}
              </span>
            </div>
          </div>
          <div
            className={cn(
              "inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium shrink-0",
              STATUS_CLASS[s.status]
            )}
          >
            {STATUS_ICON[s.status]}
            {STATUS_LABEL[s.status]}
          </div>
        </div>

        {s.comment && (
          <p className="text-xs text-muted-foreground italic border-l-2 pl-2">{s.comment}</p>
        )}

        {hasDetail && (
          <>
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronDown
                className={cn("h-3 w-3 transition-transform", !expanded && "-rotate-90")}
              />
              {expanded ? "Masquer les détails" : "Voir les détails"}
            </button>

            {expanded && (
              <div className="space-y-2">
                {s.refusal_reason && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md px-3 py-2">
                    <p className="text-xs font-medium text-red-700 dark:text-red-400 mb-0.5">
                      Motif de refus
                    </p>
                    <p className="text-xs text-red-600 dark:text-red-300">{s.refusal_reason}</p>
                  </div>
                )}
                {s.reviewer_comment && (
                  <div className="bg-muted/50 rounded-md px-3 py-2">
                    <p className="text-xs font-medium mb-0.5">Commentaire</p>
                    <p className="text-xs text-muted-foreground italic">{s.reviewer_comment}</p>
                  </div>
                )}
                {(s.attachments?.length ?? 0) > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium">Pièces jointes</p>
                    {s.attachments!.map((a) => (
                      <a
                        key={a.id}
                        href={a.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs text-primary hover:underline"
                      >
                        <Paperclip className="h-3 w-3 shrink-0" />
                        {a.file_name ?? "Fichier"}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {s.status === "refusee" && (
          <>
            <Separator />
            <Button size="sm" variant="outline" className="w-full" onClick={() => onCorrect(s)}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Soumettre une correction
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}
