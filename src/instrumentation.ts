import * as Sentry from "@sentry/nextjs"

const REQUIRED_ENV_VARS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "RESEND_API_KEY",
  "NEXT_PUBLIC_APP_URL",
  "UPSTASH_REDIS_REST_URL",
  "UPSTASH_REDIS_REST_TOKEN",
] as const

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key])
    if (missing.length > 0) {
      throw new Error(
        `[Chalto] Variables d'environnement manquantes au démarrage :\n${missing.map((k) => `  ✗ ${k}`).join("\n")}\n\nVérifiez votre .env.local (dev) ou les secrets Vercel (prod).`
      )
    }

    await import("../sentry.server.config")
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("../sentry.edge.config")
  }
}

export const onRequestError = Sentry.captureRequestError
