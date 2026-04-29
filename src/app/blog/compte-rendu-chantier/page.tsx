import { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, ArrowLeft, CheckCircle } from "lucide-react"
import { ShareButtons } from "@/components/blog/share-buttons"

export const revalidate = false

export const metadata: Metadata = {
  title: "Comment rédiger un compte rendu de chantier efficace",
  description:
    "Le compte rendu de chantier est votre meilleure protection en cas de litige. Découvrez comment le rédiger en 20 minutes, ce qu'il doit contenir et les modèles qui fonctionnent.",
  openGraph: {
    title: "Comment rédiger un compte rendu de chantier efficace | Chalto",
    description:
      "Le compte rendu de chantier est votre meilleure protection en cas de litige. Découvrez comment le rédiger en 20 minutes.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&q=80&auto=format&fit=crop",
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
            <Badge variant="outline">Gestion de chantier</Badge>
            <span className="text-xs text-muted-foreground">29 avril 2026 · 7 min de lecture</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight">
            Comment rédiger un compte rendu de chantier efficace
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            20 minutes de rédaction par semaine peuvent vous éviter des mois de litige. Le compte
            rendu de chantier est l&apos;outil de protection le plus sous-estimé du bâtiment.
          </p>
        </div>

        {/* Hero image */}
        <div className="rounded-xl overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&q=80&auto=format&fit=crop"
            alt="Réunion de chantier avec architecte et ouvriers"
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
            <h2 className="text-2xl font-bold">
              Pourquoi le compte rendu de chantier est essentiel
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Sur un chantier de 6 mois, des centaines de décisions sont prises oralement. Qui a
              validé la couleur du carrelage ? Qui a demandé le déplacement de la cloison ? Qui a
              autorisé le passage des câbles dans le faux-plafond ? Sans trace écrite, personne ne
              s&apos;en souvient — ou tout le monde s&apos;en souvient différemment.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Le compte rendu de réunion de chantier (CR) est le document qui fixe ces décisions.
              Distribué à tous les intervenants après chaque réunion, il devient la référence
              commune qui prévient les malentendus et constitue une preuve en cas de litige.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Un CR rédigé et distribué dans les 24 heures a une valeur juridique : si aucun
              participant ne le conteste dans les 48 heures, les décisions qu&apos;il consigne sont
              considérées comme acceptées par toutes les parties.
            </p>
          </div>

          {/* Ce qu'il doit contenir */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">
              Les 7 éléments indispensables d&apos;un CR de chantier
            </h2>
            <ol className="space-y-6">
              {[
                {
                  step: "01",
                  title: "L'en-tête",
                  desc: "Nom du projet, adresse du chantier, numéro du CR (CR n°1, CR n°2…), date et heure de la réunion, liste des présents et des absents excusés.",
                },
                {
                  step: "02",
                  title: "L'avancement général",
                  desc: "État d'avancement global en pourcentage ou par phase. Respect du planning ou retard identifié, avec les causes si pertinent.",
                },
                {
                  step: "03",
                  title: "Les points par corps de métier",
                  desc: "Pour chaque intervenant présent : ce qui a été fait depuis le dernier CR, ce qui est en cours, ce qui bloque. Formulé factuellement, sans jugement.",
                },
                {
                  step: "04",
                  title: "Les décisions prises",
                  desc: "Liste numérotée des décisions actées en réunion : modifications de plans, choix de matériaux, arbitrages maître d'ouvrage. Chaque décision a un responsable.",
                },
                {
                  step: "05",
                  title: "Les actions à réaliser",
                  desc: "Tableau avec : action, responsable, date limite. Ce point est le plus utile au quotidien — c'est lui qui assure le suivi entre deux réunions.",
                },
                {
                  step: "06",
                  title: "Les points de vigilance",
                  desc: "Risques identifiés, interfaces critiques entre lots, dépendances à surveiller. Les mentionner protège en cas de problème ultérieur.",
                },
                {
                  step: "07",
                  title: "La date du prochain CR",
                  desc: "Confirmer la date, l'heure et le lieu de la prochaine réunion. Cela évite les relances et garde le rythme de suivi.",
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

          {/* Les erreurs */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Les erreurs qui rendent un CR inutile</h2>
            <ul className="space-y-3 text-muted-foreground">
              {[
                {
                  label: "Rédiger le CR 5 jours après la réunion",
                  desc: "Les souvenirs sont flous, certains intervenants ont déjà pris des décisions contraires. Au-delà de 24h, le CR perd sa valeur pratique.",
                },
                {
                  label: "Utiliser un langage technique non partagé",
                  desc: "Le maître d'ouvrage doit comprendre le CR. Évitez les abréviations métier non expliquées et les références normatives sans contexte.",
                },
                {
                  label: "Ne pas numéroter les actions",
                  desc: 'Sans numérotation, impossible de faire référence à une action précise lors du CR suivant : "l\'action 12 est clôturée".',
                },
                {
                  label: "Oublier de lister les absents",
                  desc: "Un intervenant absent doit recevoir le CR et ne peut pas arguer qu'il n'était pas au courant des décisions prises.",
                },
                {
                  label: "Ne pas archiver les CR de manière organisée",
                  desc: "Un CR non retrouvable en cas de litige ne sert à rien. L'archivage doit être systématique et accessible.",
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

          {/* Modèle */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Le modèle qui prend 20 minutes à rédiger</h2>
            <p className="text-muted-foreground leading-relaxed">
              La clé d&apos;un CR efficace : avoir un modèle fixe que vous remplissez directement
              pendant ou juste après la réunion. Ne rédigez pas, notez. Voici la structure minimale
              qui fonctionne :
            </p>
            <div className="bg-muted/30 rounded-xl p-5 space-y-3 font-mono text-sm">
              <p className="font-bold text-foreground not-italic font-sans">
                CR de chantier — [Projet] — n°[X]
              </p>
              <p className="text-muted-foreground">Date : [JJ/MM/AAAA] | Présents : [liste]</p>
              <p className="font-semibold text-foreground not-italic font-sans mt-2">
                Avancement : [X]%
              </p>
              <p className="text-muted-foreground">Retard estimé : [X semaines / aucun]</p>
              <p className="font-semibold text-foreground not-italic font-sans mt-2">Décisions :</p>
              <p className="text-muted-foreground">D1 — [Description] — Validé par [nom]</p>
              <p className="font-semibold text-foreground not-italic font-sans mt-2">Actions :</p>
              <p className="text-muted-foreground">
                A1 — [Action] — [Responsable] — Délai : [date]
              </p>
              <p className="font-semibold text-foreground not-italic font-sans mt-2">
                Prochain CR : [date]
              </p>
            </div>
          </div>

          {/* Fréquence */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Quelle fréquence pour les réunions de chantier ?</h2>
            <p className="text-muted-foreground leading-relaxed">
              La fréquence recommandée varie selon la phase du chantier :
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  phase: "Démarrage et gros œuvre",
                  freq: "Hebdomadaire",
                  note: "Beaucoup de dépendances entre lots, risque élevé de désalignement.",
                },
                {
                  phase: "Second œuvre",
                  freq: "Bihebdomadaire",
                  note: "Rythme plus stable, les corps de métier s'enchaînent.",
                },
                {
                  phase: "Finitions et réception",
                  freq: "Hebdomadaire",
                  note: "Les réserves s'accumulent, le suivi doit redevenir serré.",
                },
              ].map((item) => (
                <div key={item.phase} className="p-4 border rounded-xl space-y-2">
                  <p className="font-semibold text-sm">{item.phase}</p>
                  <p className="text-primary font-bold">{item.freq}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.note}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Ce que vous y gagnez */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Ce que vous y gagnez</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  title: "Protection juridique",
                  desc: "Chaque décision validée sans contestation dans les 48h a force contractuelle.",
                },
                {
                  title: "Moins de litige",
                  desc: "La majorité des conflits de chantier naissent d'un malentendu oral. Le CR les prévient.",
                },
                {
                  title: "Meilleure coordination",
                  desc: "Chaque intervenant sait ce qu'il doit faire avant le prochain CR — sans vous appeler.",
                },
                {
                  title: "Image professionnelle",
                  desc: "Un architecte qui distribue un CR dans les heures qui suivent rassure son client sur sa rigueur.",
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
              Le compte rendu de chantier n&apos;est pas une formalité administrative. C&apos;est
              votre mémoire du projet et votre protection légale. Rédigé rapidement et distribué
              systématiquement, il transforme une gestion chaotique en pilotage maîtrisé.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Les architectes et maîtres d&apos;œuvre qui s&apos;y tiennent le disent tous : une
              fois que la discipline est installée, le chantier devient plus calme. Les gens
              s&apos;en remettent au CR plutôt que de débattre de ce qui a été dit lors de la
              réunion.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="border rounded-xl p-6 space-y-4 bg-muted/20">
          <h3 className="font-bold text-lg">Rédigez et distribuez vos CR en quelques minutes</h3>
          <p className="text-sm text-muted-foreground">
            Avec Chalto, vos comptes rendus sont générés automatiquement à partir de vos tâches et
            distribués à chaque intervenant en un clic. Archivage automatique inclus.
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
          title="Comment rédiger un compte rendu de chantier efficace"
          url="https://chalto.fr/blog/compte-rendu-chantier"
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
