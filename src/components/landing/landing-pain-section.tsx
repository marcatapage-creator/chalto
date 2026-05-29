"use client"

import { motion } from "framer-motion"
import { MessagesSquare, Clock, PenLine, CalendarX } from "lucide-react"

const pains = [
  {
    Icon: MessagesSquare,
    title: "Échanges dispersés",
    before:
      '"Les retours client sont sur WhatsApp, les documents sur email, les validations par SMS. Impossible de retrouver quoi que ce soit."',
    after: "Chalto centralise tout en un fil intelligent, résumé et priorisé automatiquement.",
  },
  {
    Icon: Clock,
    title: "Validations sans fin",
    before:
      "\"J'ai envoyé le plan il y a 10 jours. Le client n'a pas répondu. Je dois relancer — mais je n'ose pas.\"",
    after: "Chalto envoie les relances automatiquement, au bon moment, avec le bon ton.",
  },
  {
    Icon: PenLine,
    title: "Rédaction chronophage",
    before:
      "\"Le compte-rendu de la réunion de chantier d'hier — j'ai mis 2h à l'écrire. 2h que j'aurais pu passer à concevoir.\"",
    after: "L'IA de Chalto génère le document en 30 secondes. Vous relisez, vous envoyez.",
  },
  {
    Icon: CalendarX,
    title: "Rien ne se perd… mais tout se perd",
    before:
      '"La date de dépôt du permis était dans un mail de la mairie, noyé dans 200 autres. Je l\'ai ratée."',
    after: "Chalto alerte avant chaque échéance critique. J-30, J-15, J-7, J-1.",
  },
]

export function LandingPainSection() {
  return (
    <section className="py-24 px-6 md:px-4 bg-primary dark:bg-muted/40 text-primary-foreground dark:text-foreground">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="mb-14"
        >
          <p className="text-xs font-semibold tracking-widest uppercase text-primary-foreground/50 dark:text-muted-foreground mb-4">
            Le problème
          </p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Ce que vous vivez
            <br />
            chaque semaine
          </h2>
          <p className="text-primary-foreground/70 dark:text-muted-foreground max-w-lg text-lg font-light leading-relaxed">
            Les architectes et artisans perdent en moyenne 6h par semaine en gestion administrative.
            Chalto vous les rend.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pains.map(({ Icon, title, before, after }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.35, delay: i * 0.05, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="bg-[hsl(224_79%_42%)] dark:bg-card rounded-2xl p-8 flex flex-col gap-5"
            >
              <div className="w-10 h-10 rounded-lg bg-white/10 dark:bg-primary/10 flex items-center justify-center shrink-0">
                <Icon className="h-5 w-5 text-primary-foreground/80 dark:text-primary" />
              </div>
              <p className="font-semibold text-lg text-primary-foreground dark:text-foreground">
                {title}
              </p>
              <p className="text-primary-foreground/55 dark:text-muted-foreground italic text-sm leading-relaxed border-l-2 border-white/15 dark:border-border pl-4">
                {before}
              </p>
              <div className="flex gap-3 text-sm leading-relaxed text-primary-foreground/85 dark:text-foreground">
                <span className="text-green-300 dark:text-primary shrink-0 mt-0.5">✓</span>
                <span>{after}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
