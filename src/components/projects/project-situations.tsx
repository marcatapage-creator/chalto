"use client"

import { useState, useEffect, useRef } from "react"
import { AnimatePresence, motion } from "framer-motion"
import {
  ChevronDown,
  HardHat,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  AlertCircle,
  Paperclip,
  Loader2,
  FileDown,
  FileText,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ResponsiveDialog } from "@/components/ui/responsive-dialog"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { fetchWithTimeout } from "@/lib/fetch-timeout"
import type { Situation, SituationStatus } from "@/types/domain"

const STATUS_LABEL: Record<SituationStatus, string> = {
  en_attente: "En attente",
  validee: "Validée",
  refusee: "Refusée",
  corrigee: "Corrigée (en attente)",
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
  refusee: <XCircle className="h-3.5 w-3.5" />,
  corrigee: <RotateCcw className="h-3.5 w-3.5" />,
}

interface ProjectSituationsProps {
  projectId: string
  initialSituations: Situation[]
  readOnly?: boolean
  defaultOpen?: boolean
  highlightedSituationId?: string | null
  unreadCount?: number
  onOpen?: () => void
  onClose?: () => void
  collapseSignal?: number
  expandSignal?: number
}

interface ReviewState {
  situationId: string
  lotLabel: string
  contributorName: string
}

export function ProjectSituations({
  projectId,
  initialSituations,
  readOnly = false,
  defaultOpen = true,
  highlightedSituationId,
  unreadCount = 0,
  onOpen,
  onClose,
  collapseSignal,
  expandSignal,
}: ProjectSituationsProps) {
  const [situations, setSituations] = useState<Situation[]>(initialSituations)
  const [localUnread, setLocalUnread] = useState(unreadCount)
  const [isOpen, setIsOpen] = useState(defaultOpen)
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
  const [reviewing, setReviewing] = useState<ReviewState | null>(null)
  const [action, setAction] = useState<"validate" | "refuse">("validate")
  const [reviewerComment, setReviewerComment] = useState("")
  const [refusalReason, setRefusalReason] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!highlightedSituationId) return
    setIsOpen(true)
  }, [highlightedSituationId])

  const pendingCount = situations.filter(
    (s) => s.status === "en_attente" || s.status === "corrigee"
  ).length

  const openReview = (s: Situation) => {
    setReviewing({
      situationId: s.id,
      lotLabel: s.lot_label,
      contributorName: s.contributor?.name ?? "Prestataire",
    })
    setAction("validate")
    setReviewerComment("")
    setRefusalReason("")
  }

  const closeReview = () => {
    setReviewing(null)
    setReviewerComment("")
    setRefusalReason("")
  }

  const handleSubmitReview = async () => {
    if (!reviewing) return
    if (action === "refuse" && !refusalReason.trim()) {
      toast.error("Le motif de refus est obligatoire")
      return
    }

    setSubmitting(true)
    try {
      const res = await fetchWithTimeout(`/api/situations/${reviewing.situationId}/review`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          reviewerComment: reviewerComment.trim() || undefined,
          refusalReason: action === "refuse" ? refusalReason.trim() : undefined,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        toast.error((data as { error?: string }).error ?? "Erreur lors de la révision")
        return
      }

      const data = await res.json()
      const updated = data.situation as Situation
      setSituations((prev) => prev.map((s) => (s.id === updated.id ? { ...s, ...updated } : s)))
      closeReview()
      toast.success(action === "validate" ? "Situation validée ✅" : "Situation refusée")
    } catch {
      toast.error("Erreur réseau — réessayez")
    } finally {
      setSubmitting(false)
    }
  }

  const pending = situations.filter((s) => s.status === "en_attente" || s.status === "corrigee")
  const reviewed = situations.filter((s) => s.status === "validee" || s.status === "refusee")

  return (
    <div className="space-y-3">
      <div
        className="flex items-center justify-between group cursor-pointer active:opacity-75"
        onClick={() => {
          if (!isOpen) {
            onOpen?.()
            setLocalUnread(0)
          } else {
            onClose?.()
          }
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
            Situations de travaux
          </span>
          <span
            className={cn(
              "inline-flex items-center justify-center text-xs h-5 min-w-5 rounded-full px-1 shrink-0 transition-colors",
              localUnread > 0
                ? "bg-destructive text-destructive-foreground font-semibold"
                : pendingCount > 0
                  ? "bg-amber-400 text-gray-900"
                  : "bg-muted text-muted-foreground"
            )}
          >
            {situations.length}
          </span>
          {localUnread > 0 && !isOpen && (
            <span className="h-2 w-2 rounded-full bg-destructive shrink-0" />
          )}
        </div>
        {situations.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 shrink-0"
            asChild
            onClick={(e) => e.stopPropagation()}
          >
            <a
              href={`/projects/${projectId}/situations/print`}
              target="_blank"
              rel="noopener noreferrer"
              title="Récapitulatif PDF"
            >
              <FileDown className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Récap PDF</span>
            </a>
          </Button>
        )}
      </div>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="situations-list"
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pt-1 pb-1 px-1 max-w-2xl">
              {situations.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <HardHat className="h-8 w-8 text-muted-foreground mb-3" />
                    <p className="font-medium text-sm">Aucune situation soumise</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Les prestataires soumettront leurs situations depuis leur espace
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {pending.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-0.5">
                        À réviser — {pending.length}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {pending.map((s) => (
                          <SituationCard
                            key={s.id}
                            situation={s}
                            highlighted={highlightedSituationId === s.id}
                            onReview={!readOnly ? openReview : undefined}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {reviewed.length > 0 && (
                    <div className="space-y-2">
                      {pending.length > 0 && <Separator />}
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-0.5">
                        Révisées — {reviewed.length}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {reviewed.map((s) => (
                          <SituationCard
                            key={s.id}
                            situation={s}
                            highlighted={highlightedSituationId === s.id}
                          />
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

      {/* Drawer/Dialog révision */}
      <ResponsiveDialog
        open={!!reviewing}
        onOpenChange={(o) => !o && closeReview()}
        title="Réviser la situation"
        contentClassName="sm:max-w-md"
        footer={
          <>
            <Button variant="outline" onClick={closeReview} disabled={submitting}>
              Annuler
            </Button>
            <Button
              onClick={handleSubmitReview}
              disabled={submitting || (action === "refuse" && !refusalReason.trim())}
              variant={action === "refuse" ? "destructive" : "default"}
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : action === "validate" ? (
                <CheckCircle2 className="h-4 w-4 mr-2" />
              ) : (
                <XCircle className="h-4 w-4 mr-2" />
              )}
              {action === "validate" ? "Valider" : "Refuser"}
            </Button>
          </>
        }
      >
        {reviewing && (
          <div className="space-y-4">
            <div className="bg-muted/50 rounded-lg px-3 py-2 text-sm space-y-0.5">
              <p className="font-medium">{reviewing.lotLabel}</p>
              <p className="text-xs text-muted-foreground">{reviewing.contributorName}</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setAction("validate")}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors",
                  action === "validate"
                    ? "border-green-500 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                    : "hover:bg-muted"
                )}
              >
                <CheckCircle2 className="h-4 w-4" />
                Valider
              </button>
              <button
                onClick={() => setAction("refuse")}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors",
                  action === "refuse"
                    ? "border-red-500 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                    : "hover:bg-muted"
                )}
              >
                <XCircle className="h-4 w-4" />
                Refuser
              </button>
            </div>

            {action === "refuse" && (
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Motif de refus <span className="text-destructive">*</span>
                </label>
                <Textarea
                  placeholder="Expliquez pourquoi la situation est refusée…"
                  value={refusalReason}
                  onChange={(e) => setRefusalReason(e.target.value)}
                  rows={3}
                  className="resize-none text-sm"
                  maxLength={500}
                />
              </div>
            )}

            <div>
              <label className="text-sm font-medium mb-1.5 block">
                Commentaire <span className="text-muted-foreground font-normal">(optionnel)</span>
              </label>
              <Textarea
                placeholder="Remarques transmises au prestataire…"
                value={reviewerComment}
                onChange={(e) => setReviewerComment(e.target.value)}
                rows={2}
                className="resize-none text-sm"
                maxLength={1000}
              />
            </div>
          </div>
        )}
      </ResponsiveDialog>
    </div>
  )
}

function SituationCard({
  situation: s,
  highlighted = false,
  onReview,
}: {
  situation: Situation
  highlighted?: boolean
  onReview?: (s: Situation) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const hasDetails = s.refusal_reason || s.reviewer_comment || (s.attachments?.length ?? 0) > 0
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!highlighted) return
    const t = setTimeout(() => {
      cardRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
    }, 350)
    return () => clearTimeout(t)
  }, [highlighted])

  return (
    <Card
      ref={cardRef}
      data-situation-id={s.id}
      className={cn(
        "transition-all duration-300",
        highlighted && "border-ring ring-3 ring-ring/50"
      )}
    >
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {s.contributor?.name && (
              <p className="text-xs text-muted-foreground mb-0.5">{s.contributor.name}</p>
            )}
            <p className="font-medium text-sm truncate">{s.lot_label}</p>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="text-xs text-muted-foreground font-medium">{s.percentage}%</span>
              {s.amount_ht && (
                <span className="text-xs text-muted-foreground">
                  {s.amount_ht.toLocaleString("fr-FR", { minimumFractionDigits: 0 })} € HT
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

        {/* Pièces jointes toujours visibles sur les situations validées */}
        {s.status === "validee" && (s.attachments?.length ?? 0) > 0 && (
          <div className="space-y-1">
            {s.attachments!.map((a) => (
              <a
                key={a.id}
                href={a.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-primary hover:underline"
              >
                <FileText className="h-3 w-3 shrink-0" />
                {a.file_name ?? "Fichier"}
              </a>
            ))}
          </div>
        )}

        {/* Détails masquables pour les autres statuts */}
        {hasDetails && s.status !== "validee" && (
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
                    <p className="text-xs font-medium text-red-700 dark:text-red-400 mb-0.5 flex items-center gap-1.5">
                      <AlertCircle className="h-3.5 w-3.5" />
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

        {onReview && (s.status === "en_attente" || s.status === "corrigee") && (
          <>
            <Separator />
            <Button size="sm" variant="outline" className="w-full" onClick={() => onReview(s)}>
              Réviser cette situation
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}
