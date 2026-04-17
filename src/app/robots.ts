import { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard", "/projects", "/settings", "/contacts", "/onboarding", "/api/"],
    },
    sitemap: "https://chalto.fr/sitemap.xml",
  }
}
