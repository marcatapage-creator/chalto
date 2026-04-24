import { describe, it, expect } from "vitest"
import { escapeHtml } from "../email"

describe("escapeHtml", () => {
  it("retourne une chaîne vide pour null/undefined", () => {
    expect(escapeHtml(null)).toBe("")
    expect(escapeHtml(undefined)).toBe("")
    expect(escapeHtml("")).toBe("")
  })

  it("échappe les chevrons < et >", () => {
    expect(escapeHtml("<script>")).toBe("&lt;script&gt;")
    expect(escapeHtml("</div>")).toBe("&lt;/div&gt;")
  })

  it("échappe les guillemets doubles et simples", () => {
    expect(escapeHtml('"hello"')).toBe("&quot;hello&quot;")
    expect(escapeHtml("l'apostrophe")).toBe("l&#039;apostrophe")
  })

  it("échappe l'esperluette &", () => {
    expect(escapeHtml("A & B")).toBe("A &amp; B")
  })

  it("neutralise une tentative d'injection XSS complète", () => {
    const xss = '<img src=x onerror="alert(1)">'
    const result = escapeHtml(xss)
    expect(result).not.toContain("<")
    expect(result).not.toContain(">")
    expect(result).not.toContain('"')
  })

  it("laisse les caractères normaux intacts", () => {
    expect(escapeHtml("Bonjour Marc")).toBe("Bonjour Marc")
    expect(escapeHtml("Projet #42 — Phase 1")).toBe("Projet #42 — Phase 1")
  })
})
