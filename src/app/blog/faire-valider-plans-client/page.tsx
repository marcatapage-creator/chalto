import { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, ArrowLeft, CheckCircle } from "lucide-react"

export const metadata: Metadata = {
  title: "Comment faire valider ses plans par un client sans email",
  description:
    "Les allers-retours par email font perdre un temps précieux aux architectes. Découvrez comment moderniser votre workflow de validation de plans avec vos clients.",
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
            <Badge variant="outline">Workflow</Badge>
            <span className="text-xs text-muted-foreground">18 avril 2026 · 6 min de lecture</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight">
            Comment faire valider ses plans par un client sans email
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Les allers-retours par email font perdre un temps précieux. Voici comment moderniser
            votre workflow de validation pour gagner en efficacité et en professionnalisme.
          </p>
        </div>

        {/* Contenu */}
        <div className="space-y-8">
          {/* Le problème */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Le problème des emails de validation</h2>
            <p className="text-muted-foreground leading-relaxed">
              Vous connaissez le scénario. Vous finissez un plan après plusieurs heures de travail,
              vous l&apos;exportez en PDF, vous l&apos;attachez à un email, vous attendez. Trois
              jours plus tard votre client répond : &quot;Oui c&apos;est bien mais est-ce qu&apos;on
              peut voir une autre version avec la cuisine déplacée ?&quot; Vous repartez de zéro.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Ce n&apos;est pas juste une perte de temps — c&apos;est un problème structurel. Par
              email, il est impossible de savoir si votre client a vraiment lu le document,
              s&apos;il a compris ce qu&apos;on lui demandait de valider, et quelle version était la
              bonne. Sans parler des emails perdus dans les spams ou des pièces jointes trop lourdes
              qui ne passent pas.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              En France, un architecte passe en moyenne 30% de son temps sur des tâches
              administratives et de communication. Une grande partie de ce temps est consacrée aux
              allers-retours de validation avec les clients. C&apos;est autant de temps en moins
              pour concevoir.
            </p>
          </div>

          {/* Pourquoi l'email ne marche pas */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">
              Pourquoi l&apos;email est un mauvais outil de validation
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              L&apos;email a été conçu pour communiquer, pas pour valider des livrables
              professionnels. Voici ses limites concrètes dans un contexte de validation de plans :
            </p>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-3">
                <span className="text-destructive font-bold shrink-0">✗</span>
                <span>
                  <strong className="text-foreground">Pas de traçabilité claire.</strong> Qui a
                  validé quoi et quand ? Difficile à prouver en cas de litige.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-destructive font-bold shrink-0">✗</span>
                <span>
                  <strong className="text-foreground">Versions multiples.</strong> Entre V1, V2,
                  V2-finale, V2-finale-corrigée — impossible de savoir quelle version fait foi.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-destructive font-bold shrink-0">✗</span>
                <span>
                  <strong className="text-foreground">Pas d&apos;accusé de lecture.</strong> Votre
                  client a-t-il vraiment ouvert le PDF ? Impossible à savoir.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-destructive font-bold shrink-0">✗</span>
                <span>
                  <strong className="text-foreground">Commentaires dispersés.</strong> Les retours
                  arrivent en plusieurs emails, parfois contradictoires, difficiles à centraliser.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-destructive font-bold shrink-0">✗</span>
                <span>
                  <strong className="text-foreground">Image peu professionnelle.</strong> Vos
                  concurrents utilisent peut-être déjà des outils plus modernes. Un client remarque
                  la différence.
                </span>
              </li>
            </ul>
          </div>

          {/* Les alternatives */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">
              Les alternatives à l&apos;email pour valider ses plans
            </h2>

            <h3 className="text-xl font-semibold">1. Les outils de signature électronique</h3>
            <p className="text-muted-foreground leading-relaxed">
              Des solutions comme DocuSign ou Yousign permettent de faire signer des documents
              légalement. C&apos;est utile pour les contrats de maîtrise d&apos;œuvre, mais
              surdimensionné pour valider un plan en cours de conception. Le client doit créer un
              compte, naviguer dans une interface complexe — pour juste dire &quot;oui c&apos;est
              bon&quot;.
            </p>

            <h3 className="text-xl font-semibold">2. Les espaces de partage cloud</h3>
            <p className="text-muted-foreground leading-relaxed">
              Google Drive, Dropbox ou WeTransfer permettent de partager des fichiers facilement.
              Mais ils ne gèrent pas la validation en tant que telle. Votre client peut télécharger
              le fichier sans jamais vous dire s&apos;il l&apos;approuve ou non. Et si vous partagez
              un dossier entier, il risque d&apos;ouvrir une ancienne version par erreur.
            </p>

            <h3 className="text-xl font-semibold">3. Les plateformes de gestion de projet</h3>
            <p className="text-muted-foreground leading-relaxed">
              Notion, Trello ou Asana peuvent servir de base documentaire. Mais ils ne sont pas
              pensés pour la relation client dans le bâtiment. Votre client devra créer un compte,
              apprendre l&apos;outil — ce qui représente une friction trop importante pour beaucoup
              de maîtres d&apos;ouvrage.
            </p>

            <h3 className="text-xl font-semibold">4. Un outil dédié à la validation</h3>
            <p className="text-muted-foreground leading-relaxed">
              C&apos;est l&apos;approche la plus efficace. Un outil comme Chalto permet
              d&apos;envoyer un lien sécurisé à votre client, qui peut consulter le document et
              l&apos;approuver en un clic — sans créer de compte. La validation est horodatée,
              archivée et consultable à tout moment.
            </p>
          </div>

          {/* Comment ça marche */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">
              Comment mettre en place un workflow de validation efficace
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Voici le processus qu&apos;on recommande pour structurer vos validations client de A à
              Z :
            </p>
            <ol className="space-y-4">
              {[
                {
                  step: "01",
                  title: "Centralisez vos documents par projet",
                  desc: "Créez un espace dédié pour chaque projet avec toutes les pièces : plans, notices, CCTP. Plus de fichiers éparpillés sur votre bureau ou dans des dossiers mal nommés.",
                },
                {
                  step: "02",
                  title: "Uploadez la version à valider",
                  desc: "Quand un document est prêt pour validation, uploadez-le dans votre espace projet. Nommez-le clairement avec le numéro de version.",
                },
                {
                  step: "03",
                  title: "Envoyez un lien sécurisé",
                  desc: "Générez un lien de validation unique et envoyez-le à votre client par email ou SMS. Il clique, il voit le document, il valide ou commente.",
                },
                {
                  step: "04",
                  title: "Recevez la validation horodatée",
                  desc: "Dès que votre client approuve, vous êtes notifié. La validation est enregistrée avec la date et l'heure. Vous avez une preuve en cas de litige.",
                },
                {
                  step: "05",
                  title: "Archivez et passez à la suite",
                  desc: "Le document validé est archivé automatiquement. Vous pouvez proposer une nouvelle version si des modifications sont demandées.",
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

          {/* Les bénéfices */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Ce que vous y gagnez concrètement</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  title: "Du temps retrouvé",
                  desc: "Moins d'emails à rédiger, moins de relances, moins de confusion sur les versions.",
                },
                {
                  title: "Une image professionnelle",
                  desc: "Vos clients perçoivent immédiatement la différence avec un processus structuré.",
                },
                {
                  title: "Une traçabilité complète",
                  desc: "Chaque validation est datée et archivée. Vous êtes protégé en cas de litige.",
                },
                {
                  title: "Des clients plus réactifs",
                  desc: "Un lien à cliquer, c'est infiniment plus simple qu'un email avec pièce jointe.",
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
              Faire valider ses plans par email, c&apos;est comme envoyer un courrier recommandé
              quand on peut envoyer un SMS. Ça fonctionne, mais c&apos;est lent, peu traçable et peu
              professionnel.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Les outils modernes permettent aujourd&apos;hui de mettre en place un workflow de
              validation simple, rapide et professionnel — sans que votre client ait à créer un
              compte ou apprendre un nouvel outil.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Le temps que vous y investissez se rentabilise dès le premier projet où vous évitez un
              malentendu sur la version validée d&apos;un plan.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="border rounded-xl p-6 space-y-4 bg-muted/20">
          <h3 className="font-bold text-lg">Essayez Chalto gratuitement</h3>
          <p className="text-sm text-muted-foreground">
            Envoyez votre premier lien de validation à un client en moins de 5 minutes. Sans carte
            bancaire.
          </p>
          <Button asChild>
            <Link href="/#waitlist">
              Commencer gratuitement
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

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
