"use client"

import { ArrowRight } from "lucide-react"
import { motion } from "framer-motion"

const blocks = [
  {
    title: "Validation documentaire",
    before: "Mail, relance, validation orale, rien tracé.",
    after: "Soumission Chalto, notification client, validation 1 clic, statut horodaté immuable.",
    stat: "30 secondes. Contre 3 jours en moyenne.",
  },
  {
    title: "Suivi prestataires",
    before: "WhatsApp, post-it, rien formalisé.",
    after: "Déclaration avancement, validation architecte, PDF auto, prestataire peut facturer.",
    stat: "Zéro WhatsApp. Zéro post-it. Tout tracé.",
  },
  {
    title: "Échéances",
    before: "Date noyée dans les mails, oubliée, ratée.",
    after: "Alertes J-30 J-15 J-7 J-1, tableau de bord multi-projets.",
    stat: "Plus jamais un PC raté.",
  },
]

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.2,
    },
  },
}

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
}

export function LandingSolutionSection() {
  return (
    <section className="py-20 px-6 md:px-4 bg-[#fdfcf9] dark:bg-background">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Avec Chalto, ça change quoi concrètement&nbsp;?
          </h2>
          <p className="mt-3 text-base text-muted-foreground">
            Trois flux que vous vivez chaque semaine — avant et après.
          </p>
        </div>

        {/* Blocks */}
        <motion.div
          className="flex flex-col"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
        >
          {blocks.map((block, i) => (
            <motion.div key={block.title} variants={item}>
              <div className="py-10">
                {/* Title */}
                <p className="text-xs font-semibold uppercase tracking-widest mb-5 text-muted-foreground">
                  {block.title}
                </p>

                {/* Before / After grid */}
                <div className="grid grid-cols-1 md:grid-cols-[1fr_40px_1fr] items-center gap-3 mb-6">
                  {/* AVANT */}
                  <div className="rounded-xl p-5 bg-[#f4f4f2] dark:bg-muted">
                    <span className="text-xs font-semibold uppercase tracking-widest text-red-600 dark:text-red-400">
                      Avant
                    </span>
                    <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                      {block.before}
                    </p>
                  </div>

                  {/* Arrow */}
                  <div className="hidden md:flex items-center justify-center">
                    <motion.div
                      initial={{ x: -4, opacity: 0.4 }}
                      whileInView={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.4, ease: "easeOut", delay: 0.3 }}
                      viewport={{ once: true }}
                    >
                      <ArrowRight className="w-5 h-5 text-muted-foreground/50" />
                    </motion.div>
                  </div>

                  {/* APRÈS */}
                  <div className="rounded-xl p-5 bg-[#e8f5ee] dark:bg-emerald-950/40">
                    <span className="text-xs font-semibold uppercase tracking-widest text-[#2d6a4f] dark:text-emerald-400">
                      Après
                    </span>
                    <p className="mt-3 text-base leading-relaxed text-foreground">{block.after}</p>
                  </div>
                </div>

                {/* Stat */}
                <p className="text-base md:text-lg font-bold text-[#2d6a4f] dark:text-emerald-400">
                  → {block.stat}
                </p>
              </div>

              {/* Separator */}
              {i < blocks.length - 1 && <div className="border-t border-border" />}
            </motion.div>
          ))}
        </motion.div>

        {/* Final phrase */}
        <p className="text-center text-base mt-14 leading-relaxed text-muted-foreground">
          Ce ne sont pas des fonctionnalités.{" "}
          <span className="font-semibold text-foreground">
            Ce sont des problèmes réels que Chalto résout.
          </span>
        </p>
      </div>
    </section>
  )
}
