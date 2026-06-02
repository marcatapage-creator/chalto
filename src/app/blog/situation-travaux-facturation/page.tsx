import { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, ArrowLeft, CheckCircle } from "lucide-react"
import { ShareButtons } from "@/components/blog/share-buttons"

export const revalidate = false

export const metadata: Metadata = {
  title: "Situation de travaux : comment facturer en cours de chantier ?",
  description:
    "La situation de travaux permet d'être payé au fil de l'avancement. Comment la rédiger, à quelle fréquence l'envoyer, et comment éviter les contestations.",
  openGraph: {
    title: "Situation de travaux : comment facturer en cours de chantier ? | Chalto",
    description:
      "La situation de travaux permet d'être payé au fil de l'avancement. Comment la rédiger, à quelle fréquence l'envoyer, et comment éviter les contestations.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1565688534245-05d6b5be184a?w=1200&q=80&auto=format&fit=crop",
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
            <span className="text-xs text-muted-foreground">16 juin 2026 · 6 min de lecture</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight">
            Situation de travaux : comment facturer en cours de chantier ?
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Sur un chantier qui dure plusieurs semaines ou plusieurs mois, attendre la réception
            pour facturer, c&apos;est prendre un risque financier considérable. La situation de
            travaux (ou &laquo;&nbsp;situation mensuelle&nbsp;&raquo;) est le mécanisme qui permet
            d&apos;être payé au fil de l&apos;avancement — à condition de savoir la rédiger
            correctement.
          </p>
        </div>

        {/* Hero image */}
        <div className="rounded-xl overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1565688534245-05d6b5be184a?w=1200&q=80&auto=format&fit=crop"
            alt="Suivi d'avancement de chantier et facturation"
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
            <h2 className="text-2xl font-bold">
              Qu&apos;est-ce qu&apos;une situation de travaux ?
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Une situation de travaux est un document de facturation intermédiaire émis en cours de
              chantier. Contrairement à une facture classique qui solde une prestation terminée, la
              situation facture une partie des travaux en fonction du taux d&apos;avancement
              constaté à une date donnée.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Son caractère est intermédiaire : elle n&apos;est pas libératoire (elle ne solde pas
              le marché), mais elle crée une créance exigible sur le client pour la part de travaux
              réalisée. Elle est toujours rattachée au devis initial et fait référence aux lots
              définis dans ce document.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              La situation de travaux est un outil de trésorerie autant que de gestion. Elle permet
              à l&apos;artisan ou à l&apos;entreprise d&apos;éviter de porter seul le financement du
              chantier pendant plusieurs semaines, et donne au client une visibilité régulière sur
              l&apos;avancement et les sommes dues.
            </p>
          </div>

          {/* Fréquence */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Quand et à quelle fréquence l&apos;envoyer ?</h2>
            <p className="text-muted-foreground leading-relaxed">
              La fréquence recommandée est mensuelle. Sur les chantiers de longue durée, émettre une
              situation le 25 de chaque mois (ou une autre date fixe convenue avec le client) crée
              un rythme prévisible pour les deux parties. Le client sait quand il va recevoir un
              appel de fonds ; vous savez quand vous allez être payé.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              La régularité est clé. Des situations irrégulières (envoyées en fonction de
              l&apos;humeur ou de l&apos;urgence de trésorerie) créent de la friction avec le client
              et compliquent le suivi comptable. Prévoyez ce rythme dès le devis initial et
              mentionnez-le dans les conditions de paiement.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Sur des chantiers courts (moins de 6 semaines), une seule situation en milieu de
              chantier peut suffire. Sur des chantiers d&apos;envergure avec plusieurs corps de
              métier, une situation bimensuelle peut être justifiée.
            </p>
          </div>

          {/* Calcul avancement */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Comment calculer l&apos;avancement ?</h2>
            <p className="text-muted-foreground leading-relaxed">
              La méthode standard consiste à exprimer l&apos;avancement lot par lot en pourcentage,
              puis à en déduire le montant net à facturer pour la période. Voici un exemple concret
              avec 3 lots :
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 pr-4 font-semibold">Lot</th>
                    <th className="text-right py-2 px-2 font-semibold">Total devis HT</th>
                    <th className="text-right py-2 px-2 font-semibold">% avancement</th>
                    <th className="text-right py-2 px-2 font-semibold">Cumul HT</th>
                    <th className="text-right py-2 pl-2 font-semibold">Déjà facturé</th>
                    <th className="text-right py-2 pl-2 font-semibold">Net à fact.</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  {[
                    {
                      lot: "Maçonnerie",
                      total: "20 000 €",
                      pct: "70%",
                      cumul: "14 000 €",
                      facture: "8 000 €",
                      net: "6 000 €",
                    },
                    {
                      lot: "Plomberie",
                      total: "12 000 €",
                      pct: "50%",
                      cumul: "6 000 €",
                      facture: "0 €",
                      net: "6 000 €",
                    },
                    {
                      lot: "Électricité",
                      total: "8 000 €",
                      pct: "30%",
                      cumul: "2 400 €",
                      facture: "0 €",
                      net: "2 400 €",
                    },
                  ].map((row) => (
                    <tr key={row.lot} className="border-b last:border-0">
                      <td className="py-2 pr-4 font-medium text-foreground">{row.lot}</td>
                      <td className="py-2 px-2 text-right">{row.total}</td>
                      <td className="py-2 px-2 text-right">{row.pct}</td>
                      <td className="py-2 px-2 text-right">{row.cumul}</td>
                      <td className="py-2 pl-2 text-right">{row.facture}</td>
                      <td className="py-2 pl-2 text-right font-semibold text-foreground">
                        {row.net}
                      </td>
                    </tr>
                  ))}
                  <tr className="font-semibold text-foreground">
                    <td className="pt-3 pr-4">Total situation n°1</td>
                    <td className="pt-3 px-2 text-right">40 000 €</td>
                    <td className="pt-3 px-2 text-right"></td>
                    <td className="pt-3 px-2 text-right">22 400 €</td>
                    <td className="pt-3 pl-2 text-right">8 000 €</td>
                    <td className="pt-3 pl-2 text-right">14 400 €</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-muted-foreground leading-relaxed text-sm">
              Le net à facturer (14 400&nbsp;€ HT dans l&apos;exemple) est la somme qui apparaît sur
              la facture de situation. La TVA est calculée sur ce montant selon le taux applicable
              par lot.
            </p>
          </div>

          {/* Informations obligatoires */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Les informations obligatoires dans une situation</h2>
            <p className="text-muted-foreground leading-relaxed">
              Une situation de travaux est une facture au sens fiscal du terme. Elle doit donc
              comporter toutes les mentions légales d&apos;une facture, plus les éléments
              spécifiques à la facturation à l&apos;avancement :
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  title: "Numérotation séquentielle",
                  desc: '"Situation n°1", "Situation n°2"... La numérotation doit être continue et sans saut, comme pour toute facture.',
                },
                {
                  title: "Référence au marché",
                  desc: "Numéro et date du devis initial auquel la situation se rattache. Indispensable pour le suivi comptable client.",
                },
                {
                  title: "Période concernée",
                  desc: 'La période d\'avancement constatée : "Travaux réalisés du 1er au 30 juin 2026". Facilite le rapprochement avec les rapports de chantier.',
                },
                {
                  title: "Tableau d'avancement par lot",
                  desc: "Désignation / montant total / % avancement / montant cumulé / déjà facturé / net à facturer. Ce tableau est le cœur de la situation.",
                },
                {
                  title: "Retenue de garantie éventuelle",
                  desc: "Si prévue au contrat, la retenue de garantie (généralement 5%) est déduite de chaque situation et libérée à la réception ou après le délai légal.",
                },
                {
                  title: "Conditions de paiement",
                  desc: "Délai de paiement (30 jours en BTP, sauf accord contraire), coordonnées bancaires (IBAN/BIC), pénalités de retard applicables.",
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

          {/* Éviter les contestations */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Comment éviter les contestations ?</h2>
            <p className="text-muted-foreground leading-relaxed">
              Une situation de travaux contestée, c&apos;est un paiement bloqué. Pour limiter ce
              risque, quelques bonnes pratiques s&apos;imposent dès le départ.
            </p>
            <ol className="space-y-4">
              {[
                {
                  step: "01",
                  title: "Joignez un rapport d'avancement photo",
                  desc: "Des photos datées de l'avancement par lot sont la preuve la plus simple et la plus convaincante. Elles rendent la contestation du taux d'avancement très difficile.",
                },
                {
                  step: "02",
                  title: "Faites valider par le maître d'œuvre avant envoi",
                  desc: "Sur les chantiers avec maîtrise d'œuvre, soumettez votre tableau d'avancement au MOE avant d'envoyer la situation au client. Sa validation préalable élimine la principale source de litige.",
                },
                {
                  step: "03",
                  title: "Prévoyez la clause dans le devis initial",
                  desc: "Le rythme et les modalités des situations (fréquence, délai de paiement, retenue de garantie) doivent figurer dans le devis. Un client qui signe accepte les règles du jeu.",
                },
                {
                  step: "04",
                  title: "Respectez le délai légal de paiement",
                  desc: "En BTP, le délai maximal de paiement entre entreprises est de 45 jours fin de mois ou 60 jours à compter de la date d'émission de la facture (articles L.441-10 et suivants du Code de commerce).",
                },
                {
                  step: "05",
                  title: "Mise en demeure si non-paiement",
                  desc: "Passé le délai contractuel, envoyez une lettre de mise en demeure (recommandé avec AR). Les pénalités de retard sont automatiquement dues sans qu'il soit nécessaire de les rappeler dans le contrat.",
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
            Suivez l&apos;avancement de vos chantiers avec Chalto
          </h3>
          <p className="text-sm text-muted-foreground">
            Chalto vous permet de suivre le taux d&apos;avancement par lot et de générer vos
            situations mensuelles sans ressaisie.
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
          title="Situation de travaux : comment facturer en cours de chantier ?"
          url="https://chalto.fr/blog/situation-travaux-facturation"
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
