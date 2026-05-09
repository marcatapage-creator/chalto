import { createBrowserClient } from "@supabase/ssr"

// Singleton — one instance = one Realtime WebSocket for the whole app.
// Multiple instances each fail independently when the JWT expires on mobile
// (iOS throttles background timers, preventing auto-refresh).
let _client: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  if (typeof window === "undefined") {
    // Should never be called server-side, but guard just in case.
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }

  if (!_client) {
    _client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Re-authenticate the Realtime WS whenever the JWT is refreshed.
    // Without this, the WS keeps the initial (expired) token and throws
    // InvalidJWTToken on every channel subscription after ~13 min.
    _client.auth.onAuthStateChange((event, session) => {
      if ((event === "TOKEN_REFRESHED" || event === "SIGNED_IN") && session?.access_token) {
        _client!.realtime.setAuth(session.access_token)
      }
    })

    // iOS throttles background timers — the auto-refresh may not fire while
    // the app is backgrounded. Force a session refresh when the tab becomes
    // visible again so Realtime reconnects with a valid token.
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        void _client!.auth.getUser().catch(() => {})
      }
    })
  }

  // Non-null assertion: _client is guaranteed assigned by the block above.
  // TypeScript can't narrow module-level vars across assignments.
  return _client!
}
