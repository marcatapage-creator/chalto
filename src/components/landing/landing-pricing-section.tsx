import Link from "next/link"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const plans = [
  {
    name: "Starter",
    price: "0",
    period: "Pour tester sans risque",
    features: [
      "1 projet actif",
      "3 documents générés par IA / mois",
      "Gestion documentaire",
      "Interface mobile optimisée",
    ],
    cta: "Commencer gratuitement",
    href: "/register",
    note: "Aucune CB requise",
    featured: false,
  },
  {
    name: "Solo",
    price: "29",
    period: "/mois · sans engagement",
    features: [
      "Projets illimités",
      "IA illimitée — CCTP, CR chantier, relances",
      "Validations automatiques",
      "Tous les rôles (Client, Prestataire)",
      "Dossiers administratifs + alertes",
      "Export DOCX",
      "Support 5j/7",
    ],
    cta: "Essayer 14 jours gratuits",
    href: "/register",
    note: "Sans CB · Annulation 1 clic",
    featured: true,
    badge: "Le plus populaire",
  },
  {
    name: "Équipe",
    price: "99",
    period: "/mois · jusqu'à 5 utilisateurs",
    features: [
      "Tout Solo inclus",
      "5 comptes utilisateurs",
      "Espace collaboratif partagé",
      "Accès anticipé aux nouvelles fonctionnalités",
      "Support prioritaire",
    ],
    cta: "Nous contacter",
    href: "mailto:marc@chalto.fr",
    note: "vs 145€ avec 5 plans Solo",
    featured: false,
  },
]

export function LandingPricingSection() {
  return (
    <section id="pricing" className="py-24 px-6 md:px-4 bg-background">
      <div className="max-w-5xl mx-auto">
        <div className="mb-14">
          <p className="text-xs font-semibold tracking-widest uppercase text-primary mb-4">
            Tarifs
          </p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Simple. Transparent.
            <br />
            Sans surprise.
          </h2>
          <p className="text-muted-foreground max-w-lg text-lg font-light leading-relaxed">
            Commencez gratuitement. Passez au payant quand Chalto vous a convaincu — et pas avant.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                "relative rounded-2xl border p-8 flex flex-col gap-6",
                plan.featured
                  ? "bg-foreground text-background border-foreground"
                  : "bg-card border-border"
              )}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground text-xs font-semibold px-4 py-1 rounded-full whitespace-nowrap">
                    {plan.badge}
                  </span>
                </div>
              )}

              <div>
                <p
                  className={cn(
                    "text-xs font-semibold tracking-widest uppercase mb-4",
                    plan.featured ? "text-background/50" : "text-muted-foreground"
                  )}
                >
                  {plan.name}
                </p>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-4xl font-bold tracking-tight">{plan.price}</span>
                  {plan.price !== "0" && (
                    <span
                      className={cn(
                        "text-sm",
                        plan.featured ? "text-background/60" : "text-muted-foreground"
                      )}
                    >
                      €
                    </span>
                  )}
                  {plan.price === "0" && (
                    <span
                      className={cn(
                        "text-sm",
                        plan.featured ? "text-background/60" : "text-muted-foreground"
                      )}
                    >
                      €
                    </span>
                  )}
                </div>
                <p
                  className={cn(
                    "text-sm",
                    plan.featured ? "text-background/50" : "text-muted-foreground"
                  )}
                >
                  {plan.period}
                </p>
              </div>

              <div className={cn("h-px", plan.featured ? "bg-background/10" : "bg-border")} />

              <ul className="flex flex-col gap-3 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm leading-relaxed">
                    <Check
                      className={cn(
                        "h-4 w-4 shrink-0 mt-0.5",
                        plan.featured ? "text-primary" : "text-primary"
                      )}
                    />
                    <span
                      className={plan.featured ? "text-background/80" : "text-muted-foreground"}
                    >
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-col gap-2">
                {plan.featured ? (
                  <Button
                    asChild
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    <Link href={plan.href}>{plan.cta}</Link>
                  </Button>
                ) : plan.href.startsWith("mailto") ? (
                  <Button asChild variant="outline" className="w-full">
                    <a href={plan.href}>{plan.cta}</a>
                  </Button>
                ) : (
                  <Button asChild variant="outline" className="w-full">
                    <Link href={plan.href}>{plan.cta}</Link>
                  </Button>
                )}
                <p
                  className={cn(
                    "text-xs text-center",
                    plan.featured ? "text-background/40" : "text-muted-foreground"
                  )}
                >
                  {plan.note}
                </p>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-12">
          Vous avez plus de 5 personnes dans votre agence ?{" "}
          <a href="mailto:marc@chalto.fr" className="text-primary font-medium hover:underline">
            Parlons-en →
          </a>
        </p>
      </div>
    </section>
  )
}
