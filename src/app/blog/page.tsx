import { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight } from "lucide-react"

export const revalidate = false

export const metadata: Metadata = {
  title: "Blog",
  description: "Conseils et guides pour les professionnels du bâtiment.",
}

const articles = [
  {
    slug: "compte-rendu-chantier",
    title: "Comment rédiger un compte rendu de chantier efficace",
    description:
      "20 minutes de rédaction par semaine peuvent vous éviter des mois de litige. Le CR de chantier est l'outil de protection le plus sous-estimé du bâtiment.",
    category: "Gestion de chantier",
    date: "29 avril 2026",
    readTime: "7 min",
    image:
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80&auto=format&fit=crop",
  },
  {
    slug: "reception-chantier-guide",
    title: "Réception de chantier : guide complet (réserves, PV, délais)",
    description:
      "La réception est un acte juridique qui transfère la responsabilité des ouvrages. Tout savoir sur les réserves, le PV et les garanties légales.",
    category: "Documents",
    date: "29 avril 2026",
    readTime: "8 min",
    image:
      "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80&auto=format&fit=crop",
  },
  {
    slug: "delai-paiement-btp",
    title: "Délais de paiement dans le BTP : droits et recours",
    description:
      "Factures impayées, délais non respectés — connaissez vos droits légaux et les recours disponibles pour vous faire payer dans les temps.",
    category: "Facturation",
    date: "29 avril 2026",
    readTime: "7 min",
    image:
      "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80&auto=format&fit=crop",
  },
  {
    slug: "remplacer-excel-chantier",
    title: "Pourquoi Excel ne suffit plus pour gérer un chantier",
    description:
      "Excel est partout dans le BTP, mais il n'a pas été conçu pour ça. Voici les signaux qui montrent qu'il est temps de passer à autre chose.",
    category: "Outils & logiciels",
    date: "29 avril 2026",
    readTime: "6 min",
    image:
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80&auto=format&fit=crop",
  },
  {
    slug: "notice-descriptive-travaux",
    title: "Notice descriptive de travaux : qu'est-ce que c'est et comment la rédiger ?",
    description:
      "La notice descriptive traduit les plans en mots pour votre client. Un document contractuel essentiel pour éviter les malentendus.",
    category: "Documents",
    date: "29 avril 2026",
    readTime: "6 min",
    image:
      "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&q=80&auto=format&fit=crop",
  },
  {
    slug: "rediger-cctp-batiment",
    title: "Comment rédiger un CCTP en 2026 (avec modèle)",
    description:
      "Le CCTP est un document clé dans tout projet de construction. Structure type, erreurs à éviter et comment l'IA peut vous faire gagner des heures.",
    category: "Documents",
    date: "29 avril 2026",
    readTime: "7 min",
    image:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80&auto=format&fit=crop",
  },
  {
    slug: "faire-signer-devis-artisan",
    title: "Comment faire signer un devis artisan rapidement",
    description:
      "Devis en attente depuis 3 semaines ? Les méthodes concrètes pour accélérer la signature et réduire les abandons clients.",
    category: "Relation client",
    date: "29 avril 2026",
    readTime: "6 min",
    image:
      "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&q=80&auto=format&fit=crop",
  },
  {
    slug: "faire-valider-plans-client",
    title: "Comment faire valider ses plans par un client sans email",
    description:
      "Les allers-retours par email font perdre un temps précieux. Voici comment moderniser votre workflow de validation.",
    category: "Workflow",
    date: "17 avril 2026",
    readTime: "5 min",
    image:
      "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&q=80&auto=format&fit=crop",
  },
  {
    slug: "coordonner-corps-de-metier",
    title: "Comment coordonner plusieurs corps de métier sur un chantier",
    description:
      "Architectes, plombiers, électriciens — gérer plusieurs intervenants est un défi. Voici les meilleures pratiques.",
    category: "Gestion de chantier",
    date: "10 avril 2026",
    readTime: "7 min",
    image:
      "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&q=80&auto=format&fit=crop",
  },
  {
    slug: "logiciel-architecte-independant",
    title: "Quel logiciel pour un architecte indépendant en 2026 ?",
    description:
      "Comparatif des meilleurs outils pour gérer ses projets, ses clients et ses documents en tant qu'architecte solo.",
    category: "Outils",
    date: "3 avril 2026",
    readTime: "8 min",
    image:
      "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&q=80&auto=format&fit=crop",
  },
]

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-16 space-y-12">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Blog</h1>
          <p className="text-muted-foreground text-lg">
            Conseils et guides pour les pros du bâtiment
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {articles.map((article) => (
            <Link key={article.slug} href={`/blog/${article.slug}`} className="block">
              <Card className="hover:border-primary/50 transition-colors duration-200 cursor-pointer overflow-hidden py-0">
                <div className="flex flex-col sm:flex-row">
                  <div className="relative h-48 sm:h-auto sm:w-48 sm:shrink-0 sm:self-stretch">
                    <Image
                      src={article.image}
                      alt={article.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, 192px"
                    />
                  </div>
                  <CardContent className="p-6 space-y-3 flex flex-col justify-center">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{article.category}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {article.date} · {article.readTime} de lecture
                      </span>
                    </div>
                    <h2 className="font-bold text-xl leading-tight">{article.title}</h2>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {article.description}
                    </p>
                    <div className="flex items-center gap-1 text-primary text-sm font-medium">
                      Lire l&apos;article
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </CardContent>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
