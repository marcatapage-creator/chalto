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

const TAB_MS = 4500

const TABS = [
  { id: "validation", label: "Validation client", icon: CheckCircle2 },
  { id: "ia", label: "Génération IA", icon: Sparkles },
  { id: "delais", label: "Alertes délais", icon: AlarmClock },
  { id: "taches", label: "Board tâches", icon: LayoutGrid },
]

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
    <div className="space-y-3 max-w-xs mx-auto w-full">
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
    <div className="max-w-xs mx-auto w-full">
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
    <div className="max-w-xs mx-auto w-full space-y-2">
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
    <div className="max-w-xs mx-auto w-full grid grid-cols-3 gap-2">
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

/* ── Section principale ───────────────────────────────────────── */

export function LandingAnimatedShowcase() {
  const [activeTab, setActiveTab] = useState(0)
  const [runKey, setRunKey] = useState(0)
  const [running, setRunning] = useState(false)
  const [intervalKey, setIntervalKey] = useState(0)
  const sectionRef = useRef<HTMLDivElement>(null)
  const startedRef = useRef(false)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !startedRef.current) {
          startedRef.current = true
          setRunning(true)
        }
      },
      { threshold: 0.3 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!running) return
    const t = setInterval(() => {
      setActiveTab((prev) => (prev + 1) % TABS.length)
      setRunKey((k) => k + 1)
    }, TAB_MS)
    return () => clearInterval(t)
  }, [running, intervalKey])

  const handleTab = (i: number) => {
    setActiveTab(i)
    setRunKey((k) => k + 1)
    setIntervalKey((k) => k + 1)
    if (!running) setRunning(true)
  }

  const mockups = [
    <ValidationMockup key={`v-${runKey}`} />,
    <IAMockup key={`ia-${runKey}`} />,
    <DelaisMockup key={`d-${runKey}`} />,
    <TasksMockup key={`t-${runKey}`} />,
  ]

  return (
    <section ref={sectionRef} className="py-24 px-6 md:px-4 bg-muted/30">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-12"
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm"
        >
          {/* Tabs */}
          <div className="grid grid-cols-4 border-b border-border">
            {TABS.map((tab, i) => {
              const Icon = tab.icon
              const isActive = activeTab === i
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTab(i)}
                  className={`relative flex flex-col items-center gap-1 py-3 px-2 text-[10px] sm:text-xs font-medium transition-colors ${
                    isActive
                      ? "text-primary bg-primary/5"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="leading-tight text-center">{tab.label.split(" ")[0]}</span>
                  <span className="hidden sm:block leading-tight text-center text-[9px] text-muted-foreground">
                    {tab.label.split(" ").slice(1).join(" ")}
                  </span>
                  {/* Progress bar */}
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-border">
                    {isActive && (
                      <motion.div
                        key={`${i}-${runKey}`}
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{
                          duration: running ? TAB_MS / 1000 : 0.15,
                          ease: "linear",
                        }}
                        style={{ transformOrigin: "left", height: "100%" }}
                        className="bg-primary"
                      />
                    )}
                  </div>
                </button>
              )
            })}
          </div>

          {/* Content */}
          <div className="p-6 min-h-65 flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={`tab-${activeTab}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.22 }}
                className="w-full"
              >
                {mockups[activeTab]}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
