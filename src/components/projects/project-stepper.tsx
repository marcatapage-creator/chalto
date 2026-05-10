"use client"

import { Fragment, useState } from "react"
import { motion } from "framer-motion"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { cn, isChantierPhase } from "@/lib/utils"
import { toast } from "sonner"
import { OnboardingTooltip } from "@/components/ui/onboarding-tooltip"
import { ChevronRight, ChevronLeft, Check, Archive, CheckSquare } from "lucide-react"
import { getProfessionConfig } from "@/lib/profession-config"

const CHANTIER_DISMISSED_KEY = "chantier_onboarding_dismissed"
const CLOTURE_DISMISSED_KEY = "cloture_warning_dismissed"

interface ProjectStepperProps {
  projectId: string
  currentPhase: string
  professionSlug?: string | null
  readOnly?: boolean
  onPhaseChange?: (phase: string) => void
}

export function ProjectStepper({
  projectId,
  currentPhase,
  professionSlug,
  readOnly = false,
  onPhaseChange,
}: ProjectStepperProps) {
  const [phase, setPhase] = useState(currentPhase)
  const [loading, setLoading] = useState(false)
  const [showChantierDialog, setShowChantierDialog] = useState(false)
  const [dontShowAgain, setDontShowAgain] = useState(false)
  const [showClotureDialog, setShowClotureDialog] = useState(false)
  const [dontShowClotureAgain, setDontShowClotureAgain] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const config = getProfessionConfig(professionSlug)
  const { phases, chantierDialog, chantierBlockedToast, stepperTooltip } = config

  const currentIndex = phases.findIndex((p) => p.id === phase)
  const nextPhase = phases[currentIndex + 1]
  const prevPhase = phases[currentIndex - 1]

  const doGoBack = async (targetPhase: string) => {
    setLoading(true)
    const update: { phase: string; status?: string } = { phase: targetPhase }
    if (phase === "cloture") update.status = "active"

    const { error } = await supabase.from("projects").update(update).eq("id", projectId)

    if (error) {
      toast.error("Erreur lors du changement de phase")
    } else {
      setPhase(targetPhase)
      onPhaseChange?.(targetPhase)
      const label = phases.find((p) => p.id === targetPhase)?.label
      toast.success(`Retour en phase "${label}"`)
      router.refresh()
    }
    setLoading(false)
  }

  const chantierIndex = phases.findIndex((p) => p.id === "chantier")

  const handlePhaseClick = (targetId: string, targetIndex: number) => {
    if (readOnly || targetIndex >= currentIndex) return
    if (isChantierPhase(phase) && targetIndex < chantierIndex) {
      toast.warning(chantierBlockedToast)
      return
    }
    void doGoBack(targetId)
  }

  const doAdvance = async () => {
    if (!nextPhase) return
    setLoading(true)
    const update: { phase: string; status?: string } = { phase: nextPhase.id }
    if (nextPhase.id === "cloture") update.status = "completed"

    const { error } = await supabase.from("projects").update(update).eq("id", projectId)

    if (error) {
      toast.error("Erreur lors du changement de phase")
    } else {
      setPhase(nextPhase.id)
      onPhaseChange?.(nextPhase.id)
      toast.success(`Phase "${nextPhase.label}"`)
      router.refresh()
    }
    setLoading(false)
  }

  const handleAdvance = () => {
    if (!nextPhase) return
    if (nextPhase.id === "chantier" && typeof window !== "undefined") {
      const dismissed = localStorage.getItem(CHANTIER_DISMISSED_KEY) === "true"
      if (!dismissed) {
        setShowChantierDialog(true)
        return
      }
    }
    if (nextPhase.id === "cloture" && typeof window !== "undefined") {
      const dismissed = localStorage.getItem(CLOTURE_DISMISSED_KEY) === "true"
      if (!dismissed) {
        setShowClotureDialog(true)
        return
      }
    }
    void doAdvance()
  }

  const handleChantierConfirm = () => {
    if (dontShowAgain) localStorage.setItem(CHANTIER_DISMISSED_KEY, "true")
    setShowChantierDialog(false)
    void doAdvance()
  }

  const handleClotureConfirm = () => {
    if (dontShowClotureAgain) localStorage.setItem(CLOTURE_DISMISSED_KEY, "true")
    setShowClotureDialog(false)
    void doAdvance()
  }

  const ChantierIcon = chantierDialog.items[0]?.icon

  return (
    <>
      <Dialog open={showChantierDialog} onOpenChange={setShowChantierDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {ChantierIcon && <ChantierIcon className="h-5 w-5 text-primary" />}
              {chantierDialog.title}
            </DialogTitle>
            <DialogDescription>{chantierDialog.description}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-1">
            {chantierDialog.items.map(({ icon: Icon, title, description }) => (
              <div key={title} className="flex items-start gap-3 rounded-lg border p-3">
                <Icon className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium">{title}</p>
                  <p className="text-xs text-muted-foreground">{description}</p>
                </div>
              </div>
            ))}
          </div>
          <DialogFooter className="flex-col gap-3 sm:flex-col">
            <label className="flex items-center gap-2 cursor-pointer text-sm text-muted-foreground self-start">
              <Checkbox
                checked={dontShowAgain}
                onCheckedChange={(v) => setDontShowAgain(v === true)}
              />
              Ne plus afficher ce message
            </label>
            <Button onClick={handleChantierConfirm} className="w-full sm:w-auto">
              C&apos;est parti !
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showClotureDialog} onOpenChange={setShowClotureDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Archive className="h-5 w-5 text-primary" />
              Clôturer le projet
            </DialogTitle>
            <DialogDescription>
              Cette action va marquer le projet comme <strong>Terminé</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-1">
            <div className="flex items-start gap-3 rounded-lg border p-3 bg-muted/40">
              <CheckSquare className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium">Statut mis à jour</p>
                <p className="text-xs text-muted-foreground">
                  Le statut du projet passera de <strong>En cours</strong> à{" "}
                  <strong>Terminé</strong>. Il restera accessible en consultation.
                </p>
              </div>
            </div>
          </div>
          <DialogFooter className="flex-col gap-3 sm:flex-col">
            <label className="flex items-center gap-2 cursor-pointer text-sm text-muted-foreground self-start">
              <Checkbox
                checked={dontShowClotureAgain}
                onCheckedChange={(v) => setDontShowClotureAgain(v === true)}
              />
              Ne plus afficher ce message
            </label>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowClotureDialog(false)}
              >
                Annuler
              </Button>
              <Button className="flex-1" onClick={handleClotureConfirm}>
                Clôturer
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <OnboardingTooltip
            id="project-stepper"
            title="Phases du projet"
            description={stepperTooltip}
            position="bottom"
            align="start"
          >
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Phase du projet
            </p>
          </OnboardingTooltip>
          {nextPhase && !readOnly && (
            <Button
              variant="outline"
              size="sm"
              className="hidden sm:flex text-xs h-7"
              onClick={handleAdvance}
              loading={loading}
            >
              Passer à : {nextPhase.label}
              <ChevronRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          )}
        </div>

        {/* Stepper horizontal — desktop uniquement */}
        <div className="hidden sm:flex items-start overflow-x-auto py-3 -my-3 pb-1">
          {phases.map((p, index) => {
            const Icon = p.icon
            const isCompleted = index < currentIndex
            const isActive = p.id === phase
            const isFuture = index > currentIndex

            return (
              <Fragment key={p.id}>
                <div
                  className={cn(
                    "flex flex-col items-center gap-1.5 shrink-0 transition-opacity duration-200",
                    isFuture && "opacity-35",
                    isCompleted && !readOnly && "cursor-pointer"
                  )}
                  onClick={() => isCompleted && handlePhaseClick(p.id, index)}
                >
                  <div className="relative">
                    {isActive && (
                      <span className="animate-ping-sm absolute inline-flex h-full w-full rounded-full bg-primary opacity-25 dark:opacity-50" />
                    )}
                    <div
                      className={cn(
                        "relative h-7 w-7 rounded-full flex items-center justify-center transition-all duration-200",
                        isCompleted
                          ? "bg-primary text-primary-foreground hover:bg-primary-hover"
                          : isActive
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "bg-muted text-muted-foreground"
                      )}
                    >
                      {isCompleted ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : (
                        <Icon className="h-3.5 w-3.5" />
                      )}
                    </div>
                  </div>
                  <p className="text-xs font-medium text-center leading-tight text-muted-foreground">
                    {p.label}
                  </p>
                </div>

                {index < phases.length - 1 && (
                  <div
                    className={cn(
                      "flex-1 mt-3.5 transition-all duration-300 border-t",
                      index < currentIndex - 1
                        ? "border-primary"
                        : index === currentIndex - 1
                          ? "border-primary/40"
                          : "border-border"
                    )}
                  />
                )}
              </Fragment>
            )
          })}
        </div>

        {/* Stepper mobile — pastille active + nav gauche/droite */}
        {(() => {
          const activePhase = phases[currentIndex]
          const ActiveIcon = activePhase?.icon
          return (
            <div className="flex sm:hidden items-center justify-between">
              <button
                className={cn(
                  "h-11 w-11 flex items-center justify-center rounded-[min(var(--radius-md),12px)] border bg-background transition-colors",
                  !prevPhase || readOnly
                    ? "invisible"
                    : phase === "chantier"
                      ? "opacity-40 cursor-not-allowed"
                      : "hover:bg-muted"
                )}
                onClick={() =>
                  prevPhase &&
                  phase !== "chantier" &&
                  handlePhaseClick(prevPhase.id, currentIndex - 1)
                }
                disabled={!prevPhase || readOnly || loading || phase === "chantier"}
                aria-label={prevPhase ? `Revenir à ${prevPhase.label}` : undefined}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <div className="flex flex-col items-center gap-1.5">
                <div className="relative">
                  <span className="animate-ping-sm absolute inline-flex h-full w-full rounded-full bg-primary opacity-25 dark:opacity-50" />
                  <motion.div
                    key={phase}
                    initial={{ scale: 0.55 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 22 }}
                    className="relative h-11 w-11 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-sm"
                  >
                    {ActiveIcon && <ActiveIcon className="h-5 w-5" />}
                  </motion.div>
                </div>
                <motion.p
                  key={phase}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22, delay: 0.08 }}
                  className="text-xs font-medium text-primary"
                >
                  {activePhase?.label}
                </motion.p>
              </div>

              <button
                className={cn(
                  "h-11 w-11 flex items-center justify-center rounded-[min(var(--radius-md),12px)] border bg-background transition-colors",
                  nextPhase && !readOnly ? "hover:bg-muted" : "invisible"
                )}
                onClick={handleAdvance}
                disabled={!nextPhase || readOnly || loading}
                aria-label={nextPhase ? `Passer à ${nextPhase.label}` : undefined}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )
        })()}
      </div>
    </>
  )
}
