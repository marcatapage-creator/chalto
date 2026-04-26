"use client"

import { useState, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Paperclip, X } from "lucide-react"
import { toast } from "sonner"

const documentTypes = [
  "Plan",
  "Notice descriptive",
  "CCTP",
  "Devis",
  "Compte-rendu",
  "Permis de construire",
  "PV de réception",
  "Attestation",
  "Autre",
]

const acceptedTypes = ["application/pdf", "image/jpeg", "image/png"]
const maxSize = 10 * 1024 * 1024

export function AddDocumentDialog({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState("")
  const [type, setType] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (!selected) return

    if (!acceptedTypes.includes(selected.type)) {
      toast.error("Format non supporté — PDF, JPG ou PNG uniquement")
      return
    }
    if (selected.size > maxSize) {
      toast.error("Fichier trop volumineux — 10MB maximum")
      return
    }
    setFile(selected)
  }

  const handleSubmit = async () => {
    if (!name || !type) {
      setError("Nom et type sont obligatoires")
      return
    }

    setLoading(true)
    setError(null)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    const { data: doc, error: insertError } = await supabase.rpc(
      "create_document_with_contributors",
      {
        p_project_id: projectId,
        p_name: name.trim(),
        p_type: type,
        p_audience: "client",
        p_contributor_ids: [],
      }
    )

    if (insertError || !doc) {
      setError("Erreur lors de la création du document")
      setLoading(false)
      return
    }

    if (file && user) {
      const ext = file.name.split(".").pop()
      const path = `${user.id}/${doc}/${Date.now()}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(path, file, { upsert: true })

      if (uploadError) {
        toast.error("Document créé mais erreur lors de l'upload du fichier")
      } else {
        const { data: urlData } = supabase.storage.from("documents").getPublicUrl(path)
        await supabase
          .from("documents")
          .update({
            file_url: urlData.publicUrl,
            file_name: file.name,
            file_type: file.type,
            file_size: file.size,
          })
          .eq("id", doc)
      }
    }

    setOpen(false)
    setName("")
    setType("")
    setFile(null)
    router.refresh()
    setLoading(false)
  }

  const handleOpenChange = (val: boolean) => {
    setOpen(val)
    if (!val) {
      setName("")
      setType("")
      setFile(null)
      setError(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" className="h-8">
          <Plus className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Ajouter un document</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nouveau document</DialogTitle>
          <DialogDescription>
            Ajoutez un document à soumettre à la validation client
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2 min-w-0">
          <div className="space-y-2">
            <Label>Nom du document</Label>
            <Input
              placeholder="Ex: Plan RDC - Version 2"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Type de document</Label>
            <Select onValueChange={setType}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un type" />
              </SelectTrigger>
              <SelectContent>
                {documentTypes.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>
              Pièce jointe <span className="text-muted-foreground font-normal">(optionnel)</span>
            </Label>
            {file ? (
              <div className="flex items-center gap-2 rounded-lg border bg-muted/40 px-3 py-2 min-w-0">
                <Paperclip className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="text-sm truncate flex-1 min-w-0">{file.name}</span>
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="ml-2 shrink-0 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center gap-2 rounded-lg border border-dashed border-muted-foreground/30 px-3 py-2.5 text-sm text-muted-foreground hover:border-primary/50 hover:bg-muted/30 transition-colors"
              >
                <Paperclip className="h-4 w-4 shrink-0" />
                Joindre un fichier — PDF, JPG, PNG (10MB max)
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} loading={loading}>
            {loading ? "Création..." : "Créer le document"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
