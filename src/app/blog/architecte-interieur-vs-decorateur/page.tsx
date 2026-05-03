import { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, ArrowLeft, CheckCircle } from "lucide-react"
import { ShareButtons } from "@/components/blog/share-buttons"

export const revalidate = false

export const metadata: Metadata = {
  title: "Architecte d'intérieur vs décorateur : quelle différence concrète ?",
  description:
    "Maîtrise d'œuvre, plans techniques, suivi de chantier... Qui fait quoi ? Les vraies différences entre architecte d'intérieur et décorateur pour bien choisir selon votre projet.",
  openGraph: {
    title: "Architecte d'intérieur vs décorateur : quelle différence concrète ? | Chalto",
    description:
      "Maîtrise d'œuvre, plans techniques, suivi de chantier... Qui fait quoi ? Les vraies différences entre architecte d'intérieur et décorateur.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&q=80&auto=format&fit=crop",
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
            <Badge variant="outline">Design d&apos;intérieur</Badge>
            <span className="text-xs text-muted-foreground">4 avril 2026 · 7 min de lecture</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight">
            Architecte d&apos;intérieur vs décorateur : quelle différence concrète ?
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            La confusion est fréquente, même chez les clients avertis. L&apos;un dessine des plans,
            l&apos;autre choisit des tissus — mais la réalité est plus nuancée. Voici comment
            distinguer les deux professions et savoir laquelle correspond à votre projet.
          </p>
        </div>

        <div className="rounded-xl overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&q=80&auto=format&fit=crop"
            alt="Intérieur design contemporain"
            width={1200}
            height={630}
            className="w-full object-cover aspect-video"
            priority
          />
        </div>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
          <div className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              &ldquo;Est-ce que vous êtes décorateur ou architecte d&apos;intérieur ?&rdquo; La
              question revient souvent en premier rendez-vous client. Et la réponse dépasse la
              simple sémantique : derrière ces deux intitulés se cachent des périmètres
              d&apos;intervention, des responsabilités juridiques et des modes de travail très
              différents.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Pour un client qui envisage une rénovation, choisir le bon professionnel peut faire la
              différence entre un chantier maîtrisé et une série de malentendus coûteux.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold">
              Le décorateur d&apos;intérieur : l&apos;esthétique avant tout
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Le titre de &ldquo;décorateur d&apos;intérieur&rdquo; n&apos;est pas protégé par la
              loi. N&apos;importe qui peut s&apos;en réclamer, sans diplôme ni accréditation
              obligatoire. Dans les faits, les bons décorateurs sont souvent diplômés d&apos;écoles
              spécialisées (Camondo, Boulle, ESAD...) et exercent avec une vraie expertise
              stylistique.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Leur périmètre d&apos;intervention se concentre sur l&apos;ambiance et le mobilier :
              choix des matériaux, des couleurs, des revêtements, de l&apos;éclairage et du
              mobilier. Ils créent des planches tendances, sélectionnent des fournisseurs,
              accompagnent le client dans ses achats.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Ce qu&apos;ils ne font pas, ou très rarement : modifier la structure d&apos;un
              appartement, établir des plans techniques pour les artisans, assurer la maîtrise
              d&apos;œuvre d&apos;un chantier ou engager leur responsabilité sur la conformité des
              travaux.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold">
              L&apos;architecte d&apos;intérieur : de la conception au chantier
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Le titre d&apos;&ldquo;architecte d&apos;intérieur&rdquo; n&apos;est pas davantage
              protégé en France — contrairement à &ldquo;architecte&rdquo; tout court, qui exige
              l&apos;inscription à l&apos;Ordre. Mais les architectes d&apos;intérieur sérieux sont
              diplômés d&apos;une école reconnue (ESAG Penninghen, ESAD, INSEAC...) et souvent
              membres de la CFAI ou de l&apos;UNAID.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Ce qui les distingue fondamentalement : ils interviennent sur l&apos;espace dans sa
              globalité. Plans côtés, coupes, élévations, suivi de chantier, coordination des corps
              de métier — ils pilotent l&apos;ensemble du projet, pas seulement son habillage
              esthétique.
            </p>
            <ul className="space-y-2 text-muted-foreground">
              {[
                "Conception spatiale : redistribution des pièces, cloisons, ouvertures",
                "Plans techniques transmis aux artisans (plombier, électricien, menuisier)",
                "Maîtrise d'œuvre : suivi de chantier, réception des travaux",
                "Consultation des entreprises, analyse des devis, sélection des prestataires",
                "Direction artistique : matériaux, mobilier sur mesure, éclairage, couleurs",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-1" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Ce que chacun fait — synthèse</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 pr-4 font-semibold">Prestation</th>
                    <th className="text-left py-3 pr-4 font-semibold">Décorateur</th>
                    <th className="text-left py-3 font-semibold">Architecte d&apos;intérieur</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  {[
                    ["Planche tendances / ambiance", "✅", "✅"],
                    ["Choix mobilier et matériaux", "✅", "✅"],
                    ["Plans techniques côtés", "❌", "✅"],
                    ["Coordination des artisans", "Partielle", "✅"],
                    ["Suivi de chantier", "❌", "✅"],
                    ["Redistribution spatiale", "❌", "✅"],
                    ["Responsabilité maîtrise d'œuvre", "❌", "✅"],
                  ].map(([label, deco, archi]) => (
                    <tr key={label} className="border-b last:border-0">
                      <td className="py-3 pr-4 font-medium text-foreground">{label}</td>
                      <td className="py-3 pr-4">{deco}</td>
                      <td className="py-3">{archi}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Quand choisir l&apos;un ou l&apos;autre ?</h2>
            <p className="text-muted-foreground leading-relaxed">
              La réponse dépend de l&apos;ampleur et de la nature de votre projet.
            </p>
            <div className="space-y-4 p-4 bg-muted/30 rounded-xl">
              <div className="space-y-2">
                <p className="text-sm font-semibold">Un décorateur suffit si :</p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>
                    — Vous ne touchez pas à la structure (pas de cloisons abattues, pas de
                    déplacement de cuisine)
                  </li>
                  <li>
                    — Le projet se limite à rafraîchir l&apos;ambiance : peintures, revêtements,
                    mobilier
                  </li>
                  <li>— Vous n&apos;avez pas besoin de plans à remettre à des artisans</li>
                </ul>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-semibold">
                  Un architecte d&apos;intérieur s&apos;impose si :
                </p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>
                    — Vous réorganisez l&apos;espace (cloisons, ouvertures, redistribution des
                    pièces)
                  </li>
                  <li>— Plusieurs corps de métier interviennent et doivent être coordonnés</li>
                  <li>— Vous avez besoin d&apos;un interlocuteur unique qui pilote le chantier</li>
                  <li>
                    — Le budget travaux dépasse 30 000 € et les enjeux de responsabilité sont réels
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold">
              Ce qu&apos;ils ont en commun : les mêmes défis au quotidien
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Malgré leurs différences, décorateurs et architectes d&apos;intérieur partagent les
              mêmes frictions opérationnelles : des clients qui tardent à valider, des documents qui
              s&apos;éparpillent par email, des artisans qui attendent des confirmations avant
              d&apos;intervenir.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              La gestion de la relation client — faire approuver une planche tendances, valider un
              plan d&apos;aménagement, obtenir un accord écrit avant le début des travaux — est
              souvent le point de friction le plus chronophage, quelle que soit la casquette que
              vous portez.
            </p>
          </div>
        </div>

        <div className="border rounded-xl p-6 space-y-4 bg-muted/20">
          <h3 className="font-bold text-lg">Simplifiez la validation client sur vos projets</h3>
          <p className="text-sm text-muted-foreground">
            Planches tendances, plans d&apos;aménagement, cahier des charges — envoyez un lien
            sécurisé à votre client et obtenez son accord en un clic. Tout est archivé.
          </p>
          <Button asChild>
            <Link href="/#waitlist">
              Essayer Chalto gratuitement
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <ShareButtons
          title="Architecte d'intérieur vs décorateur : quelle différence concrète ?"
          url="https://chalto.fr/blog/architecte-interieur-vs-decorateur"
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
