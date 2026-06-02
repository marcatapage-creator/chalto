import { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, ArrowLeft, CheckCircle } from "lucide-react"
import { ShareButtons } from "@/components/blog/share-buttons"

export const revalidate = false

export const metadata: Metadata = {
  title: "Les 5 phases d'un projet de rénovation (et les erreurs à chaque transition)",
  description:
    "Cadrage, conception, validation, chantier, réception : chaque transition est un risque. Comment éviter les erreurs classiques qui font déraper un projet de rénovation.",
  openGraph: {
    title: "Les 5 phases d'un projet de rénovation (et les erreurs à chaque transition) | Chalto",
    description:
      "Cadrage, conception, validation, chantier, réception : chaque transition est un risque. Comment éviter les erreurs classiques qui font déraper un projet de rénovation.",
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
            <Badge variant="outline">Gestion de chantier</Badge>
            <span className="text-xs text-muted-foreground">
              14 juillet 2026 · 8 min de lecture
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight">
            Les 5 phases d&apos;un projet de rénovation (et les erreurs à chaque transition)
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Un projet de rénovation ne dérape presque jamais au milieu du chantier. Il dérape aux
            transitions — quand on passe trop vite d&apos;une phase à la suivante sans avoir
            correctement clôturé la précédente. Voici les 5 phases d&apos;un projet bien conduit, et
            les pièges à chaque frontière.
          </p>
        </div>

        {/* Hero image */}
        <div className="rounded-xl overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1200&q=80&auto=format&fit=crop"
            alt="Chantier de rénovation en cours"
            width={1200}
            height={630}
            className="w-full object-cover aspect-video"
            priority
          />
        </div>

        {/* Contenu */}
        <div className="space-y-8">
          {/* Phase 1 */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Phase 1 : Cadrage — définir avant de dessiner</h2>
            <p className="text-muted-foreground leading-relaxed">
              Le cadrage est la phase la plus souvent bâclée, et la plus coûteuse à négliger. Elle
              regroupe la rencontre client, la rédaction du brief, la définition du programme et
              l&apos;identification des contraintes (budget, délai, technique), la visite du site et
              le relevé de l&apos;existant.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              C&apos;est ici que se définit le périmètre réel du projet. Tout ce qui n&apos;est pas
              dit à ce stade surgira plus tard sous forme de conflit ou d&apos;avenant.
            </p>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-3">
                <span className="text-destructive font-bold shrink-0">✗</span>
                <span>
                  <strong className="text-foreground">
                    Erreur classique : passer à la conception sans budget validé.
                  </strong>{" "}
                  Le maître d&apos;ouvrage imagine un projet, le maître d&apos;œuvre dessine — et la
                  première estimation tombe trois fois au-dessus du budget réel. Tout est à refaire.
                </span>
              </li>
            </ul>
            <div className="p-4 border rounded-xl space-y-2 bg-muted/20">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                <p className="font-semibold text-sm">Livrable attendu</p>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Note de cadrage signée : budget estimatif, périmètre du projet, délai cible. Sans
                document signé, la phase de cadrage n&apos;est pas clôturée.
              </p>
            </div>
          </div>

          {/* Phase 2 */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Phase 2 : Conception — APS, APD, PRO</h2>
            <p className="text-muted-foreground leading-relaxed">
              La conception se déroule en trois sous-phases successives, chacune plus précise que la
              précédente :
            </p>
            <ol className="space-y-4">
              {[
                {
                  step: "APS",
                  title: "Avant-Projet Sommaire",
                  desc: "Parti architectural, premières estimations, grandes options techniques. Le client valide le cap avant d'aller plus loin.",
                },
                {
                  step: "APD",
                  title: "Avant-Projet Définitif",
                  desc: "Plans cotés, façades, coupes, estimatif fiable par lot. Le niveau de précision permet un premier chiffrage sérieux.",
                },
                {
                  step: "PRO",
                  title: "Projet",
                  desc: "Plans d'exécution, CCTP, DPGF. C'est le dossier qui part en consultation des entreprises.",
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
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-3">
                <span className="text-destructive font-bold shrink-0">✗</span>
                <span>
                  <strong className="text-foreground">
                    Erreur classique : démarrer l&apos;APD sans validation de l&apos;APS.
                  </strong>{" "}
                  Le client valide par écrit à chaque sous-phase — pas oralement, pas par email
                  implicite. Une validation formelle protège le maître d&apos;œuvre en cas de
                  désaccord ultérieur sur la direction prise.
                </span>
              </li>
            </ul>
          </div>

          {/* Phase 3 */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">
              Phase 3 : Validation et consultation — choisir les entreprises
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Une fois le projet validé, place à la consultation des entreprises. Cette phase
              comprend la constitution du DCE (Dossier de Consultation des Entreprises),
              l&apos;appel d&apos;offres ou la consultation restreinte, l&apos;analyse comparative
              des offres, la négociation et la signature des marchés de travaux.
            </p>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-3">
                <span className="text-destructive font-bold shrink-0">✗</span>
                <span>
                  <strong className="text-foreground">
                    Erreur classique : choisir uniquement sur le prix sans vérifier références et
                    assurances.
                  </strong>{" "}
                  Une entreprise pas chère mais non assurée ou sans expérience sur le type de
                  travaux concerné est un risque majeur. La responsabilité du maître d&apos;œuvre
                  peut être engagée.
                </span>
              </li>
            </ul>
            <div className="p-4 border rounded-xl space-y-2 bg-muted/20">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                <p className="font-semibold text-sm">Livrable attendu</p>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Marchés signés avec toutes les entreprises retenues, incluant les détails de prix,
                les délais et les conditions d&apos;exécution.
              </p>
            </div>
          </div>

          {/* Phase 4 */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Phase 4 : Chantier — suivi et coordination</h2>
            <p className="text-muted-foreground leading-relaxed">
              C&apos;est la phase visible — mais aussi celle où les décisions les plus rapides ont
              les conséquences les plus durables. Le maître d&apos;œuvre assure l&apos;OPC
              (Ordonnancement, Pilotage, Coordination), organise les réunions de chantier
              hebdomadaires, rédige les comptes rendus et gère les avenants et travaux modificatifs
              (TMA).
            </p>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-3">
                <span className="text-destructive font-bold shrink-0">✗</span>
                <span>
                  <strong className="text-foreground">
                    Erreur classique : ne pas formaliser les modifications en cours de chantier.
                  </strong>{" "}
                  Le client demande un changement à l&apos;oral, l&apos;artisan l&apos;exécute, et
                  personne ne signe d&apos;avenant. En fin de chantier, la facture surprise génère
                  un litige.
                </span>
              </li>
            </ul>
            <div className="p-4 border rounded-xl space-y-2 bg-muted/20">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                <p className="font-semibold text-sm">Livrable continu</p>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                PV de chantier hebdomadaires : décisions prises, points en suspens, modifications
                validées. Un chantier bien documenté est un chantier protégé.
              </p>
            </div>
          </div>

          {/* Phase 5 */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">
              Phase 5 : Réception et clôture — l&apos;acte juridique final
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              La réception est un acte juridique qui marque le transfert de la garde de
              l&apos;ouvrage et fait courir les garanties légales. Elle comprend les opérations
              préalables à la réception (OPR), le procès-verbal de réception, la levée des réserves
              et la remise du DOE (Dossier des Ouvrages Exécutés).
            </p>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-3">
                <span className="text-destructive font-bold shrink-0">✗</span>
                <span>
                  <strong className="text-foreground">
                    Erreur classique : signer la réception avec des réserves trop nombreuses ou
                    imprécises.
                  </strong>{" "}
                  Des réserves vagues sont impossibles à lever. Des réserves trop nombreuses
                  signalent que la réception était prématurée.
                </span>
              </li>
            </ul>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  title: "Garantie de parfait achèvement",
                  desc: "1 an — l'entreprise doit corriger tous les désordres signalés.",
                },
                {
                  title: "Garantie biennale",
                  desc: "2 ans — couvre les éléments d'équipement dissociables.",
                },
                {
                  title: "Garantie décennale",
                  desc: "10 ans — couvre les désordres qui compromettent la solidité ou la destination.",
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

          {/* Synthèse */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Pourquoi les transitions sont le vrai risque</h2>
            <p className="text-muted-foreground leading-relaxed">
              Chaque transition entre phases représente une décision irréversible. Passer à la
              conception sans cadrage validé, démarrer le chantier sans marchés signés, réceptionner
              sans OPR : chaque saut en avant génère un risque que la phase suivante ne peut pas
              effacer.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              La discipline du maître d&apos;œuvre, c&apos;est précisément de refuser de passer à
              l&apos;étape suivante tant que la checklist de clôture de la phase en cours n&apos;est
              pas complète : livrables produits, validés, signés, archivés.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Le maître d&apos;œuvre qui documente chaque transition se protège autant qu&apos;il
              protège son client. En cas de litige, la traçabilité des validations est la seule
              preuve qui compte.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="border rounded-xl p-6 space-y-4 bg-muted/20">
          <h3 className="font-bold text-lg">Pilotez chaque phase de vos projets dans Chalto</h3>
          <p className="text-sm text-muted-foreground">
            Chalto structure vos projets en phases (cadrage → conception → validation → chantier →
            réception) avec des statuts et des livrables à chaque étape.
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
          title="Les 5 phases d'un projet de rénovation (et les erreurs à chaque transition)"
          url="https://chalto.fr/blog/phases-projet-renovation"
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
