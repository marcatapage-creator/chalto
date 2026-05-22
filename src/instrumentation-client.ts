// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.2 : 0,
  enableLogs: true,
  sendDefaultPii: false,

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
