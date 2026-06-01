"use client"

import { motion } from "framer-motion"

const STATS = [
  {
    value: "+6h",
    label: "gagnées par semaine",
    sub: "en moyenne par projet",
  },
  {
    value: "30s",
    label: "pour générer un document IA",
    sub: "CCTP, compte-rendu, descriptif",
  },
  {
    value: "0 compte",
    label: "requis pour vos clients",
    sub: "validation par lien sécurisé",
  },
  {
    value: "100%",
    label: "hébergé en Europe",
    sub: "données sécurisées, RGPD",
  },
]

export function LandingStatsSection() {
  return (
    <section className="bg-muted/30 border-y">
      <div className="max-w-5xl mx-auto px-6 md:px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border rounded-xl overflow-hidden shadow-sm shadow-black/8">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              className="bg-background flex flex-col items-center text-center px-6 py-8 gap-1"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="text-3xl md:text-4xl font-bold text-primary tracking-tight">
                {stat.value}
              </span>
              <span className="text-sm font-medium text-foreground leading-snug">{stat.label}</span>
              <span className="text-xs text-muted-foreground leading-snug">{stat.sub}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
