import { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, ArrowLeft, CheckCircle } from "lucide-react"
import { ShareButtons } from "@/components/blog/share-buttons"

export const revalidate = false

export const metadata: Metadata = {
  title: "Délais de paiement dans le BTP : droits et recours",
  description:
    "Factures impayées, délais non respectés — dans le BTP, les retards de paiement peuvent mettre en péril votre trésorerie. Connaissez vos droits et les recours disponibles.",
  openGraph: {
    title: "Délais de paiement dans le BTP : droits et recours | Chalto",
    description:
      "Factures impayées, délais non respectés — dans le BTP, les retards de paiement peuvent mettre en péril votre trésorerie.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1200&q=80&auto=format&fit=crop",
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
            <span className="text-xs text-muted-foreground">29 avril 2026 · 7 min de lecture</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight">
            Délais de paiement dans le BTP : droits et recours
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Dans le BTP, 1 entreprise sur 3 cite les retards de paiement comme première cause de
            difficultés de trésorerie. Connaître vos droits est la première étape pour se faire
            payer dans les délais.
          </p>
        </div>

        {/* Hero image */}
        <div className="rounded-xl overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1200&q=80&auto=format&fit=crop"
            alt="Signature d'un contrat commercial"
            width={1200}
            height={630}
            className="w-full object-cover aspect-video"
            priority
          />
        </div>

        {/* Contenu */}
        <div className="space-y-8">
          {/* Le cadre légal */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Le cadre légal des délais de paiement</h2>
            <p className="text-muted-foreground leading-relaxed">
              En France, les délais de paiement dans les marchés privés sont encadrés par la loi LME
              (Loi de Modernisation de l&apos;Économie) de 2008, codifiée à l&apos;article L.441-10
              du Code de commerce. Elle fixe un délai maximum de 60 jours à compter de la date
              d&apos;émission de la facture — ou 45 jours fin de mois.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Pour les marchés publics, le délai est plus court : 30 jours pour l&apos;État et les
              hôpitaux, 50 jours pour les collectivités territoriales. Ces délais sont d&apos;ordre
              public : aucun contrat ne peut les dépasser, même si c&apos;est écrit dans les CGV.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Attention : ces délais courent à partir de la date de réception de la facture, pas de
              son envoi. Avoir une preuve d&apos;envoi (email avec accusé de réception, lettre
              recommandée) est donc essentiel.
            </p>
          </div>

          {/* Les pénalités */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Intérêts de retard et indemnité forfaitaire</h2>
            <p className="text-muted-foreground leading-relaxed">
              Dès le premier jour de retard, des pénalités sont dues de plein droit — sans mise en
              demeure préalable. Vous n&apos;avez pas besoin de demander la permission : elles sont
              automatiques.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  title: "Marchés privés",
                  rate: "Taux directeur BCE + 10 points",
                  note: "Environ 13-14% par an actuellement. Ce taux est révisé deux fois par an par la Banque centrale européenne.",
                },
                {
                  title: "Marchés publics",
                  rate: "Taux directeur BCE + 8 points",
                  note: "Légèrement inférieur au taux privé, mais toujours significatif pour des retards de plusieurs semaines.",
                },
                {
                  title: "Indemnité forfaitaire",
                  rate: "40 € par facture",
                  note: "Indemnité pour frais de recouvrement, automatiquement due avec les intérêts de retard. Cumulable.",
                },
                {
                  title: "Amende administrative",
                  rate: "Jusqu'à 2 millions €",
                  note: "En cas de pratiques abusives répétées, la DGCCRF peut infliger des amendes aux donneurs d'ordre.",
                },
              ].map((item) => (
                <div key={item.title} className="p-4 border rounded-xl space-y-2">
                  <p className="font-semibold text-sm">{item.title}</p>
                  <p className="text-primary font-bold">{item.rate}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.note}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Les erreurs courantes */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Les erreurs qui retardent vos paiements</h2>
            <ul className="space-y-3 text-muted-foreground">
              {[
                {
                  label: "Factures incomplètes",
                  desc: "Une facture sans numéro de marché, sans référence de bon de commande ou sans mention légale obligatoire peut être légitimement bloquée par le client jusqu'à correction.",
                },
                {
                  label: "Pas de situation de travaux formalisée",
                  desc: "Pour les marchés à avancement, chaque demande d'acompte doit être accompagnée d'une situation de travaux signée ou validée. Sans elle, le client peut contester.",
                },
                {
                  label: "Pas de relance systématique",
                  desc: "Attendre que le client paye spontanément est la plus coûteuse des erreurs. Une relance à J+3 après l'échéance est normale et professionnelle.",
                },
                {
                  label: "Accepter des délais contractuels illégaux",
                  desc: "Certains donneurs d'ordre imposent des délais de 90 ou 120 jours dans leurs contrats. Ces clauses sont nulles de plein droit — mais encore faut-il le savoir pour ne pas les subir.",
                },
                {
                  label: "Ne pas facturer à la bonne date",
                  desc: "Une facture émise le 31 du mois pour un avancement arrêté au 15 repousse inutilement le délai. Facturez dès que l'avancement est constaté.",
                },
              ].map((item) => (
                <li key={item.label} className="flex items-start gap-3">
                  <span className="text-destructive font-bold shrink-0">✗</span>
                  <span>
                    <strong className="text-foreground">{item.label}.</strong> {item.desc}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Les recours */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Vos recours en cas de non-paiement</h2>
            <ol className="space-y-6">
              {[
                {
                  step: "01",
                  title: "La mise en demeure par lettre recommandée",
                  desc: "C'est le préalable incontournable. Elle doit préciser le montant dû, les intérêts de retard calculés et le délai accordé avant action judiciaire (souvent 8 jours). Elle peut déjà suffire à débloquer la situation.",
                },
                {
                  step: "02",
                  title: "L'injonction de payer",
                  desc: "Procédure rapide et peu coûteuse devant le tribunal. Le juge rend une ordonnance sans audience contradictoire si la créance est incontestable. Délai moyen : 2 à 4 semaines.",
                },
                {
                  step: "03",
                  title: "Le référé-provision",
                  desc: "Quand la créance est certaine et non sérieusement contestable, le juge des référés peut ordonner une provision sous 15 jours. Plus rapide qu'un procès au fond.",
                },
                {
                  step: "04",
                  title: "La DGCCRF pour les abus systémiques",
                  desc: "Si un donneur d'ordre impose des pratiques illégales à de nombreux sous-traitants, le signalement à la DGCCRF peut déclencher une enquête et des sanctions.",
                },
                {
                  step: "05",
                  title: "L'action directe du sous-traitant",
                  desc: "Le sous-traitant peut agir directement contre le maître d'ouvrage en cas de non-paiement par l'entreprise principale, dans la limite des sommes dues par le maître d'ouvrage.",
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

          {/* Bonnes pratiques */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">5 bonnes pratiques pour éviter les impayés</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  title: "Vérifiez la solvabilité avant de signer",
                  desc: "Une vérification Kbis et un bilan simplifié vous évitent de travailler pour un client en difficulté.",
                },
                {
                  title: "Exigez un acompte",
                  desc: "Un acompte de 20-30% à la signature engage le client et teste sa bonne foi dès le départ.",
                },
                {
                  title: "Facturez par situations d'avancement",
                  desc: "Sur les grands chantiers, ne pas attendre la fin pour facturer protège votre trésorerie.",
                },
                {
                  title: "Mentionnez les pénalités dans vos CGV",
                  desc: "Les intérêts de retard et l'indemnité de 40€ doivent figurer dans vos conditions générales pour être opposables.",
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

          {/* Conclusion */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">En résumé</h2>
            <p className="text-muted-foreground leading-relaxed">
              Les délais de paiement dans le BTP sont encadrés par la loi. Vous avez des droits
              précis — mais encore faut-il les connaître et les faire valoir. Un processus de
              facturation rigoureux, des relances systématiques et la connaissance des recours
              disponibles font la différence entre une trésorerie saine et une spirale
              d&apos;impayés.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              N&apos;attendez jamais de vous retrouver en difficulté pour agir. Dès le premier
              retard, relancez. Dès la deuxième relance sans réponse, mettez en demeure. La fermeté
              n&apos;est pas agressive — c&apos;est professionnelle.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="border rounded-xl p-6 space-y-4 bg-muted/20">
          <h3 className="font-bold text-lg">Gérez vos devis et factures depuis Chalto</h3>
          <p className="text-sm text-muted-foreground">
            Chalto vous permet de suivre l&apos;état de vos documents, d&apos;envoyer des rappels
            automatiques et de conserver une trace horodatée de chaque validation client.
          </p>
          <Button asChild>
            <Link href="/#waitlist">
              Commencer gratuitement
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Partager */}
        <ShareButtons
          title="Délais de paiement dans le BTP : droits et recours"
          url="https://chalto.fr/blog/delai-paiement-btp"
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
