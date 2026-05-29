import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const guarantees = [
  "14 jours d'essai gratuit",
  "Sans carte bancaire",
  "Annulation en 1 clic",
  "Onboarding en 5 minutes",
]

export function LandingCtaSection() {
  return (
    <section className="py-24 px-6 md:px-4 bg-primary dark:bg-muted/40 text-primary-foreground dark:text-foreground text-center">
      <div className="max-w-2xl mx-auto">
        <p className="text-xs font-semibold tracking-widest uppercase text-primary-foreground/50 dark:text-muted-foreground mb-6">
          Prêt ?
        </p>
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-5">
          Commencez à travailler
          <br />
          <em className="not-italic text-primary-foreground/80 dark:text-primary">
            autrement
          </em>{" "}
          aujourd&apos;hui
        </h2>
        <p className="text-primary-foreground/65 dark:text-muted-foreground text-lg font-light leading-relaxed mb-10 max-w-md mx-auto">
          Rejoignez les professionnels qui ont repris le contrôle de leur activité. Aucune CB. Aucun
          engagement.
        </p>

        <Button
          size="lg"
          asChild
          className="bg-background text-foreground hover:bg-background/90 dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90 font-semibold px-8"
        >
          <Link href="/register">
            Créer mon compte gratuitement
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>

        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 mt-8">
          {guarantees.map((g) => (
            <span
              key={g}
              className="flex items-center gap-2 text-sm text-primary-foreground/55 dark:text-muted-foreground"
            >
              <span className="text-green-300 dark:text-primary">✓</span>
              {g}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
