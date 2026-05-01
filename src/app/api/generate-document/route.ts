import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { Document, Paragraph, TextRun, HeadingLevel, Packer, AlignmentType } from "docx"

interface Answers {
  lots: string[]
  pieces: string[]
  materiaux: string
  ambiance: string
  contraintes: string
  niveau: "economique" | "standard" | "premium"
}

interface RequestBody {
  projectId: string
  projectName: string
  workType: string
  clientName?: string
  professionSlug?: string
  documentType: "cctp" | "aps"
  answers: Answers
}

// ---------------------------------------------------------------------------
// Mock CCTP statique (dev uniquement)
// ---------------------------------------------------------------------------

function buildMockCCTPContent(
  projectName: string,
  workType: string,
  clientName: string | undefined,
  answers: Answers,
  isArchiInterieur = false
): string {
  const niveauMap: Record<string, string> = {
    economique: "Économique",
    standard: "Standard",
    premium: "Premium",
  }
  const niveauLabel = niveauMap[answers.niveau]
  const lotsStr = answers.lots.join(", ")
  const date = new Date().toLocaleDateString("fr-FR")

  if (isArchiInterieur) {
    return `
CAHIER DES CLAUSES TECHNIQUES PARTICULIÈRES (CCTP)
Projet : ${projectName}
${clientName ? `Client : ${clientName}` : ""}
Type de mission : ${workType}
Niveau de prestation : ${niveauLabel}
Prestations concernées : ${lotsStr}
Date : ${date}

---

1. OBJET DE LA MISSION ET GÉNÉRALITÉS

Le présent CCTP définit les prescriptions techniques applicables aux travaux d'architecture intérieure du projet ${projectName}. Il précise les spécifications de mise en œuvre, les matériaux et finitions à réaliser pour chaque prestation.

L'ensemble des travaux est réalisé conformément aux DTU en vigueur, aux règles de l'art et aux prescriptions des fabricants. L'artisan titulaire est réputé avoir pris connaissance des lieux avant remise de son offre.

---

2. DOCUMENTS DE RÉFÉRENCE ET NORMES APPLICABLES

Sont réputés connus et acceptés : les DTU relatifs aux ouvrages concernés, les normes NF en vigueur, et les fiches techniques des produits prescrits. En cas de contradiction, les prescriptions les plus sévères s'appliquent.

---

3. CLOISONS ET DISTRIBUTION INTÉRIEURE${answers.lots.includes("Cloisons & distribution") ? "" : " (prestation non concernée — pour information)"}

Les cloisons de distribution sont réalisées en plaques de plâtre sur ossature métallique (système Placostil ou équivalent), conformément au DTU 25.41. L'indice d'affaiblissement acoustique est de ${answers.niveau === "premium" ? "≥ 48 dB" : answers.niveau === "standard" ? "≥ 42 dB" : "≥ 36 dB"}.

${answers.materiaux ? `Matériaux prescrits : ${answers.materiaux}.` : "Les matériaux sont soumis à validation de l'architecte d'intérieur."}

---

4. REVÊTEMENTS DE SOLS${answers.lots.includes("Revêtements sols") ? "" : " (prestation non concernée — pour information)"}

Les revêtements de sol sont posés sur support parfaitement plan (tolérance ≤ 3 mm sous règle de 2 m) et sec (humidité résiduelle ≤ 3 %). Les jonctions entre matériaux sont traitées par profilés de finition adaptés.

Niveau ${niveauLabel} : ${
      answers.niveau === "economique"
        ? "carrelage grès cérame 45×45, parquet stratifié AC4."
        : answers.niveau === "standard"
          ? "carrelage grès cérame rectifié 60×60, parquet contrecollé chêne 14 mm."
          : "grand format rectifié 90×90, parquet massif chêne 20 mm huilé, béton ciré en option."
    }

---

5. REVÊTEMENTS MURAUX ET PEINTURES${answers.lots.includes("Peinture & revêtements murs") ? "" : " (prestation non concernée — pour information)"}

Les peintures sont appliquées sur enduit lissé (EP 1 selon DTU 59.1). Minimum deux couches de finition après impression. Les supports humides reçoivent un traitement hydrofuge préalable.

Niveau ${niveauLabel} : ${
      answers.niveau === "economique"
        ? "peinture acrylique mate standard, teintes gamme courante."
        : answers.niveau === "standard"
          ? "peinture acrylique velours, teintes NCS ou RAL au choix."
          : "peinture minérale ou à la chaux, papier peint haut de gamme, enduit décoratif ou stucs."
    }

---

6. PLAFONDS ET FAUX-PLAFONDS${answers.lots.includes("Plafonds & faux-plafonds") ? "" : " (prestation non concernée — pour information)"}

Les faux-plafonds sont réalisés en plaques de plâtre sur ossature suspendue (DTU 25.41) ou en dalles acoustiques selon les zones. La hauteur sous faux-plafond est définie sur les plans de l'architecte d'intérieur.

Niveau ${niveauLabel} : ${
      answers.niveau === "economique"
        ? "plâtre bande standard, peinture blanche."
        : answers.niveau === "standard"
          ? "plâtre avec saignées d'éclairage encastré, peinture velours."
          : "plâtre avec caissons décoratifs, éclairage indirect intégré, finition laquée."
    }

---

7. MENUISERIES INTÉRIEURES ET RANGEMENTS${answers.lots.includes("Menuiseries intérieures") ? "" : " (prestation non concernée — pour information)"}

Les portes intérieures sont posées à l'aplomb et au niveau, avec jeu périphérique de 3 mm maximum. Les placards et rangements sur mesure sont réalisés en panneau MDF ou bois massif selon le niveau de prestation.

Niveau ${niveauLabel} : ${
      answers.niveau === "economique"
        ? "portes en MDF plaqué, quincaillerie standard."
        : answers.niveau === "standard"
          ? "portes en MDF laqué ou placage bois, poignées design milieu de gamme."
          : "portes sur mesure bois massif ou laqué brillant, quincaillerie premium (Häfele, Frol)."
    }

${answers.contraintes ? `Contraintes spécifiques : ${answers.contraintes}.` : ""}

---

8. ÉLECTRICITÉ, ÉCLAIRAGE ET COURANTS FAIBLES${answers.lots.includes("Électricité & éclairage") ? "" : " (prestation non concernée — pour information)"}

L'installation électrique est réalisée conformément à la norme NF C 15-100. Le plan d'éclairage est fourni par l'architecte d'intérieur. Les spots encastrés sont de classe II, IP44 minimum en zone humide.

Niveau ${niveauLabel} : ${
      answers.niveau === "economique"
        ? "éclairage fonctionnel, spots encastrés standard."
        : answers.niveau === "standard"
          ? "éclairage ambiance + tâche, dimmers Legrand Céliane, LED 2700K."
          : "éclairage architectural sur variation (Lutron ou équivalent), luminaires de créateur."
    }

---

9. PLOMBERIE ET SANITAIRES${answers.lots.includes("Plomberie & sanitaires") ? "" : " (prestation non concernée — pour information)"}

Les réseaux eau froide, eau chaude et évacuations sont conformes au DTU 60.1. L'appareillage sanitaire est fourni par le client ou par l'entreprise selon les dispositions du marché.

Niveau ${niveauLabel} : ${
      answers.niveau === "economique"
        ? "gamme entrée de gamme (Allia, Jacob Delafon entrée de gamme)."
        : answers.niveau === "standard"
          ? "gamme milieu (Duravit D-Neo, robinetterie Hansgrohe Logis)."
          : "gamme premium (Duravit, Villeroy & Boch, robinetterie Hansgrohe Axor ou Vola)."
    }

---

10. RÉCEPTION ET GARANTIES

La réception est effectuée contradictoirement avec l'architecte d'intérieur. Les réserves sont levées dans un délai de 15 jours ouvrés. Les garanties légales s'appliquent : parfait achèvement (1 an), biennale (2 ans) pour les équipements dissociables, décennale (10 ans) pour les ouvrages de structure.

---

Fin du CCTP — ${projectName}
Document généré par Chalto
`
  }

  return `
CAHIER DES CLAUSES TECHNIQUES PARTICULIÈRES (CCTP)
Projet : ${projectName}
${clientName ? `Client : ${clientName}` : ""}
Type de travaux : ${workType}
Niveau de prestation : ${niveauLabel}
Lots concernés : ${lotsStr}
Date : ${date}

---

1. OBJET DU MARCHÉ ET GÉNÉRALITÉS

Le présent CCTP a pour objet de définir les prescriptions techniques applicables aux travaux de ${workType.toLowerCase()} dans le cadre du projet ${projectName}. Il précise les conditions d'exécution des ouvrages, les matériaux à mettre en œuvre et les performances attendues pour chaque lot.

Les travaux sont réalisés conformément aux Documents Techniques Unifiés (DTU) en vigueur, aux normes NF, aux prescriptions des fabricants et aux règles de l'art. Tout document technique spécifique mentionné dans ce CCTP fait partie intégrante du présent marché.

---

2. DOCUMENTS CONTRACTUELS ET NORMES DE RÉFÉRENCE

Sont réputés connus et acceptés de l'entrepreneur l'ensemble des normes NF, DTU, eurocodes et guides techniques relatifs aux ouvrages concernés. En cas de contradiction entre ces documents, les prescriptions les plus sévères s'appliquent.

L'entrepreneur doit disposer des qualifications professionnelles requises (Qualibat ou équivalent) pour chaque lot exécuté. Les sous-traitants sont soumis aux mêmes exigences et doivent être agréés par le maître d'ouvrage.

---

3. GROS ŒUVRE${answers.lots.includes("Gros œuvre") ? "" : " (lot non concerné — pour information)"}

Les travaux de gros œuvre comprennent les terrassements, les fondations, les dallages, les maçonneries porteuses et les ouvrages en béton armé. Les bétons sont dosés conformément à la norme NF EN 206 et les aciers répondent aux exigences de la norme NF A 35-080.

${answers.materiaux ? `Matériaux prescrits : ${answers.materiaux}.` : "Les matériaux sont soumis à l'approbation du maître d'œuvre avant mise en œuvre."}

Niveau de prestation ${niveauLabel} : ${
    answers.niveau === "economique"
      ? "Blocs béton standard, béton dosé à 250 kg/m³ minimum."
      : answers.niveau === "standard"
        ? "Blocs béton ou parpaing préfabriqué, béton dosé à 300 kg/m³, isolation thermique conforme RT2020."
        : "Béton banché haute performance, isolation renforcée, finitions soignées intérieur/extérieur."
  }

---

4. CHARPENTE ET COUVERTURE${answers.lots.includes("Charpente") ? "" : " (lot non concerné — pour information)"}

La charpente doit reprendre l'ensemble des charges permanentes et variables conformément aux eurocodes 1 et 5. Les assemblages sont réalisés par connecteurs métalliques ou boulonnage, selon plans visés par le bureau de contrôle.

La couverture assure l'étanchéité à l'eau, au vent et à la neige pour la zone climatique du site. Les relevés, noues et rives sont traités avec soin pour garantir une durabilité minimale de 30 ans.

---

5. MENUISERIES EXTÉRIEURES ET INTÉRIEURES${answers.lots.includes("Menuiserie") ? "" : " (lot non concerné — pour information)"}

Les menuiseries extérieures présentent une valeur Uw ≤ ${answers.niveau === "premium" ? "0,8" : answers.niveau === "standard" ? "1,1" : "1,3"} W/m²K. Les vitrages sont de type feuilleté sécurité en parties basses et zones accessibles. Les occultations (volets, stores) sont intégrées à la conception architecturale.

Les menuiseries intérieures (portes, placards) sont en ${answers.niveau === "premium" ? "bois massif ou MDF laqué haute qualité" : "MDF ou panneaux stratifiés"}. Les quincailleries sont de marque reconnue avec garantie décennale.

---

6. PLOMBERIE ET SANITAIRES${answers.lots.includes("Plomberie") ? "" : " (lot non concerné — pour information)"}

Les réseaux eau froide, eau chaude sanitaire et évacuations sont conformes au DTU 60.1. Les canalisations sont en cuivre, multicouche ou PER selon les zones. L'installation intègre un disconnecteur homologué en pied de colonne montante.

Appareillage sanitaire niveau ${niveauLabel} : ${
    answers.niveau === "economique"
      ? "gamme entrée de marque (Allia, Jacob Delafon entrée de gamme)."
      : answers.niveau === "standard"
        ? "gamme milieu (Jacob Delafon, Ideal Standard)."
        : "gamme premium (Duravit, Villeroy & Boch, robinetterie Grohe Essence)."
  }

---

7. ÉLECTRICITÉ ET COURANTS FAIBLES${answers.lots.includes("Électricité") ? "" : " (lot non concerné — pour information)"}

L'installation électrique est réalisée conformément à la norme NF C 15-100. Le tableau de distribution est équipé de disjoncteurs différentiels 30 mA et d'un parafoudre. Les câbles sont de type R2V posés sous gaine IRL encastrée ou apparente selon les zones.

Courants faibles : réseau RJ45 catégorie ${answers.niveau === "premium" ? "7A" : "6A"} en étoile depuis un coffret communication centralisé, câblage VDI selon norme EN 50173.

${answers.contraintes ? `Contraintes spécifiques à respecter : ${answers.contraintes}.` : ""}

---

8. REVÊTEMENTS SOLS ET MURS${answers.lots.includes("Revêtements") ? "" : " (lot non concerné — pour information)"}

Les revêtements de sol sont posés sur chape lissée (planéité ≤ 5 mm sous la règle de 2 m) ou ragréage autolissant. Les carrelages extérieurs sont de classe antidérapante R11 minimum. Les jonctions entre matériaux sont traitées par profilés inox.

Niveau ${niveauLabel} : ${
    answers.niveau === "economique"
      ? "carrelage grès cérame 45×45, peinture glycéro ou acrylique standard."
      : answers.niveau === "standard"
        ? "carrelage grès cérame rectifié 60×60, enduit décoratif ou peinture premium."
        : "grand format 90×90 rectifié, parquet massif dans les pièces de vie, béton ciré en option."
  }

---

9. FAÇADE ET ISOLATION THERMIQUE${answers.lots.includes("Façade") ? "" : " (lot non concerné — pour information)"}

La façade assure la protection aux intempéries, l'isolation thermique (résistance R ≥ ${answers.niveau === "premium" ? "5,5" : answers.niveau === "standard" ? "4,5" : "3,7"} m²K/W) et l'aspect architectural défini par le projet. Les fixations mécaniques des systèmes d'isolation sont dimensionnées selon DTU 55.2.

Les enduits de façade sont de classe III (fissuration acceptable ≤ 0,2 mm). Les teintes sont validées par le maître d'œuvre sur planche d'essai avant application généralisée.

---

10. RÉCEPTION DES TRAVAUX ET GARANTIES

La réception est prononcée contradictoirement entre le maître d'ouvrage et l'entrepreneur, en présence du maître d'œuvre. Les réserves sont levées dans un délai maximum de 30 jours calendaires suivant la notification écrite.

Les garanties applicables sont : la garantie de parfait achèvement (1 an), la garantie biennale (2 ans) pour les équipements dissociables, et la garantie décennale (10 ans) pour les éléments compromettant la solidité ou l'étanchéité de l'ouvrage. L'entrepreneur remet ses attestations d'assurance décennale avant tout début de travaux.

---

Fin du CCTP — ${projectName}
Document généré par Chalto
`
}

// ---------------------------------------------------------------------------
// Mock APS statique (dev uniquement)
// ---------------------------------------------------------------------------

function buildMockAPSContent(
  projectName: string,
  workType: string,
  clientName: string | undefined,
  answers: Answers
): string {
  const niveauMap: Record<string, string> = {
    economique: "Économique",
    standard: "Standard",
    premium: "Premium",
  }
  const niveauLabel = niveauMap[answers.niveau]
  const piecesStr = answers.pieces.join(", ")
  const date = new Date().toLocaleDateString("fr-FR")

  return `
AVANT-PROJET SOMMAIRE (APS)
Projet : ${projectName}
${clientName ? `Client : ${clientName}` : ""}
Type de mission : ${workType}
Niveau de prestation : ${niveauLabel}
Espaces concernés : ${piecesStr}
Date : ${date}

---

1. PRÉSENTATION DU PROJET ET CONTEXTE

Le présent Avant-Projet Sommaire définit les orientations générales de la mission d'architecture intérieure pour le projet ${projectName}. Il constitue la première étape de conception et a pour objectif de valider le parti pris architectural, le programme des espaces et les grandes orientations matériaux avant d'engager les études détaillées.

${clientName ? `Ce document est établi pour ${clientName}.` : ""}

---

2. ANALYSE DE L'EXISTANT ET CONTRAINTES

L'analyse du site existant a permis d'identifier les caractéristiques suivantes : configuration des espaces, hauteurs sous plafond, ouvertures et apports lumineux, réseaux en place (électricité, plomberie, chauffage).

${answers.contraintes ? `Contraintes identifiées : ${answers.contraintes}.` : "Aucune contrainte particulière signalée à ce stade — à préciser lors du relevé contradictoire."}

---

3. PARTI PRIS ARCHITECTURAL ET AMBIANCE

${answers.ambiance ? `L'ambiance souhaitée par le maître d'ouvrage : ${answers.ambiance}.` : "Le parti pris architectural sera défini en concertation avec le maître d'ouvrage lors de la phase de conception."}

L'ensemble du projet s'articule autour d'une cohérence globale des matériaux, des teintes et des volumes. Les espaces de vie bénéficieront d'une attention particulière portée à la lumière naturelle et aux circulations.

---

4. PROGRAMME DES ESPACES TRAITÉS

Les espaces suivants font l'objet de la présente mission : ${piecesStr}.

Pour chaque espace, les interventions porteront sur : la distribution et le cloisonnement, les revêtements de sols et de murs, les plafonds, les menuiseries intérieures, l'éclairage et le mobilier sur mesure.

---

5. ORIENTATIONS MATÉRIAUX ET FINITIONS

Niveau de prestation ${niveauLabel} :
${
  answers.niveau === "economique"
    ? "- Sols : carrelage grès cérame ou parquet stratifié\n- Murs : peinture acrylique mate, teintes gamme courante\n- Menuiseries : MDF plaqué, finition standard"
    : answers.niveau === "standard"
      ? "- Sols : parquet contrecollé chêne ou carrelage rectifié 60×60\n- Murs : peinture velours NCS/RAL, papier peint milieu de gamme\n- Menuiseries : MDF laqué, quincaillerie design"
      : "- Sols : parquet massif, grand format rectifié, béton ciré selon espaces\n- Murs : peinture minérale, enduit décoratif, papier peint haut de gamme\n- Menuiseries : bois massif ou laqué brillant, quincaillerie premium"
}

${answers.materiaux ? `Matériaux et finitions prescrits : ${answers.materiaux}.` : ""}

---

6. PRÉCONISATIONS TECHNIQUES

Les travaux seront réalisés dans le respect des DTU en vigueur. Une coordination avec les corps de métier concernés (électricité NF C 15-100, plomberie DTU 60.1, carrelage DTU 52.1) sera assurée par le maître d'œuvre tout au long de la mission.

---

7. ESTIMATION BUDGÉTAIRE INDICATIVE

L'estimation budgétaire sera établie sur la base du présent APS et précisée à l'APD. Elle intègre les coûts de fournitures, main d'œuvre et honoraires de maîtrise d'œuvre.

Niveau ${niveauLabel} — fourchette indicative au m² traité :
${
  answers.niveau === "economique"
    ? "400 – 700 € TTC / m²"
    : answers.niveau === "standard"
      ? "700 – 1 200 € TTC / m²"
      : "1 200 – 2 500 € TTC / m²"
}

---

8. PLANNING PRÉVISIONNEL

Phase APS (en cours) → validation client → Phase APD → Consultation entreprises → Travaux → Livraison.
Le planning détaillé sera établi après validation du présent APS.

---

9. SUITE DE LA MISSION

Après validation du présent APS, la mission se poursuit avec :
- L'Avant-Projet Définitif (APD) : plans cotés, perspectives 3D, descriptifs détaillés
- La consultation des entreprises et analyse des offres
- Le suivi de chantier jusqu'à la livraison

---

10. DOCUMENTS À FOURNIR PAR LE MAÎTRE D'OUVRAGE

- Plans existants (si disponibles)
- Titre de propriété ou bail
- Règlement de copropriété (si applicable)
- Budget global validé
- Planning de disponibilité pour les réunions de suivi

---

Fin de l'APS — ${projectName}
Document généré par Chalto
`
}

// ---------------------------------------------------------------------------
// Génération .docx
// ---------------------------------------------------------------------------

function buildDocx(content: string, title: string): Promise<Buffer> {
  const lines = content.split("\n")

  const children = lines.map((line) => {
    const trimmed = line.trim()

    if (trimmed.startsWith("CAHIER DES CLAUSES")) {
      return new Paragraph({
        text: trimmed,
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      })
    }

    if (/^\d+\.\s/.test(trimmed)) {
      return new Paragraph({
        text: trimmed,
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 100 },
      })
    }

    if (trimmed === "---") {
      return new Paragraph({ text: "", spacing: { after: 100 } })
    }

    return new Paragraph({
      children: [new TextRun({ text: trimmed, size: 22 })],
      spacing: { after: 80 },
    })
  })

  const doc = new Document({
    title,
    creator: "Chalto",
    sections: [{ properties: {}, children }],
  })

  return Packer.toBuffer(doc)
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function POST(req: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 })

  const body = (await req.json()) as RequestBody
  const { projectId, projectName, workType, clientName, documentType, answers } = body
  const hasItems = documentType === "aps" ? answers?.pieces?.length > 0 : answers?.lots?.length > 0
  if (!projectId || !projectName || !documentType || !hasItems) {
    return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 })
  }

  // Vérification explicite de l'ownership avant toute opération admin
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("id")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .single()

  if (projectError || !project) {
    return NextResponse.json({ error: "Projet introuvable ou accès refusé" }, { status: 403 })
  }

  const admin = createAdminClient()

  // 1. Créer l'entrée document en brouillon — via le client user pour que
  //    auth.uid() soit résolu correctement (RLS + validation_token requis par send_document_to_client)
  const docTypeLabel = documentType === "aps" ? "APS" : "CCTP"
  const docName = `${docTypeLabel} — ${projectName}`
  const { data: newDoc, error: insertError } = await supabase
    .from("documents")
    .insert({
      project_id: projectId,
      name: docName,
      type: docTypeLabel,
      status: "draft",
      audience: "client",
      version: 1,
      validation_token: crypto.randomUUID(),
    })
    .select("id")
    .single()

  if (insertError || !newDoc) {
    return NextResponse.json({ error: "Erreur création document" }, { status: 500 })
  }

  // 2. Générer le contenu textuel
  let textContent: string

  if (process.env.NODE_ENV === "development" || !process.env.ANTHROPIC_API_KEY) {
    textContent =
      documentType === "aps"
        ? buildMockAPSContent(projectName, workType, clientName, answers)
        : buildMockCCTPContent(projectName, workType, clientName, answers)
  } else {
    const Anthropic = (await import("@anthropic-ai/sdk")).default
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const prompt =
      documentType === "aps"
        ? `Tu es un architecte d'intérieur expert en rédaction de documents de conception français.

Génère un APS (Avant-Projet Sommaire) complet et professionnel pour le projet suivant :

Projet : ${projectName}
Type de mission : ${workType}
${clientName ? `Client : ${clientName}` : ""}
Espaces concernés : ${answers.pieces.join(", ")}
${answers.ambiance ? `Ambiance et style souhaités : ${answers.ambiance}` : ""}
${answers.contraintes ? `Contraintes particulières : ${answers.contraintes}` : ""}
Niveau de prestation : ${answers.niveau}

L'APS doit comporter exactement 10 sections numérotées :
1. Présentation du projet et contexte
2. Analyse de l'existant et contraintes
3. Parti pris architectural et ambiance
4. Programme des espaces traités
5. Orientations matériaux et finitions
6. Préconisations techniques
7. Estimation budgétaire indicative
8. Planning prévisionnel
9. Suite de la mission
10. Documents à fournir par le maître d'ouvrage

Utilise un langage professionnel adapté à l'architecture intérieure. Sois précis sur les matériaux et les marques de référence adaptés au niveau "${answers.niveau}". Format texte brut, sections séparées par ---`
        : `Tu es un architecte expert en rédaction de documents techniques de construction français.

Génère un CCTP (Cahier des Clauses Techniques Particulières) complet et professionnel pour le projet suivant :

Projet : ${projectName}
Type de travaux : ${workType}
${clientName ? `Client : ${clientName}` : ""}
Lots concernés : ${answers.lots.join(", ")}
${answers.materiaux ? `Matériaux souhaités : ${answers.materiaux}` : ""}
${answers.contraintes ? `Contraintes particulières : ${answers.contraintes}` : ""}
Niveau de prestation : ${answers.niveau}

Le CCTP doit comporter exactement 10 sections numérotées :
1. Objet du marché et généralités
2. Documents contractuels et normes de référence
3. Gros œuvre
4. Charpente et couverture
5. Menuiseries extérieures et intérieures
6. Plomberie et sanitaires
7. Électricité et courants faibles
8. Revêtements sols et murs
9. Façade et isolation thermique
10. Réception des travaux et garanties

Pour chaque lot non concerné par le projet, indique-le brièvement. Utilise un langage technique précis, des références normatives (DTU, NF EN) pertinentes et adapte le niveau de qualité au niveau "${answers.niveau}" demandé. Format texte brut, sections séparées par ---`

    const message = await anthropic.messages.create({
      model: "claude-opus-4-7",
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    })

    const block = message.content[0]
    textContent =
      block.type === "text"
        ? block.text
        : documentType === "aps"
          ? buildMockAPSContent(projectName, workType, clientName, answers)
          : buildMockCCTPContent(projectName, workType, clientName, answers)
  }

  // 3. Générer le .docx
  const buffer = await buildDocx(textContent, docName)

  // 4. Upload dans Supabase Storage
  const filePath = `${user.id}/${newDoc.id}/cctp.docx`
  const { error: uploadError } = await admin.storage.from("documents").upload(filePath, buffer, {
    contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    upsert: true,
  })

  if (uploadError) {
    return NextResponse.json({ error: "Erreur upload fichier" }, { status: 500 })
  }

  const { data: urlData } = admin.storage.from("documents").getPublicUrl(filePath)

  // 5. Mettre à jour le document avec l'URL du fichier
  await admin
    .from("documents")
    .update({
      file_url: urlData.publicUrl,
      file_name: "cctp.docx",
      file_type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    })
    .eq("id", newDoc.id)

  return NextResponse.json({ documentId: newDoc.id, fileUrl: urlData.publicUrl })
}
