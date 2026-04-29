import { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, ArrowLeft, CheckCircle } from "lucide-react"
import { ShareButtons } from "@/components/blog/share-buttons"

export const revalidate = false

export const metadata: Metadata = {
  title: "Notice descriptive de travaux : qu'est-ce que c'est et comment la rédiger ?",
  description:
    "La notice descriptive est un document essentiel pour cadrer les travaux avec votre client. Découvrez son contenu, son rôle juridique et comment la rédiger efficacement.",
  openGraph: {
    title: "Notice descriptive de travaux : qu'est-ce que c'est et comment la rédiger ? | Chalto",
    description:
      "La notice descriptive est un document essentiel pour cadrer les travaux avec votre client. Découvrez son contenu et son rôle juridique.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1200&q=80&auto=format&fit=crop",
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
            <Badge variant="outline">Documents</Badge>
            <span className="text-xs text-muted-foreground">29 avril 2026 · 6 min de lecture</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight">
            Notice descriptive de travaux : qu&apos;est-ce que c&apos;est et comment la rédiger ?
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            La notice descriptive est le document qui traduit les plans en mots. Elle décrit ce qui
            sera fait, avec quels matériaux, selon quelles méthodes. Bien rédigée, elle prévient les
            malentendus avant même que le premier coup de pioche soit donné.
          </p>
        </div>

        {/* Hero image */}
        <div className="rounded-xl overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1200&q=80&auto=format&fit=crop"
            alt="Architecte travaillant sur des plans de construction"
            width={1200}
            height={630}
            className="w-full object-cover aspect-video"
            priority
          />
        </div>

        {/* Contenu */}
        <div className="space-y-8">
          {/* Définition */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">
              Qu&apos;est-ce qu&apos;une notice descriptive de travaux ?
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              La notice descriptive est un document contractuel qui décrit en langage accessible les
              travaux à réaliser. Contrairement au CCTP (Cahier des Clauses Techniques
              Particulières) qui s&apos;adresse aux entreprises, la notice descriptive est conçue
              pour être comprise par le maître d&apos;ouvrage — votre client.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Elle complète les plans : là où les plans montrent les formes et les dimensions, la
              notice décrit les matériaux, les finitions, les équipements. Ensemble, plans et notice
              forment la description complète de ce qui sera livré.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Pour les ventes en état futur d&apos;achèvement (VEFA), la notice descriptive est
              obligatoire et encadrée par la loi Breyne. Pour les marchés de travaux privés, elle
              n&apos;est pas légalement obligatoire mais constitue une excellente protection pour
              les deux parties.
            </p>
          </div>

          {/* Différence avec le CCTP */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Notice descriptive vs CCTP : quelle différence ?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  title: "Notice descriptive",
                  points: [
                    "Destinée au maître d'ouvrage (client)",
                    "Langage accessible, vulgarisé",
                    "Décrit le résultat attendu",
                    "Axée sur les choix et finitions",
                    "Signée par le client",
                  ],
                  color: "border-primary/30",
                },
                {
                  title: "CCTP",
                  points: [
                    "Destinée aux entreprises",
                    "Langage technique (normes, DTU)",
                    "Décrit comment réaliser les travaux",
                    "Axé sur les méthodes d'exécution",
                    "Fait partie du DCE",
                  ],
                  color: "border-muted",
                },
              ].map((item) => (
                <div key={item.title} className={`p-4 border-2 ${item.color} rounded-xl space-y-3`}>
                  <p className="font-semibold">{item.title}</p>
                  <ul className="space-y-1">
                    {item.points.map((point) => (
                      <li
                        key={point}
                        className="text-sm text-muted-foreground flex items-start gap-2"
                      >
                        <span className="text-primary shrink-0">·</span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Ce qu'elle doit contenir */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Ce que doit contenir une notice descriptive</h2>
            <p className="text-muted-foreground leading-relaxed">
              Le contenu varie selon la nature des travaux, mais voici les rubriques que l&apos;on
              retrouve dans toute notice bien structurée :
            </p>
            <ol className="space-y-6">
              {[
                {
                  step: "01",
                  title: "Présentation générale du projet",
                  desc: "Nature des travaux, adresse, surface, destination (logement, bureau, commerce). Parties concernées : démolition, extension, rénovation complète ou partielle.",
                },
                {
                  step: "02",
                  title: "Structure et gros œuvre",
                  desc: "Type de fondations, structure porteuse (béton, bois, acier), murs extérieurs, dalle. Mention de l'isolation thermique et acoustique prévue.",
                },
                {
                  step: "03",
                  title: "Couverture et étanchéité",
                  desc: "Type de toiture, matériaux de couverture, pente, évacuation des eaux pluviales. Traitement des terrasses si applicable.",
                },
                {
                  step: "04",
                  title: "Menuiseries extérieures",
                  desc: "Matériaux (PVC, aluminium, bois), type de vitrage, performances thermiques (Uw), coloris, quincaillerie.",
                },
                {
                  step: "05",
                  title: "Cloisonnement et menuiseries intérieures",
                  desc: "Type de cloisons (BA13, brique, bois), portes intérieures, revêtements de sol par pièce, faïences salle de bain.",
                },
                {
                  step: "06",
                  title: "Équipements techniques",
                  desc: "Chauffage (type, énergie, marque prévue), ventilation (VMC simple ou double flux), plomberie, électricité (tableau, prises, éclairage).",
                },
                {
                  step: "07",
                  title: "Finitions",
                  desc: "Peinture (nombre de couches, qualité), revêtements de sol définitifs, faïences, robinetterie — avec références ou gamme de qualité définie.",
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
            <h2 className="text-2xl font-bold">Les erreurs qui rendent une notice inutilisable</h2>
            <ul className="space-y-3 text-muted-foreground">
              {[
                {
                  label: "Descriptions trop vagues",
                  desc: '"Carrelage de qualité" ou "robinetterie soignée" ne veulent rien dire juridiquement. Précisez la gamme de prix, la marque ou la référence minimale.',
                },
                {
                  label: "Oublier les zones grises",
                  desc: "Les abords, l'aménagement extérieur, le raccordement aux réseaux — tout ce qui n'est pas explicitement inclus dans la notice peut être source de litige sur son financement.",
                },
                {
                  label: "Ne pas faire signer le client",
                  desc: "Une notice non signée est une description, pas un engagement. La signature du client scelle l'accord sur les prestations décrites.",
                },
                {
                  label: "Ne pas mentionner ce qui est exclu",
                  desc: 'Une section "prestations non incluses" est aussi importante que les prestations incluses. Elle évite les réclamations ultérieures sur des postes non prévus au devis.',
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

          {/* Ce que vous y gagnez */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Pourquoi en rédiger une systématiquement</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  title: "Moins de déception client",
                  desc: "Le client sait précisément ce qu'il va recevoir. Pas de surprise à la réception.",
                },
                {
                  title: "Moins de litiges",
                  desc: "En cas de désaccord, la notice est la référence commune. Elle règle la majorité des disputes avant qu'elles n'arrivent.",
                },
                {
                  title: "Un devis plus crédible",
                  desc: "Un devis accompagné d'une notice descriptive inspire confiance. Le client comprend ce qu'il achète.",
                },
                {
                  title: "Une meilleure image",
                  desc: "Les professionnels qui fournissent une notice se distinguent de ceux qui envoient un simple devis de 3 lignes.",
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
              La notice descriptive est le document qui transforme un devis en véritable engagement
              contractuel compréhensible par votre client. Elle prend du temps à rédiger — mais ce
              temps est rentabilisé dès la première réclamation qu&apos;elle évite.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Les outils modernes, notamment ceux intégrant l&apos;IA, permettent aujourd&apos;hui
              de générer une première version de notice en quelques minutes à partir de la
              description du projet. Vous relisez, vous adaptez, vous faites signer. C&apos;est un
              investissement de 30 minutes qui peut vous éviter des semaines de conflit.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="border rounded-xl p-6 space-y-4 bg-muted/20">
          <h3 className="font-bold text-lg">Générez votre notice descriptive avec l&apos;IA</h3>
          <p className="text-sm text-muted-foreground">
            Chalto génère une notice descriptive complète à partir de la description de votre
            projet. Vous relisez et adaptez, votre client signe en ligne.
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
          title="Notice descriptive de travaux : qu'est-ce que c'est et comment la rédiger ?"
          url="https://chalto.fr/blog/notice-descriptive-travaux"
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
