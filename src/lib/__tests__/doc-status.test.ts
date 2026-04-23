import { describe, it, expect } from "vitest"
import { docStatusMap } from "../doc-status"

describe("docStatusMap", () => {
  it("couvre tous les statuts connus", () => {
    const statuts = ["draft", "sent", "approved", "rejected", "commented"]
    statuts.forEach((s) => expect(docStatusMap[s]).toBeDefined())
  })

  it("renvoie undefined pour un statut inconnu (fallback à gérer côté appelant)", () => {
    expect(docStatusMap["inexistant"]).toBeUndefined()
  })

  it("draft — brouillon, outline, pas de className", () => {
    const s = docStatusMap.draft
    expect(s.label).toBe("Brouillon")
    expect(s.variant).toBe("outline")
    expect(s.className).toBeUndefined()
  })

  it("sent — envoyé, secondary, dot bleu", () => {
    const s = docStatusMap.sent
    expect(s.label).toBe("Envoyé")
    expect(s.variant).toBe("secondary")
    expect(s.dot).toContain("blue")
  })

  it("approved — approuvé, couleurs vertes", () => {
    const s = docStatusMap.approved
    expect(s.label).toBe("Approuvé")
    expect(s.className).toContain("green")
    expect(s.dot).toContain("green")
  })

  it("rejected — refusé, couleurs rouges", () => {
    const s = docStatusMap.rejected
    expect(s.label).toBe("Refusé")
    expect(s.className).toContain("red")
    expect(s.dot).toContain("red")
  })

  it("commented — lu, secondary, dot bleu", () => {
    const s = docStatusMap.commented
    expect(s.label).toBe("Lu")
    expect(s.variant).toBe("secondary")
    expect(s.dot).toContain("blue")
  })
})
