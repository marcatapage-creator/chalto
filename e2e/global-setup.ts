import { chromium, type FullConfig } from "@playwright/test"
import { createClient } from "@supabase/supabase-js"
import dotenv from "dotenv"
import fs from "fs"
import path from "path"

dotenv.config({ path: path.resolve(__dirname, "../.env.local") })

const AUTH_FILE = path.join(__dirname, ".auth/user.json")
const SEED_FILE = path.join(__dirname, ".auth/seed.json")

export default async function globalSetup(config: FullConfig) {
  const email = process.env.E2E_USER_EMAIL
  const password = process.env.E2E_USER_PASSWORD
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  fs.mkdirSync(path.dirname(AUTH_FILE), { recursive: true })

  if (!email || !password) {
    fs.writeFileSync(AUTH_FILE, JSON.stringify({ cookies: [], origins: [] }))
    fs.writeFileSync(SEED_FILE, JSON.stringify({}))
    return
  }

  // ── 0. Pré-seed profession_id pour éviter redirect /onboarding ───────────
  if (supabaseUrl && serviceKey) {
    const adminPre = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } })
    const { data: profilePre } = await adminPre
      .from("profiles")
      .select("id")
      .eq("email", email)
      .single()
    if (profilePre) {
      const { data: profPre } = await adminPre
        .from("professions")
        .select("id")
        .eq("slug", "architecte")
        .single()
      if (profPre) {
        await adminPre
          .from("profiles")
          .update({ profession_id: profPre.id })
          .eq("id", profilePre.id)
      }
    }
  }

  // ── 1. Auth Playwright ────────────────────────────────────────────────────
  const baseURL = config.projects[0].use.baseURL ?? "http://localhost:3000"
  const browser = await chromium.launch()
  const page = await browser.newPage()
  await page.addInitScript(() => localStorage.setItem("cookie-consent", "refused"))

  await page.goto(`${baseURL}/login`)
  await page.getByRole("button", { name: /continuer avec email/i }).click()
  await page.getByRole("textbox", { name: /email/i }).fill(email)
  await page.getByRole("textbox", { name: /mot de passe|password/i }).fill(password)
  await page.getByRole("button", { name: /connexion|se connecter/i }).click()
  await page.waitForURL(/dashboard/, { timeout: 15_000 })

  await page.evaluate(() => localStorage.setItem("cookie-consent", "refused"))
  await page.context().storageState({ path: AUTH_FILE })
  await browser.close()

  // ── 2. Seed données de test ───────────────────────────────────────────────
  if (!supabaseUrl || !serviceKey) {
    fs.writeFileSync(SEED_FILE, JSON.stringify({}))
    return
  }

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  })

  // ── 2a. S'assure que le bucket storage "documents" existe ─────────────────
  await admin.storage.createBucket("documents", { public: true }).catch(() => {
    // Ignore si le bucket existe déjà (erreur 409)
  })

  // Récupère l'ID de l'utilisateur E2E
  const { data: profile } = await admin.from("profiles").select("id").eq("email", email).single()

  if (!profile) {
    console.warn("[e2e seed] Utilisateur non trouvé — seed ignoré")
    fs.writeFileSync(SEED_FILE, JSON.stringify({}))
    return
  }

  const userId = profile.id

  // Nettoie les données E2E laissées par des runs précédents (runs crashés sans teardown)
  await admin.from("projects").delete().eq("user_id", userId).like("name", "[E2E]%")
  await admin.from("contacts").delete().eq("user_id", userId).like("name", "[E2E]%")

  // S'assure que le profil a une profession (évite la redirection vers /onboarding)
  const { data: profession } = await admin
    .from("professions")
    .select("id")
    .eq("slug", "architecte")
    .single()
  if (profession) {
    await admin.from("profiles").update({ profession_id: profession.id }).eq("id", userId)
  }

  // Crée un projet de test
  const { data: project } = await admin
    .from("projects")
    .insert({
      name: "[E2E] Projet test",
      user_id: userId,
      phase: "chantier",
      status: "active",
      client_name: "Client Test E2E",
      client_email: "client-e2e@test.com",
    })
    .select("id")
    .single()

  if (!project) throw new Error("[e2e seed] Impossible de créer le projet de test")

  // ── 2b. Contacts de test ─────────────────────────────────────────────────
  const { data: contactWithEmail } = await admin
    .from("contacts")
    .insert({ user_id: userId, name: "[E2E] Prestataire Test", email: "prestataire-e2e@chalto.fr" })
    .select("id")
    .single()

  const { data: contactNoEmail } = await admin
    .from("contacts")
    .insert({ user_id: userId, name: "[E2E] Contact Sans Email" })
    .select("id")
    .single()

  if (!contactWithEmail || !contactNoEmail)
    throw new Error("[e2e seed] Impossible de créer les contacts de test")

  // ── 2c. Documents "sent" pour les tests de validation client ─────────────
  // 7 docs : les 5 originaux + 2 pour validate.spec.ts
  const sentDocNames = [
    "Document E2E – validation check+approve",
    "Document E2E – validation refuse",
    "Document E2E – realtime approve",
    "Document E2E – realtime refuse",
    "Document E2E – realtime console",
    "Document E2E – client validate A", // validate.spec.ts tests 1+2 (approve)
    "Document E2E – client validate B", // validate.spec.ts test 3 (refuse)
  ]

  const sentDocs: Array<{ id: string; validation_token: string | null }> = []
  for (const name of sentDocNames) {
    const { data: doc } = await admin
      .from("documents")
      .insert({ project_id: project.id, name, type: "Plan", status: "sent", version: 1 })
      .select("id, validation_token")
      .single()
    if (!doc) throw new Error(`[e2e seed] Impossible de créer le document "${name}"`)
    sentDocs.push(doc)
  }

  const [
    docValidation,
    docValidationRefuse,
    docRealtimeApprove,
    docRealtimeRefuse,
    docRealtimeConsole,
    docClientValidateA,
    docClientValidateB,
  ] = sentDocs

  // ── 2d. Contributor (espace prestataire) ─────────────────────────────────
  const { data: contributor } = await admin
    .from("contributors")
    .insert({
      project_id: project.id,
      contact_id: contactWithEmail.id,
      name: "[E2E] Prestataire Test",
      email: "prestataire-e2e@chalto.fr",
      invite_expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    })
    .select("id, invite_token")
    .single()

  if (!contributor) throw new Error("[e2e seed] Impossible de créer le contributor de test")

  // ── 2e. Documents liés au contributor ────────────────────────────────────
  // Deux docs validation (5.3 approve + 5.4 refuse indépendants)
  // Deux docs transmission (5.5 valider + 5.6 avec commentaire)
  const contribDocNames = [
    "Document E2E – contrib validation A",
    "Document E2E – contrib validation B",
    "Document E2E – contrib transmission A",
    "Document E2E – contrib transmission B",
    "Document E2E – contrib transmission C", // réservé pour invitation.spec.ts
  ]
  const contribDocs: Array<{ id: string }> = []
  for (const name of contribDocNames) {
    const { data: d } = await admin
      .from("documents")
      .insert({ project_id: project.id, name, type: "Plan", status: "sent", version: 1 })
      .select("id")
      .single()
    if (!d) throw new Error(`[e2e seed] Impossible de créer le document "${name}"`)
    contribDocs.push(d)
  }
  const [
    docContribValidationA,
    docContribValidationB,
    docContribTransmissionA,
    docContribTransmissionB,
    docContribTransmissionC,
  ] = contribDocs

  await admin.from("document_contributors").insert([
    {
      document_id: docContribValidationA.id,
      contributor_id: contributor.id,
      request_type: "validation",
    },
    {
      document_id: docContribValidationB.id,
      contributor_id: contributor.id,
      request_type: "validation",
    },
    {
      document_id: docContribTransmissionA.id,
      contributor_id: contributor.id,
      request_type: "transmission",
    },
    {
      document_id: docContribTransmissionB.id,
      contributor_id: contributor.id,
      request_type: "transmission",
    },
    {
      document_id: docContribTransmissionC.id,
      contributor_id: contributor.id,
      request_type: "transmission",
    },
  ])

  // ── 2f. Documents en brouillon ───────────────────────────────────────────
  for (const name of [
    "Document E2E – brouillon A",
    "Document E2E – brouillon B",
    "Document E2E – brouillon C",
  ]) {
    await admin
      .from("documents")
      .insert({ project_id: project.id, name, type: "Plan", status: "draft", version: 1 })
  }

  // ── 2g. Tâches ───────────────────────────────────────────────────────────
  // todo×2 assignées (pour les tests contractor/invite)
  // todo×1 non assignée (pour tasks.spec.ts 7.2 change statut)
  // in_progress×1 assignée (pour tasks.spec.ts 7.7 Notifier)
  // done×1 non assignée (pour tasks.spec.ts 7.3 Rouvrir)
  const tasksToCreate = [
    {
      title: "[E2E] Tâche à faire A",
      status: "todo",
      assigned_to: contactWithEmail.id,
    },
    {
      title: "[E2E] Tâche à faire B",
      status: "todo",
      assigned_to: contactWithEmail.id,
    },
    {
      title: "[E2E] Tâche à faire C",
      status: "todo",
      assigned_to: null,
    },
    {
      title: "[E2E] Tâche en cours",
      status: "in_progress",
      assigned_to: contactWithEmail.id,
    },
    {
      title: "[E2E] Tâche terminée",
      status: "done",
      assigned_to: null,
    },
  ]

  for (const t of tasksToCreate) {
    await admin.from("tasks").insert({
      project_id: project.id,
      title: t.title,
      status: t.status,
      assigned_to: t.assigned_to,
      created_by: userId,
    })
  }

  // ── 2h. Documents pour les tests de correctifs ───────────────────────────

  // Audience guard : doc envoyé au prestataire → /validate doit afficher le message bloquant
  const { data: docAudienceGuard } = await admin
    .from("documents")
    .insert({
      project_id: project.id,
      name: "Document E2E – audience guard",
      type: "Plan",
      status: "sent",
      version: 1,
      audience: "contributor",
    })
    .select("id, validation_token")
    .single()

  // Wording Realtime : doc transmission envoyé au client (pour tester "Commenté par [client]")
  const { data: docTransmissionClient } = await admin
    .from("documents")
    .insert({
      project_id: project.id,
      name: "Document E2E – transmission client",
      type: "Plan",
      status: "sent",
      version: 1,
      audience: "client",
      request_type: "transmission",
    })
    .select("id, validation_token")
    .single()

  // Wording statique : doc déjà commenté par le client (validation seedée)
  const { data: docClientCommented } = await admin
    .from("documents")
    .insert({
      project_id: project.id,
      name: "Document E2E – client commenté",
      type: "Plan",
      status: "commented",
      version: 1,
      audience: "client",
      request_type: "transmission",
    })
    .select("id, validation_token")
    .single()

  if (docClientCommented) {
    await admin.from("validations").insert({
      document_id: docClientCommented.id,
      status: "commented",
      client_name: "Client Test E2E",
      contributor_id: null,
      approved_at: new Date().toISOString(),
      version: 1,
    })
  }

  // Doc approuvé v2 (anti-régression : envoi au presta → statut ne doit pas revenir "approuvé")
  const { data: docApprovedForSend } = await admin
    .from("documents")
    .insert({
      project_id: project.id,
      name: "Document E2E – approuvé v2 (test envoi presta)",
      type: "Plan",
      status: "approved",
      version: 2,
      audience: "client",
    })
    .select("id")
    .single()

  if (docApprovedForSend) {
    await admin.from("validations").insert({
      document_id: docApprovedForSend.id,
      status: "approved",
      client_name: "Client Test E2E",
      contributor_id: null,
      approved_at: new Date().toISOString(),
      version: 2,
    })
  }

  // ── 2h-bis. Documents pour tests des règles de gestion (L2, L4) ────────────

  // L2 — doc approuvé : la re-validation via token doit être bloquée (409)
  const { data: docApprovedGuard } = await admin
    .from("documents")
    .insert({
      project_id: project.id,
      name: "Document E2E – approuvé guard re-validation",
      type: "Plan",
      status: "approved",
      version: 1,
      audience: "client",
    })
    .select("id, validation_token")
    .single()

  // L4 — token expiré : /api/validate doit retourner 410
  // La colonne validation_token_expires_at est ajoutée par migration 20260525000001.
  // Si la migration n'est pas encore appliquée, le doc est seedé sans expiration (test skipé).
  let docExpiredToken: { id: string; validation_token: string | null } | null = null
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (admin as any)
      .from("documents")
      .insert({
        project_id: project.id,
        name: "Document E2E – token expiré",
        type: "Plan",
        status: "sent",
        version: 1,
        audience: "client",
        validation_token_expires_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
      })
      .select("id, validation_token")
      .single()
    docExpiredToken = data
  } catch {
    console.warn("[e2e seed] validation_token_expires_at indisponible — migration non appliquée")
  }

  // ── 2i. Situation de test (en_attente, pour tests architecte) ────────────
  const { data: seedSituation } = await admin
    .from("situations")
    .insert({
      project_id: project.id,
      contributor_id: contributor.id,
      lot_label: "[E2E] Gros œuvre",
      percentage: 45,
      amount_ht: 12000,
      comment: "Situation soumise automatiquement par le seed E2E",
      status: "en_attente",
    })
    .select("id")
    .single()

  // ── 3. Sauvegarde pour le teardown et les tests ───────────────────────────
  const seed = {
    // Clés pour le teardown
    projectId: project.id,
    documentId: docValidation.id,
    validationToken: docValidation.validation_token,
    userId,
    contactIds: [contactWithEmail.id, contactNoEmail.id],
    // Clés E2E_* lisibles par les workers via readSeed()
    E2E_PROJECT_ID: project.id,
    E2E_USER_EMAIL: email,
    E2E_VALIDATION_TOKEN: docValidation.validation_token ?? "",
    E2E_VALIDATION_TOKEN_REFUSE: docValidationRefuse.validation_token ?? "",
    E2E_VALIDATION_TOKEN_REALTIME: docRealtimeApprove.validation_token ?? "",
    E2E_VALIDATION_TOKEN_REALTIME_REFUSE: docRealtimeRefuse.validation_token ?? "",
    E2E_VALIDATION_TOKEN_REALTIME_CONSOLE: docRealtimeConsole.validation_token ?? "",
    E2E_VALIDATION_TOKEN_CLIENT: docClientValidateA.validation_token ?? "",
    E2E_VALIDATION_TOKEN_CLIENT_2: docClientValidateB.validation_token ?? "",
    E2E_CONTACT_ID: contactWithEmail.id,
    E2E_CONTRIBUTOR_ID: contributor.id,
    E2E_INVITE_TOKEN: contributor.invite_token?.toString() ?? "",
    E2E_INVITE_TOKEN_VALIDATION: contributor.invite_token?.toString() ?? "",
    E2E_INVITE_TOKEN_TRANSMISSION: contributor.invite_token?.toString() ?? "",
    E2E_SITUATION_ID: seedSituation?.id ?? "",
    E2E_VALIDATION_TOKEN_AUDIENCE_GUARD: docAudienceGuard?.validation_token ?? "",
    E2E_VALIDATION_TOKEN_TRANSMISSION_CLIENT: docTransmissionClient?.validation_token ?? "",
    E2E_DOC_APPROVED_FOR_SEND_ID: docApprovedForSend?.id ?? "",
    E2E_VALIDATION_TOKEN_APPROVED: docApprovedGuard?.validation_token ?? "",
    E2E_VALIDATION_TOKEN_EXPIRED: docExpiredToken?.validation_token ?? "",
    E2E_DOC_SENT_CLIENT_ID: docValidation.id,
  }

  fs.writeFileSync(SEED_FILE, JSON.stringify(seed, null, 2))

  // Expose toutes les variables d'env pour les tests
  process.env.E2E_PROJECT_ID = project.id
  process.env.E2E_VALIDATION_TOKEN = docValidation.validation_token ?? ""
  process.env.E2E_VALIDATION_TOKEN_REFUSE = docValidationRefuse.validation_token ?? ""
  process.env.E2E_VALIDATION_TOKEN_REALTIME = docRealtimeApprove.validation_token ?? ""
  process.env.E2E_VALIDATION_TOKEN_REALTIME_REFUSE = docRealtimeRefuse.validation_token ?? ""
  process.env.E2E_VALIDATION_TOKEN_REALTIME_CONSOLE = docRealtimeConsole.validation_token ?? ""
  process.env.E2E_VALIDATION_TOKEN_CLIENT = docClientValidateA.validation_token ?? ""
  process.env.E2E_VALIDATION_TOKEN_CLIENT_2 = docClientValidateB.validation_token ?? ""
  process.env.E2E_CONTACT_ID = contactWithEmail.id
  process.env.E2E_INVITE_TOKEN = contributor.invite_token?.toString() ?? ""
  process.env.E2E_INVITE_TOKEN_VALIDATION = contributor.invite_token?.toString() ?? ""
  process.env.E2E_INVITE_TOKEN_TRANSMISSION = contributor.invite_token?.toString() ?? ""
  process.env.E2E_VALIDATION_TOKEN_AUDIENCE_GUARD = docAudienceGuard?.validation_token ?? ""
  process.env.E2E_VALIDATION_TOKEN_TRANSMISSION_CLIENT =
    docTransmissionClient?.validation_token ?? ""
  process.env.E2E_DOC_APPROVED_FOR_SEND_ID = docApprovedForSend?.id ?? ""
  process.env.E2E_VALIDATION_TOKEN_APPROVED = docApprovedGuard?.validation_token ?? ""
  process.env.E2E_VALIDATION_TOKEN_EXPIRED = docExpiredToken?.validation_token ?? ""
  process.env.E2E_DOC_SENT_CLIENT_ID = docValidation.id

  console.log(
    `[e2e seed] Projet ${project.id} | contributor ${contributor.id} | ${sentDocs.length} docs sent | 4 docs contrib | 3 drafts | 5 tâches`
  )
}
