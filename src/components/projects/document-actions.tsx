"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { MoreHorizontal, Link, Send, Trash2, RotateCcw } from "lucide-react"
import { toast } from "sonner"

type Document = {
  id: string
  name: string
  type: string
  status: string
  version: number
  validation_token: string
  project_id: string
}

export function DocumentActions({ doc }: { doc: Document }) {
  const [loading, setLoading] = useState(false)
  const [sendOpen, setSendOpen] = useState(false)
  const [message, setMessage] = useState("")
  const router = useRouter()
  const supabase = createClient()

  const handleCopyLink = () => {
    const validationUrl = `${window.location.origin}/validate/${doc.validation_token}`
    navigator.clipboard.writeText(validationUrl)
    toast.success("Lien copié dans le presse-papiers")
  }

  const handleSend = async () => {
    setLoading(true)

    const res = await fetch("/api/send-validation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ documentId: doc.id, message: message || null }),
    })

    const data = await res.json()

    if (res.ok) {
      toast.success("Email de validation envoyé au client ✅")
      setSendOpen(false)
      setMessage("")
      router.refresh()
    } else if (data.error === "Pas d'email client") {
      toast.error("Ajoutez l'email du client dans le projet")
    } else {
      toast.error("Erreur lors de l'envoi")
    }

    setLoading(false)
  }

  const handleProposeV2 = async () => {
    setLoading(true)
    const newToken = crypto.randomUUID()
    await supabase
      .from("documents")
      .update({
        status: "draft",
        version: (doc.version ?? 1) + 1,
        file_url: null,
        file_name: null,
        file_type: null,
        file_size: null,
        validation_token: newToken,
      })
      .eq("id", doc.id)
    router.refresh()
    setLoading(false)
    toast.success(`Version ${(doc.version ?? 1) + 1} créée — uploadez le nouveau fichier`)
  }

  const handleDelete = async () => {
    await supabase.from("documents").delete().eq("id", doc.id)
    router.refresh()
    toast.success("Document supprimé")
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleCopyLink}>
            <Link className="mr-2 h-4 w-4" />
            Copier le lien client
          </DropdownMenuItem>
          {doc.status === "draft" && (
            <DropdownMenuItem onClick={() => setSendOpen(true)}>
              <Send className="mr-2 h-4 w-4" />
              Envoyer au client
            </DropdownMenuItem>
          )}
          {doc.status === "rejected" && (
            <DropdownMenuItem onClick={handleProposeV2} disabled={loading}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Proposer une V{(doc.version ?? 1) + 1}
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleDelete}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Supprimer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog
        open={sendOpen}
        onOpenChange={(v) => {
          setSendOpen(v)
          if (!v) setMessage("")
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Envoyer au client</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm text-muted-foreground">
              Le client recevra un email avec un lien sécurisé pour consulter et valider le
              document.
            </p>
            <Textarea
              placeholder="Ajouter un mot pour le client (optionnel)..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSendOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSend} disabled={loading}>
              <Send className="h-4 w-4 mr-2" />
              {loading ? "Envoi..." : "Envoyer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
