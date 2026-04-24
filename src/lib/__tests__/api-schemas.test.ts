import { describe, it, expect } from "vitest"
import {
  sendInviteSchema,
  sendValidationSchema,
  validateSchema,
  validateContributorSchema,
  taskStatusSchema,
  waitlistSchema,
} from "../api-schemas"

const uuid = "123e4567-e89b-12d3-a456-426614174000"

describe("sendInviteSchema", () => {
  it("accepte des UUIDs valides", () => {
    expect(sendInviteSchema.safeParse({ contactId: uuid, projectId: uuid }).success).toBe(true)
  })

  it("rejette si contactId manque", () => {
    expect(sendInviteSchema.safeParse({ projectId: uuid }).success).toBe(false)
  })

  it("rejette un UUID malformé", () => {
    expect(sendInviteSchema.safeParse({ contactId: "not-a-uuid", projectId: uuid }).success).toBe(
      false
    )
  })
})

describe("sendValidationSchema", () => {
  it("accepte sans message", () => {
    expect(sendValidationSchema.safeParse({ documentId: uuid }).success).toBe(true)
  })

  it("accepte avec message optionnel", () => {
    expect(
      sendValidationSchema.safeParse({ documentId: uuid, message: "Merci de valider" }).success
    ).toBe(true)
  })

  it("rejette si documentId absent", () => {
    expect(sendValidationSchema.safeParse({}).success).toBe(false)
  })
})

describe("validateSchema (flux client public)", () => {
  it("accepte approved avec token", () => {
    expect(validateSchema.safeParse({ token: "abc123", status: "approved" }).success).toBe(true)
  })

  it("accepte rejected avec commentaire", () => {
    expect(
      validateSchema.safeParse({ token: "abc", status: "rejected", comment: "Non conforme" })
        .success
    ).toBe(true)
  })

  it("rejette un statut inconnu", () => {
    expect(validateSchema.safeParse({ token: "abc", status: "pending" }).success).toBe(false)
  })

  it("rejette un token vide", () => {
    expect(validateSchema.safeParse({ token: "", status: "approved" }).success).toBe(false)
  })
})

describe("validateContributorSchema", () => {
  it("accepte transmission avec commented", () => {
    expect(
      validateContributorSchema.safeParse({
        documentId: uuid,
        status: "commented",
        contributorName: "Alice",
        requestType: "transmission",
      }).success
    ).toBe(true)
  })

  it("accepte validation avec approved", () => {
    expect(
      validateContributorSchema.safeParse({
        documentId: uuid,
        status: "approved",
        contributorName: "Bob",
      }).success
    ).toBe(true)
  })

  it("rejette un statut invalide", () => {
    expect(
      validateContributorSchema.safeParse({
        documentId: uuid,
        status: "sent",
        contributorName: "Alice",
      }).success
    ).toBe(false)
  })

  it("rejette contributorName vide", () => {
    expect(
      validateContributorSchema.safeParse({
        documentId: uuid,
        status: "approved",
        contributorName: "",
      }).success
    ).toBe(false)
  })
})

describe("taskStatusSchema", () => {
  it("accepte les 3 statuts valides", () => {
    for (const status of ["todo", "in_progress", "done"]) {
      expect(
        taskStatusSchema.safeParse({ taskId: uuid, status, contributorToken: "tok" }).success
      ).toBe(true)
    }
  })

  it("rejette un statut hors enum", () => {
    expect(
      taskStatusSchema.safeParse({ taskId: uuid, status: "cancelled", contributorToken: "tok" })
        .success
    ).toBe(false)
  })
})

describe("waitlistSchema", () => {
  it("accepte un email valide", () => {
    expect(waitlistSchema.safeParse({ email: "test@example.com" }).success).toBe(true)
  })

  it("rejette un email invalide", () => {
    expect(waitlistSchema.safeParse({ email: "pas-un-email" }).success).toBe(false)
  })

  it("accepte avec name et profession optionnels", () => {
    expect(
      waitlistSchema.safeParse({ email: "a@b.com", name: "Marc", profession: "Architecte" }).success
    ).toBe(true)
  })
})
