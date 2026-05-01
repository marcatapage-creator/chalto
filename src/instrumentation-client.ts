// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: "https://740d6d001caf9bdb8f8488c869238467@o4511269564055552.ingest.de.sentry.io/4511269570871376",

  integrations: [Sentry.replayIntegration()],

  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.2 : 0,
  enableLogs: true,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  sendDefaultPii: true,

  beforeSend(event, hint) {
    const err = hint?.originalException
    // Bug SDK Sentry + Next.js App Router : performance.measure() timestamp négatif
    // lors de navigations rapides / redirects (pas une erreur applicative)
    if (err instanceof TypeError && err.message.includes("cannot have a negative time stamp"))
      return null
    return event
  },
})

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
