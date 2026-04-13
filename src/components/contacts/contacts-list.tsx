"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { Plus, Users, Phone, Mail, MoreHorizontal, Trash2, Building2 } from "lucide-react"
import { StaggerList, StaggerItem } from "@/components/ui/motion"

interface Profession {
  id: string
  label: string
  slug: string
}

interface Contact {
  id: string
  name: string
  email?: string
  phone?: string
  company_name?: string
  profession_id?: string
  notes?: string
  professions?: Profession
}

interface ContactsListProps {
  contacts: Contact[]
  professions: Profession[]
  userId: string
}

export function ContactsList({ contacts, professions, userId }: ContactsListProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    company_name: "",
    profession_id: "",
    notes: "",
  })
  const router = useRouter()
  const supabase = createClient()

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
      setOpen(false)
      setForm({ name: "", email: "", phone: "", company_name: "", profession_id: "", notes: "" })
      router.refresh()
    }
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    await supabase.from("contacts").delete().eq("id", id)
    toast.success("Contact supprimé")
    router.refresh()
  }

  const filtered = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.company_name?.toLowerCase().includes(search.toLowerCase()) ||
      c.professions?.label.toLowerCase().includes(search.toLowerCase())
  )

  const initials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <Input
          placeholder="Rechercher un prestataire..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un contact
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nouveau contact</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nom *</Label>
                  <Input
                    name="name"
                    placeholder="Marc Dupuis"
                    value={form.name}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Entreprise</Label>
                  <Input
                    name="company_name"
                    placeholder="Dupuis Plomberie"
                    value={form.company_name}
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
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Téléphone</Label>
                  <Input
                    name="phone"
                    placeholder="06 00 00 00 00"
                    value={form.phone}
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
                  onChange={handleChange}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? "Ajout..." : "Ajouter"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Liste */}
      {filtered.length > 0 ? (
        <StaggerList className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((contact) => (
            <StaggerItem key={contact.id}>
              <Card className="transition-all duration-150 hover:shadow-sm hover:bg-muted/50">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-sm font-semibold text-primary">
                          {initials(contact.name)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">{contact.name}</p>
                        {contact.company_name && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            {contact.company_name}
                          </p>
                        )}
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleDelete(contact.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="mt-3 space-y-1.5">
                    {contact.professions && (
                      <Badge variant="outline" className="text-xs">
                        {contact.professions.label}
                      </Badge>
                    )}
                    {contact.email && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <Mail className="h-3 w-3 shrink-0" />
                        <span className="truncate">{contact.email}</span>
                      </p>
                    )}
                    {contact.phone && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <Phone className="h-3 w-3 shrink-0" />
                        {contact.phone}
                      </p>
                    )}
                    {contact.notes && (
                      <p className="text-xs text-muted-foreground italic truncate">
                        {contact.notes}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </StaggerItem>
          ))}
        </StaggerList>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Users className="h-10 w-10 text-muted-foreground mb-4" />
            <p className="font-medium">{search ? "Aucun résultat" : "Annuaire vide"}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {search
                ? "Essayez un autre terme de recherche"
                : "Ajoutez vos prestataires et partenaires"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
