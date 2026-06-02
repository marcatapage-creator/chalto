import { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, ArrowLeft, CheckCircle } from "lucide-react"
import { ShareButtons } from "@/components/blog/share-buttons"

export const revalidate = false

export const metadata: Metadata = {
  title: "Planning de chantier : comment créer un rétroplanning réaliste ?",
  description:
    "Un planning irréaliste est pire que pas de planning du tout. Les bases pour construire un rétroplanning que les artisans respecteront vraiment.",
  openGraph: {
    title: "Planning de chantier : comment créer un rétroplanning réaliste ? | Chalto",
    description:
      "Un planning irréaliste est pire que pas de planning du tout. Les bases pour construire un rétroplanning que les artisans respecteront vraiment.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=1200&q=80&auto=format&fit=crop",
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
            <span className="text-xs text-muted-foreground">7 juillet 2026 · 7 min de lecture</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight">
            Planning de chantier : comment créer un rétroplanning réaliste ?
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            La plupart des plannings de chantier sont faux dès la première semaine. Pas parce que
            les artisans sont mauvais, mais parce que le planning a été construit dans le mauvais
            sens, avec des données trop optimistes. Voici comment construire un planning qui tient.
          </p>
        </div>

        {/* Hero image */}
        <div className="rounded-xl overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=1200&q=80&auto=format&fit=crop"
            alt="Planning de chantier affiché sur un tableau"
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
            <h2 className="text-2xl font-bold">Rétroplanning vs planning à l&apos;avancement</h2>
            <p className="text-muted-foreground leading-relaxed">
              La différence fondamentale entre ces deux approches tient à la direction de
              construction du planning.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Le <strong>planning à l&apos;avancement</strong> (erreur classique) part du premier
              jour et avance tâche après tâche — en espérant que tout s&apos;enchaîne. Le problème :
              on découvre que la date de fin est intenable... une fois le chantier commencé.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Le <strong>rétroplanning</strong> part de la date de fin souhaitée et remonte.
              L&apos;avantage est immédiat : si la date n&apos;est pas tenable, on le sait{" "}
              <em>avant</em> de signer le contrat — et on peut négocier ou adapter le périmètre en
              conséquence.
            </p>
          </div>

          {/* Section 2 */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">
              Les 6 étapes pour construire un rétroplanning chantier
            </h2>
            <ol className="space-y-4">
              {[
                {
                  step: "01",
                  title: "Fixer la date de fin contractuelle",
                  desc: "C'est le point de départ absolu. Date de livraison, date de réception, ou date d'emménagement du client.",
                },
                {
                  step: "02",
                  title: "Lister tous les corps de métier et leurs durées",
                  desc: "En jours ouvrés, par intervenant. Impliquez chaque artisan pour qu'il valide sa propre estimation.",
                },
                {
                  step: "03",
                  title: "Identifier les contraintes de séquençage",
                  desc: "Gros œuvre avant second œuvre, électricité avant placo, carrelage avant sanitaires... Certaines tâches ne peuvent pas se chevaucher.",
                },
                {
                  step: "04",
                  title: "Ajouter les délais d'approvisionnement matériaux",
                  desc: "Fenêtres sur mesure, carrelage en commande spéciale, chaudière particulière... Comptez 3 à 6 semaines selon les fournisseurs.",
                },
                {
                  step: "05",
                  title: "Intégrer les délais administratifs",
                  desc: "Inspection de conformité, DOE (Dossier des Ouvrages Exécutés), levée de réserves. Ces étapes prennent du temps.",
                },
                {
                  step: "06",
                  title: "Ajouter une marge de 10 à 15 %",
                  desc: "Pour les aléas inévitables : météo, découverte imprévue, retard fournisseur. Ce n'est pas du pessimisme, c'est du réalisme.",
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

          {/* Section 3 */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Les erreurs qui font déraper tous les plannings</h2>
            <p className="text-muted-foreground leading-relaxed">
              Certaines erreurs sont systématiques et prévisibles. Les connaître, c&apos;est déjà à
              moitié les éviter :
            </p>
            <ul className="space-y-3 text-muted-foreground">
              {[
                {
                  label: "Ne pas compter les jours fériés ni les congés artisans",
                  desc: "En été et en fin d'année, les disponibilités réelles chutent fortement.",
                },
                {
                  label: "Planifier sans buffer entre deux corps de métier",
                  desc: "Un retard d'un interlocuteur décale tous les suivants en cascade.",
                },
                {
                  label: "Oublier les délais de livraison matériaux",
                  desc: "Fenêtres, carrelage spécial, équipements techniques : souvent 3 à 6 semaines minimum.",
                },
                {
                  label: "Ne pas prévoir la montée en charge",
                  desc: "Un artisan ne peut pas être sur 3 chantiers simultanément. Vérifiez ses disponibilités réelles.",
                },
                {
                  label: "Ignorer les temps de séchage",
                  desc: "Chape, enduit, peinture : certaines étapes imposent des délais incompressibles avant la suite.",
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

          {/* Section 4 */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">
              Comment impliquer les artisans dans le planning ?
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Un planning imposé de l&apos;extérieur n&apos;est jamais respecté aussi bien
              qu&apos;un planning co-construit. Quelques bonnes pratiques :
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  title: "Faire valider leurs durées",
                  desc: "Chaque artisan valide sa propre estimation de durée. C'est un engagement moral fort.",
                },
                {
                  title: "Réunion de lancement commune",
                  desc: "Rassemblez tous les intervenants au démarrage pour aligner les séquences et les interfaces.",
                },
                {
                  title: "Point hebdomadaire court",
                  desc: "15 minutes suffisent. Pas 2 heures. L'objectif : identifier les décalages avant qu'ils ne s'accumulent.",
                },
                {
                  title: "Planning visible de tous",
                  desc: "Mettez à jour le planning en temps réel et partagez-le avec tous les intervenants.",
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
            <h2 className="text-2xl font-bold">Outils pour gérer son planning de chantier</h2>
            <p className="text-muted-foreground leading-relaxed">
              Chaque outil a ses forces et ses limites. Le bon choix dépend de la taille du chantier
              et du nombre d&apos;intervenants :
            </p>
            <ul className="space-y-3 text-muted-foreground">
              {[
                {
                  label: "Tableur (Excel, Google Sheets)",
                  desc: "Simple mais limité. Difficile à partager en temps réel et peu adapté aux mises à jour fréquentes.",
                },
                {
                  label: "MS Project",
                  desc: "Puissant mais complexe. Courbe d'apprentissage élevée, peu adapté aux petits chantiers.",
                },
                {
                  label: "Notion / Trello",
                  desc: "Pratiques pour la collaboration, mais insuffisants pour modéliser des séquences de chantier complexes.",
                },
                {
                  label: "Chalto",
                  desc: "Suivi de phases et tâches par intervenant, adapté aux professionnels du BTP.",
                },
              ].map((item) => (
                <li key={item.label} className="flex items-start gap-3">
                  <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-foreground">{item.label} :</strong> {item.desc}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Section 6 */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Que faire quand le planning dérape ?</h2>
            <p className="text-muted-foreground leading-relaxed">
              Malgré toutes les précautions, un retard peut survenir. La clé est de réagir vite et
              avec méthode :
            </p>
            <ul className="space-y-3">
              {[
                {
                  label: "Identifier le chemin critique",
                  desc: "Quelles tâches bloquent toutes les autres ? Ce sont elles qu'il faut traiter en priorité.",
                },
                {
                  label: "Négocier rapidement avec le client",
                  desc: "Mieux vaut prévenir tôt qu'annoncer un retard à la dernière minute. La confiance se construit dans la transparence.",
                },
                {
                  label: "Ne jamais rattraper en sacrifiant la qualité",
                  desc: "Supprimer des étapes de contrôle pour gagner du temps génère des problèmes à la réception.",
                },
                {
                  label: "Documenter les causes du retard",
                  desc: "Si le retard n'est pas de votre fait (aléa climatique, livraison tardive), un avenant peut être nécessaire.",
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
          <h3 className="font-bold text-lg">Pilotez le planning de vos chantiers dans Chalto</h3>
          <p className="text-sm text-muted-foreground">
            Chalto structure vos projets en phases et tâches, et vous donne une vue claire de
            l&apos;avancement à tout moment.
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
          title="Planning de chantier : comment créer un rétroplanning réaliste ?"
          url="https://chalto.fr/blog/planning-chantier-retroplanning"
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
