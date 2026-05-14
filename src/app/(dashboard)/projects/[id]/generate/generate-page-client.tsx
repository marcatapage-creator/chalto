"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { scrollOnFocus } from "@/hooks/use-scroll-on-focus"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { ArrowLeft, FileText, Sparkles, CheckCircle2, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

type DocumentType = "cctp" | "aps"
type NiveauPrestation = "economique" | "standard" | "premium"
type Step = 1 | 2 | 3 | 4

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

const stepSlideVariants = {
  enter: (dir: number) => ({ x: `${dir * 30}%`, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: `${dir * -20}%`, opacity: 0 }),
}

interface GeneratePageClientProps {
  projectId: string
  projectName: string
  workType: string
  clientName?: string
  professionSlug?: string | null
}

export function GeneratePageClient({
  projectId,
  projectName,
  workType,
  clientName,
  professionSlug,
}: GeneratePageClientProps) {
  const router = useRouter()
  const isArchiInterieur = professionSlug === "architecte_interieur"

  const [step, setStep] = useState<Step>(1)
  const [stepDir, setStepDir] = useState(1)
  const [docType, setDocType] = useState<DocumentType>(isArchiInterieur ? "aps" : "cctp")
  const [answers, setAnswers] = useState<Answers>(EMPTY_ANSWERS)
  const [generating, setGenerating] = useState(false)
  const [done, setDone] = useState(false)

  const goForward = (nextStep: Step) => {
    setStepDir(1)
    setStep(nextStep)
  }

  const goBack = (prevStep: Step) => {
    setStepDir(-1)
    setStep(prevStep)
  }

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
    goForward(4)
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
        goBack(3)
        return
      }

      setDone(true)
      router.refresh()
    } catch {
      toast.error("Erreur réseau — réessayez")
      goBack(3)
    } finally {
      setGenerating(false)
    }
  }

  const docLabel = docType === "aps" ? "APS" : "CCTP"

  const stepTitles: Record<Step, string> = {
    1: "Type de document",
    2: docType === "aps" ? "Pièces et ambiance" : "Lots et matériaux",
    3: "Niveau de prestation",
    4: "Génération",
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="shrink-0 border-b px-4 py-3 flex items-center gap-3 bg-popover">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={() => (step > 1 && step < 4 ? goBack((step - 1) as Step) : router.back())}
          disabled={step === 4 && generating}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary shrink-0" />
            <p className="text-sm font-medium">{stepTitles[step]}</p>
          </div>
          <p className="text-xs text-muted-foreground truncate">{projectName}</p>
        </div>
        {/* Progress dots — étapes 2 et 3 */}
        {(step === 2 || step === 3) && (
          <div className="flex gap-1 shrink-0">
            {([2, 3] as const).map((s) => (
              <div
                key={s}
                className={cn(
                  "rounded-full transition-all duration-300",
                  s === step ? "w-5 h-1.5 bg-primary" : "w-1.5 h-1.5 bg-border"
                )}
              />
            ))}
          </div>
        )}
      </div>

      {/* Contenu scrollable */}
      <div className="flex-1 overflow-y-auto overscroll-contain">
        <div className="max-w-lg mx-auto px-4 py-6">
          <AnimatePresence mode="wait" initial={false} custom={stepDir}>
            <motion.div
              key={step}
              custom={stepDir}
              variants={stepSlideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.18, ease: [0.32, 0.72, 0, 1] }}
            >
              {/* ── Étape 1 — Choix du type ── */}
              {step === 1 && (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">Choisissez un type de document</p>

                  {isArchiInterieur ? (
                    <>
                      <button
                        onClick={() => {
                          setDocType("aps")
                          goForward(2)
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
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm">{label}</p>
                            <Badge variant="outline" className="text-xs shrink-0">
                              Bientôt
                            </Badge>
                          </div>
                        </button>
                      ))}
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setDocType("cctp")
                          goForward(2)
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
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm">{label}</p>
                            <Badge variant="outline" className="text-xs shrink-0">
                              Bientôt
                            </Badge>
                          </div>
                        </button>
                      ))}
                    </>
                  )}
                </div>
              )}

              {/* ── Étape 2 — Lots / Pièces ── */}
              {step === 2 && docType === "aps" && (
                <div className="space-y-5">
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
                            "px-3 py-1.5 rounded-lg text-xs border transition-all duration-150 max-sm:h-11 max-sm:py-0",
                            answers.pieces.includes(piece)
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border hover:border-primary/50 hover:bg-muted"
                          )}
                        >
                          {piece}
                        </button>
                      ))}
                    </div>
                    {answers.pieces.length === 0 && (
                      <p className="text-xs text-muted-foreground">
                        Sélectionnez au moins une pièce
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ambiance" className="text-sm font-medium">
                      Ambiance et style souhaités
                    </Label>
                    <Textarea
                      id="ambiance"
                      placeholder="Ex : Japandi minimaliste, tons neutres, matières naturelles..."
                      value={answers.ambiance}
                      onChange={(e) =>
                        setAnswers((prev) => ({ ...prev, ambiance: e.target.value }))
                      }
                      onFocus={scrollOnFocus}
                      rows={2}
                      className="resize-none text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contraintes-aps" className="text-sm font-medium">
                      Contraintes particulières
                    </Label>
                    <Textarea
                      id="contraintes-aps"
                      placeholder="Ex : copropriété, hauteur sous plafond réduite, budget serré..."
                      value={answers.contraintes}
                      onChange={(e) =>
                        setAnswers((prev) => ({ ...prev, contraintes: e.target.value }))
                      }
                      onFocus={scrollOnFocus}
                      rows={2}
                      className="resize-none text-sm"
                    />
                  </div>
                </div>
              )}

              {step === 2 && docType === "cctp" && (
                <div className="space-y-5">
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
                            "px-3 py-1.5 rounded-lg text-xs border transition-all duration-150 max-sm:h-11 max-sm:py-0",
                            answers.lots.includes(lot)
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border hover:border-primary/50 hover:bg-muted"
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
                      onChange={(e) =>
                        setAnswers((prev) => ({ ...prev, materiaux: e.target.value }))
                      }
                      onFocus={scrollOnFocus}
                      rows={2}
                      className="resize-none text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contraintes-cctp" className="text-sm font-medium">
                      Contraintes particulières
                    </Label>
                    <Textarea
                      id="contraintes-cctp"
                      placeholder="Ex : site classé, zone sismique, délai serré, accès difficile..."
                      value={answers.contraintes}
                      onChange={(e) =>
                        setAnswers((prev) => ({ ...prev, contraintes: e.target.value }))
                      }
                      onFocus={scrollOnFocus}
                      rows={2}
                      className="resize-none text-sm"
                    />
                  </div>
                </div>
              )}

              {/* ── Étape 3 — Niveau de prestation ── */}
              {step === 3 && (
                <div className="space-y-4">
                  <Label className="text-sm font-medium">Niveau de prestation</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
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
              )}

              {/* ── Étape 4 — Génération ── */}
              {step === 4 && (
                <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
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
                      <Button
                        onClick={() => router.push(`/projects/${projectId}`)}
                        className="mt-2"
                      >
                        Voir les documents
                      </Button>
                    </>
                  ) : null}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Footer fixe — masqué aux étapes 1 (navigation par clic) et 4 (génération) */}
      {step === 2 && (
        <div className="shrink-0 border-t px-4 py-4 bg-popover">
          <div className="max-w-lg mx-auto flex gap-3">
            <Button variant="outline" onClick={() => goBack(1)} className="flex-1">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            <Button onClick={() => goForward(3)} disabled={!canProceed} className="flex-1">
              Suivant
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="shrink-0 border-t px-4 py-4 bg-popover">
          <div className="max-w-lg mx-auto flex gap-3">
            <Button variant="outline" onClick={() => goBack(2)} className="flex-1">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            <Button onClick={handleGenerate} className="flex-1">
              <Sparkles className="h-4 w-4 mr-2" />
              Générer
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
