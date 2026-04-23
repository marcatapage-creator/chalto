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
    // Ignore les erreurs "aborted" de Node.js HTTP — surviennent quand le client
    // ferme la connexion avant la fin de la réponse (faux positif, surtout en dev)
    const err = hint?.originalException
    if (err instanceof Error && err.message === "aborted") return null
    return event
  },
})
