import { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, ArrowLeft, CheckCircle } from "lucide-react"
import { ShareButtons } from "@/components/blog/share-buttons"

export const revalidate = false

export const metadata: Metadata = {
  title: "Assurance décennale, RC Pro, dommages-ouvrage : ce que tout artisan doit savoir",
  description:
    "Quelles assurances sont obligatoires dans le BTP, lesquelles sont facultatives, et que couvrent-elles vraiment ? Le guide complet pour ne pas se retrouver sans filet.",
  openGraph: {
    title:
      "Assurance décennale, RC Pro, dommages-ouvrage : ce que tout artisan doit savoir | Chalto",
    description:
      "Quelles assurances sont obligatoires dans le BTP, lesquelles sont facultatives, et que couvrent-elles vraiment ? Le guide complet pour ne pas se retrouver sans filet.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=1200&q=80&auto=format&fit=crop",
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
            <span className="text-xs text-muted-foreground">30 juin 2026 · 8 min de lecture</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight">
            Assurance décennale, RC Pro, dommages-ouvrage : ce que tout artisan doit savoir
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Dans le BTP, les assurances ne sont pas une formalité administrative. Elles sont la
            seule protection réelle entre un sinistre sur ouvrage et une faillite. Pourtant,
            beaucoup d&apos;artisans ne savent pas précisément ce que couvrent leurs polices — ni ce
            qu&apos;elles ne couvrent pas.
          </p>
        </div>

        {/* Hero image */}
        <div className="rounded-xl overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=1200&q=80&auto=format&fit=crop"
            alt="Documents d'assurance et contrats dans le BTP"
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
              La garantie décennale : obligatoire, incontournable
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Instaurée par l&apos;<strong>article 1792 du Code civil</strong>, la garantie
              décennale couvre pendant <strong>10 ans après la réception des travaux</strong> les
              dommages qui compromettent la solidité de l&apos;ouvrage ou le rendent impropre à sa
              destination.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Elle couvre notamment : la solidité de l&apos;ouvrage, l&apos;impropriété à la
              destination, et les éléments d&apos;équipement indissociables. En revanche, elle ne
              couvre pas les dommages purement esthétiques, l&apos;usure normale, ni les défauts
              d&apos;entretien.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              L&apos;attestation d&apos;assurance décennale doit être fournie avant tout
              commencement de travaux. À défaut, l&apos;artisan s&apos;expose à une amende et à
              l&apos;impossibilité légale de facturer.
            </p>
          </div>

          {/* Section 2 */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">La RC Pro : protéger son activité au quotidien</h2>
            <p className="text-muted-foreground leading-relaxed">
              La Responsabilité Civile Professionnelle couvre les dommages causés aux tiers ou au
              client dans le cadre de votre activité. Elle intervient notamment pour :
            </p>
            <ul className="space-y-3 text-muted-foreground">
              {[
                "Les dommages causés aux tiers pendant le chantier (passants, voisins)",
                "Les dommages matériels chez le client : incendie accidentel, dégât des eaux",
                "Les erreurs professionnelles commises avant réception (mauvais conseil, plan erroné)",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              Attention : la RC Pro ne couvre pas les dommages à l&apos;ouvrage lui-même après
              réception — c&apos;est le rôle de la décennale. Elle n&apos;est pas légalement
              obligatoire, mais quasi-incontournable pour exercer sereinement.
            </p>
          </div>

          {/* Section 3 */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">La dommages-ouvrage : côté maître d&apos;ouvrage</h2>
            <p className="text-muted-foreground leading-relaxed">
              La dommages-ouvrage (DO) est souscrite par le client — le maître d&apos;ouvrage — et
              non par l&apos;artisan. Son rôle est de permettre une{" "}
              <strong>indemnisation rapide sans attendre un jugement sur la responsabilité</strong>.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Elle est <strong>obligatoire pour toute construction neuve</strong> en vertu de
              l&apos;article L.242-1 du Code des assurances. En pratique, de nombreux particuliers
              l&apos;oublient ou la considèrent comme facultative — ce qui peut créer de sérieux
              problèmes pour l&apos;artisan en cas de litige ou de revente du bien.
            </p>
          </div>

          {/* Section 4 */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Les garanties complémentaires à connaître</h2>
            <p className="text-muted-foreground leading-relaxed">
              En plus de la décennale et de la RC Pro, plusieurs garanties légales encadrent votre
              responsabilité après réception :
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  title: "Garantie de parfait achèvement",
                  desc: "1 an après réception. Couvre tous les désordres signalés lors de la réception ou dans l'année qui suit.",
                },
                {
                  title: "Garantie biennale",
                  desc: "2 ans. Couvre les éléments d'équipement dissociables de l'ouvrage (volets, radiateurs, robinetterie...).",
                },
                {
                  title: "Garantie décennale",
                  desc: "10 ans. Couvre les dommages qui compromettent la solidité ou rendent l'ouvrage impropre à sa destination.",
                },
                {
                  title: "Garantie de bon fonctionnement",
                  desc: "2 ans. Parfois confondue avec la biennale — elle porte spécifiquement sur le bon fonctionnement des équipements.",
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
            <h2 className="text-2xl font-bold">Comment choisir son assureur BTP ?</h2>
            <p className="text-muted-foreground leading-relaxed">
              Tous les assureurs ne se valent pas dans le BTP. Voici les critères à évaluer avant de
              signer :
            </p>
            <ul className="space-y-3 text-muted-foreground">
              {[
                "Spécialisation BTP de l'assureur (pas un généraliste)",
                "Franchise adaptée à la taille et au type de votre activité",
                "Couverture mondiale si vous réalisez des travaux à l'étranger",
                "Tarif exprimé en pourcentage du chiffre d'affaires",
                "Attestation délivrable rapidement (avant signature du devis)",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              Comparez au moins 3 devis et méfiez-vous des assureurs low-cost étrangers peu
              solvables — en cas de sinistre important, leur capacité à indemniser peut être
              insuffisante.
            </p>
          </div>

          {/* Section 6 */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Ce que vous devez vérifier avant chaque chantier</h2>
            <p className="text-muted-foreground leading-relaxed">
              Avant de démarrer ou de signer un contrat, prenez l&apos;habitude de vérifier les
              points suivants :
            </p>
            <ol className="space-y-4">
              {[
                {
                  step: "01",
                  title: "Attestation à jour",
                  desc: "Vérifiez que le millésime de l'attestation correspond à l'année en cours.",
                },
                {
                  step: "02",
                  title: "Couverture correspondant à l'activité déclarée",
                  desc: "Une décennale pour maçonnerie ne couvre pas des travaux d'électricité. Vérifiez les codes activité.",
                },
                {
                  step: "03",
                  title: "Attestations de vos sous-traitants",
                  desc: "Vous êtes responsable de vérifier que vos sous-traitants sont eux-mêmes assurés.",
                },
                {
                  step: "04",
                  title: "Mention obligatoire sur le devis",
                  desc: "Indiquez le nom de l'assureur, le numéro de police et les coordonnées pour joindre l'assureur.",
                },
              ].map((item) => (
                <li key={item.step} className="flex items-start gap-4">
                  <span className="text-2xl font-bold text-primary shrink-0">{item.step}</span>
                  <div className="space-y-1">
                    <p className="font-semibold">{item.title}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* CTA */}
        <div className="border rounded-xl p-6 space-y-4 bg-muted/20">
          <h3 className="font-bold text-lg">
            Stockez et partagez vos attestations d&apos;assurance dans Chalto
          </h3>
          <p className="text-sm text-muted-foreground">
            Chalto vous permet de centraliser vos documents réglementaires et de les joindre
            automatiquement à vos devis.
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
          title="Assurance décennale, RC Pro, dommages-ouvrage : ce que tout artisan doit savoir"
          url="https://chalto.fr/blog/assurance-decennale-btp"
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
