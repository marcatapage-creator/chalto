"use client"

import { useState, useRef, useMemo } from "react"
import { useRouter } from "next/navigation"
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
import { ArrowLeft, Paperclip, X } from "lucide-react"
import { toast } from "sonner"
import { haptics } from "@/lib/haptics"

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

const acceptedTypes = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]
const maxSize = 10 * 1024 * 1024

interface NewDocumentPageClientProps {
  projectId: string
  projectName: string
}

export function NewDocumentPageClient({ projectId, projectName }: NewDocumentPageClientProps) {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [loading, setLoading] = useState(false)
  const [name, setName] = useState("")
  const [type, setType] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (!selected) return
    if (!acceptedTypes.includes(selected.type)) {
      toast.error("Format non supporté — PDF, JPG, PNG ou DOCX uniquement")
      return
    }
    if (selected.size > maxSize) {
      toast.error("Fichier trop volumineux — 10MB maximum")
      return
    }
    setFile(selected)
  }

  const handleSubmit = async () => {
    if (!name.trim() || !type) {
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
      console.error("[new-document-page] insertError:", insertError)
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
        console.error("[new-document-page] uploadError:", uploadError)
        toast.error("Document créé mais erreur lors de l'upload du fichier", {
          description: uploadError.message,
        })
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

    haptics.success()
    router.push(`/projects/${projectId}?created=${doc}`)
    router.refresh()
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="shrink-0 border-b px-4 py-3 flex items-center gap-3 bg-popover">
        <Button
          variant="ghost"
          size="icon"
          className="h-11 w-11 shrink-0"
          onClick={() => router.back()}
          disabled={loading}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">Nouveau document</p>
          <p className="text-xs text-muted-foreground truncate">{projectName}</p>
        </div>
      </div>

      {/* Formulaire */}
      <div className="flex-1 overflow-y-auto overscroll-contain">
        <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="doc-name">Nom du document</Label>
            <Input
              id="doc-name"
              placeholder="Ex: Plan RDC - Version 2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label>Type de document</Label>
            <Select onValueChange={setType} value={type}>
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
                Joindre un fichier — PDF, JPG, PNG, DOCX (10MB max)
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.docx"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
      </div>

      {/* Footer fixe */}
      <div className="shrink-0 border-t px-4 py-4 space-y-2 bg-popover">
        <Button className="w-full" onClick={handleSubmit} loading={loading} disabled={loading}>
          {loading ? "Création..." : "Créer le document"}
        </Button>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => router.back()}
          disabled={loading}
        >
          Annuler
        </Button>
      </div>
    </div>
  )
}
