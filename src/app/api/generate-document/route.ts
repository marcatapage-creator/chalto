import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { Document, Paragraph, TextRun, HeadingLevel, Packer, AlignmentType } from "docx"

interface CCTPAnswers {
  lots: string[]
  materiaux: string
  contraintes: string
  niveau: "economique" | "standard" | "premium"
}

interface RequestBody {
  projectId: string
  projectName: string
  workType: string
  clientName?: string
  documentType: "cctp"
  answers: CCTPAnswers
}

// ---------------------------------------------------------------------------
// Mock CCTP statique (dev uniquement)
// ---------------------------------------------------------------------------

function buildMockCCTPContent(
  projectName: string,
  workType: string,
  clientName: string | undefined,
  answers: CCTPAnswers
): string {
  const niveauLabel = { economique: "Économique", standard: "Standard", premium: "Premium" }[
    answers.niveau
  ]
  const lotsStr = answers.lots.join(", ")
  const date = new Date().toLocaleDateString("fr-FR")

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

  if (!projectId || !projectName || !documentType || !answers?.lots?.length) {
    return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 })
  }

  const admin = createAdminClient()

  // 1. Créer l'entrée document en brouillon — via le client user pour que
  //    auth.uid() soit résolu correctement (RLS + validation_token requis par send_document_to_client)
  const docName = `CCTP — ${projectName}`
  const { data: newDoc, error: insertError } = await supabase
    .from("documents")
    .insert({
      project_id: projectId,
      name: docName,
      type: "CCTP",
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
    textContent = buildMockCCTPContent(projectName, workType, clientName, answers)
  } else {
    const Anthropic = (await import("@anthropic-ai/sdk")).default
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const prompt = `Tu es un architecte expert en rédaction de documents techniques de construction français.

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
