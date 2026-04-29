import { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, ArrowLeft, CheckCircle } from "lucide-react"
import { ShareButtons } from "@/components/blog/share-buttons"

export const revalidate = false

export const metadata: Metadata = {
  title: "Comment faire signer un devis artisan rapidement",
  description:
    "Devis en attente depuis 3 semaines ? Découvrez les méthodes concrètes pour faire signer vos devis plus vite et réduire les abandons clients dans le bâtiment.",
  openGraph: {
    title: "Comment faire signer un devis artisan rapidement | Chalto",
    description:
      "Devis en attente depuis 3 semaines ? Découvrez les méthodes concrètes pour faire signer vos devis plus vite.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=1200&q=80&auto=format&fit=crop",
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
            <Badge variant="outline">Relation client</Badge>
            <span className="text-xs text-muted-foreground">29 avril 2026 · 6 min de lecture</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight">
            Comment faire signer un devis artisan rapidement
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Vous envoyez un devis, vous attendez. Trois semaines passent, le client ne répond plus.
            C&apos;est le scénario le plus frustrant du métier. Voici pourquoi ça arrive et comment
            l&apos;éviter.
          </p>
        </div>

        {/* Hero image */}
        <div className="rounded-xl overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1521791136064-7986c2920216?w=1200&q=80&auto=format&fit=crop"
            alt="Signature d'un accord commercial entre deux personnes"
            width={1200}
            height={630}
            className="w-full object-cover aspect-video"
            priority
          />
        </div>

        {/* Contenu */}
        <div className="space-y-8">
          {/* Pourquoi */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Pourquoi les devis restent sans réponse</h2>
            <p className="text-muted-foreground leading-relaxed">
              Un devis non signé, c&apos;est rarement un client qui ne veut pas. C&apos;est presque
              toujours un client qui hésite, compare, ou a simplement oublié. Le devis est arrivé
              par email un mardi matin, il a été lu en diagonale, glissé dans un dossier, et
              supplanté par les urgences du quotidien.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Les études sur le comportement d&apos;achat montrent que 70% des décisions
              d&apos;achat se prennent dans les 48 heures après réception de l&apos;offre. Passé ce
              délai, la probabilité de signature chute drastiquement. Chaque jour qui passe sans
              relance est un jour de perdu.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              La bonne nouvelle : ce n&apos;est pas une fatalité. Quelques ajustements simples dans
              votre processus peuvent doubler votre taux de signature.
            </p>
          </div>

          {/* Ce qui ralentit */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Ce qui freine la signature</h2>
            <ul className="space-y-3 text-muted-foreground">
              {[
                {
                  label: "La friction administrative",
                  desc: "Imprimer, signer, scanner, renvoyer — pour un client non équipé, c'est déjà un obstacle. Beaucoup remettent à plus tard et finissent par ne pas le faire.",
                },
                {
                  label: "Le manque de clarté du devis",
                  desc: "Un devis avec des lignes techniques que le client ne comprend pas génère des questions. Des questions non répondues, c'est de l'hésitation.",
                },
                {
                  label: "L'absence de date limite",
                  desc: "Sans validité clairement indiquée, le client n'a aucune urgence à agir. La décision peut toujours attendre à demain.",
                },
                {
                  label: "La concurrence silencieuse",
                  desc: "Votre client attend peut-être un devis concurrent. Sans relance, vous donnez l'avantage à celui qui sera plus proactif.",
                },
                {
                  label: "Le doute sur votre disponibilité",
                  desc: "Le client peut hésiter à signer sans savoir si vous êtes disponible pour démarrer. L'incertitude paralyse la décision.",
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

          {/* Les méthodes */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">6 méthodes concrètes pour accélérer la signature</h2>

            <ol className="space-y-6">
              {[
                {
                  step: "01",
                  title: "Envoyez le devis le jour même ou le lendemain",
                  desc: "La fenêtre d'attention est maximale juste après le rendez-vous. Un devis envoyé 5 jours après la visite arrive quand le client a déjà oublié l'enthousiasme initial. Visez 24h maximum.",
                },
                {
                  step: "02",
                  title: "Proposez la signature électronique",
                  desc: "Supprimer la friction d'impression est l'un des leviers les plus efficaces. Un lien à cliquer, une case à cocher, c'est infiniment plus simple qu'un PDF à imprimer et renvoyer par courrier.",
                },
                {
                  step: "03",
                  title: "Indiquez une date de validité courte",
                  desc: "\"Devis valable 30 jours\" n'incite pas à l'urgence. \"Devis valable jusqu'au 15 mai\" avec une raison crédible (planning chargé, prix matériaux évolutifs) crée une vraie raison d'agir.",
                },
                {
                  step: "04",
                  title: "Relancez à J+2 et J+7",
                  desc: 'Une relance à J+2 est vue comme du service client, pas du harcèlement. Un simple "j\'espère que vous avez bien reçu le devis, avez-vous des questions ?" suffit. À J+7, proposez un appel rapide.',
                },
                {
                  step: "05",
                  title: "Simplifiez le devis pour le client",
                  desc: "Ajoutez un résumé en tête de devis : ce que vous faites, pour combien, en combien de temps. Votre client doit pouvoir comprendre l'essentiel en 30 secondes sans lire toutes les lignes.",
                },
                {
                  step: "06",
                  title: "Confirmez votre disponibilité",
                  desc: 'Précisez quand vous pouvez démarrer : "Si vous confirmez cette semaine, je peux commencer le 12 juin". Ça rend le projet concret et rassure sur votre organisation.',
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

          {/* Valeur légale */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Devis signé : quelle valeur légale ?</h2>
            <p className="text-muted-foreground leading-relaxed">
              En France, un devis signé avec la mention &quot;bon pour accord&quot; a valeur de
              contrat. Il engage les deux parties : le client à payer, l&apos;artisan à réaliser les
              travaux dans les conditions décrites.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              La signature électronique a la même valeur juridique que la signature manuscrite,
              conformément au règlement européen eIDAS et à la loi française depuis 2000. Un email
              de confirmation peut également constituer un accord, mais la signature reste la preuve
              la plus solide.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Conserver un historique daté des échanges et des signatures est essentiel en cas de
              litige. C&apos;est pourquoi un outil dédié — qui horodate automatiquement les
              validations — vaut bien mieux qu&apos;un email perdu dans une boîte mail.
            </p>
          </div>

          {/* Ce que vous gagnez */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Ce que vous y gagnez</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  title: "Moins d'attente",
                  desc: "Un processus fluide réduit le délai moyen de signature de plusieurs semaines à quelques jours.",
                },
                {
                  title: "Moins d'abandons",
                  desc: "Une relance bien timée rattrape 30 à 40% des devis qui seraient partis à la concurrence.",
                },
                {
                  title: "Une meilleure trésorerie",
                  desc: "Des devis signés plus vite, c'est un chiffre d'affaires engagé plus tôt et une visibilité à 3 mois.",
                },
                {
                  title: "Une image plus pro",
                  desc: "Un processus digital et organisé rassure le client sur la qualité de votre travail avant même le premier coup de marteau.",
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
              Faire signer un devis rapidement, ce n&apos;est pas une question de chance ou de prix.
              C&apos;est une question de processus. Envoi rapide, format clair, signature en un
              clic, relance bien timée — chacun de ces éléments seul améliore votre taux de
              signature. Combinés, ils transforment votre relation client.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Les artisans qui signent le plus de devis ne sont pas forcément les moins chers. Ce
              sont ceux qui donnent confiance rapidement et qui rendent la décision facile pour leur
              client.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="border rounded-xl p-6 space-y-4 bg-muted/20">
          <h3 className="font-bold text-lg">Envoyez votre premier lien de validation en 5 min</h3>
          <p className="text-sm text-muted-foreground">
            Avec Chalto, votre client reçoit un lien sécurisé, consulte le document et valide en un
            clic — sans créer de compte. La signature est horodatée et archivée automatiquement.
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
          title="Comment faire signer un devis artisan rapidement"
          url="https://chalto.fr/blog/faire-signer-devis-artisan"
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
