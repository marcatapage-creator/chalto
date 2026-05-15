"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { Check } from "lucide-react"

const items = [
  {
    label: "Les phases loi MOP",
    tags: ["ESQ", "APS", "APD", "PC", "DCE", "EXE", "OPR"],
  },
  {
    label: "Les documents métier",
    tags: ["CCTP", "DPGF", "Notice descriptive", "Plan masse", "Compte-rendu", "PV de réception"],
  },
  {
    label: "Les acteurs du projet",
    tags: ["Maître d'ouvrage", "Maître d'œuvre", "BET", "Géomètre", "Entreprises", "Prestataires"],
  },
  {
    label: "Les procédures administratives",
    tags: ["Permis de construire", "Déclaration préalable", "DOC", "DAACT", "Autorisation ERP"],
  },
  {
    label: "Les échéances critiques",
    tags: ["Alertes J-30", "J-15", "J-7", "J-1"],
  },
]

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
}

const item = {
  hidden: { opacity: 0, x: -16 },
  show: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
}

export function LandingArchitectSection() {
  return (
    <section className="py-20 px-6 md:px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold tracking-tight">Un outil qui parle votre langue</h2>
          <p className="text-muted-foreground mt-2">
            Phases, vocabulaire, types de documents — tout correspond à votre réalité terrain.
          </p>
        </div>

        {/* 2-col layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left — checklist */}
          <motion.div
            className="flex flex-col gap-8"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
          >
            {items.map((it) => (
              <motion.div key={it.label} variants={item} className="flex gap-4">
                {/* Check icon */}
                <div className="mt-0.5 shrink-0 w-5 h-5 rounded-full bg-emerald-500/15 flex items-center justify-center">
                  <Check
                    className="w-3 h-3 text-emerald-600 dark:text-emerald-400"
                    strokeWidth={3}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <p className="text-sm font-semibold text-foreground">{it.label}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {it.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-md"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Right — preview */}
          <div className="flex justify-center md:justify-end">
            <div
              className="relative rounded-[20px] overflow-hidden border border-border shadow-xl"
              style={{ width: 300 }}
            >
              <Image
                src="/screenshots/architecte.png"
                alt="Fiche projet Chalto"
                width={300}
                height={640}
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>

        {/* Closing phrase */}
        <p className="text-center text-sm text-muted-foreground mt-16 max-w-xl mx-auto leading-relaxed">
          Chalto n&apos;est pas un outil de gestion de projet générique.{" "}
          <span className="font-semibold text-foreground">
            C&apos;est un outil pensé avec des architectes, pour des architectes.
          </span>
        </p>
      </div>
    </section>
  )
}
