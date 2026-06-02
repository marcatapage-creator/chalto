import { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, ArrowLeft, CheckCircle } from "lucide-react"
import { ShareButtons } from "@/components/blog/share-buttons"

export const revalidate = false

export const metadata: Metadata = {
  title: "Comment rédiger un devis de travaux qui protège l'artisan ?",
  description:
    "Les mentions obligatoires, les erreurs à éviter et les clauses essentielles pour rédiger un devis de travaux solide et sans litige.",
  openGraph: {
    title: "Comment rédiger un devis de travaux qui protège l'artisan ? | Chalto",
    description:
      "Les mentions obligatoires, les erreurs à éviter et les clauses essentielles pour rédiger un devis de travaux solide et sans litige.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=1200&q=80&auto=format&fit=crop",
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
            <Badge variant="outline">Facturation</Badge>
            <span className="text-xs text-muted-foreground">2 juin 2026 · 7 min de lecture</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight">
            Comment rédiger un devis de travaux qui protège l&apos;artisan ?
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Le devis est souvent perçu comme une simple formalité. C&apos;est une erreur. Un devis
            mal rédigé peut vous coûter bien plus que la marge du chantier : il peut vous exposer à
            des travaux supplémentaires non facturables, à des litiges en réception, voire à une
            mise en cause de votre responsabilité.
          </p>
        </div>

        {/* Hero image */}
        <div className="rounded-xl overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=1200&q=80&auto=format&fit=crop"
            alt="Rédaction d'un devis de travaux"
            width={1200}
            height={630}
            className="w-full object-cover aspect-video"
            priority
          />
        </div>

        {/* Contenu */}
        <div className="space-y-8">
          {/* Mentions obligatoires */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">
              Les mentions obligatoires d&apos;un devis artisan
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Un devis n&apos;est pas un simple document commercial : c&apos;est un acte
              pré-contractuel qui engage votre responsabilité. Pour être valide et vous protéger, il
              doit comporter un certain nombre de mentions incontournables.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  title: "Identification complète",
                  desc: "Date du devis, numéro unique, vos coordonnées complètes (nom, adresse, téléphone, email) et votre numéro SIRET.",
                },
                {
                  title: "Coordonnées du client",
                  desc: "Nom, adresse de facturation et adresse du chantier si différente. Indispensable en cas de litige.",
                },
                {
                  title: "Désignation précise des travaux",
                  desc: "Description détaillée de chaque prestation : matériaux, quantités, unités, main-d'œuvre. Le flou coûte cher.",
                },
                {
                  title: "Prix HT, TVA et TTC",
                  desc: "Taux de TVA applicable : 5,5% pour la rénovation énergétique, 10% pour les travaux de rénovation, 20% pour le neuf.",
                },
                {
                  title: "Délai d'exécution",
                  desc: "Date de début prévisionnelle et durée estimée du chantier. Mention des conditions suspensives si besoin.",
                },
                {
                  title: "Durée de validité et assurance",
                  desc: "Validité de l'offre (généralement 3 mois) et références de votre assurance décennale : numéro de police et nom de l'assureur.",
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

          {/* Désignation des travaux */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">
              La désignation des travaux : l&apos;erreur la plus coûteuse
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              C&apos;est là que se joue l&apos;essentiel. Une désignation vague vous oblige à
              fournir bien plus que ce que vous avez chiffré, sans pouvoir facturer le surplus. La
              règle est simple : tout ce qui n&apos;est pas explicitement exclu est considéré comme
              inclus dans le prix.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Comparez ces deux formulations pour une même prestation :
            </p>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-3">
                <span className="text-destructive font-bold shrink-0">✗</span>
                <span>
                  <strong className="text-foreground">Formulation vague :</strong> &laquo;&nbsp;Pose
                  de carrelage dans la cuisine — 1 200&nbsp;€&nbsp;&raquo;. Quelle surface ? Quel
                  carrelage ? Avec ou sans ragréage ? Sans joints époxy ?
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold shrink-0">✓</span>
                <span>
                  <strong className="text-foreground">Formulation précise :</strong>{" "}
                  &laquo;&nbsp;Fourniture et pose de carrelage grès cérame 60×60, réf. Grespania
                  Coverlam Cement Dark, 45&nbsp;m², compris ragréage autolissant (épaisseur
                  10&nbsp;mm), colle flexible, joints époxy couleur sable — 1
                  200&nbsp;€&nbsp;&raquo;. Tout ce qui sort de ce cadre est facturable.
                </span>
              </li>
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              La précision n&apos;est pas une contrainte administrative : c&apos;est votre
              protection financière. Elle élimine aussi les incompréhensions client avant même que
              le chantier ne commence.
            </p>
          </div>

          {/* Clauses protectrices */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Les clauses qui protègent l&apos;artisan</h2>
            <p className="text-muted-foreground leading-relaxed">
              Au-delà des mentions obligatoires, un devis solide intègre des clauses spécifiques qui
              sécurisent votre position en cas de désaccord. Ces clauses doivent figurer dans les
              conditions générales ou en bas du devis, et être portées à la connaissance du client
              avant signature.
            </p>
            <ol className="space-y-4">
              {[
                {
                  step: "01",
                  title: "Clause de révision de prix",
                  desc: "Si le chantier démarre plus de 3 mois après l'établissement du devis, vous vous réservez le droit de réévaluer les prix en fonction de l'évolution des coûts matériaux (indice BT01 ou BT de référence). Indispensable en période d'inflation.",
                },
                {
                  step: "02",
                  title: "Clause sur les travaux imprévus",
                  desc: "Toute découverte en cours de chantier (structure dégradée, amiante, humidité) non visible lors de la visite préalable fera l'objet d'un avenant chiffré avant intervention. Vous ne pouvez pas être tenu de traiter ce qui était caché.",
                },
                {
                  step: "03",
                  title: "Réserve de propriété sur les matériaux",
                  desc: "Les matériaux fournis restent votre propriété jusqu'au paiement intégral du solde. Cette clause vous permet, en cas d'impayé, de récupérer les matériaux non encore incorporés à l'ouvrage.",
                },
                {
                  step: "04",
                  title: "Modalités de réception",
                  desc: "La réception a lieu en présence des deux parties et donne lieu à un procès-verbal signé. Les réserves doivent être formulées par écrit dans un délai défini. Sans PV signé, la réception tacite peut vous être défavorable.",
                },
                {
                  step: "05",
                  title: "Pénalités de retard à l'encontre du client",
                  desc: "Si le client bloque l'accès au chantier ou retarde la fourniture d'informations indispensables (plans, choix matériaux), le délai contractuel est suspendu et des pénalités peuvent s'appliquer.",
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

          {/* Paiements */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">
              Acompte, situation de travaux, solde : structurer les paiements
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Un devis sans échéancier de paiement est un devis incomplet. La structure de paiement
              protège votre trésorerie et dissuade les mauvais payeurs dès le départ. Le modèle le
              plus couramment utilisé dans le BTP est le suivant :
            </p>
            <ul className="space-y-3 text-muted-foreground">
              {[
                {
                  label: "30% à la commande (acompte)",
                  desc: "Couvre les premiers achats de matériaux et vous engage mutuellement. Sans acompte signé, ne commandez rien et ne démarrez pas.",
                },
                {
                  label: "Situations mensuelles en cours de chantier",
                  desc: "Pour les chantiers longs, une situation mensuelle basée sur le taux d'avancement permet d'être payé régulièrement sans attendre la fin.",
                },
                {
                  label: "5 à 10% à la réception",
                  desc: "Le solde est versé lors de la réception sans réserve (ou après levée des réserves). Ne soldez pas avant que le PV de réception soit signé.",
                },
              ].map((item) => (
                <li key={item.label} className="flex items-start gap-3">
                  <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-foreground">{item.label}.</strong> {item.desc}
                  </span>
                </li>
              ))}
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              La règle d&apos;or : ne démarrez jamais un chantier sans avoir reçu l&apos;acompte et
              le devis signé. Un accord verbal ne vaut rien en cas de litige.
            </p>
          </div>

          {/* Cadre légal */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Ce que la loi dit sur le devis</h2>
            <p className="text-muted-foreground leading-relaxed">
              Le cadre légal du devis artisan est principalement défini par les articles L.111-1 et
              suivants du Code de la consommation (pour les prestations à destination de
              particuliers). Voici les points essentiels à connaître.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Le devis est obligatoire au-delà de certains seuils ou pour certaines catégories de
              travaux (ramonage, dépannage, déménagement…). Dans la pratique, il est fortement
              recommandé dès lors que le montant dépasse quelques centaines d&apos;euros — le risque
              de litige est directement corrélé à l&apos;absence de document écrit.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Pour les contrats conclus hors établissement (chez le client, sur chantier, à
              distance), le client bénéficie d&apos;un délai de rétractation de 14 jours à compter
              de la signature du devis. Pendant ce délai, aucune somme ne peut vous être versée et
              les travaux ne peuvent pas commencer — sauf demande expresse du client par écrit pour
              un démarrage anticipé.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Enfin, le devis signé vaut contrat. Toute modification ultérieure (matériaux, délais,
              prix) doit faire l&apos;objet d&apos;un avenant signé par les deux parties. Un accord
              verbal, même devant témoins, est très difficile à faire valoir.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="border rounded-xl p-6 space-y-4 bg-muted/20">
          <h3 className="font-bold text-lg">Gérez vos devis et leur signature avec Chalto</h3>
          <p className="text-sm text-muted-foreground">
            Chalto centralise vos devis, suit leur état et relance automatiquement vos clients en
            attente de signature.
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
          title="Comment rédiger un devis de travaux qui protège l'artisan ?"
          url="https://chalto.fr/blog/rediger-devis-travaux"
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
