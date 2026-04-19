"use client"

import { useRef, useState, useEffect } from "react"
import { motion, useInView, AnimatePresence } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"
import { AnimatedLogo } from "@/components/ui/animated-logo"
import { WaitlistForm } from "@/components/waitlist-form"
import {
  CheckCircle,
  FileText,
  Users,
  Zap,
  Shield,
  Star,
  ArrowRight,
  FolderOpen,
  Menu,
  X,
} from "lucide-react"

function AnimatedWord({ words }: { words: string[] }) {
  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % words.length)
        setVisible(true)
      }, 300)
    }, 1800)

    return () => clearInterval(interval)
  }, [words])

  return (
    <span
      className="text-primary inline-block transition-all duration-300 text-4xl md:text-6xl"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(-8px)",
      }}
    >
      {words[index]}
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
    icon: FileText,
    title: "Documents professionnels",
    description:
      "Créez et gérez vos CCTP, notices, devis et comptes-rendus depuis une interface simple.",
  },
  {
    icon: CheckCircle,
    title: "Validation client en 1 clic",
    description:
      "Envoyez un lien sécurisé à votre client. Il approuve ou commente sans avoir de compte.",
  },
  {
    icon: Users,
    title: "Coordination des intervenants",
    description:
      "Ajoutez plombiers, électriciens et autres corps de métier à vos projets facilement.",
  },
  {
    icon: Zap,
    title: "Multi-métiers",
    description:
      "Architecte, plombier, électricien — Chalto s'adapte à votre métier et vos documents.",
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
              <a href="#pricing" className="hover:text-foreground transition-colors">
                Tarifs
              </a>
              <a href="#testimonials" className="hover:text-foreground transition-colors">
                Témoignages
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
                  ].map((item) => (
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
              <AnimatedWord
                words={["Créer", "Organiser", "Partager", "Commenter", "Valider", "Avancer"]}
              />
              <br />
              {/* Mobile : 3 lignes */}
              <span className="md:hidden">
                <span className="block text-foreground text-4xl">vos projets,</span>
                <span className="block text-foreground text-4xl">simplement</span>
              </span>
              {/* Desktop : 1 ligne */}
              <span className="hidden md:inline text-foreground whitespace-nowrap md:text-6xl">
                vos projets, simplement
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
              <Button size="lg" asChild className="group">
                <a href="#waitlist">
                  Rejoindre la bêta
                  <motion.span
                    className="md:hidden ml-2"
                    animate={{ x: [0, 4, 0] }}
                    transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
                  >
                    <ArrowRight className="h-4 w-4" />
                  </motion.span>
                  <ArrowRight className="hidden md:inline ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </a>
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

            <StaggerGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature) => {
                const Icon = feature.icon
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

        {/* Testimonials */}
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

        {/* Pricing */}
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
                  <Card className={`h-full ${plan.highlighted ? "border-primary shadow-lg" : ""}`}>
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
              ))}
            </StaggerGrid>
          </div>
        </section>

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
            <div className="flex gap-6">
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
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}
