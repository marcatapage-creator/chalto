import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function proxy(request: NextRequest) {
  const isDev = process.env.NODE_ENV === "development"

  // CSP uniquement en production — en dev, le nonce casse HMR et les scripts Next.js inline
  const nonce = isDev ? null : Buffer.from(crypto.randomUUID()).toString("base64")
  const csp = isDev
    ? null
    : [
        "default-src 'self'",
        `script-src 'nonce-${nonce}' 'strict-dynamic' https://*.vercel-scripts.com https://www.googletagmanager.com https://www.google-analytics.com`,
        "worker-src blob: 'self'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: blob: https://hyukwaquuyoojejkqmvb.supabase.co https://images.unsplash.com",
        "font-src 'self'",
        "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.sentry.io https://*.upstash.io https://resend.com https://www.google-analytics.com https://region1.google-analytics.com https://www.googletagmanager.com",
        "frame-src https://hyukwaquuyoojejkqmvb.supabase.co https://vercel.live",
        "frame-ancestors 'none'",
      ].join("; ")

  const requestHeaders = new Headers(request.headers)
  if (nonce) requestHeaders.set("x-nonce", nonce)

  const makeResponse = () => {
    const res = NextResponse.next({ request: { headers: requestHeaders } })
    if (csp) res.headers.set("Content-Security-Policy", csp)
    return res
  }

  let supabaseResponse = makeResponse()

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
          supabaseResponse = makeResponse()
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // Code OAuth sur la landing → renvoyer vers /auth/callback en préservant la source
  if (pathname === "/" && request.nextUrl.searchParams.has("code")) {
    const url = request.nextUrl.clone()
    const code = url.searchParams.get("code")
    const source = url.searchParams.get("source") ?? request.cookies.get("oauth_source")?.value
    url.pathname = "/auth/callback"
    url.search = source ? `?code=${code}&source=${source}` : `?code=${code}`
    const response = NextResponse.redirect(url)
    response.cookies.delete("oauth_source")
    return response
  }

  // Routes publiques — toujours accessibles
  const publicRoutes = [
    "/",
    "/demo",
    "/login",
    "/register",
    "/onboarding",
    "/auth/callback",
    "/validate",
    "/invite",
    "/blog",
    "/api/auth/google",
    "/api/waitlist",
    "/api/send-welcome",
    "/api/validate",
    "/api/validate-contributor",
    "/api/task-status",
    "/api/task-suggest",
    "/api/task-comment",
    "/api/project-message",
  ]
  const isPublic = publicRoutes.some((r) => (r === "/" ? pathname === "/" : pathname.startsWith(r)))

  // Non connecté → login
  if (!user && !isPublic) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    return NextResponse.redirect(url)
  }

  // Connecté → vérifier onboarding
  if (user && !isPublic && pathname !== "/onboarding" && !pathname.startsWith("/api/")) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("profession_id")
      .eq("id", user.id)
      .single()

    if (profile && !profile.profession_id) {
      const url = request.nextUrl.clone()
      url.pathname = "/onboarding"
      return NextResponse.redirect(url)
    }
  }

  // Connecté et onboarding fait → pas besoin d'aller sur /login ou /register
  if (user && (pathname === "/login" || pathname === "/register")) {
    const url = request.nextUrl.clone()
    url.pathname = "/dashboard"
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
