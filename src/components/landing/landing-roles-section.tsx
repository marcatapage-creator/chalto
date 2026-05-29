"use client"

import { motion } from "framer-motion"
import { Compass, HardHat, UserCheck } from "lucide-react"

const roles = [
  {
    Icon: Compass,
    title: "Architecte / Archi d'intérieur",
    sub: "Solo ou en petite agence, vous gérez de 5 à 15 projets en parallèle. Chalto devient votre bureau intelligent.",
    items: [
      "Validation plans et documents en 1 clic",
      "CCTP et CR de chantier générés par IA",
      "Suivi permis et échéances administratives",
      "Coordination prestataires sans friction",
    ],
  },
  {
    Icon: HardHat,
    title: "Artisan BTP",
    sub: "Menuisier, plombier, électricien — vous êtes sur le terrain, pas derrière un bureau. Chalto gère l'admin à votre place.",
    items: [
      "Documents rédigés automatiquement",
      "Relances clients sans gêne",
      "Suivi des chantiers en cours",
      "Interface mobile pensée pour le terrain",
    ],
  },
  {
    Icon: UserCheck,
    title: "Client / Maître d'ouvrage",
    sub: "Vous suivez votre chantier sans avoir besoin de créer un compte. Tout est accessible, clair, en temps réel.",
    items: [
      "Accès sécurisé par lien email",
      "Validation documents en 1 clic",
      "Vision globale de l'avancement",
      "Discussion directe avec l'équipe",
    ],
  },
]

export function LandingRolesSection() {
  return (
    <section
      id="metiers"
      className="py-24 px-6 md:px-4 bg-primary dark:bg-muted/40 text-primary-foreground dark:text-foreground"
    >
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="mb-14"
        >
          <p className="text-xs font-semibold tracking-widest uppercase text-primary-foreground/50 dark:text-muted-foreground mb-4">
            Conçu pour vous
          </p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Un outil qui parle
            <br />
            votre langue
          </h2>
          <p className="text-primary-foreground/70 dark:text-muted-foreground max-w-lg text-lg font-light leading-relaxed">
            Architecte solo, agence ou artisan — Chalto s&apos;adapte à votre rôle et à votre façon
            de travailler.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {roles.map(({ Icon, title, sub, items }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.35, delay: i * 0.06, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="bg-[hsl(224_79%_42%)] dark:bg-card rounded-2xl p-8 flex flex-col gap-5"
            >
              <div className="w-10 h-10 rounded-lg bg-white/10 dark:bg-primary/10 flex items-center justify-center shrink-0">
                <Icon className="h-5 w-5 text-primary-foreground/80 dark:text-primary" />
              </div>
              <div>
                <p className="font-semibold text-lg text-primary-foreground dark:text-foreground mb-2">
                  {title}
                </p>
                <p className="text-sm text-primary-foreground/60 dark:text-muted-foreground leading-relaxed">
                  {sub}
                </p>
              </div>
              <ul className="flex flex-col gap-3">
                {items.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2.5 text-sm text-primary-foreground/80 dark:text-muted-foreground leading-relaxed"
                  >
                    <span className="text-green-300 dark:text-primary shrink-0 mt-0.5">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
