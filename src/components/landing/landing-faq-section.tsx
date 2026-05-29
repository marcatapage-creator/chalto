"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown } from "lucide-react"

const faqs = [
  {
    question: "Quelle est la différence entre Starter et Solo ?",
    answer:
      "Le plan Starter est gratuit et vous permet de tester Chalto avec 1 projet actif et 3 documents générés par IA par mois — sans carte bancaire. Le plan Solo à 29€/mois lève toutes les limites : projets illimités, IA illimitée, validations automatiques, alertes administratives et export DOCX. Les 14 premiers jours du plan Solo sont offerts.",
  },
  {
    question: "Mon client doit créer un compte ?",
    answer:
      "Non. C'est l'un des principes fondamentaux de Chalto. Votre client reçoit un lien sécurisé par email. Il clique, il valide — sans inscription, sans mot de passe, sans télécharger une app. Zéro friction de son côté.",
  },
  {
    question: "Mes prestataires doivent s'inscrire ?",
    answer:
      "Non plus. Vos prestataires reçoivent un lien d'accès à leur espace dédié. Ils voient leurs tâches, déclarent leur avancement, déposent leurs livrables — sans compte Chalto. S'ils travaillent avec plusieurs maîtres d'œuvre, ils peuvent créer un compte gratuitement pour tout centraliser.",
  },
  {
    question: "Les documents générés par l'IA sont-ils exploitables directement ?",
    answer:
      "Dans la grande majorité des cas, oui. L'IA génère à partir des informations réelles de votre projet : programme, phases, intervenants, contraintes. Le résultat est un document structuré que vous relisez et ajustez en quelques minutes — pas from scratch. Les CCTP et comptes-rendus de chantier sont les plus efficaces.",
  },
  {
    question: "Mes données sont sécurisées ?",
    answer:
      "Oui. Chalto est hébergé sur infrastructure européenne (Dublin). Vos documents sont chiffrés en transit et au repos. Chaque utilisateur ne voit que les données qui le concernent grâce à un système de permissions strict (Row Level Security). Vos données ne sont jamais revendues ni utilisées pour entraîner des modèles.",
  },
  {
    question: "Je peux arrêter quand je veux ?",
    answer:
      "Oui. Aucun engagement, aucune période minimale. Annulation en un clic depuis votre compte. Et vous emportez vos données — export complet disponible à tout moment, au format standard.",
  },
  {
    question: "Ça remplace mes outils actuels ?",
    answer:
      "Non — et ce n'est pas l'objectif. Vous continuez avec AutoCAD, Dropbox, votre logiciel de facturation. Chalto se positionne sur ce qu'aucun de ces outils ne fait : la collaboration structurée avec vos clients et prestataires, la génération de documents et la traçabilité des décisions.",
  },
  {
    question: "Comment se passe la prise en main ?",
    answer:
      "L'onboarding prend moins de 5 minutes. Vous créez votre premier projet, invitez un client ou un prestataire, et générez un premier document. Tout est guidé. Si vous avez une question, l'équipe est joignable par email à marc@chalto.fr — réponse sous 24h.",
  },
]

export function LandingFaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section id="faq" className="py-20 px-6 md:px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight">Questions fréquentes</h2>
        </div>
        <div className="flex flex-col divide-y divide-border border rounded-xl overflow-hidden">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i
            return (
              <div key={faq.question}>
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-muted/40 transition-colors"
                  aria-expanded={isOpen}
                >
                  <span className="text-sm font-semibold text-foreground">{faq.question}</span>
                  <motion.span
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="shrink-0 text-muted-foreground"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
