"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { scrollOnFocus } from "@/hooks/use-scroll-on-focus"

interface Profession {
  id: string
  label: string
}

interface ContactNewPageClientProps {
  professions: Profession[]
  userId: string
}

export function ContactNewPageClient({ professions, userId }: ContactNewPageClientProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    company_name: "",
    profession_id: "",
    notes: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    if (!form.name) {
      toast.error("Le nom est obligatoire")
      return
    }
    setLoading(true)
    const { error } = await supabase.from("contacts").insert({
      user_id: userId,
      name: form.name,
      email: form.email || null,
      phone: form.phone || null,
      company_name: form.company_name || null,
      profession_id: form.profession_id || null,
      notes: form.notes || null,
    })
    if (error) {
      toast.error("Erreur lors de la création")
    } else {
      toast.success("Contact ajouté ✅")
      router.push("/contacts")
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <motion.div
      className="flex-1 flex flex-col overflow-hidden"
      initial={{ x: 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
    >
      <div className="shrink-0 border-b px-4 py-3 flex items-center gap-3 bg-popover">
        <Button
          variant="ghost"
          size="icon"
          className="h-11 w-11 shrink-0"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <p className="text-sm font-medium">Nouveau contact</p>
          <p className="text-xs text-muted-foreground">Annuaire</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nom *</Label>
              <Input
                name="name"
                placeholder="Marc Dupuis"
                value={form.name}
                onFocus={scrollOnFocus}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label>Entreprise</Label>
              <Input
                name="company_name"
                placeholder="Dupuis Plomberie"
                value={form.company_name}
                onFocus={scrollOnFocus}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Métier</Label>
            <Select
              value={form.profession_id}
              onValueChange={(v) => setForm({ ...form, profession_id: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un métier" />
              </SelectTrigger>
              <SelectContent>
                {professions.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                name="email"
                type="email"
                placeholder="marc@exemple.fr"
                value={form.email}
                onFocus={scrollOnFocus}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label>Téléphone</Label>
              <Input
                name="phone"
                placeholder="06 00 00 00 00"
                value={form.phone}
                onFocus={scrollOnFocus}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Notes</Label>
            <Input
              name="notes"
              placeholder="Disponible le matin, spécialiste rénovation..."
              value={form.notes}
              onFocus={scrollOnFocus}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>

      <div className="shrink-0 border-t px-4 py-3 bg-popover flex gap-3">
        <Button variant="outline" className="flex-1" onClick={() => router.back()}>
          Annuler
        </Button>
        <Button className="flex-1" onClick={handleSubmit} loading={loading}>
          {loading ? "Ajout..." : "Ajouter"}
        </Button>
      </div>
    </motion.div>
  )
}
