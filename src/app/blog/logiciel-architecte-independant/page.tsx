import { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, ArrowLeft, CheckCircle, X } from "lucide-react"

export const metadata: Metadata = {
  title: "Quel logiciel pour un architecte indépendant en 2026 ?",
  description:
    "Archipad, Ooti, Chalto... Quel logiciel choisir quand on est architecte indépendant en 2026 ? Comparatif honnête des meilleurs outils pour gérer ses projets, ses clients et ses documents.",
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
            <Badge variant="outline">Outils</Badge>
            <span className="text-xs text-muted-foreground">18 avril 2026 · 8 min de lecture</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight">
            Quel logiciel pour un architecte indépendant en 2026 ?
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Entre les outils trop complexes, trop chers ou pas adaptés au travail en solo, difficile
            de s&apos;y retrouver. On fait le point sur ce qui existe vraiment et ce qui vaut le
            coup.
          </p>
        </div>

        {/* Contenu */}
        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
          {/* Intro */}
          <div className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              En tant qu&apos;architecte indépendant, vous portez plusieurs casquettes à la fois :
              conception, relation client, gestion administrative, coordination des entreprises. Les
              grands cabinets ont des équipes dédiées pour chacune de ces tâches. Vous, vous avez
              besoin d&apos;un outil qui fait tout — sans vous faire perdre du temps à
              l&apos;apprendre.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Le marché des logiciels pour architectes est paradoxalement à la fois très fourni et
              très décevant. Soit les outils sont pensés pour les grandes agences et coûtent une
              fortune, soit ils se limitent à la facturation et ignorent tout ce qui touche au suivi
              de projet et à la relation client.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Voici notre sélection honnête des meilleurs outils en 2026, avec leurs vrais avantages
              et leurs vraies limites.
            </p>
          </div>

          {/* Ce dont un archi indépendant a besoin */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">
              Ce dont un architecte indépendant a vraiment besoin
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Avant de comparer les outils, posons les bases. Un architecte indépendant a besoin de
              gérer :
            </p>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-1" />
                <span>Ses projets et leur avancement (phases, jalons, documents)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-1" />
                <span>La relation client (validation de plans, comptes-rendus, échanges)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-1" />
                <span>La coordination des entreprises (plombier, électricien, maçon...)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-1" />
                <span>Ses documents (CCTP, notices, permis de construire, DOE)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-1" />
                <span>Sa facturation et ses honoraires</span>
              </li>
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              Aucun outil ne fait tout parfaitement. L&apos;enjeu c&apos;est de trouver celui qui
              couvre le mieux vos priorités sans vous obliger à jongler entre 5 applications
              différentes.
            </p>
          </div>

          {/* Archipad */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Archipad — Le spécialiste du suivi de chantier</h2>
            <p className="text-muted-foreground leading-relaxed">
              Archipad est probablement l&apos;outil le plus connu des architectes français. Avec
              plus de 150 000 utilisateurs, il s&apos;est imposé comme la référence pour le suivi de
              chantier sur iPad et iPhone.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Son point fort : la gestion des comptes-rendus de chantier, des réserves et des OPR
              (Opérations Préalables à la Réception). Sur le terrain, c&apos;est difficile à battre.
              L&apos;interface est pensée pour être utilisée avec les mains sales et le soleil dans
              les yeux.
            </p>
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-xl">
              <div className="space-y-2">
                <p className="text-sm font-semibold text-primary">Points forts</p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>✅ Suivi chantier excellent</li>
                  <li>✅ Mode offline</li>
                  <li>✅ Interface mobile soignée</li>
                  <li>✅ Comptes-rendus automatisés</li>
                </ul>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-semibold text-destructive">Limites</p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>❌ Pas de validation client</li>
                  <li>❌ Pas de gestion de projet globale</li>
                  <li>❌ Prix élevé pour un indépendant</li>
                  <li>❌ Pas multi-métiers</li>
                </ul>
              </div>
            </div>
            <p className="text-sm text-muted-foreground italic">
              Archipad est idéal si votre priorité c&apos;est le suivi terrain. Moins adapté si vous
              cherchez un outil de relation client ou de gestion documentaire complète.
            </p>
          </div>

          {/* Ooti */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Ooti — La solution complète pour les agences</h2>
            <p className="text-muted-foreground leading-relaxed">
              Ooti se positionne comme le logiciel de gestion tout-en-un pour les agences
              d&apos;architecture françaises. Planning, facturation, gestion des ressources
              humaines, suivi des honoraires — c&apos;est complet.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Le problème pour un indépendant : Ooti est pensé pour des structures avec plusieurs
              collaborateurs. La courbe d&apos;apprentissage est importante et le prix mensuel peut
              représenter un frein quand on démarre ou qu&apos;on travaille seul.
            </p>
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-xl">
              <div className="space-y-2">
                <p className="text-sm font-semibold text-primary">Points forts</p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>✅ Très complet</li>
                  <li>✅ Facturation intégrée</li>
                  <li>✅ Fait pour les architectes FR</li>
                  <li>✅ Planning et ressources</li>
                </ul>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-semibold text-destructive">Limites</p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>❌ Complexe pour un indépendant</li>
                  <li>❌ Prix élevé</li>
                  <li>❌ Pas de validation client simple</li>
                  <li>❌ Pas mobile-first</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Notion / Trello */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">
              Notion, Trello, Google Drive — Les bricolages créatifs
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Beaucoup d&apos;architectes indépendants utilisent une combinaison d&apos;outils
              généralistes : Notion pour les notes et le suivi, Trello pour les tâches, Google Drive
              pour les documents, WhatsApp pour la relation client.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Ça fonctionne — jusqu&apos;à un certain point. Quand les projets s&apos;accumulent,
              quand un client demande où en est son dossier, quand il faut retrouver la dernière
              version d&apos;un plan validé... le château de cartes s&apos;effondre.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Le vrai coût de ces solutions bricolées, ce n&apos;est pas leur prix — c&apos;est le
              temps perdu à tout organiser manuellement et les erreurs qui en découlent.
            </p>
          </div>

          {/* Chalto */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">
              Chalto — Pensé pour la relation client et la validation
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Chalto prend le problème sous un angle différent. Plutôt que de vouloir tout faire, il
              se concentre sur ce qui fait vraiment perdre du temps aux architectes indépendants :
              les allers-retours avec les clients pour valider les documents.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Le principe est simple : vous uploadez vos plans, notices ou CCTP dans Chalto, vous
              envoyez un lien sécurisé à votre client, et il approuve ou commente sans avoir à créer
              un compte. Toutes les validations sont horodatées et archivées automatiquement.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Au-delà de la validation, Chalto gère le cycle de vie complet d&apos;un projet — du
              cadrage à la réception — avec un stepper visuel qui indique clairement à quelle phase
              vous êtes. Et comme il est multi-métiers, vous pouvez y inviter vos prestataires
              (plombier, électricien...) qui voient leurs tâches directement.
            </p>
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-xl">
              <div className="space-y-2">
                <p className="text-sm font-semibold text-primary">Points forts</p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>✅ Validation client en 1 clic</li>
                  <li>✅ Mobile-first et PWA</li>
                  <li>✅ Multi-métiers</li>
                  <li>✅ Prix accessible</li>
                  <li>✅ Simple à prendre en main</li>
                </ul>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-semibold text-destructive">Limites</p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>❌ Pas de facturation intégrée</li>
                  <li>❌ Pas de plans 3D</li>
                  <li>❌ Nouveau sur le marché</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Tableau comparatif */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Comparatif synthétique</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 pr-4 font-semibold">Outil</th>
                    <th className="text-left py-3 pr-4 font-semibold">Prix</th>
                    <th className="text-left py-3 pr-4 font-semibold">Validation client</th>
                    <th className="text-left py-3 font-semibold">Mobile</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b">
                    <td className="py-3 pr-4 font-medium text-foreground">Archipad</td>
                    <td className="py-3 pr-4">Sur devis</td>
                    <td className="py-3 pr-4">
                      <X className="h-4 w-4 text-destructive" />
                    </td>
                    <td className="py-3">
                      <CheckCircle className="h-4 w-4 text-primary" />
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 pr-4 font-medium text-foreground">Ooti</td>
                    <td className="py-3 pr-4">~100€/mois</td>
                    <td className="py-3 pr-4">
                      <X className="h-4 w-4 text-destructive" />
                    </td>
                    <td className="py-3">
                      <X className="h-4 w-4 text-destructive" />
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 pr-4 font-medium text-foreground">Notion + Drive</td>
                    <td className="py-3 pr-4">Gratuit</td>
                    <td className="py-3 pr-4">
                      <X className="h-4 w-4 text-destructive" />
                    </td>
                    <td className="py-3">
                      <CheckCircle className="h-4 w-4 text-primary" />
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 font-medium text-foreground">Chalto</td>
                    <td className="py-3 pr-4">Gratuit → 29€/mois</td>
                    <td className="py-3 pr-4">
                      <CheckCircle className="h-4 w-4 text-primary" />
                    </td>
                    <td className="py-3">
                      <CheckCircle className="h-4 w-4 text-primary" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Conclusion */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Notre recommandation</h2>
            <p className="text-muted-foreground leading-relaxed">
              Il n&apos;existe pas de logiciel parfait pour l&apos;architecte indépendant — mais
              voici comment raisonner selon votre priorité :
            </p>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="font-semibold text-foreground shrink-0">Suivi terrain →</span>
                <span>Archipad reste la référence sur chantier</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold text-foreground shrink-0">
                  Gestion globale agence →
                </span>
                <span>Ooti si vous avez plusieurs collaborateurs</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold text-foreground shrink-0">
                  Relation client + validation →
                </span>
                <span>
                  Chalto est le seul outil vraiment pensé pour simplifier les échanges avec vos
                  clients et prestataires
                </span>
              </li>
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              Si vous perdez du temps dans les allers-retours par email avec vos clients, dans la
              recherche de la dernière version validée d&apos;un plan, ou dans la coordination de
              vos entreprises — Chalto a été construit exactement pour ça.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="border rounded-xl p-6 space-y-4 bg-muted/20">
          <h3 className="font-bold text-lg">Essayez Chalto gratuitement</h3>
          <p className="text-sm text-muted-foreground">
            Créez votre premier projet, uploadez un document et envoyez un lien de validation à
            votre client — en moins de 5 minutes.
          </p>
          <Button asChild>
            <Link href="/#waitlist">
              Commencer gratuitement
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Navigation articles */}
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
