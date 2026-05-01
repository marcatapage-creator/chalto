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

  // ── 1. Auth Playwright ────────────────────────────────────────────────────
  const baseURL = config.projects[0].use.baseURL ?? "http://localhost:3000"
  const browser = await chromium.launch()
  const page = await browser.newPage()

  await page.goto(`${baseURL}/login`)
  await page.getByRole("button", { name: /continuer avec email/i }).click()
  await page.getByRole("textbox", { name: /email/i }).fill(email)
  await page.getByRole("textbox", { name: /mot de passe|password/i }).fill(password)
  await page.getByRole("button", { name: /connexion|se connecter/i }).click()
  await page.waitForURL(/dashboard/, { timeout: 15_000 })

  await page.context().storageState({ path: AUTH_FILE })
  await browser.close()

  // ── 2. Seed données de test ───────────────────────────────────────────────
  if (!supabaseUrl || !serviceKey) {
    // Pas de service key → on utilise les secrets statiques GitHub
    fs.writeFileSync(SEED_FILE, JSON.stringify({}))
    return
  }

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  })

  // Récupère l'ID de l'utilisateur E2E
  const { data: profile } = await admin.from("profiles").select("id").eq("email", email).single()

  if (!profile) {
    console.warn("[e2e seed] Utilisateur non trouvé — seed ignoré")
    fs.writeFileSync(SEED_FILE, JSON.stringify({}))
    return
  }

  const userId = profile.id

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

  // Crée 5 documents "sent" — un par test consommateur pour éviter les conflits de token
  const docNames = [
    "Document E2E – validation check+approve",
    "Document E2E – validation refuse",
    "Document E2E – realtime approve",
    "Document E2E – realtime refuse",
    "Document E2E – realtime console",
  ]

  const docs: Array<{ id: string; validation_token: string | null }> = []
  for (const name of docNames) {
    const { data: doc } = await admin
      .from("documents")
      .insert({ project_id: project.id, name, type: "Plan", status: "sent", version: 1 })
      .select("id, validation_token")
      .single()
    if (!doc) throw new Error(`[e2e seed] Impossible de créer le document "${name}"`)
    docs.push(doc)
  }

  const [
    docValidation,
    docValidationRefuse,
    docRealtimeApprove,
    docRealtimeRefuse,
    docRealtimeConsole,
  ] = docs

  // Sauvegarde les IDs pour que les tests y accèdent
  const seed = {
    projectId: project.id,
    documentId: docValidation.id,
    validationToken: docValidation.validation_token,
    userId,
  }

  fs.writeFileSync(SEED_FILE, JSON.stringify(seed, null, 2))

  // Expose en variables d'env pour les tests
  process.env.E2E_PROJECT_ID = project.id
  process.env.E2E_VALIDATION_TOKEN = docValidation.validation_token ?? ""
  process.env.E2E_VALIDATION_TOKEN_REFUSE = docValidationRefuse.validation_token ?? ""
  process.env.E2E_VALIDATION_TOKEN_REALTIME = docRealtimeApprove.validation_token ?? ""
  process.env.E2E_VALIDATION_TOKEN_REALTIME_REFUSE = docRealtimeRefuse.validation_token ?? ""
  process.env.E2E_VALIDATION_TOKEN_REALTIME_CONSOLE = docRealtimeConsole.validation_token ?? ""

  console.log(`[e2e seed] Projet créé : ${project.id} avec 5 documents de test`)
}
