import { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, ArrowLeft, CheckCircle } from "lucide-react"
import { ShareButtons } from "@/components/blog/share-buttons"

export const revalidate = false

export const metadata: Metadata = {
  title: "Comment l'IA va changer le métier d'architecte d'ici 2027",
  description:
    "Génération de documents, détection d'incohérences, optimisation de plans... L'IA entre dans les agences. Ce que ça change concrètement pour les architectes indépendants.",
  openGraph: {
    title: "Comment l'IA va changer le métier d'architecte d'ici 2027 | Chalto",
    description:
      "Génération de documents, détection d'incohérences, optimisation de plans... L'IA entre dans les agences. Ce que ça change concrètement pour les architectes indépendants.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=1200&q=80&auto=format&fit=crop",
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
            <Badge variant="outline">IA &amp; Innovation</Badge>
            <span className="text-xs text-muted-foreground">
              28 juillet 2026 · 7 min de lecture
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight">
            Comment l&apos;IA va changer le métier d&apos;architecte d&apos;ici 2027
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            L&apos;intelligence artificielle ne va pas remplacer les architectes. Mais les
            architectes qui utilisent l&apos;IA vont probablement remplacer ceux qui ne
            l&apos;utilisent pas. Ce n&apos;est pas une prophétie — c&apos;est ce qu&apos;on observe
            déjà dans les agences qui ont commencé à l&apos;intégrer.
          </p>
        </div>

        {/* Hero image */}
        <div className="rounded-xl overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=1200&q=80&auto=format&fit=crop"
            alt="Interface d'intelligence artificielle sur écran"
            width={1200}
            height={630}
            className="w-full object-cover aspect-video"
            priority
          />
        </div>

        {/* Contenu */}
        <div className="space-y-8">
          {/* Ce que l'IA fait déjà */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Ce que l&apos;IA fait déjà (et bien)</h2>
            <p className="text-muted-foreground leading-relaxed">
              Certains cas d&apos;usage sont matures aujourd&apos;hui, utilisables immédiatement
              sans formation particulière. Ce sont en général des tâches à faible valeur ajoutée qui
              prennent pourtant 20 à 30 % du temps d&apos;un architecte :
            </p>
            <ul className="space-y-3">
              {[
                "Génération de texte technique : CCTP, notices descriptives, comptes rendus de chantier",
                "Synthèse de documents : PV de réunion, réglementations, normes",
                "Recherche normative : DTU, Eurocodes, accessibilité, thermique",
                "Réponse aux questions clients simples et répétitives",
                "Structuration de briefs et de programmes à partir d'un entretien",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Ce que l'IA ne peut pas faire */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Ce que l&apos;IA ne peut pas (encore) faire</h2>
            <p className="text-muted-foreground leading-relaxed">
              La liste est aussi importante que la précédente. Savoir ce que l&apos;IA ne maîtrise
              pas, c&apos;est savoir où concentrer sa propre valeur professionnelle :
            </p>
            <ul className="space-y-3 text-muted-foreground">
              {[
                "Conception architecturale créative — le parti pris, l'intention spatiale, la singularité",
                "Jugement contextuel — patrimoine, contraintes de site, ABF, tissu urbain",
                "Relation client — écoute, empathie, gestion des attentes, négociation",
                "Responsabilité professionnelle et engagement sur la qualité d'exécution",
                "Connaissance du tissu local — artisans, mairies, délais réels, tarifs du marché",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="text-destructive font-bold shrink-0">✗</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Cas d'usage productivité */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">
              Les cas d&apos;usage qui changent vraiment la productivité
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Parmi tous les usages possibles, quelques-uns ont un impact disproportionné sur le
              temps de travail réel :
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  title: "Rédaction du CCTP",
                  desc: "À partir du programme et du type de travaux : gain de 60 à 80 % du temps de rédaction. Le professionnel relit et adapte.",
                },
                {
                  title: "Analyse d'incohérences",
                  desc: "Détection des écarts entre plans et devis, entre lots, entre CCTP et DPGF. Évite les oublis coûteux.",
                },
                {
                  title: "Planning prévisionnel",
                  desc: "Génération d'un planning par lot à partir de la liste des entreprises et des durées estimées.",
                },
                {
                  title: "Synthèse de chantier",
                  desc: "Comptes rendus de réunion rédigés en quelques secondes à partir de notes ou d'un enregistrement audio.",
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

          {/* Dans les agences */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">
              L&apos;IA dans les agences : ce qui se passe déjà
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              L&apos;adoption de l&apos;IA dans la profession est très hétérogène, et le fossé se
              creuse rapidement :
            </p>
            <ol className="space-y-4">
              {[
                {
                  step: "01",
                  title: "Grandes agences",
                  desc: "Intégration dans les process BIM, outils IA spécialisés (Autodesk, Arkance), équipes dédiées à l'expérimentation. L'IA est déjà dans les process.",
                },
                {
                  step: "02",
                  title: "Agences moyennes",
                  desc: "Utilisation d'outils généralistes (Claude, ChatGPT) pour la production de documents. Adoption pragmatique, cas par cas.",
                },
                {
                  step: "03",
                  title: "Architectes indépendants",
                  desc: "Adoption très hétérogène — de l'utilisateur avancé qui a reconfiguré ses process, à celui qui n'a pas encore ouvert un outil IA.",
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

          {/* Comment commencer */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Comment commencer sans se perdre ?</h2>
            <p className="text-muted-foreground leading-relaxed">
              La principale erreur est de vouloir tout automatiser d&apos;un coup. La bonne approche
              est progressive et pragmatique :
            </p>
            <ul className="space-y-3">
              {[
                "Commencer par un cas d'usage simple et répétitif — la rédaction de CCTP est le meilleur point d'entrée.",
                "Mesurer le gain de temps réel sur 3 projets avant d'étendre l'usage.",
                "Garder la relecture humaine sur tout document contractuel — sans exception.",
                "Choisir des outils qui comprennent le contexte BTP, pas des outils généralistes non adaptés.",
                "Ne pas chercher la perfection immédiate : une première version correcte en 5 minutes vaut mieux qu'une version parfaite en 3 heures.",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 2027 */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">2027 : à quoi ressemblera le métier ?</h2>
            <p className="text-muted-foreground leading-relaxed">
              D&apos;ici 2027, les tâches administratives et rédactionnelles seront quasi
              entièrement assistées par l&apos;IA dans les agences les plus avancées. Ce n&apos;est
              pas une rupture — c&apos;est une accélération de ce qui est déjà en cours.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              L&apos;architecte se repositionne sur ce que l&apos;IA ne peut pas faire : la valeur
              créative, la relation client, le jugement contextuel. Les petites agences et
              indépendants qui adoptent l&apos;IA tôt ont un avantage compétitif réel — leur agilité
              leur permet d&apos;intégrer les nouveaux outils plus vite que les grands groupes.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Les nouvelles compétences qui émergent : prompt engineering appliqué au BTP,
              vérification et correction de l&apos;output IA, management du workflow humain-machine.
              L&apos;IA comme levier de différenciation, pas de nivellement par le bas — à condition
              de l&apos;adopter avant que ce soit une obligation.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="border rounded-xl p-6 space-y-4 bg-muted/20">
          <h3 className="font-bold text-lg">
            Chalto intègre l&apos;IA pour générer vos documents techniques
          </h3>
          <p className="text-sm text-muted-foreground">
            Générez vos CCTP, notices et comptes rendus en quelques secondes avec l&apos;IA intégrée
            à Chalto. Vous relisez, vous adaptez, vous signez.
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
          title="Comment l'IA va changer le métier d'architecte d'ici 2027"
          url="https://chalto.fr/blog/ia-metier-architecte-2027"
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
