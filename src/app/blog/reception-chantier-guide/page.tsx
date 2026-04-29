import { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, ArrowLeft, CheckCircle } from "lucide-react"
import { ShareButtons } from "@/components/blog/share-buttons"

export const revalidate = false

export const metadata: Metadata = {
  title: "Réception de chantier : guide complet (réserves, PV, délais)",
  description:
    "La réception de chantier marque la fin des travaux et le transfert de responsabilité. Découvrez comment la préparer, gérer les réserves et sécuriser vos droits.",
  openGraph: {
    title: "Réception de chantier : guide complet (réserves, PV, délais) | Chalto",
    description:
      "La réception de chantier marque la fin des travaux et le transfert de responsabilité. Découvrez comment la préparer et gérer les réserves.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1200&q=80&auto=format&fit=crop",
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
            <span className="text-xs text-muted-foreground">29 avril 2026 · 8 min de lecture</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight">
            Réception de chantier : guide complet (réserves, PV, délais)
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            La réception de chantier n&apos;est pas une simple visite de fin de travaux. C&apos;est
            un acte juridique qui transfère la responsabilité des ouvrages et fait courir les
            garanties légales. Voici tout ce qu&apos;il faut savoir.
          </p>
        </div>

        {/* Hero image */}
        <div className="rounded-xl overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1200&q=80&auto=format&fit=crop"
            alt="Inspection finale d'un bâtiment en construction"
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
            <h2 className="text-2xl font-bold">Qu&apos;est-ce que la réception de chantier ?</h2>
            <p className="text-muted-foreground leading-relaxed">
              La réception est l&apos;acte par lequel le maître d&apos;ouvrage (le client) déclare
              accepter les travaux réalisés par les entreprises. Elle est régie par l&apos;article
              1792-6 du Code civil et s&apos;applique à tous les marchés de travaux, qu&apos;ils
              soient publics ou privés.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              C&apos;est un moment charnière : à partir de la réception, les garanties légales
              commencent à courir (garantie de parfait achèvement, garantie biennale, garantie
              décennale). C&apos;est aussi à partir de ce moment que le maître d&apos;ouvrage ne
              peut plus retenir des pénalités de retard.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              La réception peut être prononcée avec ou sans réserves. Les réserves sont les
              malfaçons ou travaux non conformes que le maître d&apos;ouvrage identifie lors de la
              visite et qu&apos;il demande à faire corriger.
            </p>
          </div>

          {/* Le PV */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">
              Le procès-verbal de réception : ce qu&apos;il doit contenir
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Le procès-verbal de réception (PV) est le document officiel qui acte la réception. Il
              doit être signé par le maître d&apos;ouvrage et idéalement par le représentant de
              l&apos;entreprise. Voici ce qu&apos;il doit impérativement mentionner :
            </p>
            <ul className="space-y-3 text-muted-foreground">
              {[
                "L'identification des parties (maître d'ouvrage, entreprise, maître d'œuvre)",
                "La date de réception",
                "La description des ouvrages réceptionnés",
                "La mention expresse que la réception est prononcée (ou refusée)",
                "La liste des réserves si elles existent, avec description précise",
                "Les délais impartis pour lever chacune des réserves",
                "La date de levée de réserves prévue si applicable",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Les types de réception */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Les 3 formes de réception</h2>
            <div className="space-y-4">
              {[
                {
                  title: "Réception avec réserves",
                  desc: "Le maître d'ouvrage accepte les travaux mais note des défauts à corriger. L'entreprise dispose d'un délai contractuel pour lever ces réserves. C'est le cas le plus fréquent.",
                  color: "text-amber-600 dark:text-amber-400",
                },
                {
                  title: "Réception sans réserves",
                  desc: "Le maître d'ouvrage est pleinement satisfait. Les travaux sont conformes au marché. La réception est prononcée sans aucun bémol. Idéale mais rare sur des projets complexes.",
                  color: "text-green-600 dark:text-green-400",
                },
                {
                  title: "Refus de réception",
                  desc: "Le maître d'ouvrage constate des désordres si importants qu'il refuse de prononcer la réception. Il doit motiver son refus par écrit. L'entreprise dispose alors d'un délai pour effectuer les reprises nécessaires.",
                  color: "text-destructive",
                },
              ].map((item) => (
                <div key={item.title} className="p-4 border rounded-xl space-y-2">
                  <p className={`font-semibold ${item.color}`}>{item.title}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Les garanties */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Les garanties qui démarrent à la réception</h2>
            <div className="space-y-4">
              {[
                {
                  step: "1 an",
                  title: "Garantie de parfait achèvement",
                  desc: "L'entreprise doit reprendre tous les désordres signalés à la réception ou dans l'année qui suit, qu'ils soient mentionnés dans les réserves ou non.",
                },
                {
                  step: "2 ans",
                  title: "Garantie biennale (bon fonctionnement)",
                  desc: "Couvre les éléments d'équipement dissociables du bâtiment : robinetterie, volets, portes intérieures, radiateurs. L'entreprise qui les a posés est responsable.",
                },
                {
                  step: "10 ans",
                  title: "Garantie décennale",
                  desc: "Couvre les désordres qui compromettent la solidité de l'ouvrage ou le rendent impropre à sa destination. C'est la plus importante — et celle pour laquelle les entreprises sont assurées obligatoirement.",
                },
              ].map((item) => (
                <li key={item.step} className="flex items-start gap-4 list-none">
                  <span className="text-2xl font-bold text-primary shrink-0">{item.step}</span>
                  <div className="space-y-1">
                    <p className="font-semibold">{item.title}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </li>
              ))}
            </div>
          </div>

          {/* Préparer la réception */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Comment préparer une réception de chantier</h2>
            <p className="text-muted-foreground leading-relaxed">
              Une réception bien préparée prend 2 à 3 heures. Elle s&apos;organise avec une
              check-list par lot, une visite méthodique pièce par pièce, et un PV rédigé sur place
              ou dans les heures qui suivent. Voici le déroulé recommandé :
            </p>
            <ol className="space-y-4">
              {[
                {
                  step: "01",
                  title: "Préparez votre check-list par lot avant la visite",
                  desc: "Reprenez le CCTP et le DQE pour chaque lot et listez les points à contrôler : conformité des matériaux, finitions, fonctionnement des équipements.",
                },
                {
                  step: "02",
                  title: "Visitez pièce par pièce, lot par lot",
                  desc: "Ne cherchez pas à tout voir d'un coup. Divisez la visite par zone et par corps de métier pour ne rien oublier.",
                },
                {
                  step: "03",
                  title: "Documentez chaque réserve avec une photo",
                  desc: "Une réserve sans photo peut être contestée. Chaque désordre doit être localisé (pièce, mur, hauteur) et photographié.",
                },
                {
                  step: "04",
                  title: "Rédigez le PV immédiatement",
                  desc: "Ne remettez pas la rédaction du PV au lendemain. Rédigez-le sur place ou dans les heures qui suivent, pendant que les détails sont frais.",
                },
                {
                  step: "05",
                  title: "Fixez des délais réalistes pour la levée des réserves",
                  desc: "Trop court : l'entreprise ne peut pas tenir. Trop long : vous perdez du levier. 2 à 4 semaines est une fourchette raisonnable selon la complexité.",
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

          {/* Paiement */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">
              Réception et paiement : ce que vous pouvez retenir
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              En présence de réserves, le maître d&apos;ouvrage peut retenir une partie du solde —
              c&apos;est la retenue de garantie. En droit français, elle est plafonnée à 5% du
              montant du marché (loi du 16 juillet 1971). Cette somme est restituée après levée
              complète des réserves.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Attention : en cas de refus de réception non motivé ou de retenue injustifiée,
              l&apos;entreprise peut demander une réception judiciaire ou réclamer des intérêts de
              retard. Le dialogue et la documentation rigoureuse protègent les deux parties.
            </p>
          </div>

          {/* Conclusion */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">En résumé</h2>
            <p className="text-muted-foreground leading-relaxed">
              La réception de chantier est un acte technique et juridique qui mérite toute votre
              attention. Un PV bien rédigé, des réserves documentées, des délais respectés —
              c&apos;est la différence entre une clôture de chantier sereine et des mois de
              contentieux.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Pour les architectes et maîtres d&apos;œuvre, la réception est aussi l&apos;occasion
              de consolider la relation client. Un processus rigoureux et transparent montre votre
              professionnalisme jusque dans les derniers mètres du projet.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="border rounded-xl p-6 space-y-4 bg-muted/20">
          <h3 className="font-bold text-lg">Gérez vos réceptions de chantier avec Chalto</h3>
          <p className="text-sm text-muted-foreground">
            Chalto vous permet de générer votre PV de réception, de documenter les réserves avec
            photos et de suivre leur levée — directement depuis le chantier.
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
          title="Réception de chantier : guide complet (réserves, PV, délais)"
          url="https://chalto.fr/blog/reception-chantier-guide"
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
