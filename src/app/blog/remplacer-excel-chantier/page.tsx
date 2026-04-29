import { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, ArrowLeft, CheckCircle } from "lucide-react"
import { ShareButtons } from "@/components/blog/share-buttons"

export const revalidate = false

export const metadata: Metadata = {
  title: "Pourquoi Excel ne suffit plus pour gérer un chantier",
  description:
    "Excel est l'outil universel de la gestion de chantier. Mais au-delà d'un certain niveau de complexité, il devient un problème. Voici les signaux qui montrent qu'il est temps de passer à autre chose.",
  openGraph: {
    title: "Pourquoi Excel ne suffit plus pour gérer un chantier | Chalto",
    description:
      "Excel est l'outil universel de la gestion de chantier. Mais au-delà d'un certain niveau de complexité, il devient un problème.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&q=80&auto=format&fit=crop",
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
            <Badge variant="outline">Outils & logiciels</Badge>
            <span className="text-xs text-muted-foreground">29 avril 2026 · 6 min de lecture</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight">
            Pourquoi Excel ne suffit plus pour gérer un chantier
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Excel a beau être partout, il n&apos;a pas été conçu pour gérer un projet de
            construction multi-intervenant. Voici pourquoi continuer à l&apos;utiliser vous coûte
            plus cher que vous ne le pensez.
          </p>
        </div>

        {/* Hero image */}
        <div className="rounded-xl overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&q=80&auto=format&fit=crop"
            alt="Ordinateur portable avec tableau de données"
            width={1200}
            height={630}
            className="w-full object-cover aspect-video"
            priority
          />
        </div>

        {/* Contenu */}
        <div className="space-y-8">
          {/* Intro */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">
              Excel : l&apos;outil universel devenu problème universel
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Dans le BTP, Excel s&apos;est imposé comme le logiciel de gestion par défaut.
              Planning, suivi de budget, liste de tâches, gestion des sous-traitants — tout finit
              dans un tableur. Et pour un chantier simple géré par une seule personne, ça peut
              fonctionner.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Mais dès que le projet prend de la complexité — plusieurs intervenants, plusieurs
              lots, un client à tenir informé — Excel révèle ses limites. Et ces limites ont un coût
              réel : erreurs de version, informations perdues, temps de mise à jour, impossibilité
              de collaborer en temps réel.
            </p>
          </div>

          {/* Les problèmes */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">
              Les 6 problèmes concrets d&apos;Excel sur un chantier
            </h2>
            <ul className="space-y-3 text-muted-foreground">
              {[
                {
                  label: "La guerre des versions",
                  desc: "Qui a le bon fichier ? planning_v3_final_VRAIMENT_FINAL.xlsx — ce scénario est vécu par tous. Quand plusieurs personnes travaillent sur des copies différentes, les données divergent et les conflits se multiplient.",
                },
                {
                  label: "Pas de collaboration en temps réel",
                  desc: "Excel est un outil mono-utilisateur ou un cauchemar de synchronisation. Quand l'électricien met à jour son avancement, vous ne le voyez pas. Vous devez appeler, noter, mettre à jour manuellement.",
                },
                {
                  label: "Aucune notification",
                  desc: "Si une tâche est en retard, Excel ne vous prévient pas. Vous devez relire le planning ligne par ligne pour identifier les glissements. Sur un projet de 200 tâches, c'est une heure de travail par semaine.",
                },
                {
                  label: "Pas de gestion des droits",
                  desc: "Vous ne pouvez pas montrer à l'électricien uniquement ses tâches sans lui donner accès à tout le fichier. Il voit le budget, les autres prestataires, vos notes internes. Ce n'est pas neutre.",
                },
                {
                  label: "Pas de traçabilité des modifications",
                  desc: "Qui a modifié quelle ligne et quand ? Sans journal des modifications, impossible de savoir. Si une date change, vous ne savez pas si c'est vous, votre associé, ou une erreur de manipulation.",
                },
                {
                  label: "Pas d'historique des décisions",
                  desc: "Les décisions prises lors des réunions de chantier ne sont nulle part dans Excel. Elles sont dans des emails, des WhatsApp, des notes papier — partout sauf au même endroit.",
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

          {/* Le coût caché */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">
              Le vrai coût d&apos;Excel dans votre organisation
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Le problème avec Excel, c&apos;est qu&apos;il est gratuit — ce qui rend invisible son
              coût réel. Comptez le temps que vous passez chaque semaine à :
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  task: "Appeler les intervenants pour avoir leur avancement",
                  time: "~2h/semaine",
                },
                {
                  task: "Mettre à jour le planning manuellement après chaque appel",
                  time: "~1h/semaine",
                },
                {
                  task: "Rechercher quelle version du fichier est la bonne",
                  time: "~30 min/semaine",
                },
                { task: "Préparer un reporting client à partir du planning", time: "~1h/chantier" },
              ].map((item) => (
                <div key={item.task} className="p-4 border rounded-xl space-y-2">
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.task}</p>
                  <p className="text-primary font-bold">{item.time}</p>
                </div>
              ))}
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Sur un chantier de 6 mois, c&apos;est plusieurs dizaines d&apos;heures de travail
              administratif. À 80€/h, le coût d&apos;Excel dépasse largement celui d&apos;un outil
              dédié.
            </p>
          </div>

          {/* Ce que vous voulez vraiment */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Ce que vous cherchez vraiment à faire avec Excel</h2>
            <p className="text-muted-foreground leading-relaxed">
              En analysant ce que les architectes et maîtres d&apos;œuvre font avec Excel, on
              retrouve toujours les mêmes besoins :
            </p>
            <ul className="space-y-2 text-muted-foreground">
              {[
                "Voir l'avancement global du chantier en un coup d'œil",
                "Savoir quelles tâches sont en retard et qui est responsable",
                "Partager les informations pertinentes avec chaque intervenant",
                "Avoir une trace des décisions prises et des validations client",
                "Produire un reporting propre sans passer des heures à le préparer",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              Ces besoins sont légitimes — et ce sont précisément ceux qu&apos;un outil de gestion
              de chantier dédié résout. La question n&apos;est pas de savoir si Excel est mauvais :
              c&apos;est de savoir s&apos;il est le bon outil pour ça.
            </p>
          </div>

          {/* Quand changer */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">
              Les 5 signaux qui indiquent qu&apos;il est temps de changer
            </h2>
            <ol className="space-y-4">
              {[
                {
                  step: "01",
                  title: "Vous avez plus de 3 intervenants sur un même chantier",
                  desc: "Au-delà de 3 corps de métier, la coordination manuelle par Excel génère plus d'erreurs qu'elle n'en évite.",
                },
                {
                  step: "02",
                  title: "Votre client vous appelle pour avoir des nouvelles",
                  desc: "Si votre client doit vous appeler pour savoir où en sont les travaux, c'est que votre système de reporting est défaillant.",
                },
                {
                  step: "03",
                  title: "Vous passez plus d'une heure par semaine à mettre à jour votre planning",
                  desc: "Une heure de mise à jour manuelle par semaine, c'est 25 heures sur un chantier de 6 mois. Le ROI d'un outil dédié est immédiat.",
                },
                {
                  step: "04",
                  title: "Vous avez déjà eu un malentendu sur une version de document",
                  desc: "Un seul litige sur une version de plan peut coûter des semaines de travail. C'est le signe que la gestion documentaire doit évoluer.",
                },
                {
                  step: "05",
                  title: "Vous gérez plusieurs chantiers en parallèle",
                  desc: "Dès que vous pilotez 2 chantiers simultanément, la complexité s'additionne et Excel devient ingérable.",
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

          {/* Conclusion */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">En résumé</h2>
            <p className="text-muted-foreground leading-relaxed">
              Excel n&apos;est pas mauvais — c&apos;est juste le mauvais outil pour piloter un
              chantier collaboratif. Il manque de tout ce qui fait la valeur d&apos;un outil de
              gestion moderne : notifications, droits différenciés, collaboration en temps réel,
              traçabilité.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Passer à un outil dédié n&apos;est pas un investissement technologique — c&apos;est un
              investissement en temps et en sérénité. Les architectes qui font le saut ne reviennent
              jamais en arrière.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="border rounded-xl p-6 space-y-4 bg-muted/20">
          <h3 className="font-bold text-lg">Remplacez votre Excel par Chalto</h3>
          <p className="text-sm text-muted-foreground">
            Chalto est conçu pour les architectes et maîtres d&apos;œuvre qui pilotent des chantiers
            avec plusieurs intervenants. Tâches, documents, validation client — tout au même
            endroit.
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
          title="Pourquoi Excel ne suffit plus pour gérer un chantier"
          url="https://chalto.fr/blog/remplacer-excel-chantier"
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
