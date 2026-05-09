"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { AnimatedLogo } from "@/components/ui/animated-logo"
import { Menu, X } from "lucide-react"

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

interface LandingNavProps {
  showPricing: boolean
  showTestimonials: boolean
}

export function LandingNav({ showPricing, showTestimonials }: LandingNavProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur-sm"
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="max-w-6xl mx-auto px-6 md:px-4 h-18.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AnimatedLogo width={24} height={24} />
          <span className="font-bold">Chalto</span>
        </div>
        <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition-colors">
            Fonctionnalités
          </a>
          {showPricing && (
            <a href="#pricing" className="hover:text-foreground transition-colors">
              Tarifs
            </a>
          )}
          {showTestimonials && (
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
                  if (item.id === "pricing" && !showPricing) return false
                  if (item.id === "testimonials" && !showTestimonials) return false
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
  )
}
