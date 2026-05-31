"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { AnimatedLogo } from "@/components/ui/animated-logo"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

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

export function LandingNav() {
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()
  const isLanding = pathname === "/"

  const anchorHref = (id: string) => (isLanding ? `#${id}` : `/#${id}`)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background animate-[navSlideDown_0.45s_ease-out]">
      <div className="max-w-6xl mx-auto px-6 md:px-4 h-18.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AnimatedLogo width={24} height={24} />
          <span className="font-bold">Chalto</span>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
          <a href={anchorHref("features")} className="hover:text-foreground transition-colors">
            Fonctionnalités
          </a>
          <a href={anchorHref("pricing")} className="hover:text-foreground transition-colors">
            Tarifs
          </a>
          <a href={anchorHref("faq")} className="hover:text-foreground transition-colors">
            FAQ
          </a>
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
            <Link href="/register">S&apos;inscrire</Link>
          </Button>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 rounded-md hover:bg-muted transition-colors relative w-9 h-9 flex items-center justify-center"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Menu"
          >
            <span
              className={cn(
                "absolute transition-all duration-150",
                menuOpen ? "opacity-0 rotate-90 scale-75" : "opacity-100 rotate-0 scale-100"
              )}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <line
                  x1="3"
                  y1="6.5"
                  x2="17"
                  y2="6.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <line
                  x1="3"
                  y1="13.5"
                  x2="17"
                  y2="13.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <span
              className={cn(
                "absolute transition-all duration-150",
                !menuOpen ? "opacity-0 -rotate-90 scale-75" : "opacity-100 rotate-0 scale-100"
              )}
            >
              <X className="h-5 w-5" />
            </span>
          </button>
        </div>
      </div>

      {/* Mobile menu — grid-rows trick pour transition smooth sans max-height fixe */}
      <div
        className="md:hidden border-t bg-background/95 backdrop-blur-sm overflow-hidden transition-[grid-template-rows] duration-220 ease-out"
        style={{ display: "grid", gridTemplateRows: menuOpen ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <nav className="flex flex-col px-6 py-4 gap-1">
            {[
              { label: "Fonctionnalités", id: "features" },
              { label: "Tarifs", id: "pricing" },
              { label: "FAQ", id: "faq" },
            ].map((item) =>
              isLanding ? (
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
              ) : (
                <Link
                  key={item.id}
                  href={`/#${item.id}`}
                  onClick={() => setMenuOpen(false)}
                  className="text-left py-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors border-b border-border/50"
                >
                  {item.label}
                </Link>
              )
            )}
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
                <Link href="/register" onClick={() => setMenuOpen(false)}>
                  S&apos;inscrire
                </Link>
              </Button>
            </div>
          </nav>
        </div>
      </div>
    </header>
  )
}
