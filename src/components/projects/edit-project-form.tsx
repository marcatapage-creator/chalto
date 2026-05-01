"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ArrowLeft, ArrowRight, Check } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { getProfessionConfig } from "@/lib/profession-config"

const steps = [
  { id: 1, label: "Le projet" },
  { id: 2, label: "Le cadrage" },
]

interface Project {
  id: string
  name: string
  client_name?: string | null
  client_email?: string | null
  address?: string | null
  description?: string | null
  work_type?: string | null
  budget_range?: string | null
  deadline?: string | null
  constraints?: string | null
}

export function EditProjectForm({
  project,
  professionSlug,
}: {
  project: Project
  professionSlug?: string | null
}) {
  const { workTypes, budgetRanges } = getProfessionConfig(professionSlug)
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    name: project.name ?? "",
    client_name: project.client_name ?? "",
    client_email: project.client_email ?? "",
    address: project.address ?? "",
    description: project.description ?? "",
    work_type: project.work_type ?? "",
    budget_range: project.budget_range ?? "",
    deadline: project.deadline ?? "",
    constraints: project.constraints ?? "",
  })

  const router = useRouter()
  const supabase = createClient()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleNext = () => {
    if (!form.name.trim()) {
      setError("Le nom du projet est obligatoire")
      return
    }
    setError(null)
    setStep(2)
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)

    const { error } = await supabase
      .from("projects")
      .update({
        name: form.name.trim(),
        client_name: form.client_name || null,
        client_email: form.client_email || null,
        address: form.address || null,
        description: form.description || null,
        work_type: form.work_type || null,
        budget_range: form.budget_range || null,
        deadline: form.deadline || null,
        constraints: form.constraints || null,
      })
      .eq("id", project.id)

    if (error) {
      toast.error("Erreur lors de la sauvegarde")
      setLoading(false)
      return
    }

    toast.success("Projet mis à jour")
    router.push(`/projects/${project.id}`)
    router.refresh()
  }

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-6 md:p-8 max-w-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/projects/${project.id}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Modifier le projet</h1>
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
                      onClick={() =>
                        setForm({ ...form, work_type: form.work_type === type ? "" : type })
                      }
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
                      onClick={() =>
                        setForm({ ...form, budget_range: form.budget_range === range ? "" : range })
                      }
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
                <Link href={`/projects/${project.id}`}>Annuler</Link>
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
                {loading ? "Sauvegarde..." : "Enregistrer"}
                {!loading && <Check className="ml-2 h-4 w-4" />}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
