"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { HoverButton } from "@/components/ui/motion"
import Link from "next/link"

export default function NewProjectPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: "",
    client_name: "",
    client_email: "",
    address: "",
    description: "",
  })
  const router = useRouter()
  const supabase = createClient()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    if (!form.name) {
      setError("Le nom du projet est obligatoire")
      return
    }

    setLoading(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from("projects")
      .insert({
        name: form.name,
        client_name: form.client_name,
        client_email: form.client_email,
        address: form.address,
        description: form.description,
        user_id: user.id,
        status: "active",
      })
      .select()
      .single()

    if (error) {
      setError("Erreur lors de la création du projet")
      setLoading(false)
      return
    }

    router.push(`/projects/${data.id}`)
  }

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-8 max-w-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/projects">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Nouveau projet</h1>
            <p className="text-muted-foreground">Renseignez les informations du projet</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informations du projet</CardTitle>
            <CardDescription>Ces informations seront visibles par votre client</CardDescription>
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

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button
            variant="outline"
            asChild
            className="flex-1"
          >
            <Link href="/projects">Annuler</Link>
          </Button>
          <HoverButton className="flex-1" disabled={loading}>
            <Button
              className="w-full"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Création..." : "Créer le projet"}
            </Button>
          </HoverButton>
        </div>
      </div>
    </div>
  )
}
