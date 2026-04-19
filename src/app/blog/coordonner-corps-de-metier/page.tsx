import { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, ArrowLeft, CheckCircle } from "lucide-react"

export const metadata: Metadata = {
  title: "Comment coordonner plusieurs corps de métier sur un chantier",
  description:
    "Architectes, plombiers, électriciens — gérer plusieurs intervenants sur un chantier est un défi quotidien. Voici les meilleures pratiques pour coordonner efficacement.",
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
            <span className="text-xs text-muted-foreground">18 avril 2026 · 7 min de lecture</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight">
            Comment coordonner plusieurs corps de métier sur un chantier
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Architectes, plombiers, électriciens, menuisiers — faire travailler plusieurs
            intervenants ensemble sans chaos, c&apos;est tout un art. Voici les méthodes qui
            fonctionnent vraiment.
          </p>
        </div>

        {/* Contenu */}
        <div className="space-y-8">
          {/* Intro */}
          <div className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              Un chantier de rénovation implique en moyenne 4 à 8 corps de métier différents. Maçon,
              plombier, électricien, menuisier, carreleur, peintre — chacun a son planning, ses
              contraintes, ses besoins en information. Et c&apos;est à l&apos;architecte ou au
              maître d&apos;œuvre de faire en sorte que tout s&apos;enchaîne sans friction.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Dans les faits, la coordination des corps de métier est l&apos;une des sources de
              stress les plus fréquentes dans les projets de construction. Un intervenant qui
              commence trop tôt, un autre qui attend des informations, un troisième qui découvre le
              jour J que les saignées n&apos;ont pas été faites — ce sont des situations qui coûtent
              du temps, de l&apos;argent et de la crédibilité.
            </p>
          </div>

          {/* Les erreurs classiques */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Les erreurs les plus fréquentes</h2>
            <p className="text-muted-foreground leading-relaxed">
              Avant de parler solutions, identifions les problèmes récurrents que rencontrent la
              plupart des architectes et maîtres d&apos;œuvre :
            </p>
            <ul className="space-y-3 text-muted-foreground">
              {[
                {
                  title: "L'information en silo",
                  desc: "Chaque intervenant ne sait que ce qui le concerne directement. Personne n'a la vision globale du chantier. Résultat : des surprises.",
                },
                {
                  title: "Les plans pas à jour",
                  desc: "L'électricien travaille sur la version V2 des plans quand la V3 a déjà été validée. Les modifications ne sont pas communiquées à temps.",
                },
                {
                  title: "La coordination par téléphone",
                  desc: "Les décisions se prennent à l'oral, sans trace écrite. Six mois plus tard, personne ne se souvient de ce qui avait été convenu.",
                },
                {
                  title: "Les dépendances non anticipées",
                  desc: "Le carreleur arrive avant que la plomberie soit terminée. Le menuisier ne peut pas poser ses fenêtres parce que la maçonnerie n'est pas sèche.",
                },
                {
                  title: "Le manque de visibilité client",
                  desc: "Le maître d'ouvrage ne sait pas où en sont les travaux. Il appelle, il stresse, il débarque sur le chantier au mauvais moment.",
                },
              ].map((item) => (
                <li key={item.title} className="flex items-start gap-3">
                  <span className="text-destructive font-bold shrink-0">✗</span>
                  <span>
                    <strong className="text-foreground">{item.title}.</strong> {item.desc}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Les bonnes pratiques */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Les 5 pratiques qui changent tout</h2>

            {/* Pratique 1 */}
            <div className="space-y-3">
              <h3 className="text-xl font-semibold">
                1. Définir les dépendances avant de démarrer
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Avant le premier coup de marteau, cartographiez les dépendances entre les corps de
                métier. Qui doit finir avant que l&apos;autre puisse commencer ? Quelles
                informations chaque intervenant a-t-il besoin et quand ?
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Cette cartographie simple évite la majorité des blocages. Elle peut prendre la forme
                d&apos;un tableau ou d&apos;un planning sommaire — l&apos;essentiel est que tout le
                monde l&apos;ait en tête dès le départ.
              </p>
            </div>

            {/* Pratique 2 */}
            <div className="space-y-3">
              <h3 className="text-xl font-semibold">
                2. Centraliser les documents accessibles à tous
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Chaque intervenant doit avoir accès aux plans et documents qui le concernent — et
                uniquement ceux-là. Un électricien n&apos;a pas besoin de voir les plans de cuisine,
                mais il doit impérativement avoir les derniers plans électriques validés.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                L&apos;enjeu c&apos;est la version. Tous les intervenants doivent travailler sur la
                même version des plans. Un espace partagé avec des accès ciblés par intervenant
                règle ce problème à la source.
              </p>
            </div>

            {/* Pratique 3 */}
            <div className="space-y-3">
              <h3 className="text-xl font-semibold">3. Formaliser les échanges par écrit</h3>
              <p className="text-muted-foreground leading-relaxed">
                Tout ce qui est décidé oralement doit être confirmé par écrit. Ce n&apos;est pas une
                question de méfiance — c&apos;est une question de mémoire. Sur un chantier de 6
                mois, personne ne se souvient de ce qui a été dit lors d&apos;une réunion il y a 3
                mois.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Le compte-rendu de chantier hebdomadaire est votre meilleur outil. Court, factuel,
                distribué à tous les intervenants le jour même. Il prend 20 minutes à rédiger et
                peut vous éviter des semaines de litiges.
              </p>
            </div>

            {/* Pratique 4 */}
            <div className="space-y-3">
              <h3 className="text-xl font-semibold">
                4. Donner à chaque intervenant une vue sur ses tâches
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Plutôt que de gérer tout en central et de tout redistribuer par email, donnez à
                chaque corps de métier accès à ses propres tâches. L&apos;électricien voit ce
                qu&apos;il doit faire, dans quel ordre, et peut mettre à jour son statut
                directement.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Ce changement d&apos;approche réduit drastiquement les appels entrants.
                L&apos;intervenant ne vous appelle plus pour savoir ce qu&apos;il doit faire — il le
                voit. Et vous voyez en temps réel où en sont les travaux sans avoir à appeler chacun
                individuellement.
              </p>
            </div>

            {/* Pratique 5 */}
            <div className="space-y-3">
              <h3 className="text-xl font-semibold">5. Anticiper les suggestions terrain</h3>
              <p className="text-muted-foreground leading-relaxed">
                Les intervenants qui travaillent sur le chantier voient des choses que vous ne voyez
                pas depuis votre bureau. Un plombier peut identifier qu&apos;une saignée
                supplémentaire serait nécessaire avant que vous ne le réalisiez vous-même.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Créez un canal pour que ces suggestions remontent facilement — et restez maître de
                la décision finale. Un intervenant qui peut suggérer des améliorations est un
                intervenant qui s&apos;implique dans la qualité du chantier.
              </p>
            </div>
          </div>

          {/* Les outils */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Quels outils utiliser ?</h2>
            <p className="text-muted-foreground leading-relaxed">
              La bonne nouvelle : vous n&apos;avez pas besoin d&apos;outils complexes pour bien
              coordonner un chantier. Les meilleurs architectes utilisent souvent des solutions
              simples mais rigoureusement appliquées.
            </p>

            <div className="space-y-4">
              {[
                {
                  tool: "WhatsApp / SMS",
                  usage: "Urgences et communication informelle",
                  limit: "Pas de traçabilité, mélange vie pro/perso, informations perdues",
                },
                {
                  tool: "Email",
                  usage: "Documents officiels et comptes-rendus",
                  limit: "Lent, pas de suivi des statuts, versions multiples",
                },
                {
                  tool: "Google Drive / Dropbox",
                  usage: "Partage de fichiers",
                  limit: "Pas de workflow de validation, pas de gestion des tâches",
                },
                {
                  tool: "Chalto",
                  usage: "Coordination complète — tâches, documents, validation",
                  limit: "Nouveau sur le marché — vos prestataires devront adopter l'outil",
                },
              ].map((item) => (
                <div key={item.tool} className="p-4 border rounded-xl space-y-2">
                  <p className="font-semibold">{item.tool}</p>
                  <p className="text-sm text-muted-foreground">
                    <span className="text-primary font-medium">Usage : </span>
                    {item.usage}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <span className="text-destructive font-medium">Limite : </span>
                    {item.limit}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Ce que Chalto apporte */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Comment Chalto simplifie la coordination</h2>
            <p className="text-muted-foreground leading-relaxed">
              Chalto a été conçu en partant d&apos;un constat simple : la coordination entre un
              architecte, ses clients et ses prestataires se fait encore majoritairement par email
              et WhatsApp en France. C&apos;est inefficace et risqué.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Avec Chalto, chaque prestataire reçoit un lien d&apos;invitation sécurisé. Il accède à
              ses tâches directement, sans créer de compte complexe. Il peut mettre à jour les
              statuts, consulter les documents qui le concernent et suggérer des tâches
              supplémentaires — que vous validez ou non en tant qu&apos;architecte.
            </p>
            <ul className="space-y-2 text-muted-foreground">
              {[
                "Chaque prestataire voit uniquement ses tâches",
                "Les documents sont centralisés par projet",
                "Les suggestions terrain remontent directement",
                "Vous gardez le contrôle sur toutes les décisions",
                "Le client voit l'avancement sans vous appeler",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Conclusion */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">En résumé</h2>
            <p className="text-muted-foreground leading-relaxed">
              Coordonner plusieurs corps de métier efficacement, c&apos;est avant tout une question
              d&apos;organisation et d&apos;information. Les bons outils aident — mais ils ne
              remplacent pas les bonnes pratiques.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              La règle d&apos;or : tout le monde doit avoir accès à la bonne information au bon
              moment. Ni trop, ni trop peu. Un électricien qui a les plans à jour et ses tâches
              claires n&apos;a pas besoin de vous appeler. Et vous, vous pouvez vous concentrer sur
              ce qui compte vraiment : la conception et la qualité du projet.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="border rounded-xl p-6 space-y-4 bg-muted/20">
          <h3 className="font-bold text-lg">Coordonnez vos chantiers avec Chalto</h3>
          <p className="text-sm text-muted-foreground">
            Invitez vos prestataires, assignez des tâches et suivez l&apos;avancement de vos
            chantiers en temps réel. Gratuit pour commencer.
          </p>
          <Button asChild>
            <Link href="/#waitlist">
              Commencer gratuitement
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

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
