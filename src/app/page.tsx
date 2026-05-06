import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  ArrowRight,
  CheckCircle,
  FileText,
  Users,
  Shield,
  FolderOpen,
  Sparkles,
} from "lucide-react"
import { WaitlistForm } from "@/components/waitlist-form"
import { AnimatedLogo } from "@/components/ui/animated-logo"
import { LandingNav } from "@/components/landing/landing-nav"
import { LandingAnimatedWord } from "@/components/landing/landing-animated-word"
import { LandingProfessionSection } from "@/components/landing/landing-profession-section"
import { LandingDeviceShowcase } from "@/components/landing/landing-device-showcase"

const SHOW_TESTIMONIALS = false
const SHOW_PRICING = false

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

export default function LandingPage() {
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
        <LandingNav showPricing={SHOW_PRICING} showTestimonials={SHOW_TESTIMONIALS} />

        <main>
          {/* Hero — statique, pas de motion.h1, texte visible immédiatement */}
          <section className="relative pt-32 pb-20 px-6 md:px-4 overflow-hidden">
            {/* Fond décoratif desktop uniquement (blur-3xl coûteux sur mobile) */}
            <div className="absolute inset-0 pointer-events-none hidden md:block">
              <div className="absolute top-20 left-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
              <div className="absolute top-40 right-1/4 w-96 h-96 bg-primary/3 rounded-full blur-3xl" />
            </div>
            <div className="max-w-4xl mx-auto text-center space-y-6 relative">
              {/* Logo flottant — client island, pas LCP */}
              <div className="flex justify-center mb-6">
                <AnimatedLogo width={88} height={88} className="md:hidden" />
                <AnimatedLogo width={112} height={112} className="hidden md:block" />
              </div>
              <div>
                <Badge variant="outline" className="mb-4 hidden md:inline-flex">
                  Pour tous les pros du bâtiment
                </Badge>
              </div>
              {/* H1 — SERVER RENDERED, texte visible au premier paint = LCP element */}
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-tight uppercase">
                <LandingAnimatedWord words={["Piloter", "Organiser", "Maîtriser"]} />
                <br />
                {/* Mobile + tablette : 2 lignes */}
                <span className="xl:hidden">
                  <span className="block text-foreground text-4xl md:text-5xl">
                    votre activité,
                  </span>
                  <span className="block text-foreground text-4xl md:text-5xl">simplement</span>
                </span>
                {/* Desktop : 1 ligne */}
                <span className="hidden xl:inline text-foreground whitespace-nowrap">
                  votre activité, simplement
                </span>
              </h1>
              {/* Subtitle — SERVER RENDERED */}
              <p
                className="text-lg md:text-xl text-muted-foreground mx-auto"
                style={{ maxWidth: "512px" }}
              >
                Ne perdez plus de temps avec les emails, les WhatsApp et les appels de relance.
                <br />
                Chalto centralise tous vos projets, documents et validations client en un seul
                endroit.
              </p>
              {/* CTA buttons — liens statiques, pas de motion */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <Button size="lg" asChild>
                  <a href="#waitlist">
                    Rejoindre la bêta <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/demo">Voir la démo</Link>
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Accès bêta sur invitation · Gratuit · Sans engagement
              </p>
            </div>
          </section>

          {/* Features — statique */}
          <section id="features" className="py-20 px-6 md:px-4 bg-muted/30">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold tracking-tight">Tout ce dont vous avez besoin</h2>
                <p className="text-muted-foreground mt-2">
                  Un outil pensé pour les réalités du terrain
                </p>
              </div>

              {/* Hero feature — Validation client */}
              <style>{`
                @property --hero-angle {
                  syntax: '<angle>';
                  initial-value: 0deg;
                  inherits: false;
                }
                @keyframes hero-border-spin {
                  to { --hero-angle: 360deg; }
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

              {/* Grid features */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
              </div>
            </div>
          </section>

          {/* Profession showcase — client island */}
          <LandingProfessionSection />

          {/* Testimonials */}
          {SHOW_TESTIMONIALS && (
            <section id="testimonials" className="py-20 px-6 md:px-4">
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold tracking-tight">Ils utilisent Chalto</h2>
                  <p className="text-muted-foreground mt-2">
                    Des professionnels qui ont simplifié leur quotidien
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {testimonials.map((t) => (
                    <Card key={t.name} className="h-full">
                      <CardContent className="p-6 space-y-4">
                        <div className="flex gap-1">
                          {Array.from({ length: t.rating }).map((_, i) => (
                            <svg
                              key={i}
                              className="h-4 w-4 fill-primary text-primary"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                            >
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
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
                </div>
              </div>
            </section>
          )}

          {/* Pricing */}
          {SHOW_PRICING && (
            <section id="pricing" className="py-20 px-6 md:px-4 bg-muted/30">
              <div className="max-w-5xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold tracking-tight">
                    Tarifs simples et transparents
                  </h2>
                  <p className="text-muted-foreground mt-2">
                    Commencez gratuitement, évoluez selon vos besoins
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
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
                </div>
              </div>
            </section>
          )}

          {/* Device showcase — client island */}
          <LandingDeviceShowcase />

          {/* FAQ — statique */}
          <section className="py-20 px-6 md:px-4">
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold tracking-tight">Questions fréquentes</h2>
              </div>
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
            </div>
          </section>

          {/* CTA Final — statique */}
          <section className="py-20 px-6 md:px-4">
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
          </section>

          {/* Waitlist — statique wrapper + client form */}
          <section id="waitlist" className="py-20 px-6 md:px-4 bg-muted/30">
            <div className="max-w-md mx-auto">
              <div className="text-center space-y-4 mb-8">
                <Badge variant="outline">🚀 Accès bêta</Badge>
                <h2 className="text-3xl font-bold tracking-tight">Rejoignez les premiers</h2>
                <p className="text-muted-foreground">
                  Chalto est en accès bêta fermé. Inscrivez-vous pour être contacté en priorité.
                </p>
              </div>
              <WaitlistForm />
            </div>
          </section>
        </main>

        {/* Footer — statique */}
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
