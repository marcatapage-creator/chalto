"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  CheckCircle2,
  Sparkles,
  AlarmClock,
  LayoutGrid,
  Check,
  FileText,
  Loader2,
} from "lucide-react"

/* ── Mockup 1 : Validation client ─────────────────────────────── */

function ValidationMockup() {
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 1400)
    const t2 = setTimeout(() => setPhase(2), 2800)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [])

  return (
    <div className="space-y-3 w-full sm:max-w-xs sm:mx-auto">
      <div className="bg-background rounded-xl border border-border p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <FileText className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground">Document envoyé</p>
            <p className="text-sm font-semibold truncate">Plans RDC — Villa Lagrange</p>
          </div>
          <motion.span
            animate={{
              backgroundColor: phase >= 2 ? "hsl(142 76% 36% / 0.12)" : "hsl(45 93% 47% / 0.12)",
            }}
            transition={{ duration: 0.4 }}
            className="text-xs font-medium px-2 py-1 rounded-full shrink-0"
          >
            <motion.span animate={{ color: phase >= 2 ? "hsl(142 76% 36%)" : "hsl(26 90% 37%)" }}>
              {phase >= 2 ? "✓ Approuvé" : "En attente"}
            </motion.span>
          </motion.span>
        </div>
        <div className="mt-3 space-y-1.5">
          <div className="h-1.5 bg-muted rounded-full w-full" />
          <div className="h-1.5 bg-muted rounded-full w-4/5" />
          <div className="h-1.5 bg-muted rounded-full w-2/3" />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {phase >= 1 ? (
          <motion.div
            key="notification"
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="bg-background rounded-xl border border-border p-3 flex items-center gap-3 shadow-sm"
          >
            <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-[10px] font-bold text-primary-foreground shrink-0">
              SL
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium">Sophie Lagrange</p>
              <p className="text-xs text-muted-foreground truncate">
                {phase === 1 ? "A ouvert le document…" : "✓ A approuvé en 1 clic"}
              </p>
            </div>
            <AnimatePresence>
              {phase >= 2 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center shrink-0"
                >
                  <Check className="h-3 w-3 text-white" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            key="waiting"
            exit={{ opacity: 0 }}
            className="rounded-xl border border-dashed border-border p-3 flex items-center justify-center"
          >
            <p className="text-xs text-muted-foreground">En attente de validation client…</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ── Mockup 2 : Génération IA ─────────────────────────────────── */

const IA_LINES = [
  { text: "1. DESCRIPTION GÉNÉRALE DES TRAVAUX", bold: true },
  { text: "Le présent CCTP fixe les spécifications techniques des lots...", bold: false },
  { text: "2. LOT ÉLECTRICITÉ — Courants forts", bold: true },
  { text: "Installation tableau général 3×400V, disjoncteurs différentiels...", bold: false },
]

function IAMockup() {
  const [phase, setPhase] = useState(0)
  const [lines, setLines] = useState(0)

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 700)
    const t2 = setTimeout(() => setPhase(2), 1800)
    const lineTimers = [2100, 2500, 2900, 3300].map((t, i) => setTimeout(() => setLines(i + 1), t))
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      lineTimers.forEach(clearTimeout)
    }
  }, [])

  return (
    <div className="w-full sm:max-w-xs sm:mx-auto">
      <AnimatePresence mode="wait">
        {phase < 2 ? (
          <motion.div
            key="form"
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="bg-background rounded-xl border border-border p-4 shadow-sm"
          >
            <div className="space-y-2 mb-4">
              {[
                ["Type", "CCTP"],
                ["Projet", "Villa Méditerranée"],
                ["Lots", "Élec, Plomberie, Menuiserie"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{k}</span>
                  <span className="font-medium">{v}</span>
                </div>
              ))}
            </div>
            <div className="ai-btn-border rounded-lg p-px">
              <div className="rounded-[7px] bg-background flex items-center justify-center gap-2 h-9 text-sm font-medium text-primary">
                {phase === 0 ? (
                  <>
                    <Sparkles className="h-3.5 w-3.5" /> Générer le CCTP
                  </>
                ) : (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Génération…
                  </>
                )}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="doc"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-background rounded-xl border border-border p-4 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-3 pb-3 border-b border-border">
              <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center">
                <FileText className="h-3.5 w-3.5 text-primary" />
              </div>
              <p className="text-sm font-semibold flex-1">CCTP — Villa Méditerranée</p>
              <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                IA
              </span>
            </div>
            <div className="space-y-1.5">
              {IA_LINES.slice(0, lines).map((line, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className={`text-xs ${line.bold ? "font-semibold text-foreground" : "text-muted-foreground"}`}
                >
                  {line.text}
                </motion.p>
              ))}
              {lines < IA_LINES.length && (
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{ repeat: Infinity, duration: 0.6 }}
                  className="inline-block w-0.5 h-3.5 bg-primary"
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ── Mockup 3 : Alertes délais ────────────────────────────────── */

const DOSSIERS = [
  { label: "Permis de construire", j: "J-30", urgency: 0 },
  { label: "Assurance décennale", j: "J-7", urgency: 1 },
  { label: "Déclaration ouverture chantier", j: "J-1", urgency: 2 },
  { label: "Plan de prévention sécurité", j: "J-15", urgency: 0 },
]

const URGENCY_CLS = [
  "text-amber-600 bg-amber-50 dark:bg-amber-950/40",
  "text-red-500 bg-red-50 dark:bg-red-950/40",
  "text-red-600 bg-red-100 dark:bg-red-950/60 font-bold",
]

function DelaisMockup() {
  const [highlighted, setHighlighted] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setHighlighted(true), 1600)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="w-full sm:max-w-xs sm:mx-auto space-y-2">
      {DOSSIERS.map((d, i) => {
        const isUrgent = d.urgency === 2
        return (
          <motion.div
            key={i}
            animate={
              isUrgent && highlighted
                ? { x: [0, -3, 3, -3, 0], transition: { duration: 0.35 } }
                : {}
            }
            className={`bg-background rounded-xl border px-4 py-2.5 flex items-center justify-between transition-colors duration-300 ${
              isUrgent && highlighted ? "border-red-300 dark:border-red-800" : "border-border"
            }`}
          >
            <p className="text-sm text-foreground truncate mr-3">{d.label}</p>
            <motion.span
              animate={
                isUrgent && highlighted
                  ? { opacity: [1, 0.4, 1], transition: { repeat: 4, duration: 0.5 } }
                  : {}
              }
              className={`text-xs px-2 py-1 rounded-full shrink-0 ${URGENCY_CLS[d.urgency]}`}
            >
              {d.j}
            </motion.span>
          </motion.div>
        )
      })}
    </div>
  )
}

/* ── Mockup 4 : Board tâches ──────────────────────────────────── */

const COL_DEF = [
  { key: "todo" as const, label: "À faire", dot: "bg-muted-foreground" },
  { key: "inprogress" as const, label: "En cours", dot: "bg-amber-400" },
  { key: "done" as const, label: "Terminé", dot: "bg-green-500" },
]

function TasksMockup() {
  const [moved, setMoved] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setMoved(true), 1800)
    return () => clearTimeout(t)
  }, [])

  const cols = {
    todo: moved ? ["Peinture chambre 1"] : ["Installation VMC", "Peinture chambre 1"],
    inprogress: moved ? ["Pose carrelage cuisine", "Installation VMC"] : ["Pose carrelage cuisine"],
    done: ["Réception matériaux"],
  }

  return (
    <div className="w-full sm:max-w-xs sm:mx-auto grid grid-cols-3 gap-2">
      {COL_DEF.map((col) => (
        <div key={col.key} className="rounded-xl bg-muted/50 p-2">
          <div className="flex items-center gap-1.5 mb-2">
            <div className={`w-1.5 h-1.5 rounded-full ${col.dot}`} />
            <p className="text-[10px] font-semibold text-muted-foreground">{col.label}</p>
          </div>
          <div className="space-y-1.5 min-h-22.5">
            <AnimatePresence>
              {cols[col.key].map((title) => (
                <motion.div
                  key={title}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  className="bg-background border border-border rounded-lg p-2"
                >
                  <p className="text-[10px] text-foreground leading-snug">{title}</p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ── Données features ─────────────────────────────────────────── */

const FEATURES = [
  {
    id: "validation",
    label: "Validation client",
    icon: CheckCircle2,
    headline: "Vos clients valident en 1 clic",
    body: "Envoyez plans, devis et documents directement depuis Chalto. Votre client reçoit un lien sécurisé, approuve ou laisse un commentaire — sans compte, sans friction.",
    bullets: [
      "Lien de validation sécurisé et tokenisé",
      "Historique horodaté disponible en cas de litige",
      "Notification instantanée à l'approbation",
    ],
    Mockup: ValidationMockup,
  },
  {
    id: "ia",
    label: "Génération IA",
    icon: Sparkles,
    headline: "Un CCTP complet en 30 secondes",
    body: "Renseignez les lots et le type de projet. Chalto génère un cahier des clauses techniques précis et personnalisé, prêt à être envoyé à vos prestataires.",
    bullets: [
      "Adapté aux lots : électricité, plomberie, menuiserie…",
      "Conforme aux exigences techniques BTP",
      "Entièrement modifiable après génération",
    ],
    Mockup: IAMockup,
  },
  {
    id: "delais",
    label: "Alertes délais",
    icon: AlarmClock,
    headline: "Plus aucune échéance manquée",
    body: "Déclaration d'ouverture de chantier, assurance décennale, permis de construire... Chalto surveille vos délais réglementaires et vous alerte avant qu'il soit trop tard.",
    bullets: [
      "Alertes automatiques à J-30, J-7 et J-1",
      "Couvre les obligations réglementaires BTP",
      "Notifications email et tableau de bord",
    ],
    Mockup: DelaisMockup,
  },
  {
    id: "taches",
    label: "Board tâches",
    icon: LayoutGrid,
    headline: "Le chantier coordonné, sans réunion",
    body: "Un board kanban pensé pour le BTP. Assignez, suivez et déplacez les tâches entre intervenants en temps réel — tout le monde reste aligné, sur le chantier comme au bureau.",
    bullets: [
      "Vue par phase de projet",
      "Accessible aux prestataires et sous-traitants",
      "Mise à jour en temps réel",
    ],
    Mockup: TasksMockup,
  },
]

/* ── Feature row (layout alterné) ────────────────────────────── */

function FeatureRow({
  feature,
  moduleLeft,
}: {
  feature: (typeof FEATURES)[0]
  moduleLeft: boolean
}) {
  const [inView, setInView] = useState(false)
  const [runKey, setRunKey] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const startedRef = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !startedRef.current) {
          startedRef.current = true
          setInView(true)
          setRunKey((k) => k + 1)
        }
      },
      { threshold: 0.25 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const { icon: Icon, Mockup } = feature

  const textPanel = (
    <motion.div
      initial={{ opacity: 0, x: moduleLeft ? 24 : -24 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col justify-center"
    >
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <span className="text-xs font-semibold tracking-widest uppercase text-primary">
          {feature.label}
        </span>
      </div>
      <h3 className="text-2xl md:text-3xl font-bold tracking-tight mb-4 leading-tight">
        {feature.headline}
      </h3>
      <p className="text-muted-foreground leading-relaxed mb-6 text-sm md:text-base">
        {feature.body}
      </p>
      <ul className="space-y-3">
        {feature.bullets.map((bullet, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm">
            <div className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center mt-0.5 shrink-0">
              <Check className="h-2.5 w-2.5 text-primary" />
            </div>
            <span className="text-foreground/80">{bullet}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  )

  const mockupPanel = (
    <motion.div
      initial={{ opacity: 0, x: moduleLeft ? -24 : 24 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="bg-card border border-border rounded-2xl shadow-sm"
    >
      <div className="p-4 sm:p-6 flex items-center justify-center">
        {inView && <Mockup key={runKey} />}
      </div>
    </motion.div>
  )

  return (
    <div ref={ref} className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
      {moduleLeft ? (
        <>
          <div className="order-2 md:order-1">{mockupPanel}</div>
          <div className="order-1 md:order-2">{textPanel}</div>
        </>
      ) : (
        <>
          <div className="order-1">{textPanel}</div>
          <div className="order-2">{mockupPanel}</div>
        </>
      )}
    </div>
  )
}

/* ── Section principale ───────────────────────────────────────── */

export function LandingAnimatedShowcase() {
  return (
    <section className="py-24 px-6 md:px-4 bg-muted/30">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-20"
        >
          <p className="text-xs font-semibold tracking-widest uppercase text-primary mb-4">
            Chalto en action
          </p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Moins de friction.
            <br />
            <span className="text-primary">Plus de résultats.</span>
          </h2>
        </motion.div>

        <div className="space-y-24 md:space-y-32">
          {FEATURES.map((feature, i) => (
            <FeatureRow key={feature.id} feature={feature} moduleLeft={i % 2 === 0} />
          ))}
        </div>
      </div>
    </section>
  )
}
