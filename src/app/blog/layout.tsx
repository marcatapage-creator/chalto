import { LandingNav } from "@/components/landing/landing-nav"

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <LandingNav />
      <div className="pt-18.5">{children}</div>
    </div>
  )
}
