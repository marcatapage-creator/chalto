// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: "https://740d6d001caf9bdb8f8488c869238467@o4511269564055552.ingest.de.sentry.io/4511269570871376",

  tracesSampleRate: 1,
  enableLogs: true,
  sendDefaultPii: true,

  beforeSend(event, hint) {
    const err = hint?.originalException
    // Ignore "aborted" — client closed connection before response completed
    if (err instanceof Error && err.message === "aborted") return null
    // Ignore Next.js notFound() — 404 is expected, not an application error
    if (err instanceof Error && err.message.includes("NEXT_HTTP_ERROR_FALLBACK;404")) return null
    if (typeof err === "string" && err.includes("NEXT_HTTP_ERROR_FALLBACK;404")) return null
    return event
  },
})
