"use client"

import { useState } from "react"
import { Mail, ChevronDown, LifeBuoy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { FadeIn } from "@/components/ui/motion"
import { AnimatePresence, motion } from "framer-motion"
import { cn } from "@/lib/utils"

const SUPPORT_EMAIL = "marc@chalto.fr"

const FAQ: { question: string; answer: string }[] = [
  {
    question: "Comment inviter un prestataire sur un projet ?",
    answer:
      "Depuis la fiche projet, rendez-vous dans la section « Prestataires » et cliquez sur « Inviter ». Sélectionnez un contact de votre annuaire (ou créez-en un) puis envoyez l'invitation. Votre prestataire reçoit un lien sécurisé vers son espace de collaboration — sans création de compte.",
  },
  {
    question: "Comment envoyer un document à mon client pour validation ?",
    answer:
      "Depuis la fiche projet, ouvrez le document concerné et cliquez sur « Envoyer ». Choisissez « Pour validation » ou « Pour information », ajoutez un message facultatif, puis confirmez. Votre client reçoit un email avec un lien sécurisé pour approuver ou refuser le document.",
  },
  {
    question: "Mon client n'a pas reçu le lien de validation — que faire ?",
    answer:
      "Vérifiez d'abord l'adresse email renseignée dans les détails du projet. Si elle est correcte, vous pouvez renvoyer le document en cliquant à nouveau sur « Envoyer » depuis la fiche document. Si le problème persiste, contactez-nous à " +
      SUPPORT_EMAIL +
      ".",
  },
  {
    question: "Comment générer un CCTP avec l'IA ?",
    answer:
      "Depuis la section « Documents » d'un projet, cliquez sur « Générer IA ». Remplissez les informations demandées (type de travaux, surface, matériaux…) et lancez la génération. Le CCTP est créé en quelques secondes et peut être téléchargé ou envoyé directement.",
  },
  {
    question: "Comment changer la phase de mon projet ?",
    answer:
      "Sur la fiche projet, le stepper de phase est visible en haut. Cliquez sur « Passer à : [phase suivante] » pour faire avancer le projet. Chaque phase débloque des fonctionnalités spécifiques (ex. : partage prestataire disponible dès la phase Chantier).",
  },
  {
    question: "Comment modifier ou supprimer mon compte ?",
    answer:
      "Vos informations personnelles (nom, email, logo) sont modifiables depuis « Paramètres ». Pour supprimer votre compte, contactez-nous directement à " +
      SUPPORT_EMAIL +
      " — nous traiterons votre demande sous 48h.",
  },
]

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border-b last:border-b-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-4 py-4 text-left text-sm font-medium hover:text-foreground text-foreground/90 transition-colors"
      >
        <span>{question}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            style={{ overflow: "hidden" }}
          >
            <p className="pb-4 text-sm text-muted-foreground leading-relaxed">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function SupportPage() {
  return (
    <div className="flex-1 overflow-auto">
      <div className="p-6 md:p-8 max-w-2xl space-y-8">
        <FadeIn>
          <div className="flex items-center gap-3">
            <LifeBuoy className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Support</h1>
              <p className="text-muted-foreground text-sm">Nous sommes là pour vous aider</p>
            </div>
          </div>
        </FadeIn>

        {/* Contact */}
        <FadeIn>
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="font-semibold">Une question ? Une difficulté ?</p>
                <p className="text-sm text-muted-foreground">
                  Notre équipe vous répond en moins de 24h, du lundi au vendredi.
                </p>
              </div>
              <Button asChild className="shrink-0">
                <a href={`mailto:${SUPPORT_EMAIL}`}>
                  <Mail className="h-4 w-4 mr-2" />
                  Envoyer un email
                </a>
              </Button>
            </CardContent>
          </Card>
        </FadeIn>

        {/* FAQ */}
        <FadeIn>
          <div className="space-y-1">
            <h2 className="text-base font-semibold">Questions fréquentes</h2>
            <p className="text-sm text-muted-foreground">
              Les réponses aux situations les plus courantes.
            </p>
          </div>
          <Separator className="mt-3" />
          <div className="divide-y-0">
            {FAQ.map((item) => (
              <FaqItem key={item.question} question={item.question} answer={item.answer} />
            ))}
          </div>
        </FadeIn>

        {/* Footer */}
        <FadeIn>
          <p className="text-sm text-muted-foreground text-center border-t pt-6">
            Vous ne trouvez pas la réponse ?{" "}
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="text-primary underline-offset-4 hover:underline font-medium"
            >
              Écrivez-nous directement
            </a>
          </p>
        </FadeIn>
      </div>
    </div>
  )
}
