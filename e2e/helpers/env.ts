/**
 * Lit les variables d'env E2E avec fallback sur seed.json.
 *
 * process.env du globalSetup ne se propage pas aux workers Playwright (processus séparés).
 * seed.json est écrit sur le filesystem par globalSetup et accessible à tous les workers.
 * Les valeurs du seed (run courant) priment sur les valeurs statiques de .env.local.
 */
import fs from "fs"
import path from "path"

let _seed: Record<string, string> | null = null

function getSeed(): Record<string, string> {
  if (_seed) return _seed
  try {
    const p = path.join(__dirname, "../.auth/seed.json")
    if (fs.existsSync(p)) {
      _seed = JSON.parse(fs.readFileSync(p, "utf-8"))
      return _seed!
    }
  } catch {}
  _seed = {}
  return _seed
}

export function e2eEnv(key: string): string | undefined {
  const seed = getSeed()
  // Le seed du run courant prime sur .env.local qui peut être périmé
  return seed[key] || process.env[key] || undefined
}
