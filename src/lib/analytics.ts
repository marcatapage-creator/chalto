declare const gtag: (...args: unknown[]) => void

function track(event: string, params?: Record<string, unknown>) {
  if (typeof gtag !== "undefined") {
    gtag("event", event, params)
  }
}

export const analytics = {
  signUp: (method: "email" | "google") => track("sign_up", { method }),
  login: (method: "email" | "google") => track("login", { method }),
  projectCreated: () => track("project_created"),
  documentAdded: (type: string) => track("document_added", { document_type: type }),
  documentSent: () => track("document_sent"),
  documentApproved: () => track("document_approved"),
  documentRejected: () => track("document_rejected"),
  providerInvited: () => track("provider_invited"),
  onboardingCompleted: (profession: string) => track("onboarding_completed", { profession }),
}
