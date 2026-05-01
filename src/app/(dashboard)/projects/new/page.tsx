"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ArrowLeft, ArrowRight, Check, ChevronDown } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { analytics } from "@/lib/analytics"
import { getProfessionConfig } from "@/lib/profession-config"

type ProfessionOption = { id: string; slug: string; label: string }

const steps = [
  { id: 1, label: "Le projet" },
  { id: 2, label: "Le cadrage" },
]

export default function NewProjectPage() {
  const [step, setStep] = useState(1)
  const [professionSlug, setProfessionSlug] = useState<string | null>(null)
  const [professionId, setProfessionId] = useState<string | null>(null)
  const [availableProfessions, setAvailableProfessions] = useState<ProfessionOption[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      Promise.all([
        supabase
          .from("profiles")
          .select("profession_id, professions!profession_id(id, slug)")
          .eq("id", user.id)
          .single(),
        supabase
          .from("user_professions")
          .select("professions(id, slug, label)")
          .eq("user_id", user.id),
      ]).then(([{ data: profile }, { data: userProfs }]) => {
        const profs = (userProfs ?? [])
          .map((r) => r.professions as unknown as ProfessionOption | null)
          .filter((p): p is ProfessionOption => p !== null)

        setAvailableProfessions(profs)

        // Par défaut : profession primaire
        const primary = profile?.professions as unknown as { id: string; slug: string } | null
        setProfessionSlug(primary?.slug ?? null)
        setProfessionId((profile?.profession_id as string | null) ?? null)
      })
    })
  }, [])

  const { workTypes, budgetRanges } = getProfessionConfig(professionSlug)

  const [form, setForm] = useState({
    name: "",
    client_name: "",
    client_email: "",
    address: "",
    description: "",
    work_type: "",
    budget_range: "",
    deadline: "",
    constraints: "",
  })

  const router = useRouter()
  const supabase = createClient()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleProfessionSwitch = (prof: ProfessionOption) => {
    setProfessionSlug(prof.slug)
    setProfessionId(prof.id)
    // Reset les choix dépendant de la profession
    setForm((f) => ({ ...f, work_type: "", budget_range: "" }))
  }

  const handleNext = () => {
    if (!form.name) {
      setError("Le nom du projet est obligatoire")
      return
    }
    setError(null)
    setStep(2)
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from("projects")
      .insert({
        name: form.name,
        client_name: form.client_name,
        client_email: form.client_email,
        address: form.address,
        description: form.description,
        work_type: form.work_type,
        budget_range: form.budget_range,
        deadline: form.deadline,
        constraints: form.constraints,
        user_id: user.id,
        status: "active",
        phase: "cadrage",
        profession_id: professionId,
      })
      .select()
      .single()

    if (error) {
      setError("Erreur lors de la création du projet")
      setLoading(false)
      return
    }

    analytics.projectCreated()
    router.push(`/projects/${data.id}`)
  }

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-6 md:p-8 max-w-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/projects">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Nouveau projet</h1>
            <p className="text-muted-foreground">
              Étape {step} sur {steps.length}
            </p>
          </div>
        </div>

        {/* Progress steps */}
        <div className="flex items-center gap-2">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2 flex-1">
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "h-7 w-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-200",
                    step > s.id
                      ? "bg-primary text-primary-foreground"
                      : step === s.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                  )}
                >
                  {step > s.id ? <Check className="h-3.5 w-3.5" /> : s.id}
                </div>
                <span
                  className={cn(
                    "text-sm font-medium hidden sm:block",
                    step === s.id ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-px transition-all duration-300",
                    step > s.id ? "bg-primary" : "bg-muted"
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {/* Étape 1 — Infos projet */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Informations du projet</CardTitle>
              <CardDescription>Les informations de base visibles par votre client</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Sélecteur de profession — visible uniquement en multi-profession */}
              {availableProfessions.length > 1 && (
                <div className="space-y-2 pb-2 border-b">
                  <Label>Type de projet</Label>
                  {/* Mobile : select natif */}
                  <div className="sm:hidden relative">
                    <select
                      className="w-full appearance-none px-3 py-2 rounded-lg text-sm border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary pr-8"
                      value={professionId ?? ""}
                      onChange={(e) => {
                        const prof = availableProfessions.find((p) => p.id === e.target.value)
                        if (prof) handleProfessionSwitch(prof)
                      }}
                    >
                      {availableProfessions.map((prof) => (
                        <option key={prof.id} value={prof.id}>
                          {prof.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                  {/* Desktop : boutons toggle */}
                  <div className="hidden sm:flex gap-2">
                    {availableProfessions.map((prof) => (
                      <button
                        key={prof.id}
                        type="button"
                        onClick={() => handleProfessionSwitch(prof)}
                        className={cn(
                          "flex-1 px-4 py-2 rounded-lg text-sm font-medium border transition-all duration-150",
                          professionId === prof.id
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border hover:border-primary/50 hover:bg-muted"
                        )}
                      >
                        {prof.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">Nom du projet *</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Ex: Rénovation appartement Paris 11e"
                  value={form.name}
                  onChange={handleChange}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="client_name">Nom du client</Label>
                  <Input
                    id="client_name"
                    name="client_name"
                    placeholder="Jean Dupont"
                    value={form.client_name}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client_email">Email du client</Label>
                  <Input
                    id="client_email"
                    name="client_email"
                    type="email"
                    placeholder="jean@exemple.fr"
                    value={form.client_email}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Adresse du chantier</Label>
                <Input
                  id="address"
                  name="address"
                  placeholder="12 rue de la Paix, 75001 Paris"
                  value={form.address}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  name="description"
                  placeholder="Décrivez brièvement le projet..."
                  value={form.description}
                  onChange={handleChange}
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
            </CardContent>
          </Card>
        )}

        {/* Étape 2 — Cadrage */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Cadrage du projet</CardTitle>
              <CardDescription>
                Ces informations vous aident à qualifier et structurer le projet
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label>Type de travaux</Label>
                <div className="flex flex-wrap gap-2">
                  {workTypes.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setForm({ ...form, work_type: type })}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-sm border transition-all duration-150",
                        form.work_type === type
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border hover:border-primary/50 hover:bg-muted"
                      )}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Budget estimé</Label>
                <div className="flex flex-wrap gap-2">
                  {budgetRanges.map((range) => (
                    <button
                      key={range}
                      type="button"
                      onClick={() => setForm({ ...form, budget_range: range })}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-sm border transition-all duration-150",
                        form.budget_range === range
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border hover:border-primary/50 hover:bg-muted"
                      )}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="deadline">Délai souhaité</Label>
                <Input
                  id="deadline"
                  name="deadline"
                  placeholder="Ex: Fin du T2 2026, Dans 3 mois..."
                  value={form.deadline}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="constraints">
                  Contraintes particulières
                  <span className="text-muted-foreground font-normal ml-1">(optionnel)</span>
                </Label>
                <Input
                  id="constraints"
                  name="constraints"
                  placeholder="Ex: Bâtiment classé, copropriété, accès difficile..."
                  value={form.constraints}
                  onChange={handleChange}
                />
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          {step === 1 ? (
            <>
              <Button variant="outline" className="flex-1" asChild>
                <Link href="/projects">Annuler</Link>
              </Button>
              <Button className="flex-1" onClick={handleNext}>
                Suivant
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour
              </Button>
              <Button className="flex-1" onClick={handleSubmit} loading={loading}>
                {loading ? "Création..." : "Créer le projet"}
                {!loading && <Check className="ml-2 h-4 w-4" />}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
