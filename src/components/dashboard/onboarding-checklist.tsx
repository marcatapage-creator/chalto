"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Circle, ChevronRight, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { FadeIn } from "@/components/ui/motion"

interface Step {
  id: string
  label: string
  description: string
  completed: boolean
  action?: {
    label: string
    href: string
  }
}

interface OnboardingChecklistProps {
  userId: string
  demoProjectId?: string | null
  documentSentCount: number
}

export function OnboardingChecklist({
  userId,
  demoProjectId,
  documentSentCount,
}: OnboardingChecklistProps) {
  const [dismissed, setDismissed] = useState(
    () => typeof window !== "undefined" && !!localStorage.getItem(`checklist_dismissed_${userId}`)
  )
  const [projectVisited, setProjectVisited] = useState(
    () => typeof window !== "undefined" && !!localStorage.getItem(`demo_visited_${userId}`)
  )
  const router = useRouter()

  const steps: Step[] = [
    {
      id: "profile",
      label: "Votre compte est créé",
      description: "Bienvenue sur Chalto !",
      completed: true,
    },
    {
      id: "demo",
      label: "Explorez votre projet démo",
      description: "Découvrez comment Chalto fonctionne avec un projet exemple",
      completed: projectVisited,
      action: demoProjectId
        ? {
            label: "Voir le projet démo",
            href: `/projects/${demoProjectId}`,
          }
        : undefined,
    },
    {
      id: "send",
      label: "Envoyez votre premier lien client",
      description: "Faites valider un document par un client en 1 clic",
      completed: documentSentCount > 0,
      action: {
        label: "Créer un projet",
        href: "/projects/new",
      },
    },
  ]

  const completedCount = steps.filter((s) => s.completed).length
  const progress = Math.round((completedCount / steps.length) * 100)
  const allCompleted = completedCount === steps.length

  const handleStepClick = (step: Step) => {
    if (!step.action) return
    if (step.id === "demo") {
      localStorage.setItem(`demo_visited_${userId}`, "true")
      setProjectVisited(true)
    }
    router.push(step.action.href)
  }

  const handleDismiss = () => {
    localStorage.setItem(`checklist_dismissed_${userId}`, "true")
    setDismissed(true)
  }

  if (dismissed) return null

  return (
    <FadeIn>
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="p-5 space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="font-semibold text-sm">
                {allCompleted ? "🎉 Vous êtes prêt !" : "Démarrer avec Chalto"}
              </p>
              <p className="text-xs text-muted-foreground">
                {allCompleted
                  ? "Vous avez complété toutes les étapes"
                  : `${completedCount}/${steps.length} étapes complétées`}
              </p>
            </div>
            <button
              onClick={handleDismiss}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Progress bar */}
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Steps */}
          <div className="space-y-2">
            {steps.map((step) => (
              <div
                key={step.id}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg transition-colors",
                  !step.completed && step.action ? "cursor-pointer hover:bg-background/60" : ""
                )}
                onClick={() => !step.completed && handleStepClick(step)}
              >
                {step.completed ? (
                  <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      "text-sm font-medium",
                      step.completed && "line-through text-muted-foreground"
                    )}
                  >
                    {step.label}
                  </p>
                  {!step.completed && (
                    <p className="text-xs text-muted-foreground">{step.description}</p>
                  )}
                </div>
                {!step.completed && step.action && (
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                )}
              </div>
            ))}
          </div>

          {/* CTA si tout complété */}
          {allCompleted && (
            <Button size="sm" className="w-full" onClick={handleDismiss}>
              Fermer et continuer 🚀
            </Button>
          )}
        </CardContent>
      </Card>
    </FadeIn>
  )
}
