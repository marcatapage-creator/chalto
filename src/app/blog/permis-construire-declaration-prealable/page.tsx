import { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, ArrowLeft, CheckCircle } from "lucide-react"
import { ShareButtons } from "@/components/blog/share-buttons"

export const revalidate = false

export const metadata: Metadata = {
  title: "Permis de construire vs déclaration préalable : lequel pour votre projet ?",
  description:
    "Extension, surélévation, véranda, abri de jardin... Selon la surface et la nature des travaux, les règles changent du tout au tout. Le guide pour ne pas se tromper.",
  openGraph: {
    title: "Permis de construire vs déclaration préalable : lequel pour votre projet ? | Chalto",
    description:
      "Extension, surélévation, véranda, abri de jardin... Selon la surface et la nature des travaux, les règles changent du tout au tout. Le guide pour ne pas se tromper.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=1200&q=80&auto=format&fit=crop",
        width: 1200,
        height: 630,
      },
    ],
  },
}

export default function ArticlePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-16 space-y-8">
        {/* Retour */}
        <Link
          href="/blog"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour au blog
        </Link>

        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Badge variant="outline">Réglementation</Badge>
            <span className="text-xs text-muted-foreground">23 juin 2026 · 7 min de lecture</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight">
            Permis de construire vs déclaration préalable : lequel pour votre projet ?
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Avant de déposer une demande d&apos;autorisation d&apos;urbanisme, encore faut-il savoir
            laquelle. Confondre déclaration préalable et permis de construire peut coûter des
            semaines de délai — ou pire, exposer votre client à une démolition forcée.
          </p>
        </div>

        {/* Hero image */}
        <div className="rounded-xl overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=1200&q=80&auto=format&fit=crop"
            alt="Plans de construction et autorisation d'urbanisme"
            width={1200}
            height={630}
            className="w-full object-cover aspect-video"
            priority
          />
        </div>

        {/* Contenu */}
        <div className="space-y-8">
          {/* Section 1 */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">
              Les trois cas possibles : pas d&apos;autorisation, DP, ou PC
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Tout projet de construction ou d&apos;extension ne nécessite pas forcément une
              autorisation administrative. Tout dépend de la surface créée et du contexte
              réglementaire local.
            </p>
            <ul className="space-y-3">
              {[
                {
                  label: "Moins de 5 m² et hauteur inférieure à 12 m",
                  desc: "Aucune formalité requise. C'est la zone de liberté totale.",
                },
                {
                  label: "Entre 5 et 20 m² (ou jusqu'à 40 m² en zone urbaine avec PLU)",
                  desc: "Déclaration préalable de travaux (DP) obligatoire.",
                },
                {
                  label: "Plus de 20 m² (ou plus de 40 m² en zone urbaine couverte par un PLU)",
                  desc: "Permis de construire (PC) obligatoire.",
                },
                {
                  label: "Construction neuve de plus de 150 m²",
                  desc: "Permis de construire obligatoire, et recours à un architecte obligatoire.",
                },
              ].map((item) => (
                <li key={item.label} className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">
                    <strong className="text-foreground">{item.label} :</strong> {item.desc}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Section 2 */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">La déclaration préalable : pour quels travaux ?</h2>
            <p className="text-muted-foreground leading-relaxed">
              La déclaration préalable (DP) concerne une large gamme de travaux courants. Voici les
              cas les plus fréquents en rénovation et extension :
            </p>
            <ul className="space-y-3 text-muted-foreground">
              {[
                "Véranda de moins de 20 m²",
                "Modification de façade : nouvelle fenêtre, changement d'enduit ou de couleur",
                "Changement de destination du local sans travaux importants",
                "Piscine de moins de 100 m²",
                "Clôture ou portail",
                "Abri de jardin entre 5 et 20 m²",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              Le délai d&apos;instruction est de <strong>1 mois</strong> (porté à 2 mois en secteur
              sauvegardé ou zone ABF). Une fois accordée, la DP doit être affichée sur le terrain
              pendant 2 mois pour purger les délais de recours des tiers.
            </p>
          </div>

          {/* Section 3 */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Le permis de construire : pour quels travaux ?</h2>
            <p className="text-muted-foreground leading-relaxed">
              Le permis de construire (PC) est requis pour les travaux plus conséquents. Il concerne
              notamment :
            </p>
            <ul className="space-y-3 text-muted-foreground">
              {[
                "Extension de plus de 20 m² (ou plus de 40 m² en zone urbaine couverte par un PLU)",
                "Construction neuve, quelle que soit la surface",
                "Surélévation importante d'un bâtiment existant",
                "Changement de destination avec travaux significatifs",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              Le délai d&apos;instruction est de <strong>2 mois</strong> pour une maison
              individuelle, <strong>3 mois</strong> pour les autres constructions. Après affichage
              du permis sur le terrain, les tiers disposent de 2 mois pour exercer un recours.
            </p>
          </div>

          {/* Section 4 */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Les pièges à éviter</h2>
            <p className="text-muted-foreground leading-relaxed">
              Plusieurs situations peuvent compliquer ou rallonger la procédure si elles ne sont pas
              anticipées dès la phase de conception :
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  title: "Zone protégée (ABF)",
                  desc: "La présence d'un Architecte des Bâtiments de France ajoute 1 mois supplémentaire au délai d'instruction.",
                },
                {
                  title: "PLU restrictif",
                  desc: "Vérifiez impérativement le règlement de zone (emprise au sol, hauteur, aspect extérieur) avant de concevoir le projet.",
                },
                {
                  title: "Travaux sans autorisation",
                  desc: "Risque d'infraction au Code de l'urbanisme jusqu'à 5 ans après les travaux. La démolition peut être ordonnée par le juge.",
                },
                {
                  title: "Assurance dommages-ouvrage",
                  desc: "Un assureur peut refuser d'assurer un ouvrage réalisé sans autorisation préalable régulière.",
                },
              ].map((item) => (
                <div key={item.title} className="p-4 border rounded-xl space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                    <p className="font-semibold text-sm">{item.title}</p>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 5 */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Qui peut déposer le dossier ?</h2>
            <p className="text-muted-foreground leading-relaxed">
              Le dépôt d&apos;une demande d&apos;autorisation d&apos;urbanisme peut être effectué
              par :
            </p>
            <ul className="space-y-3 text-muted-foreground">
              {[
                "Le propriétaire du terrain ou de la construction",
                "Un mandataire (artisan, architecte) disposant d'un pouvoir écrit du propriétaire",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              Le dépôt peut se faire <strong>en ligne</strong> via le Géoportail de l&apos;urbanisme
              ou <strong>en mairie</strong> en version papier. Les pièces généralement requises sont
              : le formulaire CERFA, un plan de masse, un plan de situation, des photographies du
              terrain et une notice descriptive des travaux.
            </p>
          </div>

          {/* Section 6 */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">
              Que faire si votre client n&apos;a pas encore l&apos;autorisation ?
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              En tant que professionnel du BTP, vous êtes en première ligne si un chantier démarre
              sans autorisation valide. Quelques règles à respecter absolument :
            </p>
            <ul className="space-y-3">
              {[
                {
                  label: "Ne jamais démarrer sans autorisation affichée",
                  desc: "Le panneau de chantier doit être visible de la voie publique avant tout commencement de travaux.",
                },
                {
                  label: "Prévoir une clause suspensive dans le devis",
                  desc: "Conditionnez le démarrage des travaux à l'obtention et à l'affichage de l'autorisation.",
                },
                {
                  label: "Intégrer les délais réglementaires dans le planning",
                  desc: "Un permis de construire peut prendre 3 à 5 mois entre le dépôt et le démarrage des travaux. Anticipez.",
                },
              ].map((item) => (
                <li key={item.label} className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">
                    <strong className="text-foreground">{item.label} :</strong> {item.desc}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* CTA */}
        <div className="border rounded-xl p-6 space-y-4 bg-muted/20">
          <h3 className="font-bold text-lg">
            Suivez l&apos;avancement administratif de vos projets dans Chalto
          </h3>
          <p className="text-sm text-muted-foreground">
            Chalto vous permet de lier les autorisations d&apos;urbanisme à vos projets et de suivre
            leur statut en temps réel.
          </p>
          <Button asChild>
            <Link href="/#waitlist">
              Essayer gratuitement
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Partager */}
        <ShareButtons
          title="Permis de construire vs déclaration préalable : lequel pour votre projet ?"
          url="https://chalto.fr/blog/permis-construire-declaration-prealable"
        />

        {/* Navigation */}
        <div className="border-t pt-8">
          <Link
            href="/blog"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Voir tous les articles
          </Link>
        </div>
      </div>
    </div>
  )
}
