import { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, ArrowLeft, CheckCircle } from "lucide-react"
import { ShareButtons } from "@/components/blog/share-buttons"

export const revalidate = false

export const metadata: Metadata = {
  title: "Client mécontent sur chantier : comment gérer le conflit sans perdre le contrat ?",
  description:
    "Un client insatisfait, ça arrive même aux meilleurs. Les méthodes concrètes pour désamorcer la tension, protéger votre marge et terminer le chantier sereinement.",
  openGraph: {
    title:
      "Client mécontent sur chantier : comment gérer le conflit sans perdre le contrat ? | Chalto",
    description:
      "Un client insatisfait, ça arrive même aux meilleurs. Les méthodes concrètes pour désamorcer la tension, protéger votre marge et terminer le chantier sereinement.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1200&q=80&auto=format&fit=crop",
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
            <Badge variant="outline">Relation client</Badge>
            <span className="text-xs text-muted-foreground">
              21 juillet 2026 · 6 min de lecture
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight">
            Client mécontent sur chantier : comment gérer le conflit sans perdre le contrat ?
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Un client qui monte le ton sur chantier, c&apos;est stressant. Mais c&apos;est aussi
            souvent le symptôme d&apos;un problème qui existait depuis le début — une attente mal
            alignée, une communication insuffisante, ou une surprise que vous auriez pu anticiper.
            Voici comment reprendre le contrôle sans perdre le chantier ni votre marge.
          </p>
        </div>

        {/* Hero image */}
        <div className="rounded-xl overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1200&q=80&auto=format&fit=crop"
            alt="Réunion de chantier entre professionnels"
            width={1200}
            height={630}
            className="w-full object-cover aspect-video"
            priority
          />
        </div>

        {/* Contenu */}
        <div className="space-y-8">
          {/* Comprendre */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Comprendre d&apos;où vient le mécontentement</h2>
            <p className="text-muted-foreground leading-relaxed">
              Avant d&apos;agir, il faut diagnostiquer. Un client mécontent a presque toujours une
              des trois origines suivantes :
            </p>
            <ul className="space-y-3">
              {[
                {
                  label: "Désalignement d'attentes",
                  desc: "Ce que le client avait imaginé ne correspond pas à ce qui a été convenu par écrit. La cause est souvent une phase de cadrage insuffisante.",
                },
                {
                  label: "Surprise non gérée",
                  desc: "Une découverte imprévue, un retard, un dépassement de budget — le client l'apprend trop tard et se sent mis devant le fait accompli.",
                },
                {
                  label: "Communication insuffisante",
                  desc: "Le client se sent exclu du projet, il n'a pas de visibilité sur l'avancement et comble le vide par l'inquiétude.",
                },
              ].map((item) => (
                <li key={item.label} className="flex items-start gap-3 text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-foreground">{item.label}.</strong> {item.desc}
                  </span>
                </li>
              ))}
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              Identifier la bonne origine change complètement la réponse à apporter. Agir sur le
              mauvais levier aggrave la situation.
            </p>
          </div>

          {/* 5 premières minutes */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Les 5 premières minutes : ce qui change tout</h2>
            <p className="text-muted-foreground leading-relaxed">
              La réaction dans les premières minutes d&apos;une confrontation détermine souvent la
              suite. Le client veut d&apos;abord être entendu — pas corrigé, pas convaincu. Voici
              les règles à tenir :
            </p>
            <ul className="space-y-3">
              {[
                "Ne pas se défendre immédiatement — même si vous avez raison.",
                "Écouter sans interrompre — laisser le client aller au bout.",
                "Reformuler pour montrer la compréhension : « Si je comprends bien, vous êtes préoccupé par… »",
                "Ne pas promettre ce qu'on ne peut pas tenir sous la pression.",
                "Proposer un point de situation dans les 24h — pas une réponse immédiate.",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Réunion de recadrage */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">
              La réunion de recadrage : préparer, pas improviser
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Dans les 24 à 48 heures qui suivent, organisez une réunion formelle. Pas un appel
              téléphonique, pas un échange en marge du chantier — une réunion avec ordre du jour et
              compte rendu.
            </p>
            <ol className="space-y-4">
              {[
                {
                  step: "01",
                  title: "Préparer les faits",
                  desc: "Comptes rendus de chantier, photos horodatées, échanges écrits, devis signés. Rassemblez tout avant la réunion.",
                },
                {
                  step: "02",
                  title: "Recentrer sur le contrat",
                  desc: "Identifier clairement ce qui est inclus dans le marché et ce qui ne l'est pas. Le contrat signé est la référence — pas les souvenirs de chacun.",
                },
                {
                  step: "03",
                  title: "Proposer des solutions concrètes",
                  desc: 'Pas des explications, des solutions. "Voici ce que je peux faire, voici le délai, voici ce que ça implique pour la suite."',
                },
                {
                  step: "04",
                  title: "Mettre les conclusions par écrit",
                  desc: "Un email de synthèse dans les heures qui suivent. Ce qui n'est pas écrit n'existe pas juridiquement.",
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

          {/* Malfaçon vs TMA */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">
              Travaux supplémentaires ou malfaçon : deux situations très différentes
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              La confusion entre ces deux cas est fréquente — et dangereuse. Elle mérite une réponse
              radicalement différente.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 border rounded-xl space-y-3">
                <p className="font-semibold text-sm">Malfaçon avérée</p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                    <span>Reconnaître sans délai si c&apos;est réel</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                    <span>Corriger sans facturer</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                    <span>Documenter la correction (photos avant/après, PV)</span>
                  </li>
                </ul>
              </div>
              <div className="p-4 border rounded-xl space-y-3">
                <p className="font-semibold text-sm">Travaux supplémentaires contestés</p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                    <span>Sortir le devis signé, montrer le périmètre initial</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                    <span>Expliquer calmement sans accuser</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                    <span>Proposer un avenant formalisé</span>
                  </li>
                </ul>
              </div>
            </div>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-3">
                <span className="text-destructive font-bold shrink-0">✗</span>
                <span>
                  <strong className="text-foreground">Ne jamais confondre les deux.</strong>{" "}
                  Accepter de corriger gratuitement un travail supplémentaire non commandé crée un
                  précédent destructeur pour la suite du chantier.
                </span>
              </li>
            </ul>
          </div>

          {/* Protéger sa marge */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Protéger sa marge sans bloquer le chantier</h2>
            <p className="text-muted-foreground leading-relaxed">
              La tentation en cas de conflit est soit de tout céder pour avoir la paix, soit de
              bloquer le chantier pour exercer une pression. Les deux sont des erreurs.
            </p>
            <ul className="space-y-3 text-muted-foreground">
              {[
                {
                  cross: true,
                  label: "Ne jamais arrêter le chantier sans mise en demeure préalable",
                  desc: "L'arrêt unilatéral engage votre responsabilité contractuelle.",
                },
                {
                  cross: false,
                  label: "Continuer les travaux non contestés",
                  desc: "Isoler le litige sur un point précis et ne pas contaminer l'ensemble du chantier.",
                },
                {
                  cross: true,
                  label: "Ne pas céder sur tout pour avoir la paix",
                  desc: "Chaque concession non justifiée crée un précédent et encourage de nouvelles demandes.",
                },
                {
                  cross: false,
                  label: "Passer à l'écrit dès que la tension monte",
                  desc: "Un email de synthèse après chaque échange difficile. La traçabilité est votre protection.",
                },
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span
                    className={`font-bold shrink-0 ${item.cross ? "text-destructive" : "text-primary"}`}
                  >
                    {item.cross ? "✗" : "✓"}
                  </span>
                  <span>
                    <strong className="text-foreground">{item.label}.</strong> {item.desc}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Recours */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Quand le conflit devient insoluble : les recours</h2>
            <p className="text-muted-foreground leading-relaxed">
              Si la situation ne se débloque pas, des recours formels existent. Dans l&apos;ordre de
              complexité croissante :
            </p>
            <ol className="space-y-4">
              {[
                {
                  step: "01",
                  title: "Médiateur de la consommation",
                  desc: "Gratuit, obligatoire avant tout recours judiciaire pour les contrats conclus avec des particuliers. Délai moyen : 90 jours.",
                },
                {
                  step: "02",
                  title: "Conciliation (tribunal judiciaire)",
                  desc: "Procédure amiable, rapide, gratuite. Le conciliateur est un bénévole assermenté. Efficace pour les litiges inférieurs à 10 000€.",
                },
                {
                  step: "03",
                  title: "Procédure simplifiée",
                  desc: "Pour les litiges inférieurs à 5 000€ : formulaire Cerfa, pas d'avocat obligatoire. Décision en quelques mois.",
                },
                {
                  step: "04",
                  title: "Expertise judiciaire",
                  desc: "Si la qualité des travaux est mise en cause. Coûteuse et longue, mais elle establit les responsabilités de façon définitive.",
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
            <div className="p-4 border rounded-xl space-y-2 bg-muted/20">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                <p className="font-semibold text-sm">Le dossier documenté est la seule arme</p>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Devis signés, comptes rendus de chantier, photos, échanges écrits : sans
                documentation, il n&apos;y a pas de dossier. Avec une documentation rigoureuse, la
                plupart des litiges se règlent avant d&apos;arriver devant un juge.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="border rounded-xl p-6 space-y-4 bg-muted/20">
          <h3 className="font-bold text-lg">
            Gardez une trace écrite de tous vos échanges clients dans Chalto
          </h3>
          <p className="text-sm text-muted-foreground">
            Chalto centralise vos documents, comptes rendus et messages par projet — votre meilleure
            protection en cas de litige.
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
          title="Client mécontent sur chantier : comment gérer le conflit sans perdre le contrat ?"
          url="https://chalto.fr/blog/gerer-conflit-chantier"
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
