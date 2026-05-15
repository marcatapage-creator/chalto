import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function LandingFounderSection() {
  return (
    <section className="py-20 px-6 md:px-4 bg-primary/5">
      <div className="max-w-2xl mx-auto">
        <div className="flex flex-col gap-6">
          {/* Intro */}
          <p className="text-2xl font-semibold text-foreground leading-snug">
            👋 Je suis Marc, fondateur de Chalto.
          </p>

          {/* Body */}
          <div className="flex flex-col gap-4 text-base text-muted-foreground leading-relaxed">
            <p>
              J&apos;ai construit Chalto avec des architectes. Chaque feature vient d&apos;un vrai
              problème terrain.
            </p>
            <p>
              Vous êtes architecte indépendant ou petite structure ?{" "}
              <span className="text-foreground font-medium">
                Je vous offre un accès complet en échange de votre retour honnête.
              </span>
            </p>
          </div>

          {/* CTA */}
          <div className="pt-2">
            <Button asChild>
              <a href="mailto:marc@chalto.fr">
                Me contacter directement <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
