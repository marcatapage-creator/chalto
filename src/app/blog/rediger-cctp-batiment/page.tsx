import { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, ArrowLeft, CheckCircle } from "lucide-react"
import { ShareButtons } from "@/components/blog/share-buttons"

export const revalidate = false

export const metadata: Metadata = {
  title: "Comment rédiger un CCTP en 2026 (avec modèle)",
  description:
    "Le CCTP est un document clé dans tout projet de construction. Découvrez comment le rédiger efficacement, les erreurs à éviter et comment l'IA peut vous faire gagner des heures.",
  openGraph: {
    title: "Comment rédiger un CCTP en 2026 (avec modèle) | Chalto",
    description:
      "Le CCTP est un document clé dans tout projet de construction. Découvrez comment le rédiger efficacement.",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
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
            <Badge variant="outline">Documents</Badge>
            <span className="text-xs text-muted-foreground">29 avril 2026 · 7 min de lecture</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight">
            Comment rédiger un CCTP en 2026 (avec modèle)
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Le Cahier des Clauses Techniques Particulières est l&apos;un des documents les plus
            importants d&apos;un marché de travaux. Mal rédigé, il expose à des litiges coûteux.
            Bien rédigé, il protège toutes les parties et clarifie les attentes dès le départ.
          </p>
        </div>

        {/* Contenu */}
        <div className="space-y-8">
          {/* Définition */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Qu&apos;est-ce qu&apos;un CCTP ?</h2>
            <p className="text-muted-foreground leading-relaxed">
              Le CCTP — Cahier des Clauses Techniques Particulières — est le document qui décrit
              précisément les travaux à réaliser dans le cadre d&apos;un marché de construction. Il
              fait partie du Dossier de Consultation des Entreprises (DCE) et a valeur contractuelle
              une fois signé.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Contrairement au CCAP (Cahier des Clauses Administratives Particulières) qui traite
              des conditions contractuelles, le CCTP entre dans le détail technique : matériaux,
              normes, méthodes d&apos;exécution, performances attendues. C&apos;est la référence
              technique du chantier.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              En France, le CCTP est obligatoire pour les marchés publics. Pour les marchés privés,
              il n&apos;est pas légalement requis mais vivement recommandé dès que les travaux
              dépassent quelques milliers d&apos;euros.
            </p>
          </div>

          {/* Structure */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">La structure type d&apos;un CCTP</h2>
            <p className="text-muted-foreground leading-relaxed">
              Un CCTP bien structuré suit généralement cette organisation, quel que soit le lot
              concerné :
            </p>
            <ol className="space-y-4">
              {[
                {
                  step: "01",
                  title: "Généralités et description du projet",
                  desc: "Présentation du contexte, de la nature des travaux, du maître d'ouvrage et du maître d'œuvre. Cette section pose le cadre général.",
                },
                {
                  step: "02",
                  title: "Références normatives et réglementaires",
                  desc: "Liste des normes applicables (NF, DTU, Eurocodes), réglementations thermiques (RE2020), accessibilité, sécurité incendie selon la nature du bâtiment.",
                },
                {
                  step: "03",
                  title: "Description des matériaux et produits",
                  desc: 'Spécifications précises : fabricant, référence, caractéristiques techniques, certifications requises. Évitez les formulations vagues comme "qualité supérieure".',
                },
                {
                  step: "04",
                  title: "Mode d'exécution des travaux",
                  desc: "Comment les travaux doivent être réalisés : ordre d'intervention, conditions de mise en œuvre, interfaces entre lots.",
                },
                {
                  step: "05",
                  title: "Contrôles et essais",
                  desc: "Tests à réaliser avant réception : étanchéité, performances thermiques, essais électriques. Qui contrôle et à quelle fréquence.",
                },
                {
                  step: "06",
                  title: "Conditions de réception et garanties",
                  desc: "Modalités de réception des travaux, réserves acceptables, durées de garantie légales et conventionnelles.",
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

          {/* Erreurs */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Les 5 erreurs qui rendent un CCTP inutilisable</h2>
            <ul className="space-y-3 text-muted-foreground">
              {[
                {
                  label: "Formulations trop vagues",
                  desc: '"Bonne qualité", "selon les règles de l\'art" sans plus de précision — impossible à contrôler en réception.',
                },
                {
                  label: "Références de produits sans équivalent défini",
                  desc: 'Imposer une marque précise sans mentionner "ou équivalent" peut être contesté juridiquement.',
                },
                {
                  label: "Normes obsolètes",
                  desc: "Référencer des DTU ou normes NF périmés expose à des non-conformités lors du contrôle technique.",
                },
                {
                  label: "Absence de description des interfaces entre lots",
                  desc: "Qui pose les fourreaux avant le béton ? Qui fait les calfeutrements ? Le silence du CCTP crée des conflits sur chantier.",
                },
                {
                  label: "CCTP copié-collé sans adaptation",
                  desc: "Un CCTP générique non adapté au projet spécifique peut créer des incohérences avec les plans ou le devis.",
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

          {/* Par lot */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">CCTP par lot : les spécificités à connaître</h2>
            <p className="text-muted-foreground leading-relaxed">
              Chaque corps de métier a ses propres exigences techniques. Voici les points clés à ne
              pas oublier selon le lot :
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  title: "Gros œuvre / Maçonnerie",
                  desc: "Classes d'exposition du béton, armatures, résistances caractéristiques, traitement des joints de dilatation.",
                },
                {
                  title: "Charpente / Couverture",
                  desc: "Essence du bois, classe d'emploi, traitement fongicide et insecticide, charge de neige selon zone climatique.",
                },
                {
                  title: "Électricité / CFO-CFA",
                  desc: "Normes NF C 15-100, sections de câbles, indices de protection IP/IK, bilan de puissance.",
                },
                {
                  title: "Plomberie / CVC",
                  desc: "DTU 60.1, pression d'essai, matériaux de tuyauterie, calorifugeage, performance des équipements (classe énergétique).",
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

          {/* IA */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">
              L&apos;IA pour rédiger un CCTP : gain de temps ou risque ?
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              De plus en plus de professionnels utilisent l&apos;intelligence artificielle pour
              générer une première version de leur CCTP. C&apos;est une approche qui a du sens à
              condition de respecter quelques règles.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              L&apos;IA est excellente pour structurer le document, intégrer les références
              normatives courantes et rédiger les parties génériques. En revanche, elle ne connaît
              pas les spécificités de votre projet, de votre région ou de vos fournisseurs
              habituels.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              La bonne méthode : utiliser l&apos;IA pour générer le squelette du CCTP en quelques
              secondes, puis relire et personnaliser chaque section avant de le soumettre. On passe
              de 3-4 heures de rédaction à 30-45 minutes de relecture et d&apos;adaptation.
              C&apos;est le rapport effort/résultat le plus efficace aujourd&apos;hui.
            </p>
          </div>

          {/* Conclusion */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">En résumé</h2>
            <p className="text-muted-foreground leading-relaxed">
              Un bon CCTP, c&apos;est la garantie d&apos;un chantier sans mauvaises surprises. Il
              protège le maître d&apos;œuvre en cas de litige, aide les entreprises à chiffrer
              précisément et sert de référence tout au long du projet.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Les outils modernes — notamment ceux intégrant l&apos;IA — permettent aujourd&apos;hui
              de produire un CCTP de qualité professionnelle en une fraction du temps habituel. La
              seule condition : ne jamais signer un document que vous n&apos;avez pas relu et adapté
              à votre projet spécifique.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="border rounded-xl p-6 space-y-4 bg-muted/20">
          <h3 className="font-bold text-lg">Générez votre CCTP avec l&apos;IA en 30 secondes</h3>
          <p className="text-sm text-muted-foreground">
            Chalto génère un CCTP complet à partir du type de travaux et du contexte de votre
            projet. Vous relisez, vous adaptez, vous envoyez.
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
          title="Comment rédiger un CCTP en 2026 (avec modèle)"
          url="https://chalto.fr/blog/rediger-cctp-batiment"
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
