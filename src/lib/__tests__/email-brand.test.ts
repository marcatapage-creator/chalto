import { describe, it, expect } from "vitest"
import { buildBrandHeader } from "../email-brand"

describe("buildBrandHeader", () => {
  it("sans profil — renvoie le logo Chalto par défaut", () => {
    const html = buildBrandHeader(null)
    expect(html).toContain("Chalto")
    expect(html).toContain("chalto.fr/Logo.svg")
  })

  it("branding désactivé — renvoie le logo Chalto même si logo_url présent", () => {
    const html = buildBrandHeader({
      branding_enabled: false,
      logo_url: "https://example.com/logo.png",
      company_name: "ACME",
    })
    expect(html).toContain("chalto.fr/Logo.svg")
    expect(html).not.toContain("example.com")
  })

  it("branding activé sans logo — renvoie le logo Chalto par défaut", () => {
    const html = buildBrandHeader({
      branding_enabled: true,
      logo_url: null,
      company_name: "ACME",
    })
    expect(html).toContain("chalto.fr/Logo.svg")
  })

  it("branding activé avec logo — renvoie l'img du pro", () => {
    const html = buildBrandHeader({
      branding_enabled: true,
      logo_url: "https://example.com/logo.png",
      company_name: "ACME",
    })
    expect(html).toContain("example.com/logo.png")
    expect(html).toContain('alt="ACME"')
    expect(html).not.toContain("chalto.fr/Logo.svg")
  })

  it("branding activé avec logo mais sans company_name — alt fallback 'Logo'", () => {
    const html = buildBrandHeader({
      branding_enabled: true,
      logo_url: "https://example.com/logo.png",
      company_name: null,
    })
    expect(html).toContain('alt="Logo"')
  })
})
