"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-foreground mb-2">{title}</h3>
      <div className="text-sm text-muted-foreground leading-relaxed space-y-2">{children}</div>
    </div>
  )
}

function MentionsLegalesContent() {
  return (
    <div>
      <Section title="1. Éditeur du site">
        <p>
          Le site <strong>chalto.fr</strong> est édité par la société <strong>Chalto</strong>,
          entreprise immatriculée au Registre du Commerce et des Sociétés.
        </p>
        <p>
          Siège social : France
          <br />
          Email de contact :{" "}
          <a href="mailto:contact@chalto.fr" className="underline">
            contact@chalto.fr
          </a>
        </p>
        <p>Directeur de la publication : Marc Gori</p>
      </Section>

      <Section title="2. Hébergement">
        <p>
          Le site est hébergé par <strong>Vercel Inc.</strong>, 340 Pine Street, Suite 701, San
          Francisco, CA 94104, États-Unis.
        </p>
        <p>
          La base de données est hébergée par <strong>Supabase Inc.</strong> sur des serveurs
          localisés dans l&apos;Union Européenne (région eu-west).
        </p>
      </Section>

      <Section title="3. Propriété intellectuelle">
        <p>
          L&apos;ensemble des éléments constitutifs du site chalto.fr (textes, graphismes,
          logiciels, photographies, images, sons, plans, noms, logos, marques, créations et œuvres
          protégeables diverses) sont la propriété exclusive de Chalto ou de ses partenaires.
        </p>
        <p>
          Toute reproduction, représentation, diffusion ou rediffusion, en tout ou partie, du
          contenu de ce site sur quelque support ou par tout procédé que ce soit, ainsi que toute
          vente, revente, retransmission ou mise à disposition de tiers de quelque manière que ce
          soit sont interdites.
        </p>
      </Section>

      <Section title="4. Données personnelles (RGPD)">
        <p>
          Chalto collecte des données personnelles dans le cadre de la fourniture de son service.
          Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi
          Informatique et Libertés, vous disposez des droits suivants sur vos données :
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Droit d&apos;accès</li>
          <li>Droit de rectification</li>
          <li>Droit à l&apos;effacement</li>
          <li>Droit à la portabilité</li>
          <li>Droit d&apos;opposition au traitement</li>
        </ul>
        <p>
          Pour exercer ces droits, contactez-nous à{" "}
          <a href="mailto:contact@chalto.fr" className="underline">
            contact@chalto.fr
          </a>
          .
        </p>
      </Section>

      <Section title="5. Cookies">
        <p>Le site chalto.fr utilise deux types de cookies :</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <strong>Cookies techniques</strong> — indispensables au fonctionnement du service
            (authentification, préférences d&apos;affichage). Ils ne nécessitent pas votre
            consentement.
          </li>
          <li>
            <strong>Cookies analytiques (Google Analytics)</strong> — utilisés pour mesurer
            l&apos;audience et améliorer le service. Ils sont déposés uniquement après votre accord
            explicite, que vous pouvez donner ou retirer à tout moment via la bannière affichée lors
            de votre première visite.
          </li>
        </ul>
        <p>
          Nous utilisons également Vercel Analytics, un outil de mesure d&apos;audience anonymisé
          qui ne dépose pas de cookies et ne collecte aucune donnée personnelle identifiable.
        </p>
        <p>
          Pour retirer votre consentement aux cookies analytiques, effacez les données de votre
          navigateur pour chalto.fr ou contactez-nous à{" "}
          <a href="mailto:contact@chalto.fr" className="underline">
            contact@chalto.fr
          </a>
          .
        </p>
      </Section>

      <Section title="6. Liens hypertextes">
        <p>
          Le site chalto.fr peut contenir des liens vers des sites tiers. Chalto ne peut être tenu
          responsable du contenu de ces sites ni des pratiques de confidentialité qu&apos;ils
          appliquent.
        </p>
      </Section>

      <p className="text-xs text-muted-foreground mt-8">Dernière mise à jour : mai 2026</p>
    </div>
  )
}

function CguContent() {
  return (
    <div>
      <Section title="1. Objet">
        <p>
          Les présentes Conditions Générales d&apos;Utilisation (CGU) régissent l&apos;accès et
          l&apos;utilisation de la plateforme <strong>Chalto</strong>, accessible à l&apos;adresse
          chalto.fr, éditée par la société Chalto.
        </p>
        <p>
          Chalto est une solution SaaS destinée aux professionnels du BTP (architectes, artisans,
          entrepreneurs) pour la gestion de projets de construction et de rénovation.
        </p>
      </Section>

      <Section title="2. Acceptation des CGU">
        <p>
          L&apos;utilisation de la plateforme implique l&apos;acceptation pleine et entière des
          présentes CGU. Si vous n&apos;acceptez pas ces conditions, vous ne devez pas utiliser le
          service.
        </p>
      </Section>

      <Section title="3. Accès au service">
        <p>
          L&apos;accès à Chalto nécessite la création d&apos;un compte utilisateur. Vous vous
          engagez à fournir des informations exactes et à maintenir la confidentialité de vos
          identifiants.
        </p>
        <p>
          Chalto se réserve le droit de suspendre ou supprimer tout compte en cas de violation des
          présentes CGU, d&apos;usage frauduleux ou de comportement préjudiciable à la plateforme ou
          aux autres utilisateurs.
        </p>
      </Section>

      <Section title="4. Description du service">
        <p>Chalto met à disposition les fonctionnalités suivantes :</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Gestion de projets multi-phases</li>
          <li>Gestion documentaire avec validation client</li>
          <li>Génération de documents techniques (CCTP) assistée par IA</li>
          <li>Suivi des prestataires et des tâches</li>
          <li>Notifications et alertes d&apos;échéances</li>
          <li>Collaboration avec liens d&apos;accès temporaires</li>
        </ul>
      </Section>

      <Section title="5. Utilisation acceptable">
        <p>Vous vous engagez à ne pas utiliser Chalto pour :</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            Diffuser des contenus illicites, offensants ou portant atteinte aux droits de tiers
          </li>
          <li>Tenter d&apos;accéder à des données appartenant à d&apos;autres utilisateurs</li>
          <li>Utiliser le service à des fins contraires aux lois et réglementations en vigueur</li>
          <li>Effectuer des tests de charge ou des attaques informatiques sur les serveurs</li>
        </ul>
      </Section>

      <Section title="6. Données et confidentialité">
        <p>
          Les données que vous saisissez sur Chalto (projets, documents, contacts) vous
          appartiennent. Chalto ne cède pas vos données à des tiers à des fins commerciales.
        </p>
        <p>
          Vos données sont hébergées sur des serveurs sécurisés au sein de l&apos;Union Européenne.
          Chalto applique des mesures techniques et organisationnelles conformes aux standards de
          sécurité en vigueur (chiffrement TLS, authentification JWT, accès role-based).
        </p>
      </Section>

      <Section title="7. Disponibilité du service">
        <p>
          Chalto s&apos;efforce d&apos;assurer la disponibilité de la plateforme 24h/24 et 7j/7. Des
          interruptions ponctuelles peuvent survenir pour des raisons de maintenance ou en cas de
          force majeure. Chalto ne saurait être tenu responsable des dommages résultant d&apos;une
          indisponibilité du service.
        </p>
      </Section>

      <Section title="8. Tarification et facturation">
        <p>
          L&apos;accès à Chalto est soumis à un abonnement dont les tarifs sont disponibles sur le
          site. Durant la période bêta, l&apos;accès est gratuit pour les utilisateurs sélectionnés.
          Les tarifs peuvent évoluer avec un préavis de 30 jours communiqué par email.
        </p>
      </Section>

      <Section title="9. Limitation de responsabilité">
        <p>
          Chalto est un outil d&apos;aide à la gestion de projet. La responsabilité de
          l&apos;exactitude des données saisies et des décisions prises incombe à
          l&apos;utilisateur. Chalto ne saurait être tenu responsable des conséquences juridiques,
          financières ou techniques découlant de l&apos;utilisation de la plateforme.
        </p>
      </Section>

      <Section title="10. Modification des CGU">
        <p>
          Chalto se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs
          seront informés de toute modification substantielle par email avec un préavis de 15 jours.
          La poursuite de l&apos;utilisation du service après ce délai vaut acceptation des
          nouvelles conditions.
        </p>
      </Section>

      <Section title="11. Droit applicable">
        <p>
          Les présentes CGU sont soumises au droit français. Tout litige relatif à leur
          interprétation ou à leur exécution relève de la compétence exclusive des tribunaux
          français.
        </p>
      </Section>

      <p className="text-xs text-muted-foreground mt-8">Dernière mise à jour : mai 2026</p>
    </div>
  )
}

export function LandingLegalDialogs() {
  const [open, setOpen] = useState<"mentions" | "cgu" | null>(null)

  return (
    <>
      <li>
        <button
          onClick={() => setOpen("mentions")}
          className="hover:text-foreground transition-colors"
        >
          Mentions légales
        </button>
      </li>
      <li>
        <button onClick={() => setOpen("cgu")} className="hover:text-foreground transition-colors">
          CGU
        </button>
      </li>

      <Dialog open={open === "mentions"} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="w-[calc(100%-3rem)] sm:w-full max-w-2xl flex flex-col max-h-[85vh]">
          <DialogHeader>
            <DialogTitle>Mentions légales</DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto flex-1 pr-2 mt-2">
            <MentionsLegalesContent />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={open === "cgu"} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="w-[calc(100%-3rem)] sm:w-full max-w-2xl flex flex-col max-h-[85vh]">
          <DialogHeader>
            <DialogTitle>Conditions Générales d&apos;Utilisation</DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto flex-1 pr-2 mt-2">
            <CguContent />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
