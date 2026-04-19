"use client"

import { Fragment, useState } from "react"
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
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import {
  ClipboardList,
  Pencil,
  CheckSquare,
  HardHat,
  Search,
  Archive,
  ChevronRight,
  Check,
  ListTodo,
  MessageSquare,
} from "lucide-react"

const CHANTIER_DISMISSED_KEY = "chantier_onboarding_dismissed"

const phases = [
  { id: "cadrage", label: "Cadrage", icon: ClipboardList },
  { id: "conception", label: "Conception", icon: Pencil },
  { id: "validation", label: "Validation", icon: CheckSquare },
  { id: "chantier", label: "Chantier", icon: HardHat },
  { id: "reception", label: "Réception", icon: Search },
  { id: "cloture", label: "Clôturé", icon: Archive },
]

interface ProjectStepperProps {
  projectId: string
  currentPhase: string
  readOnly?: boolean
  onPhaseChange?: (phase: string) => void
}

export function ProjectStepper({
  projectId,
  currentPhase,
  readOnly = false,
  onPhaseChange,
}: ProjectStepperProps) {
  const [phase, setPhase] = useState(currentPhase)
  const [loading, setLoading] = useState(false)
  const [showChantierDialog, setShowChantierDialog] = useState(false)
  const [dontShowAgain, setDontShowAgain] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const currentIndex = phases.findIndex((p) => p.id === phase)
  const nextPhase = phases[currentIndex + 1]

  const doAdvance = async () => {
    if (!nextPhase) return
    setLoading(true)
    const { error } = await supabase
      .from("projects")
      .update({ phase: nextPhase.id })
      .eq("id", projectId)

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
    void doAdvance()
  }

  const handleChantierConfirm = () => {
    if (dontShowAgain) {
      localStorage.setItem(CHANTIER_DISMISSED_KEY, "true")
    }
    setShowChantierDialog(false)
    void doAdvance()
  }

  return (
    <>
      <Dialog open={showChantierDialog} onOpenChange={setShowChantierDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HardHat className="h-5 w-5 text-primary" />
              Phase Chantier débloquée
            </DialogTitle>
            <DialogDescription>
              Vous entrez en phase chantier. Voici ce que vous pouvez faire maintenant :
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-1">
            <div className="flex items-start gap-3 rounded-lg border p-3">
              <ListTodo className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium">Tâches</p>
                <p className="text-xs text-muted-foreground">
                  Créez des tâches et affectez-les à vos prestataires pour suivre l&apos;avancement
                  du chantier.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border p-3">
              <MessageSquare className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium">Fil de discussion chantier</p>
                <p className="text-xs text-muted-foreground">
                  Échangez directement avec vos prestataires via un fil de conversation dédié à ce
                  chantier.
                </p>
              </div>
            </div>
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
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Phase du projet
          </p>
          {nextPhase && !readOnly && (
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-7"
              onClick={handleAdvance}
              loading={loading}
            >
              Passer à : {nextPhase.label}
              <ChevronRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          )}
        </div>

        {/* Stepper horizontal */}
        <div className="flex items-start overflow-x-auto pb-1">
          {phases.map((p, index) => {
            const Icon = p.icon
            const isCompleted = index < currentIndex
            const isActive = p.id === phase
            const isFuture = index > currentIndex

            return (
              <Fragment key={p.id}>
                {/* Étape */}
                <div
                  className={cn(
                    "flex flex-col items-center gap-1.5 shrink-0 transition-opacity duration-200",
                    isFuture && "opacity-35"
                  )}
                >
                  <div
                    className={cn(
                      "h-7 w-7 rounded-full flex items-center justify-center transition-all duration-200",
                      isCompleted
                        ? "bg-primary text-primary-foreground"
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
                  <p
                    className={cn(
                      "text-xs font-medium text-center leading-tight",
                      isActive ? "text-primary" : "text-muted-foreground",
                      !isActive && "hidden sm:block"
                    )}
                  >
                    {p.label}
                  </p>
                </div>

                {/* Connecteur */}
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
      </div>
    </>
  )
}
