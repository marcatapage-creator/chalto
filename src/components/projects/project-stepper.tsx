"use client"

import { Fragment, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
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
} from "lucide-react"

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
}

export function ProjectStepper({ projectId, currentPhase }: ProjectStepperProps) {
  const [phase, setPhase] = useState(currentPhase)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const currentIndex = phases.findIndex((p) => p.id === phase)
  const nextPhase = phases[currentIndex + 1]

  const handleAdvance = async () => {
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
      toast.success(`Phase "${nextPhase.label}"`)
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Phase du projet
        </p>
        {nextPhase && (
          <Button
            variant="outline"
            size="sm"
            className="text-xs h-7"
            onClick={handleAdvance}
            disabled={loading}
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
                    isActive ? "text-primary" : "text-muted-foreground"
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
  )
}
