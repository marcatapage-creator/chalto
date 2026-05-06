"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence, useInView } from "framer-motion"
import { FileText } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const PROFESSION_SHOWCASE = [
  {
    slug: "architecte",
    label: "Architecte",
    emoji: "🏛️",
    projectName: "Villa Les Pins — M. Bernard",
    phases: [
      { label: "Cadrage", done: true, active: false },
      { label: "Conception", done: true, active: false },
      { label: "Validation", done: false, active: true },
      { label: "Chantier", done: false, active: false },
      { label: "Réception", done: false, active: false },
      { label: "Clôturé", done: false, active: false },
    ],
    workTypes: ["Rénovation complète", "Extension"],
    docName: "CCTP Lot Gros Œuvre",
    docApproved: false,
  },
  {
    slug: "architecte_int",
    label: "Archi d'intérieur",
    emoji: "🎨",
    projectName: "Appt Haussmannien — Mme Leroy",
    phases: [
      { label: "Brief", done: true, active: false },
      { label: "Conception", done: true, active: false },
      { label: "Validation", done: true, active: false },
      { label: "Réalisation", done: false, active: true },
      { label: "Livraison", done: false, active: false },
      { label: "Clôturé", done: false, active: false },
    ],
    workTypes: ["Design d'intérieur", "Home staging"],
    docName: "Notice descriptive",
    docApproved: true,
  },
  {
    slug: "plombier",
    label: "Plombier",
    emoji: "🔧",
    projectName: "Salle de bain — M. Dubois",
    phases: [
      { label: "Diagnostic", done: true, active: false },
      { label: "Étude", done: true, active: false },
      { label: "Devis validé", done: false, active: true },
      { label: "Chantier", done: false, active: false },
      { label: "Mise en svce", done: false, active: false },
      { label: "Clôturé", done: false, active: false },
    ],
    workTypes: ["Rénovation salle de bain", "Chauffage"],
    docName: "Devis sanitaires",
    docApproved: false,
  },
  {
    slug: "electricien",
    label: "Électricien",
    emoji: "⚡",
    projectName: "Mise aux normes — Mme Garcia",
    phases: [
      { label: "Diagnostic", done: true, active: false },
      { label: "Étude", done: true, active: false },
      { label: "Devis validé", done: true, active: false },
      { label: "Chantier", done: false, active: true },
      { label: "Mise en svce", done: false, active: false },
      { label: "Clôturé", done: false, active: false },
    ],
    workTypes: ["Mise aux normes", "Domotique"],
    docName: "Rapport électrique",
    docApproved: false,
  },
  {
    slug: "menuisier",
    label: "Menuisier",
    emoji: "🪵",
    projectName: "Cuisine sur mesure — M. Moreau",
    phases: [
      { label: "Cadrage", done: true, active: false },
      { label: "Plans", done: true, active: false },
      { label: "Validation", done: true, active: false },
      { label: "Fabrication", done: false, active: true },
      { label: "Réception", done: false, active: false },
      { label: "Clôturé", done: false, active: false },
    ],
    workTypes: ["Cuisine sur mesure", "Dressing"],
    docName: "Plans d'exécution",
    docApproved: true,
  },
]

function AnimateIn({
  children,
  delay = 0,
  direction = "up",
}: {
  children: React.ReactNode
  delay?: number
  direction?: "up" | "left" | "right"
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })

  const variants = {
    hidden: {
      opacity: 0,
      y: direction === "up" ? 30 : 0,
      x: direction === "left" ? -30 : direction === "right" ? 30 : 0,
    },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      transition: {
        duration: 0.6,
        delay,
        ease: [0.21, 0.47, 0.32, 0.98] as [number, number, number, number],
      },
    },
  }

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={variants}
    >
      {children}
    </motion.div>
  )
}

export function LandingProfessionSection() {
  const [idx, setIdx] = useState(0)
  const [paused, setPaused] = useState(false)
  const sectionRef = useRef(null)
  const inView = useInView(sectionRef, { once: true, margin: "-80px" })

  useEffect(() => {
    if (paused || !inView) return
    const t = setInterval(() => setIdx((i) => (i + 1) % PROFESSION_SHOWCASE.length), 5600)
    return () => clearInterval(t)
  }, [paused, inView])

  const prof = PROFESSION_SHOWCASE[idx]

  return (
    <section ref={sectionRef} className="py-20 px-6 md:px-4">
      <div className="max-w-3xl mx-auto">
        <AnimateIn>
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold tracking-tight">Un outil qui parle votre langue</h2>
            <p className="text-muted-foreground mt-2 max-w-md mx-auto">
              Phases, vocabulaire, types de travaux — tout s&apos;adapte automatiquement à votre
              métier.
            </p>
          </div>
        </AnimateIn>

        {/* Pills */}
        <AnimateIn delay={0.1}>
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {PROFESSION_SHOWCASE.map((p, i) => (
              <button
                key={p.slug}
                onClick={() => {
                  setIdx(i)
                  setPaused(true)
                }}
                className={cn(
                  "inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                  idx === i
                    ? "bg-primary text-primary-foreground shadow-sm scale-[1.03]"
                    : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                )}
              >
                <span>{p.emoji}</span>
                {p.label}
              </button>
            ))}
          </div>
        </AnimateIn>

        {/* Card */}
        <AnimateIn delay={0.15}>
          <div className="relative">
            {/* Auto-cycle progress bar */}
            {!paused && inView && (
              <motion.div
                key={`bar-${idx}`}
                className="absolute -top-px left-0 h-0.5 bg-primary/50 rounded-full z-10"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 5.6, ease: "linear" }}
              />
            )}

            <AnimatePresence mode="wait">
              <motion.div
                key={idx}
                initial={{ opacity: 0, filter: "blur(10px)", y: 6 }}
                animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                exit={{ opacity: 0, filter: "blur(10px)", y: -6, transition: { duration: 0.4 } }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <Card className="border-border/60 overflow-hidden">
                  <CardContent className="p-5 md:p-6 space-y-5">
                    {/* Project header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate">{prof.projectName}</p>
                        <div className="flex gap-1.5 mt-1.5 flex-wrap">
                          {prof.workTypes.map((w) => (
                            <span
                              key={w}
                              className="text-[11px] bg-muted px-2 py-0.5 rounded-full text-muted-foreground"
                            >
                              {w}
                            </span>
                          ))}
                        </div>
                      </div>
                      <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground leading-none shrink-0 mt-0.5">
                        En cours
                      </span>
                    </div>

                    {/* Stepper */}
                    <div className="grid grid-cols-6 pt-1 pb-4">
                      {prof.phases.map((phase, i) => (
                        <div key={phase.label} className="flex flex-col items-center relative">
                          {/* Left connector */}
                          {i > 0 && (
                            <div
                              className={cn(
                                "absolute top-2.5 right-1/2 left-0 h-px",
                                prof.phases[i - 1].done ? "bg-primary/50" : "bg-muted-foreground/25"
                              )}
                            />
                          )}
                          {/* Right connector */}
                          {i < prof.phases.length - 1 && (
                            <div
                              className={cn(
                                "absolute top-2.5 left-1/2 right-0 h-px",
                                phase.done ? "bg-primary/50" : "bg-muted-foreground/25"
                              )}
                            />
                          )}
                          {/* Dot */}
                          <div
                            className={cn(
                              "relative z-10 w-5 h-5 rounded-full border-2 bg-background flex items-center justify-center transition-all",
                              phase.active
                                ? "border-primary bg-primary ring-4 ring-primary/15"
                                : phase.done
                                  ? "border-primary/60 bg-primary/60"
                                  : "border-muted-foreground/30"
                            )}
                          >
                            {phase.done && (
                              <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground" />
                            )}
                          </div>
                          {/* Label */}
                          <span
                            className={cn(
                              "text-[10px] leading-tight",
                              phase.active
                                ? "block text-primary font-semibold whitespace-nowrap absolute top-full mt-1.5 left-1/2 -translate-x-1/2 sm:static sm:translate-x-0 sm:w-full sm:text-center sm:px-0.5"
                                : phase.done
                                  ? "hidden sm:block sm:text-foreground/60 sm:w-full sm:text-center sm:mt-1.5 sm:px-0.5"
                                  : "hidden sm:block sm:text-muted-foreground/40 sm:w-full sm:text-center sm:mt-1.5 sm:px-0.5"
                            )}
                          >
                            {phase.label}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Document row */}
                    <div className="border border-border/60 rounded-lg px-4 py-3 flex items-center justify-between bg-muted/20">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="text-sm font-medium truncate">{prof.docName}</span>
                      </div>
                      <span
                        className={cn(
                          "ml-3 shrink-0 text-xs px-2.5 py-0.5 rounded-full font-medium",
                          prof.docApproved
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                        )}
                      >
                        {prof.docApproved ? "Approuvé ✓" : "En attente"}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>
          </div>
        </AnimateIn>
      </div>
    </section>
  )
}
