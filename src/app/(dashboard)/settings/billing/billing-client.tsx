"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { UpgradeModal } from "@/components/dashboard/upgrade-modal"
import { PLAN_LABEL, PLAN_LIMITS, type Plan } from "@/types/index"
import { Check, Zap, RefreshCw, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface BillingClientProps {
  plan: string
  renewalDate: string | null
  subscriptionStatus: string | null
  hasStripeCustomer: boolean
  successPlan: string | null
  canceled: boolean
}

export function BillingClient({
  plan,
  renewalDate,
  subscriptionStatus,
  hasStripeCustomer,
  successPlan,
  canceled,
}: BillingClientProps) {
  const [upgradeOpen, setUpgradeOpen] = useState(false)
  const [portalLoading, setPortalLoading] = useState(false)

  const isPaid = plan !== "free"
  const planLabel = PLAN_LABEL[plan as Plan] ?? plan
  const limits = PLAN_LIMITS[plan as Plan] ?? PLAN_LIMITS["free"]

  const handlePortal = async () => {
    setPortalLoading(true)
    const res = await fetch("/api/stripe/portal", { method: "POST" })
    const { url, error } = await res.json()
    if (url) {
      window.location.href = url
    } else {
      console.error("Portal error:", error)
      setPortalLoading(false)
    }
  }

  return (
    <motion.div
      className="flex-1 overflow-auto"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="p-6 md:p-8 max-w-2xl space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/settings">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Abonnement</h1>
            <p className="text-muted-foreground text-sm">Gérez votre offre Chalto</p>
          </div>
        </div>

        {/* Bannière succès */}
        {successPlan && (
          <div className="rounded-lg border border-green-400/60 bg-green-50/60 dark:bg-green-950/30 px-4 py-3 text-sm text-green-800 dark:text-green-300 flex items-center gap-2">
            <Check className="h-4 w-4 shrink-0" />
            Bienvenue sur l&apos;offre{" "}
            <strong>{PLAN_LABEL[successPlan as Plan] ?? successPlan}</strong> ! Votre compte a été
            mis à jour.
          </div>
        )}

        {/* Bannière annulation */}
        {canceled && (
          <div className="rounded-lg border border-amber-400/60 bg-amber-50/60 dark:bg-amber-950/30 px-4 py-3 text-sm text-amber-800 dark:text-amber-300">
            Le paiement a été annulé. Votre offre gratuite reste active.
          </div>
        )}

        {/* Plan actuel */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Offre actuelle</CardTitle>
              <Badge variant={isPaid ? "default" : "secondary"}>{planLabel}</Badge>
            </div>
            {renewalDate && (
              <CardDescription>
                Prochain renouvellement : {renewalDate}
                {subscriptionStatus === "trialing" && " (période d'essai)"}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm">
                <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                {limits.maxActiveProjects === Infinity
                  ? "Projets actifs illimités"
                  : `${limits.maxActiveProjects} projet actif`}
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                {limits.maxAiDocsPerMonth === Infinity
                  ? "Génération IA illimitée"
                  : `${limits.maxAiDocsPerMonth} générations IA / mois`}
              </li>
            </ul>

            <div className={cn("flex gap-3", isPaid ? "flex-col sm:flex-row" : "")}>
              {!isPaid && (
                <Button className="gap-2" onClick={() => setUpgradeOpen(true)}>
                  <Zap className="h-4 w-4" />
                  Passer à Solo — 29€/mois
                </Button>
              )}
              {isPaid && hasStripeCustomer && (
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={handlePortal}
                  disabled={portalLoading}
                >
                  <RefreshCw className={cn("h-4 w-4", portalLoading && "animate-spin")} />
                  Gérer mon abonnement
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Récap des offres pour les users free */}
        {!isPaid && (
          <Card className="border-dashed">
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">
                Pourquoi passer à Solo ?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {[
                  "Projets actifs illimités",
                  "IA illimitée — CCTP, CR chantier, relances",
                  "Validations automatiques",
                  "Dossiers administratifs + alertes",
                  "Support 5j/7",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>

      <UpgradeModal open={upgradeOpen} onOpenChange={setUpgradeOpen} />
    </motion.div>
  )
}
