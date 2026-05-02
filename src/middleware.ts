import { NextResponse, type NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"

export async function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64")
  const isDev = process.env.NODE_ENV === "development"

  // script-src : nonce + strict-dynamic remplace unsafe-inline/unsafe-eval en prod.
  // strict-dynamic permet aux scripts noncés de charger d'autres scripts (GTM, Analytics…).
  // Les URLs en fallback restent pour les navigateurs qui ne supportent pas strict-dynamic.
  const csp = [
    "default-src 'self'",
    `script-src 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""} https://*.vercel-scripts.com https://www.googletagmanager.com https://www.google-analytics.com`,
    "worker-src blob: 'self'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://hyukwaquuyoojejkqmvb.supabase.co https://images.unsplash.com",
    "font-src 'self'",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.sentry.io https://*.upstash.io https://resend.com https://www.google-analytics.com https://region1.google-analytics.com https://www.googletagmanager.com",
    "frame-src https://hyukwaquuyoojejkqmvb.supabase.co",
    "frame-ancestors 'none'",
  ].join("; ")

  // Passer le nonce dans les headers de la requête pour que Next.js puisse l'utiliser
  // dans ses scripts inline (il le lit depuis Content-Security-Policy sur la réponse)
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set("x-nonce", nonce)

  const response = NextResponse.next({ request: { headers: requestHeaders } })
  response.headers.set("Content-Security-Policy", csp)

  // Rafraîchit la session Supabase sur chaque navigation (rotate JWT avant expiry).
  // On saute les routes API pour éviter la latence inutile.
  if (!request.nextUrl.pathname.startsWith("/api/")) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            )
          },
        },
      }
    )
    await supabase.auth.getUser()
  }

  return response
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
