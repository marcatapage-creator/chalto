import { describe, it, expect, vi, beforeEach } from "vitest"

const mockSend = vi.hoisted(() => vi.fn().mockResolvedValue({ id: "resend-id", error: null }))

vi.mock("resend", () => ({
  Resend: class {
    emails = { send: mockSend }
  },
}))

import {
  sendValidationEmail,
  sendApprovalEmail,
  sendTransmissionAckEmail,
  sendWelcomeEmail,
  sendWaitlistConfirmationEmail,
} from "../email"

const BASE = {
  proName: "Jean Pro",
  projectName: "Rénovation Dupont",
  documentName: "Devis phase 1",
  projectUrl: "https://app.chalto.fr/projects/proj-1",
}

beforeEach(() => {
  mockSend.mockClear()
  mockSend.mockResolvedValue({ id: "resend-id", error: null })
})

describe("sendValidationEmail", () => {
  const args = {
    clientEmail: "client@example.com",
    clientName: "Marie Client",
    proName: BASE.proName,
    projectName: BASE.projectName,
    documentName: BASE.documentName,
    validationUrl: "https://app.chalto.fr/validate/tok-123",
  }

  it("envoie à l'adresse email du client", async () => {
    await sendValidationEmail(args)
    expect(mockSend).toHaveBeenCalledWith(expect.objectContaining({ to: "client@example.com" }))
  })

  it("inclut le nom du professionnel dans le sujet", async () => {
    await sendValidationEmail(args)
    const { subject } = mockSend.mock.calls[0][0] as { subject: string }
    expect(subject).toContain(BASE.proName)
  })

  it("inclut le lien de validation dans le corps", async () => {
    await sendValidationEmail(args)
    const { html } = mockSend.mock.calls[0][0] as { html: string }
    expect(html).toContain("https://app.chalto.fr/validate/tok-123")
  })

  it("inclut le message du pro quand fourni", async () => {
    await sendValidationEmail({ ...args, message: "Merci de vérifier la page 3" })
    const { html } = mockSend.mock.calls[0][0] as { html: string }
    expect(html).toContain("Merci de vérifier la page 3")
  })

  it("n'inclut pas de bloc message quand absent", async () => {
    await sendValidationEmail(args)
    const { html } = mockSend.mock.calls[0][0] as { html: string }
    expect(html).not.toContain("Message de")
  })

  it("utilise le nom de l'entreprise dans le sujet si branding activé", async () => {
    await sendValidationEmail({ ...args, companyName: "BatiPro SAS", logoUrl: null })
    const { subject } = mockSend.mock.calls[0][0] as { subject: string }
    expect(subject).toContain("BatiPro SAS")
  })
})

describe("sendApprovalEmail", () => {
  const base = {
    proEmail: "pro@example.com",
    proName: BASE.proName,
    clientName: "Marie Client",
    projectName: BASE.projectName,
    documentName: BASE.documentName,
    projectUrl: BASE.projectUrl,
  }

  it("utilise le sujet ✅ Approuvé pour status approved", async () => {
    await sendApprovalEmail({ ...base, status: "approved" })
    const { subject } = mockSend.mock.calls[0][0] as { subject: string }
    expect(subject).toContain("✅ Approuvé")
    expect(subject).toContain(BASE.documentName)
  })

  it("utilise le sujet ❌ Refusé pour status rejected", async () => {
    await sendApprovalEmail({ ...base, status: "rejected" })
    const { subject } = mockSend.mock.calls[0][0] as { subject: string }
    expect(subject).toContain("❌ Refusé")
  })

  it("envoie au pro, pas au client", async () => {
    await sendApprovalEmail({ ...base, status: "approved" })
    expect(mockSend).toHaveBeenCalledWith(expect.objectContaining({ to: "pro@example.com" }))
  })

  it("inclut le commentaire du client quand fourni", async () => {
    await sendApprovalEmail({ ...base, status: "approved", comment: "RAS, tout est bon" })
    const { html } = mockSend.mock.calls[0][0] as { html: string }
    expect(html).toContain("RAS, tout est bon")
  })

  it("n'inclut pas de bloc commentaire quand absent", async () => {
    await sendApprovalEmail({ ...base, status: "approved" })
    const { html } = mockSend.mock.calls[0][0] as { html: string }
    expect(html).not.toContain("Commentaire du client")
  })

  it("inclut le lien projet", async () => {
    await sendApprovalEmail({ ...base, status: "approved" })
    const { html } = mockSend.mock.calls[0][0] as { html: string }
    expect(html).toContain(BASE.projectUrl)
  })
})

describe("sendTransmissionAckEmail", () => {
  const base = {
    proEmail: "pro@example.com",
    proName: BASE.proName,
    contributorName: "Alice Presta",
    projectName: BASE.projectName,
    documentName: BASE.documentName,
    projectUrl: BASE.projectUrl,
  }

  it("inclut le nom du prestataire dans le sujet", async () => {
    await sendTransmissionAckEmail(base)
    const { subject } = mockSend.mock.calls[0][0] as { subject: string }
    expect(subject).toContain("Alice Presta")
  })

  it("inclut le bloc commentaire quand fourni", async () => {
    await sendTransmissionAckEmail({ ...base, comment: "Vu, conforme" })
    const { html } = mockSend.mock.calls[0][0] as { html: string }
    expect(html).toContain("Vu, conforme")
    expect(html).toContain("Commentaire")
  })

  it("n'inclut pas de bloc commentaire quand absent", async () => {
    await sendTransmissionAckEmail(base)
    const { html } = mockSend.mock.calls[0][0] as { html: string }
    expect(html).not.toContain("Commentaire")
  })

  it("échappe le commentaire pour prévenir l'injection HTML", async () => {
    await sendTransmissionAckEmail({ ...base, comment: '<script>alert("xss")</script>' })
    const { html } = mockSend.mock.calls[0][0] as { html: string }
    expect(html).not.toContain("<script>")
  })
})

describe("sendWelcomeEmail", () => {
  it("envoie à la bonne adresse", async () => {
    await sendWelcomeEmail({ email: "new@example.com", fullName: "Paul" })
    expect(mockSend).toHaveBeenCalledWith(expect.objectContaining({ to: "new@example.com" }))
  })

  it("inclut le prénom dans le corps", async () => {
    await sendWelcomeEmail({ email: "new@example.com", fullName: "Paul" })
    const { html } = mockSend.mock.calls[0][0] as { html: string }
    expect(html).toContain("Paul")
  })
})

describe("sendWaitlistConfirmationEmail", () => {
  it("envoie à la bonne adresse", async () => {
    await sendWaitlistConfirmationEmail({ email: "wait@example.com", name: "Carla" })
    expect(mockSend).toHaveBeenCalledWith(expect.objectContaining({ to: "wait@example.com" }))
  })

  it("inclut le nom dans le corps", async () => {
    await sendWaitlistConfirmationEmail({ email: "wait@example.com", name: "Carla" })
    const { html } = mockSend.mock.calls[0][0] as { html: string }
    expect(html).toContain("Carla")
  })
})
