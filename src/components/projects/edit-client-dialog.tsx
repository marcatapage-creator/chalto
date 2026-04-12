"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Pencil } from "lucide-react"
import { toast } from "sonner"

interface ClientInfo {
  client_name?: string
  client_email?: string
  address?: string
  description?: string
}

interface EditClientDialogProps {
  projectId: string
  client: ClientInfo
  onSave: (updated: ClientInfo) => void
}

export function EditClientDialog({ projectId, client, onSave }: EditClientDialogProps) {
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<ClientInfo>({
    client_name: client.client_name ?? "",
    client_email: client.client_email ?? "",
    address: client.address ?? "",
    description: client.description ?? "",
  })

  const supabase = createClient()

  const handleOpenChange = (val: boolean) => {
    if (val) {
      setForm({
        client_name: client.client_name ?? "",
        client_email: client.client_email ?? "",
        address: client.address ?? "",
        description: client.description ?? "",
      })
    }
    setOpen(val)
  }

  const handleSave = async () => {
    setSaving(true)

    const { error } = await supabase
      .from("projects")
      .update({
        client_name: form.client_name || null,
        client_email: form.client_email || null,
        address: form.address || null,
        description: form.description || null,
      })
      .eq("id", projectId)

    if (error) {
      toast.error("Erreur lors de la sauvegarde")
    } else {
      onSave({
        client_name: form.client_name || undefined,
        client_email: form.client_email || undefined,
        address: form.address || undefined,
        description: form.description || undefined,
      })
      toast.success("Informations client mises à jour")
      setOpen(false)
    }

    setSaving(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon-sm" className="text-muted-foreground">
          <Pencil className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifier le client</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nom</Label>
              <Input
                placeholder="Jean Dupont"
                value={form.client_name}
                onChange={(e) => setForm({ ...form, client_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="jean@exemple.fr"
                value={form.client_email}
                onChange={(e) => setForm({ ...form, client_email: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Adresse du chantier</Label>
            <Input
              placeholder="12 rue de la Paix, 75001 Paris"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Input
              placeholder="Notes sur le projet..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Annuler
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Sauvegarde..." : "Enregistrer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
