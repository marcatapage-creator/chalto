import type { Metadata, Viewport } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { PullToRefresh } from "@/components/ui/pull-to-refresh"
import { GoogleAnalytics } from "@next/third-parties/google"
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import "./globals.css"

export const metadata: Metadata = {
  title: {
    default: "Chalto — Gestion de projets pour les pros du bâtiment",
    template: "%s | Chalto",
  },
  description:
    "Gérez vos projets, partagez vos documents et faites valider vos livrables par vos clients. La plateforme des architectes, artisans et entrepreneurs du bâtiment.",
  keywords: [
    "logiciel architecte",
    "gestion chantier",
    "validation document client",
    "suivi projet bâtiment",
    "outil artisan BTP",
    "application chantier",
    "coordination prestataires",
  ],
  authors: [{ name: "Chalto", url: "https://chalto.fr" }],
  creator: "Chalto",
  metadataBase: new URL("https://chalto.fr"),
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://chalto.fr",
    siteName: "Chalto",
    title: "Chalto — Gestion de projets pour les pros du bâtiment",
    description: "Gérez vos projets et faites valider vos livrables simplement.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Chalto — La plateforme des pros du bâtiment",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Chalto — Gestion de projets BTP",
    description: "La plateforme des pros du bâtiment",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { url: "/icon-32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/icon-192.png" }],
    shortcut: "/icon-192.png",
  },
}

export const viewport: Viewport = {
  themeColor: "#2260E8",
}

// Runs before React hydration to apply stored theme and prevent FOUC
const themeScript = `(function(){try{var t=localStorage.getItem('theme'),d=window.matchMedia('(prefers-color-scheme: dark)').matches;if(t==='dark'||(!t||t==='system')&&d)document.documentElement.classList.add('dark')}catch(e){}})();`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      {}
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased`}>
        <ThemeProvider>
          {children}
          <Toaster />
          <PullToRefresh />
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
        <GoogleAnalytics gaId="G-6Z1Q32P5LT" />
      </body>
    </html>
  )
}
