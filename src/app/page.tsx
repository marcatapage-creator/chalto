import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  Building2,
  CheckCircle,
  FileText,
  Users,
  Zap,
  Shield,
  Star,
  ArrowRight,
  FolderOpen,
} from "lucide-react"
import { FadeIn, StaggerList, StaggerItem } from "@/components/ui/motion"

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
    href: "/register",
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
    href: "/register",
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
    href: "/register",
    highlighted: false,
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary rounded-lg p-1.5">
              <Building2 className="h-4 w-4 text-primary-foreground" />
            </div>
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
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Connexion</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/register">Commencer</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <FadeIn>
            <Badge variant="outline" className="mb-4">
              🏗️ Pour tous les pros du bâtiment
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
              Faites valider vos projets <span className="text-primary">simplement</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mt-4">
              Chalto permet aux architectes, artisans et entrepreneurs de gérer leurs projets,
              générer leurs documents et obtenir la validation de leurs clients en quelques clics.
            </p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
              <Button size="lg" asChild>
                <Link href="/register">
                  Commencer gratuitement
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/login">Voir une démo</Link>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Gratuit · Sans carte bancaire · Prêt en 2 minutes
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <FadeIn>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight">Tout ce dont vous avez besoin</h2>
              <p className="text-muted-foreground mt-2">
                Un outil pensé pour les réalités du terrain
              </p>
            </div>
          </FadeIn>
          <StaggerList className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <StaggerItem key={feature.title}>
                  <Card className="h-full hover:border-primary/50 transition-colors duration-200">
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
                </StaggerItem>
              )
            })}
          </StaggerList>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <FadeIn>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight">Ils utilisent Chalto</h2>
              <p className="text-muted-foreground mt-2">
                Des professionnels du bâtiment qui ont simplifié leur quotidien
              </p>
            </div>
          </FadeIn>
          <StaggerList className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <StaggerItem key={t.name}>
                <Card className="h-full">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex gap-1">
                      {Array.from({ length: t.rating }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{`"${t.content}"`}</p>
                    <div>
                      <p className="font-medium text-sm">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  </CardContent>
                </Card>
              </StaggerItem>
            ))}
          </StaggerList>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight">Tarifs simples et transparents</h2>
              <p className="text-muted-foreground mt-2">
                Commencez gratuitement, évoluez selon vos besoins
              </p>
            </div>
          </FadeIn>
          <StaggerList className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <StaggerItem key={plan.name} className="h-full">
                <Card className={`h-full ${plan.highlighted ? "border-primary shadow-lg" : ""}`}>
                  <CardContent className={`p-6 space-y-6 ${plan.highlighted ? "pt-4" : ""}`}>
                    {plan.highlighted && (
                      <div className="flex justify-center">
                        <Badge className="bg-primary text-primary-foreground">Populaire</Badge>
                      </div>
                    )}
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
                      <Link href={plan.href}>{plan.cta}</Link>
                    </Button>
                  </CardContent>
                </Card>
              </StaggerItem>
            ))}
          </StaggerList>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <FadeIn>
            <h2 className="text-3xl font-bold tracking-tight">
              Prêt à simplifier votre activité ?
            </h2>
            <p className="text-muted-foreground">
              Rejoignez les professionnels du bâtiment qui font confiance à Chalto
            </p>
            <Button size="lg" asChild className="mt-4">
              <Link href="/register">
                Commencer gratuitement
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </FadeIn>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="bg-primary rounded-lg p-1">
              <Building2 className="h-3 w-3 text-primary-foreground" />
            </div>
            <span className="font-medium text-foreground">Chalto</span>
            <span>— La plateforme des pros du bâtiment</span>
          </div>
          <div className="flex gap-6">
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
  )
}
