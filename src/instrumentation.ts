import * as Sentry from "@sentry/nextjs"
import { z } from "zod"

const EnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url("doit être une URL valide"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(50, "clé anon Supabase trop courte"),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(50, "service role key trop courte"),
  RESEND_API_KEY: z.string().startsWith("re_", "doit commencer par re_"),
  NEXT_PUBLIC_APP_URL: z.string().url("doit être une URL valide"),
  UPSTASH_REDIS_REST_URL: z.string().url("doit être une URL valide"),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1, "token Upstash manquant"),
})

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const result = EnvSchema.safeParse(process.env)
    if (!result.success) {
      const errors = result.error.issues
        .map((issue) => `  ✗ ${String(issue.path[0])}: ${issue.message}`)
        .join("\n")
      throw new Error(
        `[Chalto] Variables d'environnement invalides au démarrage :\n${errors}\n\nVérifiez votre .env.local (dev) ou les secrets Vercel (prod).`
      )
    }

    await import("../sentry.server.config")
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("../sentry.edge.config")
  }
}

export const onRequestError = Sentry.captureRequestError
