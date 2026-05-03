"use client"

import { useRef, useState, useEffect, useSyncExternalStore } from "react"
import { motion, useInView, AnimatePresence } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"
import { AnimatedLogo } from "@/components/ui/animated-logo"
import { WaitlistForm } from "@/components/waitlist-form"
import { useTheme } from "@/components/theme-provider"
import {
  CheckCircle,
  FileText,
  Users,
  Shield,
  Star,
  ArrowRight,
  FolderOpen,
  Menu,
  X,
  Sparkles,
  Monitor,
  Tablet,
  Smartphone,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useMediaQuery } from "@/hooks/use-media-query"

const noop = () => () => {}
function useIsClient() {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false
  )
}

function AnimatedWord({ words }: { words: string[] }) {
  const [index, setIndex] = useState(0)
  const isClient = useIsClient()

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [words])

  if (!isClient) {
    return <span className="text-primary inline-block text-4xl md:text-6xl">{words[0]}</span>
  }

  return (
    <span className="text-primary inline-block text-4xl md:text-6xl relative">
      <AnimatePresence mode="wait">
        <motion.span
          key={words[index]}
          initial={{ opacity: 0, filter: "blur(16px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, filter: "blur(16px)", transition: { duration: 0.6, ease: "easeIn" } }}
          transition={{ duration: 1.1, ease: "easeOut" }}
          className="inline-block"
          style={{ willChange: "opacity, filter" }}
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

// Composant animation réutilisable
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

// Composant stagger pour les grilles
function StaggerGrid({ children, className }: { children: React.ReactNode[]; className?: string }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-60px" })

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={{
        hidden: {},
        visible: {
          transition: { staggerChildren: 0.08 },
        },
      }}
    >
      {children.map((child, i) => (
        <motion.div
          key={i}
          variants={{
            hidden: { opacity: 0, y: 24 },
            visible: {
              opacity: 1,
              y: 0,
              transition: {
                duration: 0.5,
                ease: [0.21, 0.47, 0.32, 0.98] as [number, number, number, number],
              },
            },
          }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  )
}

const features = [
  {
    icon: FolderOpen,
    title: "Gestion de projets",
    description:
      "Centralisez tous vos projets, clients et intervenants dans un espace unique et organisé.",
  },
  {
    icon: Sparkles,
    title: "Génération IA",
    description:
      "Générez un CCTP complet en quelques secondes. L'IA rédige, vous relisez et validez.",
  },
  {
    icon: FileText,
    title: "Documents professionnels",
    description:
      "Créez et gérez vos CCTP, notices, devis et comptes-rendus depuis une interface simple.",
  },
  {
    icon: Users,
    title: "Coordination des intervenants",
    description:
      "Réunissez architectes, plombiers, électriciens dans un espace partagé par chantier.",
  },
  {
    icon: Shield,
    title: "Sécurisé et fiable",
    description: "Vos données sont protégées et vos documents accessibles partout, à tout moment.",
  },
]

const testimonials = [
  {
    name: "Sophie Martin",
    role: "Architecte DPLG — Paris",
    content:
      "Chalto a transformé ma relation client. Fini les emails perdus et les validations floues. Mes clients adorent la simplicité du lien de validation.",
    rating: 5,
  },
  {
    name: "Marc Dupuis",
    role: "Plombier — Lyon",
    content:
      "Je gère maintenant tous mes chantiers depuis mon téléphone. La création de devis et les validations client se font en quelques clics.",
    rating: 5,
  },
  {
    name: "Claire Rousseau",
    role: "Entreprise GC — Bordeaux",
    content:
      "On coordonne 4 corps de métier sur chaque chantier. Chalto nous fait gagner un temps fou sur la paperasse et les allers-retours.",
    rating: 5,
  },
]

const plans = [
  {
    name: "Starter",
    price: "Gratuit",
    description: "Pour découvrir Chalto",
    features: ["2 projets actifs", "5 documents", "Validation client", "Templates de base"],
    cta: "Commencer gratuitement",
    href: "#waitlist",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "29€",
    period: "/mois",
    description: "Pour les professionnels actifs",
    features: [
      "Projets illimités",
      "Documents illimités",
      "Validation + commentaires",
      "Tous les templates",
      "Coordination intervenants",
      "Support prioritaire",
    ],
    cta: "Démarrer l'essai",
    href: "#waitlist",
    highlighted: true,
  },
  {
    name: "Agence",
    price: "79€",
    period: "/mois",
    description: "Pour les petites agences",
    features: [
      "Tout le plan Pro",
      "Jusqu'à 5 utilisateurs",
      "Tableau de bord partagé",
      "Support dédié",
    ],
    cta: "Nous contacter",
    href: "#waitlist",
    highlighted: false,
  },
]

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

function ProfessionSection() {
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

function scrollToSection(id: string) {
  const el = document.getElementById(id)
  if (!el) return

  const start = window.scrollY
  const target = el.getBoundingClientRect().top + window.scrollY - 64
  const distance = target - start
  const duration = 900
  let startTime: number | null = null

  const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

  function step(timestamp: number) {
    if (!startTime) startTime = timestamp
    const progress = Math.min((timestamp - startTime) / duration, 1)
    window.scrollTo(0, start + distance * ease(progress))
    if (progress < 1) requestAnimationFrame(step)
  }

  requestAnimationFrame(step)
}

function AIFeatureCard({
  title,
  description,
  icon: Icon,
}: {
  title: string
  description: string
  icon: React.ElementType
}) {
  return (
    <>
      <style>{`
        @property --ai-angle {
          syntax: '<angle>';
          initial-value: 0deg;
          inherits: false;
        }
        @keyframes ai-border-spin {
          to { --ai-angle: 360deg; }
        }
        .ai-card-border {
          background: conic-gradient(from var(--ai-angle), transparent 25%, hsl(224 79% 65% / 0.45), #a78bfa80, #ec489960, hsl(224 79% 65% / 0.45), transparent 75%);
          animation: ai-border-spin 7s linear infinite;
        }
      `}</style>
      <div className="ai-card-border h-full rounded-xl p-px">
        <Card className="h-full rounded-[11px] border-0 relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.05] pointer-events-none"
            style={{
              background: "linear-gradient(to bottom right, hsl(224 79% 52%), #8b5cf6, #ec4899)",
            }}
          />
          <CardContent className="relative p-6 space-y-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: "hsl(224 79% 52% / 0.15)" }}
            >
              <Icon className="h-5 w-5" style={{ color: "hsl(224 79% 68%)" }} />
            </div>
            <h3 className="font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
          </CardContent>
        </Card>
      </div>
    </>
  )
}

// Sections temporairement masquées — passer à true pour réafficher
const SHOW_TESTIMONIALS = false
const SHOW_PRICING = false

// ─── Responsive showcase (Option C — device morphant) ───────────────────────

type DeviceType = "desktop" | "tablet" | "mobile"

const DEVICES: Record<
  DeviceType,
  { label: string; icon: React.ElementType; w: number; h: number; radius: number; border: number }
> = {
  desktop: { label: "Desktop", icon: Monitor, w: 560, h: 360, radius: 12, border: 1 },
  tablet: { label: "Tablette", icon: Tablet, w: 300, h: 420, radius: 24, border: 3 },
  mobile: { label: "Mobile", icon: Smartphone, w: 190, h: 420, radius: 36, border: 3 },
}

function ScreenshotContent({ device }: { device: DeviceType }) {
  const { resolvedTheme } = useTheme()
  const theme = resolvedTheme === "dark" ? "dark" : "light"
  if (device === "desktop") {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={`/screenshots/${device}-${theme}.png`}
        alt={`Chalto sur ${DEVICES[device].label}`}
        className="w-full h-full object-cover object-top"
        draggable={false}
      />
    )
  }
  return (
    <div className="w-full h-full p-2 flex items-start overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/screenshots/${device}-${theme}.png`}
        alt={`Chalto sur ${DEVICES[device].label}`}
        className="w-full h-auto rounded-sm"
        draggable={false}
      />
    </div>
  )
}

function DeviceShowcase() {
  const [active, setActive] = useState<DeviceType>("desktop")
  const [auto, setAuto] = useState(true)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })
  const isMobile = useMediaQuery("(max-width: 767px)")
  const cycle: DeviceType[] = isMobile ? ["tablet", "mobile"] : ["desktop", "tablet", "mobile"]
  const isMobileRef = useRef(isMobile)
  const spring = { type: "spring" as const, stiffness: 280, damping: 28 }

  useEffect(() => {
    isMobileRef.current = isMobile
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (isMobile) setActive((prev) => (prev === "desktop" ? "tablet" : prev))
  }, [isMobile])

  useEffect(() => {
    if (!auto) return
    const t = setInterval(() => {
      setActive((prev) => {
        const c: DeviceType[] = isMobileRef.current
          ? ["tablet", "mobile"]
          : ["desktop", "tablet", "mobile"]
        const idx = c.indexOf(prev)
        return c[(idx === -1 ? 0 : idx + 1) % c.length]
      })
    }, 3200)
    return () => clearInterval(t)
  }, [auto])

  const d = DEVICES[active]

  return (
    <section className="py-20 px-6 md:px-4 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <AnimateIn>
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold tracking-tight">Pensé pour le terrain</h2>
            <p className="text-muted-foreground mt-2">
              Bureau, chantier ou déplacement — l&apos;interface s&apos;adapte à votre écran
            </p>
          </div>
        </AnimateIn>

        {/* Device frame — fixed-height container so tabs never shift */}
        <motion.div
          ref={ref}
          className="flex justify-center items-center"
          style={{ height: 420 }}
          initial={{ opacity: 0, y: 48 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 48 }}
          transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
        >
          <motion.div
            animate={{ width: d.w, borderRadius: d.radius }}
            transition={spring}
            className="relative overflow-hidden bg-background shadow-2xl"
            style={{
              height: d.h,
              border: `${d.border}px solid hsl(var(--border) / 0.6)`,
            }}
          >
            {/* Top bar */}
            <AnimatePresence mode="wait">
              {active === "desktop" ? (
                <motion.div
                  key="browser-chrome"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="h-9 bg-muted border-b border-border/30 flex items-center px-3 gap-2 shrink-0"
                >
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-400/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/60" />
                  </div>
                  <div className="flex-1 h-4 bg-background/70 rounded-full mx-2" />
                </motion.div>
              ) : active === "tablet" ? (
                <motion.div
                  key="tablet-bar"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="h-7 bg-muted/50 border-b border-border/20 flex items-center justify-center"
                >
                  <div className="h-1.5 w-14 rounded-full bg-foreground/15" />
                </motion.div>
              ) : (
                <motion.div
                  key="mobile-notch"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="h-8 bg-background flex items-start justify-center pt-1.5"
                >
                  <div className="w-20 h-4 rounded-full bg-border/50" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Content */}
            <motion.div
              animate={{
                height: active === "desktop" ? d.h - 36 : active === "tablet" ? d.h - 28 : d.h - 32,
              }}
              transition={spring}
              className="overflow-hidden"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={active}
                  initial={{ opacity: 0, filter: "blur(8px)" }}
                  animate={{ opacity: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, filter: "blur(8px)" }}
                  transition={{ duration: 0.25 }}
                  className="h-full"
                >
                  <ScreenshotContent device={active} />
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          className="flex items-center justify-center gap-2 mt-8"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          {cycle.map((key) => {
            const Icon = DEVICES[key].icon
            const isActive = active === key
            return (
              <button
                key={key}
                onClick={() => {
                  setActive(key)
                  setAuto(false)
                }}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted/70 text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {DEVICES[key].label}
              </button>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false)

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Chalto est-il gratuit ?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Oui, Chalto propose un plan Starter gratuit avec 2 projets et 5 documents. Les plans Pro (29€/mois) et Agence (79€/mois) offrent des fonctionnalités illimitées.",
        },
      },
      {
        "@type": "Question",
        name: "Chalto fonctionne-t-il sur mobile ?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Oui, Chalto est une PWA installable sur iPhone et Android. L'interface est optimisée pour une utilisation sur chantier depuis votre téléphone.",
        },
      },
      {
        "@type": "Question",
        name: "Mon client a-t-il besoin d'un compte pour valider un document ?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Non. Votre client reçoit un lien sécurisé par email et peut approuver ou commenter vos documents sans créer de compte.",
        },
      },
      {
        "@type": "Question",
        name: "Quels métiers peuvent utiliser Chalto ?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Chalto s'adapte à tous les corps de métier du bâtiment : architectes, plombiers, électriciens, menuisiers, entrepreneurs généraux et plus encore.",
        },
      },
      {
        "@type": "Question",
        name: "Mes données sont-elles sécurisées ?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Oui. Chalto utilise Supabase avec Row Level Security, HTTPS et des tokens sécurisés pour protéger toutes vos données et documents.",
        },
      },
    ],
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Chalto",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web, iOS, Android",
    description: "Plateforme de gestion de projets pour les professionnels du bâtiment",
    url: "https://chalto.fr",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "EUR",
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <div className="min-h-screen bg-background overflow-x-hidden">
        {/* Navbar */}
        <motion.header
          className="fixed top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur-sm"
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <div className="max-w-6xl mx-auto px-6 md:px-4 h-14 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AnimatedLogo width={24} height={24} />
              <span className="font-bold">Chalto</span>
            </div>
            <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#features" className="hover:text-foreground transition-colors">
                Fonctionnalités
              </a>
              {SHOW_PRICING && (
                <a href="#pricing" className="hover:text-foreground transition-colors">
                  Tarifs
                </a>
              )}
              {SHOW_TESTIMONIALS && (
                <a href="#testimonials" className="hover:text-foreground transition-colors">
                  Témoignages
                </a>
              )}
              <Link href="/blog" className="hover:text-foreground transition-colors">
                Blog
              </Link>
            </nav>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button variant="ghost" size="sm" asChild className="hidden md:inline-flex">
                <Link href="/login">Connexion</Link>
              </Button>
              <Button size="sm" asChild className="hidden md:inline-flex">
                <a href="#waitlist">Rejoindre la bêta</a>
              </Button>
              <button
                className="md:hidden p-2 rounded-md hover:bg-muted transition-colors"
                onClick={() => setMenuOpen((o) => !o)}
                aria-label="Menu"
              >
                <AnimatePresence mode="wait" initial={false}>
                  {menuOpen ? (
                    <motion.span
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.18 }}
                      className="block"
                    >
                      <X className="h-5 w-5" />
                    </motion.span>
                  ) : (
                    <motion.span
                      key="open"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.18 }}
                      className="block"
                    >
                      <Menu className="h-5 w-5" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22, ease: [0.21, 0.47, 0.32, 0.98] }}
                className="md:hidden border-t bg-background/95 backdrop-blur-sm"
              >
                <nav className="flex flex-col px-6 py-4 gap-1">
                  {[
                    { label: "Fonctionnalités", id: "features" },
                    { label: "Tarifs", id: "pricing" },
                    { label: "Témoignages", id: "testimonials" },
                    { label: "Rejoindre la bêta", id: "waitlist" },
                  ]
                    .filter((item) => {
                      if (item.id === "pricing" && !SHOW_PRICING) return false
                      if (item.id === "testimonials" && !SHOW_TESTIMONIALS) return false
                      return true
                    })
                    .map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          scrollToSection(item.id)
                          setMenuOpen(false)
                        }}
                        className="text-left py-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors border-b border-border/50"
                      >
                        {item.label}
                      </button>
                    ))}
                  <Link
                    href="/blog"
                    onClick={() => setMenuOpen(false)}
                    className="text-left py-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors border-b border-border/50"
                  >
                    Blog
                  </Link>
                  <div className="flex gap-2 pt-3">
                    <Button variant="outline" size="sm" className="flex-1" asChild>
                      <Link href="/login" onClick={() => setMenuOpen(false)}>
                        Connexion
                      </Link>
                    </Button>
                    <Button size="sm" className="flex-1" asChild>
                      <a href="#waitlist" onClick={() => setMenuOpen(false)}>
                        Rejoindre la bêta
                      </a>
                    </Button>
                  </div>
                </nav>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.header>

        {/* Hero */}
        <section className="relative pt-32 pb-20 px-6 md:px-4 overflow-hidden">
          {/* Fond décoratif — desktop uniquement (blur-3xl coûteux sur mobile) */}
          <div className="absolute inset-0 pointer-events-none hidden md:block">
            <div className="absolute top-20 left-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute top-40 right-1/4 w-96 h-96 bg-primary/3 rounded-full blur-3xl" />
          </div>

          <div className="max-w-4xl mx-auto text-center space-y-6 relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.05 }}
              className="flex justify-center mb-6"
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.75 }}
              >
                <AnimatedLogo width={88} height={88} className="md:hidden" />
                <AnimatedLogo width={112} height={112} className="hidden md:block" />
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Badge variant="outline" className="mb-4 hidden md:inline-flex">
                Pour tous les pros du bâtiment
              </Badge>
            </motion.div>

            <motion.h1
              className="text-5xl md:text-6xl font-bold tracking-tight leading-tight uppercase"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <AnimatedWord words={["Piloter", "Organiser", "Maîtriser"]} />
              <br />
              {/* Mobile + tablette : 2 lignes */}
              <span className="xl:hidden">
                <span className="block text-foreground text-4xl md:text-5xl">votre activité,</span>
                <span className="block text-foreground text-4xl md:text-5xl">simplement</span>
              </span>
              {/* Desktop : 1 ligne */}
              <span className="hidden xl:inline text-foreground whitespace-nowrap">
                votre activité, simplement
              </span>
            </motion.h1>

            <motion.p
              className="text-lg md:text-xl text-muted-foreground mx-auto"
              style={{ maxWidth: "512px" }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
            >
              Ne perdez plus de temps avec les emails, les WhatsApp et les appels de relance.
              <br />
              Chalto centralise tous vos projets, documents et validations client en un seul
              endroit.
            </motion.p>

            <motion.div
              className="flex flex-col items-center sm:flex-row gap-3 justify-center mt-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <Button size="lg" asChild>
                <motion.a href="#waitlist" whileHover="hovered">
                  Rejoindre la bêta
                  {/* Mobile — boucle infinie */}
                  <motion.span
                    className="md:hidden ml-2 inline-flex"
                    animate={{ x: [0, 4, 0] }}
                    transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
                  >
                    <ArrowRight className="h-4 w-4" />
                  </motion.span>
                  {/* Desktop — boucle au hover */}
                  <motion.span
                    className="hidden md:inline-flex ml-2"
                    variants={{
                      hovered: {
                        x: [0, 4, 0],
                        transition: { repeat: Infinity, duration: 1.2, ease: "easeInOut" },
                      },
                    }}
                    transition={{ duration: 0.15 }}
                  >
                    <ArrowRight className="h-4 w-4" />
                  </motion.span>
                </motion.a>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/demo">Voir la démo</Link>
              </Button>
            </motion.div>

            <motion.p
              className="text-xs text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              Accès bêta sur invitation · Gratuit · Sans engagement
            </motion.p>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-20 px-6 md:px-4 bg-muted/30">
          <div className="max-w-6xl mx-auto">
            <AnimateIn>
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold tracking-tight">Tout ce dont vous avez besoin</h2>
                <p className="text-muted-foreground mt-2">
                  Un outil pensé pour les réalités du terrain
                </p>
              </div>
            </AnimateIn>

            {/* Hero feature — Validation client */}
            <AnimateIn>
              <style>{`
                @keyframes hero-border-spin {
                  to { --hero-angle: 360deg; }
                }
                @property --hero-angle {
                  syntax: '<angle>';
                  initial-value: 0deg;
                  inherits: false;
                }
                .hero-card-border {
                  background: conic-gradient(from var(--hero-angle), transparent 25%, hsl(224 79% 65% / 0.45), #a78bfa80, hsl(224 79% 65% / 0.45), transparent 75%);
                  animation: hero-border-spin 7s linear infinite;
                }
              `}</style>
              <div className="hero-card-border rounded-xl p-px mb-6">
                <Card className="rounded-[11px] border-0 relative overflow-hidden">
                  <div
                    className="absolute inset-0 opacity-[0.05] pointer-events-none"
                    style={{
                      background:
                        "linear-gradient(to bottom right, hsl(224 79% 52%), #8b5cf6, #ec4899)",
                    }}
                  />
                  <CardContent className="relative p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-6">
                    <div className="bg-primary/15 w-14 h-14 rounded-xl flex items-center justify-center shrink-0">
                      <CheckCircle className="h-7 w-7 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold mb-1">Validation client en 1 clic</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        Envoyez un lien sécurisé à votre client. Il approuve ou commente directement
                        — <span className="text-foreground font-medium">sans créer de compte</span>.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </AnimateIn>

            {/* Grille 5 features */}
            <StaggerGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature) => {
                const Icon = feature.icon
                if (feature.title === "Génération IA") {
                  return (
                    <AIFeatureCard
                      key={feature.title}
                      title={feature.title}
                      description={feature.description}
                      icon={Icon}
                    />
                  )
                }

                return (
                  <Card
                    key={feature.title}
                    className="h-full hover:border-primary/50 transition-colors duration-200"
                  >
                    <CardContent className="p-6 space-y-3">
                      <div className="bg-primary/10 w-10 h-10 rounded-lg flex items-center justify-center">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="font-semibold">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                )
              })}
            </StaggerGrid>
          </div>
        </section>

        {/* Profession showcase */}
        <ProfessionSection />

        {/* Testimonials */}
        {SHOW_TESTIMONIALS && (
          <section id="testimonials" className="py-20 px-6 md:px-4">
            <div className="max-w-6xl mx-auto">
              <AnimateIn>
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold tracking-tight">Ils utilisent Chalto</h2>
                  <p className="text-muted-foreground mt-2">
                    Des professionnels qui ont simplifié leur quotidien
                  </p>
                </div>
              </AnimateIn>

              <StaggerGrid className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {testimonials.map((t) => (
                  <Card key={t.name} className="h-full">
                    <CardContent className="p-6 space-y-4">
                      <div className="flex gap-1">
                        {Array.from({ length: t.rating }).map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {`"${t.content}"`}
                      </p>
                      <div>
                        <p className="font-medium text-sm">{t.name}</p>
                        <p className="text-xs text-muted-foreground">{t.role}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </StaggerGrid>
            </div>
          </section>
        )}

        {/* Pricing */}
        {SHOW_PRICING && (
          <section id="pricing" className="py-20 px-6 md:px-4 bg-muted/30">
            <div className="max-w-5xl mx-auto">
              <AnimateIn>
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold tracking-tight">
                    Tarifs simples et transparents
                  </h2>
                  <p className="text-muted-foreground mt-2">
                    Commencez gratuitement, évoluez selon vos besoins
                  </p>
                </div>
              </AnimateIn>

              <StaggerGrid className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                {plans.map((plan) => (
                  <div key={plan.name} className="relative flex flex-col pt-3">
                    {plan.highlighted && (
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10">
                        <Badge className="bg-primary text-primary-foreground">Populaire</Badge>
                      </div>
                    )}
                    <div
                      className={
                        plan.highlighted ? "hero-card-border rounded-xl p-px h-full" : "h-full"
                      }
                    >
                      <Card
                        className={`h-full ${plan.highlighted ? "rounded-[11px] border-0" : ""}`}
                      >
                        <CardContent className="p-6 space-y-6">
                          <div>
                            <h3 className="font-bold text-lg">{plan.name}</h3>
                            <p className="text-muted-foreground text-sm">{plan.description}</p>
                          </div>
                          <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-bold">{plan.price}</span>
                            {plan.period && (
                              <span className="text-muted-foreground text-sm">{plan.period}</span>
                            )}
                          </div>
                          <ul className="space-y-2">
                            {plan.features.map((f) => (
                              <li key={f} className="flex items-center gap-2 text-sm">
                                <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                                {f}
                              </li>
                            ))}
                          </ul>
                          <Button
                            className="w-full"
                            variant={plan.highlighted ? "default" : "outline"}
                            asChild
                          >
                            <a href="#waitlist">{plan.cta}</a>
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                ))}
              </StaggerGrid>
            </div>
          </section>
        )}

        {/* Responsive showcase */}
        <DeviceShowcase />

        {/* FAQ */}
        <section className="py-20 px-6 md:px-4">
          <div className="max-w-2xl mx-auto">
            <AnimateIn>
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold tracking-tight">Questions fréquentes</h2>
              </div>
            </AnimateIn>
            <AnimateIn delay={0.1}>
              <div className="space-y-4">
                {[
                  {
                    question: "Chalto est-il gratuit ?",
                    answer:
                      "Oui, plan Starter gratuit avec 2 projets et 5 documents. Plans Pro et Agence pour aller plus loin.",
                  },
                  {
                    question: "Mon client a besoin d'un compte ?",
                    answer: "Non. Il reçoit un lien par email et valide sans créer de compte.",
                  },
                  {
                    question: "Ça fonctionne sur mobile ?",
                    answer:
                      "Oui, Chalto est installable sur iPhone et Android comme une app native.",
                  },
                  {
                    question: "Quels métiers peuvent utiliser Chalto ?",
                    answer:
                      "Architectes, plombiers, électriciens, menuisiers, entrepreneurs — tous les corps de métier.",
                  },
                  {
                    question: "Mes données sont-elles sécurisées ?",
                    answer:
                      "Oui. Chiffrement HTTPS, Row Level Security Supabase, tokens sécurisés.",
                  },
                ].map((faq) => (
                  <div key={faq.question} className="border rounded-xl p-5 space-y-2">
                    <p className="font-semibold text-sm">{faq.question}</p>
                    <p className="text-sm text-muted-foreground">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </AnimateIn>
          </div>
        </section>

        {/* CTA Final */}
        <section className="py-20 px-6 md:px-4">
          <AnimateIn>
            <div className="max-w-2xl mx-auto text-center space-y-6">
              <h2 className="text-3xl font-bold tracking-tight">
                Prêt à simplifier votre activité ?
              </h2>
              <p className="text-muted-foreground">
                Rejoignez les professionnels du bâtiment qui font confiance à Chalto
              </p>
              <Button size="lg" asChild className="mt-4">
                <a href="#waitlist">
                  Rejoindre la liste d&apos;attente
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>
          </AnimateIn>
        </section>

        {/* Waitlist */}
        <section id="waitlist" className="py-20 px-6 md:px-4 bg-muted/30">
          <div className="max-w-md mx-auto">
            <AnimateIn>
              <div className="text-center space-y-4 mb-8">
                <Badge variant="outline">🚀 Accès bêta</Badge>
                <h2 className="text-3xl font-bold tracking-tight">Rejoignez les premiers</h2>
                <p className="text-muted-foreground">
                  Chalto est en accès bêta fermé. Inscrivez-vous pour être contacté en priorité.
                </p>
              </div>
              <WaitlistForm />
            </AnimateIn>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t py-8 px-6 md:px-4">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Image src="/Logo.svg" alt="Chalto" width={20} height={20} />
              <span className="font-medium text-foreground">Chalto</span>
              <span>— La plateforme des pros du bâtiment</span>
            </div>
            <div className="flex items-center gap-6">
              <Link href="/blog" className="hover:text-foreground transition-colors">
                Blog
              </Link>
              <a href="#" className="hover:text-foreground transition-colors">
                Mentions légales
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                CGU
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Contact
              </a>
              {/* Icônes réseaux — desktop uniquement inline */}
              <div className="hidden md:flex items-center gap-3 ml-2 pl-4 border-l border-border">
                <a
                  href="https://www.instagram.com/chalto.fr/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  aria-label="Instagram"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
                <a
                  href="http://linkedin.com/company/chalto/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  aria-label="LinkedIn"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
              </div>
            </div>
            {/* Icônes réseaux — mobile uniquement, centrées */}
            <div className="flex md:hidden items-center justify-center gap-4">
              <a
                href="https://www.instagram.com/chalto.fr/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Instagram"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a
                href="http://linkedin.com/company/chalto/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="LinkedIn"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}
