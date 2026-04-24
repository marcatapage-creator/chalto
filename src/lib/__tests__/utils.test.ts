import { describe, it, expect } from "vitest"
import { cn, initials, isChantierPhase } from "../utils"

describe("cn", () => {
  it("fusionne des classes simples", () => {
    expect(cn("foo", "bar")).toBe("foo bar")
  })

  it("résout les conflits Tailwind (dernière classe gagne)", () => {
    expect(cn("p-2", "p-4")).toBe("p-4")
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500")
  })

  it("ignore les valeurs falsy", () => {
    expect(cn("foo", false, undefined, null, "bar")).toBe("foo bar")
  })

  it("gère les objets conditionnels", () => {
    expect(cn({ "font-bold": true, "text-sm": false })).toBe("font-bold")
  })

  it("retourne une chaîne vide sans arguments", () => {
    expect(cn()).toBe("")
  })
})

describe("initials", () => {
  it("retourne '?' pour une valeur vide ou absente", () => {
    expect(initials(null)).toBe("?")
    expect(initials(undefined)).toBe("?")
    expect(initials("")).toBe("?")
  })

  it("retourne l'initiale d'un prénom seul", () => {
    expect(initials("Alice")).toBe("A")
  })

  it("retourne les deux initiales d'un nom complet", () => {
    expect(initials("Alice Dupont")).toBe("AD")
  })

  it("tronque à 2 caractères maximum", () => {
    expect(initials("Alice Marie Dupont")).toBe("AM")
  })

  it("met en majuscules", () => {
    expect(initials("alice dupont")).toBe("AD")
  })
})

describe("isChantierPhase", () => {
  it("retourne true pour chantier, reception, cloture", () => {
    expect(isChantierPhase("chantier")).toBe(true)
    expect(isChantierPhase("reception")).toBe(true)
    expect(isChantierPhase("cloture")).toBe(true)
  })

  it("retourne false pour conception, livraison et phases inconnues", () => {
    expect(isChantierPhase("conception")).toBe(false)
    expect(isChantierPhase("livraison")).toBe(false)
    expect(isChantierPhase("inconnu")).toBe(false)
  })

  it("retourne false pour null ou undefined", () => {
    expect(isChantierPhase(null)).toBe(false)
    expect(isChantierPhase(undefined)).toBe(false)
  })
})
