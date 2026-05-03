import { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, ArrowLeft, CheckCircle } from "lucide-react"
import { ShareButtons } from "@/components/blog/share-buttons"

export const revalidate = false

export const metadata: Metadata = {
  title: "Comment coordonner les artisans sur un chantier de rénovation intérieure",
  description:
    "Menuisier, peintre, électricien, carreleur... La coordination des artisans est souvent le point faible d'une rénovation. Voici comment s'organiser pour éviter les retards et les conflits.",
  openGraph: {
    title: "Comment coordonner les artisans sur un chantier de rénovation intérieure | Chalto",
    description:
      "Menuisier, peintre, électricien, carreleur... Voici comment s'organiser pour éviter les retards et les conflits.",
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
        <Link
          href="/blog"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour au blog
        </Link>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Badge variant="outline">Gestion de chantier</Badge>
            <span className="text-xs text-muted-foreground">18 avril 2026 · 7 min de lecture</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight">
            Comment coordonner les artisans sur un chantier de rénovation intérieure
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Un peintre qui arrive avant le plaquiste. Un carreleur qui attend les côtes du
            menuisier. Un électricien sans les plans à jour. La coordination des artisans est
            souvent là où les rénovations déraillent — voici comment structurer ça.
          </p>
        </div>

        <div className="rounded-xl overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&q=80&auto=format&fit=crop"
            alt="Chantier de rénovation intérieure"
            width={1200}
            height={630}
            className="w-full object-cover aspect-video"
            priority
          />
        </div>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
          <div className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              Une rénovation intérieure implique rarement un seul corps de métier. Dès qu&apos;on
              redistribue l&apos;espace, les intervenants se multiplient — et chacun a ses
              contraintes d&apos;agenda, ses besoins en information et ses dépendances vis-à-vis des
              autres.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              La coordination n&apos;est pas une compétence innée — c&apos;est une organisation à
              mettre en place dès la phase de conception.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold">1. Respecter l&apos;ordre des interventions</h2>
            <p className="text-muted-foreground leading-relaxed">
              En rénovation, chaque corps de métier dépend du précédent. Ignorer cet ordre expose à
              des reprises coûteuses. La séquence type :
            </p>
            <ol className="space-y-3 text-muted-foreground list-none">
              {[
                [
                  "Démolition",
                  "Cloisons abattues, doublages retirés, anciens revêtements enlevés.",
                ],
                ["Gros œuvre secondaire", "Cloisons neuves, redistribution des espaces."],
                [
                  "Plomberie & électricité en gaine",
                  "Toutes les gaines avant fermeture des cloisons.",
                ],
                ["Isolation & plaquisterie", "Fermeture des cloisons, pose des plaques de plâtre."],
                ["Menuiserie intérieure", "Portes, placards, habillages — cloisons terminées."],
                ["Carrelage & revêtements de sol", "Avant les finitions, après la plomberie."],
                ["Peinture & finitions", "Toujours en dernier."],
              ].map(([titre, desc], i) => (
                <li key={titre} className="flex items-start gap-3">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  <span>
                    <strong className="text-foreground">{titre}</strong> — {desc}
                  </span>
                </li>
              ))}
            </ol>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold">2. Centraliser les plans et documents</h2>
            <p className="text-muted-foreground leading-relaxed">
              Le piège classique : envoyer les plans par email à chaque artisan séparément. Quand
              vous modifiez une cote, vous devez re-notifier tout le monde — sans garantie
              qu&apos;ils travaillent sur la dernière version.
            </p>
            <ul className="space-y-2 text-muted-foreground">
              {[
                "Désignez un document unique « plan de référence » accessible à tous",
                "Numérotez les révisions (v1, v2, v3...) pour éviter les confusions",
                "Notifiez chaque artisan concerné dès qu'une modification impacte son lot",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-1" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold">3. Organiser une réunion de démarrage collective</h2>
            <p className="text-muted-foreground leading-relaxed">
              Avant le premier coup de marteau, réunissez tous les artisans sur place — même 30
              minutes. Un plombier qui sait que le carreleur arrive trois semaines après lui fera
              ses réservations correctement. Un électricien qui connaît l&apos;emplacement final du
              mobilier sur mesure anticipera mieux ses prises.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              C&apos;est aussi l&apos;occasion de valider le planning ensemble et de désigner un
              référent à contacter en cas de problème — souvent l&apos;architecte d&apos;intérieur.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold">4. Gérer les imprévus sans tout réorganiser</h2>
            <p className="text-muted-foreground leading-relaxed">
              En rénovation intérieure, l&apos;imprévu est la règle. Tuyaux non conformes, mur
              porteur non signalé, livraison retardée — chaque aléa peut décaler la chaîne entière.
            </p>
            <ul className="space-y-2 text-muted-foreground">
              {[
                "Intégrez des « tampons » : 2 à 3 jours de marge entre chaque corps de métier",
                "Communiquez les modifications de planning dès que vous les connaissez",
                "Documentez chaque décision sur chantier — une modification verbale oubliée devient une facture imprévue",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-1" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold">5. Utiliser les bons outils</h2>
            <p className="text-muted-foreground leading-relaxed">
              La coordination par WhatsApp et email fonctionne jusqu&apos;à un certain niveau. Dès
              que le projet implique 4 artisans ou plus, les échanges deviennent difficiles à suivre
              : qui a vu quoi, qui a confirmé quoi, quelle version du plan est la bonne ?
            </p>
            <div className="space-y-3 p-4 bg-muted/30 rounded-xl text-sm text-muted-foreground">
              <p className="font-semibold text-foreground">
                Ce que doit permettre votre outil de coordination :
              </p>
              <ul className="space-y-1">
                <li>— Partager les plans en version unique, accessible à tous</li>
                <li>— Notifier les artisans concernés quand un document est mis à jour</li>
                <li>— Suivre l&apos;avancement de chaque lot (en cours / terminé / en attente)</li>
                <li>— Garder un historique des décisions</li>
                <li>— Permettre au client de suivre l&apos;avancement sans vous appeler</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border rounded-xl p-6 space-y-4 bg-muted/20">
          <h3 className="font-bold text-lg">Coordonnez vos artisans depuis un seul endroit</h3>
          <p className="text-sm text-muted-foreground">
            Plans partagés, tâches par corps de métier, suivi de chantier, validation client —
            Chalto centralise tout ce dont vous avez besoin pour piloter une rénovation sans chaos.
          </p>
          <Button asChild>
            <Link href="/#waitlist">
              Commencer gratuitement
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <ShareButtons
          title="Comment coordonner les artisans sur un chantier de rénovation intérieure"
          url="https://chalto.fr/blog/coordonner-artisans-renovation"
        />

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
