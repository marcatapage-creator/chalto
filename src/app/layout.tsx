import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://chalto.fr"),
  title: {
    default: "Chalto | Pilotage Fiscal & Trésorerie pour Freelances",
    template: "%s | Chalto",
  },
  description: "Anticipez vos impôts, optimisez votre trésorerie et pilotez votre activité de freelance en toute sérénité avec Chalto.",
  keywords: ["freelance", "fiscalité", "trésorerie", "auto-entrepreneur", "impôts", "gestion", "PWA"],
  authors: [{ name: "Chalto Team" }],
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://chalto.fr",
    siteName: "Chalto",
    title: "Chalto | Pilotage Fiscal & Trésorerie pour Freelances",
    description: "Anticipez vos impôts, optimisez votre trésorerie et pilotez votre activité de freelance en toute sérénité.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Chalto | Pilotage Fiscal & Trésorerie pour Freelances",
    description: "Anticipez vos impôts, optimisez votre trésorerie et pilotez votre activité de freelance en toute sérénité.",
  },
  manifest: "/manifest.json",
};

import { Navigation } from "@/components/Navigation";
import { Header } from "@/components/Header";
import { ThemeProvider } from "@/components/ThemeProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)] transition-colors duration-300" suppressHydrationWarning>
        <ThemeProvider>
          <div className="relative min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 pt-20 pb-32">
              {children}
            </main>
            <Navigation />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
