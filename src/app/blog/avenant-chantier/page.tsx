import { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, ArrowLeft, CheckCircle } from "lucide-react"
import { ShareButtons } from "@/components/blog/share-buttons"

export const revalidate = false

export const metadata: Metadata = {
  title: "Avenant de chantier : quand et comment le rédiger ?",
  description:
    "Un client qui change d'avis, une découverte en cours de chantier... L'avenant est le seul outil qui vous permet de facturer des travaux supplémentaires sans litige.",
  openGraph: {
    title: "Avenant de chantier : quand et comment le rédiger ? | Chalto",
    description:
      "Un client qui change d'avis, une découverte en cours de chantier... L'avenant est le seul outil qui vous permet de facturer des travaux supplémentaires sans litige.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=1200&q=80&auto=format&fit=crop",
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
            <Badge variant="outline">Documents</Badge>
            <span className="text-xs text-muted-foreground">9 juin 2026 · 5 min de lecture</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight">
            Avenant de chantier : quand et comment le rédiger ?
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Vous avez signé un devis, le chantier est en cours, et votre client vous demande de
            modifier quelque chose. Ou vous découvrez une mauvaise surprise derrière un mur. Dans
            les deux cas, continuer sans document écrit est une erreur que vous pourriez payer cher
            à la réception.
          </p>
        </div>

        {/* Hero image */}
        <div className="rounded-xl overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=1200&q=80&auto=format&fit=crop"
            alt="Rédaction d'un avenant de chantier"
            width={1200}
            height={630}
            className="w-full object-cover aspect-video"
            priority
          />
        </div>

        {/* Contenu */}
        <div className="space-y-8">
          {/* Définition */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Qu&apos;est-ce qu&apos;un avenant de chantier ?</h2>
            <p className="text-muted-foreground leading-relaxed">
              Un avenant est un document contractuel qui vient modifier le devis initial signé. Il a
              la même valeur juridique que le devis d&apos;origine et doit, comme lui, être signé
              par les deux parties pour être opposable. Sans avenant signé, vous ne pouvez pas
              facturer des travaux qui ne figurent pas dans le devis initial.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              La principale erreur des artisans est de s&apos;appuyer sur un accord verbal. Un
              client qui dit &laquo;&nbsp;oui, allez-y&nbsp;&raquo; de vive voix peut très bien
              contester la facture à la réception en affirmant ne pas avoir validé le supplément.
              Sans écrit, vous n&apos;avez aucun recours.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              On distingue deux grandes catégories d&apos;avenants : ceux qui résultent d&apos;une
              demande du client (modification de conception, changement de matériaux, prestation
              supplémentaire) et ceux qui font suite à un aléa de chantier (découverte fortuite,
              état de la structure différent des prévisions). La procédure est la même dans les deux
              cas.
            </p>
          </div>

          {/* Cas d'usage */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Dans quels cas rédiger un avenant ?</h2>
            <p className="text-muted-foreground leading-relaxed">
              Voici les situations qui nécessitent systématiquement un avenant avant de poursuivre
              les travaux :
            </p>
            <ul className="space-y-3 text-muted-foreground">
              {[
                {
                  label: "Changement de matériaux à la demande du client",
                  desc: "Le client souhaite passer à un carrelage plus haut de gamme, changer la couleur de la façade ou opter pour une menuiserie triple vitrage non prévue initialement.",
                },
                {
                  label: "Surface ou périmètre modifié",
                  desc: "La surface à traiter s'avère plus grande que prévu, ou le client décide d'étendre la prestation à une pièce supplémentaire.",
                },
                {
                  label: "Découverte de vices cachés",
                  desc: "Présence d'amiante, taux d'humidité anormal, structure dégradée (poutres vermoulues, solives affaissées) non visible lors de la visite préalable.",
                },
                {
                  label: "Modification des délais",
                  desc: "Le planning initial doit être revu en raison d'une livraison tardive, d'un aléa météo, ou d'une contrainte nouvelle imposée par le client.",
                },
                {
                  label: "Prestation supplémentaire",
                  desc: "Le client demande une prestation connexe non prévue au devis : démontage d'un meuble, évacuation de gravats supplémentaires, finition complémentaire.",
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
          </div>

          {/* Structure */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">La structure d&apos;un avenant efficace</h2>
            <p className="text-muted-foreground leading-relaxed">
              Un avenant bien rédigé doit être court, précis et non ambigu. Il n&apos;est pas
              nécessaire de réécrire le devis entier : l&apos;avenant se greffe sur le document
              initial en le modifiant ou en le complétant.
            </p>
            <ol className="space-y-4">
              {[
                {
                  step: "01",
                  title: "Référence au devis initial",
                  desc: 'Mentionnez le numéro et la date du devis original. L\'avenant est toujours subsidiaire au document de référence : "Avenant n°1 au devis n°2026-042 du 15 mai 2026".',
                },
                {
                  step: "02",
                  title: "Description précise de la modification",
                  desc: "Décrivez ce qui change : ce qui est ajouté, ce qui est supprimé (moins-value), ce qui est modifié. Soyez aussi précis que pour le devis initial.",
                },
                {
                  step: "03",
                  title: "Impact financier",
                  desc: "Indiquez le prix HT, le taux de TVA et le prix TTC de la modification. Précisez si c'est un supplément (+) ou une déduction (−) par rapport au marché initial.",
                },
                {
                  step: "04",
                  title: "Impact sur le planning",
                  desc: 'Si la modification entraîne un décalage du délai de fin, précisez-le : "Le délai de réalisation est prolongé de X jours ouvrés". Ne laissez pas cette question ouverte.',
                },
                {
                  step: "05",
                  title: "Signature des deux parties avant exécution",
                  desc: "L'avenant doit être signé AVANT que vous n'exécutiez les travaux modifiés. Une fois les travaux réalisés, le rapport de force vous est défavorable.",
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

          {/* Erreurs à éviter */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Les erreurs à éviter</h2>
            <ul className="space-y-3 text-muted-foreground">
              {[
                {
                  label: "Commencer sans avenant signé",
                  desc: "C'est l'erreur la plus fréquente et la plus coûteuse. Une fois les travaux réalisés, le client peut refuser de payer en arguant qu'il n'a rien validé par écrit.",
                },
                {
                  label: "L'avenant verbal",
                  desc: "Un accord oral, même convenu devant votre équipe, est indémontrable. L'email ou le SMS de validation client est insuffisant — exigez une signature.",
                },
                {
                  label: "Oublier l'impact sur les délais",
                  desc: "Un avenant qui ajoute des travaux sans prolonger le délai contractuel vous met en situation de retard. Anticipez systématiquement cette question.",
                },
                {
                  label: "Ne pas mentionner les moins-values",
                  desc: "Si des travaux prévus initialement sont supprimés (client renonce à une prestation), le retrait doit figurer dans un avenant avec son impact financier négatif.",
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

          {/* Aléas de chantier */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">
              Aléas de chantier : comment les facturer sans conflit ?
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Un aléa de chantier est une situation imprévue découverte en cours d&apos;exécution et
              qui nécessite des travaux supplémentaires non prévus au devis. La façon dont vous
              gérez cette situation détermine si elle se transforme en litige ou en avenant accepté.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              La règle d&apos;or est simple : expliquer avant d&apos;intervenir. Dès que vous
              découvrez l&apos;aléa, arrêtez-vous, documentez (photos, description écrite) et
              contactez le client avant de poursuivre. Ne cherchez pas à
              &laquo;&nbsp;rattraper&nbsp;&raquo; le problème discrètement en espérant le facturer
              ensuite — c&apos;est rarement accepté.
            </p>
            <ul className="space-y-3 text-muted-foreground">
              {[
                {
                  label: "Photographiez la découverte",
                  desc: "Des photos datées constituent votre première protection. Elles prouvent que la situation existait avant votre intervention et était invisible lors de la visite initiale.",
                },
                {
                  label: "Proposez un avenant chiffré",
                  desc: "Rédigez un avenant descriptif avec le coût de traitement de l'aléa. Laissez le client décider en connaissance de cause.",
                },
                {
                  label: "Laissez le client décider",
                  desc: "Si le client refuse le supplément, c'est son droit. Mais vous n'êtes alors pas tenu de traiter un problème qui dépasse le périmètre de votre contrat.",
                },
                {
                  label: "Ne forcez jamais",
                  desc: "Contraindre un client à signer un avenant sous pression — en menaçant d'arrêter le chantier immédiatement — peut vous être défavorable juridiquement. Restez factuel et professionnel.",
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
          </div>
        </div>

        {/* CTA */}
        <div className="border rounded-xl p-6 space-y-4 bg-muted/20">
          <h3 className="font-bold text-lg">Gérez vos avenants dans Chalto</h3>
          <p className="text-sm text-muted-foreground">
            Chalto vous permet de créer des avenants directement liés à vos devis et de les faire
            signer par vos clients en ligne.
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
          title="Avenant de chantier : quand et comment le rédiger ?"
          url="https://chalto.fr/blog/avenant-chantier"
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
