import Link from "next/link"
import Image from "next/image"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { AnimatedLogo } from "@/components/ui/animated-logo"
import { LandingNav } from "@/components/landing/landing-nav"
import { LandingCounterHours } from "@/components/landing/landing-counter-hours"
// Tout ce qui est below-fold est en dynamic import → framer-motion hors du bundle critique
const LandingScreenshotsSection = dynamic(() =>
  import("@/components/landing/landing-screenshots-section").then((m) => ({
    default: m.LandingScreenshotsSection,
  }))
)
const LandingPainSection = dynamic(() =>
  import("@/components/landing/landing-pain-section").then((m) => ({
    default: m.LandingPainSection,
  }))
)
const LandingFeaturesSection = dynamic(() =>
  import("@/components/landing/landing-features-section").then((m) => ({
    default: m.LandingFeaturesSection,
  }))
)
const LandingRolesSection = dynamic(() =>
  import("@/components/landing/landing-roles-section").then((m) => ({
    default: m.LandingRolesSection,
  }))
)
const LandingPricingSection = dynamic(() =>
  import("@/components/landing/landing-pricing-section").then((m) => ({
    default: m.LandingPricingSection,
  }))
)
const LandingCtaSection = dynamic(() =>
  import("@/components/landing/landing-cta-section").then((m) => ({ default: m.LandingCtaSection }))
)
const LandingFaqSection = dynamic(() =>
  import("@/components/landing/landing-faq-section").then((m) => ({ default: m.LandingFaqSection }))
)
const LandingLegalDialogs = dynamic(() =>
  import("@/components/landing/landing-legal-dialogs").then((m) => ({
    default: m.LandingLegalDialogs,
  }))
)

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Quelle est la différence entre Starter et Solo ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Le plan Starter est gratuit avec 1 projet et 3 documents IA/mois. Le plan Solo à 29€/mois offre projets illimités, IA illimitée, validations automatiques et alertes. 14 jours offerts sans carte bancaire.",
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
        text: "Oui. Chalto utilise Supabase avec Row Level Security, HTTPS et des tokens sécurisés pour protéger toutes vos données et documents. Hébergé en Europe.",
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
  description:
    "Plateforme de gestion de projets pour les professionnels du bâtiment — architectes, artisans, entrepreneurs.",
  url: "https://chalto.fr",
  offers: [
    { "@type": "Offer", name: "Starter", price: "0", priceCurrency: "EUR" },
    {
      "@type": "Offer",
      name: "Solo",
      price: "29",
      priceCurrency: "EUR",
      billingDuration: "P1M",
    },
  ],
}

export default function LandingPage() {
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
        <LandingNav />

        <main>
          {/* ── HERO ── bg-background */}
          <section className="relative pt-32 pb-20 px-6 md:px-4 overflow-hidden bg-background text-foreground">
            <div className="absolute inset-0 pointer-events-none hidden md:block">
              <div className="absolute top-20 left-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
              <div className="absolute top-40 right-1/4 w-96 h-96 bg-primary/3 rounded-full blur-3xl" />
            </div>
            <div className="max-w-4xl mx-auto text-center space-y-6 relative">
              <div className="flex justify-center mb-10">
                <AnimatedLogo width={75} height={75} className="md:hidden" />
                <AnimatedLogo width={95} height={95} className="hidden md:block" />
              </div>
              <h1 className="font-bold tracking-tight leading-[1.05]">
                <span className="inline-flex items-center gap-3 text-primary text-4xl md:text-6xl xl:text-7xl uppercase tracking-tight">
                  <span>
                    <LandingCounterHours />H
                  </span>
                  <span>/</span>
                  <span>SEMAINE</span>
                </span>
                <span className="block text-2xl md:text-4xl text-muted-foreground font-medium mt-3">
                  économisées grâce à l&apos;IA.
                </span>
              </h1>
              <p
                className="text-lg md:text-xl text-muted-foreground mx-auto"
                style={{ maxWidth: "560px" }}
              >
                Chalto centralise vos échanges clients, automatise vos validations et rédige à votre
                place. Conçu pour les architectes, les indépendants et les petites agences du BTP.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <Button size="lg" asChild>
                  <Link href="/register">
                    Commencer gratuitement <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <a href="#features">Voir les fonctionnalités</a>
                </Button>
              </div>
              <p className="text-xs text-muted-foreground flex items-center justify-center gap-3 flex-wrap">
                <span>✓ 14 jours gratuits</span>
                <span>✓ Sans carte bancaire</span>
                <span>✓ Annulation en 1 clic</span>
              </p>
            </div>
          </section>

          {/* ── SCREENSHOTS ── bg-muted/30 */}
          <LandingScreenshotsSection />

          {/* ── DOULEUR ── bg-primary */}
          <LandingPainSection />

          {/* ── FEATURES ── bg-background */}
          <LandingFeaturesSection />

          {/* ── RÔLES ── bg-primary */}
          <LandingRolesSection />

          {/* ── PRICING ── bg-background */}
          <LandingPricingSection />

          {/* ── FAQ ── bg-muted/30 */}
          <div className="bg-muted/30">
            <LandingFaqSection />
          </div>

          {/* ── CTA FINAL ── bg-primary */}
          <LandingCtaSection />
        </main>

        {/* ── FOOTER ── */}
        <footer className="border-t pt-12 pb-6 px-6 md:px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pb-10">
              {/* Colonne 1 — Marque */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Image src="/Logo.svg" alt="Chalto" width={24} height={24} />
                  <span className="font-semibold text-foreground text-base">Chalto</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  L&apos;outil de gestion de projets pensé pour les architectes et artisans du BTP.
                  Validations client, coordination prestataires, traçabilité des décisions — tout au
                  même endroit.
                </p>
                <div className="flex items-center gap-3 pt-1">
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

              {/* Colonne 2 — Plateforme */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground">Plateforme</h3>
                <ul className="space-y-2.5 text-sm text-muted-foreground">
                  <li>
                    <a href="#features" className="hover:text-foreground transition-colors">
                      Fonctionnalités
                    </a>
                  </li>
                  <li>
                    <a href="#pricing" className="hover:text-foreground transition-colors">
                      Tarifs
                    </a>
                  </li>
                  <li>
                    <a href="#faq" className="hover:text-foreground transition-colors">
                      FAQ
                    </a>
                  </li>
                  <li>
                    <Link href="/blog" className="hover:text-foreground transition-colors">
                      Blog
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Colonne 3 — Contact & légal */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground">Contact & légal</h3>
                <ul className="space-y-2.5 text-sm text-muted-foreground">
                  <li>
                    <a
                      href="mailto:marc@chalto.fr"
                      className="hover:text-foreground transition-colors"
                    >
                      marc@chalto.fr
                    </a>
                  </li>
                  <li>
                    <Link href="/blog" className="hover:text-foreground transition-colors">
                      Blog
                    </Link>
                  </li>
                  <LandingLegalDialogs />
                </ul>
              </div>
            </div>

            <div className="border-t pt-6 text-center text-xs text-muted-foreground">
              © 2026 Chalto — Tous droits réservés
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}
