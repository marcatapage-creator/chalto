import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64")
  const isDev = process.env.NODE_ENV === "development"

  // script-src: nonce-based — no unsafe-inline in prod
  // style-src: unsafe-inline needed (Tailwind v4 + Radix inject inline styles)
  // connect-src: Supabase (REST + Realtime WS), Sentry tunnel, GA, Vercel Analytics
  const csp = [
    `default-src 'self'`,
    [
      `script-src 'self'`,
      `'nonce-${nonce}'`,
      isDev ? `'unsafe-eval'` : "",
      `https://www.googletagmanager.com`,
      `https://www.google-analytics.com`,
      `https://va.vercel-scripts.com`,
    ]
      .filter(Boolean)
      .join(" "),
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' data: blob: https://*.supabase.co https://images.unsplash.com https://www.google-analytics.com`,
    `font-src 'self'`,
    [
      `connect-src 'self'`,
      `https://*.supabase.co`,
      `wss://*.supabase.co`,
      `https://*.sentry.io`,
      `https://o*.ingest.sentry.io`,
      `https://www.google-analytics.com`,
      `https://vitals.vercel-insights.com`,
      `https://va.vercel-scripts.com`,
      isDev ? `http://localhost:* ws://localhost:*` : "",
    ]
      .filter(Boolean)
      .join(" "),
    `frame-src 'none'`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `upgrade-insecure-requests`,
  ].join("; ")

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set("x-nonce", nonce)
  requestHeaders.set("Content-Security-Policy", csp)

  const response = NextResponse.next({ request: { headers: requestHeaders } })
  response.headers.set("Content-Security-Policy", csp)

  return response
}

export const config = {
  matcher: [
    {
      source: "/((?!_next/static|_next/image|favicon\\.ico|icon-|manifest\\.json|og-image).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
}
