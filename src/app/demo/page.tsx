"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  CheckCircle,
  XCircle,
  FileText,
  Building2,
  Send,
  ArrowRight,
  Link2,
  HardHat,
  User,
} from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { cn } from "@/lib/utils"

type DemoStep = "architect" | "link-sent" | "client" | "client-done" | "architect-done"

const STEP_PHASES = [
  { label: "Vue architecte", steps: ["architect"] },
  { label: "Envoi", steps: ["link-sent"] },
  { label: "Vue client", steps: ["client", "client-done"] },
  { label: "Validé ✓", steps: ["architect-done"] },
] as const

function StepIndicator({ current }: { current: DemoStep }) {
  const currentPhase = STEP_PHASES.findIndex((p) =>
    (p.steps as readonly string[]).includes(current)
  )
  const currentLabel = STEP_PHASES[currentPhase].label

  return (
    <>
      {/* Mobile : barre de progression + label */}
      <div className="sm:hidden space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{currentLabel}</span>
          <span className="text-xs text-muted-foreground">
            {currentPhase + 1} / {STEP_PHASES.length}
          </span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={false}
            animate={{ width: `${((currentPhase + 1) / STEP_PHASES.length) * 100}%` }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          />
        </div>
      </div>

      {/* Desktop : stepper horizontal */}
      <div className="hidden sm:flex items-center justify-center gap-0">
        {STEP_PHASES.map((phase, i) => {
          const done = i < currentPhase
          const active = i === currentPhase

          return (
            <div key={phase.label} className="flex items-center">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300",
                    done
                      ? "bg-primary text-primary-foreground"
                      : active
                        ? "bg-primary/20 text-primary border-2 border-primary"
                        : "bg-muted text-muted-foreground"
                  )}
                >
                  {done ? <CheckCircle className="h-4 w-4" /> : i + 1}
                </div>
                <span
                  className={cn(
                    "text-xs whitespace-nowrap transition-colors",
                    active ? "text-foreground font-medium" : "text-muted-foreground"
                  )}
                >
                  {phase.label}
                </span>
              </div>
              {i < STEP_PHASES.length - 1 && (
                <div
                  className={cn(
                    "w-20 h-px mx-1 mb-5 transition-all duration-500",
                    i < currentPhase ? "bg-primary" : "bg-border"
                  )}
                />
              )}
            </div>
          )
        })}
      </div>
    </>
  )
}

function RoleBadge({ step }: { step: DemoStep }) {
  const isClient = step === "client" || step === "client-done"

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={isClient ? "client" : "architect"}
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 6 }}
        transition={{ duration: 0.25 }}
        className="flex justify-center"
      >
        <Badge
          variant="outline"
          className={cn(
            "gap-1.5 px-3 py-1 text-xs",
            isClient
              ? "border-emerald-500/50 text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/30"
              : "border-primary/40 text-primary bg-primary/5"
          )}
        >
          {isClient ? (
            <>
              <User className="h-3 w-3" />
              Vous êtes le client — Jean Dupont
            </>
          ) : (
            <>
              <HardHat className="h-3 w-3" />
              Vous êtes l&apos;architecte — A. Beaumont
            </>
          )}
        </Badge>
      </motion.div>
    </AnimatePresence>
  )
}

// ─── Vue architecte (étape 1) ──────────────────────────────────────────────

function ArchitectView({ onSend }: { onSend: () => void }) {
  const [sending, setSending] = useState(false)

  const handleSend = async () => {
    setSending(true)
    await new Promise((r) => setTimeout(r, 1000))
    onSend()
  }

  return (
    <div className="space-y-4">
      {/* Projet */}
      <Card>
        <CardHeader className="pb-3">
          <Badge variant="secondary" className="text-xs mb-2 sm:hidden w-fit">
            Conception
          </Badge>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-base">Villa Dupont — Rénovation complète</CardTitle>
              <CardDescription className="mt-0.5">Client : Jean Dupont</CardDescription>
            </div>
            <Badge variant="secondary" className="text-xs shrink-0 hidden sm:inline-flex">
              Conception
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Document */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Documents
          </p>
          <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
            <div className="bg-primary/10 p-2 rounded-lg shrink-0">
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">CCTP — Salle de bain principale</p>
              <p className="text-xs text-muted-foreground">V1 · 26 avr. 2026</p>
            </div>
            <Badge variant="outline" className="text-xs shrink-0">
              En attente
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Message pro */}
      <Card>
        <CardContent className="p-4 space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Message pour le client
          </p>
          <p className="text-sm text-muted-foreground italic leading-relaxed">
            &ldquo;Bonjour Jean, veuillez trouver ci-joint le CCTP de la salle de bain. Merci de
            valider ou de nous transmettre vos remarques.&rdquo;
          </p>
        </CardContent>
      </Card>

      <div className="fixed bottom-0 left-0 right-0 z-40 p-4 bg-background/95 backdrop-blur-sm border-t sm:static sm:p-0 sm:bg-transparent sm:backdrop-blur-none sm:border-0">
        <Button className="w-full" size="lg" onClick={handleSend} loading={sending}>
          <Send className="h-4 w-4 mr-2" />
          Envoyer pour validation
        </Button>
      </div>
    </div>
  )
}

// ─── Lien envoyé (étape 2) ─────────────────────────────────────────────────

function LinkSentView({ onNext }: { onNext: () => void }) {
  return (
    <div className="space-y-4">
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="p-6 flex flex-col items-center text-center gap-4">
          <div className="bg-primary/15 rounded-full p-3">
            <CheckCircle className="h-7 w-7 text-primary" />
          </div>
          <div>
            <p className="font-semibold">Lien envoyé à jean.dupont@email.fr</p>
            <p className="text-sm text-muted-foreground mt-1">
              Votre client peut valider sans créer de compte
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
            <Link2 className="h-3 w-3" />
            Lien de validation sécurisé
          </p>
          <code className="text-xs bg-muted rounded-md px-3 py-2 block text-muted-foreground font-mono truncate">
            chalto.fr/validate/a8f3c2d9e1b4…
          </code>
        </CardContent>
      </Card>

      <div className="fixed bottom-0 left-0 right-0 z-40 p-4 bg-background/95 backdrop-blur-sm border-t sm:static sm:p-0 sm:bg-transparent sm:backdrop-blur-none sm:border-0">
        <Button className="w-full" size="lg" onClick={onNext} variant="outline">
          Voir comme votre client
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}

// ─── Vue client (étape 3) ──────────────────────────────────────────────────

const CCTP_CONTENT = `CCTP — Salle de bain principale
Projet : Villa Dupont — Rénovation complète
Architecte : A. Beaumont · Version 1 · 26 avr. 2026
────────────────────────────────────────

LOT 1 — PLOMBERIE
1.1  Alimentation eau froide / eau chaude
     Fourniture et pose d'alimentations Ø16 apparent
     en tube multicouche, avec isolation.
1.2  Évacuations
     Ø40 lavabo, Ø90 douche, Ø32 machine à laver.

LOT 2 — CARRELAGE
2.1  Revêtement de sol
     Grès cérame 60×60 mat, pose croisée,
     joints 2 mm, ragréage autonivelant préalable.
2.2  Revêtement mural douche
     Faïence 30×60, colle flexible C2, joints étanches.

LOT 3 — MENUISERIES INTÉRIEURES
3.1  Porte salle de bain
     Bloc-porte 73×204 isoplane, huisserie réglable,
     finition blanc satiné RAL 9010.`

function ClientView({ onApprove, onReject }: { onApprove: () => void; onReject: () => void }) {
  const [comment, setComment] = useState("")
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null)

  const handleDecision = async (decision: "approve" | "reject") => {
    setLoading(decision)
    await new Promise((r) => setTimeout(r, 900))
    decision === "approve" ? onApprove() : onReject()
  }

  return (
    <div className="space-y-4">
      {/* Infos document */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="bg-muted p-2 rounded-lg">
              <FileText className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <CardTitle className="text-base">CCTP — Salle de bain principale</CardTitle>
              <CardDescription>Villa Dupont · CCTP</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Document soumis à votre validation
            </span>
            <Badge variant="outline">En attente</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Message du pro */}
      <Card>
        <CardContent className="p-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            Message de votre professionnel
          </p>
          <p className="text-sm leading-relaxed italic">
            &ldquo;Bonjour Jean, veuillez trouver ci-joint le CCTP de la salle de bain. Merci de
            valider ou de nous transmettre vos remarques.&rdquo;
          </p>
        </CardContent>
      </Card>

      {/* Aperçu document */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Document
          </p>
          <pre className="text-xs text-muted-foreground leading-relaxed font-mono bg-muted/40 rounded-lg p-4 overflow-x-auto whitespace-pre-wrap">
            {CCTP_CONTENT}
          </pre>
        </CardContent>
      </Card>

      {/* Commentaire */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Votre commentaire (optionnel)</CardTitle>
          <CardDescription>
            Laissez un message au professionnel avant de valider ou refuser
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Tout me semble correct… / Je souhaite modifier…"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
          />
        </CardContent>
      </Card>

      {/* Boutons */}
      <div className="fixed bottom-0 left-0 right-0 z-40 p-4 bg-background/95 backdrop-blur-sm border-t sm:static sm:p-0 sm:bg-transparent sm:backdrop-blur-none sm:border-0 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            size="lg"
            className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
            onClick={() => handleDecision("reject")}
            loading={loading === "reject"}
            disabled={loading === "approve"}
          >
            <XCircle className="h-4 w-4 mr-2" />
            Refuser
          </Button>
          <Button
            size="lg"
            onClick={() => handleDecision("approve")}
            loading={loading === "approve"}
            disabled={loading === "reject"}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Approuver
          </Button>
        </div>
        <p className="text-xs text-muted-foreground text-center">
          En approuvant ce document, vous confirmez en avoir pris connaissance et validez son
          contenu.
        </p>
      </div>
    </div>
  )
}

// ─── Vue client — confirmation (intermédiaire) ─────────────────────────────

function ClientDoneView({
  decision,
  onBack,
}: {
  decision: "approved" | "rejected"
  onBack: () => void
}) {
  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center gap-4">
          {decision === "approved" ? (
            <>
              <CheckCircle className="h-12 w-12 text-primary" />
              <div>
                <h2 className="text-xl font-bold">Document approuvé</h2>
                <p className="text-muted-foreground mt-1 text-sm">
                  Votre approbation a bien été enregistrée.
                </p>
              </div>
            </>
          ) : (
            <>
              <XCircle className="h-12 w-12 text-destructive" />
              <div>
                <h2 className="text-xl font-bold">Document refusé</h2>
                <p className="text-muted-foreground mt-1 text-sm">
                  Votre retour a bien été transmis au professionnel.
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <div className="fixed bottom-0 left-0 right-0 z-40 p-4 bg-background/95 backdrop-blur-sm border-t sm:static sm:p-0 sm:bg-transparent sm:backdrop-blur-none sm:border-0">
        <Button className="w-full" size="lg" variant="outline" onClick={onBack}>
          Voir la vue architecte
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}

// ─── Vue architecte — document validé (étape 4) ────────────────────────────

function ArchitectDoneView({ decision }: { decision: "approved" | "rejected" }) {
  const approved = decision === "approved"

  return (
    <div className="space-y-4">
      {/* Projet */}
      <Card>
        <CardHeader className="pb-3">
          <Badge variant="secondary" className="text-xs mb-2 sm:hidden w-fit">
            Conception
          </Badge>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-base">Villa Dupont — Rénovation complète</CardTitle>
              <CardDescription className="mt-0.5">Client : Jean Dupont</CardDescription>
            </div>
            <Badge variant="secondary" className="text-xs shrink-0 hidden sm:inline-flex">
              Conception
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Document validé */}
      <Card
        className={cn(
          approved ? "border-primary/40 bg-primary/5" : "border-destructive/30 bg-destructive/5"
        )}
      >
        <CardContent className="p-4 space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Documents
          </p>
          <div className="flex items-center gap-3 p-3 rounded-lg border bg-background">
            <div
              className={cn(
                "p-2 rounded-lg shrink-0",
                approved ? "bg-primary/10" : "bg-destructive/10"
              )}
            >
              <FileText className={cn("h-4 w-4", approved ? "text-primary" : "text-destructive")} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">CCTP — Salle de bain principale</p>
              <p className="text-xs text-muted-foreground">
                V1 · {approved ? "Validé" : "Refusé"} par Jean Dupont — 26 avr. 2026
              </p>
            </div>
            <Badge
              className={cn(
                "text-xs shrink-0",
                approved
                  ? "bg-primary/15 text-primary border-primary/30"
                  : "bg-destructive/15 text-destructive border-destructive/30"
              )}
              variant="outline"
            >
              {approved ? "✓ Validé" : "✗ Refusé"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Message de succès */}
      <Card className="border-dashed">
        <CardContent className="p-5 text-center space-y-1">
          <p className="font-semibold text-sm">
            {approved
              ? "Jean Dupont a validé en quelques secondes — sans créer de compte."
              : "Jean Dupont a refusé le document et son retour vous a été transmis."}
          </p>
          <p className="text-xs text-muted-foreground">C&apos;est ça, Chalto.</p>
        </CardContent>
      </Card>

      {/* CTA final */}
      <div className="fixed bottom-0 left-0 right-0 z-40 p-4 bg-background/95 backdrop-blur-sm border-t sm:static sm:p-0 sm:bg-transparent sm:backdrop-blur-none sm:border-0 space-y-2">
        <Button className="w-full" size="lg" asChild>
          <Link href="/#waitlist">
            Rejoindre la bêta gratuitement
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
        <p className="text-xs text-muted-foreground text-center">
          Accès bêta sur invitation · Gratuit · Sans engagement
        </p>
      </div>
    </div>
  )
}

// ─── Page principale ───────────────────────────────────────────────────────

export default function DemoPage() {
  const [step, setStep] = useState<DemoStep>("architect")
  const [decision, setDecision] = useState<"approved" | "rejected">("approved")

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/Logo.svg" alt="Chalto" width={24} height={24} />
            <span className="font-bold">Chalto</span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button size="sm" asChild variant="outline">
              <Link href="/">Retour</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-10 space-y-8 pb-28 sm:pb-10">
        {/* Titre */}
        <div className="text-center space-y-1">
          <h1 className="text-xl font-bold">Essayez Chalto en 30 secondes</h1>
          <p className="text-sm text-muted-foreground">
            Simulation complète du flux de validation client, sans créer de compte.
          </p>
        </div>

        {/* Indicateur d'étapes */}
        <StepIndicator current={step} />

        {/* Badge de rôle */}
        <RoleBadge step={step} />

        {/* Contenu principal */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.28, ease: [0.21, 0.47, 0.32, 0.98] }}
          >
            {step === "architect" && <ArchitectView onSend={() => setStep("link-sent")} />}
            {step === "link-sent" && <LinkSentView onNext={() => setStep("client")} />}
            {step === "client" && (
              <ClientView
                onApprove={() => {
                  setDecision("approved")
                  setStep("client-done")
                }}
                onReject={() => {
                  setDecision("rejected")
                  setStep("client-done")
                }}
              />
            )}
            {step === "client-done" && (
              <ClientDoneView decision={decision} onBack={() => setStep("architect-done")} />
            )}
            {step === "architect-done" && <ArchitectDoneView decision={decision} />}
          </motion.div>
        </AnimatePresence>

        {/* Recommencer */}
        {step !== "architect" && (
          <div className="text-center mb-6 sm:mb-0">
            <button
              onClick={() => setStep("architect")}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
            >
              Recommencer la démo
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
