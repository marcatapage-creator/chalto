"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Sparkles, FileText, CheckCircle2, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface GenerateDocumentDialogProps {
  projectId: string
  projectName: string
  workType: string
  clientName?: string
  professionSlug?: string | null
}

type DocumentType = "cctp" | "aps"
type NiveauPrestation = "economique" | "standard" | "premium"

const LOTS_ARCHITECTE = [
  "Gros œuvre",
  "Charpente",
  "Menuiserie",
  "Plomberie",
  "Électricité",
  "Revêtements",
  "Façade",
]

const PIECES_ARCHI_INTERIEUR = [
  "Salon / Séjour",
  "Salle à manger",
  "Cuisine",
  "Chambre principale",
  "Chambre(s)",
  "Salle de bain",
  "WC / Toilettes",
  "Entrée / Hall",
  "Bureau",
  "Dressing",
  "Terrasse / Extérieur",
]

const NIVEAUX: { value: NiveauPrestation; label: string; description: string }[] = [
  {
    value: "economique",
    label: "Économique",
    description: "Matériaux standards, solutions éprouvées",
  },
  {
    value: "standard",
    label: "Standard",
    description: "Bon rapport qualité/prix, finitions soignées",
  },
  { value: "premium", label: "Premium", description: "Matériaux haut de gamme, finitions luxe" },
]

interface Answers {
  lots: string[]
  pieces: string[]
  materiaux: string
  ambiance: string
  contraintes: string
  niveau: NiveauPrestation
}

const EMPTY_ANSWERS: Answers = {
  lots: [],
  pieces: [],
  materiaux: "",
  ambiance: "",
  contraintes: "",
  niveau: "standard",
}

type Step = 1 | 2 | 3

export function GenerateDocumentDialog({
  projectId,
  projectName,
  workType,
  clientName,
  professionSlug,
}: GenerateDocumentDialogProps) {
  const isArchiInterieur = professionSlug === "architecte_interieur"

  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<Step>(1)
  const [docType, setDocType] = useState<DocumentType>(isArchiInterieur ? "aps" : "cctp")
  const [answers, setAnswers] = useState<Answers>(EMPTY_ANSWERS)
  const [generating, setGenerating] = useState(false)
  const [done, setDone] = useState(false)
  const router = useRouter()

  const toggleItem = (field: "lots" | "pieces", value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((v) => v !== value)
        : [...prev[field], value],
    }))
  }

  const canProceed = docType === "aps" ? answers.pieces.length > 0 : answers.lots.length > 0

  const handleGenerate = async () => {
    setStep(3)
    setGenerating(true)

    try {
      const res = await fetch("/api/generate-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          projectName,
          workType,
          clientName,
          professionSlug,
          documentType: docType,
          answers,
        }),
      })

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string }
        toast.error(data.error ?? "Erreur lors de la génération")
        setStep(2)
        return
      }

      setDone(true)
      router.refresh()
    } catch {
      toast.error("Erreur réseau — réessayez")
      setStep(2)
    } finally {
      setGenerating(false)
    }
  }

  const handleOpenChange = (val: boolean) => {
    setOpen(val)
    if (!val) {
      setTimeout(() => {
        setStep(1)
        setDocType(isArchiInterieur ? "aps" : "cctp")
        setAnswers(EMPTY_ANSWERS)
        setGenerating(false)
        setDone(false)
      }, 200)
    }
  }

  const docLabel = docType === "aps" ? "APS" : "CCTP"

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <style>{`
        @property --ai-btn-angle {
          syntax: '<angle>';
          initial-value: 0deg;
          inherits: false;
        }
        @keyframes ai-btn-spin {
          to { --ai-btn-angle: 360deg; }
        }
        .ai-btn-border {
          background: conic-gradient(from var(--ai-btn-angle), hsl(var(--border) / 0.5) 25%, hsl(224 79% 65% / 0.45), #a78bfa70, hsl(224 79% 65% / 0.45), hsl(var(--border) / 0.5) 75%);
          animation: ai-btn-spin 7s linear infinite;
        }
      `}</style>
      <DialogTrigger asChild>
        <div
          role="button"
          className="ai-btn-border rounded-md p-px inline-flex cursor-pointer shrink-0"
        >
          <div className="inline-flex items-center gap-1.5 h-8 px-3 rounded-[5px] bg-background text-sm font-medium hover:bg-muted/60 transition-colors">
            <Sparkles className="h-3.5 w-3.5 text-violet-500" />
            <span className="sm:hidden">IA</span>
            <span className="hidden sm:inline">Générer IA</span>
          </div>
        </div>
      </DialogTrigger>

      <DialogContent className="max-w-[calc(100%-3rem)] sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Générer un document
          </DialogTitle>
        </DialogHeader>

        {/* Étape 1 — Choix du type */}
        {step === 1 && (
          <div className="space-y-3 py-2">
            <p className="text-sm text-muted-foreground">Choisissez un type de document</p>

            {isArchiInterieur ? (
              <>
                <button
                  onClick={() => {
                    setDocType("aps")
                    setStep(2)
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border-2 border-primary bg-primary/5 text-left transition-colors"
                >
                  <FileText className="h-4 w-4 text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">APS</p>
                      <Badge variant="secondary" className="text-xs shrink-0">
                        Disponible
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
                      Avant-Projet Sommaire — note d&apos;intention et orientations
                    </p>
                  </div>
                </button>
                {(["APD", "Notice descriptive", "DPGF"] as const).map((label) => (
                  <button
                    key={label}
                    disabled
                    className="w-full flex items-center gap-3 p-3 rounded-xl border border-border text-left opacity-40 cursor-not-allowed"
                  >
                    <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{label}</p>
                        <Badge variant="outline" className="text-xs shrink-0">
                          Bientôt
                        </Badge>
                      </div>
                    </div>
                  </button>
                ))}
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    setDocType("cctp")
                    setStep(2)
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border-2 border-primary bg-primary/5 text-left transition-colors"
                >
                  <FileText className="h-4 w-4 text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">CCTP</p>
                      <Badge variant="secondary" className="text-xs shrink-0">
                        Disponible
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
                      Spécifications techniques par lot
                    </p>
                  </div>
                </button>
                {(["DPGF", "Notice descriptive"] as const).map((label) => (
                  <button
                    key={label}
                    disabled
                    className="w-full flex items-center gap-3 p-3 rounded-xl border border-border text-left opacity-40 cursor-not-allowed"
                  >
                    <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{label}</p>
                        <Badge variant="outline" className="text-xs shrink-0">
                          Bientôt
                        </Badge>
                      </div>
                    </div>
                  </button>
                ))}
              </>
            )}
          </div>
        )}

        {/* Étape 2 — APS */}
        {step === 2 && docType === "aps" && (
          <div className="space-y-5 py-2">
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Pièces concernées <span className="text-destructive">*</span>
              </Label>
              <div className="flex flex-wrap gap-2">
                {PIECES_ARCHI_INTERIEUR.map((piece) => (
                  <button
                    key={piece}
                    onClick={() => toggleItem("pieces", piece)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                      answers.pieces.includes(piece)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-muted-foreground border-border hover:border-primary/50"
                    )}
                  >
                    {piece}
                  </button>
                ))}
              </div>
              {answers.pieces.length === 0 && (
                <p className="text-xs text-muted-foreground">Sélectionnez au moins une pièce</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="ambiance" className="text-sm font-medium">
                Ambiance et style souhaités
              </Label>
              <Textarea
                id="ambiance"
                placeholder="Ex : Japandi minimaliste, tons neutres, matières naturelles, touches de couleur..."
                value={answers.ambiance}
                onChange={(e) => setAnswers((prev) => ({ ...prev, ambiance: e.target.value }))}
                rows={2}
                className="resize-none text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contraintes" className="text-sm font-medium">
                Contraintes particulières
              </Label>
              <Textarea
                id="contraintes"
                placeholder="Ex : copropriété, hauteur sous plafond réduite, budget serré, délai court..."
                value={answers.contraintes}
                onChange={(e) => setAnswers((prev) => ({ ...prev, contraintes: e.target.value }))}
                rows={2}
                className="resize-none text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Niveau de prestation</Label>
              <div className="grid grid-cols-3 gap-2">
                {NIVEAUX.map(({ value, label, description }) => (
                  <button
                    key={value}
                    onClick={() => setAnswers((prev) => ({ ...prev, niveau: value }))}
                    className={cn(
                      "flex flex-col items-start p-3 rounded-lg border text-left transition-colors",
                      answers.niveau === value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/40"
                    )}
                  >
                    <span className="text-xs font-semibold">{label}</span>
                    <span className="text-xs text-muted-foreground mt-0.5 leading-tight">
                      {description}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                Retour
              </Button>
              <Button onClick={handleGenerate} disabled={!canProceed} className="flex-1">
                <Sparkles className="h-4 w-4 mr-2" />
                Générer
              </Button>
            </div>
          </div>
        )}

        {/* Étape 2 — CCTP */}
        {step === 2 && docType === "cctp" && (
          <div className="space-y-5 py-2">
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Lots concernés <span className="text-destructive">*</span>
              </Label>
              <div className="flex flex-wrap gap-2">
                {LOTS_ARCHITECTE.map((lot) => (
                  <button
                    key={lot}
                    onClick={() => toggleItem("lots", lot)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                      answers.lots.includes(lot)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-muted-foreground border-border hover:border-primary/50"
                    )}
                  >
                    {lot}
                  </button>
                ))}
              </div>
              {answers.lots.length === 0 && (
                <p className="text-xs text-muted-foreground">Sélectionnez au moins un lot</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="materiaux" className="text-sm font-medium">
                Matériaux souhaités
              </Label>
              <Textarea
                id="materiaux"
                placeholder="Ex : béton banché, ossature bois, menuiseries aluminium thermolaqué..."
                value={answers.materiaux}
                onChange={(e) => setAnswers((prev) => ({ ...prev, materiaux: e.target.value }))}
                rows={2}
                className="resize-none text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contraintes" className="text-sm font-medium">
                Contraintes particulières
              </Label>
              <Textarea
                id="contraintes"
                placeholder="Ex : site classé, zone sismique, délai serré, accès difficile..."
                value={answers.contraintes}
                onChange={(e) => setAnswers((prev) => ({ ...prev, contraintes: e.target.value }))}
                rows={2}
                className="resize-none text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Niveau de prestation</Label>
              <div className="grid grid-cols-3 gap-2">
                {NIVEAUX.map(({ value, label, description }) => (
                  <button
                    key={value}
                    onClick={() => setAnswers((prev) => ({ ...prev, niveau: value }))}
                    className={cn(
                      "flex flex-col items-start p-3 rounded-lg border text-left transition-colors",
                      answers.niveau === value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/40"
                    )}
                  >
                    <span className="text-xs font-semibold">{label}</span>
                    <span className="text-xs text-muted-foreground mt-0.5 leading-tight">
                      {description}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                Retour
              </Button>
              <Button onClick={handleGenerate} disabled={!canProceed} className="flex-1">
                <Sparkles className="h-4 w-4 mr-2" />
                Générer
              </Button>
            </div>
          </div>
        )}

        {/* Étape 3 — Loader / Confirmation */}
        {step === 3 && (
          <div className="flex flex-col items-center justify-center py-10 gap-4 text-center">
            {generating ? (
              <>
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
                <div>
                  <p className="font-medium">Génération en cours…</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {docType === "aps"
                      ? "L'APS est en cours de rédaction, cela peut prendre quelques secondes."
                      : "Le CCTP est en cours de rédaction, cela peut prendre quelques secondes."}
                  </p>
                </div>
              </>
            ) : done ? (
              <>
                <CheckCircle2 className="h-10 w-10 text-green-500" />
                <div>
                  <p className="font-medium">Document généré ✅</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    L&apos;{docLabel} a été ajouté à vos documents en brouillon.
                  </p>
                </div>
                <Button onClick={() => handleOpenChange(false)} className="mt-2">
                  Fermer
                </Button>
              </>
            ) : null}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
