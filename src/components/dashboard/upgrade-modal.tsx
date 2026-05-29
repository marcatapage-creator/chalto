"use client"

import { useState } from "react"
import { ResponsiveDialog } from "@/components/ui/responsive-dialog"
import { Button } from "@/components/ui/button"
import { Check, Zap, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

const PLANS = [
  {
    key: "solo",
    name: "Solo",
    price: "29€",
    period: "/mois",
    description: "Pour les indépendants qui veulent aller vite",
    highlight: true,
    features: [
      "Projets illimités",
      "IA illimitée — CCTP, CR chantier, relances",
      "Validations automatiques",
      "Dossiers administratifs + alertes",
      "Export DOCX",
      "Support 5j/7",
    ],
  },
  {
    key: "team",
    name: "Équipe",
    price: "99€",
    period: "/mois",
    description: "Pour les cabinets et agences",
    highlight: false,
    features: [
      "Tout Solo inclus",
      "Jusqu'à 5 utilisateurs",
      "Espace collaboratif partagé",
      "Accès anticipé aux nouvelles fonctionnalités",
      "Support prioritaire",
    ],
  },
]

interface UpgradeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  reason?: "quota_projects" | "quota_ai" | "upgrade"
}

export function UpgradeModal({ open, onOpenChange, reason }: UpgradeModalProps) {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)

  const handleUpgrade = async (planKey: string) => {
    setLoadingPlan(planKey)
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planKey }),
      })
      const { url, error } = await res.json()
      if (url) {
        window.location.assign(url)
      } else {
        console.error("Checkout error:", error)
        setLoadingPlan(null)
      }
    } catch {
      setLoadingPlan(null)
    }
  }

  const reasonText =
    reason === "quota_projects"
      ? "Vous avez atteint la limite de 1 projet actif sur l'offre gratuite."
      : reason === "quota_ai"
        ? "Vous avez atteint votre quota de 3 générations IA ce mois-ci."
        : null

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title={
        <span className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-amber-500" />
          Passez à la vitesse supérieure
        </span>
      }
      description={reasonText ?? "Débloquez toutes les fonctionnalités Chalto."}
      contentClassName="sm:max-w-2xl"
    >
      <div className="grid sm:grid-cols-2 gap-4 pt-4 pb-2">
        {PLANS.map((plan) => (
          <div
            key={plan.key}
            className={cn(
              "rounded-xl border p-5 space-y-4 flex flex-col",
              plan.highlight ? "border-primary bg-primary/5 relative" : "border-border bg-muted/30"
            )}
          >
            {plan.highlight && (
              <span className="absolute -top-2.5 left-4 bg-primary text-primary-foreground text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full">
                Recommandé
              </span>
            )}

            <div>
              <p className="font-bold text-base">{plan.name}</p>
              <p className="text-muted-foreground text-xs mt-0.5">{plan.description}</p>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold">{plan.price}</span>
              <span className="text-sm text-muted-foreground">{plan.period}</span>
            </div>

            <ul className="space-y-2 flex-1">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <Check className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <Button
              className="w-full mt-2"
              variant={plan.highlight ? "default" : "outline"}
              disabled={loadingPlan !== null}
              onClick={() => handleUpgrade(plan.key)}
            >
              {loadingPlan === plan.key ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                `Choisir ${plan.name}`
              )}
            </Button>
          </div>
        ))}
      </div>

      <p className="text-center text-xs text-muted-foreground pt-2 pb-1">
        Paiement sécurisé par Stripe · Sans engagement · Annulable à tout moment
      </p>
    </ResponsiveDialog>
  )
}
