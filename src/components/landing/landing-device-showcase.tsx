"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence, useInView } from "framer-motion"
import { Monitor, Tablet, Smartphone } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTheme } from "@/components/theme-provider"
import { useMediaQuery } from "@/hooks/use-media-query"

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
        suppressHydrationWarning
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
        suppressHydrationWarning
        src={`/screenshots/${device}-${theme}.png`}
        alt={`Chalto sur ${DEVICES[device].label}`}
        className="w-full h-auto rounded-sm"
        draggable={false}
      />
    </div>
  )
}

function AnimateIn({ children }: { children: React.ReactNode }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })

  const variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
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

export function LandingDeviceShowcase() {
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
