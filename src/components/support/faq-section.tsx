"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
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
    question: "Chalto est-il adapté aux architectes d'intérieur ?",
    answer:
      "Oui — Chalto est conçu pour les architectes d'intérieur autant que pour les architectes DPLG. Lors de l'inscription, sélectionnez le profil « Architecte d'intérieur » pour obtenir des types de travaux adaptés (aménagement, rénovation intérieure, design…) et un CCTP pré-configuré pour vos projets. Vous pouvez aussi combiner plusieurs profils si vous intervenez sur les deux domaines.",
  },
  {
    question: "Comment générer un CCTP pour un projet d'aménagement intérieur ?",
    answer:
      "Depuis la section « Documents » d'un projet, cliquez sur « Générer IA ». Renseignez le type de travaux (ex. : Rénovation intérieure, Aménagement), la surface, les matériaux envisagés et toute contrainte particulière. Le CCTP généré prend en compte les spécificités de l'aménagement intérieur : cloisonnement, revêtements, fluides, mobilier sur mesure, etc.",
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

export function FaqSection() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-1 mb-4">
          <h2 className="text-base font-semibold">Questions fréquentes</h2>
          <p className="text-sm text-muted-foreground">
            Les réponses aux situations les plus courantes.
          </p>
        </div>
        <div>
          {FAQ.map((item) => (
            <FaqItem key={item.question} question={item.question} answer={item.answer} />
          ))}
        </div>
        <Separator className="mt-2 mb-4" />
        <p className="text-sm text-muted-foreground text-center">
          Vous ne trouvez pas la réponse ?{" "}
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="text-primary underline-offset-4 hover:underline font-medium"
          >
            Écrivez-nous directement
          </a>
        </p>
      </CardContent>
    </Card>
  )
}
