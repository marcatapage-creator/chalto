"use client"

import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"

const tabs = [
  {
    id: "architecte",
    label: "Architecte",
    src: "/screenshots/architecte.png",
    legend:
      "L'architecte voit tout. Il soumet, valide, alerte, coordonne — depuis son bureau ou sur le chantier.",
  },
  {
    id: "client",
    label: "Client",
    src: "/screenshots/client.png",
    legend: "Le client valide en 1 clic. Sans compte. Sans formation. Depuis son téléphone.",
  },
  {
    id: "prestataire",
    label: "Prestataire",
    src: "/screenshots/prestataire.png",
    legend:
      "Le prestataire voit ses tâches. Il déclare son avancement. Il reçoit les validations. Rien de plus.",
  },
]

function PhoneFrame({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative mx-auto" style={{ width: 260 }}>
      {/* Outer shell */}
      <div
        className="relative rounded-[44px] p-0.75 shadow-2xl"
        style={{ background: "linear-gradient(145deg, #d0d0d0, #a0a0a0)" }}
      >
        {/* Inner bezel */}
        <div className="rounded-[41px] overflow-hidden bg-black">
          {/* Screenshot */}
          <div className="relative w-full" style={{ aspectRatio: "9/19.5" }}>
            <Image src={src} alt={alt} fill className="object-cover object-top" sizes="260px" />
          </div>
        </div>
      </div>
      {/* Bottom shadow */}
      <div
        className="absolute -bottom-6 left-1/2 -translate-x-1/2 rounded-full blur-xl opacity-30 dark:opacity-20"
        style={{ width: 200, height: 24, background: "#000" }}
      />
    </div>
  )
}

export function LandingScreenshotsSection() {
  const [active, setActive] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)

  return (
    <section id="screenshots" className="py-20 px-6 md:px-4 bg-muted/30">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight">Chalto en action</h2>
          <p className="text-muted-foreground mt-2">
            Trois espaces dédiés. Un seul projet. Tout le monde au même endroit.
          </p>
        </div>

        {/* ── DESKTOP : tabs + screenshot ── */}
        <div className="hidden md:block">
          {/* Tab bar */}
          <div className="flex justify-center gap-0 mb-10">
            {tabs.map((tab, i) => (
              <button
                key={tab.id}
                onClick={() => setActive(i)}
                className="relative px-8 py-3 text-sm font-medium transition-colors"
                style={{ color: active === i ? "hsl(224 79% 52%)" : undefined }}
              >
                <span className={active === i ? "" : "text-muted-foreground"}>{tab.label}</span>
                {active === i && (
                  <motion.div
                    layoutId="tab-underline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Screenshot + legend */}
          <div className="flex flex-col items-center gap-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <PhoneFrame src={tabs[active].src} alt={tabs[active].label} />
              </motion.div>
            </AnimatePresence>
            <AnimatePresence mode="wait">
              <motion.p
                key={active}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="text-center text-sm text-muted-foreground max-w-sm"
              >
                {tabs[active].legend}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>

        {/* ── MOBILE : horizontal swipe carousel ── */}
        <div className="md:hidden">
          <div
            ref={scrollRef}
            className="flex gap-8 overflow-x-auto snap-x snap-mandatory pb-6 scrollbar-hide"
            style={{ scrollbarWidth: "none" }}
          >
            {tabs.map((tab) => (
              <div
                key={tab.id}
                className="shrink-0 snap-center flex flex-col items-center gap-5"
                style={{ width: "80vw" }}
              >
                <PhoneFrame src={tab.src} alt={tab.label} />
                <div className="text-center px-2">
                  <p className="text-sm font-semibold text-foreground mb-1">{tab.label}</p>
                  <p className="text-sm text-muted-foreground">{tab.legend}</p>
                </div>
              </div>
            ))}
          </div>
          {/* Scroll hint dots */}
          <div className="flex justify-center gap-2 mt-2">
            {tabs.map((tab) => (
              <div key={tab.id} className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
