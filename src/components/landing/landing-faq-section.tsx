"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown } from "lucide-react"

const faqs = [
  {
    question: "Est-ce vraiment gratuit ?",
    answer:
      "Oui. Pendant toute la phase bêta, l'accès est entièrement gratuit. Sans carte bancaire, sans engagement, sans période d'essai limitée. Vous accédez à toutes les fonctionnalités dès le premier jour.",
  },
  {
    question: "Mon client doit créer un compte ?",
    answer:
      "Non. C'est l'un des principes fondamentaux de Chalto. Votre client reçoit un lien sécurisé par email. Il clique, il valide — sans inscription, sans mot de passe, sans télécharger une app. Zéro friction de son côté.",
  },
  {
    question: "Mes prestataires doivent s'inscrire ?",
    answer:
      "Non plus. Vos prestataires reçoivent un lien d'accès à leur espace dédié. Ils voient leurs tâches, déclarent leur avancement, déposent leurs livrables — sans compte Chalto. S'ils travaillent avec plusieurs architectes, ils peuvent créer un compte gratuitement pour tout centraliser.",
  },
  {
    question: "Mes données sont sécurisées ?",
    answer:
      "Oui. Chalto est hébergé sur infrastructure européenne (Supabase — Dublin). Vos documents sont chiffrés en transit et au repos. Chaque utilisateur ne voit que les données qui le concernent — grâce à un système de permissions strict. Vos données ne sont jamais revendues ni partagées.",
  },
  {
    question: "Je peux arrêter quand je veux ?",
    answer:
      "Oui. Aucun engagement, aucune période minimale. Si Chalto ne vous convient pas, vous partez. Et vous emportez vos données — export complet disponible à tout moment.",
  },
  {
    question: "Ça remplace mes outils actuels ?",
    answer:
      "Non — et ce n'est pas l'objectif. Chalto se glisse dans votre écosystème existant. Vous continuez avec AutoCAD, Dropbox, votre app de facturation. Chalto connecte ces outils et centralise ce qu'aucun d'eux ne fait : la collaboration avec vos clients et prestataires, et la traçabilité des décisions.",
  },
  {
    question: "C'est adapté à mon type de projets ?",
    answer:
      "Chalto s'adapte à votre métier — pas l'inverse. Que vous fassiez de la maison individuelle, du tertiaire, de la rénovation ou de l'architecture d'intérieur, les phases, le vocabulaire et les types de documents s'ajustent automatiquement à votre réalité.",
  },
  {
    question: "Comment se passe l'onboarding ?",
    answer:
      "Simple et rapide. Après votre inscription, Marc vous contacte personnellement dans les 24h. Ensemble vous configurez votre premier projet en 20 minutes. Vous n'êtes pas livré à vous-même — on vous accompagne jusqu'à ce que Chalto soit opérationnel sur un vrai projet.",
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
