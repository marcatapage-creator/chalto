import { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, ArrowLeft, CheckCircle } from "lucide-react"
import { ShareButtons } from "@/components/blog/share-buttons"

export const revalidate = false

export const metadata: Metadata = {
  title: "Cahier des charges rénovation intérieure : modèle et conseils",
  description:
    "Un bon cahier des charges évite les malentendus avec les artisans et protège votre client. Structure type, exemples concrets et conseils pour le rédiger efficacement.",
  openGraph: {
    title: "Cahier des charges rénovation intérieure : modèle et conseils | Chalto",
    description:
      "Structure type, exemples concrets et conseils pour rédiger un cahier des charges de rénovation intérieure efficace.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&q=80&auto=format&fit=crop",
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
            <Badge variant="outline">Documents</Badge>
            <span className="text-xs text-muted-foreground">2 mai 2026 · 6 min de lecture</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight">
            Cahier des charges rénovation intérieure : modèle et conseils
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Sans cahier des charges écrit, chaque artisan interprète le projet à sa façon. Résultat
            : des finitions qui ne correspondent pas aux attentes du client, des litiges, et des
            travaux à reprendre. Voici comment rédiger ce document essentiel.
          </p>
        </div>

        <div className="rounded-xl overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&q=80&auto=format&fit=crop"
            alt="Rédaction d'un cahier des charges de rénovation"
            width={1200}
            height={630}
            className="w-full object-cover aspect-video"
            priority
          />
        </div>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
          <div className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              Le cahier des charges de rénovation intérieure est le document qui traduit les
              intentions créatives et les exigences du client en prescriptions concrètes pour les
              artisans. C&apos;est le pont entre la vision de l&apos;architecte d&apos;intérieur et
              l&apos;exécution sur le chantier.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Sans ce document, chaque artisan interprète le projet à sa façon. Le menuisier choisit
              le bois qu&apos;il a en stock. Le peintre prend la teinte standard la plus proche. Le
              carreleur pose les joints à sa façon habituelle. Résultat : un chantier techniquement
              réalisé, mais qui ne ressemble pas à ce que le client avait validé.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Cahier des charges vs CCTP : quelle différence ?</h2>
            <p className="text-muted-foreground leading-relaxed">
              Les deux termes sont souvent confondus. La différence tient à leur niveau de
              formalisme et à leur usage.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 pr-4 font-semibold"> </th>
                    <th className="text-left py-3 pr-4 font-semibold">Cahier des charges</th>
                    <th className="text-left py-3 font-semibold">CCTP</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  {[
                    [
                      "Usage principal",
                      "Rénovation intérieure / décoration",
                      "Construction neuve, marchés publics",
                    ],
                    ["Niveau de détail", "Fonctionnel + esthétique", "Technique et normatif"],
                    ["Destinataires", "Artisans sélectionnés", "Entreprises en appel d'offres"],
                    ["Ton", "Descriptif, orienté ambiance", "Normatif, référencement DTU"],
                  ].map(([label, cdc, cctp]) => (
                    <tr key={label} className="border-b last:border-0">
                      <td className="py-3 pr-4 font-medium text-foreground">{label}</td>
                      <td className="py-3 pr-4">{cdc}</td>
                      <td className="py-3">{cctp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              En rénovation intérieure privée, le cahier des charges est souvent suffisant. Le CCTP
              devient pertinent dès qu&apos;il y a un marché formalisé avec consultation
              d&apos;entreprises en concurrence.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold">
              Ce que doit contenir un cahier des charges de rénovation intérieure
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Un cahier des charges efficace couvre cinq grandes sections :
            </p>
            <ul className="space-y-3 text-muted-foreground">
              {[
                [
                  "Présentation générale du projet",
                  "Adresse, surface, nombre de pièces, contexte (appartement haussmannien, maison contemporaine...), objectif de la rénovation et contraintes spécifiques (copropriété, bâtiment classé, accès difficile).",
                ],
                [
                  "Description pièce par pièce",
                  "Pour chaque espace : dimensions, interventions prévues, ambiance souhaitée, références visuelles si disponibles. C'est ici que les planches tendances viennent appuyer le texte.",
                ],
                [
                  "Prescriptions par corps de métier",
                  "Ce que chaque artisan doit réaliser, avec les matériaux spécifiés, les marques ou références retenues, les tolérances acceptables. Ne laissez rien au choix de l'artisan si ce choix a une incidence esthétique.",
                ],
                [
                  "Exigences de finitions",
                  "Qualité d'aspect attendue (peinture : lisse / satiné / mat), épaisseur des joints, traitement des angles, raccords entre matériaux. C'est souvent le niveau de détail qui manque et qui crée des litiges.",
                ],
                [
                  "Planning et conditions d'intervention",
                  "Ordre des interventions, horaires acceptables, protection des zones non concernées, gestion des déchets, obligations de nettoyage en fin de chantier.",
                ],
              ].map(([titre, desc]) => (
                <li key={titre} className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-1" />
                  <span>
                    <strong className="text-foreground">{titre}</strong> — {desc}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Les erreurs les plus fréquentes</h2>
            <p className="text-muted-foreground leading-relaxed">
              Même les professionnels expérimentés tombent dans les mêmes pièges :
            </p>
            <div className="space-y-3 p-4 bg-muted/30 rounded-xl text-sm text-muted-foreground">
              <ul className="space-y-2">
                <li>
                  <strong className="text-foreground">Trop vague sur les matériaux</strong> —
                  &ldquo;parquet en chêne&rdquo; ne suffit pas. Précisez l&apos;essence, le format,
                  le traitement de surface, la pose (collée, flottante, clouée).
                </li>
                <li>
                  <strong className="text-foreground">Oublier les interfaces entre lots</strong> —
                  Qui pose les plinthes ? Qui fait les joints entre le carrelage et la cloison ? Ces
                  zones de jonction sont les premières sources de litige.
                </li>
                <li>
                  <strong className="text-foreground">
                    Ne pas mentionner les références couleur
                  </strong>{" "}
                  — &ldquo;blanc cassé&rdquo; n&apos;est pas une référence. Notez le code RAL,
                  Farrow &amp; Ball, Little Greene ou autre selon votre palette.
                </li>
                <li>
                  <strong className="text-foreground">Ignorer les contraintes de chantier</strong> —
                  Accès par escalier étroit, voisins sensibles au bruit, parking impossible : tout
                  ce qui peut compliquer l&apos;intervention doit figurer dans le document.
                </li>
              </ul>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold">
              Faire valider le cahier des charges par le client
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Le cahier des charges n&apos;est pas seulement un outil de communication avec les
              artisans — c&apos;est aussi un document contractuel avec votre client. Une fois validé
              et signé, il protège les deux parties en cas de désaccord en cours de chantier.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              La validation doit être explicite : le client doit approuver le document, pas
              seulement le recevoir. Un email &ldquo;ok pour moi&rdquo; en réponse à un PDF peut
              suffire juridiquement, mais une validation horodatée dans un outil dédié est bien plus
              solide.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Chalto permet d&apos;envoyer le cahier des charges directement au client via un lien
              sécurisé. Il l&apos;approuve en un clic, laisse des commentaires si besoin, et
              l&apos;accord est archivé automatiquement avec la date et l&apos;heure.
            </p>
          </div>
        </div>

        <div className="border rounded-xl p-6 space-y-4 bg-muted/20">
          <h3 className="font-bold text-lg">Faites valider vos documents en un clic</h3>
          <p className="text-sm text-muted-foreground">
            Cahier des charges, planches tendances, plans d&apos;aménagement — envoyez un lien
            sécurisé à votre client et obtenez son accord écrit sans aller-retours email.
          </p>
          <Button asChild>
            <Link href="/#waitlist">
              Essayer Chalto gratuitement
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <ShareButtons
          title="Cahier des charges rénovation intérieure : modèle et conseils"
          url="https://chalto.fr/blog/cahier-des-charges-renovation-interieure"
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
