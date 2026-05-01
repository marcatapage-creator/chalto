import { createClient } from "@supabase/supabase-js"
import dotenv from "dotenv"
import fs from "fs"
import path from "path"

dotenv.config({ path: path.resolve(__dirname, "../.env.local") })

const SEED_FILE = path.join(__dirname, ".auth/seed.json")

export default async function globalTeardown() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceKey || !fs.existsSync(SEED_FILE)) return

  let seed: { projectId?: string } = {}
  try {
    seed = JSON.parse(fs.readFileSync(SEED_FILE, "utf-8"))
  } catch {
    return
  }

  if (!seed.projectId) return

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  })

  // Supprime le projet — les documents/validations sont supprimés en cascade (FK)
  const { error } = await admin.from("projects").delete().eq("id", seed.projectId)

  if (error) {
    console.warn("[e2e teardown] Erreur suppression projet de test:", error.message)
  } else {
    console.log(`[e2e teardown] Projet ${seed.projectId} supprimé`)
  }

  fs.writeFileSync(SEED_FILE, JSON.stringify({}))
}
