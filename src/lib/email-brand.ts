interface BrandProfile {
  logo_url?: string | null
  company_name?: string | null
  branding_enabled?: boolean | null
}

export function buildBrandHeader(profile?: BrandProfile | null): string {
  const logoUrl = profile?.branding_enabled ? (profile.logo_url ?? null) : null
  const companyName = profile?.branding_enabled ? (profile.company_name ?? null) : null

  if (logoUrl) {
    return `<img src="${logoUrl}" alt="${companyName ?? "Logo"}" style="max-height: 48px; max-width: 160px; object-fit: contain;" />`
  }

  return `<div style="display: inline-flex; align-items: center; gap: 8px;">
    <img src="https://chalto.fr/Logo.svg" alt="Chalto" width="28" height="28" style="display: block;" />
    <span style="font-weight: 700; font-size: 16px; color: #111;">Chalto</span>
  </div>`
}
