"use client"

import { useState, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Building2, Sofa, Wrench, Zap, Hammer, HardHat } from "lucide-react"
import { cn } from "@/lib/utils"
import { analytics } from "@/lib/analytics"
import { createDemoProject } from "@/lib/create-demo-project"

const professions = [
  {
    slug: "architecte",
    label: "Architecte",
    description: "Plans, permis, CCTP, notices",
    icon: Building2,
  },
  {
    slug: "architecte_interieur",
    label: "Architecte d'intérieur",
    description: "Aménagement, décoration, design d'espaces",
    icon: Sofa,
  },
  {
    slug: "plombier",
    label: "Plombier",
    description: "Devis, PV réception, conformité",
    icon: Wrench,
  },
  {
    slug: "electricien",
    label: "Électricien",
    description: "Attestations, schémas, rapports",
    icon: Zap,
  },
  {
    slug: "menuisier",
    label: "Menuisier",
    description: "Commandes, fiches techniques",
    icon: Hammer,
  },
  {
    slug: "entrepreneur",
    label: "Entrepreneur GC",
    description: "DPGF, planning, situations",
    icon: HardHat,
  },
]

export default function OnboardingPage() {
  const [selected, setSelected] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  const handleContinue = async () => {
    if (!selected) return
    setLoading(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push("/login")
        return
      }

      const { data: profession } = await supabase
        .from("professions")
        .select("id")
        .eq("slug", selected)
        .single()

      await supabase
        .from("profiles")
        .update({ profession_id: profession?.id ?? null })
        .eq("id", user.id)

      await createDemoProject(supabase, user.id, selected).catch(() => null)

      analytics.onboardingCompleted(selected)
      router.push("/dashboard")
    } catch {
      router.push("/dashboard")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">Bienvenue sur Chalto</h1>
          <p className="text-muted-foreground mt-2">
            Quel est votre métier ? On personnalise l&apos;expérience pour vous.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {professions.map((p) => {
            const Icon = p.icon
            return (
              <Card
                key={p.slug}
                onClick={() => setSelected(p.slug)}
                className={cn(
                  "cursor-pointer transition-all duration-150 hover:shadow-sm hover:bg-muted/50 hover:border-primary",
                  selected === p.slug && "border-primary ring-2 ring-primary"
                )}
              >
                <CardContent className="flex items-center gap-4 p-4">
                  <div
                    className={cn(
                      "p-2 rounded-lg",
                      selected === p.slug ? "bg-primary text-primary-foreground" : "bg-muted"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{p.label}</p>
                    <p className="text-xs text-muted-foreground">{p.description}</p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <Button className="w-full" disabled={!selected || loading} onClick={handleContinue}>
          {loading ? "Préparation de votre espace..." : "Continuer →"}
        </Button>
      </div>
    </div>
  )
}
